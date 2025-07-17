import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, getTranslation, TranslationKey, languages } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  useEffect(() => {
    // Get language from localStorage or browser language
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['ar', 'en', 'fr'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    } else {
      // Detect browser language
      const browserLang = navigator.language.slice(0, 2);
      if (['ar', 'en', 'fr'].includes(browserLang)) {
        setLanguage(browserLang as Language);
      }
    }
  }, []);

  useEffect(() => {
    // Save language to localStorage
    localStorage.setItem('language', language);
    
    // Update document direction and language
    const currentLang = languages.find(l => l.code === language);
    if (currentLang) {
      document.documentElement.setAttribute('dir', currentLang.dir);
      document.documentElement.setAttribute('lang', language);
    }
  }, [language]);

  const t = (key: TranslationKey): string => {
    return getTranslation(language, key);
  };

  const currentLanguageInfo = languages.find(l => l.code === language);
  const dir = currentLanguageInfo?.dir || 'ltr';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}