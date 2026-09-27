import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Sparkles,
  Receipt,
  Package,
  Users,
  CreditCard,
  ShieldCheck,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  PlusCircle,
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { KopaLogo } from '../KopaLogo';
import { ThemeToggle } from '../ThemeToggle';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/db';

// Views
import { OverviewView } from './views/OverviewView';
import { AskKopaView } from './views/AskKopaView';
import { TransactionsView } from './views/TransactionsView';
import { ProductsView } from './views/ProductsView';
import { CustomersView } from './views/CustomersView';
import { ExpensesView } from './views/ExpensesView';
import { PassportView } from './views/PassportView';
import { SettingsView } from './views/SettingsView';
import { ConnectedAppsView } from './views/ConnectedAppsView';

// Quick Action Modals
import { RecordSaleModal } from './modals/RecordSaleModal';
import { AddExpenseModal } from './modals/AddExpenseModal';
import { AddProductModal } from './modals/AddProductModal';
import { AddCustomerModal } from './modals/AddCustomerModal';
import { RecordPaymentModal } from './modals/RecordPaymentModal';

interface DashboardShellProps {
  onBackToLanding?: () => void;
}

export const DashboardShell: React.FC<DashboardShellProps> = ({ onBackToLanding }) => {
  const { isDark } = useTheme();
  const { currentUser, logoutUser } = useAuth();

  const [activeView, setActiveView] = useState<string>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  // Modals state
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);

  // Reactive DB subscriptions
  const [, setDbVersion] = useState(0);
  useEffect(() => {
    return db.subscribe(() => {
      setDbVersion((v) => v + 1);
    });
  }, []);

  const settings = db.getSettings();
  const products = db.getProducts();
  const customers = db.getCustomers();
  const notifications = db.getNotifications();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ask-kopa', label: 'Ask Kopa', icon: Sparkles, badge: 'AI' },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'expenses', label: 'Expenses', icon: CreditCard },
    { id: 'connected-apps', label: 'Connected Apps', icon: Layers },
    { id: 'passport', label: 'Business Passport', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logoutUser();
    onBackToLanding?.();
  };

  return (
    <div
      className={`h-screen h-[100dvh] w-full flex overflow-hidden transition-colors duration-200 ${
        isDark ? 'bg-[#08110F] text-white' : 'bg-[#F7F6F0] text-[#111916]'
      }`}
    >
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR (Stationary / Fixed Desktop & Mobile Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 h-full shrink-0 border-r flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${
          isDark
            ? 'bg-[#08110F] border-[#1C382E]'
            : 'bg-[#F7F6F0] border-[#DEE3DE]'
        }`}
      >
        {/* Brand / Logo Top */}
        <div className="h-16 shrink-0 px-6 flex items-center justify-between border-b border-[#DEE3DE] dark:border-[#1A2E27]">
          <div className="flex items-center gap-2">
            <KopaLogo variant="full" theme={isDark ? 'dark' : 'light'} size="sm" />
          </div>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Business Badge */}
        <div className="shrink-0 p-4 mx-3 my-3 rounded-xl border bg-black/5 dark:bg-white/5 border-[#DEE3DE] dark:border-[#1C382E]">
          <div className="text-xs font-semibold truncate text-[#111916] dark:text-white">
            {settings.businessName}
          </div>
          <div className="text-[11px] text-[#69746F] dark:text-slate-400 truncate">
            {settings.category} · {settings.country}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 min-h-0 px-3 space-y-1 overflow-y-auto overscroll-contain">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveView(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#B8F36B] text-[#08110F] font-semibold shadow-xs'
                    : isDark
                    ? 'text-slate-300 hover:text-white hover:bg-white/5'
                    : 'text-[#69746F] hover:text-[#111916] hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#08110F]' : ''}`} />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                      isActive
                        ? 'bg-[#08110F] text-[#B8F36B]'
                        : 'bg-[#B8F36B]/20 text-[#B8F36B]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Sidebar: Return to Landing Page + Sign Out */}
        <div className="shrink-0 p-3 border-t border-[#DEE3DE] dark:border-[#1A2E27] space-y-1">
          {onBackToLanding && (
            <button
              type="button"
              onClick={onBackToLanding}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#69746F] hover:text-[#111916] hover:bg-black/5'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Landing Page</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleLogout}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors text-red-400 hover:bg-red-500/10 cursor-pointer`}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* TOP BAR (Stationary Header) */}
        <header
          className={`shrink-0 h-16 border-b flex items-center justify-between px-4 sm:px-6 lg:px-8 backdrop-blur-xl z-30 transition-colors ${
            isDark ? 'bg-[#08110F]/90 border-[#1A2E27]' : 'bg-[#F7F6F0]/90 border-[#DEE3DE]'
          }`}
        >
          {/* Left: Mobile hamburger + Business name */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-white lg:hidden cursor-pointer"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm font-semibold tracking-tight">{settings.businessName}</span>
              <span className="text-xs text-[#69746F] dark:text-slate-400 block font-normal">
                {settings.category}
              </span>
            </div>
          </div>

          {/* Center Search (Quick Filter across views) */}
          <div className="flex-1 max-w-xs sm:max-w-sm mx-4">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#69746F] dark:text-slate-400" />
              <input
                type="text"
                placeholder="Ask Kopa or search records..."
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && globalSearch.trim()) {
                    setActiveView('ask-kopa');
                  }
                }}
                className={`w-full pl-8 pr-3 py-1.5 rounded-xl border text-xs outline-none ${
                  isDark
                    ? 'bg-[#10251E]/60 border-[#1C382E] text-white focus:border-[#B8F36B]'
                    : 'bg-white border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                }`}
              />
            </div>
          </div>

          {/* Right Controls: Notifications, Theme, Profile */}
          <div className="flex items-center gap-2">
            {/* Quick Actions Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setQuickActionsOpen(!quickActionsOpen)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#B8F36B] text-[#08110F] text-xs font-semibold hover:bg-[#A5E852] transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Quick Action</span>
                <ChevronDown className="w-3 h-3 ml-0.5" />
              </button>

              {quickActionsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-48 rounded-2xl border p-2 shadow-2xl z-50 ${
                    isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
                  }`}
                  onClick={() => setQuickActionsOpen(false)}
                >
                  <button
                    type="button"
                    onClick={() => setIsRecordSaleOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-[#B8F36B]/20 hover:text-[#B8F36B] transition-colors cursor-pointer"
                  >
                    Record Sale
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddExpenseOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Add Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecordPaymentOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Record Debt Payment
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddProductOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Add Product
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddCustomerOpen(true)}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Add Customer
                  </button>
                </div>
              )}
            </div>

            {/* Notifications Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className={`p-2 rounded-xl border relative transition-colors cursor-pointer ${
                  isDark
                    ? 'border-[#1C382E] text-slate-300 hover:text-white hover:bg-white/5'
                    : 'border-[#DEE3DE] text-[#69746F] hover:text-[#111916] hover:bg-black/5'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B8F36B] text-[#08110F] text-[9px] font-bold flex items-center justify-center">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`absolute right-0 mt-2 w-80 rounded-2xl border p-4 shadow-2xl z-50 ${
                    isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#DEE3DE] dark:border-[#1A2E27]">
                    <span className="text-xs font-heading font-semibold">Notifications</span>
                    <div className="flex items-center gap-2">
                      {notifications.some((n) => !n.read) && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            db.markAllNotificationsRead();
                          }}
                          className="text-[10px] text-[#B8F36B] hover:underline cursor-pointer"
                        >
                          Mark all read
                        </button>
                      )}
                      <span className="text-[10px] text-[#69746F] dark:text-slate-400 font-mono">
                        {notifications.length} alerts
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            db.markNotificationRead(n.id);
                            if (n.actionUrl) {
                              const target = n.actionUrl.replace('#', '');
                              setActiveView(target);
                            }
                            setNotificationsOpen(false);
                          }}
                          className={`p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            !n.read ? 'border-amber-500/40 bg-amber-500/5' : ''
                          } ${
                            isDark
                              ? 'bg-[#10251E]/60 border-[#1C382E] hover:border-[#B8F36B]'
                              : 'bg-[#F7F6F0] border-[#DEE3DE] hover:border-black/30'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1.5 font-medium mb-1">
                            <div className="flex items-center gap-1.5 truncate">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate">{n.title}</span>
                            </div>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B8F36B] shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[#69746F] dark:text-slate-400 leading-snug">
                            {n.message}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-[#69746F] dark:text-slate-400 text-center py-4">
                        All business alerts clear.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <ThemeToggle size="sm" />

            {/* Profile Avatar / Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="w-8 h-8 rounded-full bg-[#B8F36B] text-[#08110F] font-bold text-xs flex items-center justify-center cursor-pointer shadow-xs"
              >
                {settings.ownerName ? settings.ownerName.charAt(0) : 'K'}
              </button>

              {profileMenuOpen && (
                <div
                  className={`absolute right-0 mt-2 w-52 rounded-2xl border p-2 shadow-2xl z-50 ${
                    isDark ? 'bg-[#08110F] border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
                  }`}
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#DEE3DE] dark:border-[#1A2E27] mb-1">
                    <span className="text-xs font-semibold block text-[#111916] dark:text-white">
                      {settings.ownerName}
                    </span>
                    <span className="text-[11px] text-[#69746F] dark:text-slate-400 block truncate">
                      {settings.email}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveView('settings')}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#111916] dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Settings & Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveView('passport')}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-[#111916] dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    Business Passport
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ACTIVE VIEW CONTENT (Dedicated scrolling area; stationary/full-height for ask-kopa) */}
        <main
          className={`flex-1 min-h-0 ${
            activeView === 'ask-kopa'
              ? 'overflow-hidden flex flex-col p-0 pb-16 lg:pb-0'
              : 'overflow-y-auto overflow-x-hidden p-3.5 sm:p-6 lg:p-8 pb-24 lg:pb-8 overscroll-contain'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className={activeView === 'ask-kopa' ? 'h-full flex flex-col min-h-0' : ''}
            >
              {activeView === 'dashboard' && (
                <OverviewView
                  onNavigate={(view) => setActiveView(view)}
                  onOpenRecordSale={() => setIsRecordSaleOpen(true)}
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                  onOpenAddProduct={() => setIsAddProductOpen(true)}
                  onOpenAddCustomer={() => setIsAddCustomerOpen(true)}
                  onOpenRecordPayment={() => setIsRecordPaymentOpen(true)}
                />
              )}

              {activeView === 'ask-kopa' && <AskKopaView />}

              {activeView === 'transactions' && (
                <TransactionsView
                  onOpenRecordSale={() => setIsRecordSaleOpen(true)}
                  onOpenAddExpense={() => setIsAddExpenseOpen(true)}
                />
              )}

              {activeView === 'products' && <ProductsView />}

              {activeView === 'customers' && <CustomersView />}

              {activeView === 'expenses' && <ExpensesView />}

              {activeView === 'connected-apps' && <ConnectedAppsView />}

              {activeView === 'passport' && <PassportView />}

              {activeView === 'settings' && <SettingsView onLogout={handleLogout} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* MOBILE BOTTOM NAVIGATION BAR (Thumb-friendly on mobile devices) */}
        <nav
          className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl px-2 py-1.5 flex items-center justify-around transition-colors ${
            isDark ? 'bg-[#08110F]/95 border-[#1A2E27]' : 'bg-[#F7F6F0]/95 border-[#DEE3DE]'
          }`}
          aria-label="Mobile Navigation"
        >
          {[
            { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
            { id: 'ask-kopa', label: 'Ask Kopa', icon: Sparkles },
            { id: 'transactions', label: 'Sales', icon: Receipt },
            { id: 'products', label: 'Products', icon: Package },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveView(item.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg min-w-[56px] text-[10px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#15803D] dark:text-[#B8F36B] font-semibold'
                    : isDark
                    ? 'text-slate-400 hover:text-white'
                    : 'text-[#48534E] hover:text-[#111916]'
                }`}
              >
                <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-[#15803D] dark:text-[#B8F36B]' : ''}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg min-w-[56px] text-[10px] font-medium transition-colors cursor-pointer ${
              mobileSidebarOpen
                ? 'text-[#15803D] dark:text-[#B8F36B] font-semibold'
                : isDark
                ? 'text-slate-400 hover:text-white'
                : 'text-[#48534E] hover:text-[#111916]'
            }`}
          >
            <Menu className="w-4 h-4 mb-0.5" />
            <span>More</span>
          </button>
        </nav>
      </div>

      {/* QUICK ACTION MODALS */}
      <RecordSaleModal
        isOpen={isRecordSaleOpen}
        onClose={() => setIsRecordSaleOpen(false)}
        products={products}
        customers={customers}
      />

      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
      />

      <AddProductModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
      />

      <AddCustomerModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
      />

      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => setIsRecordPaymentOpen(false)}
        customers={customers}
      />
    </div>
  );
};
