import React from 'react';
import { motion } from 'motion/react';
import { Play, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { HeroBusinessInteraction } from './HeroBusinessInteraction';
import { useTheme } from '../context/ThemeContext';

interface HeroProps {
  onOpenWaitlist: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenWaitlist }) => {
  const { isDark } = useTheme();

  return (
    <section
      className={`relative pt-32 sm:pt-40 pb-20 lg:pb-28 transition-colors duration-200 overflow-hidden ${
        isDark ? 'bg-[#08110F] text-white' : 'bg-[#F7F6F0] text-[#111916]'
      }`}
    >
      {/* Background data ambient grid & subtle glow matching reference layout */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark ? 'bg-grid-dark opacity-35' : 'bg-grid-light opacity-60'
        }`}
      />
      <div
        className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[400px] rounded-full blur-[140px] pointer-events-none ${
          isDark ? 'bg-[#B8F36B]/6' : 'bg-[#B8F36B]/15'
        }`}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Eyebrow, Main Headline & Actions (matching reference hero left) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 text-left"
          >
            {/* Small Eyebrow Pill */}
            <div
              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium mb-5 sm:mb-6 transition-colors border max-w-full overflow-hidden ${
                isDark 
                  ? 'bg-[#10251E] border-[#1C382E] text-[#B8F36B]' 
                  : 'bg-white border-[#DEE3DE] text-[#10251E] shadow-2xs'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isDark ? 'bg-[#B8F36B]' : 'bg-[#10251E]'}`} />
              <span className="font-mono text-[10px] sm:text-[11px] tracking-wide uppercase truncate">
                AI OPERATING SYSTEM FOR AFRICAN BUSINESS
              </span>
            </div>

            {/* Headline (Manrope 500/600, calm, light, highly readable) */}
            <h1 
              className={`text-3xl sm:text-4xl md:text-5xl lg:text-[3.75rem] font-heading font-medium tracking-tight leading-[1.12] sm:leading-[1.08] mb-5 sm:mb-6 ${
                isDark ? 'text-white' : 'text-[#111916]'
              }`}
              style={{ textWrap: 'balance' }}
            >
              Run your business by simply{' '}
              <span className={`font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E] underline decoration-[#B8F36B] decoration-4 underline-offset-8'}`}>
                talking to it.
              </span>
            </h1>

            {/* Supporting Copy */}
            <p 
              className={`text-base sm:text-lg leading-relaxed max-w-xl mb-8 font-normal font-sans ${
                isDark ? 'text-slate-300' : 'text-[#69746F]'
              }`}
              style={{ textWrap: 'balance' }}
            >
              Kopa turns everyday business activity into clear financial intelligence — without complicated accounting software.
            </p>

            {/* Buttons (Primary Pill + Secondary Action) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 mb-10">
              <button
                onClick={onOpenWaitlist}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 min-h-[46px] rounded-xl font-heading font-semibold text-sm text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] transition-all shadow-md shadow-[#B8F36B]/20 hover:shadow-lg hover:shadow-[#B8F36B]/30 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none"
              >
                <span>Start with Kopa →</span>
              </button>

              <a
                href="#how-it-works"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3.5 min-h-[46px] rounded-xl font-heading font-medium text-sm transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                  isDark
                    ? 'text-slate-200 hover:text-white bg-[#10251E] hover:bg-[#153228] border border-[#1E3B30]'
                    : 'text-[#111916] hover:text-black bg-white hover:bg-[#FAF8F2] border border-[#DEE3DE] shadow-xs'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-[#B8F36B] fill-[#B8F36B]" />
                <span>See how it works</span>
              </a>
            </div>

            {/* Proof Metrics matching reference lower bar */}
            <div className={`pt-6 border-t grid grid-cols-3 gap-4 ${isDark ? 'border-[#182E26]' : 'border-[#DEE3DE]'}`}>
              <div>
                <div className={`text-xl sm:text-2xl font-heading font-semibold tabular-nums ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                  ₦4.2B+
                </div>
                <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                  Activity tracked
                </div>
              </div>

              <div>
                <div className={`text-xl sm:text-2xl font-heading font-semibold tabular-nums ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                  12,000+
                </div>
                <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                  African merchants
                </div>
              </div>

              <div>
                <div className={`text-xl sm:text-2xl font-heading font-semibold tabular-nums ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'}`}>
                  0.3s
                </div>
                <div className={`text-[11px] font-mono mt-0.5 ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                  Reconciliation
                </div>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Polished Kopa Product Interaction Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <HeroBusinessInteraction />
          </motion.div>

        </div>
      </div>
    </section>
  );
};
