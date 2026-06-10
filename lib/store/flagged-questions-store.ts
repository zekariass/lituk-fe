import { create } from 'zustand';
import { FlaggedQuestionResponse, Explanation, Tip } from '@/lib/types';
import { getFlaggedQuestions, deleteFlag, getExplanation, getTips } from '@/lib/api/flags';

interface FlaggedQuestionsState {
  flaggedQuestions: FlaggedQuestionResponse[];
  page: number;
  size: number;
  loading: boolean;
  expandedQuestionId: number | null;
  language: string;
  explanations: Record<number, Explanation>;
  tips: Record<number, Tip[]>;
  showAnswer: Record<number, boolean>;
  showExplanation: Record<number, boolean>;
  showTips: Record<number, boolean>;
  hasMore: boolean;
  
  fetchFlaggedQuestions: (page?: number) => Promise<void>;
  setExpandedQuestion: (id: number | null) => void;
  setLanguage: (language: string) => void;
  removeFlag: (flagId: number) => Promise<void>;
  fetchExplanation: (questionId: number) => Promise<void>;
  fetchTips: (questionId: number) => Promise<void>;
  toggleShowAnswer: (questionId: number) => void;
  toggleShowExplanation: (questionId: number) => void;
  toggleShowTips: (questionId: number) => void;
  reset: () => void;
}

export const useFlaggedQuestionsStore = create<FlaggedQuestionsState>((set, get) => ({
  flaggedQuestions: [],
  page: 0,
  size: 20,
  loading: false,
  expandedQuestionId: null,
  language: 'en',
  explanations: {},
  tips: {},
  showAnswer: {},
  showExplanation: {},
  showTips: {},
  hasMore: true,

  fetchFlaggedQuestions: async (page) => {
    const currentPage = page ?? get().page;
    set({ loading: true });
    
    try {
      const questions = await getFlaggedQuestions({
        page: currentPage,
        size: get().size,
      });
      
      // Ensure questions is always an array
      const questionArray = Array.isArray(questions) ? questions : [];
      
      set({
        flaggedQuestions: questionArray,
        page: currentPage,
        loading: false,
        hasMore: questionArray.length >= get().size,
      });
    } catch (error) {
      console.error('Failed to fetch flagged questions:', error);
      set({ 
        flaggedQuestions: [],
        loading: false 
      });
    }
  },

  setExpandedQuestion: (id) => {
    set({ expandedQuestionId: id });
  },

  setLanguage: (language) => {
    set({ language });
  },

  removeFlag: async (questionId) => {
    // Optimistically remove from list immediately
    const previousQuestions = get().flaggedQuestions;
    set((state) => ({
      flaggedQuestions: state.flaggedQuestions.filter((q) => q.question.id !== questionId),
    }));

    try {
      await deleteFlag(questionId);
    } catch (error) {
      console.error('Failed to remove flag:', error);
      // Rollback on error
      set({ flaggedQuestions: previousQuestions });
      throw error;
    }
  },

  fetchExplanation: async (questionId) => {
    const existing = get().explanations[questionId];
    if (existing) return;

    try {
      const explanation = await getExplanation(questionId);
      set((state) => ({
        explanations: {
          ...state.explanations,
          [questionId]: explanation,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch explanation:', error);
    }
  },

  fetchTips: async (questionId) => {
    const existing = get().tips[questionId];
    if (existing) return;

    try {
      const rawTips = await getTips(questionId);
      const tips = rawTips
        .filter((tip) => tip.active !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      set((state) => ({
        tips: {
          ...state.tips,
          [questionId]: tips,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch tips:', error);
    }
  },

  toggleShowAnswer: (questionId) => {
    set((state) => ({
      showAnswer: {
        ...state.showAnswer,
        [questionId]: !state.showAnswer[questionId],
      },
    }));
  },

  toggleShowExplanation: (questionId) => {
    const isShowing = get().showExplanation[questionId];
    
    set((state) => ({
      showExplanation: {
        ...state.showExplanation,
        [questionId]: !isShowing,
      },
    }));

    if (!isShowing) {
      get().fetchExplanation(questionId);
    }
  },

  toggleShowTips: (questionId) => {
    const isShowing = get().showTips[questionId];
    
    set((state) => ({
      showTips: {
        ...state.showTips,
        [questionId]: !isShowing,
      },
    }));

    if (!isShowing) {
      get().fetchTips(questionId);
    }
  },

  reset: () => {
    set({
      flaggedQuestions: [],
      page: 0,
      loading: false,
      expandedQuestionId: null,
      explanations: {},
      tips: {},
      showAnswer: {},
      showExplanation: {},
      showTips: {},
      hasMore: true,
    });
  },
}));
