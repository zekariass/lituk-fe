export interface MockTestConfigAdminResponse {
  id: number;
  jurisdictionId: number;
  jurisdictionName: string;
  jurisdictionCode: string;
  licenceCategoryId: number;
  licenceCategoryCode: string;
  licenceCategoryName: string;
  totalQuestions: number;
  durationMinutes: number;
  passPercentage: number;
  passMark: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MockTestConfigListResponse {
  content: MockTestConfigAdminResponse[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CreateMockTestConfigRequest {
  jurisdictionId: number;
  licenceCategoryId: number;
  totalQuestions: number;
  durationMinutes: number;
  passPercentage: number;
  passMark: number;
  active: boolean;
}

export interface UpdateMockTestConfigRequest {
  licenceCategoryId?: number;
  totalQuestions?: number;
  durationMinutes?: number;
  passPercentage?: number;
  passMark?: number;
  active?: boolean;
}

export interface MockTestConfigResponse {
  id: number;
  jurisdictionId: number;
  licenceCategoryId: number;
  totalQuestions: number;
  durationMinutes: number;
  passPercentage: number;
  passMark: number;
}

export interface JurisdictionInfo {
  id: number;
  code: string;
  name: string;
}

export interface LicenceCategoryInfo {
  id: number;
  code: string;
  name: string;
}

export interface MockTestAdminSummary {
  id: number;
  userId: string;
  userName: string;
  userEmail: string;
  jurisdiction: JurisdictionInfo;
  licenceCategory: LicenceCategoryInfo;
  status: string;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  score: number;
  passingScore: number;
  passed: boolean;
  timeTakenSeconds: number;
  startedAt: string;
  completedAt: string;
  abandonedAt: string;
}

export interface MockTestAdminListResponse {
  content: MockTestAdminSummary[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CategoryBreakdown {
  categoryId: number;
  categoryName: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracyRate: number;
  translations?: Record<string, any>;
}

export interface QuestionResultDetail {
  questionId: number;
  variantId?: number | null;
  questionText: string;
  categoryName: string;
  selectedOptionIds: number[];
  selectedOptionText: string | string[];
  correctOptionIds: number[];
  correctOptionText: string | string[];
  isCorrect: boolean;
  explanation: string;
  timeTakenSeconds: number;
}

export interface MockTestAdminDetailResponse {
  id: number;
  user: {
    id: string;
    name: string;
    email: string;
  };
  jurisdiction: JurisdictionInfo;
  licenceCategory: LicenceCategoryInfo;
  status: string;
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  passingScore: number;
  passed: boolean;
  accuracyRate: number;
  timeTakenSeconds: number;
  startedAt: string;
  completedAt: string;
  categoryBreakdown: CategoryBreakdown[];
  questions: QuestionResultDetail[];
}

export interface AssetInfo {
  url: string;
  alt: string;
  order: number;
  type: string;
  caption: string;
}

export interface OptionInfo {
  id: number;
  text: string;
  translations: Record<string, any>;
  asset: AssetInfo | null;
  position: number;
  isCorrect?: boolean;
}

export interface QuestionDetail {
  questionId: number;
  order: number;
  variantId?: number | null;
  questionText: string;
  translations: Record<string, any>;
  assets: AssetInfo[];
  categoryId: number;
  categoryName: string;
  options: OptionInfo[];
  selectedOptionIds?: number[];
  correctOptionIds?: number[];
}

export interface GetMockTestQuestionsRequest {
  jurisdictionId: number;
  licenceCategoryId: number;
}

export interface GetMockTestQuestionsResponse {
  jurisdiction: JurisdictionInfo;
  licenceCategory: LicenceCategoryInfo;
  config: {
    totalQuestions: number;
    durationMinutes: number;
    passPercentage: number;
    passMark: number;
    freeMockTests: number;
    mockTestsTaken: number;
  };
  questions: QuestionDetail[];
}

export interface AnswerDetail {
  questionId: number;
  selectedOptionIds: number[];
  timeTakenSeconds: number;
}

export interface SubmitMockTestAnswersRequest {
  jurisdictionId: number;
  licenceCategoryId: number;
  timeTakenSeconds: number;
  answers: AnswerDetail[];
}

export interface QuestionResult {
  itemId: number;
  order: number;
  question: {
    id: number;
    question: string;
    variantId?: number | null;
    categoryName: string;
    assets: AssetInfo[];
  };
  selectedOptions: OptionInfo[];
  correctOptions: OptionInfo[];
  explanation: {
    text: string;
    assets: AssetInfo[];
  };
  isCorrect: boolean;
}

export interface SubmitMockTestAnswersResponse {
  id: number;
  jurisdiction: JurisdictionInfo;
  status: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  passingScore: number;
  passed: boolean;
  timeTakenSeconds: number;
  accuracyRate: number;
  startedAt: string;
  finishedAt: string;
  categoryBreakdown: CategoryBreakdown[];
  questions: QuestionResult[];
}

export interface MockTestSummaryResponse {
  id: number;
  jurisdiction: JurisdictionInfo;
  licenceCategory: LicenceCategoryInfo;
  status: string;
  totalQuestions: number;
  answeredQuestions: number;
  score: number;
  passingScore: number;
  passed: boolean;
  startedAt: string;
  finishedAt: string;
}

export interface MockTestListResponse {
  content: MockTestSummaryResponse[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface Answer {
  questionId: number;
  selectedOptionIds: number[];
  timeTakenSeconds: number;
  answeredAt: number;
}

export interface TestState {
  questions: QuestionDetail[];
  answers: Record<number, Answer>;
  currentQuestionIndex: number;
  startTime: number;
  endTime: number;
  timeRemaining: number;
  config: {
    totalQuestions: number;
    durationMinutes: number;
    passPercentage: number;
    passMark: number;
    freeMockTests: number;
    mockTestsTaken: number;
  };
  jurisdictionId: number;
  licenceCategoryId: number;
}
