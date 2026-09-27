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
  defaultCategory = 'Retail & General Merchant',
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
    'Retail & General Merchant',
    'Fashion & Apparel',
    'Food, Beverage & Hospitality',
    'Beauty, Skincare & Wellness',
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
    { num: 1, title: 'Business Profile' },
    { num: 2, title: 'Currency & Location' },
    { num: 3, title: 'First Item (Optional)' },
  ];

  const getCurrencySymbol = (curr: string) => {
    const found = currencies.find((c) => c.value === curr);
    return found ? found.symbol : '₦';
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 3) {
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
      description: answers.whatYouSell || `${category} enterprise operating in ${country}`,
      onboardingAnswers: {
        ...answers,
        seedProduct,
      },
      seedProduct,
    });
  };

  return (
    <div
      className={`rounded-2xl border p-5 sm:p-7 shadow-xl transition-all ${
        isDark ? 'bg-[#0D1B2E] border-[#243B56]' : 'bg-white border-[#DCE6F0]'
      }`}
    >
      {/* Header & Step Tracker */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2">
            {stepLabels.map((s) => {
              const isActive = currentStep === s.num;
              const isPast = currentStep > s.num;
              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2563EB] text-white dark:bg-[#3B82F6] dark:text-[#07111F] font-semibold'
                      : isPast
                      ? isDark
                        ? 'bg-white/10 text-[#60A5FA]'
                        : 'bg-black/5 text-[#0F172A]'
                      : isDark
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-500 hover:text-black'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono">
                    {isPast ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span>{s.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden mb-4">
          <div
            className="h-full bg-[#2563EB] dark:bg-[#60A5FA] transition-all duration-300 rounded-full"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          />
        </div>

        <h2 className="text-xl sm:text-2xl font-heading font-medium tracking-tight text-[#0F172A] dark:text-white">
          {currentStep === 1 && `Welcome to Kopa, ${businessName}`}
          {currentStep === 2 && 'Location & Ledger Currency'}
          {currentStep === 3 && 'Add Your First Product or Service'}
        </h2>
        <p className="text-xs sm:text-sm text-[#69746F] dark:text-slate-400 mt-1">
          {currentStep === 1 && 'Personalize your AI operating system in a few quick steps.'}
          {currentStep === 2 && 'Set your default currency for transactions, debts, and bookkeeping.'}
          {currentStep === 3 && 'Optional: Enter an item now, or add items anytime later in your workspace.'}
        </p>
      </div>

      <form onSubmit={handleNext} className="space-y-5">
        <AnimatePresence mode="wait">
          {/* STEP 1: BUSINESS MODEL & CATEGORY */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#0F172A] dark:text-slate-200">
                  Business Industry
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none cursor-pointer ${
                    isDark
                      ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#3B82F6]'
                      : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB]'
                  }`}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className={isDark ? 'bg-[#07111F]' : 'bg-white'}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A] dark:text-slate-200">
                  What type of business is this?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    {
                      id: 'products',
                      title: 'Retail / Physical Goods',
                      desc: 'Store inventory, clothing, electronics, or packaged goods',
                      icon: Package,
                    },
                    {
                      id: 'services',
                      title: 'Services & Consulting',
                      desc: 'Client projects, consulting, agency, or professional work',
                      icon: Briefcase,
                    },
                    {
                      id: 'hospitality',
                      title: 'Food & Hospitality',
                      desc: 'Restaurant, cafe, bakery, food truck, or catering',
                      icon: Coffee,
                    },
                    {
                      id: 'hybrid',
                      title: 'Hybrid Business',
                      desc: 'Combination of product sales and client services',
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
                        className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#2563EB]/10 ring-1 ring-[#2563EB] dark:border-[#60A5FA] dark:bg-[#3B82F6]/10 dark:ring-1 dark:ring-[#60A5FA]'
                            : isDark
                            ? 'border-[#243B56] bg-[#07111F]/60 hover:border-slate-400'
                            : 'border-[#DCE6F0] bg-[#F7FAFC]/60 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isSelected
                                ? 'bg-[#2563EB] text-white dark:bg-[#3B82F6] dark:text-[#07111F]'
                                : isDark
                                ? 'bg-white/5 text-slate-300'
                                : 'bg-black/5 text-[#0F172A]'
                            }`}
                          >
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#0F172A] dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-[11px] text-[#475569] dark:text-slate-400 mt-0.5 leading-snug">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1.5 text-[#0F172A] dark:text-slate-200">
                  Brief description of your products or services
                </label>
                <input
                  type="text"
                  value={answers.whatYouSell}
                  onChange={(e) => setAnswers({ ...answers, whatYouSell: e.target.value })}
                  placeholder="e.g. Handmade garments, fabrics, and ready-to-wear fashion"
                  className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                    isDark
                      ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#3B82F6]'
                      : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB]'
                  }`}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: LOCATION & CURRENCY */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#0F172A] dark:text-slate-200">
                    Country of Operation
                  </label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none cursor-pointer ${
                      isDark
                        ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#3B82F6]'
                        : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB]'
                    }`}
                  >
                    {countries.map((c) => (
                      <option key={c} value={c} className={isDark ? 'bg-[#07111F]' : 'bg-white'}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1.5 text-[#0F172A] dark:text-slate-200">
                    Primary Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none cursor-pointer ${
                      isDark
                        ? 'bg-[#07111F] border-[#243B56] text-white focus:border-[#3B82F6]'
                        : 'bg-[#F7FAFC] border-[#DCE6F0] text-[#0F172A] focus:border-[#2563EB]'
                    }`}
                  >
                    {currencies.map((curr) => (
                      <option key={curr.value} value={curr.value} className={isDark ? 'bg-[#07111F]' : 'bg-white'}>
                        {curr.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2 text-[#0F172A] dark:text-slate-200">
                  Do customers ever buy on credit / pay later?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'frequently', label: 'Frequently', desc: 'Active debt ledger' },
                    { id: 'occasionally', label: 'Occasionally', desc: 'As-needed tracking' },
                    { id: 'never', label: 'Never', desc: 'Strictly upfront' },
                  ].map((opt) => {
                    const isSelected = answers.allowCredit === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setAnswers({ ...answers, allowCredit: opt.id as any })}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'border-[#2563EB] bg-[#2563EB]/10 ring-1 ring-[#2563EB] dark:border-[#60A5FA] dark:bg-[#3B82F6]/10 dark:ring-1 dark:ring-[#60A5FA]'
                            : isDark
                            ? 'border-[#243B56] bg-[#07111F]/60'
                            : 'border-[#DCE6F0] bg-[#F7FAFC]/60'
                        }`}
                      >
                        <div className="text-xs font-semibold text-[#0F172A] dark:text-white">
                          {opt.label}
                        </div>
                        <div className="text-[11px] text-[#475569] dark:text-slate-400 mt-0.5">
                          {opt.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: OPTIONAL SEED ITEM */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div
                className={`p-4 rounded-xl border ${
                  isDark ? 'bg-[#07111F]/60 border-[#243B56]' : 'bg-[#F7FAFC] border-[#DCE6F0]'
                }`}
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-[#0F172A] dark:text-slate-200">
                      Product or Service Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Traditional Adire Fabric / Custom Tailoring"
                      value={seedProductName}
                      onChange={(e) => setSeedProductName(e.target.value)}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm border outline-none ${
                        isDark ? 'bg-[#07111F] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#0F172A] dark:text-slate-200">
                        Selling Price ({getCurrencySymbol(currency)})
                      </label>
                      <input
                        type="number"
                        placeholder="25000"
                        value={seedSellingPrice}
                        onChange={(e) => setSeedSellingPrice(e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isDark ? 'bg-[#07111F] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1 text-[#0F172A] dark:text-slate-200">
                        Stock Quantity
                      </label>
                      <input
                        type="number"
                        placeholder="10"
                        value={seedStock}
                        onChange={(e) => setSeedStock(e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isDark ? 'bg-[#07111F] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#0F172A] dark:text-slate-200">
                        Cost Price ({getCurrencySymbol(currency)})
                      </label>
                      <button
                        type="button"
                        onClick={() => setSeedCostKnown(!seedCostKnown)}
                        className="text-[11px] text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer font-semibold"
                      >
                        {seedCostKnown ? 'Leave cost unassigned' : 'Enter cost price'}
                      </button>
                    </div>
                    {seedCostKnown ? (
                      <input
                        type="number"
                        placeholder="15000 (Purchase or make cost)"
                        value={seedCostPrice}
                        onChange={(e) => setSeedCostPrice(e.target.value)}
                        className={`w-full px-3.5 py-2 rounded-xl text-sm border outline-none ${
                          isDark ? 'bg-[#07111F] border-[#243B56] text-white' : 'bg-white border-[#DCE6F0] text-[#0F172A]'
                        }`}
                      />
                    ) : (
                      <div className="p-2.5 rounded-lg border border-dashed border-amber-500/40 text-amber-500 text-xs flex items-center gap-1.5">
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

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-3 border-t border-[#DCE6F0] dark:border-[#243B56]">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isLoading}
              className={`min-h-[42px] px-4 py-2 text-xs font-semibold rounded-xl border flex items-center gap-1.5 transition-colors cursor-pointer ${
                isDark ? 'border-[#243B56] text-slate-200 hover:bg-white/5' : 'border-[#DCE6F0] text-[#0F172A] hover:bg-black/5'
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
            className="min-h-[42px] px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] rounded-xl transition-all shadow-sm shadow-[#2563EB]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span>Saving setup...</span>
            ) : currentStep < 3 ? (
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
