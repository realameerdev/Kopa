import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  HelpCircle,
  Clock,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { db, Product, Customer, Transaction, Expense } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface OverviewViewProps {
  onNavigate: (view: string) => void;
  onOpenRecordSale: () => void;
  onOpenAddExpense: () => void;
  onOpenAddProduct: () => void;
  onOpenAddCustomer: () => void;
  onOpenRecordPayment: () => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onNavigate,
  onOpenRecordSale,
  onOpenAddExpense,
  onOpenAddProduct,
  onOpenAddCustomer,
  onOpenRecordPayment,
}) => {
  const { isDark } = useTheme();
  const [period, setPeriod] = useState<number>(30); // 1 = today, 7 = 7 days, 30 = 30 days, 90 = 90 days, 0 = all

  const settings = db.getSettings();
  const metrics = db.getMetrics(period);
  const products = db.getProducts();
  const customers = db.getCustomers();
  const transactions = db.getTransactions();
  const expenses = db.getExpenses();

  // Top selling products by revenue
  const topSellingProducts = [...products]
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 4);

  // Most profitable products ONLY where cost price exists!
  // Exclude items with costPrice === null
  const profitableProducts = products
    .filter((p) => p.costPrice !== null && p.costPrice !== undefined)
    .map((p) => ({
      ...p,
      unitProfit: p.sellingPrice - (p.costPrice || 0),
      totalProfit: (p.sellingPrice - (p.costPrice || 0)) * p.salesCount,
    }))
    .sort((a, b) => b.totalProfit - a.totalProfit)
    .slice(0, 3);

  // Low stock products
  const lowStockProducts = products.filter((p) => p.stock <= p.minStockAlert);

  // Customers with outstanding debts
  const debtCustomers = customers.filter((c) => c.outstandingBalance > 0);

  // Recent transactions
  const recentTransactions = transactions.slice(0, 5);

  const currencySymbol = settings.currencySymbol || '₦';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight">
            Business Overview
          </h1>
          <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400 mt-0.5">
            Operational financial intelligence for {settings.businessName}
          </p>
        </div>

        {/* Period Filter Tabs */}
        <div
          className={`inline-flex items-center p-1 rounded-xl border text-xs font-medium self-start md:self-auto ${
            isDark ? 'bg-[#10251E]/60 border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
          }`}
        >
          {[
            { label: 'Today', days: 1 },
            { label: '7 days', days: 7 },
            { label: '30 days', days: 30 },
            { label: '90 days', days: 90 },
            { label: 'All time', days: 0 },
          ].map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPeriod(item.days)}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === item.days
                  ? 'bg-[#B8F36B] text-[#08110F] font-semibold shadow-xs'
                  : isDark
                  ? 'text-slate-300 hover:text-white'
                  : 'text-[#69746F] hover:text-[#111916]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Ribbon */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          type="button"
          onClick={onOpenRecordSale}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#B8F36B] text-[#08110F] hover:bg-[#A5E852] transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record Sale</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddExpense}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors shrink-0 cursor-pointer ${
            isDark
              ? 'bg-[#10251E]/80 border-[#1C382E] text-slate-200 hover:text-white hover:bg-white/5'
              : 'bg-white border-[#DEE3DE] text-[#111916] hover:bg-black/5'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
        <button
          type="button"
          onClick={onOpenRecordPayment}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors shrink-0 cursor-pointer ${
            isDark
              ? 'bg-[#10251E]/80 border-[#1C382E] text-slate-200 hover:text-white hover:bg-white/5'
              : 'bg-white border-[#DEE3DE] text-[#111916] hover:bg-black/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Record Debt Payment</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddProduct}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors shrink-0 cursor-pointer ${
            isDark
              ? 'bg-[#10251E]/80 border-[#1C382E] text-slate-200 hover:text-white hover:bg-white/5'
              : 'bg-white border-[#DEE3DE] text-[#111916] hover:bg-black/5'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
        <button
          type="button"
          onClick={onOpenAddCustomer}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl border transition-colors shrink-0 cursor-pointer ${
            isDark
              ? 'bg-[#10251E]/80 border-[#1C382E] text-slate-200 hover:text-white hover:bg-white/5'
              : 'bg-white border-[#DEE3DE] text-[#111916] hover:bg-black/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Add Customer</span>
        </button>
        <button
          type="button"
          onClick={() => onNavigate('ask-kopa')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#15803D]/30 dark:border-[#B8F36B]/40 bg-[#15803D]/10 dark:bg-[#B8F36B]/10 text-[#15803D] dark:text-[#B8F36B] hover:bg-[#15803D]/15 dark:hover:bg-[#B8F36B]/20 transition-colors shrink-0 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ask Kopa</span>
        </button>
      </div>

      {/* Connect External Apps Callout (Shown when no apps are connected) */}
      {db.getConnectors().filter((c) => c.status === 'connected').length === 0 && (
        <div
          className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
            isDark
              ? 'bg-gradient-to-r from-[#10251E] to-[#0A1612] border-emerald-500/30'
              : 'bg-gradient-to-r from-emerald-50 to-white border-emerald-200 shadow-xs'
          }`}
        >
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-heading font-semibold text-[#111916] dark:text-white">
                Connect your business platforms to Kopa
              </h3>
              <p className="text-xs text-[#48534E] dark:text-slate-300 mt-0.5 max-w-xl leading-relaxed">
                Link Shopify, Stripe, WhatsApp, Google, QuickBooks, PayPal, Airtable, or Slack to sync sales, stream payments, and unlock real-time MCP intelligence in Ask Kopa.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('connected-apps')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-semibold hover:bg-emerald-400 transition-all shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Connect Apps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 6 Primary Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Total Revenue */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#48534E] dark:text-slate-400 mb-2 font-medium">
            <span>Total Revenue</span>
            <span className="p-1.5 rounded-lg bg-[#15803D]/10 dark:bg-[#B8F36B]/15 text-[#15803D] dark:text-[#B8F36B]">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight">
            {currencySymbol}
            {metrics.totalRevenue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#48534E] dark:text-slate-400 mt-2 flex items-center gap-1">
            <span>Recorded sales in selected period</span>
          </p>
        </div>

        {/* 2. Total Expenses */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#69746F] dark:text-slate-400 mb-2">
            <span>Total Expenses</span>
            <span className="p-1.5 rounded-lg bg-red-500/10 text-red-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight">
            {currencySymbol}
            {metrics.totalExpenses.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#69746F] dark:text-slate-400 mt-2">
            Operational payouts and costs
          </p>
        </div>

        {/* 3. Estimated Gross Profit */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#48534E] dark:text-slate-400 mb-2 font-medium">
            <div className="flex items-center gap-1">
              <span>Estimated Gross Profit</span>
            </div>
            <span className="p-1.5 rounded-lg bg-[#15803D]/10 dark:bg-[#B8F36B]/15 text-[#15803D] dark:text-[#B8F36B]">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-[#15803D] dark:text-[#B8F36B]">
            {currencySymbol}
            {metrics.estimatedGrossProfit.toLocaleString()}
          </div>
          {metrics.hasIncompleteCostData ? (
            <p className="text-[11px] text-amber-700 dark:text-amber-400 mt-2 flex items-center gap-1 font-medium">
              <AlertTriangle className="w-3 h-3 shrink-0" />
              <span>
                Cost not set on {metrics.itemsWithMissingCostCount} sold item(s). Excluded from profit.
              </span>
            </p>
          ) : (
            <p className="text-[11px] text-[#48534E] dark:text-slate-400 mt-2">
              Based on verified costed inventory
            </p>
          )}
        </div>

        {/* 4. Total Transactions */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#69746F] dark:text-slate-400 mb-2">
            <span>Total Transactions</span>
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Receipt className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight">
            {metrics.totalTransactions}
          </div>
          <p className="text-[11px] text-[#69746F] dark:text-slate-400 mt-2">
            Sales, expenses, and payments
          </p>
        </div>

        {/* 5. Outstanding Customer Debts */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#69746F] dark:text-slate-400 mb-2">
            <span>Outstanding Customer Debts</span>
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight text-amber-500 dark:text-amber-400">
            {currencySymbol}
            {metrics.outstandingDebts.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#69746F] dark:text-slate-400 mt-2">
            {debtCustomers.length} customer(s) with pending balances
          </p>
        </div>

        {/* 6. Current Inventory Value */}
        <div
          className={`p-5 rounded-2xl border transition-all ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-[#69746F] dark:text-slate-400 mb-2">
            <span>Current Inventory Value</span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
              <Package className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-heading font-semibold tracking-tight">
            {currencySymbol}
            {metrics.inventoryValue.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#69746F] dark:text-slate-400 mt-2">
            {metrics.uncostedInventoryItems > 0
              ? `${metrics.uncostedInventoryItems} item(s) uncosted`
              : 'All inventory items costed'}
          </p>
        </div>
      </div>

      {/* Visual Analytics Grid: Revenue vs Expenses comparison + Profit Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue vs Expenses breakdown */}
        <div
          className={`lg:col-span-7 p-6 rounded-2xl border ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm sm:text-base font-heading font-medium">Revenue vs Expenses</h2>
              <p className="text-xs text-[#69746F] dark:text-slate-400">Financial flow comparison</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span className="flex items-center gap-1.5">
                <span className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-[#B8F36B]' : 'bg-[#15803D]'}`} />
                <span>Revenue</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Expenses</span>
              </span>
            </div>
          </div>

          {/* Graphical Proportional Bars */}
          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Revenue</span>
                <span className={`font-mono font-bold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                  {currencySymbol}
                  {metrics.totalRevenue.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      metrics.totalRevenue + metrics.totalExpenses > 0
                        ? Math.min(
                            100,
                            (metrics.totalRevenue / (metrics.totalRevenue + metrics.totalExpenses)) * 100
                          )
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className={`h-full rounded-full ${isDark ? 'bg-[#B8F36B]' : 'bg-[#15803D]'}`}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span>Expenses</span>
                <span className="font-mono text-red-500 font-semibold">
                  {currencySymbol}
                  {metrics.totalExpenses.toLocaleString()}
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-black/10 dark:bg-white/5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      metrics.totalRevenue + metrics.totalExpenses > 0
                        ? Math.min(
                            100,
                            (metrics.totalExpenses / (metrics.totalRevenue + metrics.totalExpenses)) * 100
                          )
                        : 0
                    }%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full bg-red-400 rounded-full"
                />
              </div>
            </div>

            <div
              className={`mt-6 p-4 rounded-xl border text-xs flex justify-between items-center ${
                isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
              }`}
            >
              <div>
                <span className="text-[#48534E] dark:text-slate-400 block font-medium">Operating Net Flow</span>
                <span className="text-base font-semibold font-mono">
                  {currencySymbol}
                  {(metrics.totalRevenue - metrics.totalExpenses).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#48534E] dark:text-slate-400 block">Status</span>
                <span
                  className={`font-semibold ${
                    metrics.totalRevenue >= metrics.totalExpenses ? isDark ? 'text-[#B8F36B]' : 'text-[#15803D]' : 'text-red-500'
                  }`}
                >
                  {metrics.totalRevenue >= metrics.totalExpenses ? 'Cash Positive' : 'Deficit'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Most Profitable Products (Strict Cost Data Enforcement) */}
        <div
          className={`lg:col-span-5 p-6 rounded-2xl border ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm sm:text-base font-heading font-medium">Most Profitable Items</h2>
              <p className="text-xs text-[#48534E] dark:text-slate-400">Strictly where cost data exists</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('products')}
              className={`text-xs hover:underline cursor-pointer font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}
            >
              View all
            </button>
          </div>

          {profitableProducts.length > 0 ? (
            <div className="space-y-3">
              {profitableProducts.map((p) => (
                <div
                  key={p.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                  }`}
                >
                  <div>
                    <span className="font-semibold block">{p.name}</span>
                    <span className="text-[11px] text-[#48534E] dark:text-slate-400">
                      Sold {p.salesCount} × Margin: {currencySymbol}
                      {p.unitProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className={`font-mono font-bold block ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}>
                      +{currencySymbol}
                      {p.totalProfit.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#48534E] dark:text-slate-400">Verified profit</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#48534E] dark:text-slate-400">
              <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-500" />
              <p>No products have verified cost prices yet.</p>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className={`mt-2 hover:underline cursor-pointer font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}
              >
                Set product costs to calculate profit
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Actionable Alerts & Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Low Stock + Debts Alerts */}
        <div className="lg:col-span-6 space-y-6">
          {/* Low Stock Alerts */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-medium">Low-Stock Products ({lowStockProducts.length})</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('products')}
                className={`text-xs hover:underline cursor-pointer font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}
              >
                Restock
              </button>
            </div>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-2">
                {lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                    }`}
                  >
                    <div>
                      <span className="font-medium">{p.name}</span>
                      <span className="text-[11px] text-[#48534E] dark:text-slate-400 block">
                        Threshold: {p.minStockAlert} units
                      </span>
                    </div>
                    <span className="font-mono px-2 py-0.5 rounded text-amber-700 dark:text-amber-400 bg-amber-500/10 font-bold">
                      {p.stock} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#48534E] dark:text-slate-400">All product stock levels healthy.</p>
            )}
          </div>

          {/* Outstanding Customer Debts */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs sm:text-sm font-medium">Outstanding Customer Debts</h3>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('customers')}
                className={`text-xs hover:underline cursor-pointer font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}
              >
                View all
              </button>
            </div>

            {debtCustomers.length > 0 ? (
              <div className="space-y-2">
                {debtCustomers.map((c) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                      isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                    }`}
                  >
                    <div>
                      <span className="font-medium">{c.name}</span>
                      <span className="text-[11px] text-[#48534E] dark:text-slate-400 block">{c.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                        ₦{c.outstandingBalance.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={onOpenRecordPayment}
                        className="px-2.5 py-1 text-[11px] rounded bg-[#B8F36B] text-[#08110F] font-semibold hover:bg-[#A5E852] cursor-pointer shadow-2xs"
                      >
                        Collect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#48534E] dark:text-slate-400">No outstanding customer debts.</p>
            )}
          </div>
        </div>

        {/* Right: Recent Transactions Table */}
        <div
          className={`lg:col-span-6 p-5 rounded-2xl border ${
            isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-heading font-medium">Recent Transactions</h3>
              <p className="text-xs text-[#48534E] dark:text-slate-400">Latest recorded business activity</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('transactions')}
              className={`text-xs hover:underline cursor-pointer font-semibold ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`}
            >
              All transactions →
            </button>
          </div>

          <div className="space-y-2.5">
            {recentTransactions.length > 0 ? (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                    isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                  }`}
                >
                  <div>
                    <span className="font-medium block">{tx.title}</span>
                    <span className="text-[11px] text-[#48534E] dark:text-slate-400">
                      {new Date(tx.date).toLocaleDateString()} · {tx.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono font-bold block ${
                        tx.type === 'sale' || tx.type === 'payment'
                          ? isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'
                          : tx.type === 'expense'
                          ? 'text-red-500'
                          : 'text-amber-500'
                      }`}
                    >
                      {tx.type === 'expense' ? '-' : '+'}
                      {currencySymbol}
                      {tx.amount.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-[#48534E] dark:text-slate-400 capitalize">
                      {tx.type}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-[#48534E] dark:text-slate-400">
                <Receipt className={`w-8 h-8 mx-auto mb-2 opacity-30 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`} />
                <p className="font-medium text-[#111916] dark:text-slate-200">
                  Your business activity will appear here once you start recording it.
                </p>
                <p className="text-[11px] mt-1 text-[#48534E] dark:text-slate-400">
                  Record sales, log operational expenses, or ask Kopa in plain natural language.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
