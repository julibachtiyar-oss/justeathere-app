import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Receipt, 
  UtensilsCrossed, 
  Database,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, mobileOpen, setMobileOpen, dbStatus }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard & Analitik', icon: LayoutDashboard, badge: null },
    { id: 'pos', label: 'Kasir & Input Penjualan', icon: ShoppingCart, badge: 'POS' },
    { id: 'transactions', label: 'Riwayat Transaksi', icon: Receipt, badge: '64+' },
    { id: 'menu', label: 'Kelola Menu Produk', icon: UtensilsCrossed, badge: null },
    { id: 'database', label: 'Supabase Database', icon: Database, badge: dbStatus.connected ? 'Online' : 'Setup' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen w-72 bg-white border-r border-slate-200 
        flex flex-col transition-transform duration-300 ease-in-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-rose-400 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white font-black text-xl tracking-wider">
              J
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-slate-900 leading-tight font-['Outfit']">
                Justeathere
              </h1>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-1">
                <span>Dessert & Bakery</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              </p>
            </div>
          </div>
        </div>

        {/* Navigation List */}
        <div className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
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
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-brand-600 text-white' : 'text-slate-500 group-hover:text-slate-700'}`}>
                    <Icon size={18} />
                  </div>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                    item.badge === 'Online' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : item.badge === 'Setup'
                      ? 'bg-amber-100 text-amber-700'
                      : isActive 
                      ? 'bg-brand-200 text-brand-800' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Database Status Card in Sidebar */}
        <div className="p-4 mx-4 mb-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl shadow-slate-950/10">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
              <span className="text-xs font-semibold text-slate-300">
                {dbStatus.connected ? 'Supabase Live' : 'Database Setup'}
              </span>
            </div>
            <Sparkles size={14} className="text-amber-300" />
          </div>
          <p className="text-[12px] text-slate-300 mb-3 leading-relaxed">
            {dbStatus.connected 
              ? 'Tersinkronisasi otomatis dengan PostgreSQL Supabase.'
              : 'Tabel database siap dibuat dengan 1 kali klik skrip SQL.'}
          </p>
          <button 
            onClick={() => setActiveTab('database')}
            className="w-full text-center py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-colors flex items-center justify-center gap-1.5"
          >
            <span>{dbStatus.connected ? 'Cek Status Cloud' : 'Buka Skrip SQL'}</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-sm">
              JB
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-800">Juli Bachtiyar</div>
              <div className="text-[11px] text-slate-400">julibachtiyar-oss</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
