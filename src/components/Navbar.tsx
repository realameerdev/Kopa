import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KopaLogo } from './KopaLogo';
import { ThemeToggle } from './ThemeToggle';
import { Menu, X, ArrowUpRight, Sparkles, UserCheck } from 'lucide-react';
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
  const [swipePulse, setSwipePulse] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isInteractingTouchRef = useRef(false);

  // Scroll detection: Transition between wide open header and floating consolidated capsule
  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const diff = currentScrollY - lastScrollYRef.current;

    if (currentScrollY <= 25) {
      setScrolled(false);
      setSwipePulse(false);
    } else {
      setScrolled(true);

      // When the user swipes downward (scroll direction up) while scrolled,
      // trigger an interactive spring glow pulse without hiding the header!
      if (diff < -8) {
        setSwipePulse(true);
      }
    }

    lastScrollYRef.current = currentScrollY;
  }, []);

  // Touch gesture listener on mobile to detect downward swipe motion
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartYRef.current = e.touches[0].clientY;
      isInteractingTouchRef.current = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isInteractingTouchRef.current) return;
      const currentY = e.touches[0].clientY;
      const touchDiff = currentY - touchStartYRef.current;

      // Downward swipe detected on mobile -> trigger cool accent pulse
      if (touchDiff > 14 && window.scrollY > 25) {
        setSwipePulse(true);
      }
    };

    const handleTouchEnd = () => {
      isInteractingTouchRef.current = false;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleScroll]);

  // Automatically reset the swipe gesture pulse highlight after animation completes
  useEffect(() => {
    if (swipePulse) {
      const timer = setTimeout(() => {
        setSwipePulse(false);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [swipePulse]);

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
    <header
      ref={navRef}
      className={`fixed top-0 left-0 right-0 z-50 pointer-events-none transition-all duration-300 ${
        scrolled ? 'pt-2.5 sm:pt-3.5' : 'pt-0'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
        <motion.div
          layout
          transition={{
            layout: {
              type: 'spring',
              stiffness: 320,
              damping: 30,
              mass: 0.8,
            },
            scale: {
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            },
            y: {
              duration: 0.45,
              ease: [0.16, 1, 0.3, 1],
            },
          }}
          animate={
            swipePulse
              ? { scale: [1, 1.015, 1], y: [0, 2, 0] }
              : { scale: 1, y: 0 }
          }
          className={`pointer-events-auto relative w-full transition-all duration-300 ${
            scrolled
              ? isDark
                ? 'bg-[#08110F]/90 backdrop-blur-2xl border border-[#1C382E] shadow-[0_12px_36px_rgba(0,0,0,0.55),0_0_24px_rgba(184,243,107,0.06)] rounded-2xl sm:rounded-full py-2 sm:py-2.5 px-3.5 sm:px-6 max-w-5xl mx-auto'
                : 'bg-[#F7F6F0]/92 backdrop-blur-2xl border border-[#DEE3DE] shadow-[0_12px_32px_rgba(0,0,0,0.07)] rounded-2xl sm:rounded-full py-2 sm:py-2.5 px-3.5 sm:px-6 max-w-5xl mx-auto'
              : isDark
              ? 'bg-transparent border-b border-white/5 py-4 sm:py-5 px-1 sm:px-2 rounded-none max-w-6xl'
              : 'bg-transparent border-b border-black/5 py-4 sm:py-5 px-1 sm:px-2 rounded-none max-w-6xl'
          }`}
        >
          {/* Animated Swipe / Gesture Accent Glow Line */}
          <AnimatePresence>
            {swipePulse && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 1 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className={`absolute bottom-0 left-4 right-4 h-[2px] bg-gradient-to-r from-transparent via-[#B8F36B] to-transparent pointer-events-none origin-center ${
                  scrolled ? 'rounded-full' : ''
                }`}
              />
            )}
          </AnimatePresence>

          {/* Top subtle highlight rim when scrolled */}
          {scrolled && (
            <div
              className={`absolute inset-x-8 top-0 h-[1px] bg-gradient-to-r from-transparent ${
                isDark ? 'via-[#B8F36B]/25' : 'via-black/10'
              } to-transparent pointer-events-none`}
            />
          )}

          <div className="flex items-center justify-between gap-4">
            {/* Brand Zone */}
            <motion.a
              layout="position"
              href="#"
              className="flex items-center group focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded-lg p-0.5 transition-transform active:scale-95 shrink-0"
              aria-label="Kopa Home"
              onClick={() => {
                if (mobileMenuOpen) setMobileMenuOpen(false);
              }}
            >
              <KopaLogo
                variant="full"
                theme={isDark ? 'dark' : 'light'}
                size={scrolled ? 'sm' : 'md'}
              />
            </motion.a>

            {/* Clean Desktop Navigation Links that come together */}
            <motion.nav
              layout="position"
              className={`hidden md:flex items-center text-[13.5px] font-medium transition-all duration-300 ${
                scrolled ? 'gap-5 lg:gap-6' : 'gap-7 lg:gap-8'
              } ${isDark ? 'text-slate-300' : 'text-[#48534E]'}`}
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
                  className={`relative py-1 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none rounded after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-full after:h-[1.5px] after:bg-[#15803D] dark:after:bg-[#B8F36B] after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-150 after:origin-left whitespace-nowrap ${
                    isDark ? 'hover:text-white' : 'hover:text-[#111916]'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </motion.nav>

            {/* Actions + Theme Toggle (Desktop & Tablet) */}
            <motion.div
              layout="position"
              className="hidden sm:flex items-center gap-2 lg:gap-3 shrink-0"
            >
              <ThemeToggle size="sm" />

              {currentUser ? (
                <button
                  type="button"
                  onClick={() => onOpenDashboard?.()}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white dark:text-[#08110F] bg-[#15803D] dark:bg-[#B8F36B] hover:opacity-90 rounded-lg transition-all duration-150 shadow-sm shadow-[#B8F36B]/20 whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none active:scale-[0.98] px-3.5 py-1.5 min-h-[38px]"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{currentUser.businessName || 'Workspace'}</span>
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
                    className={`text-[13px] font-semibold transition-colors duration-150 px-3 py-1.5 min-h-[38px] flex items-center whitespace-nowrap cursor-pointer rounded-lg focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                      isDark
                        ? 'text-slate-300 hover:text-white hover:bg-white/5'
                        : 'text-[#48534E] hover:text-[#111916] hover:bg-black/5'
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
                    className={`inline-flex items-center gap-1.5 text-[13px] font-semibold text-white dark:text-[#08110F] bg-[#15803D] dark:bg-[#B8F36B] hover:opacity-90 rounded-lg transition-all duration-150 shadow-sm shadow-[#B8F36B]/20 whitespace-nowrap cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none active:scale-[0.98] ${
                      scrolled ? 'px-3.5 py-1.5 min-h-[38px]' : 'px-4 py-2 min-h-[42px]'
                    }`}
                  >
                    <span>Start with Kopa</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </motion.div>

            {/* Mobile Controls: Theme toggle + Hamburger Button */}
            <motion.div
              layout="position"
              className="flex md:hidden items-center gap-1.5 shrink-0"
            >
              <ThemeToggle size="sm" />

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 min-w-[40px] min-h-[40px] flex items-center justify-center rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none cursor-pointer active:scale-95 ${
                  isDark
                    ? 'text-slate-200 hover:text-white bg-white/5 hover:bg-white/10'
                    : 'text-[#111916] hover:text-[#08110F] bg-black/5 hover:bg-black/10'
                }`}
                aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </motion.div>
          </div>

          {/* Mobile Menu Dropdown & Drawer (smoothly connected inside the floating capsule) */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                id="mobile-navigation"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className={`md:hidden border-t pt-3 pb-4 overflow-hidden ${
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
                      className={`px-3 py-2.5 min-h-[42px] flex items-center text-sm font-medium rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none ${
                        isDark
                          ? 'text-slate-200 hover:text-white hover:bg-white/5'
                          : 'text-[#111916] hover:text-[#08110F] hover:bg-black/5'
                      }`}
                    >
                      {link.label}
                    </a>
                  ))}
                </nav>

                <div
                  className={`pt-3 mt-2 border-t flex flex-col gap-2 ${
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
                      className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none cursor-pointer transition-transform active:scale-[0.99]"
                    >
                      <Sparkles className="w-4 h-4" />
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
                        className={`w-full min-h-[42px] flex items-center justify-center py-2 text-sm font-medium rounded-lg border focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none cursor-pointer transition-colors ${
                          isDark
                            ? 'text-slate-200 hover:text-white border-white/10 hover:bg-white/5'
                            : 'text-[#111916] hover:text-black border-[#DEE3DE] bg-white'
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
                        className="w-full min-h-[42px] flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-lg shadow-sm focus-visible:ring-2 focus-visible:ring-[#B8F36B] focus-visible:outline-none cursor-pointer transition-transform active:scale-[0.99]"
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
        </motion.div>
      </div>
    </header>
  );
};
