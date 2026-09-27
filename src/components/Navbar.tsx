import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KopaLogo } from './KopaLogo';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, ArrowUpRight, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenWaitlist?: () => void;
  onOpenAuth?: (mode: 'login' | 'signup') => void;
  onOpenDashboard?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenWaitlist, onOpenAuth, onOpenDashboard }) => {
  const { isDark } = useTheme();
  const { currentUser } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Scroll detection for subtle elevation
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on Escape key press or outside click
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Prevent background scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: 'Problem', href: '#problem' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Product', href: '#product' },
    { label: 'Business Passport', href: '#business-passport' },
    { label: 'Workspace', href: '#dashboard', isAction: true },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <motion.header
      ref={navRef}
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-200 border-b backdrop-blur-xl ${
        isDark
          ? 'bg-[#07111F]/95 border-[#243B56] shadow-[0_4px_24px_rgba(0,0,0,0.4)]'
          : 'bg-[#F7FAFC]/95 border-[#DCE6F0] shadow-[0_4px_20px_rgba(0,0,0,0.05)]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18 gap-4">
          {/* Brand Zone */}
          <a
            href="#"
            className="flex items-center group focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded-lg p-1 transition-transform active:scale-95 shrink-0"
            aria-label="Kopa Home"
            onClick={() => {
              if (mobileMenuOpen) setMobileMenuOpen(false);
            }}
          >
            <KopaLogo
              variant="full"
              theme={isDark ? 'dark' : 'light'}
              size="md"
            />
          </a>

          {/* Desktop Navigation Links */}
          <nav
            className={`hidden md:flex items-center gap-6 lg:gap-8 text-[13.5px] font-medium transition-colors ${
              isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'
            }`}
            aria-label="Main Navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => {
                  if (link.href === '#dashboard' && onOpenDashboard) {
                    e.preventDefault();
                    onOpenDashboard();
                  }
                }}
                className={`relative py-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none rounded whitespace-nowrap ${
                  isDark ? 'hover:text-[#F8FBFF]' : 'hover:text-[#0F172A]'
                }`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden sm:flex items-center gap-2.5 lg:gap-3 shrink-0">
            <ThemeToggle size="sm" />

            {currentUser ? (
              <button
                type="button"
                onClick={() => onOpenDashboard?.()}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] rounded-xl transition-all duration-150 shadow-sm whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none active:scale-[0.98] px-4 py-2 min-h-[40px]"
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
                <span className="max-w-[140px] truncate">{currentUser.businessName || 'Workspace'}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth('login');
                    else onOpenWaitlist?.();
                  }}
                  className={`text-[13px] font-semibold transition-colors duration-150 px-3.5 py-2 min-h-[40px] flex items-center whitespace-nowrap cursor-pointer rounded-xl border focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none ${
                    isDark
                      ? 'border-[#243B56] text-[#D5E2F0] hover:text-[#F8FBFF] hover:bg-white/5'
                      : 'border-[#DCE6F0] text-[#0F172A] hover:bg-black/5'
                  }`}
                >
                  Sign in
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onOpenAuth) onOpenAuth('signup');
                    else onOpenWaitlist?.();
                  }}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] rounded-xl transition-all duration-150 shadow-sm whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none active:scale-[0.98] px-4 py-2 min-h-[40px]"
                >
                  <span>Start with Kopa</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>

          {/* Mobile Controls: Theme toggle + Hamburger */}
          <div className="flex md:hidden items-center gap-2 shrink-0">
            <ThemeToggle size="sm" />

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2.5 min-w-[42px] min-h-[42px] flex items-center justify-center rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none cursor-pointer active:scale-95 ${
                isDark
                  ? 'border-[#1C382E] text-slate-100 bg-[#10251E] hover:bg-[#152e25]'
                  : 'border-[#DEE3DE] text-[#111916] bg-white hover:bg-slate-100'
              }`}
              aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className={`md:hidden border-t py-4 overflow-hidden ${
                isDark ? 'border-[#1A2E27]' : 'border-[#DEE3DE]'
              }`}
            >
              <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={(e) => {
                      setMobileMenuOpen(false);
                      if (link.href === '#dashboard' && onOpenDashboard) {
                        e.preventDefault();
                        onOpenDashboard();
                      }
                    }}
                    className={`px-3.5 py-2.5 min-h-[44px] flex items-center text-sm font-medium rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                      isDark
                        ? 'text-slate-100 hover:text-white hover:bg-white/5'
                        : 'text-[#111916] hover:bg-black/5'
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </nav>

              <div
                className={`pt-3 mt-3 border-t flex flex-col gap-2.5 ${
                  isDark ? 'border-[#1A2E27]' : 'border-[#DEE3DE]'
                }`}
              >
                {currentUser ? (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenDashboard?.();
                    }}
                    className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-[#08110F]" />
                    <span>Enter Workspace ({currentUser.businessName})</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenAuth) onOpenAuth('login');
                        else onOpenWaitlist?.();
                      }}
                      className={`w-full min-h-[44px] flex items-center justify-center py-2.5 text-sm font-semibold rounded-xl border cursor-pointer transition-colors ${
                        isDark
                          ? 'text-slate-100 hover:text-white border-[#1C382E] bg-[#10251E]'
                          : 'text-[#111916] border-[#DEE3DE] bg-white'
                      }`}
                    >
                      Sign in
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        if (onOpenAuth) onOpenAuth('signup');
                        else onOpenWaitlist?.();
                      }}
                      className="w-full min-h-[44px] flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl shadow-sm cursor-pointer"
                    >
                      <span>Start with Kopa</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
