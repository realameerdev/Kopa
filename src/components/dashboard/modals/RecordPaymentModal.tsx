import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { db, Customer } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  preselectedCustomerId?: string;
  onPaymentRecorded?: () => void;
}

export const RecordPaymentModal: React.FC<RecordPaymentModalProps> = ({
  isOpen,
  onClose,
  customers,
  preselectedCustomerId,
  onPaymentRecorded,
}) => {
  const { isDark } = useTheme();

  const [customerId, setCustomerId] = useState(
    preselectedCustomerId || customers.find((c) => c.outstandingBalance > 0)?.id || customers[0]?.id || ''
  );
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedCustomer = customers.find((c) => c.id === customerId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setError('Please select a customer.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      setError('Please enter a valid payment amount.');
      return;
    }

    db.addTransaction({
      type: 'payment',
      title: `Debt Payment: ${selectedCustomer.name}`,
      amount: parsedAmount,
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      status: 'completed',
      category: 'Customer Payments',
      notes: notes || 'Paid against outstanding balance',
      date: new Date().toISOString(),
    });

    onPaymentRecorded?.();
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
        className={`w-full max-w-md rounded-2xl border p-6 shadow-2xl transition-all ${
          isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
        }`}
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
          <div>
            <h2 className="text-lg font-heading font-medium tracking-tight">Record Debt Payment</h2>
            <p className="text-xs text-[#69746F] dark:text-slate-400">
              Credit a payment from a customer toward their balance
            </p>
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
              Customer paying
            </label>
            <select
              value={customerId}
              onChange={(e) => {
                setCustomerId(e.target.value);
                setError('');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none cursor-pointer ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            >
              {customers.map((c) => (
                <option key={c.id} value={c.id} className={isDark ? 'bg-[#08110F]' : 'bg-white'}>
                  {c.name} — Current Debt: ₦{c.outstandingBalance.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div
              className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
                isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
              }`}
            >
              <span className="text-[#69746F] dark:text-slate-400">Current Outstanding Debt:</span>
              <span className="font-semibold text-amber-500 dark:text-amber-400">
                ₦{selectedCustomer.outstandingBalance.toLocaleString()}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Amount received (₦)
            </label>
            <input
              type="number"
              min="1"
              placeholder="e.g. 25000"
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
              Payment notes / reference
            </label>
            <input
              type="text"
              placeholder="e.g. Bank transfer reference #84920"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer"
            >
              <span>Record Payment & Update Debt</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
