import React, { useState } from 'react';
import { UtensilsCrossed, Plus, Edit2, Check, Tag, Package, DollarSign } from 'lucide-react';

export default function MenuView({ products, transactions, onUpdateProducts }) {
  const [productList, setProductList] = useState(products);
  const [editingProd, setEditingProd] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Dessert');
  const [newPrice, setNewPrice] = useState(20000);

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // Calculate sales per product
  const productStats = {};
  transactions.forEach(t => {
    const p = t.product_name || 'Lainnya';
    if (!productStats[p]) {
      productStats[p] = { qty: 0, rev: 0 };
    }
    productStats[p].qty += Number(t.quantity) || 0;
    productStats[p].rev += Number(t.total_price) || 0;
  });

  const handleSavePrice = (prod) => {
    const updated = productList.map(p => 
      p.name === prod.name ? { ...p, base_price: Number(editPrice) } : p
    );
    setProductList(updated);
    if (onUpdateProducts) onUpdateProducts(updated);
    setEditingProd(null);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const newProd = {
      id: 'prod-' + Date.now(),
      name: newName.trim(),
      category: newCategory,
      base_price: Number(newPrice)
    };

    const updated = [...productList, newProd];
    setProductList(updated);
    if (onUpdateProducts) onUpdateProducts(updated);

    setNewName('');
    setNewPrice(20000);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-['Outfit']">
            Daftar Menu & Harga Standar
          </h3>
          <p className="text-xs text-slate-500">Kelola katalog produk, kategori, dan harga acuan penjualan</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-brand-600/20 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {productList.map((prod) => {
          const stats = productStats[prod.name] || { qty: 0, rev: 0 };
          const isEditing = editingProd?.name === prod.name;

          return (
            <div 
              key={prod.name}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                    {prod.category || 'Dessert'}
                  </span>
                  <button
                    onClick={() => {
                      if (isEditing) {
                        setEditingProd(null);
                      } else {
                        setEditingProd(prod);
                        setEditPrice(prod.base_price);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                    title="Ubah Harga"
                  >
                    <Edit2 size={14} />
                  </button>
                </div>

                <h4 className="font-extrabold text-base text-slate-900 font-['Outfit']">
                  {prod.name}
                </h4>

                {/* Price Display / Edit */}
                <div className="mt-3">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="w-full px-2.5 py-1 text-xs font-bold border border-brand-500 rounded-lg focus:outline-none"
                      />
                      <button
                        onClick={() => handleSavePrice(prod)}
                        className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                        title="Simpan"
                      >
                        <Check size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="text-xl font-black text-brand-700 font-['Outfit']">
                      {formatIDR(prod.base_price)}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Footer */}
              <div className="mt-5 pt-3 border-t border-slate-100 text-xs flex items-center justify-between text-slate-500">
                <span>Terjual: <strong className="text-slate-800">{stats.qty} pcs</strong></span>
                <span>Omset: <strong className="text-emerald-700">{formatIDR(stats.rev)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 font-['Outfit']">
              Tambah Menu Baru
            </h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Produk</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Brownies Fudgy, Tiramisu..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500 bg-slate-50"
                >
                  <option value="Dessert">Dessert</option>
                  <option value="Cake">Cake</option>
                  <option value="Pastry">Pastry</option>
                  <option value="Minuman">Minuman</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Harga Standar (Rp)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold shadow-md shadow-brand-600/20"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
