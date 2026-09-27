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
        isDark ? 'bg-[#07111F] text-[#F8FBFF] border-[#243B56]' : 'bg-[#F7FAFC] text-[#0F172A] border-[#DCE6F0]'
      }`}
    >
      {/* Background subtle texture */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-35' : 'bg-grid-light opacity-50'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] rounded-full blur-[130px] pointer-events-none ${
        isDark ? 'bg-[#3B82F6]/10' : 'bg-[#2563EB]/15'
      }`} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Symbol */}
        <div className="flex justify-center mb-6">
          <KopaLogo variant="symbol" theme={isDark ? 'dark' : 'light'} size="md" />
        </div>

        {/* Headline in Manrope */}
        <h2 
          className={`text-3xl sm:text-5xl lg:text-6xl font-heading font-medium tracking-tight leading-[1.1] mb-6 ${
            isDark ? 'text-[#F8FBFF]' : 'text-[#0F172A]'
          }`}
          style={{ textWrap: 'balance' }}
        >
          Your business already has a story.
          <br />
          <span className={`font-semibold ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB] underline decoration-[#2563EB]/40 decoration-4 underline-offset-8'}`}>
            Kopa helps you understand it.
          </span>
        </h2>

        {/* Short Subtitle in Manrope */}
        <p 
          className={`text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed font-normal font-sans ${
            isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'
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
            className="inline-flex items-center justify-center gap-2 px-8 py-4 min-h-[48px] rounded-xl font-heading font-semibold text-base text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] transition-all shadow-lg shadow-[#2563EB]/20 cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none"
          >
            <span>Start with Kopa →</span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#how-it-works"
            className={`inline-flex items-center justify-center gap-2 px-7 py-4 min-h-[48px] rounded-xl font-heading font-medium text-base transition-all cursor-pointer whitespace-nowrap focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none ${
              isDark
                ? 'text-[#D5E2F0] hover:text-[#F8FBFF] bg-[#0D1B2E] hover:bg-[#132640] border border-[#243B56]'
                : 'text-[#0F172A] hover:text-black bg-white hover:bg-[#EAF2FF]/50 border border-[#DCE6F0] shadow-xs'
            }`}
          >
            <Play className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] fill-current" />
            <span>See how it works</span>
          </motion.a>
        </div>

        {/* Subtle trust markers */}
        <div className={`flex flex-wrap items-center justify-center gap-6 text-xs font-sans ${
          isDark ? 'text-[#9FB1C5]' : 'text-[#64748B]'
        }`}>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} />
            Works directly on WhatsApp
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} />
            Free during early access
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className={`w-4 h-4 ${isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'}`} />
            Encrypted & private
          </span>
        </div>
      </div>
    </section>
  );
};
