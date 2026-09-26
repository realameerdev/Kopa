import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  Package, 
  User,
  AlertCircle,
  PlusCircle,
  Check
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface TransactionScenario {
  id: string;
  label: string;
  inbound: string;
  channel: string;
  status: string;
  revenue: string;
  items: string;
  customer: string;
  defaultCostSet: boolean;
  costPerUnit?: number;
  quantity?: number;
  totalCost?: string;
  grossProfit?: string;
  margin?: string;
  inventory: string;
}

const SCENARIOS: TransactionScenario[] = [
  {
    id: 'shirts',
    label: 'Shirts sale',
    inbound: 'Sold 3 black shirts for ₦45,000.',
    channel: 'WhatsApp message',
    status: 'Sale recorded',
    revenue: '₦45,000',
    items: '3 × Black Shirt',
    customer: 'Ahmed (Walk-in)',
    defaultCostSet: false,
    costPerUnit: 9000,
    quantity: 3,
    totalCost: '₦27,000',
    grossProfit: '₦18,000',
    margin: '40.0%',
    inventory: '14 units left in stock',
  },
  {
    id: 'credit',
    label: 'Credit balance',
    inbound: 'Alhaji Musa took 2 lace rolls. Balance ₦65,000.',
    channel: 'Voice note',
    status: 'Receivable recorded',
    revenue: '₦65,000',
    items: '2 × Swiss Voile Lace',
    customer: 'Alhaji Musa',
    defaultCostSet: true,
    grossProfit: 'Pending payment',
    margin: 'Due Friday',
    inventory: '8 rolls left in stock',
  },
  {
    id: 'pos',
    label: 'POS slip',
    inbound: 'Terminal #0981: ₦24,500 approved for fabric.',
    channel: 'Card terminal',
    status: 'POS Settlement matched',
    revenue: '₦24,500',
    items: '5 yds Vintage Crepe',
    customer: 'Cardholder #4120',
    defaultCostSet: true,
    grossProfit: '₦9,800',
    margin: '40.0%',
    inventory: 'Reconciled to Moniepoint',
  }
];

export const HeroBusinessInteraction: React.FC = () => {
  const { isDark } = useTheme();
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const scenario = SCENARIOS[selectedScenarioIndex];

  const [displayInput, setDisplayInput] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [stage, setStage] = useState<'input' | 'processing' | 'structured'>('input');
  const [hasAddedCost, setHasAddedCost] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  // Reset cost added state on scenario change
  useEffect(() => {
    setHasAddedCost(scenario.defaultCostSet);
  }, [selectedScenarioIndex, scenario.defaultCostSet]);

  // Typing effect
  useEffect(() => {
    let charIdx = 0;
    setDisplayInput('');
    setIsTyping(true);
    setStage('input');

    const typeTimer = setInterval(() => {
      if (charIdx <= scenario.inbound.length) {
        setDisplayInput(scenario.inbound.slice(0, charIdx));
        charIdx++;
      } else {
        clearInterval(typeTimer);
        setIsTyping(false);
        setStage('processing');

        const procTimer = setTimeout(() => {
          setStage('structured');
        }, 750);

        return () => clearTimeout(procTimer);
      }
    }, 24);

    return () => clearInterval(typeTimer);
  }, [scenario.inbound, replayKey]);

  return (
    <div className="w-full relative">
      {/* Background ambient halo */}
      <div className={`absolute -inset-4 rounded-3xl blur-2xl pointer-events-none transition-opacity duration-300 ${
        isDark ? 'bg-[#B8F36B]/6' : 'bg-[#B8F36B]/15'
      }`} />

      {/* Main Elevated Reference Card */}
      <div
        className={`relative rounded-3xl p-5 sm:p-7 shadow-2xl transition-all duration-200 border ${
          isDark
            ? 'bg-[#0E1F1A] border-[#1C382E] text-white'
            : 'bg-white border-[#DEE3DE] text-[#111916]'
        }`}
      >
        {/* Top bar: live status & scenario selector */}
        <div className={`flex flex-wrap items-center justify-between pb-4 mb-4 border-b gap-3 ${
          isDark ? 'border-[#182E26]' : 'border-[#EAEFEA]'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-[#B8F36B] animate-pulse" />
            <span className={`text-xs font-semibold tracking-tight ${isDark ? 'text-white' : 'text-[#111916]'}`}>
              Kopa Conversational Engine
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {SCENARIOS.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  if (idx !== selectedScenarioIndex) {
                    setSelectedScenarioIndex(idx);
                  }
                }}
                className={`text-[11px] px-2.5 py-1 rounded-lg transition-all cursor-pointer font-medium ${
                  selectedScenarioIndex === idx
                    ? 'bg-[#B8F36B] text-[#08110F] font-semibold shadow-xs'
                    : isDark
                    ? 'text-slate-400 hover:text-white bg-[#08110F] hover:bg-[#12241E] border border-[#162B23]'
                    : 'text-[#69746F] hover:text-[#111916] bg-[#F7F6F0] hover:bg-[#EEEFEA] border border-[#DEE3DE]'
                }`}
              >
                {s.label}
              </button>
            ))}

            <button
              onClick={() => setReplayKey((k) => k + 1)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ml-1 ${
                isDark ? 'hover:bg-white/5 text-slate-400 hover:text-white' : 'hover:bg-black/5 text-[#69746F] hover:text-[#111916]'
              }`}
              title="Replay transaction animation"
              aria-label="Replay animation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Step 1: User Natural Language Inbound Message */}
        <div className={`rounded-2xl p-4 mb-4 border transition-colors ${
          isDark ? 'bg-[#08110F] border-[#182E26]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
        }`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-[11px] font-mono uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
              Inbound activity ({scenario.channel})
            </span>
            <span className="text-[10px] font-mono text-[#B8F36B] bg-[#B8F36B]/10 px-1.5 py-0.5 rounded border border-[#B8F36B]/20">
              Voice / Chat
            </span>
          </div>

          <div className={`text-base sm:text-lg font-medium min-h-[28px] flex items-center ${isDark ? 'text-white' : 'text-[#111916]'}`}>
            <span>"{displayInput}"</span>
            {isTyping && (
              <span className="inline-block w-1.5 h-4 bg-[#B8F36B] ml-1.5 animate-pulse" />
            )}
          </div>
        </div>

        {/* Step 2: Three-Phase Progress Indicator */}
        <div className={`py-2 px-3 mb-4 rounded-xl border flex items-center justify-between text-[10px] sm:text-[11px] font-mono ${
          isDark ? 'bg-[#08110F] border-[#162C23]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
        }`}>
          <span className={stage === 'input' ? 'text-[#B8F36B] font-bold' : isDark ? 'text-slate-500' : 'text-slate-400'}>
            1. NATURAL SPEECH
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>→</span>
          <span className={stage === 'processing' ? 'text-[#B8F36B] font-bold animate-pulse' : isDark ? 'text-slate-500' : 'text-slate-400'}>
            2. PARSING ENTITIES
          </span>
          <span className={isDark ? 'text-slate-700' : 'text-slate-300'}>→</span>
          <span className={stage === 'structured' ? 'text-[#B8F36B] font-bold' : isDark ? 'text-slate-500' : 'text-slate-400'}>
            3. STRUCTURED DATA
          </span>
        </div>

        {/* Step 3: Structured Result Card */}
        <AnimatePresence mode="wait">
          {stage === 'structured' ? (
            <motion.div
              key={`structured-${scenario.id}`}
              initial={{ opacity: 0, y: 8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className={`rounded-2xl p-4 sm:p-5 border ${
                isDark ? 'bg-[#10251E] border-[#224438]' : 'bg-white border-[#DEE3DE] shadow-xs'
              }`}
            >
              {/* Header Status Stamp */}
              <div className={`flex items-center justify-between pb-3 mb-3.5 border-b ${
                isDark ? 'border-[#183126]' : 'border-[#EAEFEA]'
              }`}>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#B8F36B]" />
                  <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                    {scenario.status}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[#B8F36B] bg-[#B8F36B]/10 px-2 py-0.5 rounded border border-[#B8F36B]/20">
                  Cryptographic checksum verified
                </span>
              </div>

              {/* Revenue & Profit Display */}
              <div className="grid grid-cols-2 gap-3 mb-3.5">
                <div className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#08110F] border-[#162C23]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                }`}>
                  <span className={`text-[11px] font-mono block mb-1 ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                    Recorded Revenue
                  </span>
                  <span className={`text-2xl font-bold tabular-nums block ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                    {scenario.revenue}
                  </span>
                </div>

                <div className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#08110F] border-[#162C23]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                }`}>
                  <span className={`text-[11px] font-mono block mb-1 ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                    Gross Profit
                  </span>
                  {hasAddedCost ? (
                    <div>
                      <span className={`text-2xl font-bold tabular-nums block ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'}`}>
                        {scenario.grossProfit}
                      </span>
                      {scenario.margin && (
                        <span className={`text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                          Margin: {scenario.margin}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-1.5 text-amber-500 font-semibold text-xs mb-0.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Cost not set</span>
                      </div>
                      <p className={`text-[10px] leading-tight ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                        Add product cost to calculate gross profit.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Cost notice banner when cost not set */}
              {!hasAddedCost && (
                <div className={`mb-3.5 p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 ${
                  isDark ? 'bg-[#08110F] border-amber-500/20 text-slate-300' : 'bg-amber-50/70 border-amber-200 text-amber-950'
                }`}>
                  <div className="text-xs">
                    <span className="font-semibold block sm:inline">Kopa rule: </span>
                    <span className={isDark ? 'text-slate-400' : 'text-amber-800'}>
                      Never invent profit. Set product unit cost to unlock verified margin.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHasAddedCost(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#B8F36B] text-[#08110F] hover:bg-[#A5E852] transition-colors cursor-pointer shrink-0"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Set unit cost: ₦9,000</span>
                  </button>
                </div>
              )}

              {/* Breakdown Rows */}
              <div className="space-y-2 text-xs">
                <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${
                  isDark ? 'bg-[#08110F] border-[#162C23]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                }`}>
                  <div className="flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-[#B8F36B]" />
                    <span className="font-medium">{scenario.items}</span>
                  </div>
                  <span className={`text-[11px] font-mono ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                    {scenario.inventory}
                  </span>
                </div>

                <div className={`flex items-center justify-between py-2 px-3 rounded-lg border ${
                  isDark ? 'bg-[#08110F] border-[#162C23]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                }`}>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-[#B8F36B]" />
                    <span className="font-medium">{scenario.customer}</span>
                  </div>
                  <span className={`text-[11px] font-mono ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'}`}>
                    Activity logged in ledger
                  </span>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className={`h-[180px] rounded-2xl border flex flex-col items-center justify-center p-4 text-center ${
              isDark ? 'bg-[#08110F] border-[#162C23] text-slate-400' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#69746F]'
            }`}>
              {stage === 'processing' ? (
                <div className="flex flex-col items-center gap-2 text-[#B8F36B]">
                  <Sparkles className="w-5 h-5 animate-spin" />
                  <span className="text-xs font-mono">Parsing items, units, price & customer entity...</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#B8F36B] animate-ping" />
                  <span>Awaiting natural language input...</span>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>

        {/* Footer reassurance */}
        <div className={`mt-3.5 pt-3 border-t flex items-center justify-between text-[11px] font-mono ${
          isDark ? 'border-[#182E26] text-slate-500' : 'border-[#EAEFEA] text-[#98A39E]'
        }`}>
          <span>Latency: 0.28s</span>
          <span>Zero accounting knowledge needed</span>
        </div>
      </div>
    </div>
  );
};
