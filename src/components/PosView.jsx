import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Check, 
  Plus, 
  Minus, 
  Sparkles, 
  Tag, 
  User, 
  Calendar, 
  FileText,
  AlertCircle,
  Receipt
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function PosView({ products, transactions, onAddTransaction }) {
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

  // Quick customer channels
  const customerPresets = [
    'Bazar Pagi',
    'Reseller Ka Citra',
    'Pesantren',
    'Reseller Dahlia',
    'Umum (Open PO)',
    'Lala'
  ];

  // Sync price when product changes (if not in custom price mode)
  useEffect(() => {
    if (selectedProduct && !isCustomPrice) {
      setUnitPrice(selectedProduct.base_price);
    }
  }, [selectedProduct, isCustomPrice]);

  const totalPrice = (Number(quantity) || 0) * (Number(unitPrice) || 0);

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
      product_name: selectedProduct?.name || 'Dessert Box',
      variant: variant.trim() || '-',
      quantity: Number(quantity),
      unit_price: Number(unitPrice),
      total_price: Number(totalPrice),
      notes: notes.trim()
    };

    try {
      const saved = await onAddTransaction(newTx);
      setSuccessTx(saved || newTx);

      // Trigger celebratory confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Reset form
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

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Success Receipt Alert */}
      {successTx && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between animate-fade-in shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
              <Check size={20} />
            </div>
            <div>
              <h4 className="font-bold text-sm">
                Transaksi Berhasil Dicatat! Kode: <span className="underline">{successTx.code}</span>
              </h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                {successTx.customer_name} membeli {successTx.quantity} pcs {successTx.product_name} senilai {formatIDR(successTx.total_price)}.
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSuccessTx(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline ml-4"
          >
            Tutup
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection & Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Product */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 font-['Outfit'] text-base">
                  1. Pilih Produk
                </h3>
                <p className="text-xs text-slate-500">Pilih menu yang dipesan pelanggan</p>
              </div>
              <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg">
                Auto-Price
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              {products.map((p) => {
                const isSelected = selectedProduct?.name === p.name;
                return (
                  <button
                    key={p.name}
                    type="button"
                    onClick={() => {
                      setSelectedProduct(p);
                      if (!isCustomPrice) setUnitPrice(p.base_price);
                    }}
                    className={`
                      p-4 rounded-xl text-left border transition-all relative flex flex-col justify-between
                      ${isSelected 
                        ? 'border-brand-500 bg-brand-50/60 ring-2 ring-brand-500/20 shadow-sm' 
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}
                    `}
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {p.category || 'Menu'}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-0.5">{p.name}</h4>
                    </div>
                    <div className="mt-3 font-extrabold text-brand-700 text-sm font-['Outfit']">
                      {formatIDR(p.base_price)}
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center">
                        <Check size={12} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Customer & Channel */}
          <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 font-['Outfit'] text-base">
                2. Pelanggan / Kanal Penjualan
              </h3>
              <p className="text-xs text-slate-500">Pilih preset atau ketik nama pelanggan manual</p>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2">
              {customerPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCustomerName(preset)}
                  className={`
                    text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors
                    ${customerName === preset 
                      ? 'bg-slate-900 text-white border-slate-900' 
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}
                  `}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Manual Input */}
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-3.5 text-slate-400" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ketik nama pelanggan / event (contoh: Po Reynata, Reseller...)"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
                required
              />
            </div>
          </div>
        </div>

        {/* Right Column: Pricing & Checkout Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 font-['Outfit'] text-base">
                Rincian Pesanan
              </h3>
              <p className="text-xs text-slate-400">Kode otomatis: <strong className="text-brand-600">{nextCode}</strong></p>
            </div>
            <Receipt size={22} className="text-slate-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tanggal Transaksi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Transaksi
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
                  required
                />
              </div>
            </div>

            {/* Quantity Controls */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jumlah Pesanan (Quantity)
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="flex-1 text-center py-2 rounded-xl border border-slate-200 font-black text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-xl border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-95 transition-all"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Unit Price (Customizable) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  Harga Satuan (Rp)
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomPrice(!isCustomPrice)}
                  className="text-[11px] font-semibold text-brand-600 hover:underline"
                >
                  {isCustomPrice ? 'Kembalikan Harga Standar' : 'Ubah Harga Khusus'}
                </button>
              </div>
              <input
                type="number"
                value={unitPrice}
                disabled={!isCustomPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className={`w-full px-4 py-2 rounded-xl border text-sm font-semibold ${
                  isCustomPrice 
                    ? 'border-brand-500 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20' 
                    : 'border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed'
                }`}
              />
              {isCustomPrice && (
                <p className="text-[11px] text-amber-600 mt-1">
                  *Mode harga khusus/diskon reseller aktif
                </p>
              )}
            </div>

            {/* Total Display */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white space-y-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ringkasan Total</span>
                <span>{quantity} pcs × {formatIDR(unitPrice)}</span>
              </div>
              <div className="text-2xl font-black font-['Outfit'] text-white">
                {formatIDR(totalPrice)}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Contoh: Titip ke Bu Siti, DP lunas..."
                className="w-full px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 bg-slate-50/50"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-rose-500 hover:from-brand-700 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-brand-500/25 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Sparkles size={18} />
              <span>{loading ? 'Menyimpan...' : 'Simpan Transaksi & Cetak'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
