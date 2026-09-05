import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  ChevronRight,
  Store,
  Sparkles,
  Heart,
  ArrowUpRight
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardView({ transactions, products, setActiveTab }) {
  // 1. Core Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalQty = 0;
    const txCount = transactions.length;

    transactions.forEach(t => {
      totalRevenue += Number(t.total_price) || 0;
      totalQty += Number(t.quantity) || 0;
    });

    const aov = txCount > 0 ? Math.round(totalRevenue / txCount) : 0;

    return { totalRevenue, totalQty, txCount, aov };
  }, [transactions]);

  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val || 0);
  };

  // 2. Monthly Trend Data
  const monthlyData = useMemo(() => {
    const months = {};
    const monthOrder = [
      '2025-11', '2025-12', '2026-01', '2026-02', 
      '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'
    ];

    const monthNames = {
      '2025-11': 'Nov 25',
      '2025-12': 'Des 25',
      '2026-01': 'Jan 26',
      '2026-02': 'Feb 26',
      '2026-03': 'Mar 26',
      '2026-04': 'Apr 26',
      '2026-05': 'Mei 26',
      '2026-06': 'Jun 26',
      '2026-07': 'Jul 26'
    };

    monthOrder.forEach(m => {
      months[m] = { revenue: 0, qty: 0 };
    });

    transactions.forEach(t => {
      const ym = (t.transaction_date || '').slice(0, 7);
      if (!months[ym]) {
        months[ym] = { revenue: 0, qty: 0 };
      }
      months[ym].revenue += Number(t.total_price) || 0;
      months[ym].qty += Number(t.quantity) || 0;
    });

    const activeMonths = Object.keys(months).sort();
    return {
      labels: activeMonths.map(m => monthNames[m] || m),
      revenues: activeMonths.map(m => months[m].revenue),
      quantities: activeMonths.map(m => months[m].qty)
    };
  }, [transactions]);

  // 3. Product Share
  const productData = useMemo(() => {
    const counts = {};
    transactions.forEach(t => {
      const p = t.product_name || 'Dessert Box';
      counts[p] = (counts[p] || 0) + (Number(t.quantity) || 0);
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return { labels, data };
  }, [transactions]);

  // 4. Channel Breakdown
  const channelBreakdown = useMemo(() => {
    const channels = {};
    transactions.forEach(t => {
      let ch = 'Pre-Order Umum';
      const name = (t.customer_name || '').toLowerCase();
      if (name.includes('bazar')) ch = 'Bazar Pagi';
      else if (name.includes('pesantren')) ch = 'Pesantren';
      else if (name.includes('reseller')) ch = 'Reseller Mitra';
      else if (name.includes('lala')) ch = 'Lala Partner';
      else if (name.includes('po')) ch = 'Pre-Order Umum';

      if (!channels[ch]) {
        channels[ch] = { revenue: 0, qty: 0, count: 0 };
      }
      channels[ch].revenue += Number(t.total_price) || 0;
      channels[ch].qty += Number(t.quantity) || 0;
      channels[ch].count += 1;
    });

    return Object.entries(channels)
      .map(([name, stat]) => ({ name, ...stat }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [transactions]);

  // Bar Chart Configuration in Warm Caramel Palette
  const barChartConfig = {
    data: {
      labels: monthlyData.labels,
      datasets: [
        {
          label: 'Omset Penjualan (Rp)',
          data: monthlyData.revenues,
          backgroundColor: '#B47640',
          hoverBackgroundColor: '#8F5826',
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#2B1E16',
          titleFont: { size: 12, family: 'Inter' },
          bodyFont: { size: 12, family: 'Inter' },
          padding: 12,
          cornerRadius: 8,
          callbacks: {
            label: (ctx) => `Omset: ${formatIDR(ctx.parsed.y)}`
          }
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { font: { size: 11 }, color: '#7D6B5D' }
        },
        y: {
          grid: { color: '#EFE8DE' },
          ticks: {
            font: { size: 10 },
            color: '#7D6B5D',
            callback: (v) => 'Rp ' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000) + 'k')
          }
        }
      }
    }
  };

  // Donut Chart in Bischeese Palette
  const doughnutConfig = {
    data: {
      labels: productData.labels,
      datasets: [
        {
          data: productData.data,
          backgroundColor: [
            '#B47640', // Caramel Bischeese
            '#D97706', // Lotus Biscoff
            '#65A30D', // Matcha
            '#78350F', // Tiramisu
            '#3D2B1F'  // Dark chocolate
          ],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 10,
            padding: 14,
            font: { size: 11, family: 'Inter' },
            color: '#4A3525'
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} box terjual`
          }
        }
      },
      cutout: '72%'
    }
  };

  return (
    <div className="space-y-7">
      {/* Brand Aesthetic Hero Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FAF5EE] via-[#F4ECE1] to-[#EAE2D5] border border-[#DECDB9] relative overflow-hidden shadow-sm">
        <div className="max-w-2xl relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-[#DECDB9] text-xs font-serif font-bold text-[#7E4C23]">
            <Sparkles size={13} className="text-[#B47640]" />
            <span>Artisan Dessert & Pastry House</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-[#3D2B1F] tracking-tight">
            Bischeese Management Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#7D6B5D] font-medium leading-relaxed">
            "Soft, creamy, and layered with love. A blissful taste in every bite." Pantau seluruh perputaran pesanan, omset bazar, reseller, dan transaksi pelanggan dalam satu tempat.
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[#DECDB9]/60 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-[#645447]">
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#B47640]"></span>
            7 Varian Rasa Bischeese
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#78350F]"></span>
            Kemitraan Reseller Aktif
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            Sistem Kasir Aktif
          </span>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE2D5] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#9B8B7B] uppercase">Total Omset</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#B47640] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#EAE2D5]">
              <TrendingUp size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-black text-[#3D2B1F]">
              {formatIDR(metrics.totalRevenue)}
            </h3>
            <p className="text-[11px] text-[#7D6B5D] font-medium mt-1">
              Rekapitulasi penjualan terverifikasi
            </p>
          </div>
        </div>

        {/* Total Terjual */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE2D5] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#9B8B7B] uppercase">Total Terjual</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#78350F] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#EAE2D5]">
              <Package size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-black text-[#3D2B1F]">
              {metrics.totalQty.toLocaleString('id-ID')} <span className="text-xs font-sans font-semibold text-[#8C7A6B]">box</span>
            </h3>
            <p className="text-[11px] text-[#7D6B5D] font-medium mt-1">
              Varian Bischeese & Cheesecake
            </p>
          </div>
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE2D5] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#9B8B7B] uppercase">Total Transaksi</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#9A5F2D] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#EAE2D5]">
              <ShoppingCart size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-black text-[#3D2B1F]">
              {metrics.txCount} <span className="text-xs font-sans font-semibold text-[#8C7A6B]">pesanan</span>
            </h3>
            <p className="text-[11px] text-[#7D6B5D] font-medium mt-1">
              Terdata dari TX-001 ke atas
            </p>
          </div>
        </div>

        {/* Rata-Rata Order */}
        <div className="bg-white p-5 rounded-2xl border border-[#EAE2D5] shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider text-[#9B8B7B] uppercase">Rata-Rata Order</span>
            <div className="w-9 h-9 rounded-xl bg-[#FAF5EE] text-[#B47640] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#EAE2D5]">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-serif font-black text-[#3D2B1F]">
              {formatIDR(metrics.aov)}
            </h3>
            <p className="text-[11px] text-[#7D6B5D] font-medium mt-1">
              Rata-rata belanja per transaksi (AOV)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Penjualan Bulanan (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EAE2D5] shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h4 className="font-serif font-bold text-lg text-[#3D2B1F]">
                Grafik Tren Omset Bulanan
              </h4>
              <p className="text-xs text-[#7D6B5D]">Perjalanan pertumbuhan penjualan dari awal hingga saat ini</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-[#FAF5EE] text-[#7E4C23] border border-[#DECDB9] rounded-lg">
              Nov 2025 — Jul 2026
            </span>
          </div>
          <div className="h-72 w-full">
            <Bar data={barChartConfig.data} options={barChartConfig.options} />
          </div>
        </div>

        {/* Proporsi Produk (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE2D5] shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-serif font-bold text-lg text-[#3D2B1F]">
              Proporsi Menu Terjual
            </h4>
            <p className="text-xs text-[#7D6B5D]">Perbandingan kuantitas menu terfavorit</p>
          </div>
          <div className="flex-1 flex items-center justify-center my-4 min-h-[220px]">
            <Doughnut data={doughnutConfig.data} options={doughnutConfig.options} />
          </div>
        </div>
      </div>

      {/* Channels & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Kanal Penjualan (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-[#EAE2D5] shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-serif font-bold text-lg text-[#3D2B1F]">
                Kanal Penjualan
              </h4>
              <p className="text-xs text-[#7D6B5D]">Peringkat omset per kategori channel</p>
            </div>
            <Store size={18} className="text-[#8C7A6B]" />
          </div>
          <div className="space-y-3">
            {channelBreakdown.map((ch, idx) => {
              const pct = Math.round((ch.revenue / (metrics.totalRevenue || 1)) * 100);
              return (
                <div key={ch.name} className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE2D5]">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#3D2B1F] mb-1">
                    <span className="flex items-center gap-1.5 font-bold">
                      <span className="w-5 h-5 rounded-full bg-[#EAE2D5] text-[#4A3525] flex items-center justify-center text-[10px] font-serif">
                        {idx + 1}
                      </span>
                      {ch.name}
                    </span>
                    <span className="font-bold text-[#7E4C23] font-serif">{formatIDR(ch.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#8C7A6B] mb-1.5">
                    <span>{ch.count} Transaksi</span>
                    <span>{ch.qty} box ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#EAE2D5] h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#B47640] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaksi Terbaru (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#EAE2D5] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-serif font-bold text-lg text-[#3D2B1F]">
                  Transaksi Terbaru
                </h4>
                <p className="text-xs text-[#7D6B5D]">5 transaksi penjualan terakhir di toko</p>
              </div>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs font-bold text-[#B47640] hover:text-[#9A5F2D] flex items-center gap-1"
              >
                <span>Lihat Semua ({transactions.length})</span>
                <ChevronRight size={14} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="text-[10px] uppercase font-bold text-[#9B8B7B] bg-[#FAF7F2] border-y border-[#EAE2D5] tracking-wider">
                  <tr>
                    <th className="py-2.5 px-3">Kode</th>
                    <th className="py-2.5 px-3">Tanggal</th>
                    <th className="py-2.5 px-3">Pelanggan</th>
                    <th className="py-2.5 px-3">Menu Produk</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAE2D5]">
                  {transactions.slice(0, 5).map((t) => (
                    <tr key={t.id || t.code} className="hover:bg-[#FAF7F2]/60 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#B47640] font-mono">{t.code}</td>
                      <td className="py-3 px-3 text-[#645447] whitespace-nowrap">{t.transaction_date}</td>
                      <td className="py-3 px-3 font-semibold text-[#3D2B1F]">{t.customer_name}</td>
                      <td className="py-3 px-3 text-[#4A3525]">
                        <span className="px-2 py-0.5 rounded-md bg-[#FAF5EE] border border-[#EAE2D5] font-medium text-[11px]">
                          {t.product_name}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-[#4A3525]">{t.quantity} box</td>
                      <td className="py-3 px-3 text-right font-bold text-[#7E4C23] font-serif">{formatIDR(t.total_price)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-4 border-t border-[#EAE2D5] flex items-center justify-between text-xs text-[#8C7A6B]">
            <span>Menampilkan 5 aktivitas kasir terkini</span>
            <button 
              onClick={() => setActiveTab('pos')}
              className="font-bold text-[#B47640] hover:underline"
            >
              + Catat Pesanan Baru
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
