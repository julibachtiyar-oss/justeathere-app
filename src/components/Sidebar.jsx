import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  UtensilsCrossed, 
  Database,
  ChevronRight,
  Sparkles,
  Smartphone,
  Heart
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, dbStatus, onInstallApp }) {
  const navItems = [
    { id: 'dashboard', label: 'Ringkasan & Analitik', icon: LayoutDashboard, badge: null },
    { id: 'pos', label: 'Kasir & Input Pesanan', icon: ShoppingCart, badge: 'POS' },
    { id: 'transactions', label: 'Riwayat Penjualan', icon: Receipt, badge: '64+' },
    { id: 'menu', label: 'Katalog Menu Bischeese', icon: UtensilsCrossed, badge: '7 Rasa' },
    { id: 'database', label: 'Supabase Database', icon: Database, badge: dbStatus.connected ? 'Online' : 'Setup' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-espresso-950/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-[#FBF8F4] border-r border-[#EAE2D5] 
        flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-[#EAE2D5] bg-[#FAF5EE]">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#B47640] to-[#5C381B] flex items-center justify-center shadow-md shadow-bischeese-900/15 text-white font-serif text-2xl font-bold tracking-wider">
              B
            </div>
            <div>
              <h1 className="font-serif font-black text-xl text-[#3D2B1F] tracking-wide leading-none">
                BISCHEESE
              </h1>
              <p className="text-[11px] text-[#7D6B5D] font-medium tracking-wider uppercase mt-1 flex items-center gap-1">
                <span>By Justeathere</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
              </p>
            </div>
          </div>
          <p className="text-[11px] text-[#8C7A6B] italic font-serif mt-3 border-t border-[#EAE2D5]/70 pt-2 flex items-center gap-1">
            <Heart size={11} className="text-[#B47640] fill-[#B47640]" />
            <span>Soft, creamy, layered with love</span>
          </p>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-4 py-5 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-[#9B8B7B]">
            Navigasi Utama
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200
                  ${isActive 
                    ? 'bg-[#EFE6DA] text-[#3D2B1F] font-bold shadow-sm border border-[#DECDB9]' 
                    : 'text-[#645447] hover:bg-[#F3ECE0] hover:text-[#2B1E16]'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-[#B47640] text-white' 
                      : 'text-[#8C7A6B] group-hover:text-[#3D2B1F]'
                  }`}>
                    <Icon size={17} />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wide ${
                    item.badge === 'Online' 
                      ? 'bg-emerald-100 text-emerald-800' 
                      : item.badge === 'Setup'
                      ? 'bg-amber-100 text-amber-800'
                      : isActive 
                      ? 'bg-[#E2D4C1] text-[#4A3525]' 
                      : 'bg-[#EAE2D5] text-[#7D6B5D]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Database Status Card in Sidebar */}
        <div className="mx-4 mb-3 p-4 rounded-2xl bg-[#3D2B1F] text-white shadow-lg shadow-black/5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-semibold text-[#E8DEC8]">
                {dbStatus.connected ? 'Supabase PostgreSQL' : 'Database Setup'}
              </span>
            </div>
            <Sparkles size={13} className="text-[#C69C6D]" />
          </div>
          <p className="text-[11px] text-[#CDBEAF] mb-3 leading-relaxed">
            {dbStatus.connected 
              ? 'Tersinkronisasi otomatis dengan cloud database.'
              : 'Tabel database siap digunakan dengan skrip SQL.'}
          </p>
          <button 
            onClick={() => setActiveTab('database')}
            className="w-full text-center py-1.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 text-[11px] font-bold text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{dbStatus.connected ? 'Status Database' : 'Buka Panduan SQL'}</span>
            <ChevronRight size={13} />
          </button>
        </div>

        {/* Install to Phone button */}
        <div className="px-4 mb-3">
          <button
            onClick={onInstallApp}
            className="w-full py-2.5 px-3 rounded-xl bg-[#EAE2D5] hover:bg-[#DECDB9] text-[#3D2B1F] text-xs font-bold transition-all flex items-center justify-center gap-2 border border-[#DECDB9]"
          >
            <Smartphone size={15} className="text-[#B47640]" />
            <span>Install Aplikasi di HP</span>
          </button>
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-[#EAE2D5] bg-[#FAF5EE] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#EAE2D5] text-[#4A3525] flex items-center justify-center font-bold text-xs font-serif">
              JB
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-[#3D2B1F]">Juli Bachtiyar</div>
              <div className="text-[10px] text-[#8C7A6B]">Admin & Owner</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
