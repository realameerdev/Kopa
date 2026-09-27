import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageCircle, 
  BookOpen, 
  CreditCard, 
  Smartphone, 
  Receipt, 
  MessageSquare,
  CheckCircle2, 
  ArrowRight,
  Database,
  Layers
} from 'lucide-react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

interface SourceNode {
  id: string;
  name: string;
  channel: string;
  icon: React.ReactNode;
  sample: string;
  structuredTag: string;
}

const NODES: SourceNode[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    channel: 'Voice notes & chats',
    icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />,
    sample: '"Send 4 bags rice to Surulere, ₦160,000 paid"',
    structuredTag: 'Sale: ₦160,000 · Deduct 4 bags inventory',
  },
  {
    id: 'notebook',
    name: 'Notebook',
    channel: 'Handwritten ledger',
    icon: <BookOpen className="w-4 h-4 text-[#D97706]" />,
    sample: '"Alhaji Musa took lace. Balance ₦65,000"',
    structuredTag: 'Receivable: Alhaji Musa · Due Friday',
  },
  {
    id: 'pos',
    name: 'POS',
    channel: 'Card slips & terminal',
    icon: <CreditCard className="w-4 h-4 text-[#0284C7]" />,
    sample: 'Terminal #0981 · ₦24,500 Approved',
    structuredTag: 'Settlement: ₦24,500 matched to bank',
  },
  {
    id: 'bank-alerts',
    name: 'Bank alerts',
    channel: 'SMS & push credits',
    icon: <Smartphone className="w-4 h-4 text-[#7C3AED]" />,
    sample: 'Credit: ₦420,000 from K. Adebayo',
    structuredTag: 'Invoice #291 fully reconciled',
  },
  {
    id: 'receipts',
    name: 'Receipts',
    channel: 'Paper vendor receipts',
    icon: <Receipt className="w-4 h-4 text-[#E11D48]" />,
    sample: 'Kano Textiles: 10 yds silk cash ₦95,000',
    structuredTag: 'Expense logged · Supplier restock COGS',
  },
  {
    id: 'customer-messages',
    name: 'Customer messages',
    channel: 'Instagram / Direct orders',
    icon: <MessageSquare className="w-4 h-4 text-[#EC4899]" />,
    sample: '"I want 2 midi dresses size 12 for Friday delivery"',
    structuredTag: 'Order queued · Customer profile tagged',
  },
];

export const ProblemSection: React.FC = () => {
  const { isDark } = useTheme();
  const [activeNodeId, setActiveNodeId] = useState<string>('whatsapp');

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNodeId((prev) => {
        const idx = NODES.findIndex((n) => n.id === prev);
        return NODES[(idx + 1) % NODES.length].id;
      });
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const activeNode = NODES.find((n) => n.id === activeNodeId) || NODES[0];

  return (
    <section
      id="problem"
      className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
        isDark ? 'bg-[#08110F] text-white border-[#182E26]' : 'bg-[#F7F6F0] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      {/* Background subtle texture */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-35' : 'bg-grid-light opacity-50'}`} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-widest uppercase mb-3 font-mono ${
            isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#B8F36B]' : 'bg-[#10251E]'}`} />
            <span>THE FRAGMENTED REALITY</span>
          </div>

          <h2 
            className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-medium tracking-tight leading-[1.1] mb-3 ${
              isDark ? 'text-white' : 'text-[#111916]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            Your business already creates data.{' '}
            <span className={`font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E] underline decoration-[#B8F36B] decoration-4 underline-offset-8'}`}>
              It’s just scattered everywhere.
            </span>
          </h2>

          <p className={`text-base sm:text-lg font-normal pt-2 font-sans ${isDark ? 'text-slate-300' : 'text-[#69746F]'}`}>
            Kopa brings everyday scattered activity together into structured financial intelligence.
          </p>
        </div>

        {/* Animated Convergence Diagram (matching reference card styling) */}
        <div className={`rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden border transition-colors ${
          isDark ? 'bg-[#10251E] border-[#1C3E32]' : 'bg-white border-[#DEE3DE]'
        }`}>
          
          {/* Header Banner indicating the transformation */}
          <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 mb-8 border-b gap-3 ${
            isDark ? 'border-[#183126]' : 'border-[#EAEFEA]'
          }`}>
            <div className={`flex items-center gap-2 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-[#111916]'}`}>SCATTERED ACTIVITY</span>
              <span>→</span>
              <span className={`font-bold ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'}`}>KOPA PROTOCOL</span>
              <span>→</span>
              <span className={`font-medium ${isDark ? 'text-white' : 'text-[#10251E]'}`}>STRUCTURED INTELLIGENCE</span>
            </div>
            <div className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
              Auto-reconciles across 6 native channels
            </div>
          </div>

          {/* Interactive Node Flow Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: 6 Scattered Channels */}
            <div className="lg:col-span-5 space-y-2">
              <div className={`text-[11px] font-mono uppercase tracking-wider mb-2 font-medium ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                Daily fragmented sources:
              </div>
              
              {NODES.map((node) => {
                const isActive = node.id === activeNodeId;
                return (
                  <button
                    key={node.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActiveNodeId(node.id)}
                    className={`w-full text-left p-3 min-h-[46px] rounded-xl transition-all duration-200 cursor-pointer border focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                      isActive
                        ? isDark
                          ? 'bg-[#08110F] text-white border-[#B8F36B]/60 shadow-sm translate-x-1.5'
                          : 'bg-[#10251E] text-white border-[#10251E] shadow-sm translate-x-1.5'
                        : isDark
                        ? 'bg-[#0E1F1A] hover:bg-[#122822] border-[#183126] text-white'
                        : 'bg-[#F7F6F0]/80 hover:bg-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-1.5 rounded-lg ${isActive ? isDark ? 'bg-[#10251E]' : 'bg-[#08110F]' : isDark ? 'bg-[#08110F]' : 'bg-white shadow-2xs'}`}>
                          {node.icon}
                        </div>
                        <span className="text-xs sm:text-sm font-semibold">
                          {node.name}
                        </span>
                      </div>
                      <span className={`text-[11px] font-mono ${isActive ? 'text-[#B8F36B]' : isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                        {node.channel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Middle Divider Flow Arrow */}
            <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center space-y-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border animate-pulse ${
                isDark
                  ? 'bg-[#B8F36B]/20 text-[#B8F36B] border-[#B8F36B]/30'
                  : 'bg-[#15803D]/10 text-[#15803D] border-[#15803D]/30'
              }`}>
                <ArrowRight className="w-5 h-5" />
              </div>
              <span className={`text-[10px] font-mono text-center max-w-[80px] ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                Continuous unification
              </span>
            </div>

            {/* Right Column: Unified Structured Ledger Card */}
            <div className="lg:col-span-5">
              <div className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                isDark ? 'bg-[#08110F] border-[#1E3B30]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
              }`}>
                <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-inherit">
                  <div className="flex items-center gap-2.5">
                    <KopaLogo variant="symbol" theme={isDark ? 'dark' : 'light'} size="sm" />
                    <div>
                      <span className={`text-xs font-semibold block ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                        Single Structured Ledger
                      </span>
                      <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                        Automated double-entry
                      </span>
                    </div>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    isDark
                      ? 'text-[#B8F36B] bg-[#B8F36B]/15 border-[#B8F36B]/30'
                      : 'text-[#15803D] bg-[#15803D]/10 border-[#15803D]/25'
                  }`}>
                    Live Sync
                  </span>
                </div>

                {/* Active conversion preview */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeNode.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-3.5"
                  >
                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-slate-400' : 'text-[#48534E]'}`}>
                        Raw input ({activeNode.name})
                      </span>
                      <div className={`p-3 rounded-xl border text-xs sm:text-sm font-medium ${
                        isDark ? 'bg-[#10251E] border-[#183126] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                      }`}>
                        {activeNode.sample}
                      </div>
                    </div>

                    <div className={`flex justify-center font-bold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                      ↓
                    </div>

                    <div>
                      <span className={`text-[10px] font-mono uppercase tracking-wider block mb-1 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                        Structured Kopa intelligence
                      </span>
                      <div className={`p-3 rounded-xl border text-xs sm:text-sm font-semibold flex items-center gap-2 ${
                        isDark ? 'bg-[#10251E] border-[#224738] text-[#B8F36B]' : 'bg-[#E8F5D8] border-[#A3D977] text-[#0A261B]'
                      }`}>
                        <CheckCircle2 className={`w-4 h-4 shrink-0 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`} />
                        <span>{activeNode.structuredTag}</span>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className={`mt-5 pt-3.5 border-t text-[11px] font-mono flex items-center justify-between ${
                  isDark ? 'border-[#182F26] text-slate-400' : 'border-[#DEE3DE] text-[#48534E]'
                }`}>
                  <span>Zero manual spreadsheets</span>
                  <span>100% private & encrypted</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
