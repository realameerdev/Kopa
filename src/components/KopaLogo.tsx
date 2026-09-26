import React from 'react';

interface KopaLogoProps {
  variant?: 'full' | 'symbol' | 'wordmark';
  theme?: 'dark' | 'light' | 'monochrome';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withContainer?: boolean;
  className?: string;
}

/**
 * Kopa Brand Logo System
 *
 * Faithfully constructed from the geometric "K" emblem specification:
 * - Solid geometric vertical stem and dynamic converging/diverging arms
 * - Distinctive circular punctuation / grounding dot positioned beneath the vertical stem
 * - Preserving Kopa's color architecture:
 *   - Dark backgrounds: Crisp White body + Kopa Emerald Green (#19C37D) accent dot
 *   - Light backgrounds: Deep Ink (#07110F) body + Kopa Emerald Green (#19C37D) accent dot
 *   - Monochrome: Inherits currentColor
 */
export const KopaLogo: React.FC<KopaLogoProps> = ({
  variant = 'full',
  theme = 'dark',
  size = 'md',
  withContainer = false,
  className = '',
}) => {
  // Proportional sizing scale
  const sizeMap = {
    sm: { symbolH: 22, box: 30, text: 'text-lg', gap: 'gap-2.5' },
    md: { symbolH: 28, box: 38, text: 'text-xl', gap: 'gap-3' },
    lg: { symbolH: 42, box: 56, text: 'text-3xl', gap: 'gap-3.5' },
    xl: { symbolH: 64, box: 84, text: 'text-5xl', gap: 'gap-4' },
  };

  const currentSize = sizeMap[size];

  // Theme-aware color values
  const isDark = theme === 'dark';
  const isMonochrome = theme === 'monochrome';

  const bodyColor = isMonochrome
    ? 'currentColor'
    : isDark
    ? '#FFFFFF'
    : '#07110F';

  const dotColor = isMonochrome
    ? 'currentColor'
    : '#19C37D';

  const wordmarkTextColor = isMonochrome
    ? 'text-current'
    : isDark
    ? 'text-white'
    : 'text-[#07110F]';

  // Standalone vector geometric symbol
  const symbolElement = (
    <svg
      style={{ height: withContainer ? currentSize.symbolH : currentSize.symbolH, width: 'auto' }}
      viewBox="0 0 138 173"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      aria-label="Kopa emblem"
    >
      {/* 
        Main K Body:
        - Vertical stem width 34, from top Y=0 to Y=122
        - Upper arm: from top (X=92..138) meeting outer right notch at (75.5, 74.5)
        - Lower leg: from outer right notch (75.5, 74.5) to bottom (X=97..138, Y=173)
        - Inner crotch transitions at (34, 67.5) and (51, 102)
      */}
      <path
        d="M0 0 H34 V67.5 L92 0 H138 L75.5 74.5 L138 173 H97 L51 102 L34 122 H0 Z"
        fill={bodyColor}
      />

      {/* 
        Grounding Dot:
        - Positioned directly underneath the vertical stem (X center = 17, Y center = 156)
        - Exact diameter 34 matching stem width, radius 17
        - Bottom aligns at Y=173 matching the lower diagonal leg
        - Finished in signature Kopa Green (#19C37D)
      */}
      <circle
        cx="17"
        cy="156"
        r="17"
        fill={dotColor}
      />
    </svg>
  );

  return (
    <div className={`inline-flex items-center ${currentSize.gap} select-none ${className}`}>
      {variant !== 'wordmark' && (
        withContainer ? (
          <div
            style={{ width: currentSize.box, height: currentSize.box }}
            className={`rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 hover:scale-105 shadow-sm ${
              isDark
                ? 'bg-[#0A1814] border border-[#1E3B30]'
                : 'bg-white border border-[#E3E7E1]'
            }`}
          >
            {symbolElement}
          </div>
        ) : (
          symbolElement
        )
      )}

      {variant !== 'symbol' && (
        <span
          className={`font-display font-extrabold tracking-tight ${currentSize.text} ${wordmarkTextColor} leading-none`}
          style={{ letterSpacing: '-0.04em' }}
        >
          Kopa
        </span>
      )}
    </div>
  );
};
