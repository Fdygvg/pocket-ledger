import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('pocketledger-theme') as Theme;
    
    // Check system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    return stored || (systemPrefersDark ? 'dark' : 'light');
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return theme === 'system' 
      ? (systemPrefersDark ? 'dark' : 'light')
      : theme;
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark');
    
    // Add current theme class
    root.classList.add(resolvedTheme);
    
    // Store in localStorage (unless it's system)
    if (theme !== 'system') {
      localStorage.setItem('pocketledger-theme', theme);
    } else {
      localStorage.removeItem('pocketledger-theme');
    }
  }, [theme, resolvedTheme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      }
    };

    // Modern browsers
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);

  // Set theme with proper resolution
  const setThemeWithResolution = (newTheme: Theme) => {
    setTheme(newTheme);
    
    if (newTheme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setResolvedTheme(systemPrefersDark ? 'dark' : 'light');
    } else {
      setResolvedTheme(newTheme);
    }
  };

  // Toggle between light and dark (skip system)
  const toggleTheme = () => {
    if (theme === 'system') {
      setThemeWithResolution('light');
    } else {
      setThemeWithResolution(theme === 'light' ? 'dark' : 'light');
    }
  };

  return {
    theme,
    resolvedTheme,
    setTheme: setThemeWithResolution,
    toggleTheme,
    isDark: resolvedTheme === 'dark',
    isLight: resolvedTheme === 'light',
    isSystem: theme === 'system',
  };
}