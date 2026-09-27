import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  DollarSign,
  Search,
  Phone,
  Mail,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { db, Customer } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { AddCustomerModal } from '../modals/AddCustomerModal';
import { RecordPaymentModal } from '../modals/RecordPaymentModal';

export const CustomersView: React.FC = () => {
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingCustomerId, setPayingCustomerId] = useState<string>('');

  const settings = db.getSettings();
  const currencySymbol = settings.currencySymbol || '₦';
  const customers = db.getCustomers();

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this customer?')) {
      db.deleteCustomer(id);
    }
  };

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsCustomerModalOpen(true);
  };

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setIsCustomerModalOpen(true);
  };

  const handleOpenPayment = (customerId: string) => {
    setPayingCustomerId(customerId);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-[#111916] dark:text-white">
            Customers & Debtors
          </h1>
          <p className="text-xs sm:text-sm text-[#48534E] dark:text-slate-400">
            Customer relationships, purchase history, and outstanding credit balances
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] hover:opacity-90 cursor-pointer self-start sm:self-auto shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#69746F] dark:text-slate-400" />
        <input
          type="text"
          placeholder="Search customers by name, phone or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
            isDark
              ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
              : 'bg-white border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
          }`}
        />
      </div>

      {/* Customers Table */}
      <div
        className={`rounded-2xl border overflow-hidden ${
          isDark ? 'bg-[#10251E]/30 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead
              className={`border-b text-[11px] font-mono uppercase tracking-wider ${
                isDark ? 'bg-[#08110F] border-[#1C382E] text-slate-400' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#48534E]'
              }`}
            >
              <tr>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-right">Total Purchases</th>
                <th className="py-3 px-4 text-right">Outstanding Debt</th>
                <th className="py-3 px-4">Last Activity</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEE3DE] dark:divide-[#1A2E27]">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => {
                  const hasDebt = c.outstandingBalance > 0;

                  return (
                    <tr
                      key={c.id}
                      className={`transition-colors ${
                        isDark ? 'hover:bg-white/5' : 'hover:bg-black/5'
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-semibold block">{c.name}</span>
                        {hasDebt && (
                          <span className="text-[10px] text-amber-500 font-mono">
                            Pending debt
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#69746F] dark:text-slate-300">
                        <div className="space-y-0.5">
                          <span className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-[#69746F]" />
                            {c.phone}
                          </span>
                          {c.email && (
                            <span className="flex items-center gap-1 text-[11px]">
                              <Mail className="w-3 h-3 text-[#69746F]" />
                              {c.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-medium">
                        {currencySymbol}
                        {c.totalPurchases.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        {hasDebt ? (
                          <span className="text-amber-700 dark:text-amber-400 font-bold">
                            {currencySymbol}
                            {c.outstandingBalance.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-emerald-700 dark:text-emerald-400 font-medium text-xs">Settled</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-[#69746F] dark:text-slate-400">
                        {new Date(c.lastActivity).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {hasDebt && (
                          <button
                            type="button"
                            onClick={() => handleOpenPayment(c.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-[#15803D] dark:bg-[#B8F36B] text-white dark:text-[#08110F] hover:opacity-90 mr-2 cursor-pointer shadow-xs"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Collect</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleEdit(c)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#111916] hover:bg-black/5 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 mr-1 cursor-pointer transition-colors"
                          title="Edit customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-500/10 dark:text-red-400 dark:hover:text-red-300 cursor-pointer transition-colors"
                          title="Delete customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#69746F] dark:text-slate-400">
                    <p className="font-medium text-sm text-[#111916] dark:text-slate-200">
                      Your business activity will appear here once you start recording it.
                    </p>
                    <p className="text-[11px] mt-1 text-[#69746F] dark:text-slate-400">
                      No customers recorded yet. Click "Add Customer" or record a sale to a customer.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddCustomerModal
        isOpen={isCustomerModalOpen}
        onClose={() => setIsCustomerModalOpen(false)}
        customerToEdit={editingCustomer}
      />

      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        customers={customers}
        preselectedCustomerId={payingCustomerId}
      />
    </div>
  );
};
