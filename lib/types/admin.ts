export interface MockTest {
  id: number;
  userId: string;
  userEmail: string;
  userName: string;
  jurisdiction: {
    id: number;
    code: string;
    name: string;
  };
  licenceCategory: {
    id: number;
    code: string;
    name: string;
  };
  status: 'in_progress' | 'completed' | 'abandoned';
  totalQuestions: number;
  questionsAnswered: number;
  correctAnswers: number;
  totalScore: number;
  passingScore: number;
  passed: boolean;
  totalTimeSeconds: number;
  startedAt: string;
  completedAt: string | null;
  abandonedAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminQuestion {
  id: number;
  categoryId?: number;
  categoryName?: string;
  jurisdictionId: number;
  jurisdictionCode?: string;
  jurisdictionName?: string;
  question: string;
  explanation?: QuestionExplanation;
  translations?: Record<string, { question?: string }>;
  assets?: QuestionAsset[];
  variantId?: number | null;
  active: boolean;
  options: QuestionOption[];
  tips?: QuestionTip[];
  licenceCategories: LicenceCategory[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface QuestionAsset {
  alt?: string | null;
  order?: number;
  type: string;
  caption?: string | null;
  size?: number;
  filename?: string;
  contentType?: string;
  uploadedAt?: string;
  url: string;
}

export interface QuestionOption {
  id: number;
  text: string;
  translations?: Record<string, { text: string }>;
  asset?: QuestionAsset | null;
  isCorrect: boolean;
  position: number;
}

export interface QuestionTip {
  id: number;
  questionId: number;
  title: string;
  body: string;
  translations?: Record<string, { title?: string; body?: string; tip?: string }>;
  assets?: QuestionAsset[];
  order: number;
  active: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt?: string;
}

export interface QuestionExplanation {
  id: number;
  questionId?: number;
  text?: string;
  explanation?: string;
  translations?: Record<string, { text?: string; explanation?: string }>;
  assets?: QuestionAsset[] | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LicenceCategory {
  id: number;
  jurisdictionId: number;
  jurisdictionCode?: string;
  jurisdictionName?: string;
  code: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  translations?: Record<string, { name?: string; description?: string }>;
  questionCount?: number;
  questionIds?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface AdminCategory {
  id: number;
  jurisdictionId: number;
  jurisdictionName?: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
  name: string;
  translations?: Record<string, { name: string }>;
  active: boolean;
  questionCount: number;
  subCategories?: AdminCategory[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminJurisdiction {
  id: number;
  countryId: number;
  countryName?: string;
  code: string;
  name: string;
  translations?: Record<string, { name: string }>;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminCountry {
  id: number;
  code: string;
  name: string;
  translations?: Record<string, { name: string }>;
  flagUrl?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneNumber?: string;
  dateOfBirth?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  size: number;
  number: number;
  numberOfElements: number;
  empty: boolean;
}

export interface CreateMockTestRequest {
  userId: string;
  jurisdictionId: number;
  licenceCategoryId: number;
}

export interface CreateQuestionRequest {
  categoryId?: number;
  jurisdictionId: number;
  question: string;
  licenceCategoryIds?: number[];
  translations?: Record<string, { question?: string }>;
  assets?: QuestionAsset[];
  variantId?: number | null;
  active?: boolean;
  options?: CreateOptionRequest[];
}

export interface UpdateQuestionRequest {
  categoryId?: number;
  jurisdictionId?: number;
  question?: string;
  assets?: QuestionAsset[];
  variantId?: number | null;
  active?: boolean;
  translations?: Record<string, { question?: string }>;
}

export interface CreateLicenceCategoryRequest {
  jurisdictionId: number;
  code: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  translations?: Record<string, { name?: string; description?: string }>;
}

export interface CreateCategoryRequest {
  jurisdictionId: number;
  parentCategoryId?: number | null;
  name: string;
  translations?: Record<string, { name: string }>;
  active?: boolean;
}

export interface CreateJurisdictionRequest {
  countryId: number;
  code: string;
  name: string;
  translations?: Record<string, { name: string }>;
  active?: boolean;
}

export interface CreateCountryRequest {
  code: string;
  name: string;
  translations?: Record<string, { name: string }>;
  flagUrl?: string;
}

export interface AssignQuestionsRequest {
  licenceCategoryId: number;
  questionIds: number[];
}

export interface AddExplanationRequest {
  questionId?: number;
  text?: string;
  explanation?: string;
  translations?: Record<string, { text?: string; explanation?: string }>;
}

export interface AddTipRequest {
  tip: string;
  displayOrder?: number;
  translations?: Record<string, { tip?: string }>;
}

export interface CreateOptionRequest {
  text: string;
  translations?: Record<string, { text: string }>; // Backend expects nested objects in JSON string
  asset?: QuestionAsset | null;
  isCorrect: boolean;
  position: number;
}

export interface UpdateOptionRequest {
  text?: string;
  translations?: Record<string, { text: string }>; // Backend expects nested objects in JSON string
  isCorrect?: boolean;
  position?: number;
}

export interface UpdateExplanationRequest {
  text?: string;
  explanation?: string;
  translations?: Record<string, { text?: string; explanation?: string }>;
}

export interface UpdateTipRequest {
  tip?: string;
  displayOrder?: number;
  translations?: Record<string, { tip?: string }>;
}

export interface UpdateCategoryRequest {
  name?: string;
  active?: boolean;
  translations?: Record<string, { name: string }>;
}

export interface UpdateJurisdictionRequest {
  name?: string;
  active?: boolean;
  translations?: Record<string, { name: string }>;
}

export interface UpdateCountryRequest {
  name?: string;
  flagUrl?: string;
  translations?: Record<string, { name: string }>;
}

export interface UpdateLicenceCategoryRequest {
  code?: string;
  name?: string;
  description?: string;
  isDefault?: boolean;
  translations?: Record<string, { name?: string; description?: string }>;
}

export interface QuestionBasicResponse {
  id: number;
  categoryId?: number;
  categoryName?: string;
  question: string;
  variantId?: number | null;
  active: boolean;
  assignedToLicenceCategory?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateMockTestStatusRequest {
  status: 'in_progress' | 'completed' | 'abandoned';
}

export interface UpdateUserRoleRequest {
  role: 'USER' | 'ADMIN' | 'MODERATOR';
}

export interface UpdateUserStatusRequest {
  status: 'active' | 'inactive';
}

export interface AdminLanguage {
  id: number;
  code: string;
  name: string;
  displayName: string;
  shortDisplayName: string;
  flagUrl: string;
  direction: string;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminJurisdictionLanguage {
  id: number;
  jurisdictionId: number;
  jurisdictionCode: string;
  jurisdictionName: string;
  language: AdminLanguage;
  isPrimary: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
