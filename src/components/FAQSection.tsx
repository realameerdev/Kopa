import React, { useState, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Minus, ArrowUpRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'how-it-works',
    question: 'How does Kopa turn my everyday activity into structured business records?',
    answer:
      'You talk or type to Kopa just like you would to an assistant—for example, "Sold 3 shirts for ₦45,000 via transfer" or "Bought diesel for ₦12,000". Kopa parses the transaction, identifies products or expenses, updates your records, and recalculates your position without you needing to touch spreadsheets or accounting menus.',
  },
  {
    id: 'financial-accuracy',
    question: 'How does Kopa handle gross profit and missing cost data?',
    answer:
      'Kopa never fabricates financial intelligence. If you record a sale but haven\'t set the unit cost for that item, Kopa records the exact revenue and clearly marks: "Cost not set. Add product cost to calculate gross profit." You always know which numbers are verified and which require missing data.',
  },
  {
    id: 'existing-tools',
    question: 'Do I need to replace my bank accounts or current selling tools?',
    answer:
      'No. Kopa is designed to work with what you already use—WhatsApp, POS machines, bank transfer alerts, and receipts. You do not need to switch banks or discard existing tools. Kopa simply gives you a single place where all that scattered activity becomes clear.',
  },
  {
    id: 'data-privacy',
    question: 'Who owns my business data, and is it used to train AI models?',
    answer:
      'You own 100% of your business data. Kopa does not sell customer records, transaction details, or receipts to third parties, nor do we train public foundation models on your private communications. Your figures remain strictly confidential to your business.',
  },
  {
    id: 'business-passport',
    question: 'What is the Business Passport, and is it a credit score?',
    answer:
      'The Business Passport is not an arbitrary credit score. It is a structured summary of your real, recorded business activity—such as verified revenue, transaction consistency, and activity history. It helps you demonstrate your business track record clearly to partners and suppliers using your actual operational data.',
  },
  {
    id: 'languages-offline',
    question: 'Can I use Kopa with voice notes, Nigerian Pidgin, or while offline?',
    answer:
      'Yes. Kopa understands conversational English, Nigerian Pidgin, and voice notes. If you\'re temporarily offline or in an area with poor signal, entries are saved securely on your device and synced as soon as your connection resumes.',
  },
];

interface FAQSectionProps {
  onOpenWaitlist?: () => void;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ onOpenWaitlist }) => {
  const { isDark } = useTheme();
  const sectionTitleId = useId();
  const [openId, setOpenId] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="faq"
      aria-labelledby={sectionTitleId}
      className={`py-20 sm:py-28 transition-colors duration-200 border-t ${
        isDark ? 'bg-[#08110F] text-white border-[#182E26]' : 'bg-[#F7F6F0] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Simple, understated header */}
        <div className="mb-10 sm:mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-[#69746F] dark:text-slate-400 mb-2">
            Questions & Answers
          </p>
          <h2
            id={sectionTitleId}
            className={`text-2xl sm:text-3xl lg:text-4xl font-heading font-medium tracking-tight ${
              isDark ? 'text-white' : 'text-[#111916]'
            }`}
          >
            Frequently asked questions
          </h2>
          <p className="text-sm sm:text-base font-normal text-[#69746F] dark:text-slate-400 mt-2">
            Simple answers to common questions about Kopa, data privacy, and daily usage.
          </p>
        </div>

        {/* Clean hairline accordion list */}
        <div className="divide-y divide-[#DEE3DE] dark:divide-[#1A2E27] border-y border-[#DEE3DE] dark:border-[#1A2E27]">
          {FAQ_ITEMS.map((item) => {
            const isOpen = openId === item.id;
            const buttonId = `faq-btn-${item.id}`;
            const contentId = `faq-content-${item.id}`;

            return (
              <div key={item.id} className="transition-colors">
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleItem(item.id)}
                    className="w-full py-4.5 sm:py-5 flex items-center justify-between gap-4 text-left cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B] transition-colors"
                  >
                    <span
                      className={`text-[15.5px] sm:text-[16.5px] font-medium transition-colors ${
                        isOpen
                          ? isDark
                            ? 'text-[#B8F36B]'
                            : 'text-[#111916]'
                          : isDark
                          ? 'text-slate-200 group-hover:text-white'
                          : 'text-[#111916] group-hover:text-black'
                      }`}
                    >
                      {item.question}
                    </span>

                    <span
                      className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors ${
                        isOpen
                          ? isDark
                            ? 'text-[#B8F36B]'
                            : 'text-[#111916]'
                          : 'text-[#69746F] dark:text-slate-400 group-hover:text-black dark:group-hover:text-white'
                      }`}
                    >
                      {isOpen ? (
                        <Minus className="w-4 h-4 stroke-[1.75]" />
                      ) : (
                        <Plus className="w-4 h-4 stroke-[1.75]" />
                      )}
                    </span>
                  </button>
                </h3>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={contentId}
                      role="region"
                      aria-labelledby={buttonId}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="overflow-hidden"
                    >
                      <p className="text-sm sm:text-[14.5px] font-normal leading-relaxed text-[#69746F] dark:text-slate-300 pb-5 sm:pb-6 pr-6">
                        {item.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Quiet footer link */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-[#69746F] dark:text-slate-400">
          <p>
            Have a question that isn't answered here?
          </p>
          {onOpenWaitlist && (
            <button
              type="button"
              onClick={onOpenWaitlist}
              className="inline-flex items-center gap-1 font-medium text-[#111916] dark:text-[#B8F36B] hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#B8F36B]"
            >
              <span>Contact our team</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>
    </section>
  );
};
