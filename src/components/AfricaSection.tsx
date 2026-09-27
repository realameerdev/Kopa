import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageSquare, RefreshCcw, Smartphone, ShieldCheck, Globe, Zap, ArrowRight } from 'lucide-react';

interface Hub {
  city: string;
  country: string;
  currency: string;
  tradeType: string;
  dailyVelocity: string;
  activeBusinesses: string;
}

const HUBS: Hub[] = [
  { city: 'Lagos', country: 'Nigeria', currency: '₦ NGN', tradeType: 'Textile Wholesale, FMCG & Omni-channel Retail', dailyVelocity: '₦142M/day', activeBusinesses: '2,400+' },
  { city: 'Nairobi', country: 'Kenya', currency: 'KSh KES', tradeType: 'Agri-Tech, Hardware & Mobile Commerce', dailyVelocity: 'KSh 18.5M/day', activeBusinesses: '1,850+' },
  { city: 'Accra', country: 'Ghana', currency: 'GH₵ GHS', tradeType: 'Cross-Border Merchandising & Fashion', dailyVelocity: 'GH₵ 3.2M/day', activeBusinesses: '980+' },
  { city: 'Kigali', country: 'Rwanda', currency: 'RWF', tradeType: 'Specialty Retail & Hospitality Supply', dailyVelocity: 'RWF 85M/day', activeBusinesses: '450+' },
  { city: 'Johannesburg', country: 'South Africa', currency: 'R ZAR', tradeType: 'Distribution Logistics & Manufacturing', dailyVelocity: 'R 6.8M/day', activeBusinesses: '1,120+' },
];

export const AfricaSection: React.FC = () => {
  const [activeHubIndex, setActiveHubIndex] = useState(0);
  const activeHub = HUBS[activeHubIndex];

  const pillars = [
    {
      title: 'WhatsApp & Voice First',
      description: 'Business doesn’t happen behind a desktop with an accounting ledger open. It happens on WhatsApp, in phone calls, and on shop floors. Kopa listens where business already occurs.',
      tag: 'Zero Learning Curve'
    },
    {
      title: 'Informal Trust & Credit Books',
      description: 'African commerce is built on relationship credit ("pay me on Friday"). Kopa digitizes your credit book, calculates aging debt, and drafts courteous payment reminders.',
      tag: 'Debt Recovery'
    },
    {
      title: 'Multi-Currency & FX Intelligence',
      description: 'Whether you buy inventory in USD, settle suppliers in RMB, and sell in Naira, Cedis or Shillings, Kopa automatically handles real-time conversion and landed unit costs.',
      tag: 'Cross-Border'
    },
    {
      title: 'Network & Bandwidth Resilient',
      description: 'Engineered for low bandwidth and intermittent connectivity. Messages queue seamlessly and sync the instant network reconnects with zero lost transactions.',
      tag: 'Offline-Ready'
    }
  ];

  return (
    <section id="built-for-africa" className="py-24 sm:py-32 bg-[#07110F] text-white relative overflow-hidden">
      {/* Background accents */}
      <div className="absolute inset-0 bg-subtle-grid-dark opacity-35 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[400px] bg-[#19C37D]/8 rounded-full blur-[140px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-wide text-[#19C37D] uppercase mb-3">
            <span className="w-2 h-2 rounded-full bg-[#19C37D]" />
            <span>Infrastructure Grounded in Reality</span>
          </div>

          <h2 
            className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-white tracking-tight leading-[1.12] mb-5"
            style={{ textWrap: 'balance' }}
          >
            Built for the way Africa actually does business.
          </h2>

          <p 
            className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal"
            style={{ textWrap: 'balance' }}
          >
            From neighborhood trade hubs to fast-growing digital direct-to-consumer brands, Kopa is designed around the ground realities of modern African commerce.
          </p>
        </div>

        {/* 4 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {pillars.map((pillar, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-[#0C1B17] border border-[#18342A] flex flex-col justify-between"
            >
              <div>
                <div className="text-[11px] font-semibold text-[#19C37D] uppercase tracking-wider mb-2">
                  {pillar.tag}
                </div>
                <h3 className="text-lg font-display font-bold text-white mb-3">
                  {pillar.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Commercial Hub Network Interactive Preview */}
        <div className="rounded-2xl bg-[#0A1814] border border-[#1D3E32] p-6 sm:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-[#182F26] gap-4">
            <div>
              <span className="text-xs text-[#19C37D] font-mono uppercase tracking-wider block mb-1">
                Regional Commercial Velocity
              </span>
              <h3 className="text-xl font-display font-bold text-white">
                Active Trade Hubs Connected to Kopa Protocol
              </h3>
            </div>

            {/* Hub Switcher */}
            <div className="flex flex-wrap gap-1.5">
              {HUBS.map((hub, index) => (
                <button
                  key={hub.city}
                  onClick={() => setActiveHubIndex(index)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeHubIndex === index
                      ? 'bg-[#19C37D] text-[#07110F]'
                      : 'bg-[#122620] text-slate-300 hover:text-white border border-[#1D382E]'
                  }`}
                >
                  {hub.city}
                </button>
              ))}
            </div>
          </div>

          {/* Hub Dynamic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-[#07120F] border border-[#162A22]">
              <span className="text-xs text-slate-400 block mb-1">Selected Trade Node</span>
              <span className="text-xl font-display font-bold text-white block">
                {activeHub.city}, {activeHub.country}
              </span>
              <span className="text-xs text-[#19C37D] block mt-1">Native Currency: {activeHub.currency}</span>
            </div>

            <div className="p-4 rounded-xl bg-[#07120F] border border-[#162A22]">
              <span className="text-xs text-slate-400 block mb-1">Primary Commerce Sectors</span>
              <span className="text-sm font-semibold text-slate-200 block line-clamp-2">
                {activeHub.tradeType}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#07120F] border border-[#162A22]">
              <span className="text-xs text-slate-400 block mb-1">Daily Recorded Velocity</span>
              <span className="text-xl font-display font-extrabold text-[#19C37D] tabular-nums block">
                {activeHub.dailyVelocity}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Across verified merchants</span>
            </div>

            <div className="p-4 rounded-xl bg-[#07120F] border border-[#162A22]">
              <span className="text-xs text-slate-400 block mb-1">Active Merchants</span>
              <span className="text-xl font-display font-extrabold text-white tabular-nums block">
                {activeHub.activeBusinesses}
              </span>
              <span className="text-[11px] text-[#19C37D] block mt-1">Growing 24% MoM</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
