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
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border p-5 sm:p-6 shadow-2xl transition-all ${
          isDark ? 'bg-[#0D1B2E] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
        }`}
      >
        <div className={`flex items-center justify-between pb-4 mb-4 border-b ${isDark ? 'border-[#243B56]' : 'border-[#DCE6F0]'}`}>
          <div>
            <h2 className="text-lg font-heading font-semibold tracking-tight">
              {customerToEdit ? 'Edit Customer' : 'Add Customer'}
            </h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Save customer details, credit balances, and contacts
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-slate-500 hover:text-[#0F172A] hover:bg-black/5'
            }`}
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
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
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
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
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
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
              Email (optional)
            </label>
            <input
              type="email"
              placeholder="e.g. folake@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
          </div>

          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
              Initial outstanding balance (₦)
            </label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={initialDebt}
              onChange={(e) => setInitialDebt(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
            <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              Enter amount if this customer currently owes you money.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] rounded-xl transition-all shadow-sm shadow-[#2563EB]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <span>{customerToEdit ? 'Save Changes' : 'Add Customer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
