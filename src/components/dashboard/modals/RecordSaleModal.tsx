import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { db, Product, Customer } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';

interface RecordSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  onSaleRecorded?: () => void;
}

export const RecordSaleModal: React.FC<RecordSaleModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  onSaleRecorded,
}) => {
  const { isDark } = useTheme();

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'completed' | 'debt'>('completed');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const computedAmount = selectedProduct ? selectedProduct.sellingPrice * quantity : 0;
  const finalAmount = customAmount ? parseFloat(customAmount) : computedAmount;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      setError('Please select a product.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (finalAmount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    const customer = customers.find((c) => c.id === selectedCustomerId);

    // If sale is on credit / debt, register debt for customer
    if (paymentStatus === 'debt') {
      if (!selectedCustomerId) {
        setError('Please select a customer when recording a sale on credit/debt.');
        return;
      }
      db.addTransaction({
        type: 'debt',
        title: `Credit Sale: ${quantity} × ${selectedProduct.name}`,
        amount: finalAmount,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        cost: selectedProduct.costPrice,
        customerId: customer?.id,
        customerName: customer?.name,
        status: 'completed',
        category: 'Sales',
        notes: notes || 'Purchased on store credit',
        date: new Date().toISOString(),
      });
    } else {
      db.addTransaction({
        type: 'sale',
        title: `Sale: ${quantity} × ${selectedProduct.name}`,
        amount: finalAmount,
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity,
        cost: selectedProduct.costPrice,
        customerId: customer?.id,
        customerName: customer?.name,
        status: 'completed',
        category: 'Sales',
        notes: notes || 'Paid in full',
        date: new Date().toISOString(),
      });
    }

    onSaleRecorded?.();
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
            <h2 className="text-lg font-heading font-semibold tracking-tight">Record Sale</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>Add a verified sale to your business ledger</p>
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
          {/* Select Product */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
              Product sold
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomAmount('');
                setError('');
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none cursor-pointer font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} className={isDark ? 'bg-[#0D1B2E]' : 'bg-white'}>
                  {p.name} — ₦{p.sellingPrice.toLocaleString()} ({p.stock} in stock)
                </option>
              ))}
            </select>
            {selectedProduct && selectedProduct.costPrice === null && (
              <p className="text-[11px] text-amber-500 dark:text-amber-400 mt-1 flex items-center gap-1 font-mono">
                <span>Cost not set for this product. Revenue will record, but gross profit will show "Cost not set".</span>
              </p>
            )}
          </div>

          {/* Quantity & Unit Amount */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => {
                  setQuantity(Math.max(1, parseInt(e.target.value) || 1));
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
                Total amount (₦)
              </label>
              <input
                type="number"
                placeholder={computedAmount ? `${computedAmount}` : '0'}
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-sans ${
                  isDark
                    ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                    : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                }`}
              />
            </div>
          </div>

          {/* Customer (Optional or required if debt) */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
              Customer (optional)
            </label>
            <select
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none cursor-pointer font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            >
              <option value="">Walk-in / anonymous customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id} className={isDark ? 'bg-[#0D1B2E]' : 'bg-white'}>
                  {c.name} {c.outstandingBalance > 0 ? `(Owes ₦${c.outstandingBalance.toLocaleString()})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
              Payment mode
            </label>
            <div className="grid grid-cols-2 gap-2 font-sans">
              <button
                type="button"
                onClick={() => setPaymentStatus('completed')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                  paymentStatus === 'completed'
                    ? isDark
                      ? 'bg-[#60A5FA] text-[#07111F] border-[#60A5FA] font-bold shadow-xs'
                      : 'bg-[#2563EB] text-white border-[#2563EB] font-bold shadow-xs'
                    : isDark
                    ? 'border-[#243B56] text-slate-300 hover:bg-white/5'
                    : 'border-[#DCE6F0] text-[#475569] hover:bg-black/5'
                }`}
              >
                Paid in Full (Cash/Transfer)
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('debt')}
                className={`py-2 px-3 rounded-xl border text-xs font-medium cursor-pointer transition-colors ${
                  paymentStatus === 'debt'
                    ? 'bg-amber-500 text-[#07111F] border-amber-500 font-bold shadow-xs'
                    : isDark
                    ? 'border-[#243B56] text-slate-300 hover:bg-white/5'
                    : 'border-[#DCE6F0] text-[#475569] hover:bg-black/5'
                }`}
              >
                On Credit / Unpaid Debt
              </button>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}>
              Notes (optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via GTBank transfer, delivery included"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={`w-full px-3.5 py-2.5 rounded-xl border outline-none font-sans ${
                isDark
                  ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                  : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
              }`}
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] rounded-xl transition-all shadow-sm shadow-[#2563EB]/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]"
            >
              <span>Record ₦{finalAmount.toLocaleString()} Sale</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
