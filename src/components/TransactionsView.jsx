import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Download, 
  Trash2, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight,
  AlertTriangle,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';

export default function TransactionsView({ transactions, onDeleteTransaction }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('ALL');
  const [selectedChannel, setSelectedChannel] = useState('ALL');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [deleteModalTx, setDeleteModalTx] = useState(null);

  // Format Currency
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Extract unique products
  const productsList = useMemo(() => {
    const set = new Set(transactions.map(t => t.product_name).filter(Boolean));
    return Array.from(set);
  }, [transactions]);

  // Extract channels
  const channelsList = [
    { id: 'ALL', label: 'Semua Kanal Penjualan' },
    { id: 'bazar', label: 'Bazar Pagi' },
    { id: 'pesantren', label: 'Pesantren (Pesanan Besar)' },
    { id: 'reseller', label: 'Reseller Mitra' },
    { id: 'po', label: 'Pre-Order Umum' },
    { id: 'lala', label: 'Mitra Lala' }
  ];

  // Filtering & Sorting
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search term
        const term = searchTerm.toLowerCase();
        const matchesSearch = 
          !searchTerm ||
          (t.code || '').toLowerCase().includes(term) ||
          (t.customer_name || '').toLowerCase().includes(term) ||
          (t.product_name || '').toLowerCase().includes(term) ||
          (t.transaction_date || '').toLowerCase().includes(term);

        if (!matchesSearch) return false;

        // Product filter
        if (selectedProduct !== 'ALL' && t.product_name !== selectedProduct) {
          return false;
        }

        // Channel filter
        if (selectedChannel !== 'ALL') {
          const cust = (t.customer_name || '').toLowerCase();
          if (!cust.includes(selectedChannel)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const dateA = new Date(a.transaction_date || 0).getTime();
        const dateB = new Date(b.transaction_date || 0).getTime();
        return sortOrder === 'DESC' ? dateB - dateA : dateA - dateB;
      });
  }, [transactions, searchTerm, selectedProduct, selectedChannel, sortOrder]);

  // Filter Summary Stats
  const filterStats = useMemo(() => {
    let rev = 0;
    let qty = 0;
    filteredTransactions.forEach(t => {
      rev += Number(t.total_price) || 0;
      qty += Number(t.quantity) || 0;
    });
    return { rev, qty, count: filteredTransactions.length };
  }, [filteredTransactions]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredTransactions.slice(start, start + rowsPerPage);
  }, [filteredTransactions, currentPage, rowsPerPage]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['ID/Kode', 'Tanggal', 'Nama Pelanggan/Kanal', 'Produk', 'Varian', 'Jumlah', 'Harga Satuan', 'Total Penjualan'];
    const rows = filteredTransactions.map(t => [
      t.code || '',
      t.transaction_date || '',
      "",
      "",
      "",
      t.quantity || 0,
      t.unit_price || 0,
      t.total_price || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', BISCHEESE_Laporan_Penjualan_.csv);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDelete = async () => {
    if (!deleteModalTx) return;
    await onDeleteTransaction(deleteModalTx.id || deleteModalTx.code);
    setDeleteModalTx(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D5] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-espresso-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari nomor nota (TX-...), nama pelanggan, atau varian rasa..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE2D5] text-sm text-espresso-900 placeholder:text-espresso-600 focus:outline-none focus:ring-2 focus:ring-bischeese-500/20 focus:border-bischeese-500 bg-cream-50/50"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-bischeese-300 bg-cream-50 hover:bg-cream-100 text-bischeese-800 font-serif font-bold text-xs sm:text-sm shadow-xs transition-colors"
          >
            <FileSpreadsheet size={16} />
            <span>Ekspor ke Excel / CSV</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-[#F5EFE6] text-xs">
          <span className="text-espresso-700 font-semibold flex items-center gap-1 mr-1">
            <Filter size={14} className="text-bischeese-600" /> Saring:
          </span>

          {/* Product Select */}
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-[#EAE2D5] bg-cream-50/70 font-medium text-espresso-800 focus:outline-none focus:border-bischeese-500"
          >
            <option value="ALL">Semua Menu Produk</option>
            {productsList.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Channel Select */}
          <select
            value={selectedChannel}
            onChange={(e) => {
              setSelectedChannel(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-xl border border-[#EAE2D5] bg-cream-50/70 font-medium text-espresso-800 focus:outline-none focus:border-bischeese-500"
          >
            {channelsList.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.label}</option>
            ))}
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EAE2D5] bg-cream-50 hover:bg-cream-100 font-medium text-espresso-800 transition-colors ml-auto"
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'DESC' ? 'Terbaru Dahulu' : 'Terlama Dahulu'}</span>
          </button>
        </div>

        {/* Dynamic Summary Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-espresso-700 bg-cream-100/60 p-3 rounded-xl border border-cream-200/80">
          <span>Menampilkan: <strong className="text-espresso-900 font-serif">{filterStats.count}</strong> transaksi</span>
          <span className="text-cream-300">|</span>
          <span>Total Terjual: <strong className="text-espresso-900 font-serif">{filterStats.qty}</strong> pcs</span>
          <span className="text-cream-300">|</span>
          <span>Total Omset Filter: <strong className="text-bischeese-700 font-serif font-bold text-sm">{formatIDR(filterStats.rev)}</strong></span>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-[#EAE2D5] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7F2] border-b border-[#EAE2D5] text-[11px] font-serif font-bold text-espresso-800 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Kode Nota</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Pelanggan / Kanal</th>
                <th className="py-3.5 px-4">Menu Varian</th>
                <th className="py-3.5 px-4 text-right">Jumlah</th>
                <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5EFE6]">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-espresso-600 font-medium">
                    Tidak ada riwayat transaksi yang cocok dengan filter atau pencarian Anda.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((t) => (
                  <tr key={t.id || t.code} className="hover:bg-[#FAF7F2]/80 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-bischeese-700 whitespace-nowrap">
                      {t.code}
                    </td>
                    <td className="py-3.5 px-4 text-espresso-700 whitespace-nowrap">
                      {t.transaction_date}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-espresso-900">
                      {t.customer_name}
                    </td>
                    <td className="py-3.5 px-4 text-espresso-800">
                      <span className="px-2.5 py-1 rounded-lg bg-cream-100/90 border border-cream-200 text-espresso-900 font-medium text-[11px]">
                        {t.product_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-espresso-900">
                      {t.quantity} pcs
                    </td>
                    <td className="py-3.5 px-4 text-right text-espresso-700">
                      {formatIDR(t.unit_price)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-serif font-bold text-espresso-900 text-sm">
                      {formatIDR(t.total_price)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => setDeleteModalTx(t)}
                        className="p-1.5 rounded-lg text-espresso-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-[#F5EFE6] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-espresso-600 bg-[#FAF7F2]/50">
          <div>
            Halaman <span className="font-bold text-espresso-900">{currentPage}</span> dari <span className="font-bold text-espresso-900">{totalPages}</span> ({filteredTransactions.length} baris riwayat)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-[#EAE2D5] bg-white text-espresso-700 hover:bg-cream-100 disabled:opacity-30 transition-all"
              aria-label="Halaman sebelumnya"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-espresso-800 font-serif">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-[#EAE2D5] bg-white text-espresso-700 hover:bg-cream-100 disabled:opacity-30 transition-all"
              aria-label="Halaman berikutnya"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalTx && (
        <div className="fixed inset-0 bg-espresso-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up border border-[#EAE2D5]">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-espresso-900">
                Konfirmasi Hapus Transaksi
              </h3>
              <p className="text-xs text-espresso-600 mt-1 leading-relaxed">
                Apakah Anda yakin ingin menghapus data transaksi <strong>{deleteModalTx.code}</strong> ({deleteModalTx.customer_name} - {formatIDR(deleteModalTx.total_price)})? Data akan dihapus dari Supabase dan tidak dapat dipulihkan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalTx(null)}
                className="px-4 py-2 rounded-xl border border-[#EAE2D5] text-espresso-700 font-semibold text-xs hover:bg-cream-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20 transition-colors"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
