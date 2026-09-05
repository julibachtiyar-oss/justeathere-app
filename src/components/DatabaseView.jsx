import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  Sparkles, 
  RefreshCw,
  Table,
  Check
} from 'lucide-react';
import { checkSupabaseConnection, seedInitialDataToSupabase } from '../lib/supabase';

export default function DatabaseView({ dbStatus, onRefreshDb }) {
  const [copied, setCopied] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState(null);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqjnxqpimpnqabkofxny.supabase.co';
  const sqlEditorUrl = 'https://supabase.com/dashboard/project/bqjnxqpimpnqabkofxny/sql/new';

  const sqlCode = `-- Skrip Pembuatan Tabel & Migrasi Data Justeathere ke Supabase

-- 1. Buat Tabel Produk (products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'Dessert',
  base_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Buat Tabel Transaksi (transactions)
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  transaction_date DATE NOT NULL,
  customer_name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  variant TEXT DEFAULT '-',
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  total_price NUMERIC NOT NULL DEFAULT 0,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Atur Hak Akses / Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Allow public insert products" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update products" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Allow public delete products" ON public.products FOR DELETE USING (true);

CREATE POLICY "Allow public read transactions" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "Allow public insert transactions" ON public.transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update transactions" ON public.transactions FOR UPDATE USING (true);
CREATE POLICY "Allow public delete transactions" ON public.transactions FOR DELETE USING (true);

-- 4. Masukkan Data Master Produk
INSERT INTO public.products (name, category, base_price) VALUES
('Dessert Box', 'Dessert', 18000),
('Cheesecake', 'Cake', 20000),
('Cheesecake 12cm', 'Cake', 40000),
('Cheesecake Custom', 'Cake', 40000)
ON CONFLICT (name) DO UPDATE SET base_price = EXCLUDED.base_price;
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await seedInitialDataToSupabase();
      setSeedResult(res);
      if (res.success) {
        onRefreshDb();
      }
    } catch (e) {
      setSeedResult({ success: false, error: e.message });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Connection Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              dbStatus.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg text-slate-900 font-['Outfit']">
                  Supabase Cloud PostgreSQL
                </h3>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                  dbStatus.connected 
                    ? 'bg-emerald-100 text-emerald-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {dbStatus.connected ? 'Terhubung Live' : 'Perlu Setup Tabel'}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                {supabaseUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshDb}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <RefreshCw size={14} />
              <span>Tes Koneksi</span>
            </button>
            <a
              href={sqlEditorUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Buka SQL Editor</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Status Explanation */}
        <div className={`p-4 rounded-xl text-xs font-medium ${
          dbStatus.connected 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
            : 'bg-amber-50 text-amber-800 border border-amber-100'
        }`}>
          {dbStatus.connected ? (
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-600" />
              <span>Tabel <code>transactions</code> dan <code>products</code> sudah aktif dan menerima kueri real-time di Supabase!</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} className="text-amber-600" />
                <span>Tabel database belum dibuat di dashboard Supabase Anda.</span>
              </div>
              <p className="text-amber-700">
                Aplikasi saat ini berjalan menggunakan data lokal cadangan. Untuk mengaktifkan sinkronisasi cloud permanen, silakan jalankan skrip SQL di bawah ini pada <strong>Supabase SQL Editor</strong>.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SQL Setup Steps */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-base text-slate-900 font-['Outfit']">
              Panduan 1-Klik Pembuatan Tabel di Supabase
            </h4>
            <p className="text-xs text-slate-500">
              Salin skrip berikut dan jalankan di SQL Editor dashboard Supabase Anda
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold text-xs transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
          </button>
        </div>

        {/* Steps List */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-brand-600">Langkah 1</span>
            <p className="text-slate-600">Buka <strong>Supabase SQL Editor</strong> dengan tombol di atas.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-brand-600">Langkah 2</span>
            <p className="text-slate-600">Klik tombol <strong>"Salin Skrip SQL"</strong> lalu tempelkan (paste) di editor.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="font-bold text-brand-600">Langkah 3</span>
            <p className="text-slate-600">Klik tombol hijau <strong>"RUN"</strong> di Supabase. Tabel langsung jadi!</p>
          </div>
        </div>

        {/* SQL Code Preview */}
        <div className="relative rounded-xl overflow-hidden bg-slate-950 text-slate-200 font-mono text-[11px] p-4 max-h-72 overflow-y-auto border border-slate-800">
          <pre>{sqlCode}</pre>
        </div>
      </div>
    </div>
  );
}
