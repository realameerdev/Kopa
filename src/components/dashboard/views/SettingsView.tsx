import React, { useState } from 'react';
import {
  Settings,
  Building,
  Bell,
  Sun,
  Moon,
  LogOut,
  CheckCircle2,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { db, BusinessSettings } from '../../../lib/db';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { ConnectedAppsView } from './ConnectedAppsView';

interface SettingsViewProps {
  onLogout: () => void;
  defaultTab?: 'profile' | 'connectors';
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, defaultTab = 'profile' }) => {
  const { isDark, toggleTheme } = useTheme();
  const { logoutUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'connectors'>(defaultTab);

  const [formData, setFormData] = useState<BusinessSettings>(db.getSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (field: keyof BusinessSettings, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    db.updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const handleResetData = () => {
    db.resetToSampleData();
    setFormData(db.getSettings());
    setResetConfirmOpen(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleRealLogout = () => {
    logoutUser();
    onLogout();
  };

  const categories = [
    'Fashion & Apparel',
    'Food, Beverage & Hospitality',
    'Retail & General Merchant',
    'Electronics, Phones & Tech',
    'Beauty, Salon & Personal Care',
    'Agriculture, Produce & Farming',
    'Logistics, Transport & Delivery',
    'Professional & Creative Services',
    'Other Business',
  ];

  const currencies = [
    { label: 'Nigerian Naira (₦)', code: 'NGN', symbol: '₦' },
    { label: 'Kenyan Shilling (KSh)', code: 'KES', symbol: 'KSh' },
    { label: 'Ghanaian Cedi (GH₵)', code: 'GHS', symbol: 'GH₵' },
    { label: 'South African Rand (R)', code: 'ZAR', symbol: 'R' },
    { label: 'US Dollar ($)', code: 'USD', symbol: '$' },
    { label: 'British Pound (£)', code: 'GBP', symbol: '£' },
    { label: 'Euro (€)', code: 'EUR', symbol: '€' },
  ];

  const connectedCount = db.getConnectors().filter((c) => c.status === 'connected').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-[#1C382E]/40 w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'profile'
              ? 'bg-emerald-500 text-black font-semibold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Business Profile & Preferences</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('connectors')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
            activeTab === 'connectors'
              ? 'bg-emerald-500 text-black font-semibold shadow-xs'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Connected Apps ({connectedCount})</span>
        </button>
      </div>

      {activeTab === 'connectors' ? (
        <ConnectedAppsView />
      ) : (
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-xl sm:text-2xl font-heading font-medium tracking-tight">
              Settings & Preferences
            </h1>
            <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400">
              Manage your business profile, operating currency, notification alerts, and account security
            </p>
          </div>

          {savedSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings updated successfully.</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            {/* 1. Business Profile */}
            <div
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
                <Building className="w-4 h-4 text-[#B8F36B]" />
                <h2 className="text-sm font-heading font-medium">Business Profile</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange('businessName', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B8F36B] ${
                      isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                    }`}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                    Primary Industry / Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B8F36B] ${
                      isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                    }`}
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                    Operating Country
                  </label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => handleChange('country', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B8F36B] ${
                      isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                    Primary Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => {
                      const cur = currencies.find((c) => c.code === e.target.value);
                      if (cur) {
                        setFormData((prev) => ({
                          ...prev,
                          currency: cur.code,
                          currencySymbol: cur.symbol,
                        }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B8F36B] ${
                      isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                    }`}
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-300">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm focus:outline-hidden focus:ring-1 focus:ring-[#B8F36B] ${
                      isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* 2. Notification Preferences */}
            <div
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
              }`}
            >
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
                <Bell className="w-4 h-4 text-[#B8F36B]" />
                <h2 className="text-sm font-heading font-medium">Alert Notifications</h2>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div>
                    <span className="text-xs sm:text-sm font-medium">Low Stock Alerts</span>
                    <p className="text-xs text-[#69746F] dark:text-slate-400">
                      Notify when inventory reaches minimum restock thresholds
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifyLowStock}
                    onChange={(e) => handleChange('notifyLowStock', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div>
                    <span className="text-xs sm:text-sm font-medium">Debtor & Receivables Reminders</span>
                    <p className="text-xs text-[#69746F] dark:text-slate-400">
                      Alert on overdue customer credit balances and payments
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifyDebts}
                    onChange={(e) => handleChange('notifyDebts', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 cursor-pointer">
                  <div>
                    <span className="text-xs sm:text-sm font-medium">Daily Performance Summary</span>
                    <p className="text-xs text-[#69746F] dark:text-slate-400">
                      Receive end-of-day revenue, cash inflow, and gross profit breakdown
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={formData.notifyDailySummary}
                    onChange={(e) => handleChange('notifyDailySummary', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            {/* 3. Appearance */}
            <div
              className={`p-6 rounded-2xl border ${
                isDark ? 'bg-[#10251E]/40 border-[#1C382E]' : 'bg-white border-[#DEE3DE] shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-heading font-medium">Appearance & Theme</h2>
                  <p className="text-xs text-[#69746F] dark:text-slate-400">
                    Switch between Kopa Deep Forest Dark mode and Warm Ivory Light mode
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleTheme()}
                  className={`p-2.5 rounded-xl border flex items-center gap-2 text-xs font-medium cursor-pointer ${
                    isDark ? 'bg-[#08110F] border-[#1C382E] text-white' : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916]'
                  }`}
                >
                  {isDark ? <Sun className="w-4 h-4 text-[#B8F36B]" /> : <Moon className="w-4 h-4 text-[#111916]" />}
                  <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="min-h-[44px] px-6 py-2.5 text-xs sm:text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] rounded-xl transition-all shadow-xs cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>

          {/* Database Management & Logout */}
          <div
            className={`p-6 rounded-2xl border border-red-500/20 ${
              isDark ? 'bg-red-500/5' : 'bg-red-50/50'
            }`}
          >
            <h3 className="text-sm font-heading font-medium text-red-400 mb-2">Workspace Actions</h3>
            <p className="text-xs text-[#69746F] dark:text-slate-400 mb-4">
              Sign out of your active workspace session.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleRealLogout}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
