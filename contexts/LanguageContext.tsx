'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, TranslationKey, getTranslation } from '@/lib/i18n';
import { useClientUserSettings } from '@/lib/client-data-hooks';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { settings, updateSettings } = useClientUserSettings();
  const [language, setLanguageState] = useState<Language>('zh'); // 默认中文

  useEffect(() => {
    if (settings?.language) {
      // 将设置中的语言代码映射到我们的语言类型
      const mappedLang = settings.language === 'en' ? 'en' : 'zh';
      setLanguageState(mappedLang);
    }
  }, [settings]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    try {
      await updateSettings({ language: lang });
    } catch (error) {
      console.error('Failed to update language setting:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};