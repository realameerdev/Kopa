import React from 'react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

interface FooterProps {
  onOpenWaitlist: () => void;
  onNavigateTo?: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenWaitlist, onNavigateTo }) => {
  const { isDark } = useTheme();

  return (
    <footer
      className={`transition-colors duration-200 py-12 sm:py-14 border-t ${
        isDark
          ? 'bg-[#07111F] text-[#9FB1C5] border-[#243B56]'
          : 'bg-[#F7FAFC] text-[#64748B] border-[#DCE6F0]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b ${
            isDark ? 'border-[#243B56]' : 'border-[#DCE6F0]'
          }`}
        >
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-3">
            <a 
              href="#" 
              className="inline-block focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded-lg p-0.5" 
              aria-label="Kopa Home"
            >
              <KopaLogo variant="full" theme={isDark ? 'dark' : 'light'} size="md" />
            </a>
            <p className={`text-xs max-w-sm leading-relaxed ${isDark ? 'text-[#9FB1C5]' : 'text-[#64748B]'}`}>
              The AI-powered business operating system designed for African enterprise. Talk naturally, understand your finances, and unlock formal credibility.
            </p>
            <div className={`text-[11px] font-mono ${isDark ? 'text-[#9FB1C5]/70' : 'text-[#64748B]/70'}`}>
              Lagos · Nairobi · Accra · Kigali
            </div>
          </div>

          {/* Nav Col: Architecture */}
          <div className="md:col-span-3 space-y-2.5">
            <div
              className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${
                isDark ? 'text-[#D5E2F0]' : 'text-[#0F172A]'
              }`}
            >
              Product
            </div>
            <ul className="space-y-1.5 text-xs">
              <li>
                <a
                  href="#problem"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'
                  }`}
                >
                  Scattered Data Engine
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'
                  }`}
                >
                  Conversational Ledger
                </a>
              </li>
              <li>
                <a
                  href="#product"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'
                  }`}
                >
                  Financial Intelligence
                </a>
              </li>
              <li>
                <a
                  href="#business-passport"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'
                  }`}
                >
                  Business Passport
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  className={`transition-colors focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded px-1 py-0.5 inline-block ${
                    isDark ? 'hover:text-white' : 'hover:text-[#0F172A]'
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
                isDark ? 'text-[#D5E2F0]' : 'text-[#0F172A]'
              }`}
            >
              Get Started
            </div>
            <p className={`text-xs ${isDark ? 'text-[#9FB1C5]' : 'text-[#64748B]'}`}>
              Join forward-thinking merchants transforming everyday business chats into structured financial intelligence.
            </p>
            <div className="pt-1">
              <button
                type="button"
                onClick={onOpenWaitlist}
                className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline transition-colors cursor-pointer inline-flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded py-1 px-1.5"
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
            isDark ? 'text-[#9FB1C5]/50' : 'text-[#64748B]/50'
          }`}
        >
          <div>
            © {new Date().getFullYear()} Kopa Technologies Ltd. All rights reserved.
          </div>
          <div className="flex items-center gap-5">
            <button
              type="button"
              className={`transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded p-1 ${
                isDark ? 'hover:text-[#F8FBFF]' : 'hover:text-[#0F172A]'
              }`}
              onClick={() => onNavigateTo ? onNavigateTo('/privacy') : onOpenWaitlist()}
            >
              Privacy Policy
            </button>
            <button
              type="button"
              className={`transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded p-1 ${
                isDark ? 'hover:text-[#F8FBFF]' : 'hover:text-[#0F172A]'
              }`}
              onClick={() => onNavigateTo ? onNavigateTo('/terms') : onOpenWaitlist()}
            >
              Terms of Service
            </button>
            <button
              type="button"
              className={`transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded p-1 ${
                isDark ? 'hover:text-[#F8FBFF]' : 'hover:text-[#0F172A]'
              }`}
              onClick={() => onNavigateTo ? onNavigateTo('/security') : onOpenWaitlist()}
            >
              Security Whitepaper
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
