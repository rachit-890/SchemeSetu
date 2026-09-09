import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Language, QuestionDto, MatchedSchemeDto, AnswerHistoryItem } from '../types';
import { UI_TRANSLATIONS } from '../utils/translations';
import type { UiLabels } from '../utils/translations';
import { api } from '../services/api';

interface AppContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  ui: UiLabels;
  sessionId: number | null;
  currentQuestion: QuestionDto | null;
  questionIndex: number;
  history: AnswerHistoryItem[];
  results: MatchedSchemeDto[];
  hasCompletedQuestionnaire: boolean;
  isTranslatingResults: boolean;
  setSession: (sessionId: number, question: QuestionDto | null) => void;
  setCurrentQuestion: (question: QuestionDto | null, index?: number) => void;
  setResults: (results: MatchedSchemeDto[], targetLang?: Language) => void;
  pushHistory: (item: AnswerHistoryItem) => void;
  popHistory: () => AnswerHistoryItem | undefined;
  resetQuestionnaire: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>('en');
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [currentQuestion, setCurrentQuestionState] = useState<QuestionDto | null>(null);
  const [questionIndex, setQuestionIndex] = useState<number>(1);
  const [history, setHistory] = useState<AnswerHistoryItem[]>([]);
  const [results, setResultsState] = useState<MatchedSchemeDto[]>([]);
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] = useState<boolean>(false);
  const [isTranslatingResults, setIsTranslatingResults] = useState<boolean>(false);

  // Client-side results cache keyed by language ('en' | 'hi') to prevent repeated LLM calls on toggle
  const resultsCacheRef = useRef<Partial<Record<Language, MatchedSchemeDto[]>>>({});

  const ui = UI_TRANSLATIONS[lang];

  const setResults = useCallback((newResults: MatchedSchemeDto[], targetLang?: Language) => {
    const effectiveLang = targetLang || lang;
    setResultsState(newResults);
    setHasCompletedQuestionnaire(true);
    if (newResults && newResults.length > 0) {
      resultsCacheRef.current = {
        ...resultsCacheRef.current,
        [effectiveLang]: newResults,
      };
    }
  }, [lang]);

  const setSession = (newSessionId: number, firstQuestion: QuestionDto | null) => {
    setSessionId(newSessionId);
    setCurrentQuestionState(firstQuestion);
    setQuestionIndex(1);
    setHistory([]);
    setResultsState([]);
    setHasCompletedQuestionnaire(false);
    resultsCacheRef.current = {};
  };

  const setCurrentQuestion = (question: QuestionDto | null, index?: number) => {
    setCurrentQuestionState(question);
    if (index !== undefined) {
      setQuestionIndex(index);
    }
  };

  const pushHistory = (item: AnswerHistoryItem) => {
    setHistory((prev) => [...prev, item]);
  };

  const popHistory = (): AnswerHistoryItem | undefined => {
    if (history.length === 0) return undefined;
    const lastItem = history[history.length - 1];
    setHistory((prev) => prev.slice(0, prev.length - 1));
    return lastItem;
  };

  const resetQuestionnaire = () => {
    setSessionId(null);
    setCurrentQuestionState(null);
    setQuestionIndex(1);
    setHistory([]);
    setResultsState([]);
    setHasCompletedQuestionnaire(false);
    resultsCacheRef.current = {};
  };

  const setLang = useCallback(
    async (newLang: Language) => {
      setLangState(newLang);

      // Check if we have results in context
      if (results.length > 0 || Object.keys(resultsCacheRef.current).length > 0) {
        // 1. CACHE HIT: If we already have results generated for this language, use them instantly!
        if (resultsCacheRef.current[newLang] && resultsCacheRef.current[newLang]!.length > 0) {
          setResultsState(resultsCacheRef.current[newLang]!);
          return;
        }

        // 2. CACHE MISS: Only fetch from API if we haven't generated this language yet in this session
        if (history.length > 0) {
          setIsTranslatingResults(true);
          try {
            const answersMap: Record<string, string> = {};
            history.forEach((item) => {
              answersMap[item.fieldName] = item.value;
            });

            const age = answersMap['age'] ? parseInt(answersMap['age'], 10) : undefined;
            const monthlyIncome = answersMap['monthlyIncome']
              ? parseFloat(answersMap['monthlyIncome'])
              : undefined;
            const landHoldingAcres = answersMap['landHoldingAcres']
              ? parseFloat(answersMap['landHoldingAcres'])
              : undefined;

            const translatedResults = await api.matchSchemesDirect({
              age: isNaN(age as any) ? undefined : age,
              monthlyIncome: isNaN(monthlyIncome as any) ? undefined : monthlyIncome,
              state: answersMap['state'],
              casteCategory: answersMap['casteCategory'],
              occupation: answersMap['occupation'],
              gender: answersMap['gender'],
              landHoldingAcres: isNaN(landHoldingAcres as any) ? undefined : landHoldingAcres,
              lang: newLang,
            });

            setResultsState(translatedResults);
            // Save to cache for future instant toggles
            resultsCacheRef.current = {
              ...resultsCacheRef.current,
              [newLang]: translatedResults,
            };
          } catch (err) {
            console.error('Failed to re-fetch translations on language switch:', err);
          } finally {
            setIsTranslatingResults(false);
          }
        }
      }
    },
    [history, results.length]
  );

  return (
    <AppContext.Provider
      value={{
        lang,
        setLang,
        ui,
        sessionId,
        currentQuestion,
        questionIndex,
        history,
        results,
        hasCompletedQuestionnaire,
        isTranslatingResults,
        setSession,
        setCurrentQuestion,
        setResults,
        pushHistory,
        popHistory,
        resetQuestionnaire,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
