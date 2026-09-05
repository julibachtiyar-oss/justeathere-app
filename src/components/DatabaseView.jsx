import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  ExternalLink, 
  RefreshCw,
  Check
} from 'lucide-react';

export default function DatabaseView({ dbStatus, onRefreshDb }) {
  const [copied, setCopied] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://bqjnxqpimpnqabkofxny.supabase.co';
  const sqlEditorUrl = 'https://supabase.com/dashboard/project/bqjnxqpimpnqabkofxny/sql/new';

  const sqlCode = `-- Skrip Pembuatan Tabel & Migrasi Data Bischeese ke Supabase

-- 1. Buat Tabel Produk (products)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT DEFAULT 'Bischeese',
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
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Connection Status Card */}
      <div className="bg-white p-6 rounded-2xl border border-[#EAE2D5] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              dbStatus.connected ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              <Database size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-lg text-espresso-900">
                  Supabase Cloud PostgreSQL
                </h3>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  dbStatus.connected 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {dbStatus.connected ? '● Terhubung Live Cloud' : 'Perlu Setup Tabel'}
                </span>
              </div>
              <p className="text-xs text-espresso-600 font-mono mt-0.5">
                {supabaseUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshDb}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#EAE2D5] text-xs font-semibold text-espresso-800 hover:bg-cream-50 transition-colors"
            >
              <RefreshCw size={14} />
              <span>Tes Koneksi</span>
            </button>
            <a
              href={sqlEditorUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-espresso-900 hover:bg-espresso-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              <span>Buka SQL Editor</span>
              <ExternalLink size={14} />
            </a>
          </div>
        </div>

        {/* Status Explanation */}
        <div className={`p-4 rounded-xl text-xs font-medium ${
          dbStatus.connected 
            ? 'bg-[#F4F9F4] text-[#1B5E20] border border-[#C8E6C9]' 
            : 'bg-amber-50 text-amber-800 border border-amber-200'
        }`}>
          {dbStatus.connected ? (
            <div className="flex items-center gap-2.5">
              <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
              <span>Tabel <code>transactions</code> dan <code>products</code> sudah aktif dan tersinkronisasi dua arah secara real-time!</span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} className="text-amber-600" />
                <span>Tabel database belum dibuat di dashboard Supabase Anda.</span>
              </div>
              <p className="text-amber-700">
                Aplikasi saat ini berjalan menggunakan data lokal cadangan. Untuk mengaktifkan sinkronisasi cloud permanen, silakan jalankan skrip SQL di bawah ini pada Supabase SQL Editor.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SQL Setup Steps */}
      <div className="bg-white p-6 rounded-2xl border border-[#EAE2D5] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-serif font-bold text-base text-espresso-900">
              Skrip Struktur Tabel PostgreSQL
            </h4>
            <p className="text-xs text-espresso-600">
              Skrip DDL dan Row Level Security yang digunakan pada database produksi
            </p>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cream-100 hover:bg-cream-200 text-bischeese-800 font-bold text-xs transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Tersalin!' : 'Salin Skrip SQL'}</span>
          </button>
        </div>

        {/* SQL Code Preview */}
        <div className="relative rounded-xl overflow-hidden bg-espresso-950 text-cream-100 font-mono text-[11px] p-4 max-h-72 overflow-y-auto border border-espresso-800">
          <pre>{sqlCode}</pre>
        </div>
      </div>
    </div>
  );
}
