import React, { useState } from 'react';
import { Plus, Edit2, Check, Tag, Package, Layers, Sparkles } from 'lucide-react';

export default function MenuView({ products, transactions, onUpdateProducts }) {
  const [productList, setProductList] = useState(products);
  const [editingProd, setEditingProd] = useState(null);
  const [editPrice, setEditPrice] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('Bischeese');
  const [newPrice, setNewPrice] = useState(18000);
  const [newDesc, setNewDesc] = useState('');

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
      base_price: Number(newPrice),
      description: newDesc.trim() || undefined
    };

    const updated = [...productList, newProd];
    setProductList(updated);
    if (onUpdateProducts) onUpdateProducts(updated);

    setNewName('');
    setNewDesc('');
    setNewPrice(18000);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#EAE2D5] shadow-sm">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-bischeese-600 bg-cream-100 px-2 py-0.5 rounded-md">
            Katalog Produk & Harga
          </span>
          <h3 className="text-lg sm:text-xl font-serif font-bold text-espresso-900 mt-1">
            Varian Menu BISCHEESE
          </h3>
          <p className="text-xs text-espresso-600">Kelola 7 rasa signature Bischeese, cake, dan harga acuan penjualan</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bischeese-600 hover:bg-bischeese-700 text-white font-serif font-bold text-xs sm:text-sm shadow-md shadow-bischeese-900/15 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Product Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {productList.map((prod) => {
          const stats = productStats[prod.name] || { qty: 0, rev: 0 };
          const isEditing = editingProd?.name === prod.name;

          return (
            <div 
              key={prod.name}
              className="bg-white rounded-2xl border border-[#EAE2D5] overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Product Image */}
                <div className="relative h-36 w-full bg-cream-100 overflow-hidden">
                  {prod.image ? (
                    <img 
                      src={prod.image} 
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-bischeese-400 bg-cream-100">
                      <Layers size={32} />
                      <span className="text-xs font-serif font-bold mt-1 text-espresso-700">{prod.category}</span>
                    </div>
                  )}

                  {prod.badge && (
                    <span className="absolute top-2.5 left-2.5 text-[9px] font-bold uppercase tracking-wider bg-espresso-900/90 text-cream-100 px-2.5 py-0.5 rounded-full shadow-sm backdrop-blur-xs">
                      {prod.badge}
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-espresso-600 bg-cream-100 px-2 py-0.5 rounded-md">
                      {prod.category || 'Bischeese'}
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
                      className="p-1.5 rounded-lg text-espresso-600 hover:text-bischeese-700 hover:bg-cream-100 transition-colors"
                      title="Ubah Harga"
                    >
                      <Edit2 size={13} />
                    </button>
                  </div>

                  <h4 className="font-serif font-bold text-base text-espresso-900">
                    {prod.name}
                  </h4>

                  {prod.description && (
                    <p className="text-xs text-espresso-600 line-clamp-2 leading-relaxed">
                      {prod.description}
                    </p>
                  )}

                  {/* Price Display / Edit */}
                  <div className="pt-1">
                    {isEditing ? (
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={editPrice}
                          onChange={(e) => setEditPrice(e.target.value)}
                          className="w-full px-2.5 py-1 text-xs font-bold border border-bischeese-500 rounded-lg focus:outline-none bg-white text-espresso-900"
                        />
                        <button
                          onClick={() => handleSavePrice(prod)}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex-shrink-0"
                          title="Simpan Harga"
                        >
                          <Check size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-lg font-serif font-bold text-bischeese-700">
                        {formatIDR(prod.base_price)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Footer */}
              <div className="p-4 pt-3 border-t border-[#F5EFE6] bg-[#FAF7F2]/50 text-xs flex items-center justify-between text-espresso-600">
                <span>Terjual: <strong className="text-espresso-900">{stats.qty} pcs</strong></span>
                <span>Omset: <strong className="text-bischeese-800 font-serif font-bold">{formatIDR(stats.rev)}</strong></span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-espresso-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl p-6 shadow-2xl space-y-4 border border-[#EAE2D5] animate-scale-up">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-bischeese-600 bg-cream-100 px-2 py-0.5 rounded-md">
                Katalog Baru
              </span>
              <h3 className="font-serif font-bold text-lg text-espresso-900 mt-1">
                Tambah Menu Baru
              </h3>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-espresso-800 mb-1">Nama Menu</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Red Velvet, Hazelnut Choco..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE2D5] text-xs text-espresso-900 focus:outline-none focus:border-bischeese-500 bg-cream-50/50"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-espresso-800 mb-1">Kategori</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE2D5] text-xs text-espresso-900 focus:outline-none focus:border-bischeese-500 bg-cream-50/50"
                >
                  <option value="Bischeese">Bischeese</option>
                  <option value="Cheesecake">Cheesecake</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Custom Cake">Custom Cake</option>
                  <option value="Lainnya">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-espresso-800 mb-1">Harga Standar (Rp)</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE2D5] text-xs text-espresso-900 focus:outline-none focus:border-bischeese-500 bg-cream-50/50 font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-espresso-800 mb-1">Deskripsi Singkat (Opsional)</label>
                <textarea
                  rows="2"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Contoh: Lapisan krim keju premium dengan taburan biskuit lezat..."
                  className="w-full px-3 py-2 rounded-xl border border-[#EAE2D5] text-xs text-espresso-900 focus:outline-none focus:border-bischeese-500 bg-cream-50/50"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#EAE2D5] text-xs font-semibold text-espresso-700 hover:bg-cream-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-bischeese-600 hover:bg-bischeese-700 text-white text-xs font-serif font-bold shadow-md shadow-bischeese-900/15 transition-all"
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
