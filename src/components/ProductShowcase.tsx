import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

type Timeframe = '30d' | '90d' | 'ytd';

interface MetricData {
  revenue: string;
  revenueChange: string;
  expenses: string;
  expensesNote: string;
  profit: string;
  profitMargin: string;
  transactions: string;
  transactionsNote: string;
  chartPath: string;
  chartArea: string;
  points: { cx: number; cy: number; label: string; value: string }[];
}

const TIMEFRAME_DATA: Record<Timeframe, MetricData> = {
  '30d': {
    revenue: '₦1.24M',
    revenueChange: '+14.2% vs last month',
    expenses: '₦420K',
    expensesNote: 'COGS, logistics & rent',
    profit: '₦820K',
    profitMargin: '66.1% net operating margin',
    transactions: '342',
    transactionsNote: '100% verified double-entry',
    chartPath: 'M 20 95 Q 140 80, 240 68 T 420 40 T 580 18',
    chartArea: 'M 20 95 Q 140 80, 240 68 T 420 40 T 580 18 L 580 120 L 20 120 Z',
    points: [
      { cx: 20, cy: 95, label: 'Week 1', value: '₦240K' },
      { cx: 160, cy: 80, label: 'Week 2', value: '₦290K' },
      { cx: 300, cy: 62, label: 'Week 3', value: '₦340K' },
      { cx: 440, cy: 38, label: 'Week 4', value: '₦370K' },
      { cx: 580, cy: 18, label: 'Current', value: '₦1.24M' },
    ],
  },
  '90d': {
    revenue: '₦3.68M',
    revenueChange: '+28.4% quarter-over-quarter',
    expenses: '₦1.28M',
    expensesNote: 'Suppliers & shipping bulk',
    profit: '₦2.40M',
    profitMargin: '65.2% average margin',
    transactions: '984',
    transactionsNote: '3-channel automated sync',
    chartPath: 'M 20 105 Q 140 90, 240 55 T 420 35 T 580 12',
    chartArea: 'M 20 105 Q 140 90, 240 55 T 420 35 T 580 12 L 580 120 L 20 120 Z',
    points: [
      { cx: 20, cy: 105, label: 'June', value: '₦980K' },
      { cx: 160, cy: 86, label: 'July', value: '₦1.12M' },
      { cx: 300, cy: 52, label: 'August', value: '₦1.34M' },
      { cx: 440, cy: 32, label: 'September', value: '₦1.24M' },
      { cx: 580, cy: 12, label: 'Quarter Total', value: '₦3.68M' },
    ],
  },
  'ytd': {
    revenue: '₦11.4M',
    revenueChange: '+42.1% annual trajectory',
    expenses: '₦4.1M',
    expensesNote: 'All operational expenditure',
    profit: '₦7.3M',
    profitMargin: '64.0% aggregate margin',
    transactions: '3,120',
    transactionsNote: 'Full financial year audit',
    chartPath: 'M 20 110 Q 140 95, 240 60 T 420 28 T 580 10',
    chartArea: 'M 20 110 Q 140 95, 240 60 T 420 28 T 580 10 L 580 120 L 20 120 Z',
    points: [
      { cx: 20, cy: 110, label: 'Q1', value: '₦2.8M' },
      { cx: 160, cy: 92, label: 'Q2', value: '₦3.4M' },
      { cx: 300, cy: 58, label: 'Q3', value: '₦4.1M' },
      { cx: 440, cy: 26, label: 'Q4 Run-rate', value: '₦4.9M' },
      { cx: 580, cy: 10, label: 'YTD Total', value: '₦11.4M' },
    ],
  },
};

export const ProductShowcase: React.FC = () => {
  const { isDark } = useTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('30d');
  const [activeQueryIndex, setActiveQueryIndex] = useState(0);
  const [costDataAvailable, setCostDataAvailable] = useState(true);

  const activeData = TIMEFRAME_DATA[timeframe];

  const topProducts = [
    { name: 'Black Shirt (Premium Cotton)', units: 84, revenue: '₦620,000', margin: '48.0%', share: '50%' },
    { name: 'Linen Boubou (Navy)', units: 28, revenue: '₦380,000', margin: '52.0%', share: '31%' },
    { name: 'Ankara Midi Dress', units: 22, revenue: '₦240,000', margin: '61.5%', share: '19%' },
  ];

  const recentActivity = [
    { title: 'Sale · 3 × Black Shirts', party: 'Ahmed (Walk-in)', amount: '+₦45,000', time: '12m ago', isPositive: true },
    { title: 'Restock · Fabric Rolls', party: 'Kano Wholesalers', amount: '-₦95,000', time: '1h ago', isPositive: false },
    { title: 'Credit Settled · Invoice #84', party: 'Chioma Okeke', amount: '+₦150,000', time: '3h ago', isPositive: true },
    { title: 'POS Slip · Retail Cashier', party: 'Card Terminal #0981', amount: '+₦24,500', time: '5h ago', isPositive: true },
  ];

  const aiQueries = [
    {
      question: "Which product made me the most money?",
      getAnswer: (hasCost: boolean) => 
        hasCost 
          ? "Black Shirt generated the highest recorded gross profit (₦297,600 on ₦620,000 revenue with a 48.0% margin across 84 units)."
          : "I can compare revenue, but your product costs aren't set yet. Add product costs to calculate true gross profit.",
      badge: costDataAvailable ? "Verified Gross Profit" : "Cost Pending",
    },
    {
      question: "Do I have any overdue customer debt?",
      getAnswer: () => "Only 1 outstanding balance: Alhaji Musa owes ₦65,000 from Friday for lace. Chioma Okeke settled her ₦150,000 balance 3 hours ago.",
      badge: "Credit Reconciliation",
    },
    {
      question: "How does this month compare to last month?",
      getAnswer: () => "Revenue is up +14.2% (₦1.24M vs ₦1.08M). Operating expenses grew by only 4.1%, expanding net margin from 62.8% to 66.1%.",
      badge: "Operating Trajectory",
    }
  ];

  const activeQuery = aiQueries[activeQueryIndex];

  return (
    <section
      id="product"
      className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
        isDark ? 'bg-[#10251E] text-white border-[#1C3E32]' : 'bg-[#F7F6F0] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      {/* Background data ambient illumination */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-25' : 'bg-grid-light opacity-50'}`} />
      <div className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[360px] rounded-full blur-[140px] pointer-events-none ${
        isDark ? 'bg-[#B8F36B]/5' : 'bg-[#B8F36B]/15'
      }`} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-2xl mb-14 sm:mb-16">
          <div className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-widest uppercase mb-3 font-mono ${
            isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#B8F36B]' : 'bg-[#10251E]'}`} />
            <span>FINANCIAL INTELLIGENCE DASHBOARD</span>
          </div>

          <h2 
            className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-medium tracking-tight leading-[1.1] mb-3 ${
              isDark ? 'text-white' : 'text-[#111916]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            See the full picture of your business.
          </h2>

          <p className={`text-base sm:text-lg font-normal max-w-lg font-sans ${
            isDark ? 'text-slate-300' : 'text-[#69746F]'
          }`}>
            Track revenue, expenses, estimated profit, transactions and insights — all in one unified operating view.
          </p>
        </div>

        {/* Large Reference-Grade Dashboard Console */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className={`rounded-3xl p-5 sm:p-8 shadow-2xl relative overflow-hidden border ${
            isDark ? 'bg-[#08110F] border-[#1E3B30] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
          }`}
        >
          {/* Top edge subtle highlight */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#B8F36B]/25 to-transparent" />

          {/* Dashboard Header Bar */}
          <div className={`flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b gap-4 ${
            isDark ? 'border-[#182F26]' : 'border-[#EAEFEA]'
          }`}>
            <div className="flex items-center gap-3">
              <KopaLogo variant="symbol" theme={isDark ? 'dark' : 'light'} size="sm" />
              <div>
                <div className={`text-sm font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                  <span>Amina Fashion</span>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>· Lagos Hub</span>
                </div>
                <div className={`text-xs font-mono ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'}`}>
                  Live operating ledger
                </div>
              </div>
            </div>

            {/* Timeframe Filter Tabs */}
            <div 
              role="tablist"
              aria-label="Revenue Timeframe"
              className={`flex items-center gap-1.5 p-1 rounded-xl border ${
                isDark ? 'bg-[#10251E] border-[#1A382C]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
              }`}
            >
              {(['30d', '90d', 'ytd'] as Timeframe[]).map((tf) => (
                <button
                  key={tf}
                  role="tab"
                  aria-selected={timeframe === tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none min-h-[36px] flex items-center ${
                    timeframe === tf
                      ? 'bg-[#B8F36B] text-[#08110F] font-bold shadow-xs'
                      : isDark
                      ? 'text-slate-300 hover:text-white hover:bg-white/5'
                      : 'text-[#69746F] hover:text-[#111916] hover:bg-black/5'
                  }`}
                >
                  {tf === '30d' ? 'Last 30 Days' : tf === '90d' ? 'Last 90 Days' : 'Year to Date'}
                </button>
              ))}
            </div>
          </div>

          {/* Four Key Metrics Cards (Revenue, Expenses, Estimated Profit, Transactions) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#0E1F1A] border-[#183126]' : 'bg-[#F7F6F0] border-[#DEE3DE]'}`}
            >
              <span className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                Revenue
              </span>
              <span className={`text-2xl sm:text-3xl font-heading font-semibold tabular-nums block ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                {activeData.revenue}
              </span>
              <span className={`text-xs font-semibold block mt-1 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                {activeData.revenueChange}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#0E1F1A] border-[#183126]' : 'bg-[#F7F6F0] border-[#DEE3DE]'}`}
            >
              <span className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                Expenses
              </span>
              <span className={`text-2xl sm:text-3xl font-heading font-semibold tabular-nums block ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                {activeData.expenses}
              </span>
              <span className={`text-xs block mt-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                {activeData.expensesNote}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#0E1F1A] border-[#183126]' : 'bg-[#F7F6F0] border-[#DEE3DE]'}`}
            >
              <span className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                Estimated Profit
              </span>
              <span className={`text-2xl sm:text-3xl font-heading font-semibold tabular-nums block ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                {activeData.profit}
              </span>
              <span className={`text-xs font-medium block mt-1 ${isDark ? 'text-slate-300' : 'text-[#48534E]'}`}>
                {activeData.profitMargin}
              </span>
            </motion.div>

            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] } }}
              className={`p-4 sm:p-5 rounded-2xl border ${isDark ? 'bg-[#0E1F1A] border-[#183126]' : 'bg-[#F7F6F0] border-[#DEE3DE]'}`}
            >
              <span className={`text-[11px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                Transactions
              </span>
              <span className={`text-2xl sm:text-3xl font-heading font-semibold tabular-nums block ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                {activeData.transactions}
              </span>
              <span className={`text-xs block mt-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                {activeData.transactionsNote}
              </span>
            </motion.div>
          </div>

          {/* Monthly Revenue Trajectory Chart */}
          <div className={`mb-8 p-5 sm:p-6 rounded-2xl border ${isDark ? 'bg-[#0E1F1A] border-[#183126]' : 'bg-[#F7F6F0] border-[#DEE3DE]'}`}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className={`text-sm font-semibold block ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                  Business Activity & Revenue Trajectory
                </span>
                <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                  Real-time transaction volume curve
                </span>
              </div>
              <span className={`text-xs font-mono font-semibold px-2.5 py-1 rounded border ${
                isDark
                  ? 'text-[#B8F36B] bg-[#B8F36B]/10 border-[#B8F36B]/20'
                  : 'text-[#15803D] bg-[#15803D]/10 border-[#15803D]/25'
              }`}>
                Peak: {activeData.revenue}
              </span>
            </div>

            {/* SVG Drawing Chart */}
            <div className="h-44 w-full relative">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 130" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="revenueGradTheme" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={isDark ? "#B8F36B" : "#15803D"} stopOpacity={isDark ? "0.25" : "0.15"} />
                    <stop offset="100%" stopColor={isDark ? "#B8F36B" : "#15803D"} stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Subtle horizontal grid lines */}
                <line x1="0" y1="30" x2="600" y2="30" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} strokeDasharray="3 3" />
                <line x1="0" y1="75" x2="600" y2="75" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="600" y2="120" stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)"} strokeDasharray="3 3" />

                {/* Area under curve */}
                <path
                  d={activeData.chartArea}
                  fill="url(#revenueGradTheme)"
                  className="transition-all duration-500 ease-out"
                />

                {/* Main line */}
                <path
                  d={activeData.chartPath}
                  fill="none"
                  stroke={isDark ? "#B8F36B" : "#15803D"}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  className="transition-all duration-500 ease-out"
                />

                {/* Data points */}
                {activeData.points.map((pt, idx) => (
                  <g key={idx} className="transition-all duration-500 ease-out">
                    <circle
                      cx={pt.cx}
                      cy={pt.cy}
                      r={idx === activeData.points.length - 1 ? 5 : 3.5}
                      fill={idx === activeData.points.length - 1 ? isDark ? "#B8F36B" : "#15803D" : isDark ? "#08110F" : "#FFFFFF"}
                      stroke={isDark ? "#B8F36B" : "#15803D"}
                      strokeWidth="2"
                    />
                  </g>
                ))}
              </svg>

              <div className={`flex justify-between text-[11px] font-mono mt-2 px-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                {activeData.points.map((pt, idx) => (
                  <span key={idx}>
                    {pt.label} ({pt.value})
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sub-grid: Top Products & Recent Business Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
            
            {/* Top Products */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between mb-3.5">
                <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                  Top Products
                </span>
                <span className={`text-xs font-mono font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>By Recorded Revenue</span>
              </div>

              <div className="space-y-2.5">
                {topProducts.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between transition-colors ${
                      isDark ? 'bg-[#0E1F1A] border-[#183126] hover:border-[#1E3B30]' : 'bg-[#F7F6F0] border-[#DEE3DE] hover:border-[#CED4CE]'
                    }`}
                  >
                    <div>
                      <div className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                        {p.name}
                      </div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                        {p.units} units sold · {p.margin} margin
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs sm:text-sm font-semibold tabular-nums ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                        {p.revenue}
                      </div>
                      <div className={`text-[10px] font-mono font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                        {p.share} of total
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Business Activity */}
            <div className="lg:col-span-5">
              <div className="flex items-center justify-between mb-3.5">
                <span className={`text-xs font-semibold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                  Recent Activity
                </span>
                <span className={`text-xs font-mono font-semibold flex items-center gap-1 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                  <Clock className="w-3 h-3" /> Live
                </span>
              </div>

              <div className="space-y-2.5">
                {recentActivity.map((act, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border flex items-center justify-between ${
                      isDark ? 'bg-[#0E1F1A] border-[#183126]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                    }`}
                  >
                    <div>
                      <div className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                        {act.title}
                      </div>
                      <div className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                        {act.party}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xs font-semibold tabular-nums ${
                        act.isPositive
                          ? isDark ? 'text-[#B8F36B]' : 'text-[#15803D] font-bold'
                          : isDark ? 'text-slate-400' : 'text-[#48534E]'
                      }`}>
                        {act.amount}
                      </div>
                      <div className={`text-[10px] font-mono ${isDark ? 'text-slate-500' : 'text-[#69746F]'}`}>
                        {act.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* 
            Interactive "Ask Kopa" Interface with true ChatGPT UI Styling
            - Stationary container that does not shift away
            - Clean prompt selector pills
            - Conversational user message bubble & assistant markdown response
            - Crisp contrast in both light mode and dark mode
          */}
          <div
            className={`rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
              isDark
                ? 'bg-[#0E1F1A] border-[#1C382E] text-white'
                : 'bg-white border-[#DEE3DE] text-[#111916]'
            }`}
          >
            {/* ChatGPT-Style Pinned Top Bar */}
            <div
              className={`flex flex-col sm:flex-row sm:items-center justify-between px-5 sm:px-6 py-3.5 border-b gap-3 transition-colors ${
                isDark ? 'bg-[#08110F]/70 border-[#182E26]' : 'bg-[#F7F6F0]/80 border-[#DEE3DE]'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#08110F] border border-[#1C382E] text-white shadow-xs">
                  <KopaLogo variant="symbol" theme="dark" size="sm" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-heading font-semibold text-[#111916] dark:text-white">
                      Ask Kopa
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#15803D] dark:bg-[#B8F36B] animate-pulse" />
                    <span className="text-[10px] font-mono text-[#69746F] dark:text-slate-400">
                      GPT Engine · Live Context
                    </span>
                  </div>
                </div>
              </div>

              {/* Cost data condition toggle */}
              <div className="flex items-center gap-2 text-xs font-sans">
                <span className="text-[#69746F] dark:text-slate-400 text-[11px]">Cost data:</span>
                <button
                  type="button"
                  onClick={() => setCostDataAvailable(!costDataAvailable)}
                  className={`text-[11px] px-2.5 py-1 rounded-md border font-mono cursor-pointer transition-colors ${
                    costDataAvailable
                      ? isDark
                        ? 'bg-[#B8F36B]/15 text-[#B8F36B] border-[#B8F36B]/30'
                        : 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/25 font-semibold'
                      : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 font-semibold'
                  }`}
                >
                  {costDataAvailable ? '✓ Unit Costs Configured' : '⚠ Costs Not Set'}
                </button>
              </div>
            </div>

            {/* Main Interactive Chat Flow Area */}
            <div className="p-5 sm:p-6 space-y-4">
              {/* Quick Prompt Selector Chips (ChatGPT Style) */}
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-[#69746F] dark:text-slate-400 mb-2">
                  Suggested Queries
                </p>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Exploration questions">
                  {aiQueries.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-pressed={activeQueryIndex === idx}
                      onClick={() => setActiveQueryIndex(idx)}
                      className={`text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer font-sans min-h-[36px] flex items-center focus-visible:ring-2 focus-visible:ring-[#15803D] dark:focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                        activeQueryIndex === idx
                          ? isDark
                            ? 'bg-[#B8F36B] text-[#08110F] border-[#B8F36B] font-semibold shadow-xs'
                            : 'bg-[#10251E] text-white border-[#10251E] font-semibold shadow-xs'
                          : isDark
                          ? 'bg-[#08110F] text-slate-300 border-[#1B352B] hover:text-white hover:border-[#214739]'
                          : 'bg-[#F7F6F0] text-[#111916] border-[#DEE3DE] hover:bg-black/5 hover:border-black/20'
                      }`}
                    >
                      "{q.question}"
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Thread: User Message + Assistant Response */}
              <div className="pt-2 space-y-3">
                {/* User Message Bubble */}
                <div className="flex justify-end">
                  <div className="bg-[#10251E] dark:bg-[#1E3B30] text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-sans max-w-[85%] sm:max-w-[75%] shadow-xs">
                    <p>"{activeQuery.question}"</p>
                  </div>
                </div>

                {/* Assistant Response Bubble */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeQueryIndex}-${costDataAvailable}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`p-4 rounded-2xl border flex items-start gap-3 text-xs sm:text-sm ${
                      isDark
                        ? 'bg-[#08110F] border-[#1E3B30] text-slate-100'
                        : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-[#08110F] border border-[#1C382E] text-white shadow-xs mt-0.5">
                      <KopaLogo variant="symbol" theme="dark" size="sm" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <strong className="text-xs sm:text-sm font-semibold text-[#111916] dark:text-white">
                          Kopa Assistant
                        </strong>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                          costDataAvailable || activeQueryIndex !== 0
                            ? isDark
                              ? 'text-[#B8F36B] bg-[#B8F36B]/15 border-[#B8F36B]/30'
                              : 'text-[#15803D] bg-[#15803D]/10 border-[#15803D]/25'
                            : 'text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/30'
                        }`}>
                          {activeQuery.badge}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-[#111916] dark:text-slate-200 leading-relaxed font-sans">
                        {activeQuery.getAnswer(costDataAvailable)}
                      </p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Stationary Simulated ChatGPT Prompt Capsule */}
              <div
                className={`pt-2 flex items-center gap-2 p-2 rounded-2xl border ${
                  isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
                }`}
              >
                <div className="flex-1 px-3 py-1 text-xs text-[#69746F] dark:text-slate-400 font-sans truncate">
                  Ask Kopa or record transactions naturally…
                </div>
                <button
                  type="button"
                  onClick={() => setActiveQueryIndex((activeQueryIndex + 1) % aiQueries.length)}
                  className="px-3 py-1.5 rounded-xl bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer shrink-0"
                >
                  Next Query →
                </button>
              </div>
            </div>
          </div>

        </motion.div>

      </div>
    </section>
  );
};
