import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  X,
  Eye,
  AlertTriangle,
  Receipt,
} from 'lucide-react';
import { db, Transaction, TransactionType, TransactionStatus } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface TransactionsViewProps {
  onOpenRecordSale: () => void;
  onOpenAddExpense: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  onOpenRecordSale,
  onOpenAddExpense,
}) => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all'); // all, today, 7d, 30d, 90d

  const [viewingTx, setViewingTx] = useState<Transaction | null>(null);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';
  const transactions = db.getTransactions();

  // Filter logic
  const now = Date.now();
  const filteredTransactions = transactions.filter((t) => {
    // 1. Search text
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.customerName && t.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.productName && t.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    // 2. Type
    const matchesType = typeFilter === 'all' || t.type === typeFilter;

    // 3. Status
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter;

    // 4. Date Range
    let matchesDate = true;
    const txTime = new Date(t.date).getTime();
    if (dateRangeFilter === 'today') {
      matchesDate = txTime >= now - 86400000;
    } else if (dateRangeFilter === '7d') {
      matchesDate = txTime >= now - 7 * 86400000;
    } else if (dateRangeFilter === '30d') {
      matchesDate = txTime >= now - 30 * 86400000;
    } else if (dateRangeFilter === '90d') {
      matchesDate = txTime >= now - 90 * 86400000;
    }

    return matchesSearch && matchesType && matchesStatus && matchesDate;
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this transaction record?')) {
      db.deleteTransaction(id);
      if (viewingTx?.id === id) setViewingTx(null);
      if (editingTx?.id === id) setEditingTx(null);
    }
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTx) return;
    db.updateTransaction(editingTx.id, {
      title: editingTx.title,
      amount: editingTx.amount,
      notes: editingTx.notes,
      status: editingTx.status,
      type: editingTx.type,
      category: editingTx.category,
    });
    setEditingTx(null);
  };

  const types: { label: string; value: string }[] = [
    { label: 'All Types', value: 'all' },
    { label: 'Sales', value: 'sale' },
    { label: 'Expenses', value: 'expense' },
    { label: 'Payments', value: 'payment' },
    { label: 'Purchases', value: 'purchase' },
    { label: 'Refunds', value: 'refund' },
    { label: 'Debts', value: 'debt' },
  ];

  const dateRanges = [
    { label: 'All time', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: '7 days', value: '7d' },
    { label: '30 days', value: '30d' },
    { label: '90 days', value: '90d' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-[#111916] dark:text-white">
            Transactions
          </h1>
          <p className="text-xs sm:text-sm text-[#48534E] dark:text-slate-400">
            Complete business ledger with audit trail, status tracking, and date filters
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenRecordSale}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] hover:opacity-90 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Sale</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-[#DEE3DE] dark:border-[#1C382E] bg-white dark:bg-[#10251E] text-[#111916] dark:text-white hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69746F] dark:text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, customer, product or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-white border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          {/* Date Range Selector */}
          <div
            className={`inline-flex items-center p-1 rounded-xl border text-xs self-start sm:self-auto ${
              isDark ? 'bg-[#10251E]/60 border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
            }`}
          >
            {dateRanges.map((dr) => (
              <button
                key={dr.value}
                type="button"
                onClick={() => setDateRangeFilter(dr.value)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dateRangeFilter === dr.value
                    ? 'bg-[#B8F36B] text-[#08110F] font-semibold shadow-xs'
                    : isDark
                    ? 'text-slate-300 hover:text-white'
                    : 'text-[#69746F] hover:text-[#111916]'
                }`}
              >
                {dr.label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction Types Ribbon & Status filter */}
        <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
          <div className="flex items-center gap-1.5">
            {types.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => setTypeFilter(t.value)}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-xl border whitespace-nowrap cursor-pointer transition-colors ${
                  typeFilter === t.value
                    ? 'bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] border-transparent font-semibold shadow-xs'
                    : isDark
                    ? 'bg-[#10251E]/40 border-[#1C382E] text-slate-300 hover:text-white'
                    : 'bg-white border-[#DEE3DE] text-[#48534E] hover:text-[#111916]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-[#69746F] dark:text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`px-2.5 py-1 rounded-xl text-xs border outline-none cursor-pointer ${
                isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
              }`}
            >
              <option value="all">All statuses</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-[#10251E]/30 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                isDark ? 'bg-[#08110F] border-[#1C382E] text-slate-400' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#69746F]'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Transaction Details</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE3DE] dark:divide-[#1A2E27]">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className={`transition-colors ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#69746F] dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#111916] dark:text-white">
                        {tx.title}
                      </div>
                      {tx.notes && (
                        <div className="text-[11px] text-[#69746F] dark:text-slate-400 truncate max-w-xs">
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono capitalize ${
                          tx.type === 'sale'
                            ? 'bg-[#15803D]/15 text-[#15803D] dark:bg-[#B8F36B]/15 dark:text-[#B8F36B] font-semibold'
                            : tx.type === 'expense'
                            ? 'bg-red-500/15 text-red-600 dark:text-red-400 font-semibold'
                            : tx.type === 'payment'
                            ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 font-semibold'
                            : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#48534E] dark:text-slate-300">
                      {tx.customerName || '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-medium">
                      <span
                        className={
                          tx.type === 'expense'
                            ? 'text-red-600 dark:text-red-400 font-semibold'
                            : 'text-[#15803D] dark:text-[#B8F36B] font-bold'
                        }
                      >
                        {tx.type === 'expense' ? '-' : '+'}
                        {currencySymbol}
                        {tx.amount.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          tx.status === 'completed'
                            ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                            : tx.status === 'pending'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400'
                            : 'bg-red-500/15 text-red-700 dark:text-red-400'
                        }`}
                      >
                        {tx.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        <span className="capitalize">{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setViewingTx(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#111916] hover:bg-black/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 mr-1 cursor-pointer transition-colors"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingTx(tx)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-[#111916] hover:bg-black/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 mr-1 cursor-pointer transition-colors"
                        title="Edit transaction"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(tx.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 cursor-pointer transition-colors"
                        title="Delete transaction"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-xs text-[#69746F] dark:text-slate-400">
                    <p className="font-medium text-sm text-[#111916] dark:text-slate-200">
                      Your business activity will appear here once you start recording it.
                    </p>
                    <p className="text-[11px] mt-1 text-[#69746F] dark:text-slate-400">
                      Click "Record Sale" or "Add Expense" to log your first business record.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW TRANSACTION DETAILS MODAL */}
      {viewingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
            }`}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
              <div className="flex items-center gap-2">
                <Receipt className={`w-4 h-4 ${isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'}`} />
                <h3 className="font-heading font-semibold text-[#111916] dark:text-white">Transaction Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingTx(null)}
                className="p-1 text-slate-500 hover:text-[#111916] dark:text-slate-400 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#48534E] dark:text-slate-400">Transaction ID</span>
                <span className="font-mono text-xs">{viewingTx.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#48534E] dark:text-slate-400">Title</span>
                <span className="font-semibold text-right">{viewingTx.title}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#48534E] dark:text-slate-400">Type</span>
                <span className="capitalize font-mono">{viewingTx.type}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#48534E] dark:text-slate-400">Amount</span>
                <span className={`font-mono font-bold text-base ${
                  viewingTx.type === 'expense'
                    ? 'text-red-500'
                    : isDark ? 'text-[#B8F36B]' : 'text-[#15803D]'
                }`}>
                  {currencySymbol}
                  {viewingTx.amount.toLocaleString()}
                </span>
              </div>
              {viewingTx.productName && (
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#69746F] dark:text-slate-400">Product / Qty</span>
                  <span>
                    {viewingTx.productName} ({viewingTx.quantity || 1} units)
                  </span>
                </div>
              )}
              {viewingTx.cost !== undefined && (
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#69746F] dark:text-slate-400">Unit Cost</span>
                  <span className="font-mono">
                    {viewingTx.cost !== null ? `${currencySymbol}${viewingTx.cost.toLocaleString()}` : 'Cost not set'}
                  </span>
                </div>
              )}
              {viewingTx.customerName && (
                <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                  <span className="text-[#69746F] dark:text-slate-400">Customer</span>
                  <span>{viewingTx.customerName}</span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#69746F] dark:text-slate-400">Status</span>
                <span className="capitalize">{viewingTx.status}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-black/5 dark:border-white/5">
                <span className="text-[#69746F] dark:text-slate-400">Date</span>
                <span>{new Date(viewingTx.date).toLocaleString()}</span>
              </div>
              {viewingTx.notes && (
                <div className="py-1">
                  <span className="text-[#69746F] dark:text-slate-400 block mb-1">Notes</span>
                  <div className="p-2.5 rounded-xl border border-black/10 dark:border-white/10 text-xs">
                    {viewingTx.notes}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-[#DEE3DE] dark:border-[#1A2E27] flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingTx(viewingTx);
                  setViewingTx(null);
                }}
                className="flex-1 py-2 rounded-xl border border-black/20 dark:border-white/20 text-xs font-semibold hover:bg-white/10 cursor-pointer"
              >
                Edit Transaction
              </button>
              <button
                type="button"
                onClick={() => handleDelete(viewingTx.id)}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs font-semibold cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TRANSACTION MODAL */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div
            className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl ${
              isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
            }`}
          >
            <div className="flex justify-between items-center pb-3 mb-4 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
              <h3 className="font-heading font-medium">Edit Transaction</h3>
              <button
                type="button"
                onClick={() => setEditingTx(null)}
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={editingTx.title}
                  onChange={(e) => setEditingTx({ ...editingTx, title: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    isDark ? 'border-[#1C382E] bg-black/40 text-white' : 'border-[#DEE3DE] bg-white text-[#111916]'
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1">Amount ({currencySymbol})</label>
                  <input
                    type="number"
                    value={editingTx.amount}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })
                    }
                    className={`w-full px-3 py-2 rounded-xl border outline-none ${
                      isDark ? 'border-[#1C382E] bg-black/40 text-white' : 'border-[#DEE3DE] bg-white text-[#111916]'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1">Status</label>
                  <select
                    value={editingTx.status}
                    onChange={(e) =>
                      setEditingTx({ ...editingTx, status: e.target.value as TransactionStatus })
                    }
                    className={`w-full px-3 py-2 rounded-xl border outline-none cursor-pointer ${
                      isDark ? 'border-[#1C382E] bg-[#08110F] text-white' : 'border-[#DEE3DE] bg-white text-[#111916]'
                    }`}
                  >
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={editingTx.notes || ''}
                  onChange={(e) => setEditingTx({ ...editingTx, notes: e.target.value })}
                  className={`w-full px-3 py-2 rounded-xl border outline-none ${
                    isDark ? 'border-[#1C382E] bg-black/40 text-white' : 'border-[#DEE3DE] bg-white text-[#111916]'
                  }`}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#B8F36B] text-[#08110F] font-semibold hover:bg-[#A5E852] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
