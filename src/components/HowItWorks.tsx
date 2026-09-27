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
        isDark ? 'bg-[#07111F] text-[#F8FBFF] border-[#243B56]' : 'bg-[#FFFFFF] text-[#0F172A] border-[#DCE6F0]'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className={`inline-flex items-center gap-2 text-[11px] sm:text-[12px] font-semibold tracking-widest uppercase mb-3 font-mono ${
            isDark ? 'text-[#60A5FA]' : 'text-[#0F3B82]'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#60A5FA]' : 'bg-[#2563EB]'}`} />
            <span>HOW KOPA WORKS</span>
          </div>

          <h2 
            className={`text-3xl sm:text-5xl lg:text-[3.25rem] font-heading font-medium tracking-tight leading-[1.1] ${
              isDark ? 'text-[#F8FBFF]' : 'text-[#0F172A]'
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
                isDark ? 'border-[#243B56]' : 'border-[#DCE6F0]'
              }`}
            >
              <div>
                {/* Number in Manrope and subtle Kopa Blue accent */}
                <div className={`text-4xl sm:text-5xl font-heading font-normal tracking-tight mb-4 flex items-center justify-between ${
                  isDark ? 'text-white/80' : 'text-[#0F3B82]'
                }`}>
                  <span className="group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors duration-200">
                    {step.num}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>

                <h3 className={`text-xl sm:text-2xl font-heading font-semibold mb-2 tracking-tight ${
                  isDark ? 'text-[#F8FBFF]' : 'text-[#0F172A]'
                }`}>
                  {step.title}
                </h3>

                <p className={`text-sm sm:text-base leading-relaxed font-sans ${
                  isDark ? 'text-[#D5E2F0]' : 'text-[#475569]'
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
