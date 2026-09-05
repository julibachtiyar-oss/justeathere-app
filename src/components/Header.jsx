import React from 'react';
import { Menu, PlusCircle, RefreshCw, Database, CheckCircle2, AlertCircle, Smartphone } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setMobileOpen, 
  setActiveTab, 
  dbStatus, 
  refreshing, 
  onRefresh,
  onInstallApp
}) {
  const titles = {
    dashboard: { title: 'Dashboard & Analitik Penjualan', subtitle: 'Pantau omset, pertumbuhan, dan performa produk Justeathere' },
    pos: { title: 'Kasir & Input Penjualan (POS)', subtitle: 'Catat pesanan pelanggan baru dengan cepat dan akurat' },
    transactions: { title: 'Riwayat Transaksi Lengkap', subtitle: 'Kelola, cari, dan ekspor 64+ data transaksi penjualan' },
    menu: { title: 'Katalog & Harga Menu', subtitle: 'Atur daftar produk dan harga standar penjualan' },
    database: { title: 'Integrasi Supabase Database', subtitle: 'Status tabel cloud PostgreSQL dan sinkronisasi real-time' }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-4 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 font-['Outfit'] tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-slate-500 hidden sm:block font-medium">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase Status Pill */}
        <button 
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            dbStatus.connected 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
          title={dbStatus.connected ? 'Supabase Connected' : 'Klik untuk melihat panduan setup Supabase'}
        >
          {dbStatus.connected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden md:inline">Supabase Cloud Aktif</span>
              <span className="md:hidden">Supabase</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <span className="hidden md:inline">Setup Database</span>
              <span className="md:hidden">Setup</span>
            </>
          )}
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
          title="Segarkan Data"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin text-brand-600' : ''} />
        </button>

        {/* Install to Android / Phone button */}
        <button
          onClick={onInstallApp}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
          title="Install Aplikasi di HP Android"
        >
          <Smartphone size={15} />
          <span className="hidden md:inline">Install di HP</span>
        </button>

        {/* Quick Catat button */}
        {activeTab !== 'pos' && (
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-2 bg-gradient-to-r from-brand-600 to-rose-500 hover:from-brand-700 hover:to-rose-600 text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-brand-500/20 transition-all active:scale-95"
          >
            <PlusCircle size={16} />
            <span className="hidden sm:inline">Input Penjualan</span>
            <span className="sm:hidden">Catat</span>
          </button>
        )}
      </div>
    </header>
  );
}
