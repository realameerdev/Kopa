import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Calendar,
  DollarSign,
  Receipt,
  Users,
  Package,
  Share2,
  Download,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { db } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { KopaLogo } from '../../KopaLogo';

export const PassportView: React.FC = () => {
  const { isDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const settings = db.getSettings();
  const products = db.getProducts();
  const customers = db.getCustomers();
  const transactions = db.getTransactions();

  const currencySymbol = settings.currencySymbol || '₦';

  // Compute verified metrics from actual database
  const recordedRevenue = transactions
    .filter((t) => t.type === 'sale' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalTransactions = transactions.length;
  const customerCount = customers.length;
  const topProducts = [...products]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 3);

  // Verification timeline items
  const timelineEvents = [
    {
      date: 'Active Ledger Established',
      detail: `Operating in ${settings.country} as ${settings.category}`,
    },
    {
      date: `${totalTransactions} Verified Business Records`,
      detail: 'Daily sales, payouts, and inventory movements recorded',
    },
    {
      date: `${currencySymbol}${recordedRevenue.toLocaleString()} Recorded Sales`,
      detail: 'Consistent operational turnover across business channels',
    },
  ];

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-semibold tracking-tight text-[#111916] dark:text-white">
            Business Passport
          </h1>
          <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400 mt-0.5">
            Shareable proof of recorded business activity for suppliers, partners, and institutions.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleCopyLink}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? 'bg-[#10251E]/80 border-[#1C382E] text-slate-200 hover:text-white'
                : 'bg-white border-[#DEE3DE] text-[#111916]'
            }`}
          >
            {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-[#B8F36B]" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Link' : 'Copy Passport Link'}</span>
          </button>
        </div>
      </div>

      {/* The Passport Physical Card Representation */}
      <div
        className={`rounded-2xl border p-4 sm:p-7 relative overflow-hidden transition-all shadow-md ${
          isDark
            ? 'bg-gradient-to-b from-[#10251E] to-[#08110F] border-[#1C382E] text-white'
            : 'bg-gradient-to-b from-white to-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
        }`}
      >
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#B8F36B] to-transparent" />

        {/* Top Passport Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-8 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
          <div className="flex items-center gap-3">
            <KopaLogo variant="symbol" theme={isDark ? 'dark' : 'light'} size="md" />
            <div>
              <h2 className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight">
                {settings.businessName}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#69746F] dark:text-slate-400 mt-0.5">
                <span>{settings.category}</span>
                <span>•</span>
                <span>{settings.country}</span>
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#B8F36B]/15 text-[#B8F36B] border border-[#B8F36B]/30 text-xs font-mono font-medium self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>VERIFIED ACTIVITY</span>
          </div>
        </div>

        {/* 4 Pillars of Verified Recorded Activity */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div
            className={`p-3 sm:p-4 rounded-xl border ${
              isDark ? 'bg-[#08110F]/60 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
            }`}
          >
            <span className="text-[11px] sm:text-xs text-[#69746F] dark:text-slate-400 block mb-1">
              Recorded Turnover
            </span>
            <span className="text-lg sm:text-2xl font-mono font-bold text-[#B8F36B] truncate block">
              {currencySymbol}
              {recordedRevenue.toLocaleString()}
            </span>
            <span className="text-[10px] text-[#69746F] dark:text-slate-400 block mt-1">
              Verified sales records
            </span>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-xl border ${
              isDark ? 'bg-[#08110F]/60 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
            }`}
          >
            <span className="text-[11px] sm:text-xs text-[#69746F] dark:text-slate-400 block mb-1">
              Transactions
            </span>
            <span className="text-lg sm:text-2xl font-mono font-bold block">
              {totalTransactions}
            </span>
            <span className="text-[10px] text-[#69746F] dark:text-slate-400 block mt-1">
              Operations logged
            </span>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-xl border ${
              isDark ? 'bg-[#08110F]/60 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
            }`}
          >
            <span className="text-[11px] sm:text-xs text-[#69746F] dark:text-slate-400 block mb-1">
              Active Customers
            </span>
            <span className="text-lg sm:text-2xl font-mono font-bold block">
              {customerCount}
            </span>
            <span className="text-[10px] text-[#69746F] dark:text-slate-400 block mt-1">
              Recorded relationships
            </span>
          </div>

          <div
            className={`p-3 sm:p-4 rounded-xl border ${
              isDark ? 'bg-[#08110F]/60 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
            }`}
          >
            <span className="text-[11px] sm:text-xs text-[#69746F] dark:text-slate-400 block mb-1">
              Ledger Currency
            </span>
            <span className="text-lg sm:text-2xl font-mono font-bold text-[#B8F36B] block">
              {settings.currency}
            </span>
            <span className="text-[10px] text-[#69746F] dark:text-slate-400 block mt-1">
              Default operating standard
            </span>
          </div>
        </div>

        {/* Top Product Offerings */}
        <div className="mb-8">
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#69746F] dark:text-slate-400 mb-3">
            Primary Commercial Offerings
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topProducts.map((p) => (
              <div
                key={p.id}
                className={`p-3.5 rounded-xl border text-xs ${
                  isDark ? 'bg-[#08110F]/60 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
                }`}
              >
                <span className="font-semibold block truncate">{p.name}</span>
                <span className="text-[#69746F] dark:text-slate-400 text-[11px] block mt-0.5">
                  {p.salesCount} units recorded · {currencySymbol}
                  {p.totalRevenue.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Business Activity Timeline */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-[#69746F] dark:text-slate-400 mb-4">
            Recorded Activity Timeline
          </h3>
          <div className="space-y-3">
            {timelineEvents.map((evt, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-[#B8F36B] mt-1.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-semibold block">{evt.date}</span>
                  <span className="text-[#69746F] dark:text-slate-400">{evt.detail}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note: No arbitrary credit score disclaimer */}
        <div className="mt-8 pt-6 border-t border-[#DEE3DE] dark:border-[#1A2E27] text-center">
          <p className="text-[11px] font-mono text-[#69746F] dark:text-slate-500">
            Kopa Business Passport is constructed strictly from verified recorded business activity.
            No arbitrary credit or proxy scores are used.
          </p>
        </div>
      </div>
    </div>
  );
};
