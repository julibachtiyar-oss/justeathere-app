import React from 'react';
import { Menu, PlusCircle, RefreshCw, Smartphone } from 'lucide-react';

export default function Header({ 
  activeTab, 
  setMobileOpen, 
  setActiveTab, 
  refreshing, 
  onRefresh,
  onInstallApp
}) {
  const titles = {
    dashboard: { 
      title: 'Ringkasan & Analitik Bisnis', 
      subtitle: 'Pantau omset, volume penjualan, dan performa rasa Bischeese' 
    },
    pos: { 
      title: 'Kasir & Catat Pesanan', 
      subtitle: 'Input transaksi baru dengan pemilihan rasa Bischeese instan' 
    },
    transactions: { 
      title: 'Riwayat Transaksi Penjualan', 
      subtitle: 'Kelola, cari data pelanggan, dan unduh laporan ke Excel / CSV' 
    },
    menu: { 
      title: 'Katalog Varian & Harga Bischeese', 
      subtitle: 'Daftar 7 rasa utama dan ukuran spesial Bischeese' 
    }
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EAE2D5] px-4 sm:px-8 py-3.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 -ml-2 rounded-xl text-[#645447] hover:bg-[#EFE8DE] lg:hidden"
          aria-label="Buka Menu"
        >
          <Menu size={22} />
        </button>
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#3D2B1F] tracking-tight">
            {current.title}
          </h2>
          <p className="text-xs text-[#7D6B5D] hidden sm:block font-medium">
            {current.subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* Refresh button */}
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 rounded-xl border border-[#EAE2D5] bg-white text-[#645447] hover:bg-[#F5EFE6] transition-colors disabled:opacity-50"
          title="Segarkan Data Penjualan"
        >
          <RefreshCw size={16} className={refreshing ? 'animate-spin text-[#B47640]' : ''} />
        </button>

        {/* Install to Phone button */}
        <button
          onClick={onInstallApp}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DECDB9] bg-[#EFE6DA] hover:bg-[#E4D8C7] text-[#3D2B1F] font-semibold text-xs transition-all active:scale-95"
          title="Install Aplikasi di HP Android"
        >
          <Smartphone size={14} className="text-[#B47640]" />
          <span className="hidden sm:inline">Install di HP</span>
        </button>

        {/* Quick Catat button */}
        {activeTab !== 'pos' && (
          <button
            onClick={() => setActiveTab('pos')}
            className="flex items-center gap-1.5 bg-[#B47640] hover:bg-[#9A5F2D] text-white px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold shadow-sm transition-all active:scale-95"
          >
            <PlusCircle size={15} />
            <span className="hidden sm:inline">Catat Pesanan</span>
            <span className="sm:hidden">Catat</span>
          </button>
        )}
      </div>
    </header>
  );
}
