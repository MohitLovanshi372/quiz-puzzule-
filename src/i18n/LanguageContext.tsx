import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { HINDI_MESSAGES } from "./hi";
export type Language = "en" | "hi";
export type Translate = (
  message: string,
  values?: Record<string, string | number>,
) => string;
const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translate;
} | null>(null);
const STORAGE_KEY = "quizverse_language";
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === "hi" ? "hi" : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = language;
    document.title =
      language === "hi"
        ? "QuizVerse — क्विज़ और पहेलियाँ"
        : "QuizVerse — Trivia & Brain Arena";
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* Keep language usable when storage is unavailable. */
    }
  }, [language]);
  const t = useCallback<Translate>(
    (message, values = {}) => {
      const translated =
        language === "hi" ? (HINDI_MESSAGES[message] ?? message) : message;
      return translated.replace(/\{(\w+)\}/g, (match, key: string) =>
        values[key] === undefined ? match : String(values[key]),
      );
    },
    [language],
  );
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage requires LanguageProvider");
  return context;
}
