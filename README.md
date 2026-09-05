# Justeathere - Dashboard & Kasir Penjualan (POS)

Aplikasi web modern fullstack untuk manajemen penjualan, kasir (Point of Sales), analitik pendapatan, dan katalog menu bisnis kuliner **Justeathere**.

Aplikasi ini dibangun menggunakan **React + Vite + Tailwind CSS**, terintegrasi langsung dengan database cloud **Supabase PostgreSQL**, serta di-deploy secara live di **Vercel**.

---

## 🌟 Fitur Utama

1. **Dashboard & Analitik Bisnis**:
   - 4 Kartu KPI real-time: Total Omset, Produk Terjual (pcs), Total Transaksi, Rata-rata Order (AOV).
   - Grafik Tren Penjualan Bulanan (Interactive Bar Chart).
   - Grafik Proporsi Produk Terjual (Donut Chart).
   - Peringkat Kanal Penjualan (Bazar Pagi, Reseller Mitra, Pesantren, PO Umum).
   - Transaksi Terbaru.
2. **Kasir / Input Penjualan Cepat (POS)**:
   - Pemilihan produk instan dengan auto-price.
   - Pilihan kanal/pelanggan cepat (Bazar, Reseller, Pesantren, PO) atau manual.
   - Perhitungan total otomatis real-time dengan opsi custom harga reseller/diskon.
   - Efek perayaan (*confetti*) saat transaksi berhasil dicatat.
3. **Riwayat & Manajemen Transaksi**:
   - Menampilkan 64+ data transaksi historis dari Google Spreadsheet.
   - Pencarian real-time (kode `TX-...`, nama pelanggan, produk).
   - Filter berdasarkan jenis produk dan kanal penjualan.
   - Pengurutan data (terbaru / terlama).
   - Pagination responsif (15 baris per halaman).
   - **Ekspor ke Excel / CSV** dengan 1-klik.
   - Hapus transaksi dengan modal konfirmasi aman.
4. **Katalog & Manajemen Menu**:
   - Menampilkan menu aktif (Dessert Box, Cheesecake, Cheesecake 12cm, Cheesecake Custom).
   - Ubah harga standar secara langsung.
   - Tambah menu baru ke katalog.
5. **Supabase Database Cloud**:
   - Status koneksi real-time.
   - Panduan dan skrip SQL 1-klik untuk inisialisasi tabel di Supabase.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Chart.js, Canvas Confetti
- **Backend / Database**: Supabase PostgreSQL (PostgREST API)
- **Deployment & Hosting**: Vercel
- **Version Control**: GitHub (`julibachtiyar-oss/justeathere-app`)

---

## 🚀 Menjalankan Secara Lokal

```bash
# 1. Masuk ke direktori
cd justeathere-app

# 2. Install dependensi
npm install

# 3. Konfigurasi Environment (.env)
VITE_SUPABASE_URL=https://bqjnxqpimpnqabkofxny.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_...

# 4. Jalankan server lokal
npm run dev
```

---

## 🗄️ Skema Database Supabase

Jalankan skrip yang tersedia di file `supabase_schema.sql` pada [Supabase SQL Editor](https://supabase.com/dashboard/project/bqjnxqpimpnqabkofxny/sql/new) untuk membuat tabel `products` dan `transactions` beserta 64 data awal.
