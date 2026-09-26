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

export const InsightsPreview: React.FC = () => {
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
    <section id="insights" className="py-24 sm:py-32 bg-[#F7F8F5] text-[#07110F] relative overflow-hidden">
      <div className="absolute inset-0 bg-subtle-grid opacity-50 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#14A669] uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#19C37D]" />
            <span>Financial Intelligence</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-[#07110F] tracking-tight leading-[1.12] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Clear financial clarity without accounting jargon.
          </h2>

          <p 
            className="text-base sm:text-lg text-[#66706B] leading-relaxed font-normal"
            style={{ textWrap: 'balance' }}
          >
            No complex formulas or bookkeeping gymnastics. Kopa delivers instant visibility into what you earned, what you spent, and where your margins are moving.
          </p>
        </div>

        {/* Dashboard Preview Frame */}
        <div className="rounded-2xl bg-white border border-[#E3E7E1] shadow-xl p-5 sm:p-8 relative">
          
          {/* Dashboard Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-[#EBEFE9] gap-4">
            <div>
              <div className="text-xs text-[#66706B] font-medium">Business Overview</div>
              <div className="text-lg font-display font-bold text-[#07110F]">
                Ameer Fashion · Executive Summary
              </div>
            </div>

            {/* Time Filter Segmented Control */}
            <div className="inline-flex items-center gap-1 p-1 bg-[#F0F2ED] rounded-xl border border-[#E1E5DF] self-start sm:self-auto">
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === '30d'
                    ? 'bg-white text-[#07110F] shadow-xs'
                    : 'text-[#66706B] hover:text-[#07110F]'
                }`}
              >
                Last 30 Days
              </button>
              <button
                onClick={() => setTimeRange('90d')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === '90d'
                    ? 'bg-white text-[#07110F] shadow-xs'
                    : 'text-[#66706B] hover:text-[#07110F]'
                }`}
              >
                Last 90 Days
              </button>
              <button
                onClick={() => setTimeRange('ytd')}
                className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  timeRange === 'ytd'
                    ? 'bg-white text-[#07110F] shadow-xs'
                    : 'text-[#66706B] hover:text-[#07110F]'
                }`}
              >
                Year to Date
              </button>
            </div>
          </div>

          {/* 4 Core Financial Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="p-4 sm:p-5 rounded-xl bg-[#F7F8F5] border border-[#E3E7E1]">
              <span className="text-xs text-[#66706B] block mb-1">Gross Revenue</span>
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#07110F] tabular-nums tracking-tight block">
                {current.revenue}
              </span>
              <span className="text-xs text-[#14A669] font-medium block mt-1">
                {current.revenueChange}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#F7F8F5] border border-[#E3E7E1]">
              <span className="text-xs text-[#66706B] block mb-1">Total Operating Costs</span>
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#07110F] tabular-nums tracking-tight block">
                {current.expenses}
              </span>
              <span className="text-xs text-[#66706B] block mt-1">
                {current.expensesDetail}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#F7F8F5] border border-[#E3E7E1]">
              <span className="text-xs text-[#66706B] block mb-1">Net Operating Profit</span>
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#14A669] tabular-nums tracking-tight block">
                {current.profit}
              </span>
              <span className="text-xs text-[#14A669] font-medium block mt-1">
                {current.margin}
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-xl bg-[#F7F8F5] border border-[#E3E7E1]">
              <span className="text-xs text-[#66706B] block mb-1">Logged Transactions</span>
              <span className="text-2xl sm:text-3xl font-display font-extrabold text-[#07110F] tabular-nums tracking-tight block">
                {current.transactions}
              </span>
              <span className="text-xs text-[#66706B] block mt-1">
                {current.transactionsDetail}
              </span>
            </div>
          </div>

          {/* Sub-grid: Top Products & Recent Live Ledger Stream */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Top Products Table */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-display font-bold text-[#07110F]">
                  Top Revenue Products
                </h3>
                <span className="text-xs text-[#66706B]">Sorted by gross contribution</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#E3E7E1] text-[#66706B]">
                      <th className="pb-2.5 font-medium">Product</th>
                      <th className="pb-2.5 font-medium tabular-nums text-right">Units</th>
                      <th className="pb-2.5 font-medium tabular-nums text-right">Revenue</th>
                      <th className="pb-2.5 font-medium tabular-nums text-right">Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBEFE9]">
                    {topProducts.map((p) => (
                      <tr key={p.sku} className="hover:bg-[#F7F8F5]/60 transition-colors">
                        <td className="py-3">
                          <div className="font-semibold text-[#07110F]">{p.name}</div>
                          <div className="text-[11px] text-[#66706B]">{p.stock}</div>
                        </td>
                        <td className="py-3 text-right font-mono tabular-nums text-[#07110F]">
                          {p.units}
                        </td>
                        <td className="py-3 text-right font-display font-bold text-[#07110F] tabular-nums">
                          {p.revenue}
                        </td>
                        <td className="py-3 text-right font-semibold text-[#14A669] tabular-nums">
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
                  <h3 className="text-sm font-display font-bold text-[#07110F]">
                    Live Ledger Activity
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#14A669]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#19C37D] animate-ping" />
                    <span>Real-Time</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {recentTransactions.map((tx, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl bg-[#F7F8F5] border border-[#E3E7E1] flex items-center justify-between"
                    >
                      <div>
                        <div className="text-xs font-semibold text-[#07110F]">{tx.title}</div>
                        <div className="text-[11px] text-[#66706B]">
                          {tx.customer} · <span className="font-medium text-[#4A5550]">{tx.channel}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-display font-bold tabular-nums ${
                          tx.amount.startsWith('+') ? 'text-[#14A669]' : 'text-slate-700'
                        }`}>
                          {tx.amount}
                        </div>
                        <div className="text-[10px] text-[#66706B]">{tx.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#EBEFE9] flex items-center justify-between text-xs text-[#66706B]">
                <span>All records verified & encrypted</span>
                <span className="font-semibold text-[#14A669]">Double-Entry Invariant 100%</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
