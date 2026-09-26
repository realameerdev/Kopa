import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Package,
  Briefcase,
  Coffee,
  Layers,
  Sparkles,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export interface QuestionnaireAnswers {
  businessModel: 'products' | 'services' | 'hospitality' | 'hybrid';
  whatYouSell: string;
  sourceMethod: string;
  pricingRange: string;
  costTrackingMode: 'always' | 'partial' | 'not_yet';
  serviceBillingModel?: string;
  typicalRate?: string;
  hasDirectJobCosts?: boolean;
  hasInventory: boolean;
  seedProduct?: {
    name: string;
    sellingPrice: number;
    costPrice: number | null;
    stock: number;
  };
  paymentPattern: string;
  allowCredit: 'frequently' | 'occasionally' | 'never';
}

interface BusinessSetupQuestionnaireProps {
  businessName: string;
  defaultCategory?: string;
  defaultCountry?: string;
  defaultCurrency?: string;
  isLoading?: boolean;
  onComplete: (data: {
    businessCategory: string;
    country: string;
    currency: string;
    currencySymbol: string;
    description: string;
    onboardingAnswers: QuestionnaireAnswers;
    seedProduct?: {
      name: string;
      sellingPrice: number;
      costPrice: number | null;
      stock: number;
    };
  }) => void;
}

export const BusinessSetupQuestionnaire: React.FC<BusinessSetupQuestionnaireProps> = ({
  businessName,
  defaultCategory = 'Fashion & Apparel',
  defaultCountry = 'Nigeria',
  defaultCurrency = 'NGN',
  isLoading = false,
  onComplete,
}) => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form states
  const [category, setCategory] = useState<string>(defaultCategory);
  const [country, setCountry] = useState<string>(defaultCountry);
  const [currency, setCurrency] = useState<string>(defaultCurrency);

  const [answers, setAnswers] = useState<QuestionnaireAnswers>({
    businessModel: 'products',
    whatYouSell: '',
    sourceMethod: 'wholesale',
    pricingRange: '10000_50000',
    costTrackingMode: 'partial',
    hasInventory: true,
    paymentPattern: 'transfer_immediate',
    allowCredit: 'occasionally',
  });

  const [seedProductName, setSeedProductName] = useState('');
  const [seedSellingPrice, setSeedSellingPrice] = useState('');
  const [seedCostPrice, setSeedCostPrice] = useState('');
  const [seedStock, setSeedStock] = useState('10');
  const [seedCostKnown, setSeedCostKnown] = useState(true);

  // Available options
  const categories = [
    'Fashion & Apparel',
    'Food, Beverage & Hospitality',
    'Beauty, Skincare & Wellness',
    'Retail & General Merchant',
    'Professional & Consulting Services',
    'Creative, Design & Media',
    'Technology & Electronics',
    'Home, Decor & Furniture',
    'Agriculture & Farm Produce',
    'Logistics & Transportation',
    'Health & Pharmaceuticals',
    'Other Business',
  ];

  const countries = [
    'Nigeria',
    'Ghana',
    'Kenya',
    'South Africa',
    'United Kingdom',
    'United States',
    'Canada',
    'United Arab Emirates',
  ];

  const currencies = [
    { value: 'NGN', label: 'NGN (₦) - Nigerian Naira', symbol: '₦' },
    { value: 'USD', label: 'USD ($) - US Dollar', symbol: '$' },
    { value: 'GBP', label: 'GBP (£) - British Pound', symbol: '£' },
    { value: 'EUR', label: 'EUR (€) - Euro', symbol: '€' },
    { value: 'KES', label: 'KES (KSh) - Kenyan Shilling', symbol: 'KSh' },
    { value: 'GHS', label: 'GHS (GH₵) - Ghanaian Cedi', symbol: 'GH₵' },
    { value: 'ZAR', label: 'ZAR (R) - South African Rand', symbol: 'R' },
  ];

  const stepLabels = [
    { num: 1, title: 'Model' },
    { num: 2, title: 'Pricing' },
    { num: 3, title: 'Credit' },
    { num: 4, title: 'Setup' },
  ];

  const getCurrencySymbol = (curr: string) => {
    const found = currencies.find((c) => c.value === curr);
    return found ? found.symbol : '₦';
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      finishSetup();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const finishSetup = () => {
    const symbol = getCurrencySymbol(currency);
    const hasSeed = seedProductName.trim().length > 0 && Number(seedSellingPrice) > 0;

    const seedProduct = hasSeed
      ? {
          name: seedProductName.trim(),
          sellingPrice: Number(seedSellingPrice),
          costPrice: seedCostKnown && Number(seedCostPrice) > 0 ? Number(seedCostPrice) : null,
          stock: Number(seedStock) || 1,
        }
      : undefined;

    onComplete({
      businessCategory: category,
      country,
      currency,
      currencySymbol: symbol,
      description: answers.whatYouSell || `${category} business operating in ${country}`,
      onboardingAnswers: {
        ...answers,
        seedProduct,
      },
      seedProduct,
    });
  };

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-7 shadow-lg transition-all ${
        isDark ? 'bg-[#10251E]/70 border-[#1C382E]' : 'bg-white border-[#DEE3DE]'
      }`}
    >
      {/* Sleek Step Navigation Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          {/* Subtle Stepper Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {stepLabels.map((s) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-lg text-xs transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#B8F36B] text-[#08110F] font-semibold'
                      : isPast
                      ? isDark
                        ? 'bg-white/10 text-[#B8F36B]'
                        : 'bg-black/5 text-[#111916]'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-black'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono">
                    {isPast ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden xs:inline">{s.title}</span>
                </button>
              );
            })}
          </div>

          <span className="text-[11px] sm:text-xs text-[#69746F] dark:text-slate-400 font-mono">
            Step {currentStep} of 4
          </span>
        </div>

        {/* Hairline Progress Indicator */}
        <div className="w-full h-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#B8F36B] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>

        {/* Clean, Non-overwhelming Title */}
        <h2 className="text-lg sm:text-xl font-heading font-semibold tracking-tight text-[#111916] dark:text-white">
          {currentStep === 1 && `Let's understand ${businessName}`}
          {currentStep === 2 && 'Pricing & cost tracking'}
          {currentStep === 3 && 'Customer payment habits & credit'}
          {currentStep === 4 && 'Location, currency & first product'}
        </h2>
        <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400 mt-1">
          {currentStep === 1 && 'Personalize Kopa to your exact business model and product category.'}
          {currentStep === 2 && 'Kopa calculates profit accurately based on verified costs you provide.'}
          {currentStep === 3 && 'Customize customer credit tracking and repayment reminders.'}
          {currentStep === 4 && 'Choose your ledger currency and optionally add your first item.'}
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        <AnimatePresence mode="wait">
          {/* STEP 1: BUSINESS MODEL & OFFERING */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Category */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                  Business Industry / Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                      : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className={isDark ? 'bg-[#08110F]' : 'bg-white'}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Core Model Selection */}
              <div>
                <label className="block text-xs font-medium mb-2 text-[#111916] dark:text-slate-200">
                  Primary revenue model
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'products',
                      title: 'Physical Goods / Retail',
                      desc: 'Selling inventory items, clothes, food, or electronics',
                      icon: Package,
                    },
                    {
                      id: 'services',
                      title: 'Services & Consulting',
                      desc: 'Bespoke client work, professional services or contracts',
                      icon: Briefcase,
                    },
                    {
                      id: 'hospitality',
                      title: 'Food & Hospitality',
                      desc: 'Restaurant, cafe, bakery, catering, or event service',
                      icon: Coffee,
                    },
                    {
                      id: 'hybrid',
                      title: 'Hybrid (Goods + Services)',
                      desc: 'Both product sales and client service packages',
                      icon: Layers,
                    },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = answers.businessModel === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setAnswers({
                            ...answers,
                            businessModel: item.id as any,
                            hasInventory: item.id !== 'services',
                          })
                        }
                        className={`p-3 rounded-xl border text-left flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#B8F36B] bg-[#B8F36B]/10 dark:bg-[#B8F36B]/10 ring-1 ring-[#B8F36B]'
                            : isDark
                            ? 'border-[#1C382E] bg-[#08110F]/50 hover:border-slate-500'
                            : 'border-[#DEE3DE] bg-white hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <div
                            className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-[#B8F36B] text-[#08110F]'
                                : isDark
                                ? 'bg-white/5 text-slate-300'
                                : 'bg-black/5 text-[#111916]'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-semibold truncate">{item.title}</div>
                            <div className="text-[11px] text-[#69746F] dark:text-slate-400 mt-0.5 leading-snug line-clamp-2">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#B8F36B] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conversational Short Description */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                  What do you sell or provide to your customers?
                </label>
                <textarea
                  rows={2}
                  value={answers.whatYouSell}
                  onChange={(e) => setAnswers({ ...answers, whatYouSell: e.target.value })}
                  placeholder="e.g. Ready-to-wear female apparel, custom tailored gowns, and bespoke fabrics."
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none resize-none ${
                    isDark
                      ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                      : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                  }`}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: PRICING & COST PATTERN */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {answers.businessModel !== 'services' ? (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                      How do you source your inventory / products?
                    </label>
                    <select
                      value={answers.sourceMethod}
                      onChange={(e) => setAnswers({ ...answers, sourceMethod: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                        isDark
                          ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                          : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                      }`}
                    >
                      <option value="wholesale">We buy wholesale from suppliers to resell</option>
                      <option value="manufacture">We produce / sew / manufacture our own goods</option>
                      <option value="imported">We import finished products from overseas</option>
                      <option value="made_to_order">Made-to-order (custom work on request)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2 text-[#111916] dark:text-slate-200">
                      Do you know and track individual cost prices?
                    </label>
                    <div className="space-y-2">
                      {[
                        {
                          id: 'always',
                          label: 'Yes, I know unit costs for all items',
                          desc: 'Kopa will calculate exact gross profit on each sale.',
                        },
                        {
                          id: 'partial',
                          label: 'Only for some items / Approximate',
                          desc: 'Calculates profit where cost is set; displays "Cost not set" otherwise.',
                        },
                        {
                          id: 'not_yet',
                          label: 'No / Not yet',
                          desc: 'Kopa flags "Cost not set" and excludes from profit until costs are entered.',
                        },
                      ].map((opt) => {
                        const isSelected = answers.costTrackingMode === opt.id;
                        return (
                          <div
                            key={opt.id}
                            onClick={() => setAnswers({ ...answers, costTrackingMode: opt.id as any })}
                            className={`flex items-start justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'border-[#B8F36B] bg-[#B8F36B]/10 dark:bg-[#B8F36B]/10 ring-1 ring-[#B8F36B]'
                                : isDark
                                ? 'border-[#1C382E] bg-[#08110F]/40 hover:border-slate-500'
                                : 'border-[#DEE3DE] bg-white hover:border-slate-400'
                            }`}
                          >
                            <div>
                              <div className="text-xs font-semibold">{opt.label}</div>
                              <div className="text-[11px] text-[#69746F] dark:text-slate-400 mt-0.5 leading-snug">
                                {opt.desc}
                              </div>
                            </div>
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'border-[#B8F36B] bg-[#B8F36B]'
                                  : 'border-slate-400 dark:border-slate-600'
                              }`}
                            >
                              {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#08110F]" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                      How do you structure client pricing?
                    </label>
                    <select
                      value={answers.serviceBillingModel || 'project'}
                      onChange={(e) => setAnswers({ ...answers, serviceBillingModel: e.target.value })}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                        isDark
                          ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                          : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                      }`}
                    >
                      <option value="project">Fixed price per project / deliverable</option>
                      <option value="retainer">Monthly retainer contracts</option>
                      <option value="hourly">Hourly or daily consulting rate</option>
                      <option value="commission">Commission or percentage of results</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium mb-2 text-[#111916] dark:text-slate-200">
                      Do you have direct job costs (subcontractors, materials, travel)?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {[
                        { val: true, label: 'Yes, direct job costs apply' },
                        { val: false, label: 'No, strictly overhead expenses' },
                      ].map((item) => {
                        const isSelected = answers.hasDirectJobCosts === item.val;
                        return (
                          <div
                            key={String(item.val)}
                            onClick={() => setAnswers({ ...answers, hasDirectJobCosts: item.val })}
                            className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                              isSelected
                                ? 'border-[#B8F36B] bg-[#B8F36B]/10 dark:bg-[#B8F36B]/10 ring-1 ring-[#B8F36B]'
                                : isDark
                                ? 'border-[#1C382E] bg-[#08110F]/40'
                                : 'border-[#DEE3DE] bg-white'
                            }`}
                          >
                            <span>{item.label}</span>
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#B8F36B]" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Price range indicator */}
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                  Typical transaction amount
                </label>
                <select
                  value={answers.pricingRange}
                  onChange={(e) => setAnswers({ ...answers, pricingRange: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                      : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                  }`}
                >
                  <option value="under_10k">Under ₦10,000 / $20 (High volume / daily retail)</option>
                  <option value="10000_50000">₦10,000 – ₦50,000 / $20 – $100 (Mid-tier consumer goods)</option>
                  <option value="50000_250000">₦50,000 – ₦250,000 / $100 – $500 (Premium goods / bespoke services)</option>
                  <option value="over_250k">Over ₦250,000 / $500+ (High-ticket or enterprise orders)</option>
                </select>
              </div>
            </motion.div>
          )}

          {/* STEP 3: CUSTOMER PAYMENTS & CREDIT */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                  How do customers usually pay?
                </label>
                <select
                  value={answers.paymentPattern}
                  onChange={(e) => setAnswers({ ...answers, paymentPattern: e.target.value })}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                      : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                  }`}
                >
                  <option value="transfer_immediate">Instant bank transfer / POS / Cash upfront</option>
                  <option value="deposit_balance">Part-payment / deposit upfront, balance on delivery</option>
                  <option value="invoice_terms">Invoiced with 14–30 day credit payment terms</option>
                  <option value="credit_later">Informal credit with regular customer balances</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium mb-2 text-[#111916] dark:text-slate-200">
                  Do customers ever owe your business money?
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: 'frequently',
                      label: 'Frequently (Essential to track debtor balances)',
                      desc: 'Kopa highlights Outstanding Debts as a key metric on your overview.',
                    },
                    {
                      id: 'occasionally',
                      label: 'Occasionally for trusted clients',
                      desc: 'Includes a quick Debt Ledger and repayment recording whenever needed.',
                    },
                    {
                      id: 'never',
                      label: 'Never (Strictly upfront payments only)',
                      desc: 'Customer accounts will default to zero debt balances.',
                    },
                  ].map((opt) => {
                    const isSelected = answers.allowCredit === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setAnswers({ ...answers, allowCredit: opt.id as any })}
                        className={`flex items-start justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#B8F36B] bg-[#B8F36B]/10 dark:bg-[#B8F36B]/10 ring-1 ring-[#B8F36B]'
                            : isDark
                            ? 'border-[#1C382E] bg-[#08110F]/40 hover:border-slate-500'
                            : 'border-[#DEE3DE] bg-white hover:border-slate-400'
                        }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{opt.label}</div>
                          <div className="text-[11px] text-[#69746F] dark:text-slate-400 mt-0.5 leading-snug">
                            {opt.desc}
                          </div>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            isSelected
                              ? 'border-[#B8F36B] bg-[#B8F36B]'
                              : 'border-slate-400 dark:border-slate-600'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#08110F]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: LOCATION, CURRENCY & INITIAL PRODUCT */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Country */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                    Business Country
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                      isDark
                        ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                        : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                    }`}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c} className={isDark ? 'bg-[#08110F]' : 'bg-white'}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Operating Currency */}
                <div>
                  <label className="block text-xs font-medium mb-1.5 text-[#111916] dark:text-slate-200">
                    Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none cursor-pointer ${
                      isDark
                        ? 'bg-[#08110F] border-[#1C382E] text-white focus:border-[#B8F36B]'
                        : 'bg-[#F7F6F0] border-[#DEE3DE] text-[#111916] focus:border-[#10251E]'
                    }`}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value} className={isDark ? 'bg-[#08110F]' : 'bg-white'}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seed First Product / Item (Optional) */}
              <div
                className={`p-3.5 rounded-xl border ${
                  isDark ? 'bg-[#08110F]/60 border-[#1C382E]' : 'bg-[#F7F6F0] border-[#DEE3DE]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Package className="w-3.5 h-3.5 text-[#B8F36B]" />
                    <span>First Product or Service (Optional)</span>
                  </div>
                  <span className="text-[10px] text-[#69746F] dark:text-slate-400 font-mono">
                    Can add anytime later
                  </span>
                </div>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    placeholder="Item name (e.g. Classic Black Linen Shirt)"
                    value={seedProductName}
                    onChange={(e) => setSeedProductName(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                      isDark ? 'bg-[#10251E]/60 border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                    }`}
                  />

                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-[#69746F] dark:text-slate-400 mb-1">
                        Selling Price ({getCurrencySymbol(currency)})
                      </label>
                      <input
                        type="number"
                        placeholder="15000"
                        value={seedSellingPrice}
                        onChange={(e) => setSeedSellingPrice(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                          isDark ? 'bg-[#10251E]/60 border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-[#69746F] dark:text-slate-400 mb-1">
                        Starting Stock
                      </label>
                      <input
                        type="number"
                        placeholder="10"
                        value={seedStock}
                        onChange={(e) => setSeedStock(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                          isDark ? 'bg-[#10251E]/60 border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] text-[#69746F] dark:text-slate-400">
                        Cost Price ({getCurrencySymbol(currency)})
                      </label>
                      <button
                        type="button"
                        onClick={() => setSeedCostKnown(!seedCostKnown)}
                        className="text-[10px] text-[#B8F36B] hover:underline cursor-pointer"
                      >
                        {seedCostKnown ? 'Mark as "Cost not set"' : 'Set cost price'}
                      </button>
                    </div>
                    {seedCostKnown ? (
                      <input
                        type="number"
                        placeholder="9000 (Optional purchase or make cost)"
                        value={seedCostPrice}
                        onChange={(e) => setSeedCostPrice(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl text-xs border outline-none ${
                          isDark ? 'bg-[#10251E]/60 border-[#1C382E] text-white' : 'bg-white border-[#DEE3DE] text-[#111916]'
                        }`}
                      />
                    ) : (
                      <div className="p-2 rounded-lg border border-dashed border-amber-500/40 text-amber-500 text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Cost not set. Profit calculation will exclude this item until entered.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Clean, Simple Action Controls */}
        <div className="flex items-center justify-between pt-3 border-t border-[#DEE3DE] dark:border-[#1A2E27]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className={`min-h-[40px] px-3.5 py-2 text-xs font-medium rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'border-[#1C382E] text-slate-300 hover:bg-white/5' : 'border-[#DEE3DE] text-[#111916] hover:bg-black/5'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="min-h-[42px] px-5 py-2 text-xs sm:text-sm font-semibold text-[#08110F] bg-[#B8F36B] hover:bg-[#A5E852] active:bg-[#97D844] rounded-xl transition-all shadow-sm shadow-[#B8F36B]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Saving setup...</span>
            ) : currentStep < 4 ? (
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Complete Setup & Enter Workspace</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
