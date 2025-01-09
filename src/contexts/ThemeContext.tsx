import React, { createContext, useContext, useState } from 'react';

export type ThemeType = 'light' | 'dark' | 'sepia';

export interface Theme {
  background: string;
  text: string;
  accent: string;
}

export const themes: Record<ThemeType, Theme> = {
  light: { background: '#ffffff', text: '#000000', accent: '#007AFF' },
  dark: { background: '#000000', text: '#ffffff', accent: '#0A84FF' },
  sepia: { background: '#F4ECD8', text: '#5B4636', accent: '#BC4B51' }
};

interface ThemeContextType {
  theme: Theme;
  themeType: ThemeType;
  setThemeType: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: themes.light,
  themeType: 'light',
  setThemeType: () => {}
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [themeType, setThemeType] = useState<ThemeType>('light');

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