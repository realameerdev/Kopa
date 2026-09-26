import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BadgeCheck, 
  ArrowUpRight, 
  QrCode, 
  Lock, 
  X, 
  Award,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

export const BusinessPassport: React.FC = () => {
  const { isDark } = useTheme();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Close modal on Escape
  useEffect(() => {
    if (!isModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen]);

  return (
    <section
      id="business-passport"
      className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
        isDark ? 'bg-[#08110F] text-white border-[#182E26]' : 'bg-[#FFFFFF] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      {/* Background ambient lighting & subtle line textures */}
      <div className={`absolute inset-0 pointer-events-none ${isDark ? 'bg-grid-dark opacity-35' : 'bg-grid-light opacity-50'}`} />
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[400px] rounded-full blur-[140px] pointer-events-none ${
        isDark ? 'bg-[#B8F36B]/6' : 'bg-[#B8F36B]/15'
      }`} />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-widest uppercase mb-3 font-mono ${
            isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#B8F36B]' : 'bg-[#10251E]'}`} />
            <span>BUSINESS IDENTITY</span>
          </div>

          <h2 
            className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-medium tracking-tight leading-[1.1] mb-3 ${
              isDark ? 'text-white' : 'text-[#111916]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            Turn business activity into{' '}
            <span className={`font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#10251E] underline decoration-[#B8F36B] decoration-4 underline-offset-8'}`}>
              business identity.
            </span>
          </h2>

          <p className={`text-base sm:text-lg font-normal max-w-xl font-sans ${isDark ? 'text-slate-300' : 'text-[#69746F]'}`}>
            Kopa transforms your everyday transactions into a structured Business Passport — proving your trade history and operating consistency without complex audits or arbitrary credit scores.
          </p>
        </div>

        {/* Passport Showcase Card Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left: Strategic Context Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className={`p-5 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#10251E] border-[#1E3B30] text-white' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
            }`}>
              <div className={`text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'
              }`}>
                01. Structured Commercial Identity
              </div>
              <h3 className={`text-base font-heading font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                Structured business activity → business identity
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-[#69746F]'}`}>
                Small businesses produce immense real-world value. Kopa binds your sales velocity and inventory turnover into a portable, cryptographically signed record.
              </p>
            </div>

            <div className={`p-5 rounded-2xl border transition-colors ${
              isDark ? 'bg-[#10251E] border-[#1E3B30] text-white' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
            }`}>
              <div className={`text-[11px] font-mono font-semibold uppercase tracking-wider mb-1.5 ${
                isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'
              }`}>
                02. Trade Credibility & Wholesale Terms
              </div>
              <h3 className={`text-base font-heading font-semibold mb-1.5 ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                Not an arbitrary credit score
              </h3>
              <p className={`text-xs sm:text-sm leading-relaxed font-sans ${isDark ? 'text-slate-300' : 'text-[#69746F]'}`}>
                The Passport is based strictly on your recorded business activity. Share verified aggregate metrics with distributors and partners without exposing private customer identities.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl font-heading font-semibold text-xs text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] transition-all shadow-md shadow-[#B8F36B]/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none"
              >
                <span>Explore the Business Passport</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right: The Physical Passport Document */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-[#08110F] text-white p-6 sm:p-8 border border-[#1E3B30] shadow-2xl relative overflow-hidden">
              {/* Subtle decorative glow */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#B8F36B]/8 rounded-full blur-3xl pointer-events-none" />

              {/* Passport Header */}
              <div className="flex items-start justify-between pb-5 mb-6 border-b border-[#182F26]">
                <div className="flex items-center gap-3.5">
                  <KopaLogo variant="symbol" theme="dark" size="md" />
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-widest text-[#B8F36B]">
                      Kopa Business Passport
                    </div>
                    <div className="text-2xl font-heading font-semibold text-white tracking-tight">
                      AMINA FASHION
                    </div>
                    <div className="text-xs text-slate-400 font-sans">
                      Fashion & Apparel · Verified Business Activity
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#10251E] text-[#B8F36B] border border-[#1F4133] text-xs font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" />
                    <span>Verified Activity</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                    ID: KP-NG-78401
                  </div>
                </div>
              </div>

              {/* 4 Core Metrics Grid (Exact fields specified in prompt) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2 mb-6 border-b border-[#182F26]">
                <div className="p-3.5 rounded-xl bg-[#0E1F1A] border border-[#162D24]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Recorded revenue
                  </div>
                  <div className="text-2xl font-heading font-semibold text-white tabular-nums">
                    ₦4.8M
                  </div>
                  <div className="text-[10px] text-[#B8F36B] font-mono mt-0.5">
                    100% verified
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E1F1A] border border-[#162D24]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Transactions
                  </div>
                  <div className="text-2xl font-heading font-semibold text-white tabular-nums">
                    342
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Recorded sales
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E1F1A] border border-[#162D24]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Customers
                  </div>
                  <div className="text-2xl font-heading font-semibold text-white tabular-nums">
                    128
                  </div>
                  <div className="text-[10px] text-[#B8F36B] font-mono mt-0.5">
                    Verified profiles
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0E1F1A] border border-[#162D24]">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1">
                    Activity history
                  </div>
                  <div className="text-2xl font-heading font-semibold text-[#B8F36B] tabular-nums">
                    12 months
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Continuous ledger
                  </div>
                </div>
              </div>

              {/* Lower Details: Verification Seal & QR Authenticity */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#10251E] border border-[#1F4133] p-1.5 flex items-center justify-center shrink-0">
                    <QrCode className="w-9 h-9 text-[#B8F36B]" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <Lock className="w-3 h-3 text-[#B8F36B]" />
                      <span>Zero-Knowledge Proof</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Selective metrics disclosure · Private customer data retained
                    </div>
                  </div>
                </div>

                <div className="text-right text-[11px] font-mono text-slate-400">
                  <span>Tamper-evident hash: </span>
                  <span className="text-[#B8F36B]">0x9f4a...21c</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Verification Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsModalOpen(false);
              }
            }}
            role="presentation"
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="passport-modal-title"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`border rounded-2xl max-w-lg w-full p-6 relative shadow-2xl ${
                isDark ? 'bg-[#08110F] border-[#1E3B30] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
              }`}
            >
              <button
                onClick={() => setIsModalOpen(false)}
                className={`absolute top-4 right-4 p-2 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#69746F] hover:text-[#111916] hover:bg-black/5'
                }`}
                aria-label="Close dialog"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#10251E] flex items-center justify-center text-[#B8F36B]">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 
                    id="passport-modal-title"
                    className={`text-base font-heading font-semibold ${isDark ? 'text-white' : 'text-[#111916]'}`}
                  >
                    Kopa Business Passport Protocol
                  </h3>
                  <p className={`text-xs font-sans ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                    Structured business activity → business identity
                  </p>
                </div>
              </div>

              <div className={`space-y-3 text-xs ${isDark ? 'text-slate-300' : 'text-[#69746F]'}`}>
                <div className={`p-3.5 rounded-xl border space-y-1.5 ${
                  isDark ? 'bg-[#0E1F1A] border-[#1A382C]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                }`}>
                  <div className={`font-semibold ${isDark ? 'text-white' : 'text-[#111916]'}`}>
                    How it works for African businesses
                  </div>
                  <p className={`font-sans leading-relaxed ${isDark ? 'text-slate-400' : 'text-[#69746F]'}`}>
                    Kopa turns continuous recording into verified commercial credentials. Instead of manual bookkeeping or unaudited paper claims, your verified activity acts as your commercial passport.
                  </p>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-lg border font-mono text-[11px] ${
                  isDark ? 'bg-[#10251E] border-[#1D3E32] text-white' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
                }`}>
                  <span>Passport: kopa.so/p/amina-fashion</span>
                  <span className="text-[#B8F36B] font-semibold">Verified · 12 mos</span>
                </div>
              </div>

              <div className={`mt-5 pt-3 border-t flex justify-end ${isDark ? 'border-[#182F26]' : 'border-[#DEE3DE]'}`}>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 min-h-[44px] inline-flex items-center justify-center text-xs font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] rounded-lg transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
