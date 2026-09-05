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
  ArrowUpDown
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
    { id: 'ALL', label: 'Semua Kanal' },
    { id: 'bazar', label: 'Bazar Pagi' },
    { id: 'pesantren', label: 'Pesantren' },
    { id: 'reseller', label: 'Reseller Mitra' },
    { id: 'po', label: 'Pre-Order Umum' }
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
    const headers = ['ID/Kode', 'Tanggal', 'Nama Pelanggan', 'Produk', 'Varian', 'Jumlah', 'Harga Satuan', 'Total'];
    const rows = filteredTransactions.map(t => [
      t.code || '',
      t.transaction_date || '',
      `"${(t.customer_name || '').replace(/"/g, '""')}"`,
      `"${(t.product_name || '').replace(/"/g, '""')}"`,
      `"${(t.variant || '-').replace(/"/g, '""')}"`,
      t.quantity || 0,
      t.unit_price || 0,
      t.total_price || 0
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Justeathere_Laporan_Penjualan_${new Date().toISOString().slice(0, 10)}.csv`);
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
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Cari berdasarkan kode (TX-...), nama pelanggan, produk..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
            />
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm shadow-sm transition-colors"
          >
            <Download size={16} />
            <span>Ekspor ke Excel / CSV</span>
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-400 font-medium flex items-center gap-1 mr-1">
            <Filter size={14} /> Filter:
          </span>

          {/* Product Select */}
          <select
            value={selectedProduct}
            onChange={(e) => {
              setSelectedProduct(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:border-brand-500"
          >
            <option value="ALL">Semua Produk</option>
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
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:border-brand-500"
          >
            {channelsList.map(ch => (
              <option key={ch.id} value={ch.id}>{ch.label}</option>
            ))}
          </select>

          {/* Sort Order */}
          <button
            onClick={() => setSortOrder(sortOrder === 'DESC' ? 'ASC' : 'DESC')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium text-slate-700 transition-colors ml-auto"
          >
            <ArrowUpDown size={14} />
            <span>{sortOrder === 'DESC' ? 'Terbaru Dahulu' : 'Terlama Dahulu'}</span>
          </button>
        </div>

        {/* Dynamic Summary Strip */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
          <span>Menampilkan: <strong className="text-slate-900">{filterStats.count}</strong> transaksi</span>
          <span className="text-slate-300">|</span>
          <span>Total Terjual: <strong className="text-slate-900">{filterStats.qty}</strong> pcs</span>
          <span className="text-slate-300">|</span>
          <span>Total Omset Filter: <strong className="text-brand-700">{formatIDR(filterStats.rev)}</strong></span>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Kode Transaksi</th>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Pelanggan / Kanal</th>
                <th className="py-3.5 px-4">Menu Produk</th>
                <th className="py-3.5 px-4 text-right">Jumlah</th>
                <th className="py-3.5 px-4 text-right">Harga Satuan</th>
                <th className="py-3.5 px-4 text-right">Total</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    Tidak ada data transaksi yang cocok dengan filter atau pencarian Anda.
                  </td>
                </tr>
              ) : (
                paginatedRows.map((t) => (
                  <tr key={t.id || t.code} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-brand-600 whitespace-nowrap">
                      {t.code}
                    </td>
                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {t.transaction_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      {t.customer_name}
                    </td>
                    <td className="py-3 px-4 text-slate-800">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium text-slate-700">
                        {t.product_name}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-800">
                      {t.quantity} pcs
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {formatIDR(t.unit_price)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      {formatIDR(t.total_price)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setDeleteModalTx(t)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
        <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Halaman <span className="font-bold text-slate-800">{currentPage}</span> dari <span className="font-bold text-slate-800">{totalPages}</span> ({filteredTransactions.length} baris)
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="px-2 font-semibold text-slate-700">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModalTx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
              <AlertTriangle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900 font-['Outfit']">
                Konfirmasi Hapus Transaksi
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Apakah Anda yakin ingin menghapus data transaksi <strong>{deleteModalTx.code}</strong> ({deleteModalTx.customer_name} - {formatIDR(deleteModalTx.total_price)})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalTx(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/20"
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
