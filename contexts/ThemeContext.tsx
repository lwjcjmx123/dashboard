'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useClientUserSettings } from '@/lib/client-data-hooks';

interface ThemeContextType {
  theme: 'light' | 'dark';
  colorScheme: 'blue' | 'green' | 'purple' | 'red';
  setTheme: (theme: 'light' | 'dark') => void;
  setColorScheme: (scheme: 'blue' | 'green' | 'purple' | 'red') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { settings, updateSettings } = useClientUserSettings();
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [colorScheme, setColorSchemeState] = useState<'blue' | 'green' | 'purple' | 'red'>('blue');

  // 应用主题到DOM
  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // 应用颜色方案到DOM
  const applyColorScheme = (scheme: 'blue' | 'green' | 'purple' | 'red') => {
    // 移除所有颜色方案类
    document.documentElement.classList.remove('theme-blue', 'theme-green', 'theme-purple', 'theme-red');
    // 添加新的颜色方案类
    document.documentElement.classList.add(`theme-${scheme}`);
  };

  useEffect(() => {
    if (settings) {
      const newTheme = settings.theme === 'dark' ? 'dark' : 'light';
      const newColorScheme = ['blue', 'green', 'purple', 'red'].includes(settings.colorScheme) 
        ? settings.colorScheme 
        : 'blue';
      
      setThemeState(newTheme);
      setColorSchemeState(newColorScheme);
      applyTheme(newTheme);
      applyColorScheme(newColorScheme);
    }
  }, [settings]);

  const setTheme = async (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    try {
      await updateSettings({ theme: newTheme });
    } catch (error) {
      console.error('Failed to update theme setting:', error);
    }
  };

  const setColorScheme = async (scheme: 'blue' | 'green' | 'purple' | 'red') => {
    setColorSchemeState(scheme);
    applyColorScheme(scheme);
    try {
      await updateSettings({ colorScheme: scheme });
    } catch (error) {
      console.error('Failed to update color scheme setting:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};