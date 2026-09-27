import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { db } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExpenseAdded?: () => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onExpenseAdded,
}) => {
  const { isDark } = useTheme();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Inventory & Supplies');
  const [description, setDescription] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const categories = [
    'Inventory & Supplies',
    'Utilities & Power',
    'Rent & Workshop',
    'Logistics & Delivery',
    'Packaging',
    'Salaries & Casual Labor',
    'Equipment & Repairs',
    'Marketing & Ads',
    'Other Operating Expense',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid expense amount.');
      return;
    }
    if (!description.trim()) {
      setError('Please provide a brief description.');
      return;
    }

    db.addTransaction({
      type: 'expense',
      title: description.trim(),
      amount: parsedAmount,
      status: 'completed',
      category,
      notes: isRecurring ? 'Recurring monthly/weekly expense' : '',
      date: new Date().toISOString(),
    });

    onExpenseAdded?.();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
          isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
          <div>
            <h2 className="text-lg font-heading font-medium tracking-tight">Add Expense</h2>
            <p className="text-xs text-[#69746F] dark:text-slate-400">Record a business expense or operational payout</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-500 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Amount (₦)
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setError('');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            >
              {categories.map((c) => (
                <option key={c} value={c} className={isDark ? 'bg-[#08110F]' : 'bg-white'}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Description / Reason
            </label>
            <input
              type="text"
              placeholder="e.g. 25L diesel for workshop generator"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError('');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="is-recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded text-[#B8F36B] focus:ring-[#B8F36B] cursor-pointer"
            />
            <label htmlFor="is-recurring" className="text-xs text-[#69746F] dark:text-slate-300 cursor-pointer">
              This is a recurring business expense (weekly/monthly)
            </label>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer"
            >
              <span>Record Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
