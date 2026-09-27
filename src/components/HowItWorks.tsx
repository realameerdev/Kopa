import React from 'react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

interface StepItem {
  num: string;
  title: string;
  description: string;
}

const STEPS: StepItem[] = [
  {
    num: '01',
    title: 'Tell Kopa',
    description: 'Describe what happened naturally.',
  },
  {
    num: '02',
    title: 'Kopa understands',
    description: 'Your words become structured business activity.',
  },
  {
    num: '03',
    title: 'Understand your business',
    description: 'Kopa turns that activity into useful intelligence.',
  }
];

export const HowItWorks: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <section
      id="how-it-works"
      className={`py-24 sm:py-32 transition-colors duration-200 relative overflow-hidden border-t ${
        isDark ? 'bg-[#0E1F1A] text-white border-[#182E26]' : 'bg-[#FFFFFF] text-[#111916] border-[#DEE3DE]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-widest uppercase mb-3 font-mono ${
            isDark ? 'text-[#B8F36B]' : 'text-[#10251E]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#B8F36B]' : 'bg-[#10251E]'}`} />
            <span>HOW KOPA WORKS</span>
          </div>

          <h2 
            className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-medium tracking-tight leading-[1.1] ${
              isDark ? 'text-white' : 'text-[#111916]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            From everyday activity to business intelligence.
          </h2>
        </div>

        {/* Three Horizontal Steps with spacious whitespace and thin hairlines */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className={`relative flex flex-col justify-between pt-6 border-t transition-colors duration-200 group ${
                isDark ? 'border-[#1C3E32]' : 'border-[#DEE3DE]'
              }`}
            >
              <div>
                {/* Number in Manrope and subtle Kopa Lime accent */}
                <div className={`text-4xl sm:text-5xl font-heading font-normal tracking-tight mb-4 flex items-center justify-between ${
                  isDark ? 'text-white/80' : 'text-[#10251E]'
                }`}>
                  <span className="group-hover:text-[#B8F36B] transition-colors duration-200">
                    {step.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#B8F36B] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                <h3 className={`text-xl sm:text-2xl font-heading font-semibold mb-2 tracking-tight ${
                  isDark ? 'text-white' : 'text-[#111916]'
                }`}>
                  {step.title}
                </h3>

                <p className={`text-sm sm:text-base leading-relaxed font-sans ${
                  isDark ? 'text-slate-300' : 'text-[#69746F]'
                }`}>
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
