import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Sparkles, Send, ArrowRight, UserCheck, AlertTriangle, TrendingUp, PackageCheck } from 'lucide-react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

interface AIQuery {
  id: string;
  question: string;
  category: string;
  response: {
    leadSummary: string;
    metrics?: { label: string; value: string; detail?: string; color?: string }[];
    listItems?: { title: string; subtitle: string; tag?: string; tagColor?: string }[];
    recommendation: string;
  };
}

const AI_QUERIES: AIQuery[] = [
  {
    id: 'monthly-profit',
    question: 'How much did I make this month?',
    category: 'Financial Health',
    response: {
      leadSummary: 'In the last 30 days, your business generated ₦6,840,000 in gross revenue across 342 transactions. After direct inventory costs, logistics, and store running expenses, your net operating profit is ₦2,920,000 (42.7% margin).',
      metrics: [
        { label: 'Gross Revenue', value: '₦6,840,000', detail: '+18.4% vs last month', color: 'text-white' },
        { label: 'Operating Costs', value: '₦3,920,000', detail: 'COGS + Logistics + Power', color: 'text-slate-300' },
        { label: 'Net Operating Profit', value: '₦2,920,000', detail: '42.7% net margin', color: 'text-[#60A5FA]' },
      ],
      recommendation: 'Your cash conversion cycle improved from 14 days to 9 days. You have ₦1.8M in liquid operating reserves.'
    }
  },
  {
    id: 'debtors-list',
    question: 'Who still owes me money?',
    category: 'Receivables & Credit',
    response: {
      leadSummary: 'You have ₦480,000 in uncollected customer credit across 4 client accounts. Alhaji Musa is currently past the agreed settlement date.',
      listItems: [
        { title: 'Alhaji Musa (Kano Trade)', subtitle: '₦180,000 balance · Overdue by 4 days', tag: 'Action Needed', tagColor: 'text-amber-400 bg-amber-400/10' },
        { title: 'Mama Ronke Boutique', subtitle: '₦150,000 balance · Due this Friday (Promised bank transfer)', tag: 'Upcoming', tagColor: 'text-slate-300 bg-white/5' },
        { title: 'Blessing Store Wuse', subtitle: '₦95,000 balance · Due in 5 days', tag: 'On Track', tagColor: 'text-[#60A5FA] bg-[#60A5FA]/10' },
        { title: 'Tunde Tailors', subtitle: '₦55,000 balance · Due next week', tag: 'On Track', tagColor: 'text-[#60A5FA] bg-[#60A5FA]/10' },
      ],
      recommendation: 'Kopa has prepared a polite WhatsApp reminder for Alhaji Musa ready for your one-click approval.'
    }
  },
  {
    id: 'top-product',
    question: "What's my best-selling product?",
    category: 'Inventory Velocity',
    response: {
      leadSummary: 'Your #1 revenue generator is the Linen Boubou (₦2,400,000 total across 48 units sold). However, your highest margin item is the Ankara Midi Dress at 61.5% profit margin.',
      metrics: [
        { label: 'Top Revenue Product', value: 'Linen Boubou', detail: '₦2,400,000 total sales', color: 'text-white' },
        { label: 'Highest Margin Item', value: 'Ankara Midi Dress', detail: '61.5% gross profit margin', color: 'text-[#60A5FA]' },
        { label: 'Stock Warning', value: '6 units left', detail: 'Critical restock threshold', color: 'text-amber-400' },
      ],
      recommendation: 'At current sales velocity of 2.4 units/day, Linen Boubou will stock out in 48 hours. Suggest reordering 30 units today.'
    }
  },
  {
    id: 'profit-drop',
    question: 'Why did my profit drop this month?',
    category: 'Margin Diagnostics',
    response: {
      leadSummary: 'Your sales volume held steady at ₦5.1M, but your net margin contracted from 44% to 32% due to two specific cost spikes.',
      listItems: [
        { title: 'Generator Fuel & Utility Surge', subtitle: '₦420,000 spent on diesel (+68% due to neighborhood grid downtime)', tag: 'Cost Spike', tagColor: 'text-amber-400 bg-amber-400/10' },
        { title: 'Unbilled Interstate Logistics', subtitle: '₦210,000 incurred in courier surcharges for Abuja deliveries not passed to clients', tag: 'Leakage', tagColor: 'text-rose-400 bg-rose-400/10' },
      ],
      recommendation: 'Introducing a standard ₦2,500 interstate delivery fee will immediately restore your net margin to 41.5% without hurting conversion.'
    }
  }
];

export const AISection: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedId, setSelectedId] = useState<string>('monthly-profit');
  const [isTypingQuery, setIsTypingQuery] = useState(false);

  const activeQuery = AI_QUERIES.find((q) => q.id === selectedId) || AI_QUERIES[0];

  const handleSelectQuery = (id: string) => {
    if (id === selectedId) return;
    setIsTypingQuery(true);
    setSelectedId(id);
    setTimeout(() => {
      setIsTypingQuery(false);
    }, 250);
  };

  return (
    <section id="ai-assistant" className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
      isDark ? 'bg-[#07111F] text-[#F8FBFF] border-[#243B56]' : 'bg-[#F7FAFC] text-[#0F172A] border-[#DCE6F0]'
    }`}>
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-20' : 'bg-grid-light opacity-40'}`} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className={`inline-flex items-center gap-2 text-xs font-semibold tracking-wide uppercase mb-3 ${
            isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-[#60A5FA]' : 'bg-[#2563EB]'}`} />
            <span>Conversational Financial OS</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium tracking-tight leading-[1.12] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Your business, in plain English.
          </h2>

          <p 
            className={`text-base sm:text-lg leading-relaxed font-normal ${
              isDark ? 'text-slate-300' : 'text-[#475569]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            No complex formulas, no dashboard fatigue, and no waiting for an accountant at month-end. Ask Kopa the real questions that dictate whether your business thrives or struggles.
          </p>
        </div>

        {/* Interactive Query Assistant Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: 4 Prompt Questions */}
          <div className="lg:col-span-4 space-y-3">
            <div className={`text-xs font-semibold uppercase tracking-wider mb-2 ${
              isDark ? 'text-slate-400' : 'text-[#64748B]'
            }`}>
              Common Owner Inquiries
            </div>

            {AI_QUERIES.map((item) => {
              const isSelected = item.id === selectedId;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectQuery(item.id)}
                  className={`w-full text-left p-4 rounded-xl transition-all duration-150 cursor-pointer border ${
                    isSelected
                      ? isDark
                        ? 'bg-[#0D1B2E] border-[#60A5FA] shadow-md ring-1 ring-[#60A5FA]/20 translate-x-1 text-white'
                        : 'bg-white border-[#2563EB] shadow-md ring-1 ring-[#2563EB]/20 translate-x-1 text-[#0F172A]'
                      : isDark
                      ? 'bg-[#0D1B2E]/60 hover:bg-[#0D1B2E] border-[#243B56] text-slate-300'
                      : 'bg-white/80 hover:bg-white border-[#DCE6F0] text-[#475569]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
                      {item.category}
                    </span>
                    <span className={`text-[11px] font-medium ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`}>
                      {isSelected ? 'Active' : 'Ask'}
                    </span>
                  </div>
                  <div className="text-sm sm:text-[15px] font-heading font-semibold">
                    "{item.question}"
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right: Live Interactive Terminal Result */}
          <div className="lg:col-span-8">
            <div className="rounded-2xl bg-[#0D1B2E] text-white p-6 sm:p-8 border border-[#243B56] shadow-2xl relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#243B56]">
                <div className="flex items-center gap-2.5">
                  <KopaLogo variant="symbol" theme="dark" size="sm" />
                  <div>
                    <span className="text-sm font-heading font-semibold text-white block">
                      Kopa Financial Intelligence
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Grounded on your verified transaction history
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-[#60A5FA]">
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span className="font-mono">Real-Time Audit</span>
                </div>
              </div>

              {/* Chat Dialog Simulation */}
              <div className="space-y-6">
                {/* User Prompt */}
                <div className="flex items-start justify-end gap-3">
                  <div className="bg-[#102B4D] border border-[#243B56] rounded-2xl rounded-tr-xs px-4 py-3 max-w-md text-right">
                    <span className="text-xs text-[#60A5FA] block mb-0.5 font-mono">You asked</span>
                    <p className="text-sm sm:text-base font-semibold text-white">
                      "{activeQuery.question}"
                    </p>
                  </div>
                </div>

                {/* AI Response Container */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeQuery.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#07111F] border border-[#243B56] flex items-center justify-center shrink-0 mt-1 p-1">
                      <KopaLogo variant="symbol" theme="dark" size="sm" />
                    </div>

                    <div className="flex-1 space-y-4">
                      {/* Natural Language Lead */}
                      <p className="text-sm sm:text-[15px] text-slate-200 leading-relaxed font-normal">
                        {activeQuery.response.leadSummary}
                      </p>

                      {/* Optional Metrics Grid */}
                      {activeQuery.response.metrics && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {activeQuery.response.metrics.map((m, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-[#07111F] border border-[#243B56]">
                              <span className="text-[11px] text-slate-400 block mb-0.5 font-mono">
                                {m.label}
                              </span>
                              <span className={`text-base sm:text-lg font-heading font-bold block tabular-nums ${m.color || 'text-white'}`}>
                                {m.value}
                              </span>
                              {m.detail && (
                                <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                                  {m.detail}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Optional List Items */}
                      {activeQuery.response.listItems && (
                        <div className="space-y-2">
                          {activeQuery.response.listItems.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-lg bg-[#07111F] border border-[#243B56] flex items-center justify-between gap-3">
                              <div>
                                <div className="text-xs sm:text-sm font-semibold text-white">
                                  {item.title}
                                </div>
                                <div className="text-xs text-slate-400">
                                  {item.subtitle}
                                </div>
                              </div>
                              {item.tag && (
                                <span className={`text-[11px] px-2 py-0.5 rounded font-mono font-semibold shrink-0 ${item.tagColor}`}>
                                  {item.tag}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Actionable Executive Recommendation */}
                      <div className="p-3.5 rounded-xl bg-[#102B4D] border border-[#243B56] text-xs text-slate-200 flex items-start gap-2.5">
                        <Sparkles className="w-4 h-4 text-[#60A5FA] shrink-0 mt-0.5" />
                        <div>
                          <span className="font-semibold text-[#60A5FA]">Kopa Recommendation: </span>
                          <span>{activeQuery.response.recommendation}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Bottom Interactive Prompt Input Bar */}
              <div className="mt-8 pt-5 border-t border-[#243B56] flex items-center gap-3">
                <input
                  type="text"
                  readOnly
                  value="Ask any custom question about your cash, debts, or inventory..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-[#07111F] border border-[#243B56] rounded-lg text-slate-500 cursor-default"
                />
                <button
                  onClick={() => handleSelectQuery(AI_QUERIES[(AI_QUERIES.findIndex(q => q.id === selectedId) + 1) % AI_QUERIES.length].id)}
                  className="px-4 py-2.5 bg-[#60A5FA] hover:bg-[#3B82F6] text-[#07111F] text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  <span>Next Question</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
