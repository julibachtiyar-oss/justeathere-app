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

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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

      if (conn.connected) {
        showToast('Tersambung ke Supabase Cloud Database', 'success');
      }
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div className={`px-4 py-2.5 rounded-xl shadow-lg text-xs font-bold text-white flex items-center gap-2 ${
            toast.type === 'info' ? 'bg-slate-900' : 'bg-brand-600'
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
        dbStatus={dbStatus}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
          dbStatus={dbStatus}
          refreshing={refreshing}
          onRefresh={loadData}
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
              dbStatus={dbStatus}
              onRefreshDb={loadData}
            />
          )}
        </main>
      </div>
    </div>
  );
}
