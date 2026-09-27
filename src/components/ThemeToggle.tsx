import React, { useRef } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'md';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', size = 'sm' }) => {
  const { theme, isDark, toggleTheme, isTransitioning } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (isTransitioning) return;

    // Capture coordinate center of button for the silk wave origin
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      toggleTheme({
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
      });
    } else {
      toggleTheme();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        toggleTheme({
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        });
      } else {
        toggleTheme();
      }
    }
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isTransitioning}
      className={`relative inline-flex items-center select-none rounded-full p-0.5 transition-colors duration-200 cursor-pointer before:content-[''] before:absolute before:-inset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] dark:focus-visible:ring-[#60A5FA] focus-visible:ring-offset-2 ${
        isDark
          ? 'bg-[#0D1B2E] border border-[#243B56] text-[#D5E2F0] focus-visible:ring-offset-[#07111F]'
          : 'bg-[#EAF2FF] border border-[#DCE6F0] text-[#475569] focus-visible:ring-offset-[#F7FAFC]'
      } ${size === 'sm' ? 'w-[52px] h-[28px]' : 'w-[58px] h-[32px]'} ${className}`}
    >
      {/* Sliding Thumb Indicator */}
      <span
        aria-hidden="true"
        className={`absolute rounded-full transition-transform duration-250 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-xs flex items-center justify-center ${
          size === 'sm' ? 'w-5 h-5' : 'w-6 h-6'
        } ${
          isDark
            ? 'translate-x-[26px] bg-[#132640] text-[#60A5FA] border border-[#243B56]'
            : 'translate-x-[2px] bg-white text-[#2563EB] border border-[#DCE6F0]'
        }`}
      >
        {isDark ? (
          <Moon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        ) : (
          <Sun className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
        )}
      </span>

      {/* Background Icons: Sun on left, Moon on right */}
      <div className="flex w-full items-center justify-between px-1.5 pointer-events-none">
        <Sun
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} transition-opacity duration-150 ${
            !isDark ? 'opacity-0' : 'opacity-40 text-slate-400'
          }`}
        />
        <Moon
          className={`${size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} transition-opacity duration-150 ${
            isDark ? 'opacity-0' : 'opacity-40 text-slate-500'
          }`}
        />
      </div>
    </button>
  );
};
