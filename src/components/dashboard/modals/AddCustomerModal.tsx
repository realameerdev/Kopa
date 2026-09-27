import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { db, Customer } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface AddCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  customerToEdit?: Customer | null;
  onCustomerSaved?: () => void;
}

export const AddCustomerModal: React.FC<AddCustomerModalProps> = ({
  isOpen,
  onClose,
  customerToEdit,
  onCustomerSaved,
}) => {
  const { isDark } = useTheme();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [initialDebt, setInitialDebt] = useState('0');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (customerToEdit) {
        setName(customerToEdit.name);
        setPhone(customerToEdit.phone);
        setEmail(customerToEdit.email || '');
        setInitialDebt(`${customerToEdit.outstandingBalance}`);
      } else {
        setName('');
        setPhone('');
        setEmail('');
        setInitialDebt('0');
      }
      setError('');
    }
  }, [isOpen, customerToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!phone.trim()) {
      setError('Contact phone number is required.');
      return;
    }

    const parsedDebt = parseFloat(initialDebt) || 0;

    if (customerToEdit) {
      db.updateCustomer(customerToEdit.id, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        outstandingBalance: parsedDebt,
      });
    } else {
      const newCust = db.addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        outstandingBalance: parsedDebt,
      });

      if (parsedDebt > 0) {
        db.addTransaction({
          type: 'debt',
          title: `Initial Outstanding Debt: ${name.trim()}`,
          amount: parsedDebt,
          customerId: newCust.id,
          customerName: newCust.name,
          status: 'completed',
          category: 'Customer Debt',
          notes: 'Opening balance recorded',
          date: new Date().toISOString(),
        });
      }
    }

    onCustomerSaved?.();
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
            <h2 className="text-lg font-heading font-medium tracking-tight">
              {customerToEdit ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <p className="text-xs text-[#69746F] dark:text-slate-400">
              Save customer details, credit balances, and contacts
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
              Customer name
            </label>
            <input
              type="text"
              placeholder="e.g. Folake Adeyemi"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
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
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              placeholder="e.g. +234 802 441 9920"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
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
              Email (optional)
            </label>
            <input
              type="email"
              placeholder="e.g. folake@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
              Initial outstanding balance (₦)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={initialDebt}
              onChange={(e) => setInitialDebt(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none ${
                isDark
                  ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                  : 'bg-[#F7F6F0]/70 border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
              }`}
            />
            <p className="text-[11px] text-[#69746F] dark:text-slate-400 mt-1">
              Enter amount if this customer currently owes you money.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 cursor-pointer"
            >
              <span>{customerToEdit ? 'Save Changes' : 'Add Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
