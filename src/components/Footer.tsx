import React from 'react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onOpenWaitlist: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWaitlist }) => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`transition-colors duration-200 py-12 sm:py-14 border-t ${
        isDark
          ? 'bg-[#050B0A] text-slate-400 border-[#142621]'
          : 'bg-[#F7F6F0] text-[#69746F] border-[#DEE3DE]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b ${
            isDark ? 'border-[#11231E]' : 'border-[#DEE3DE]'
          }`}
        >
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <a 
              href="#" 
              className="inline-block focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded-lg p-0.5" 
              aria-label="Kopa Home"
            >
              <KopaLogo variant="full" theme={isDark ? 'dark' : 'light'} size="md" />
            </a>
            <p className={`text-xs max-w-sm leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
              The AI-powered business operating system designed for African enterprise. Talk naturally, understand your finances, and unlock formal credibility.
            </p>
            <div className={`text-[11px] font-mono ${isDark ? 'text-slate-500' : 'text-[#98A39E]'}`}>
              Lagos · Nairobi · Accra · Kigali
            </div>
          </div>

          {/* Nav Col: Architecture */}
          <div className="md:col-span-3 space-y-2.5">
            <div
              className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${
                isDark ? 'text-slate-300' : 'text-[#111916]'
              }`}
            >
              Product
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="#problem"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#111916]'
                  }`}
                >
                  Scattered Data Engine
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#111916]'
                  }`}
                >
                  Conversational Ledger
                </a>
              </li>
              <li>
                <a
                  href="#product"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#111916]'
                  }`}
                >
                  Financial Intelligence
                </a>
              </li>
              <li>
                <a
                  href="#business-passport"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#111916]'
                  }`}
                >
                  Business Passport
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#111916]'
                  }`}
                >
                  Security & FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Nav Col: Company */}
          <div className="md:col-span-4 space-y-2.5">
            <div
              className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${
                isDark ? 'text-slate-300' : 'text-[#111916]'
              }`}
            >
              Get Started
            </div>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
              Join forward-thinking merchants transforming everyday business chats into structured financial intelligence.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="text-xs font-semibold text-[#10251E] dark:text-[#B8F36B] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded py-1 px-1.5"
              >
                <span>Request Early Access</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

        {/* Quiet Sub-Footer */}
        <div
          className={`pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] gap-3 ${
            isDark ? 'text-slate-500' : 'text-[#98A39E]'
          }`}
        >
          <div>
            © {new Date().getFullYear()} Kopa Technologies Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              className={`transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded p-1 ${
                isDark ? 'hover:text-slate-400' : 'hover:text-[#111916]'
              }`}
              onClick={onOpenWaitlist}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className={`transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded p-1 ${
                isDark ? 'hover:text-slate-400' : 'hover:text-[#111916]'
              }`}
              onClick={onOpenWaitlist}
            >
              Terms of Service
            </button>
            <button
              type="button"
              className={`transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded p-1 ${
                isDark ? 'hover:text-slate-400' : 'hover:text-[#111916]'
              }`}
              onClick={onOpenWaitlist}
            >
              Security Whitepaper
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
