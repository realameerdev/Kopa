import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Trash2,
  Edit2,
  Search,
  PieChart,
  Repeat,
  Calendar,
} from 'lucide-react';
import { db, Expense } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { AddExpenseModal } from '../modals/AddExpenseModal';

export const ExpensesView: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';
  const expenses = db.getExpenses();

  const totalExpenseAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for breakdown
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const categories = Object.keys(categoryTotals);

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this expense record?')) {
      db.deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-[#0F172A] dark:text-[#F8FBFF]">
            Expenses & Payouts
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#D5E2F0]">
            Track operational costs, recurring bills, supplier purchases, and category breakdowns
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#2563EB] dark:bg-[#3B82F6] text-white hover:bg-[#1D4ED8] transition-colors cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Category Breakdown Cards */}
      <div
        className={`p-6 rounded-2xl border ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0] shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-sm font-heading font-semibold text-[#0F172A] dark:text-white">Category Breakdown</h2>
            <p className="text-xs text-[#475569] dark:text-[#D5E2F0] font-medium">Total Recorded: {currencySymbol}{totalExpenseAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Visual Category Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {categories.map((cat) => {
            const catAmount = categoryTotals[cat];
            const pct = totalExpenseAmount > 0 ? Math.round((catAmount / totalExpenseAmount) * 100) : 0;

            return (
              <div
                key={cat}
                className={`p-3.5 rounded-xl border text-xs ${
                  isDark ? 'bg-[#132640] border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
                }`}
              >
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-medium truncate mr-2">{cat}</span>
                  <span className="font-mono text-red-400 font-semibold">
                    {currencySymbol}{catAmount.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden mb-1">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[10px] text-[#69746F] dark:text-slate-400 font-mono">
                  {pct}% of total expenses
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#9FB1C5]" />
          <input
            type="text"
            placeholder="Search expenses by description or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
              isDark
                ? 'bg-[#0D1B2E] border-[#243B56] text-white focus:border-[#60A5FA]'
                : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB]'
            }`}
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`px-3 py-2 text-xs font-medium rounded-xl border cursor-pointer outline-none ${
            isDark ? 'bg-[#0D1B2E] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
          }`}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Expenses Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0] shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                isDark ? 'bg-[#132640] border-[#243B56] text-[#9FB1C5]' : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#475569]'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Type</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE6F0] dark:divide-[#243B56]">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr
                    key={exp.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#475569] dark:text-[#D5E2F0] whitespace-nowrap">
                      {new Date(exp.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#0F172A] dark:text-white">
                      {exp.description}
                    </td>
                    <td className="py-3.5 px-4 text-[#475569] dark:text-[#9FB1C5]">
                      {exp.category}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {exp.isRecurring ? (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 font-medium">
                          <Repeat className="w-3 h-3" />
                          <span>Recurring</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-[#475569] dark:text-slate-400">One-off</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-red-600 dark:text-red-400 whitespace-nowrap">
                      -{currencySymbol}{exp.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(exp.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 cursor-pointer transition-colors"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#64748B] dark:text-slate-400">
                    <p className="font-medium text-sm text-[#0F172A] dark:text-slate-200">
                      Your business activity will appear here once you start recording it.
                    </p>
                    <p className="text-[11px] mt-1 text-[#64748B] dark:text-slate-400">
                      No operational expenses recorded yet. Click "Add Expense" to log your first cost.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
