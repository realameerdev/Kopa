import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  ShoppingBag, 
  ArrowDownRight, 
  Calendar, 
  UserCheck, 
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const InsightsPreview: React.FC = () => {
  const { isDark } = useTheme();
  const [timeRange, setTimeRange] = useState<'30d' | '90d' | 'ytd'>('30d');

  const rangeData = {
    '30d': {
      revenue: '₦6,840,000',
      revenueChange: '+18.4% vs last month',
      expenses: '₦3,920,000',
      expensesDetail: 'COGS: ₦2.66M · Ops: ₦1.26M',
      profit: '₦2,920,000',
      margin: '42.7% net margin',
      transactions: '342',
      transactionsDetail: 'Avg order ₦20,000',
    },
    '90d': {
      revenue: '₦19,450,000',
      revenueChange: '+32.1% quarterly growth',
      expenses: '₦11,280,000',
      expensesDetail: 'COGS: ₦7.8M · Ops: ₦3.48M',
      profit: '₦8,170,000',
      margin: '42.0% net margin',
      transactions: '1,014',
      transactionsDetail: 'Avg order ₦19,180',
    },
    'ytd': {
      revenue: '₦48,200,000',
      revenueChange: 'Annual run-rate ₦64M',
      expenses: '₦28,100,000',
      expensesDetail: 'COGS: ₦19.4M · Ops: ₦8.7M',
      profit: '₦20,100,000',
      margin: '41.7% net margin',
      transactions: '2,480',
      transactionsDetail: 'Avg order ₦19,435',
    }
  };

  const current = rangeData[timeRange];

  const topProducts = [
    { name: 'Linen Boubou (Navy & Emerald)', sku: 'APP-LB-01', units: 48, revenue: '₦2,400,000', margin: '50.0%', stock: '6 left (Reorder)' },
    { name: 'Ankara Midi Dress (Floral Gold)', sku: 'APP-AMD-04', units: 62, revenue: '₦1,860,000', margin: '61.5%', stock: '24 in stock' },
    { name: 'Tailored Chino Trousers', sku: 'APP-TCT-09', units: 46, revenue: '₦1,380,000', margin: '38.0%', stock: '18 in stock' },
    { name: 'Silk Jacquard Kaftan', sku: 'APP-SJK-02', units: 20, revenue: '₦1,200,000', margin: '52.0%', stock: '12 in stock' },
  ];

  const recentTransactions = [
    { title: 'Sale · 2 × Linen Boubou', customer: 'Fatima Al-Hassan (Abuja)', channel: 'WhatsApp', amount: '+₦100,000', time: '14 min ago' },
    { title: 'Expense · Generator Diesel 50L', customer: 'Mobil Filling Station (Opebi)', channel: 'Cash Receipt', amount: '-₦52,500', time: '42 min ago' },
    { title: 'Credit Settled · Invoice #291', customer: 'Alhaji Musa (Kano)', channel: 'Bank Alert (Zenith)', amount: '+₦180,000', time: '2 hours ago' },
  ];

  return (
    <section id="insights" className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
      isDark ? 'bg-[#07111F] text-[#F8FBFF] border-[#243B56]' : 'bg-[#F7FAFC] text-[#0F172A] border-[#DCE6F0]'
    }`}>
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-20' : 'bg-grid-light opacity-40'}`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase mb-3 ${
            isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#60A5FA]' : 'bg-[#2563EB]'}`} />
            <span>Financial Intelligence</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium tracking-tight leading-[1.12] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Clear financial clarity without accounting jargon.
          </h2>

          <p 
            className={`text-base sm:text-lg leading-relaxed font-normal ${
              isDark ? 'text-slate-300' : 'text-[#475569]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            No complex formulas or bookkeeping gymnastics. Kopa delivers instant visibility into what you earned, what you spent, and where your margins are moving.
          </p>
        </div>

        {/* Dashboard Preview Frame */}
        <div className={`rounded-2xl border shadow-xl p-5 sm:p-8 relative ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
        }`}>
          
          {/* Dashboard Control Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b gap-4 ${
            isDark ? 'border-[#243B56]' : 'border-[#DCE6F0]'
          }`}>
            <div>
              <div className={`text-xs font-mono font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Business Overview</div>
              <div className="text-lg font-heading font-semibold">
                Ameer Fashion · Executive Summary
              </div>
            </div>

            {/* Time Filter Segmented Control */}
            <div className={`inline-flex items-center gap-1 p-1 rounded-xl border self-start sm:self-auto ${
              isDark ? 'bg-[#07111F] border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
            }`}>
              {(['30d', '90d', 'ytd'] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeRange(r)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    timeRange === r
                      ? isDark
                        ? 'bg-[#132640] text-white shadow-xs font-bold'
                        : 'bg-white text-[#0F172A] shadow-xs font-bold'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-[#475569] hover:text-[#0F172A]'
                  }`}
                >
                  {r === '30d' ? 'Last 30 Days' : r === '90d' ? 'Last 90 Days' : 'Year to Date'}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Core Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className={`p-4 sm:p-5 rounded-xl border ${
              isDark ? 'bg-[#132640]/40 border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
            }`}>
              <span className={`text-xs block mb-1 font-mono ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Gross Revenue</span>
              <span className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tight block">
                {current.revenue}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                {current.revenueChange}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border ${
              isDark ? 'bg-[#132640]/40 border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
            }`}>
              <span className={`text-xs block mb-1 font-mono ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Total Operating Costs</span>
              <span className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tight block">
                {current.expenses}
              </span>
              <span className={`text-xs block mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                {current.expensesDetail}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border ${
              isDark ? 'bg-[#132640]/40 border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
            }`}>
              <span className={`text-xs block mb-1 font-mono ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Net Operating Profit</span>
              <span className="text-2xl sm:text-3xl font-heading font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums tracking-tight block">
                {current.profit}
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                {current.margin}
              </span>
            </div>

            <div className={`p-4 sm:p-5 rounded-xl border ${
              isDark ? 'bg-[#132640]/40 border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
            }`}>
              <span className={`text-xs block mb-1 font-mono ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Logged Transactions</span>
              <span className="text-2xl sm:text-3xl font-heading font-semibold tabular-nums tracking-tight block">
                {current.transactions}
              </span>
              <span className={`text-xs block mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                {current.transactionsDetail}
              </span>
            </div>
          </div>

          {/* Sub-grid: Top Products & Recent Live Ledger Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Top Products Table */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-heading font-semibold">
                  Top Revenue Products
                </h3>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Sorted by gross contribution</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className={`border-b text-[#64748B] dark:text-slate-400 ${isDark ? 'border-[#243B56]' : 'border-[#DCE6F0]'}`}>
                      <th className="pb-2.5 font-medium">Product</th>
                      <th className="pb-2.5 font-medium tabular-nums text-right">Units</th>
                      <th className="pb-2.5 font-medium tabular-nums text-right">Revenue</th>
                      <th className="pb-2.5 font-medium tabular-nums text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${isDark ? 'divide-[#243B56]' : 'divide-[#DCE6F0]'}`}>
                    {topProducts.map((p) => (
                      <tr key={p.sku} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3">
                          <div className="font-semibold">{p.name}</div>
                          <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>{p.stock}</div>
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums">
                          {p.units}
                        </td>
                        <td className="py-3 text-right font-heading font-bold tabular-nums">
                          {p.revenue}
                        </td>
                        <td className="py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {p.margin}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Ledger Activity */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-heading font-semibold">
                    Live Ledger Activity
                  </h3>
                  <div className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full animate-ping ${isDark ? 'bg-[#60A5FA]' : 'bg-[#2563EB]'}`} />
                    <span className="font-mono">Real-Time</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentTransactions.map((tx, i) => (
                    <div
                      key={i}
                      className={`p-3.5 rounded-xl border flex items-center justify-between ${
                        isDark ? 'bg-[#132640]/30 border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-semibold">{tx.title}</div>
                        <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                          {tx.customer} · <span className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{tx.channel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-heading font-bold tabular-nums ${
                          tx.amount.startsWith('+') ? 'text-emerald-600 dark:text-emerald-400' : isDark ? 'text-slate-300' : 'text-slate-700'
                        }`}>
                          {tx.amount}
                        </div>
                        <div className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-[#64748B]'}`}>{tx.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`mt-4 pt-3 border-t flex items-center justify-between text-xs ${
                isDark ? 'border-[#243B56] text-slate-400' : 'border-[#DCE6F0] text-[#64748B]'
              }`}>
                <span>All records verified & encrypted</span>
                <span className={`font-semibold ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>Double-Entry Invariant 100%</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
