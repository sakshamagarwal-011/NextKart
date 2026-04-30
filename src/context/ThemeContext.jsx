import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({});

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext);

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('nearkart_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('nearkart_theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  function toggleTheme() {
    setIsDark(prev => !prev);
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
