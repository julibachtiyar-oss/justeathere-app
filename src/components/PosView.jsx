import React, { useState, useEffect } from 'react';
import { 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  User, 
  Calendar, 
  Receipt,
  Printer,
  X,
  Layers,
  Search
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PosView({ products, transactions, onAddTransaction }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState(products[0] || null);
  const [customerName, setCustomerName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState(products[0]?.base_price || 18000);
  const [isCustomPrice, setIsCustomPrice] = useState(false);
  const [transactionDate, setTransactionDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [variant, setVariant] = useState('-');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState(null);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Quick customer channels matching historical sales
  const customerPresets = [
    { label: 'Bazar Pagi', tag: 'Bazar' },
    { label: 'Reseller Ka Citra', tag: 'Reseller' },
    { label: 'Pesantren', tag: 'Bulk' },
    { label: 'Reseller Dahlia', tag: 'Reseller' },
    { label: 'Umum (Open PO)', tag: 'PO' },
    { label: 'Lala', tag: 'Mitra' }
  ];

  // Sync selected product if products change
  useEffect(() => {
    if (!selectedProduct && products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  // Sync price when product changes (if not in custom price mode)
  useEffect(() => {
    if (selectedProduct && !isCustomPrice) {
      setUnitPrice(selectedProduct.base_price);
    }
  }, [selectedProduct, isCustomPrice]);

  const totalPrice = (Number(quantity) || 0) * (Number(unitPrice) || 0);

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    const matchesSearch = !searchTerm || (p.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Generate next code
  const nextCode = (() => {
    const numbers = transactions
      .map(t => {
        const m = (t.code || '').match(/TX-?(\d+)/i);
        return m ? parseInt(m[1], 10) : 0;
      })
      .filter(n => !isNaN(n));
    const max = numbers.length > 0 ? Math.max(...numbers) : 0;
    return `TX-${String(max + 1).padStart(3, '0')}`;
  })();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      alert('Mohon masukkan nama pelanggan atau pilih kanal penjualan!');
      return;
    }
    if (quantity <= 0) {
      alert('Jumlah (quantity) minimal 1!');
      return;
    }

    setLoading(true);

    const newTx = {
      code: nextCode,
      transaction_date: transactionDate,
      customer_name: customerName.trim(),
      product_name: selectedProduct?.name || 'Bischeese',
      variant: variant.trim() || '-',
      quantity: Number(quantity),
      unit_price: Number(unitPrice),
      total_price: Number(totalPrice),
      notes: notes.trim()
    };

    try {
      const saved = await onAddTransaction(newTx);
      setSuccessTx(saved || newTx);
      setShowReceiptModal(true);

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Reset form quantity and notes
      setQuantity(1);
      setNotes('');
      setIsCustomPrice(false);
    } catch (err) {
      alert('Gagal menyimpan transaksi: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  const printReceipt = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Notice / Success Alert */}
      {successTx && !showReceiptModal && (
        <div className="p-4 rounded-2xl bg-[#F4F9F4] border border-[#C8E6C9] text-[#1B5E20] flex items-start justify-between animate-fade-in shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2E7D32] text-white flex items-center justify-center flex-shrink-0">
              <Check size={18} strokeWidth={3} />
            </div>
            <div>
              <h4 className="font-serif font-bold text-sm text-[#1B5E20]">
                Transaksi Berhasil Dicatat: <span className="underline">{successTx.code}</span>
              </h4>
              <p className="text-xs text-[#2E7D32] mt-0.5">
                {successTx.customer_name} • {successTx.quantity} pcs {successTx.product_name} • {formatIDR(successTx.total_price)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowReceiptModal(true)}
              className="px-3 py-1.5 rounded-lg bg-[#2E7D32] text-white text-xs font-semibold hover:bg-[#1B5E20] transition-colors"
            >
              Lihat Struk
            </button>
            <button 
              onClick={() => setSuccessTx(null)}
              className="text-xs font-semibold text-[#2E7D32] hover:text-[#1B5E20] underline ml-2"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection & Customer Setup (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Section 1: Catalog Selector */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D5] shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F5EFE6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-bischeese-600 bg-cream-100 px-2 py-0.5 rounded-md">
                  Langkah 1
                </span>
                <h3 className="font-serif font-bold text-espresso-900 text-lg mt-1">
                  Pilih Menu & Varian Rasa
                </h3>
              </div>

              {/* Category Filter Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-cream-100/70 rounded-xl border border-cream-200/80 text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedCategory('ALL')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedCategory === 'ALL'
                      ? 'bg-espresso-900 text-white shadow-sm'
                      : 'text-espresso-700 hover:text-espresso-900'
                  }`}
                >
                  Semua ({products.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Bischeese')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedCategory === 'Bischeese'
                      ? 'bg-bischeese-600 text-white shadow-sm'
                      : 'text-espresso-700 hover:text-espresso-900'
                  }`}
                >
                  Bischeese (7 Rasa)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Cheesecake')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                    selectedCategory === 'Cheesecake'
                      ? 'bg-espresso-900 text-white shadow-sm'
                      : 'text-espresso-700 hover:text-espresso-900'
                  }`}
                >
                  Cake
                </button>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {filteredProducts.map((p) => {
                const isSelected = selectedProduct?.name === p.name;
                return (
                  <button
                    key={p.id || p.name}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(p);
                      if (!isCustomPrice) setUnitPrice(p.base_price);
                    }}
                    className={`
                      text-left rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between group
                      ${isSelected 
                        ? 'border-bischeese-600 bg-cream-50/80 ring-2 ring-bischeese-500/30 shadow-md scale-[1.01]' 
                        : 'border-[#EAE2D5] bg-white hover:border-bischeese-300 hover:bg-[#FAF7F2] shadow-sm'}
                    `}
                  >
                    {/* Product Image Thumbnail */}
                    <div className="relative h-28 w-full bg-cream-100 overflow-hidden">
                      {p.image ? (
                        <img 
                          src={p.image} 
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-bischeese-400 bg-cream-100">
                          <Layers size={28} />
                          <span className="text-[10px] font-bold mt-1 text-espresso-600">{p.category}</span>
                        </div>
                      )}

                      {/* Badge if available */}
                      {p.badge && (
                        <span className="absolute top-2 left-2 text-[9px] font-bold uppercase tracking-wider bg-espresso-900/90 text-cream-100 px-2 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
                          {p.badge}
                        </span>
                      )}

                      {/* Selected Checkmark Indicator */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-bischeese-600 text-white flex items-center justify-center shadow-md animate-scale-up">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-semibold text-espresso-600 uppercase tracking-wide">
                          {p.category || 'Menu'}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-espresso-900 line-clamp-1 mt-0.5">
                          {p.name}
                        </h4>
                      </div>
                      <div className="mt-2.5 pt-2 border-t border-[#F5EFE6] flex items-center justify-between">
                        <span className="font-extrabold text-bischeese-700 text-xs sm:text-sm">
                          {formatIDR(p.base_price)}
                        </span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                          isSelected ? 'bg-bischeese-600 text-white' : 'bg-cream-100 text-espresso-700'
                        }`}>
                          {isSelected ? 'Dipilih' : 'Pilih'}
                        </span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Customer & Channel Presets */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D5] shadow-sm space-y-4">
            <div className="pb-2 border-b border-[#F5EFE6]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-bischeese-600 bg-cream-100 px-2 py-0.5 rounded-md">
                Langkah 2
              </span>
              <h3 className="font-serif font-bold text-espresso-900 text-lg mt-1">
                Kanal Penjualan / Nama Pelanggan
              </h3>
              <p className="text-xs text-espresso-600">Pilih kanal penjualan rutin atau ketik nama pembeli manual</p>
            </div>

            {/* Quick Channel Chips */}
            <div className="flex flex-wrap gap-2">
              {customerPresets.map((preset) => {
                const isActive = customerName === preset.label;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setCustomerName(preset.label)}
                    className={`
                      text-xs px-3.5 py-2 rounded-xl border font-semibold transition-all flex items-center gap-1.5
                      ${isActive 
                        ? 'bg-espresso-900 text-white border-espresso-900 shadow-sm' 
                        : 'bg-cream-50 text-espresso-800 border-[#EAE2D5] hover:bg-[#F5EFE6] hover:border-bischeese-300'}
                    `}
                  >
                    <span>{preset.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isActive ? 'bg-white/20 text-cream-100' : 'bg-[#EAE2D5] text-espresso-600'
                    }`}>
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Manual Name Input */}
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-espresso-600" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Atau ketik nama pembeli manual (contoh: Po Reynata, Bu Siti, Ka Nur...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EAE2D5] text-sm text-espresso-900 placeholder:text-espresso-600 focus:outline-none focus:ring-2 focus:ring-bischeese-500/20 focus:border-bischeese-500 bg-cream-50/50"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary & Action (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D5] shadow-md space-y-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-[#F5EFE6]">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-bischeese-600 bg-cream-100 px-2 py-0.5 rounded-md">
                Kasir Bischeese
              </span>
              <h3 className="font-serif font-bold text-espresso-900 text-lg mt-1">
                Rincian Pesanan
              </h3>
              <p className="text-xs text-espresso-600">Kode Nota: <strong className="text-bischeese-700 font-bold">{nextCode}</strong></p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cream-100 text-espresso-800 flex items-center justify-center">
              <Receipt size={20} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Selected Item Summary Card */}
            {selectedProduct && (
              <div className="p-3.5 rounded-xl bg-cream-50/80 border border-[#EAE2D5] flex items-center gap-3">
                {selectedProduct.image ? (
                  <img 
                    src={selectedProduct.image} 
                    alt={selectedProduct.name}
                    className="w-12 h-12 rounded-lg object-cover border border-[#EAE2D5]"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-cream-200 text-espresso-700 flex items-center justify-center font-serif font-bold">
                    BC
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-semibold text-espresso-600 uppercase">
                    {selectedProduct.category}
                  </span>
                  <h5 className="font-serif font-bold text-sm text-espresso-900 truncate">
                    {selectedProduct.name}
                  </h5>
                  <span className="text-xs font-bold text-bischeese-700">
                    {formatIDR(unitPrice)} / pcs
                  </span>
                </div>
              </div>
            )}

            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-xs font-bold text-espresso-800 mb-1.5">
                Tanggal Penjualan
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-3 text-espresso-600" />
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#EAE2D5] text-xs sm:text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-bischeese-500/20 focus:border-bischeese-500 bg-cream-50/50"
                  required
                />
              </div>
            </div>

            {/* Quantity Stepper */}
            <div>
              <label className="block text-xs font-bold text-espresso-800 mb-1.5">
                Jumlah Pesanan (Pcs)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 rounded-xl border border-[#EAE2D5] bg-cream-50 flex items-center justify-center text-espresso-800 hover:bg-cream-100 active:scale-95 transition-all"
                  aria-label="Kurangi jumlah"
                >
                  <Minus size={18} strokeWidth={2.5} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="flex-1 text-center py-2 rounded-xl border border-[#EAE2D5] font-serif font-black text-xl text-espresso-900 focus:outline-none focus:ring-2 focus:ring-bischeese-500/20 focus:border-bischeese-500 bg-cream-50/30"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 rounded-xl border border-[#EAE2D5] bg-cream-50 flex items-center justify-center text-espresso-800 hover:bg-cream-100 active:scale-95 transition-all"
                  aria-label="Tambah jumlah"
                >
                  <Plus size={18} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            {/* Unit Price Controls */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-espresso-800">
                  Harga Satuan (Rp)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomPrice(!isCustomPrice)}
                  className="text-[11px] font-semibold text-bischeese-700 hover:text-bischeese-800 underline"
                >
                  {isCustomPrice ? 'Kembalikan Harga Standar' : 'Ubah Harga Khusus'}
                </button>
              </div>
              <input
                type="number"
                value={unitPrice}
                disabled={!isCustomPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-xl border text-sm font-bold ${
                  isCustomPrice 
                    ? 'border-bischeese-500 bg-white text-espresso-900 focus:outline-none focus:ring-2 focus:ring-bischeese-500/20' 
                    : 'border-[#EAE2D5] bg-[#F5EFE6] text-espresso-700 cursor-not-allowed'
                }`}
              />
              {isCustomPrice && (
                <p className="text-[11px] text-bischeese-800 font-medium mt-1">
                  *Mode harga diskon / reseller aktif
                </p>
              )}
            </div>

            {/* Notes Field */}
            <div>
              <label className="block text-xs font-bold text-espresso-800 mb-1.5">
                Catatan Khusus (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: DP 50%, ambil jam 16:00, kartu ucapan..."
                className="w-full px-3.5 py-2 rounded-xl border border-[#EAE2D5] text-xs sm:text-sm text-espresso-900 focus:outline-none focus:ring-2 focus:ring-bischeese-500/20 focus:border-bischeese-500 bg-cream-50/50"
              />
            </div>

            {/* Total Ringkasan Box (Dark Roasted Espresso) */}
            <div className="p-4 rounded-2xl bg-espresso-900 text-cream-50 space-y-1.5 shadow-md">
              <div className="flex items-center justify-between text-xs text-cream-200">
                <span>Total Tagihan:</span>
                <span>{quantity} pcs × {formatIDR(unitPrice)}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-serif font-bold text-bischeese-300">
                {formatIDR(totalPrice)}
              </div>
              <div className="text-[11px] text-cream-300 pt-1 border-t border-espresso-800 flex items-center justify-between">
                <span>Status Pembayaran:</span>
                <span className="font-semibold text-emerald-400">Lunas / Siap Catat</span>
              </div>
            </div>

            {/* Submit Button (Caramel Accent) */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-bischeese-600 hover:bg-bischeese-700 text-white font-serif font-bold text-sm sm:text-base shadow-md shadow-bischeese-900/15 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>{loading ? 'Menyimpan ke Supabase...' : 'Simpan Transaksi Kasir'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {showReceiptModal && successTx && (
        <div className="fixed inset-0 bg-espresso-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-2xl p-6 shadow-2xl space-y-4 animate-scale-up border border-[#EAE2D5]">
            <div className="flex items-center justify-between pb-3 border-b border-[#F5EFE6]">
              <span className="text-xs font-bold text-bischeese-600 font-serif">Struk Transaksi Penjualan</span>
              <button 
                onClick={() => setShowReceiptModal(false)}
                className="p-1 rounded-lg hover:bg-cream-100 text-espresso-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Receipt Body */}
            <div className="font-mono text-xs space-y-3 bg-[#FAF7F2] p-4 rounded-xl border border-[#EAE2D5] text-espresso-900">
              <div className="text-center space-y-0.5 border-b border-dashed border-espresso-300 pb-3">
                <h4 className="font-serif font-bold text-base text-espresso-900">BISCHEESE</h4>
                <p className="text-[10px] text-espresso-600">by Justeathere</p>
                <p className="text-[10px] text-espresso-600 italic">Soft, creamy, and layered with love</p>
              </div>

              <div className="space-y-1 text-[11px] pt-1">
                <div className="flex justify-between">
                  <span className="text-espresso-600">No. Nota:</span>
                  <span className="font-bold">{successTx.code}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-espresso-600">Tanggal:</span>
                  <span>{successTx.transaction_date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-espresso-600">Pelanggan:</span>
                  <span className="font-bold">{successTx.customer_name}</span>
                </div>
              </div>

              <div className="border-t border-b border-dashed border-espresso-300 py-2 space-y-1">
                <div className="flex justify-between font-bold">
                  <span>{successTx.product_name}</span>
                  <span>{formatIDR(successTx.total_price)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-espresso-600">
                  <span>{successTx.quantity} pcs @ {formatIDR(successTx.unit_price)}</span>
                </div>
                {successTx.notes && (
                  <div className="text-[10px] text-espresso-600 italic">
                    Ket: {successTx.notes}
                  </div>
                )}
              </div>

              <div className="flex justify-between font-bold text-sm pt-1">
                <span>TOTAL AKHIR:</span>
                <span className="text-bischeese-700">{formatIDR(successTx.total_price)}</span>
              </div>

              <div className="text-center pt-2 text-[10px] text-espresso-600 border-t border-dashed border-espresso-300">
                Terima kasih atas pesanan Anda! ❤️<br />
                Follow Instagram @justeathere
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={printReceipt}
                className="flex-1 py-2.5 rounded-xl border border-espresso-900 text-espresso-900 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-cream-100"
              >
                <Printer size={15} />
                <span>Cetak Nota</span>
              </button>
              <button
                type="button"
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-bischeese-600 hover:bg-bischeese-700 text-white font-serif font-bold text-xs shadow-sm"
              >
                Selesai & Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
