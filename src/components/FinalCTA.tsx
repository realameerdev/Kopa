import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

interface FinalCTAProps {
  onOpenWaitlist: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenWaitlist }) => {
  const { isDark } = useTheme();

  return (
    <section
      className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
        isDark ? 'bg-[#08110F] text-white border-[#182E26]' : 'bg-[#F7F6F0] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      {/* Background subtle texture */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-35' : 'bg-grid-light opacity-50'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full blur-[130px] pointer-events-none ${
        isDark ? 'bg-[#B8F36B]/6' : 'bg-[#B8F36B]/15'
      }`} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Symbol */}
        <div className="flex justify-center mb-6">
          <KopaLogo variant="symbol" theme={isDark ? 'dark' : 'light'} size="md" />
        </div>

        {/* Headline in Manrope */}
        <h2 
          className={`text-3xl sm:text-5xl lg:text-6xl font-heading font-medium tracking-tight leading-[1.1] mb-6 ${
            isDark ? 'text-white' : 'text-[#111916]'
          }`}
          style={{ textWrap: 'balance' }}
        >
          Your business already has a story.
          <br />
          <span className={`font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E] underline decoration-[#B8F36B] decoration-4 underline-offset-8'}`}>
            Kopa helps you understand it.
          </span>
        </h2>

        {/* Short Subtitle in Manrope */}
        <p 
          className={`text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal font-sans ${
            isDark ? 'text-slate-300' : 'text-[#69746F]'
          }`}
          style={{ textWrap: 'balance' }}
        >
          Start managing your business by simply talking to it. No training, no spreadsheets, no complexity.
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-12">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenWaitlist}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 min-h-[48px] rounded-xl font-heading font-semibold text-base text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] transition-all shadow-lg shadow-[#B8F36B]/25 hover:shadow-xl hover:shadow-[#B8F36B]/35 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none"
          >
            <span>Start with Kopa →</span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#how-it-works"
            className={`inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[48px] rounded-xl font-heading font-medium text-base transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
              isDark
                ? 'text-slate-200 hover:text-white bg-[#10251E] hover:bg-[#153228] border border-[#1E3B30]'
                : 'text-[#111916] hover:text-black bg-white hover:bg-[#FAF8F2] border border-[#DEE3DE] shadow-xs'
            }`}
          >
            <Play className="w-4 h-4 text-[#B8F36B] fill-[#B8F36B]" />
            <span>See how it works</span>
          </motion.a>
        </div>

        {/* Subtle trust markers */}
        <div className={`flex flex-wrap items-center justify-center gap-6 text-xs font-sans ${
          isDark ? 'text-slate-400' : 'text-[#48534E]'
        }`}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`} />
            Works directly on WhatsApp
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`} />
            Free during early access
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`} />
            Encrypted & private
          </span>
        </div>
      </div>
    </section>
  );
};
