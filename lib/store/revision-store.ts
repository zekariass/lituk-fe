import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  ApiResponse,
  Explanation,
  PaginationMeta,
  Question,
  RevisionProgress,
  RevisionSession,
  RevisionSessionGetRequest,
  RevisionSessionGetResponse,
  RevisionSessionMeta,
  RevisionSessionQuestionsResponse,
  RevisionQuestionAttempt,
  RevisionSessionSummary,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  Tip,
} from '@/lib/types';
import api from '@/lib/api/client';

interface RevisionAnswer {
  selectedOptionIds: number[];
  isCorrect: boolean;
  correctOptionIds: number[];
  pointsEarned?: number;
}

interface SessionInitParams {
  categoryId: number;
  licenceCategoryId: number;
  restart?: boolean;
}

type PaginationDirection = 'next' | 'previous';

interface RevisionState {
  currentSession: RevisionSession | null;
  questions: Question[];
  currentIndex: number;
  progress: RevisionProgress | null;
  questionCountPerCategory: Record<number, number | null>;
  activeCategoryId: number | null;
  activeLicenceCategoryId: number | null;
  categoryName: string;
  allQuestionsAttempted: boolean;
  sessions: RevisionSessionMeta[];
  sessionPagination: PaginationMeta | null;
  loadedSessionPages: number[];
  selectedSessionId: string | null;
  selectedSessionSummary: RevisionSessionSummary | null;
  selectedSessionQuestions: Question[];
  selectedSessionPagination: PaginationMeta | null;

  answers: Record<number, RevisionAnswer>;
  explanations: Record<number, Explanation>;
  tips: Record<number, Tip[]>;
  viewedExplanation: Record<number, boolean>;
  viewedTip: Record<number, boolean>;
  timers: Record<number, number>;
  questionStartTimes: Record<number, number>;
  flaggedQuestions: Record<number, boolean>;

  isLoading: boolean;
  error: string | null;

  setQuestionCountForCategory: (categoryId: number, count: number | null) => void;
  getQuestionCountForCategory: (categoryId: number) => number | null | undefined;
  initializeSession: (params: SessionInitParams) => Promise<void>;
  restartCurrentSession: () => Promise<void>;
  setCurrentIndex: (index: number) => void;
  loadAdjacentQuestions: (direction: PaginationDirection) => Promise<boolean>;
  openCompletedSession: (sessionId: string) => Promise<void>;
  loadCompletedSessionPage: (direction: PaginationDirection) => Promise<boolean>;
  startQuestionTimer: (questionId: number) => void;
  setQuestionElapsedSeconds: (questionId: number, seconds: number) => void;
  submitAnswer: (sessionId: string, request: SubmitAnswerRequest) => Promise<SubmitAnswerResponse>;
  fetchExplanation: (questionId: number) => Promise<Explanation | null>;
  fetchTips: (questionId: number) => Promise<Tip[]>;
  prefetchQuestionContext: (questionIds: number[]) => Promise<void>;
  markExplanationViewed: (questionId: number) => void;
  markTipViewed: (questionId: number) => void;
  setQuestionFlagged: (questionId: number, isFlagged: boolean) => void;
  completeSession: (sessionId: string) => Promise<void>;
  fetchProgress: () => Promise<void>;
  resetSession: () => void;
}

const resolveQuestionText = (question: Question): string => {
  return question.question ?? question.text ?? '';
};

const normalizeQuestion = (question: Question): Question => ({
  ...question,
  text: resolveQuestionText(question),
  options: [...(question.options ?? [])].sort(
    (a, b) => (a.displayOrder ?? a.position ?? 0) - (b.displayOrder ?? b.position ?? 0)
  ),
});

const defaultPagination = (questionCount: number): PaginationMeta => ({
  currentPage: 1,
  pageSize: 10,
  totalPages: 1,
  totalElements: questionCount,
  hasNext: questionCount >= 10,
  hasPrevious: false,
});

const mergeQuestionsById = (currentQuestions: Question[], incomingQuestions: Question[]): Question[] => {
  const questionMap = new Map<number, Question>();

  [...currentQuestions, ...incomingQuestions].forEach((question) => {
    questionMap.set(question.id, question);
  });

  return Array.from(questionMap.values()).sort((a, b) => a.id - b.id);
};

const getAttemptFromQuestion = (question: Question): RevisionQuestionAttempt | undefined => {
  const withAttempt = question as Question & { attempt?: RevisionQuestionAttempt };
  return withAttempt.currentSessionAttempt ?? withAttempt.attempt;
};

const extractAnswersFromQuestions = (questions: Question[]): Record<number, RevisionAnswer> => {
  return questions.reduce<Record<number, RevisionAnswer>>((acc, question) => {
    const attempt = getAttemptFromQuestion(question);
    if (!attempt) {
      return acc;
    }

    const selectedOptionIds = Array.from(new Set(attempt.selectedOptionIds ?? [])).sort((a, b) => a - b);
    const correctOptionIds = (attempt.correctOptionIds && attempt.correctOptionIds.length > 0)
      ? attempt.correctOptionIds
      : question.options
          .filter((option) => option.isCorrect)
          .map((option) => option.id);

    acc[question.id] = {
      selectedOptionIds,
      isCorrect: attempt.isCorrect,
      correctOptionIds: correctOptionIds.length > 0 ? correctOptionIds : selectedOptionIds,
      pointsEarned: attempt.pointsAwarded,
    };

    return acc;
  }, {});
};

const fetchSessionQuestionsPage = async (
  sessionId: string,
  page: number,
  pageSize = 20
): Promise<RevisionSessionQuestionsResponse> => {
  const response = await api.get<ApiResponse<RevisionSessionQuestionsResponse>>(
    `/api/v1/revision/sessions/${sessionId}/questions`,
    {
      params: {
        page,
        size: pageSize,
        sort: 'id,asc',
      },
    }
  );

  return response.data.data;
};

export const useRevisionStore = create<RevisionState>()(
  persist(
    (set, get) => ({
      currentSession: null,
      questions: [],
      currentIndex: 0,
      progress: null,
      questionCountPerCategory: {},
      activeCategoryId: null,
      activeLicenceCategoryId: null,
      categoryName: '',
      allQuestionsAttempted: false,
      sessions: [],
      sessionPagination: null,
      loadedSessionPages: [],
      selectedSessionId: null,
      selectedSessionSummary: null,
      selectedSessionQuestions: [],
      selectedSessionPagination: null,

      answers: {},
      explanations: {},
      tips: {},
      viewedExplanation: {},
      viewedTip: {},
      timers: {},
      questionStartTimes: {},
      flaggedQuestions: {},

      isLoading: false,
      error: null,

      setQuestionCountForCategory: (categoryId, count) => {
        set((state) => ({
          questionCountPerCategory: {
            ...state.questionCountPerCategory,
            [categoryId]: count,
          },
        }));
      },

      loadAdjacentQuestions: async (direction) => {
        const { currentSession, sessionPagination, questions, currentIndex } = get();
        if (!currentSession || !sessionPagination) {
          return false;
        }

        if (direction === 'next' && !sessionPagination.hasNext) {
          return false;
        }

        if (direction === 'previous' && !sessionPagination.hasPrevious) {
          return false;
        }

        const targetPage = direction === 'next'
          ? sessionPagination.currentPage + 1
          : sessionPagination.currentPage - 1;

        set({ isLoading: true, error: null });

        try {
          const response = await fetchSessionQuestionsPage(currentSession.id, targetPage, sessionPagination.pageSize || 10);
          const normalizedIncoming = (response.questions ?? []).map(normalizeQuestion);
          const mergedQuestions = mergeQuestionsById(questions, normalizedIncoming);
          const incomingAnswers = extractAnswersFromQuestions(normalizedIncoming);
          const previousQuestionId = questions[currentIndex]?.id;
          const fallbackIndex = Math.max(0, Math.min(currentIndex, mergedQuestions.length - 1));
          const nextIndex = previousQuestionId
            ? mergedQuestions.findIndex((question) => question.id === previousQuestionId)
            : fallbackIndex;

          set((state) => ({
            isLoading: false,
            questions: mergedQuestions,
            answers: {
              ...state.answers,
              ...incomingAnswers,
            },
            currentIndex: nextIndex >= 0 ? nextIndex : fallbackIndex,
            sessionPagination: response.pagination ?? {
              ...sessionPagination,
              currentPage: targetPage,
            },
            loadedSessionPages: Array.from(new Set([...state.loadedSessionPages, targetPage])).sort((a, b) => a - b),
          }));

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load questions',
          });
          return false;
        }
      },

      openCompletedSession: async (sessionId) => {
        set({
          isLoading: true,
          error: null,
          selectedSessionId: sessionId,
          selectedSessionQuestions: [],
          selectedSessionSummary: null,
          selectedSessionPagination: null,
        });

        try {
          const response = await fetchSessionQuestionsPage(sessionId, 1, 10);
          const normalizedQuestions = (response.questions ?? []).map(normalizeQuestion);

          set({
            isLoading: false,
            selectedSessionSummary: response.summary ?? null,
            selectedSessionQuestions: normalizedQuestions,
            selectedSessionPagination: response.pagination ?? defaultPagination(normalizedQuestions.length),
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load session history',
          });
          throw error;
        }
      },

      loadCompletedSessionPage: async (direction) => {
        const { selectedSessionId, selectedSessionPagination, selectedSessionQuestions } = get();
        if (!selectedSessionId || !selectedSessionPagination) {
          return false;
        }

        if (direction === 'next' && !selectedSessionPagination.hasNext) {
          return false;
        }

        if (direction === 'previous' && !selectedSessionPagination.hasPrevious) {
          return false;
        }

        const targetPage = direction === 'next'
          ? selectedSessionPagination.currentPage + 1
          : selectedSessionPagination.currentPage - 1;

        set({ isLoading: true, error: null });

        try {
          const response = await fetchSessionQuestionsPage(
            selectedSessionId,
            targetPage,
            selectedSessionPagination.pageSize || 10
          );

          const normalizedQuestions = (response.questions ?? []).map(normalizeQuestion);

          set({
            isLoading: false,
            selectedSessionSummary: response.summary ?? get().selectedSessionSummary,
            selectedSessionQuestions: mergeQuestionsById(selectedSessionQuestions, normalizedQuestions),
            selectedSessionPagination: response.pagination ?? {
              ...selectedSessionPagination,
              currentPage: targetPage,
            },
          });

          return true;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.response?.data?.message || 'Failed to load session history',
          });
          return false;
        }
      },

      getQuestionCountForCategory: (categoryId) => {
        return get().questionCountPerCategory[categoryId];
      },

      initializeSession: async ({ categoryId, licenceCategoryId, restart = false }) => {
        set({
          isLoading: true,
          error: null,
          activeCategoryId: categoryId,
          activeLicenceCategoryId: licenceCategoryId,
        });

        try {
          const request: RevisionSessionGetRequest = {
            categoryId,
            licenceCategoryId,
            restart,
          };

          const response = await api.post<ApiResponse<RevisionSessionGetResponse>>(
            '/api/v1/revision/sessions/get',
            request
          );

          const payload = response.data.data;

          let normalizedQuestions = (payload.questions ?? [])
            .map(normalizeQuestion)
            .sort((a, b) => a.id - b.id);

          const sessionPagination: PaginationMeta = {
            currentPage: 1,
            pageSize: Math.max(normalizedQuestions.length, 1),
            totalPages: 1,
            totalElements: normalizedQuestions.length,
            hasNext: false,
            hasPrevious: false,
          };

          const answers = extractAnswersFromQuestions(normalizedQuestions);

          let initialIndex = 0;
          if (typeof payload.lastQuestionAttemptedId === 'number') {
            const lastAttemptedIndex = normalizedQuestions.findIndex(
              (question) => question.id === payload.lastQuestionAttemptedId
            );
            if (lastAttemptedIndex >= 0) {
              initialIndex = Math.min(lastAttemptedIndex + 1, Math.max(normalizedQuestions.length - 1, 0));
            }
          }

          if (payload.allQuestionsAttempted) {
            initialIndex = 0;
          }

          const initialQuestionId = normalizedQuestions[initialIndex]?.id;

          set({
            currentSession: {
              id: payload.sessionId,
              sessionId: payload.sessionId,
              categoryId,
              questionCount: null,
              categoryName: payload.categoryName,
              allQuestionsAttempted: payload.allQuestionsAttempted,
              status: payload.allQuestionsAttempted ? 'COMPLETED' : 'IN_PROGRESS',
              startedAt: new Date().toISOString(),
              currentQuestionIndex: initialIndex,
            },
            questions: normalizedQuestions,
            currentIndex: initialIndex,
            categoryName: payload.categoryName,
            allQuestionsAttempted: payload.allQuestionsAttempted,
            sessions: [...(payload.sessions ?? [])].sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ),
            sessionPagination,
            loadedSessionPages: [1],
            answers,
            explanations: {},
            tips: {},
            viewedExplanation: {},
            viewedTip: {},
            timers: {},
            questionStartTimes: initialQuestionId ? { [initialQuestionId]: Date.now() } : {},
            isLoading: false,
          });
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to initialize session',
            isLoading: false,
          });
          throw error;
        }
      },

      restartCurrentSession: async () => {
        const { activeCategoryId, activeLicenceCategoryId } = get();
        if (!activeCategoryId || !activeLicenceCategoryId) {
          return;
        }

        await get().initializeSession({
          categoryId: activeCategoryId,
          licenceCategoryId: activeLicenceCategoryId,
          restart: true,
        });
      },

      setCurrentIndex: (index) => {
        const { questions } = get();
        const nextIndex = Math.max(0, Math.min(index, questions.length - 1));
        const questionId = questions[nextIndex]?.id;

        set((state) => ({
          currentIndex: nextIndex,
          questionStartTimes:
            questionId && !state.questionStartTimes[questionId]
              ? { ...state.questionStartTimes, [questionId]: Date.now() }
              : state.questionStartTimes,
        }));
      },

      startQuestionTimer: (questionId) => {
        set((state) => ({
          questionStartTimes: state.questionStartTimes[questionId]
            ? state.questionStartTimes
            : {
                ...state.questionStartTimes,
                [questionId]: Date.now(),
              },
        }));
      },

      setQuestionElapsedSeconds: (questionId, seconds) => {
        set((state) => ({
          timers: {
            ...state.timers,
            [questionId]: seconds,
          },
        }));
      },

      submitAnswer: async (sessionId, request) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<ApiResponse<SubmitAnswerResponse>>(
            `/api/v1/revision/sessions/${sessionId}/submit`,
            request
          );

          const result = response.data.data;
          set((state) => ({
            isLoading: false,
            answers: {
              ...state.answers,
              [result.questionId]: {
                selectedOptionIds: Array.from(new Set(result.selectedOptionIds ?? [])).sort((a, b) => a - b),
                isCorrect: result.isCorrect,
                correctOptionIds: Array.from(new Set(result.correctOptionIds ?? [])).sort((a, b) => a - b),
                pointsEarned: result.points?.totalPoints,
              },
            },
            timers: {
              ...state.timers,
              [result.questionId]: result.timeTakenSeconds,
            },
            questions: state.questions.map((question) =>
              question.id === result.questionId
                ? {
                    ...question,
                    userAnswerCorrect: result.isCorrect,
                    pointsEarned: result.points?.totalPoints ?? 0,
                  }
                : question
            ),
          }));

          return result;
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to submit answer',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchExplanation: async (questionId) => {
        const cachedExplanation = get().explanations[questionId];
        if (cachedExplanation) {
          return cachedExplanation;
        }

        const response = await api.get<ApiResponse<Explanation>>(`/api/v1/questions/${questionId}/explanation`);
        const explanation = response.data?.data;

        if (!explanation) {
          return null;
        }

        set((state) => ({
          explanations: {
            ...state.explanations,
            [questionId]: explanation,
          },
        }));

        return explanation;
      },

      fetchTips: async (questionId) => {
        const cachedTips = get().tips[questionId];
        if (cachedTips) {
          return cachedTips;
        }

        const response = await api.get<ApiResponse<Tip[]>>(`/api/v1/questions/${questionId}/tips`);
        const tips = (response.data?.data ?? [])
          .filter((tip) => tip.active !== false)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

        set((state) => ({
          tips: {
            ...state.tips,
            [questionId]: tips,
          },
        }));

        return tips;
      },

      prefetchQuestionContext: async (questionIds) => {
        const uniqueIds = Array.from(new Set(questionIds.filter((id) => Number.isFinite(id) && id > 0)));
        await Promise.all(
          uniqueIds.map(async (questionId) => {
            try {
              await Promise.all([get().fetchExplanation(questionId), get().fetchTips(questionId)]);
            } catch {
              // Ignore prefetch failures to keep navigation responsive.
            }
          })
        );
      },

      markExplanationViewed: (questionId) => {
        set((state) => ({
          viewedExplanation: { ...state.viewedExplanation, [questionId]: true },
        }));
      },

      markTipViewed: (questionId) => {
        set((state) => ({
          viewedTip: { ...state.viewedTip, [questionId]: true },
        }));
      },

      setQuestionFlagged: (questionId, isFlagged) => {
        set((state) => ({
          flaggedQuestions: { ...state.flaggedQuestions, [questionId]: isFlagged },
        }));
      },

      completeSession: async (sessionId) => {
        set({ isLoading: true, error: null });
        try {
          await api.patch(`/api/v1/revision/sessions/${sessionId}/complete`);
          set({ isLoading: false });
          // await get().fetchProgress();
        } catch (error: any) {
          set({
            error: error.response?.data?.message || 'Failed to complete session',
            isLoading: false,
          });
          throw error;
        }
      },

      fetchProgress: async () => {
        try {
          const response = await api.get<ApiResponse<RevisionProgress>>('/api/v1/revision/progress');
          set({ progress: response.data.data });
        } catch {
          // Keep this non-blocking.
        }
      },

      resetSession: () => {
        set({
          currentSession: null,
          questions: [],
          currentIndex: 0,
          activeCategoryId: null,
          activeLicenceCategoryId: null,
          categoryName: '',
          allQuestionsAttempted: false,
          sessions: [],
          sessionPagination: null,
          loadedSessionPages: [],
          selectedSessionId: null,
          selectedSessionSummary: null,
          selectedSessionQuestions: [],
          selectedSessionPagination: null,
          answers: {},
          explanations: {},
          tips: {},
          viewedExplanation: {},
          viewedTip: {},
          timers: {},
          questionStartTimes: {},
          flaggedQuestions: {},
          error: null,
        });
      },
    }),
    {
      name: 'revision-store',
      partialize: (state) => ({
        questionCountPerCategory: state.questionCountPerCategory,
      }),
    }
  )
);
