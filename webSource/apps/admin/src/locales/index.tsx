import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import zhCN from './zh-CN';
import enUS from './en-US';
import arcoZhCN from '@arco-design/web-react/es/locale/zh-CN';
import arcoEnUS from '@arco-design/web-react/es/locale/en-US';

export type Locale = 'zh-CN' | 'en-US';

const dictionaries: Record<Locale, Record<string, string>> = {
  'zh-CN': zhCN,
  'en-US': enUS,
};

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem('admin-locale');
    return (stored === 'en-US' ? 'en-US' : 'zh-CN');
  });

  const setLocale = useCallback((newLocale: Locale) => {
    localStorage.setItem('admin-locale', newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string): string => {
    return dictionaries[locale]?.[key] ?? dictionaries['zh-CN']?.[key] ?? key;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within LocaleProvider');
  return ctx;
}

export function getArcoLocale(locale: Locale) {
  return locale === 'en-US' ? arcoEnUS : arcoZhCN;
}
