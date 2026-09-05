import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import PosView from './components/PosView';
import TransactionsView from './components/TransactionsView';
import MenuView from './components/MenuView';
import DatabaseView from './components/DatabaseView';
import { 
  checkSupabaseConnection, 
  fetchProducts, 
  fetchTransactions, 
  addTransaction, 
  removeTransaction 
} from './lib/supabase';
import { initialProducts, initialTransactions } from './lib/initialData';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [products, setProducts] = useState(initialProducts);
  const [transactions, setTransactions] = useState(initialTransactions);
  const [dbStatus, setDbStatus] = useState({ connected: false, checking: true });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Listen for PWA Install Prompt (Chrome Android / Desktop)
  useEffect(() => {
    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        showToast('Aplikasi Justeathere berhasil di-install ke HP!', 'success');
      }
    } else {
      alert(
        'Cara Install ke HP Android:\n\n' +
        '1. Buka website https://justeathere-app.vercel.app di Google Chrome HP Anda.\n' +
        '2. Tekan menu titik tiga (⋮) di pojok kanan atas Chrome.\n' +
        '3. Pilih "Install aplikasi" (atau "Tambahkan ke Layar Utama").\n' +
        '4. Ikon Justeathere akan otomatis muncul di layar utama HP Anda dan bisa dibuka langsung tanpa membuka browser lagi!'
      );
    }
  };

  // Load data and test Supabase connection
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      // 1. Check Supabase
      const conn = await checkSupabaseConnection();
      setDbStatus(conn);

      // 2. Load Products & Transactions
      const [pRes, tRes] = await Promise.all([
        fetchProducts(),
        fetchTransactions()
      ]);

      if (pRes.data && pRes.data.length > 0) {
        setProducts(pRes.data);
      }
      if (tRes.data && tRes.data.length > 0) {
        setTransactions(tRes.data);
      }

      // Silent connection without technical toast
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handler for adding a new transaction from POS
  const handleAddTransaction = async (newTx) => {
    const saved = await addTransaction(newTx);
    setTransactions((prev) => [saved, ...prev.filter(t => t.code !== saved.code)]);
    showToast(`Transaksi ${saved.code} berhasil disimpan!`, 'success');
    return saved;
  };

  // Handler for deleting a transaction
  const handleDeleteTransaction = async (idOrCode) => {
    await removeTransaction(idOrCode);
    setTransactions((prev) => prev.filter(t => t.id !== idOrCode && t.code !== idOrCode));
    showToast('Transaksi berhasil dihapus', 'info');
  };

  // Handler for updating product catalog
  const handleUpdateProducts = (updatedProducts) => {
    setProducts(updatedProducts);
    localStorage.setItem('justeathere_products', JSON.stringify(updatedProducts));
    showToast('Katalog menu berhasil diperbarui', 'success');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-espresso-900 flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 sm:bottom-auto sm:top-5 sm:right-5 sm:left-auto sm:translate-x-0 z-50 animate-fade-in pointer-events-none">
          <div className={`px-4 py-2.5 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border ${
            toast.type === 'info' 
              ? 'bg-espresso-950 text-cream-50 border-espresso-800' 
              : 'bg-espresso-900 text-cream-50 border-bischeese-500/50 shadow-bischeese-900/15'
          }`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
        
        onInstallApp={handleInstallApp}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
          
          refreshing={refreshing}
          onRefresh={loadData}
          onInstallApp={handleInstallApp}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              transactions={transactions}
              products={products}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'pos' && (
            <PosView
              products={products}
              transactions={transactions}
              onAddTransaction={handleAddTransaction}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsView
              transactions={transactions}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'menu' && (
            <MenuView
              products={products}
              transactions={transactions}
              onUpdateProducts={handleUpdateProducts}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseView
              
              onRefreshDb={loadData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
