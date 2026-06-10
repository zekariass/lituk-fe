export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: ErrorResponse;
}

export interface ErrorResponse {
  code: string;
  message: string;
  details?: Record<string, any>;
  retryAfter?: number;
  requestId?: string;
}

export interface Country {
  id: number;
  name: string;
  code: string;
  flagEmoji: string;
  active: boolean;
}

export interface Jurisdiction {
  id: number;
  name: string;
  countryId: number;
  active: boolean;
}

export interface Country {
    id: number;
    code: string;
    name: string;
    flagUrl: string;
    mainLanguageCode: string;
  }

export interface ActiveJurisdiction {
  id: number;
  code: string;
  name: string;
  countryCode: string;
  regionCode?: string | null;
  country?: Country
}

export type SaleType = 'FIXED' | 'PERCENTAGE' | 'NONE';

export interface UserSubscriptionInfo {
  isActive: boolean;
  type: string;
  status: string;
  expiresAt: string;
  withTranslation: boolean;
}

export interface LanguageInfo {
  id: number;
  code: string;
  name: string;
  displayName: string;
  shortDisplayName: string;
  flagUrl: string;
  direction: string;
}

export interface UserLanguageInfo {
  id: number;
  jurisdictionId: number;
  jurisdictionCode: string;
  language: LanguageInfo;
}

export interface User {
  id: string;
  email: string;
  fullName?: string;
  role?: string;
  emailVerified: boolean;
  activeJurisdiction?: ActiveJurisdiction;
  activeJurisdictionId?: number; // Computed from activeJurisdiction.id
  userLanguages?: UserLanguageInfo[];
  subscription?: UserSubscriptionInfo;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  fullName?: string;
  role: string;
  emailVerified: boolean;
  activeJurisdictionId?: number;
  activeJurisdiction?: {
    id: number;
    code: string;
    name: string;
    country?: Country;
  };
  userLanguages?: UserLanguageInfo[];
  accessToken: string;
  refreshToken: string;
  message?: string;
}

export interface LicenceCategory {
  id: number;
  jurisdictionId?: number;
  jurisdictionCode?: string;
  jurisdictionName?: string;
  name: string;
  code?: string;
  description?: string;
  isDefault?: boolean;
  localIconUrl?: string;
  questionCount?: number;
  active?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: number;
  code?: string;
  name: string;
  translations?: Record<string, Record<string, unknown>>;
  description?: string;
  parentId?: number;
  parentCategoryId?: number;
  parentCategoryName?: string;
  jurisdictionId: number;
  jurisdiction?: {
    id: number;
    code?: string;
    name: string;
  };
  displayOrder: number;
  order?: number;
  active: boolean;
  children?: Category[];
  subCategories?: CategorySubCategory[];
  stats?: CategoryStats;
  userStats?: CategoryUserStats;
  userProgress?: CategoryUserProgress;
  questionCount?: number;
  totalQuestions?: number;
  completedQuestions?: number;
  accuracy?: number;
  completedSessionIds?: string[];
  hasIncompleteSession?: boolean;
  isLocked?: boolean;
  iconUrl?: string;
}

export interface CategorySubCategory {
  id: number;
  name: string;
  translations?: Record<string, Record<string, unknown>>;
  active?: boolean;
  deletedAt?: string;
}

export interface CategoryUserStats {
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  accuracyRate: number;
}

export interface CategoryUserProgress {
  sessionId?: string;
  totalQuestions?: number;
  attemptedQuestions: number;
  correctQuestions: number;
  flaggedQuestions?: number;
  averageTimeSeconds?: number;
  accuracyRate: number;
}

export interface CategoryStats {
  totalQuestions: number;
  completedQuestions: number;
  accuracy: number;
  progressPercentage: number;
}

export type TranslationMap = Record<string, Record<string, unknown>>;

export interface QuestionAsset {
  url: string;
  alt?: string;
  order?: number;
  type?: string;
  caption?: string;
  size?: number;
  filename?: string;
  contentType?: string;
  uploadedAt?: string;
}

export interface Question {
  id: number;
  text: string;
  question?: string;
  translations?: TranslationMap;
  assets?: QuestionAsset[];
  imageUrl?: string;
  categoryId: number;
  jurisdictionId: number;
  variantId?: number | null;
  active: boolean;
  options: QuestionOption[];
  explanation?: Explanation;
  tips?: Tip[];
  tip?: Tip;
  currentSessionAttempt?: RevisionQuestionAttempt;
  isFlagged?: boolean;
  userAnswerCorrect?: boolean;
  pointsEarned?: number;
}

export interface QuestionOption {
  id: number;
  text: string;
  translations?: TranslationMap;
  asset?: QuestionAsset;
  isCorrect?: boolean;
  displayOrder?: number;
  position?: number;
}

export interface RevisionQuestionAttempt {
  selectedOptionIds: number[];
  correctOptionIds?: number[];
  isCorrect: boolean;
  attemptCount?: number;
  pointsAwarded?: number;
}

export interface FlaggedQuestionResponse {
  id: number;
  question: FlaggedQuestionInfo;
  userAttempt: UserAttemptInfo | null;
  flaggedAt: string;
}

export interface FlaggedQuestionInfo {
  id: number;
  question: string;
  text?: string;
  categoryId: number;
  categoryName: string;
  variantId?: number | null;
  translations?: TranslationMap;
  assets: QuestionAsset[];
  options: QuestionOption[];
}

export interface UserAttemptInfo {
  isCorrect: boolean;
  lastAttemptedAt: string;
  selectedOptionIds?: number[];
}

export interface Explanation {
  id: number;
  questionId?: number;
  text: string;
  translations?: TranslationMap;
  assets?: QuestionAsset[];
  locale?: string;
  createdAt?: string;
}

export interface Tip {
  id: number;
  questionId?: number;
  title?: string;
  body?: string;
  text?: string;
  translations?: TranslationMap;
  assets?: QuestionAsset[];
  order?: number;
  displayOrder?: number;
  active?: boolean;
  locale?: string;
  createdAt?: string;
}

export interface RevisionSession {
  id: string;
  sessionId?: string;
  categoryId: number;
  questionCount: number | null;
  categoryName?: string;
  allQuestionsAttempted?: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string;
  completedAt?: string;
  currentQuestionIndex: number;
}

export interface RevisionSessionMeta {
  sessionId: string;
  questionsCount?: number;
  isComplete: boolean;
  interrupted?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RevisionSessionGetRequest {
  categoryId: number;
  licenceCategoryId: number;
  restart: boolean;
}

export interface RevisionSessionGetResponse {
  sessionId: string;
  categoryName: string;
  lastQuestionAttemptedId?: number;
  allQuestionsAttempted: boolean;
  questions: Question[];
  sessions: RevisionSessionMeta[];
}

export interface PaginationMeta {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalElements: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface RevisionSessionSummary {
  totalQuestions: number;
  correctlyAnswered: number;
  incorrectlyAnswered: number;
  isComplete: boolean;
}

export interface RevisionSessionQuestionsResponse {
  sessionId: string;
  categoryName: string;
  summary?: RevisionSessionSummary;
  questions: Question[];
  pagination?: PaginationMeta;
}

export interface SubmitAnswerRequest {
  questionId: number;
  selectedOptionIds: number[];
  timeTakenSeconds: number;
  viewedExplanation: boolean;
  viewedTip: boolean;
}

export interface SubmitAnswerResponse {
  attemptId: number;
  questionId: number;
  selectedOptionIds: number[];
  correctOptionIds: number[];
  isCorrect: boolean;
  attemptCount: number;
  timeTakenSeconds: number;
  points: {
    basePoints: number;
    bonusPoints: number;
    penaltyPoints: number;
    totalPoints: number;
  };
  feedback?: {
    message?: string;
    canRetry?: boolean;
  };
}

export interface MockTest {
  id: number;
  jurisdictionId: number;
  status: 'IN_PROGRESS' | 'COMPLETED';
  totalQuestions: number;
  passingScore: number;
  timeLimit: number;
  startedAt: string;
  completedAt?: string;
  score?: number;
  passed?: boolean;
}

export interface MockTestQuestion {
  id: number;
  questionId: number;
  question: Question;
  questionText: string;
  imageUrl?: string;
  options?: QuestionOption[];
  selectedOptionIds?: number[];
  flagged: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  points: number;
  accuracy: number;
  averageTime: number;
  isCurrentUser?: boolean;
}

export interface SubscriptionPackage {
  id: number;
  jurisdictionId: number;
  jurisdictionCode: string;
  jurisdictionName: string;
  code: string;
  name: string;
  description: string;
  amountMinor: number;
  amountMajor: number;
  currency: string;
  period: string;
  periodDisplay: string;
  stripePriceId: string;
  isActive: boolean;
  saleType: SaleType;
  saleValue: number;
  saleExpireAt: string | null;
  withTranslation: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface JurisdictionLanguage {
  id: number;
  code: string;
  name: string;
  displayName: string;
  shortDisplayName: string;
  flagUrl: string;
  direction: string;
  isPrimary: boolean;
  isActive: boolean;
}

export interface UserJurisdiction {
  id: number;
  jurisdictionId: number;
  jurisdiction: Jurisdiction;
  jurisdictionName: string;
  countryName: string;
  isActive: boolean;
  hasActiveEntitlement: boolean;
}

export interface UserSetting {
  name: string;
  value: string;
}

export interface RevisionProgress {
  totalQuestions: number;
  completedQuestions: number;
  accuracy: number;
  totalPoints: number;
  currentStreak: number;
  totalTimeSpent?: number;
}

export interface EntitlementDetails {
  id: number;
  jurisdictionId: number;
  provider: string; // stripe | google_play | app_store | revenuecat
  purchaseType: string; // subscription | lifetime
  billingPeriod: string; // daily | weekly | monthly | yearly | lifetime
  status: 'active' | 'past_due' | 'canceled' | 'expired' | 'unpaid';
  startsAt: string;
  expiresAt: string;
  canceledAt?: string;
  daysRemaining: number;
  autoRenew: boolean;
  amount: number;
  currency: string;
  localPriceCode: string;
  saleTypeApplied: SaleType;
  saleAmount: number;
  withTranslation: boolean;
}

export interface EntitlementFeatures {
  mockTestsUnlimited: boolean;
  offlineAccess: boolean;
  adFree: boolean;
  prioritySupport: boolean;
}

export interface UserEntitlementStatus {
  hasActiveEntitlement: boolean;
  jurisdictionId: number;
  jurisdictionName: string;
  entitlement: EntitlementDetails | null;
  features: EntitlementFeatures;
}

export interface UserSubscription {
  id: number;
  userId: string;
  jurisdictionId: number;
  jurisdictionName: string;
  packageId: number;
  packageName: string;
  packageCode: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING';
  startDate: string;
  endDate?: string;
  cancelledAt?: string;
  willRenew: boolean;
  stripeSubscriptionId?: string;
  amountMajor: number;
  currency: string;
  period: string;
  periodDisplay: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionCancelRequest {
  cancelAtPeriodEnd: boolean;
  cancellationReason?: string;
}

export interface SubscriptionUpgradeRequest {
  newPriceId: string;
  newBillingPeriod?: string;
  prorationBehavior?: boolean;
}

export interface SubscriptionDowngradeRequest {
  newPriceId: string;
  newBillingPeriod?: string;
  prorationBehavior?: boolean;
}

export interface SubscriptionChangeResponse {
  subscriptionId: string;
  status: string;
  changeType: 'cancel' | 'upgrade' | 'downgrade';
  appliedImmediately: boolean;
  effectiveDate: string;
  prorationAmount: number | null;
  currency: string | null;
  message: string;
}
