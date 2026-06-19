import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TestState, Answer, QuestionDetail, GetMockTestQuestionsResponse } from '@/lib/types/mock-test';

interface MockTestStore {
  testState: TestState | null;
  
  initializeTest: (data: GetMockTestQuestionsResponse, jurisdictionId: number, licenceCategoryId: number) => void;
  updateAnswer: (questionId: number, optionId: number) => void;
  setCurrentQuestion: (index: number) => void;
  updateTimeRemaining: (seconds: number) => void;
  clearTest: () => void;
  
  getAnsweredCount: () => number;
  getProgress: () => number;
  isQuestionAnswered: (questionId: number) => boolean;
}

const storage = {
  getItem: (name: string) => {
    if (typeof window === 'undefined') return null;
    try {
      const str = localStorage.getItem(name);
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Ignore errors
    }
  },
  removeItem: (name: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(name);
    } catch {
      // Ignore errors
    }
  },
};

export const useMockTestStore = create<MockTestStore>()(
  persist(
    (set, get) => ({
      testState: null,
      
      initializeTest: (data, jurisdictionId, licenceCategoryId) => {
        const startTime = Date.now();
        const endTime = startTime + (data.config.durationMinutes * 60 * 1000);
        
        set({
          testState: {
            questions: data.questions,
            answers: {},
            currentQuestionIndex: 0,
            startTime,
            endTime,
            timeRemaining: data.config.durationMinutes * 60,
            config: data.config,
            jurisdictionId,
            licenceCategoryId
          }
        });
      },
      
      updateAnswer: (questionId, optionId) => {
        const state = get().testState;
        if (!state) return;

        const question = state.questions.find((q) => q.questionId === questionId);
        if (!question) return;

        const correctOptionIds = question.options
          ?.filter((o) => o.isCorrect)
          ?.map((o) => o.id)
          ?.sort((a, b) => a - b) ?? [];
        const correctCount = correctOptionIds.length;

        const existingAnswer = state.answers[questionId];
        const questionStartTime = existingAnswer?.answeredAt || Date.now();
        const currentSelections = existingAnswer?.selectedOptionIds ?? [];

        let nextSelected: number[];
        if (correctCount <= 1) {
          // Single-correct: replace selection
          nextSelected = currentSelections.includes(optionId) ? [] : [optionId];
        } else {
          // Multi-correct: toggle with FIFO rotation when at cap
          const idx = currentSelections.indexOf(optionId);
          if (idx >= 0) {
            nextSelected = currentSelections.filter((_, i) => i !== idx);
          } else if (currentSelections.length < correctCount) {
            nextSelected = [...currentSelections, optionId];
          } else {
            nextSelected = [...currentSelections.slice(1), optionId];
          }
        }

        const nextSelections = Array.from(new Set(nextSelected)).sort((a, b) => a - b);
        const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

        const nextAnswers = { ...state.answers };
        if (nextSelections.length === 0) {
          delete nextAnswers[questionId];
        } else {
          nextAnswers[questionId] = {
            questionId,
            selectedOptionIds: nextSelections,
            timeTakenSeconds: timeTaken,
            answeredAt: existingAnswer?.answeredAt ?? Date.now()
          };
        }

        set({
          testState: {
            ...state,
            answers: nextAnswers,
          }
        });
      },
      
      setCurrentQuestion: (index) => {
        const state = get().testState;
        if (!state) return;
        
        set({
          testState: {
            ...state,
            currentQuestionIndex: index
          }
        });
      },
      
      updateTimeRemaining: (seconds) => {
        const state = get().testState;
        if (!state) return;
        
        set({
          testState: {
            ...state,
            timeRemaining: seconds
          }
        });
      },
      
      clearTest: () => set({ testState: null }),
      
      getAnsweredCount: () => {
        const state = get().testState;
        return state ? Object.keys(state.answers).length : 0;
      },
      
      getProgress: () => {
        const state = get().testState;
        if (!state) return 0;
        const answered = Object.keys(state.answers).length;
        return (answered / state.questions.length) * 100;
      },
      
      isQuestionAnswered: (questionId) => {
        const state = get().testState;
        return state ? !!state.answers[questionId] : false;
      }
    }),
    {
      name: 'mock-test-storage',
      storage,
    }
  )
);
