# Revision Question Flow — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screens, components, Zustand stores, utilities, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.** Only implement React Native / Expo code.

---

## 1. Entry Point: Category Tap → Session Init

When the learner taps a **leaf category** (no sub-categories) on the CategoriesScreen:

1. Read `categoryId` and `licenceCategoryId`.
2. If `category.hasIncompleteSession === true` OR `!category.completedSessionIds?.length`:
   - Call `initializeSession({ categoryId, licenceCategoryId, restart: false })`.
   - After it resolves, check `allQuestionsAttempted` in the store:
     - `false` → navigate to **QuestionScreen**
     - `true` → navigate to **PracticeHistoryScreen** with `{ categoryId, licenceCategoryId }`
3. Else (completed sessions exist, no incomplete):
   - Navigate directly to **PracticeHistoryScreen** with `{ categoryId, licenceCategoryId }`.

### 1.1 Resumption Logic (inside `initializeSession`)

After the API responds:
1. Normalize questions (sort options by `displayOrder ?? position`), sort by `id ASC`.
2. Extract pre-existing answers from each question's `currentSessionAttempt` field.
3. Compute `initialIndex`:
   - If `lastQuestionAttemptedId` exists → `min(thatIndex + 1, questions.length - 1)`.
   - If `allQuestionsAttempted === true` → `0`.
4. Store session, questions, answers, `initialIndex`. Start timer for initial question.

---

## 2. Types — create `src/types/revision.ts`

Export all of the following. They match the existing backend API response shapes.

```ts
export type TranslationMap = Record<string, Record<string, unknown>>;

export interface ApiResponse<T> { success: boolean; data: T; message?: string; }

export interface QuestionAsset {
  url: string; alt?: string; order?: number; type?: string;
  caption?: string; contentType?: string;
}

export interface QuestionOption {
  id: number; text: string; translations?: TranslationMap;
  asset?: QuestionAsset; isCorrect?: boolean;
  displayOrder?: number; position?: number;
}

export interface RevisionQuestionAttempt {
  selectedOptionId: number; isCorrect: boolean;
  attemptCount?: number; pointsAwarded?: number;
}

export interface Question {
  id: number; text: string; question?: string;
  translations?: TranslationMap; assets?: QuestionAsset[];
  imageUrl?: string; categoryId: number; jurisdictionId: number;
  active: boolean; options: QuestionOption[];
  explanation?: Explanation; tips?: Tip[]; tip?: Tip;
  currentSessionAttempt?: RevisionQuestionAttempt;
  isFlagged?: boolean; userAnswerCorrect?: boolean; pointsEarned?: number;
}

export interface Explanation {
  id: number; questionId?: number; text: string;
  translations?: TranslationMap; assets?: QuestionAsset[];
}

export interface Tip {
  id: number; questionId?: number; title?: string; body?: string;
  text?: string; translations?: TranslationMap; assets?: QuestionAsset[];
  order?: number; displayOrder?: number; active?: boolean;
}

export interface RevisionSession {
  id: string; sessionId?: string; categoryId: number;
  questionCount: number | null; categoryName?: string;
  allQuestionsAttempted?: boolean;
  status: 'IN_PROGRESS' | 'COMPLETED';
  startedAt: string; completedAt?: string; currentQuestionIndex: number;
}

export interface RevisionSessionMeta {
  sessionId: string; questionsCount?: number; isComplete: boolean;
  interrupted?: boolean; createdAt: string; updatedAt: string;
}

export interface PaginationMeta {
  currentPage: number; pageSize: number; totalPages: number;
  totalElements: number; hasNext: boolean; hasPrevious: boolean;
}

export interface RevisionSessionGetRequest {
  categoryId: number; licenceCategoryId: number; restart: boolean;
}

export interface RevisionSessionGetResponse {
  sessionId: string; categoryName: string;
  lastQuestionAttemptedId?: number; allQuestionsAttempted: boolean;
  questions: Question[]; sessions: RevisionSessionMeta[];
}

export interface SubmitAnswerRequest {
  questionId: number; selectedOptionId: number;
  timeTakenSeconds: number; viewedExplanation: boolean; viewedTip: boolean;
}

export interface SubmitAnswerResponse {
  attemptId: number; questionId: number; selectedOptionId: number;
  correctOptionId: number; isCorrect: boolean; attemptCount: number;
  timeTakenSeconds: number;
  points: { basePoints: number; bonusPoints: number; penaltyPoints: number; totalPoints: number; };
  feedback?: { message?: string; canRetry?: boolean; };
}

export interface RevisionSessionQuestionsResponse {
  sessionId: string; categoryName: string;
  summary?: RevisionSessionSummary;
  questions: Question[]; pagination?: PaginationMeta;
}

export interface RevisionSessionSummary {
  totalQuestions: number; correctlyAnswered: number;
  incorrectlyAnswered: number; isComplete: boolean;
}

// Local-only (not from API)
export interface RevisionAnswer {
  selectedOptionId: number; isCorrect: boolean;
  correctOptionId: number; pointsEarned?: number;
}
```

---

## 3. Utility Functions to Create

### 3.1 `src/utils/content-utils.ts`

```ts
import { Explanation, QuestionAsset, Tip, TranslationMap } from '../types/revision';

const getValue = (payload: unknown, keys: string[]): string | undefined => {
  if (!payload || typeof payload !== 'object') return undefined;
  const record = payload as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) return value;
  }
  return undefined;
};

export const getLocalizedText = (
  fallback: string | undefined,
  translations: TranslationMap | undefined,
  locale: string,
  keys: string[] = ['text']
): string => getValue(translations?.[locale], keys) ?? fallback ?? '';

export const normalizeExplanationText = (explanation: Explanation | undefined, locale: string): string => {
  if (!explanation) return '';
  return getLocalizedText(explanation.text, explanation.translations, locale, ['text', 'body']);
};

export const normalizeTipText = (tip: Tip, locale: string): string => {
  const fallback = tip.text ?? tip.body ?? tip.title ?? '';
  return getLocalizedText(fallback, tip.translations, locale, ['tip', 'text', 'body', 'title']);
};

export const sortAssets = (assets: QuestionAsset[] | undefined): QuestionAsset[] =>
  [...(assets ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
```

### 3.2 `src/utils/question-helpers.ts`

```ts
import { Question, RevisionAnswer, RevisionQuestionAttempt } from '../types/revision';

export const normalizeQuestion = (q: Question): Question => ({
  ...q,
  text: q.question ?? q.text ?? '',
  options: [...(q.options ?? [])].sort(
    (a, b) => (a.displayOrder ?? a.position ?? 0) - (b.displayOrder ?? b.position ?? 0)
  ),
});

export const extractAnswersFromQuestions = (questions: Question[]): Record<number, RevisionAnswer> =>
  questions.reduce<Record<number, RevisionAnswer>>((acc, q) => {
    const attempt: RevisionQuestionAttempt | undefined = q.currentSessionAttempt ?? (q as any).attempt;
    if (!attempt) return acc;
    acc[q.id] = {
      selectedOptionId: attempt.selectedOptionId,
      isCorrect: attempt.isCorrect,
      correctOptionId: q.options.find((o) => o.isCorrect)?.id ?? attempt.selectedOptionId,
      pointsEarned: attempt.pointsAwarded,
    };
    return acc;
  }, {});

export const mergeQuestionsById = (current: Question[], incoming: Question[]): Question[] => {
  const map = new Map<number, Question>();
  [...current, ...incoming].forEach((q) => map.set(q.id, q));
  return Array.from(map.values()).sort((a, b) => a.id - b.id);
};
```

### 3.3 `src/utils/asset-url.ts`

```ts
import { API_BASE_URL } from '../config';

export const getAssetUrl = (relativeUrl: string): string => {
  if (!relativeUrl) return '';
  if (relativeUrl.startsWith('http')) return relativeUrl;
  return `${API_BASE_URL}${relativeUrl}`;
};
```

---

## 4. Zustand Stores to Create

### 4.1 Content Language Store — `src/store/content-language-store.ts`

A small store read by QuestionCard, ExplanationPanel, TipsPanel, and PracticeHistoryScreen.

**State:** `language: string` (e.g. `'am'`, `'ti'`, `''` for default), `direction: 'ltr' | 'rtl'`
**Action:** `setLanguage(code: string, dir: 'ltr' | 'rtl'): void`

### 4.2 Revision Store — `src/store/revision-store.ts`

One store managing all question-flow state. **Persist only `questionCountPerCategory`** to AsyncStorage via `zustand/middleware` `persist`.

#### State Fields

| Field | Type | Default |
|---|---|---|
| `currentSession` | `RevisionSession \| null` | `null` |
| `questions` | `Question[]` | `[]` |
| `currentIndex` | `number` | `0` |
| `activeCategoryId` | `number \| null` | `null` |
| `activeLicenceCategoryId` | `number \| null` | `null` |
| `categoryName` | `string` | `''` |
| `allQuestionsAttempted` | `boolean` | `false` |
| `sessions` | `RevisionSessionMeta[]` | `[]` |
| `sessionPagination` | `PaginationMeta \| null` | `null` |
| `loadedSessionPages` | `number[]` | `[]` |
| `questionCountPerCategory` | `Record<number, number \| null>` | `{}` |
| `answers` | `Record<number, RevisionAnswer>` | `{}` |
| `explanations` | `Record<number, Explanation>` | `{}` |
| `tips` | `Record<number, Tip[]>` | `{}` |
| `viewedExplanation` | `Record<number, boolean>` | `{}` |
| `viewedTip` | `Record<number, boolean>` | `{}` |
| `timers` | `Record<number, number>` | `{}` |
| `questionStartTimes` | `Record<number, number>` | `{}` |
| `flaggedQuestions` | `Record<number, boolean>` | `{}` |
| `selectedSessionId` | `string \| null` | `null` |
| `selectedSessionSummary` | `RevisionSessionSummary \| null` | `null` |
| `selectedSessionQuestions` | `Question[]` | `[]` |
| `selectedSessionPagination` | `PaginationMeta \| null` | `null` |
| `isLoading` | `boolean` | `false` |
| `error` | `string \| null` | `null` |

#### Actions — Exact Behaviour

**`initializeSession({ categoryId, licenceCategoryId, restart })`**
1. Set `isLoading=true`, `error=null`, store `activeCategoryId`, `activeLicenceCategoryId`.
2. HTTP `POST /api/v1/revision/sessions/get` body: `{ categoryId, licenceCategoryId, restart }`.
3. Normalize questions, sort by `id`, extract answers, compute `initialIndex` (see §1.1).
4. Set all state fields. Reset `explanations`, `tips`, `viewedExplanation`, `viewedTip`, `timers` to `{}`. Set `questionStartTimes` with initial question's `Date.now()`.
5. `isLoading=false`. On error: set `error`, rethrow.

**`restartCurrentSession()`** — Calls `initializeSession` with stored `activeCategoryId`/`activeLicenceCategoryId` and `restart: true`.

**`setCurrentIndex(index)`** — Clamp to `[0, questions.length-1]`. If target question has no `questionStartTimes` entry, add `Date.now()`.

**`loadAdjacentQuestions(direction: 'next' | 'previous'): Promise<boolean>`**
1. Guard: need `currentSession` + `sessionPagination`. Check `hasNext`/`hasPrevious`.
2. HTTP `GET /api/v1/revision/sessions/{sessionId}/questions?page={targetPage}&size={pageSize}&sort=id,asc`.
3. Normalize incoming, merge via `mergeQuestionsById`, extract & merge answers.
4. Maintain stable `currentIndex` by finding current questionId in merged array.
5. Update `sessionPagination`, add page to `loadedSessionPages`.
6. Return `true` on success, `false` on failure.

**`submitAnswer(sessionId, request: SubmitAnswerRequest): Promise<SubmitAnswerResponse>`**
1. HTTP `POST /api/v1/revision/sessions/{sessionId}/submit` body: `request`.
2. Update `answers[questionId]`, `timers[questionId]`, and the question's `userAnswerCorrect`/`pointsEarned` in `questions` array.
3. Return the response.

**`fetchExplanation(questionId): Promise<Explanation | null>`**
- If cached → return cached. Otherwise HTTP `GET /api/v1/questions/{questionId}/explanation`, cache & return.

**`fetchTips(questionId): Promise<Tip[]>`**
- If cached → return cached. Otherwise HTTP `GET /api/v1/questions/{questionId}/tips`. Filter `active !== false`, sort by `order`. Cache & return.

**`prefetchQuestionContext(questionIds: number[])`**
- For each id, call `fetchExplanation` + `fetchTips` in parallel. Silently catch all errors.

**`startQuestionTimer(questionId)`** — Set `questionStartTimes[questionId] = Date.now()` if not already set.

**`setQuestionElapsedSeconds(questionId, seconds)`** — Set `timers[questionId] = seconds`.

**`markExplanationViewed(questionId)`** — `viewedExplanation[questionId] = true`.

**`markTipViewed(questionId)`** — `viewedTip[questionId] = true`.

**`setQuestionFlagged(questionId, isFlagged)`** — `flaggedQuestions[questionId] = isFlagged`.

**`completeSession(sessionId)`** — HTTP `PATCH /api/v1/revision/sessions/{sessionId}/complete` (no body).

**`openCompletedSession(sessionId)`**
- HTTP `GET /api/v1/revision/sessions/{sessionId}/questions?page=1&size=10&sort=id,asc`.
- Set `selectedSessionId`, `selectedSessionSummary`, `selectedSessionQuestions`, `selectedSessionPagination`.

**`loadCompletedSessionPage(direction)`** — Same pagination pattern as `loadAdjacentQuestions` but on `selectedSession*` fields.

**`resetSession()`** — Reset every field to default except `questionCountPerCategory`.

#### Persistence

```ts
persist(storeCreator, {
  name: 'revision-store',
  storage: createJSONStorage(() => AsyncStorage),
  partialize: (state) => ({ questionCountPerCategory: state.questionCountPerCategory }),
});
```

---

## 5. QuestionScreen — `src/screens/QuestionScreen.tsx`

### 5.1 Guards (on mount)

1. If not authenticated (auth store) → navigate to Login.
2. If `currentSession === null` → navigate back to CategoriesScreen.

### 5.2 Read from Revision Store

```ts
const {
  currentSession, questions, currentIndex, answers,
  explanations, tips, viewedExplanation, viewedTip,
  timers, questionStartTimes, flaggedQuestions,
  sessionPagination, activeLicenceCategoryId,
  isLoading, error,
  setCurrentIndex, loadAdjacentQuestions, startQuestionTimer,
  setQuestionElapsedSeconds, submitAnswer, fetchExplanation,
  fetchTips, prefetchQuestionContext, markExplanationViewed,
  markTipViewed, setQuestionFlagged, completeSession,
  restartCurrentSession,
} = useRevisionStore();
```

### 5.3 Derived Values (recompute every render)

```ts
const currentQuestion = questions[currentIndex] ?? null;
const currentQuestionId = currentQuestion?.id;
const currentAnswer = currentQuestionId ? answers[currentQuestionId] : undefined;
const isAnswered = Boolean(currentAnswer);
const selectedOptionId = currentQuestionId
  ? (localSelectedOptionIds[currentQuestionId] ?? currentAnswer?.selectedOptionId)
  : undefined;
const currentExplanation = currentQuestionId ? explanations[currentQuestionId] : undefined;
const currentTips = currentQuestionId ? (tips[currentQuestionId] ?? []) : [];
const showExplanation = currentQuestionId
  ? (explanationVisibility[currentQuestionId] ?? false) : false;
const showTips = currentQuestionId
  ? (tipsVisibility[currentQuestionId] ?? false) : false;
const progressPercent = questions.length > 0
  ? ((currentIndex + 1) / questions.length) * 100 : 0;
const canGoPrevious = currentIndex > 0 || Boolean(sessionPagination?.hasPrevious);
const canGoNext = Boolean(selectedOptionId || currentAnswer);
const isFinalQuestion = currentIndex === questions.length - 1 && !sessionPagination?.hasNext;
```

### 5.4 Local Screen State (`useState`, NOT Zustand)

| State | Type | Initial |
|---|---|---|
| `localSelectedOptionIds` | `Record<number, number>` | `{}` |
| `explanationVisibility` | `Record<number, boolean>` | `{}` |
| `tipsVisibility` | `Record<number, boolean>` | `{}` |

### 5.5 Timer Logic

- On question display: `startQuestionTimer(questionId)` → records `Date.now()` if not set.
- On submit: `elapsed = Math.max(1, Math.floor((Date.now() - (questionStartTimes[questionId] ?? Date.now())) / 1000))`.
- If `timers[questionId]` exists (previously submitted), use that instead.

---

## 6. Event Handlers — implement these in QuestionScreen

### 6.1 `handleSelectOption(optionId: number)`

1. If `isAnswered` → return (locked).
2. `localSelectedOptionIds[currentQuestionId] = optionId`.
3. `await Promise.all([fetchExplanation(questionId), fetchTips(questionId)])`.
4. `markExplanationViewed(questionId)`, `markTipViewed(questionId)`.
5. Auto-show panels: `explanationVisibility[questionId] = true`, `tipsVisibility[questionId] = true`.

### 6.2 `submitCurrentAnswer(): Promise<boolean>`

1. If `isAnswered` → return `true`.
2. If no `selectedOptionId` → return `false`.
3. Compute `elapsed = Math.max(1, Math.floor((Date.now() - (questionStartTimes[questionId] ?? Date.now())) / 1000))`.
4. `setQuestionElapsedSeconds(questionId, elapsed)`.
5. Call `submitAnswer(currentSession.id, { questionId, selectedOptionId, timeTakenSeconds: elapsed, viewedExplanation: viewedExplanation[questionId] ?? false, viewedTip: viewedTip[questionId] ?? false })`.
6. Return `true` on success, `false` on error.

### 6.3 `handleNext()`

1. `const submitted = await submitCurrentAnswer()` — if `false`, stop.
2. If `currentIndex < questions.length - 1` → `setCurrentIndex(currentIndex + 1)`, return.
3. `const loaded = await loadAdjacentQuestions('next')`:
   - If `true` → find current question in updated array, advance by 1, return.
   - If `false` → call `handleComplete()`.

### 6.4 `handlePrevious()`

1. If `currentIndex > 0` → `setCurrentIndex(currentIndex - 1)`, return.
2. `const loaded = await loadAdjacentQuestions('previous')`:
   - If `true` → find current question in merged array, move back by 1.
   - If `false` → do nothing (button disabled).

### 6.5 `handleComplete()`

1. `await completeSession(currentSession.id)`.
2. Refresh category: `fetchCategoryById(currentSession.categoryId, activeLicenceCategoryId)` (from category store).
3. Navigate to **PracticeHistoryScreen** `{ categoryId, licenceCategoryId }`.
4. If params missing → navigate to CategoriesScreen.

### 6.6 `handleRestartSession()`

1. `await restartCurrentSession()`.
2. Clear: `localSelectedOptionIds = {}`, `explanationVisibility = {}`, `tipsVisibility = {}`.

### 6.7 `handleToggleExplanation()`

1. Flip `explanationVisibility[questionId]`.
2. If turning ON: `fetchExplanation(questionId)`, `markExplanationViewed(questionId)`.

### 6.8 `handleToggleTips()`

1. Flip `tipsVisibility[questionId]`.
2. If turning ON: `fetchTips(questionId)`, `markTipViewed(questionId)`.

### 6.9 Flag / Unflag (inside QuestionCard)

1. Local state `isFlagging: boolean` to prevent double-tap.
2. Determine current flag state: `flaggedQuestions[questionId] ?? question.isFlagged ?? false`.
3. If flagged → HTTP `DELETE /api/v1/flags/{questionId}` → on success: `setQuestionFlagged(questionId, false)`.
4. If unflagged → HTTP `POST /api/v1/flags/{questionId}` → on success: `setQuestionFlagged(questionId, true)`.
5. On error → silently fail, don't change state.

### 6.10 `useEffect` — On Question Change

```ts
useEffect(() => {
  if (!currentQuestionId) return;
  startQuestionTimer(currentQuestionId);
  const nextId = questions[currentIndex + 1]?.id;
  prefetchQuestionContext(nextId ? [currentQuestionId, nextId] : [currentQuestionId]);
}, [currentQuestionId]);
```

---

## 7. Components to Create

### 7.1 `LanguageSwitcher` — `src/components/revision/LanguageSwitcher.tsx`

- Only render if `user.subscription.withTranslation !== false` and `user.userLanguages.length > 0`.
- Each language object has: `code`, `name`, `shortDisplayName`, `flagUrl`, `direction`.
- Render a horizontal row of flag buttons. Tapping calls `setLanguage(code, direction)` on the content language store.
- Highlight the active language.

### 7.2 How Localized Text is Applied

Use these calls wherever text is rendered:

- **Question text:** `getLocalizedText(question.text, question.translations, contentLanguage, ['question', 'text', 'body'])`
- **Option text:** `getLocalizedText(option.text, option.translations, contentLanguage, ['text', 'body', 'label'])`
- **Explanation text:** `normalizeExplanationText(explanation, contentLanguage)`
- **Tip text:** `normalizeTipText(tip, contentLanguage)`

Respect `contentDirection` (`'ltr'` / `'rtl'`) for text alignment.

---

### 7.3 `QuestionCard` — `src/components/revision/QuestionCard.tsx`

**Props:**

```ts
interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedOptionId?: number;
  isAnswered: boolean;
  correctOptionId?: number;
  explanation?: Explanation;
  tips: Tip[];
  showExplanation: boolean;
  showTips: boolean;
  isFlagged: boolean;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFinalQuestion: boolean;
  isLoading: boolean;
  contentLanguage: string;
  contentDirection: 'ltr' | 'rtl';
  userLanguages: UserLanguageInfo[];
  onSelectOption: (optionId: number) => void;
  onNext: () => void;
  onPrevious: () => void;
  onToggleExplanation: () => void;
  onToggleTips: () => void;
  onFlagToggled: (isFlagged: boolean) => void;
}
```

**Renders (top to bottom inside a `ScrollView`):**

1. **LanguageSwitcher** (if applicable).
2. **Question assets** — images (tappable → full-screen `Modal`) and videos (with `expo-av`). Use `getAssetUrl()` for URLs. Use `sortAssets()` for ordering.
3. **Question text** (localized via `getLocalizedText`).
4. **OptionList** component.
5. **Action buttons row:**
   - Explanation toggle (only if `isAnswered`)
   - Tips toggle (only if `tips.length > 0` and `isAnswered`)
   - Flag toggle
6. **ExplanationPanel** (if `showExplanation && explanation`).
7. **TipsPanel** (if `showTips && tips.length > 0`).
8. **NavigationBar** (Previous / Next or Finish).

### 7.4 `OptionList` — `src/components/revision/OptionList.tsx`

**Props:**

```ts
interface OptionListProps {
  options: QuestionOption[];
  selectedOptionId?: number;
  correctOptionId?: number;
  answerLocked: boolean;
  onSelectOption: (optionId: number) => void;
  contentLanguage: string;
}
```

**Behaviour:**
- Each option is a `TouchableOpacity`. If `answerLocked`, disable tap.
- **Visual states per option:**
  - Not selected, not answered → default style
  - Selected (before submit, `correctOptionId` unknown) → highlight border (blue/primary)
  - Selected + correct → green background/border
  - Selected + incorrect → red background/border
  - Not selected + is the correct one (after submit) → green border (to reveal correct answer)
- Option text: `getLocalizedText(option.text, option.translations, contentLanguage, ['text'])`.
- If option has `asset` → render a small image alongside text.

### 7.5 `ExplanationPanel` — `src/components/revision/ExplanationPanel.tsx`

**Props:** `explanation: Explanation`, `contentLanguage: string`, `contentDirection: 'ltr' | 'rtl'`, `userLanguages: UserLanguageInfo[]`

- Header row with "Explanation" label + LanguageSwitcher.
- Explanation text via `normalizeExplanationText(explanation, contentLanguage)`. Render HTML content with a React Native HTML renderer (e.g. `react-native-render-html`).
- Explanation assets (images tappable → modal, videos with playback). Use `getAssetUrl()`.

### 7.6 `TipsPanel` — `src/components/revision/TipsPanel.tsx`

**Props:** `tips: Tip[]`, `contentLanguage: string`, `contentDirection: 'ltr' | 'rtl'`, `userLanguages: UserLanguageInfo[]`

- Header row with "Tips" label + LanguageSwitcher.
- Each tip rendered as a numbered item ("Tip 1", "Tip 2", …).
- Tip text via `normalizeTipText(tip, contentLanguage)`. Render HTML.
- Tip assets (same as explanation — images/videos).

### 7.7 `NavigationBar` — `src/components/revision/NavigationBar.tsx`

**Props:** `canGoPrevious: boolean`, `canGoNext: boolean`, `isFinalQuestion: boolean`, `isLoading: boolean`, `onPrevious: () => void`, `onNext: () => void`

- **Previous** button: disabled if `!canGoPrevious`.
- **Next/Finish** button: label is `"Finish"` if `isFinalQuestion`, else `"Next"`. Disabled if `!canGoNext || isLoading`.

### 7.8 `ProgressBar` — `src/components/revision/ProgressBar.tsx`

**Props:** `progress: number` (0–100), `currentIndex: number`, `totalQuestions: number`

- Horizontal bar showing `progress%` filled.
- Text: `"{currentIndex + 1} / {totalQuestions}"`.

---

## 8. QuestionScreen Render Structure

```
SafeAreaView
  Header: categoryName, "Q {n}/{total}", Restart button
  ProgressBar
  ScrollView
    if questions.length === 0 && !isLoading → EmptyState
    if currentQuestion → QuestionCard (with all props from §7.3)
  if error → ErrorBanner (red, shows error text)
  if isLoading → ActivityIndicator overlay
```

---

## 9. PracticeHistoryScreen — `src/screens/PracticeHistoryScreen.tsx`

### 9.1 Navigation Params

```ts
type PracticeHistoryParams = { categoryId: number; licenceCategoryId: number; };
```

### 9.2 On Mount

1. Find category in category store by `categoryId`.
2. Read `completedSessionIds` from category.
3. If `completedSessionIds.length > 0` and no `selectedSessionId` → call `openCompletedSession(completedSessionIds[0])`.

### 9.3 What It Renders

1. **Header:** Category name, "Session History" subtitle, "Start Again" button.
2. **Session tabs:** Horizontal `ScrollView` of session buttons. First = "Latest", rest = "Attempt N". Tapping calls `openCompletedSession(sessionId)`.
3. **Summary card:** Pie chart or simple stat display showing `correctlyAnswered` vs `incorrectlyAnswered` from `selectedSessionSummary`.
4. **LanguageSwitcher** (same component).
5. **Questions accordion:** `FlatList` of questions, each expandable:
   - Collapsed: Q number + question text (localized) + correct/incorrect icon.
   - Expanded: question assets + `OptionList` with `answerLocked=true`, `selectedOptionId` from attempt, `correctOptionId` from options.
   - Only one question expanded at a time.
6. **Load More:** If `selectedSessionPagination?.hasNext` → button calls `loadCompletedSessionPage('next')`.
7. **Empty state:** If `completedSessionIds.length === 0` → "No completed sessions" message.

### 9.4 "Start Again" Handler

1. `await initializeSession({ categoryId, licenceCategoryId, restart: true })`.
2. Navigate to **QuestionScreen**.

---

## 10. Navigation Flow (React Navigation)

```
CategoriesScreen
  ├─ Tap leaf category
  │   ├─ hasIncompleteSession OR no completed sessions
  │   │   └─ initializeSession(restart: false)
  │   │       ├─ allQuestionsAttempted === false → QuestionScreen
  │   │       └─ allQuestionsAttempted === true  → PracticeHistoryScreen
  │   └─ has completed sessions, no incomplete
  │       └─ PracticeHistoryScreen
  └─ Tap parent category → SubCategoriesScreen

QuestionScreen
  ├─ Next → Next → ... → Final → handleComplete() → PracticeHistoryScreen
  ├─ Restart → restartCurrentSession() → re-render at index 0
  └─ Back (hardware) → CategoriesScreen

PracticeHistoryScreen
  ├─ Session tabs → switch viewed session
  ├─ Start Again → initializeSession(restart: true) → QuestionScreen
  └─ Back → CategoriesScreen
```

---

## 11. Edge Cases the App Must Handle

1. **Network error during submit:** Show error banner, keep question visible. User retries by tapping Next again.
2. **Empty questions array:** Render "No questions found" empty state.
3. **`currentSession` becomes null:** Navigate back to CategoriesScreen.
4. **Not authenticated:** Navigate to Login.
5. **`allQuestionsAttempted` on init:** Navigate to PracticeHistoryScreen, NOT QuestionScreen.
6. **Missing timer entry:** Default to `Date.now()` → `elapsed = 0` → clamped to `Math.max(1, ...)`.
7. **Flag API failure:** Silently fail, do not update local flag state.
8. **Explanation/tips fetch failure:** Silently fail, panels stay empty/hidden.
9. **Paginated questions:** Track `loadedSessionPages` to avoid re-fetching. Maintain stable `currentIndex` after merge.
