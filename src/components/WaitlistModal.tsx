import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { KopaLogo } from './KopaLogo';
import { useTheme } from '../context/ThemeContext';

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WaitlistModal: React.FC<WaitlistModalProps> = ({ isOpen, onClose }) => {
  const { isDark } = useTheme();
  const [businessName, setBusinessName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lagos');
  const [submitted, setSubmitted] = useState(false);
  const [reservationCode, setReservationCode] = useState('');

  // Close modal on Escape key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !phone.trim()) return;

    const randomCode = `KP-${Math.floor(1000 + Math.random() * 9000)}`;
    setReservationCode(randomCode);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setBusinessName('');
    setPhone('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="waitlist-modal-title"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`border rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 relative shadow-2xl transition-colors duration-200 ${
          isDark
            ? 'bg-[#0D1B2E] border-[#243B56] text-white'
            : 'bg-white border-[#DCE6F0] text-[#0F172A]'
        }`}
      >
        <button
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-lg cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:focus-visible:ring-[#60A5FA] focus-visible:outline-none ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-white/5' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-black/5'
          }`}
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {!submitted ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <KopaLogo variant="symbol" theme={isDark ? 'dark' : 'light'} size="sm" />
              <span className={`text-[11px] font-semibold uppercase tracking-wider font-mono ${
                isDark ? 'text-[#60A5FA]' : 'text-[#2563EB]'
              }`}>
                Early Access Cohort
              </span>
            </div>

            <h3 
              id="waitlist-modal-title"
              className={`text-xl sm:text-2xl font-heading font-semibold tracking-tight mb-1 ${
                isDark ? 'text-white' : 'text-[#0F172A]'
              }`}
            >
              Start with Kopa
            </h3>
            <p className={`text-xs sm:text-sm mb-4 ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
              Claim your business name on the Kopa Business Passport protocol.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label 
                  htmlFor="waitlist-business-name" 
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}
                >
                  Business Name *
                </label>
                <input
                  id="waitlist-business-name"
                  type="text"
                  required
                  placeholder="e.g. Ameer Fashion, Balogun Stores"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className={`w-full text-sm px-3.5 py-2.5 rounded-xl transition-colors border outline-none font-sans ${
                    isDark
                      ? 'bg-[#07111F] border-[#243B56] text-white placeholder-slate-500 focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                      : 'bg-white border-[#DCE6F0] text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                  }`}
                />
              </div>

              <div>
                <label 
                  htmlFor="waitlist-phone"
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}
                >
                  WhatsApp Number *
                </label>
                <input
                  id="waitlist-phone"
                  type="tel"
                  required
                  placeholder="e.g. +234 803 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`w-full text-sm px-3.5 py-2.5 rounded-xl transition-colors border outline-none font-sans ${
                    isDark
                      ? 'bg-[#07111F] border-[#243B56] text-white placeholder-slate-500 focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                      : 'bg-white border-[#DCE6F0] text-[#0F172A] placeholder-slate-400 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                  }`}
                />
              </div>

              <div>
                <label 
                  htmlFor="waitlist-city"
                  className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-[#0F172A]'}`}
                >
                  Operating Hub
                </label>
                <select
                  id="waitlist-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className={`w-full text-sm px-3.5 py-2.5 rounded-xl transition-colors border outline-none font-sans ${
                    isDark
                      ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#60A5FA] focus:ring-1 focus:ring-[#60A5FA]'
                      : 'bg-white border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]'
                  }`}
                >
                  <option value="Lagos">Lagos, Nigeria (₦)</option>
                  <option value="Abuja">Abuja, Nigeria (₦)</option>
                  <option value="Nairobi">Nairobi, Kenya (KSh)</option>
                  <option value="Accra">Accra, Ghana (GH₵)</option>
                  <option value="Kigali">Kigali, Rwanda (RWF)</option>
                  <option value="Other">Other African Market</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 min-h-[44px] rounded-xl font-heading font-semibold text-sm text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] transition-all shadow-md shadow-[#2563EB]/25 cursor-pointer flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none"
              >
                <span>Claim Early Access</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className={`mt-3.5 text-center text-[10px] font-mono ${isDark ? 'text-slate-400' : 'text-[#64748B]'}`}>
              No credit card required · Free onboarding
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-[#EAF2FF] dark:bg-[#102B4D] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center mx-auto mb-3 border border-[#2563EB]/20 dark:border-[#60A5FA]/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className={`inline-block px-3 py-1 rounded-full border text-xs font-mono mb-3 ${
              isDark ? 'bg-[#102B4D] border-[#243B56] text-[#60A5FA]' : 'bg-[#EAF2FF] border-[#DCE6F0] text-[#2563EB]'
            }`}>
              Reservation: {reservationCode}
            </div>

            <h3 className={`text-lg font-heading font-semibold mb-2 ${isDark ? 'text-white' : 'text-[#0F172A]'}`}>
              Welcome, {businessName}!
            </h3>
            <p className={`text-xs sm:text-sm mb-5 max-w-xs mx-auto ${isDark ? 'text-slate-300' : 'text-[#475569]'}`}>
              Your business passport slot is reserved. We'll send an invite to your WhatsApp ({phone}).
            </p>

            <button
              onClick={handleReset}
              className="px-6 py-2.5 min-h-[44px] inline-flex items-center justify-center rounded-xl font-heading font-semibold text-xs text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:outline-none"
            >
              Done
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
