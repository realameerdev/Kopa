import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  isTransitioning: boolean;
  toggleTheme: (origin?: { x: number; y: number }) => void;
  transitionData: {
    origin: { x: number; y: number };
    targetTheme: Theme;
  } | null;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // 1. Saved Kopa preference in localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kopa-theme') as Theme | null;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      // 2. System preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    }
    // 3. Default Kopa dark theme
    return 'dark';
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionData, setTransitionData] = useState<{
    origin: { x: number; y: number };
    targetTheme: Theme;
  } | null>(null);

  // Sync with document element class & data-theme
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
    }
    try {
      localStorage.setItem('kopa-theme', theme);
    } catch {
      // Ignore quota errors in restricted iframes
    }
  }, [theme]);

  const toggleTheme = (origin?: { x: number; y: number }) => {
    if (isTransitioning) return;

    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';

    // Check for prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      // Instant graceful swap for reduced motion
      setTheme(nextTheme);
      return;
    }

    const defaultOrigin = {
      x: typeof window !== 'undefined' ? window.innerWidth - 80 : 300,
      y: 40,
    };

    const targetOrigin = origin || defaultOrigin;

    setTransitionData({
      origin: targetOrigin,
      targetTheme: nextTheme,
    });
    setIsTransitioning(true);

    // Halfway through the silk wave (380ms), switch the underlying DOM theme
    setTimeout(() => {
      setTheme(nextTheme);
    }, 380);

    // Complete the silk animation and clear transition state
    setTimeout(() => {
      setIsTransitioning(false);
      setTransitionData(null);
    }, 850);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        isTransitioning,
        toggleTheme,
        transitionData,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
