import React, { useMemo } from 'react';
import { 
  DollarSign, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  ArrowUpRight, 
  Sparkles,
  Calendar,
  Store,
  ChevronRight
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
  // 1. Calculate Core Metrics
  const metrics = useMemo(() => {
    let totalRevenue = 0;
    let totalQty = 0;
    const txCount = transactions.length;

    transactions.forEach(t => {
      totalRevenue += Number(t.total_price) || 0;
      totalQty += Number(t.quantity) || 0;
    });

    const aov = txCount > 0 ? Math.round(totalRevenue / txCount) : 0;

    return {
      totalRevenue,
      totalQty,
      txCount,
      aov
    };
  }, [transactions]);

  // 2. Format Currency
  const formatIDR = (val) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // 3. Monthly Sales Aggregation
  const monthlyData = useMemo(() => {
    const months = {};
    const monthOrder = [
      '2025-11', '2025-12', '2026-01', '2026-02', 
      '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'
    ];

    const monthNames = {
      '2025-11': 'Nov 2025',
      '2025-12': 'Des 2025',
      '2026-01': 'Jan 2026',
      '2026-02': 'Feb 2026',
      '2026-03': 'Mar 2026',
      '2026-04': 'Apr 2026',
      '2026-05': 'Mei 2026',
      '2026-06': 'Jun 2026',
      '2026-07': 'Jul 2026'
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

  // 4. Product Sales Distribution (Donut)
  const productData = useMemo(() => {
    const counts = {};
    transactions.forEach(t => {
      const p = t.product_name || 'Lainnya';
      counts[p] = (counts[p] || 0) + (Number(t.quantity) || 0);
    });

    const labels = Object.keys(counts);
    const data = Object.values(counts);

    return {
      labels,
      data
    };
  }, [transactions]);

  // 5. Channel Breakdown (Bazar, Reseller, Pesantren, etc.)
  const channelBreakdown = useMemo(() => {
    const channels = {};
    transactions.forEach(t => {
      let ch = 'Umum';
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

  // Bar Chart Config
  const barChartConfig = {
    data: {
      labels: monthlyData.labels,
      datasets: [
        {
          label: 'Total Penjualan (Rp)',
          data: monthlyData.revenues,
          backgroundColor: 'rgba(213, 96, 117, 0.85)',
          hoverBackgroundColor: 'rgba(190, 68, 91, 1)',
          borderRadius: 8,
          borderSkipped: false,
          yAxisID: 'y'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { size: 13, family: 'Inter' },
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
          ticks: { font: { size: 11 } }
        },
        y: {
          grid: { color: '#f1f5f9' },
          ticks: {
            font: { size: 10 },
            callback: (v) => 'Rp ' + (v >= 1000000 ? (v / 1000000).toFixed(1) + 'M' : (v / 1000) + 'k')
          }
        }
      }
    }
  };

  // Donut Chart Config
  const doughnutConfig = {
    data: {
      labels: productData.labels,
      datasets: [
        {
          data: productData.data,
          backgroundColor: [
            '#d56075', // Brand Rose
            '#3b82f6', // Blue
            '#f59e0b', // Amber
            '#10b981', // Emerald
            '#8b5cf6'  // Purple
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
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
            boxWidth: 12,
            padding: 14,
            font: { size: 11, family: 'Inter' }
          }
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} pcs`
          }
        }
      },
      cutout: '68%'
    }
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        {/* Total Omset */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Omset</span>
            <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
              {formatIDR(metrics.totalRevenue)}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp size={14} />
              <span>Rekap Penjualan Historis</span>
            </p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-brand-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Terjual */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Produk Terjual</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Package size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
              {metrics.totalQty.toLocaleString('id-ID')} <span className="text-sm font-semibold text-slate-500">pcs</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Dessert Box & Cheesecake
            </p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-blue-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Total Transaksi */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Transaksi</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingCart size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
              {metrics.txCount} <span className="text-sm font-semibold text-slate-500">transaksi</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Terdata dari TX-001 ke atas
            </p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-amber-50/50 rounded-full blur-xl pointer-events-none" />
        </div>

        {/* Rata-Rata Penjualan */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rata-rata Order</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-black text-slate-900 font-['Outfit']">
              {formatIDR(metrics.aov)}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Nilai per transaksi (AOV)
            </p>
          </div>
          <div className="absolute -bottom-2 -right-2 w-16 h-16 bg-emerald-50/50 rounded-full blur-xl pointer-events-none" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Penjualan Bulanan (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 font-['Outfit']">
                Grafik Tren Penjualan
              </h4>
              <p className="text-xs text-slate-500">Omset penjualan per bulan (Nov 2025 - Jul 2026)</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 text-brand-700 rounded-lg">
              Bulanan
            </span>
          </div>
          <div className="h-72 w-full">
            <Bar data={barChartConfig.data} options={barChartConfig.options} />
          </div>
        </div>

        {/* Proporsi Produk (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="font-bold text-base text-slate-900 font-['Outfit']">
              Proporsi Produk Terjual
            </h4>
            <p className="text-xs text-slate-500">Persentase perbandingan kuantitas produk</p>
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[240px]">
            <Doughnut data={doughnutConfig.data} options={doughnutConfig.options} />
          </div>
        </div>
      </div>

      {/* Breakdown Channels & Recent Transactions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Breakdown (1 col) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 font-['Outfit']">
                Kanal Penjualan
              </h4>
              <p className="text-xs text-slate-500">Peringkat omset per kategori channel</p>
            </div>
            <Store size={18} className="text-slate-400" />
          </div>
          <div className="space-y-3.5">
            {channelBreakdown.map((ch, idx) => {
              const pct = Math.round((ch.revenue / (metrics.totalRevenue || 1)) * 100);
              return (
                <div key={ch.name} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-800 mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      {ch.name}
                    </span>
                    <span className="font-bold text-slate-900">{formatIDR(ch.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                    <span>{ch.count} Transaksi</span>
                    <span>{ch.qty} pcs ({pct}%)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transaksi Terbaru (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-bold text-base text-slate-900 font-['Outfit']">
                Transaksi Terbaru
              </h4>
              <p className="text-xs text-slate-500">5 transaksi terakhir yang tercatat di sistem</p>
            </div>
            <button
              onClick={() => setActiveTab('transactions')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 hover:underline"
            >
              <span>Lihat Semua ({transactions.length})</span>
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase font-bold text-slate-400 bg-slate-50/80 border-y border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Kode</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Produk</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transactions.slice(0, 5).map((t) => (
                  <tr key={t.id || t.code} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-brand-600">{t.code}</td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">{t.transaction_date}</td>
                    <td className="py-3 px-3 font-medium text-slate-900">{t.customer_name}</td>
                    <td className="py-3 px-3 text-slate-700">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-medium">
                        {t.product_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-800">{t.quantity} pcs</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{formatIDR(t.total_price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
