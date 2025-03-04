
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeType = 'light' | 'dark' | 'sepia';

export interface Theme {
  background: string;
  text: string;
  accent: string;
}

export const themes: Record<ThemeType, Theme> = {
  light: { background: '#ffffff', text: '#2A282A', accent: '#2A282A' },
  dark: { background: '#32303b', text: '#E9E7E2', accent: '#E9E7E2' },
  sepia: { background: '#F4ECD8', text: '#5B4636', accent: '#5B4636' }
};

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.dark,
  themeType: 'dark',
  setThemeType: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>('dark');

  useEffect(() => {
    // Remove any existing theme classes
    document.documentElement.classList.remove('light', 'dark', 'sepia');
    // Add the new theme class
    document.documentElement.classList.add(themeType);
  }, [themeType]);

  const value = {
    theme: themes[themeType],
    themeType,
    setThemeType
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
