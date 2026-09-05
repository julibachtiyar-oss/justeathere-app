-- Skrip Pembuatan Tabel & Migrasi Data Justeathere ke Supabase

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

-- Izinkan Read & Write publik untuk mempermudah aplikasi
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

-- 5. Masukkan 64 Data Transaksi Historis dari Spreadsheet
INSERT INTO public.transactions (code, transaction_date, customer_name, product_name, variant, quantity, unit_price, total_price) VALUES
('TX-001', '2025-11-07', 'Umum (Po 1)', 'Dessert Box', '-', 9, 17000, 153000),
('TX-002', '2025-11-14', 'Umum (Po 2)', 'Dessert Box', '-', 8, 17000, 136000),
('TX-003', '2025-11-21', 'Umum (Po 3)', 'Dessert Box', '-', 16, 17000, 272000),
('TX-004', '2025-11-29', 'Umum (Po 4)', 'Dessert Box', '-', 5, 17000, 85000),
('TX-005', '2025-12-07', 'Pesantren', 'Dessert Box', '-', 42, 17000, 714000),
('TX-006', '2025-12-14', 'Pesantren', 'Dessert Box', '-', 116, 17000, 1972000),
('TX-007', '2025-12-28', 'Umum (Po 5)', 'Dessert Box', '-', 13, 17000, 221000),
('TX-008', '2026-01-01', 'Umum (Po 6)', 'Dessert Box', '-', 3, 17000, 51000),
('TX-009', '2026-01-30', 'Umum (Po 7)', 'Dessert Box', '-', 9, 17000, 153000),
('TX-010', '2026-02-04', 'Umum (Po 8)', 'Dessert Box', '-', 10, 17000, 170000),
('TX-011', '2026-02-10', 'Umum (Po 9)', 'Dessert Box', '-', 3, 17000, 51000),
('TX-012', '2026-03-01', 'Umum (Jualan Puasa)', 'Dessert Box', '-', 69, 17000, 1173000),
('TX-013', '2026-03-01', 'Lala', 'Dessert Box', '-', 88, 14000, 1232000),
('TX-014', '2026-03-31', 'Pesantren', 'Dessert Box', '-', 20, 17000, 340000),
('TX-015', '2026-04-09', 'Umum (Po 10)', 'Dessert Box', '-', 3, 17000, 54000),
('TX-016', '2026-04-13', 'Reseller Dahlia', 'Dessert Box', '-', 5, 16000, 80000),
('TX-017', '2026-04-20', 'Pesantren', 'Dessert Box', '-', 86, 17000, 1548000),
('TX-018', '2026-04-20', 'Reseller Dahlia', 'Dessert Box', '-', 4, 16000, 64000),
('TX-019', '2026-04-20', 'Lala', 'Dessert Box', '-', 9, 18000, 162000),
('TX-020', '2026-05-03', 'Umum 11 (Open Po Cheesecake 1)', 'Cheesecake', '-', 1, 20000, 20000),
('TX-021', '2026-05-08', 'Reseller Ka Citra Pt 1', 'Dessert Box', '-', 7, 16000, 112000),
('TX-022', '2026-05-08', 'Reseller Ka Citra Pt 1', 'Cheesecake', '-', 21, 18000, 378000),
('TX-023', '2026-05-10', 'Umum (Open Po Cheesecake 2)', 'Cheesecake', '-', 7, 20000, 140000),
('TX-024', '2026-05-10', 'Umum (Open Po Dessert Box)', 'Dessert Box', '-', 2, 18000, 36000),
('TX-025', '2026-05-16', 'Umum (Open Po)', 'Cheesecake', '-', 2, 20000, 40000),
('TX-026', '2026-05-16', 'Umum (Open Po)', 'Dessert Box', '-', 3, 18000, 54000),
('TX-027', '2026-05-18', 'Reseller Ka Citra Pt 2', 'Cheesecake', '-', 22, 18000, 396000),
('TX-028', '2026-05-18', 'Reseller Ka Citra Pt 2', 'Dessert Box', '-', 17, 16000, 272000),
('TX-029', '2026-05-18', 'Umum (Open Po)', 'Dessert Box', '-', 3, 18000, 54000),
('TX-030', '2026-05-18', 'Umum (Open Po)', 'Cheesecake', '-', 8, 20000, 160000),
('TX-031', '2026-05-19', 'Pesantren', 'Dessert Box', '-', 35, 17000, 630000),
('TX-032', '2026-05-19', 'Pesantren', 'Cheesecake', '-', 17, 20000, 340000),
('TX-033', '2026-05-19', 'Umum (Open Po)', 'Cheesecake', '-', 5, 20000, 100000),
('TX-034', '2026-05-20', 'Po Siti', 'Dessert Box', '-', 5, 18000, 90000),
('TX-035', '2026-05-20', 'Po Siti', 'Cheesecake', '-', 7, 20000, 140000),
('TX-036', '2026-05-22', 'Reseller Ka Citra Pt 3', 'Dessert Box', '-', 7, 17000, 119000),
('TX-037', '2026-05-22', 'Reseller Ka Citra Pt 3', 'Cheesecake', '-', 13, 18000, 234000),
('TX-038', '2026-05-23', 'Umum (Open Po)', 'Dessert Box', '-', 5, 18000, 90000),
('TX-039', '2026-05-23', 'Umum (Open Po)', 'Cheesecake', '-', 2, 20000, 40000),
('TX-040', '2026-05-25', 'Po Reynata', 'Dessert Box', '-', 2, 18000, 36000),
('TX-041', '2026-05-29', 'Po ka Ranti', 'Dessert Box', '-', 3, 18000, 56000),
('TX-042', '2026-05-29', 'Po ka Ranti', 'Cheesecake', '-', 3, 20000, 60000),
('TX-043', '2026-05-30', 'Reseller ka Citra', 'Dessert Box', '-', 9, 17333, 156000),
('TX-044', '2026-05-30', 'Po Anjeli', 'Dessert Box', '-', 2, 19000, 38000),
('TX-045', '2026-05-31', 'Po ka Ranti', 'Dessert Box', '-', 3, 18667, 56000),
('TX-046', '2026-06-01', 'Po Reynata', 'Cheesecake 12cm', '-', 1, 40000, 40000),
('TX-047', '2026-06-01', 'Po ka Nur', 'Cheesecake Custom', '-', 1, 40000, 40000),
('TX-048', '2026-06-01', 'Po', 'Dessert Box', '-', 3, 18667, 56000),
('TX-049', '2026-06-06', 'Po Anjeli', 'Dessert Box', '-', 3, 16667, 50000),
('TX-050', '2026-06-10', 'Po', 'Cheesecake', '-', 7, 20000, 140000),
('TX-051', '2026-06-13', 'Po ka Citra', 'Dessert Box', '-', 10, 17300, 173000),
('TX-052', '2026-06-13', 'Po ka Citra', 'Cheesecake', '-', 14, 18000, 252000),
('TX-053', '2026-06-20', 'Po Pesantren', 'Cheesecake', '-', 12, 20000, 240000),
('TX-054', '2026-06-20', 'Po Pesantren', 'Dessert Box', '-', 21, 17000, 357000),
('TX-055', '2026-06-21', 'Bazar Pagi', 'Cheesecake', '-', 11, 20000, 220000),
('TX-056', '2026-06-21', 'Bazar Pagi', 'Dessert Box', '-', 13, 18000, 234000),
('TX-057', '2026-06-28', 'Bazar Pagi', 'Cheesecake', '-', 16, 20000, 320000),
('TX-058', '2026-06-28', 'Bazar Pagi', 'Dessert Box', '-', 8, 18000, 144000),
('TX-059', '2026-07-05', 'Bazar Pagi', 'Cheesecake', '-', 16, 20000, 320000),
('TX-60', '2026-07-05', 'Bazar Pagi', 'Dessert Box', '-', 7, 18000, 126000),
('TX-061', '2026-07-16', 'Po', 'Dessert Box', '-', 13, 18769, 244000),
('TX-062', '2026-07-16', 'Po', 'Cheesecake', '-', 3, 20000, 60000),
('TX-063', '2026-07-19', 'Bazar Pagi', 'Dessert Box', '-', 13, 17538, 228000),
('TX-064', '2026-07-19', 'Bazar Pagi', 'Cheesecake', '-', 14, 20000, 280000)
ON CONFLICT (code) DO NOTHING;
