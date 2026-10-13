import { useCallback, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'edupulse-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {
    // ignore storage errors (private mode, etc.)
  }
  // Default to light — the app shell was designed light-first.
  return 'light';
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const isDark = theme === 'dark';

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', isDark);
    root.style.colorScheme = theme;
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme, isDark]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, isDark, toggleTheme, setTheme };
}

export default useTheme;
