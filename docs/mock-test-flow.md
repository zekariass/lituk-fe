# Mock Test Flow — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screens, components, Zustand store, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.**
> Do NOT include any Next.js routes, imports, or web-specific code.

---

## 1. Overview — Screens to Create

| # | File | Purpose |
|---|---|---|
| 1 | `src/screens/MockTestStartScreen.tsx` | Displays test config, instructions, and "Start Test" / "View History" buttons |
| 2 | `src/screens/MockTestScreen.tsx` | Active test: countdown timer, question display, option selection, navigation dots, submit |
| 3 | `src/screens/MockTestResultsScreen.tsx` | Displays pass/fail hero, stats, category breakdown, question-by-question review |
| 4 | `src/screens/MockTestHistoryScreen.tsx` | Paginated list of completed mock tests |

---

## 2. Types — File to Create

Create `src/types/mock-test.ts` with the following types. These mirror the backend API shapes and are consumed by the store and screens.

```ts
// ── Config ────────────────────────────────────────────────────────────────

export interface MockTestConfigResponse {
  id: number;
  jurisdictionId: number;
  licenceCategoryId: number;
  totalQuestions: number;
  durationMinutes: number;
  passPercentage: number;
  passMark: number;
}

// ── Question data received when starting a test ───────────────────────────

export interface AssetInfo {
  url: string;
  alt: string;
  order: number;
  type: string;       // "image" | "video" etc.
  caption: string;
}

export interface OptionInfo {
  id: number;
  text: string;
  translations: Record<string, any>;
  asset: AssetInfo | null;
  position: number;
  isCorrect?: boolean; // only present in result responses
}

export interface QuestionDetail {
  questionId: number;
  order: number;
  questionText: string;
  translations: Record<string, any>;
  assets: AssetInfo[];
  categoryId: number;
  categoryName: string;
  options: OptionInfo[];
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

export interface GetMockTestQuestionsResponse {
  jurisdiction: JurisdictionInfo;
  licenceCategory: LicenceCategoryInfo;
  config: {
    totalQuestions: number;
    durationMinutes: number;
    passPercentage: number;
    passMark: number;
  };
  questions: QuestionDetail[];
}

// ── Answer (local, stored in Zustand during test) ─────────────────────────

export interface Answer {
  questionId: number;
  selectedOptionId: number;
  timeTakenSeconds: number;
  answeredAt: number; // Date.now() timestamp
}

// ── Submit request / response ─────────────────────────────────────────────

export interface AnswerDetail {
  questionId: number;
  selectedOptionId: number;
  timeTakenSeconds: number;
}

export interface SubmitMockTestAnswersRequest {
  jurisdictionId: number;
  licenceCategoryId: number;
  timeTakenSeconds: number;
  answers: AnswerDetail[];
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

export interface QuestionResult {
  itemId: number;
  order: number;
  question: {
    id: number;
    question: string;       // question text
    categoryName: string;
    assets: AssetInfo[];
    translations?: Record<string, any>;
  };
  selectedOption: {
    id: number;
    text: string;
    isCorrect: boolean;
    asset?: AssetInfo | null;
    translations?: Record<string, any>;
  };
  correctOption: {
    id: number;
    text: string;
    isCorrect: boolean | null;
    asset?: AssetInfo | null;
    translations?: Record<string, any>;
  };
  explanation: {
    text: string;
    assets: AssetInfo[];
    translations?: Record<string, any>;
  };
  isCorrect: boolean;
}

export interface SubmitMockTestAnswersResponse {
  id: number;                         // mockTestId
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

// ── History list ──────────────────────────────────────────────────────────

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

// ── In-progress test state (persisted in Zustand) ─────────────────────────

export interface TestState {
  questions: QuestionDetail[];
  answers: Record<number, Answer>;
  currentQuestionIndex: number;
  startTime: number;       // Date.now() when test was initialized
  endTime: number;         // startTime + (durationMinutes * 60 * 1000)
  timeRemaining: number;   // seconds, updated every 1s
  config: {
    totalQuestions: number;
    durationMinutes: number;
    passPercentage: number;
    passMark: number;
  };
  jurisdictionId: number;
  licenceCategoryId: number;
}
```

---

## 3. Zustand Store — `useMockTestStore`

Create `src/store/mock-test-store.ts`.

### 3.1 State

```ts
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
```

### 3.2 Persistence

Persist the **entire** `testState` to `AsyncStorage` (key: `"mock-test-storage"`). This lets the user resume an in-progress test if the app is killed.

### 3.3 Action Behaviours

#### `initializeTest(data, jurisdictionId, licenceCategoryId)`
1. `startTime = Date.now()`
2. `endTime = startTime + (data.config.durationMinutes * 60 * 1000)`
3. `timeRemaining = data.config.durationMinutes * 60`
4. Store `questions`, `config`, `jurisdictionId`, `licenceCategoryId`.
5. Reset `answers = {}`, `currentQuestionIndex = 0`.

#### `updateAnswer(questionId, optionId)`
1. Read existing answer for `questionId` (if any) to get `answeredAt` timestamp.
2. Compute `timeTakenSeconds = Math.floor((Date.now() - answeredAt) / 1000)` — if no prior answer, use `Date.now()`.
3. Upsert into `answers[questionId]`:
   ```ts
   { questionId, selectedOptionId: optionId, timeTakenSeconds, answeredAt: Date.now() }
   ```
   **Note:** The user CAN change their answer. This overwrites the previous selection.

#### `setCurrentQuestion(index)`
Clamp `index` to `[0, questions.length - 1]` and set `currentQuestionIndex`.

#### `updateTimeRemaining(seconds)`
Set `testState.timeRemaining = seconds`.

#### `clearTest()`
Set `testState = null` (removes persisted data too).

#### `getAnsweredCount()`
Return `Object.keys(testState.answers).length`.

#### `getProgress()`
Return `(answeredCount / questions.length) * 100`.

#### `isQuestionAnswered(questionId)`
Return `!!testState.answers[questionId]`.

---

## 4. Utility: `getAssetUrl`

Reuse the existing `getAssetUrl(relativeUrl)` utility (from `question-flow.md`). It prepends the base media URL to relative asset paths.

---

## 5. Content Language

Reuse `useContentLanguageStore` from `question-flow.md` (§4.1). The mock test screens also need language switching for question/option/explanation text.

### Localized Text Helpers (local to each screen)

These are plain functions, NOT in the store:

```ts
const getQuestionText = (question: any, selectedLanguage: string): string => {
  const original = question.questionText || question.question || '';
  if (!selectedLanguage || !question.translations?.[selectedLanguage]) return original;
  const t = question.translations[selectedLanguage];
  return t?.text || t?.question || original;
};

const getOptionText = (option: any, selectedLanguage: string): string => {
  const original = option.text || '';
  if (!selectedLanguage || !option.translations?.[selectedLanguage]) return original;
  const t = option.translations[selectedLanguage];
  return t?.text || original;
};

const getExplanationText = (explanation: any, selectedLanguage: string): string => {
  const original = explanation.text || '';
  if (!selectedLanguage || !explanation.translations?.[selectedLanguage]) return original;
  const t = explanation.translations[selectedLanguage];
  return t?.text || t?.explanation || original;
};

const getCategoryName = (category: any, selectedLanguage: string): string => {
  const original = category.categoryName || '';
  if (!selectedLanguage || !category.translations?.[selectedLanguage]) return original;
  const t = category.translations[selectedLanguage];
  if (typeof t === 'string') return t;
  return t?.name || t?.categoryName || t?.text || original;
};
```

---

## 6. Screen 1 — `MockTestStartScreen`

### 6.1 Navigation Params

None required. The screen reads `selectedLicenceCategoryId` from `useAuthStore`.

### 6.2 Stores to Read

```ts
const { selectedLicenceCategoryId } = useAuthStore();
```

### 6.3 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `config` | `MockTestConfigResponse \| null` | `null` | Test configuration from backend |
| `isLoading` | `boolean` | `true` | Loading indicator |
| `userJurisdictionId` | `number` | `0` | User's jurisdiction (fetched on mount) |
| `showCategoryWarning` | `boolean` | `false` | Warning banner when no licence category selected |

### 6.4 `useEffect` — On Mount (`loadData`)

1. Fetch current user: `GET /api/v1/users/me` → extract `jurisdictionId` from `activeJurisdictionId` or `activeJurisdiction.id`.
2. Store `userJurisdictionId`.
3. If `selectedLicenceCategoryId` exists, fetch config: `GET /api/v1/mock-test-config/jurisdiction/{jurisdictionId}/licence-category/{licenceCategoryId}`.
4. Store `config`. Set `isLoading = false`.
5. On error: log, set `isLoading = false`.

### 6.5 Event Handlers

#### `handleStartTest()`
1. If `!selectedLicenceCategoryId` → set `showCategoryWarning = true`, return.
2. Navigate to `MockTestScreen` passing `{ jurisdictionId: userJurisdictionId, licenceCategoryId: selectedLicenceCategoryId }`.

#### `handleViewHistory()`
Navigate to `MockTestHistoryScreen`.

### 6.6 Render States

1. **Loading** (`isLoading === true`): Centered spinner + "Loading test configuration…"
2. **No config** (`config === null` after loading): Warning card — "Mock test not available for your jurisdiction/licence category."
3. **Config loaded**: Full UI below.

### 6.7 UI — Config Loaded

```
SafeAreaView
  ScrollView
    ┌─ Hero Header
    │   ├─ "Practice Exam" badge
    │   ├─ "Mock Test" title
    │   └─ Subtitle text
    │
    ├─ Warning Banner (if showCategoryWarning)
    │   └─ "Please select a licence category first" + dismiss button
    │
    ├─ Stat Cards (2×2 grid)
    │   ├─ Total Questions → config.totalQuestions
    │   ├─ Duration → config.durationMinutes + "min"
    │   ├─ Pass Mark → config.passMark + "/" + config.totalQuestions
    │   └─ Pass Percentage → config.passPercentage + "%"
    │
    ├─ Instructions Card
    │   ├─ "Before You Begin" header
    │   └─ 5 instruction items (numbered list with check icons):
    │       1. "Answer all questions before time runs out."
    │       2. "You have {durationMinutes} minutes to complete the test."
    │       3. "You need {passMark} correct answers ({passPercentage}%) to pass."
    │       4. "You can navigate between questions freely."
    │       5. "Your test will auto-submit when time expires."
    │
    ├─ "Start Mock Test" button (primary, full-width)
    │   └─ Disabled if !selectedLicenceCategoryId
    │
    └─ "View Test History" button (secondary, full-width)
```

---

## 7. Screen 2 — `MockTestScreen`

This is the main exam screen with a countdown timer.

### 7.1 Navigation Params

```ts
type MockTestScreenParams = {
  jurisdictionId: number;
  licenceCategoryId: number;
};
```

### 7.2 Stores to Read

```ts
const {
  testState,
  initializeTest,
  updateAnswer,
  setCurrentQuestion,
  updateTimeRemaining,
  clearTest,
  getAnsweredCount,
  getProgress,
  isQuestionAnswered,
} = useMockTestStore();

const { user } = useAuthStore();
const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore();
```

### 7.3 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `loading` | `boolean` | `true` | Initial test load |
| `submitting` | `boolean` | `false` | Submission in progress |
| `showSubmitDialog` | `boolean` | `false` | Confirm-submit modal |
| `showTimeUpDialog` | `boolean` | `false` | Time-expired overlay |
| `error` | `string \| null` | `null` | Error toast |
| `modalImage` | `string \| null` | `null` | Full-screen image preview |

Also keep a ref: `hasSubmittedRef = useRef(false)` — prevents double-submission on time expiry.

### 7.4 Derived Values

```ts
const currentQuestion = testState.questions[testState.currentQuestionIndex];
const answeredCount = getAnsweredCount();
const progress = getProgress();
const isLastQuestion = testState.currentQuestionIndex === testState.questions.length - 1;
const isLowTime = testState.timeRemaining < 300; // 5 minutes
const unansweredCount = testState.questions.length - answeredCount;
const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages ?? []) : [];
```

### 7.5 `useEffect` — Load Test (on mount)

```ts
const loadTest = async () => {
  // 1. Validate params
  if (!jurisdictionId || !licenceCategoryId) {
    setError('Invalid test parameters.');
    navigate('MockTestStartScreen');
    return;
  }
  // 2. If there's an existing testState with time still remaining, resume it
  if (testState && testState.endTime > Date.now()) {
    setLoading(false);
    return;
  }
  // 3. If existing testState has expired, clear it
  if (testState && testState.endTime <= Date.now()) {
    clearTest();
  }
  // 4. Fetch questions
  //    POST /api/v1/mock-tests/questions
  //    Body: { jurisdictionId, licenceCategoryId }
  const response = await api.post('/api/v1/mock-tests/questions', { jurisdictionId, licenceCategoryId });
  initializeTest(response.data.data, jurisdictionId, licenceCategoryId);
  setLoading(false);
};
```

### 7.6 `useEffect` — Countdown Timer

```ts
useEffect(() => {
  if (!testState?.endTime) return;

  const interval = setInterval(() => {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((testState.endTime - now) / 1000));
    updateTimeRemaining(remaining);

    if (now >= testState.endTime && !hasSubmittedRef.current) {
      hasSubmittedRef.current = true;
      clearInterval(interval);
      handleAutoSubmit();
    }
  }, 1000);

  return () => clearInterval(interval);
}, [testState?.endTime]);
```

### 7.7 `useEffect` — Auto-scroll question dots

When `testState.currentQuestionIndex` changes, scroll the question-dot strip so the active dot is centered/visible. Use a `ref` on the `ScrollView`/`FlatList`.

### 7.8 Event Handlers

#### `handleSelectOption(questionId, optionId)`
Call `updateAnswer(questionId, optionId)`. The user **can change** their answer freely (not locked after first pick).

#### `handlePrevious()`
Call `setCurrentQuestion(testState.currentQuestionIndex - 1)`. Disabled when `currentQuestionIndex === 0`.

#### `handleNext()`
Call `setCurrentQuestion(testState.currentQuestionIndex + 1)`. Disabled when `!isQuestionAnswered(currentQuestion.questionId)`.

#### `handleDotPress(index)`
Call `setCurrentQuestion(index)`. Allows jumping to any question.

#### `handleSubmitPress()`
Set `showSubmitDialog = true`.

#### `submitTest(isAutoSubmit: boolean)`
```ts
const submitTest = async (isAutoSubmit = false) => {
  if (!testState || submitting) return;
  setSubmitting(true);

  const timeTakenSeconds = Math.floor((Date.now() - testState.startTime) / 1000);
  const answersArray = Object.values(testState.answers).map(a => ({
    questionId: a.questionId,
    selectedOptionId: a.selectedOptionId,
    timeTakenSeconds: a.timeTakenSeconds,
  }));

  // If auto-submit with zero answers, just go to history
  if (answersArray.length === 0 && isAutoSubmit) {
    clearTest();
    navigate('MockTestHistoryScreen');
    return;
  }

  // POST /api/v1/mock-tests/submit
  const payload: SubmitMockTestAnswersRequest = {
    jurisdictionId: testState.jurisdictionId,
    licenceCategoryId: testState.licenceCategoryId,
    timeTakenSeconds,
    answers: answersArray,
  };
  const response = await api.post('/api/v1/mock-tests/submit', payload);
  const result = response.data;

  // Persist results temporarily for the Results screen
  // (use a global variable, Zustand transient state, or AsyncStorage)
  clearTest();

  if (isAutoSubmit) {
    navigate('MockTestHistoryScreen');
  } else {
    navigate('MockTestResultsScreen', { testId: result.data.mockTestId, results: result });
  }
};
```

#### `handleAutoSubmit()`
1. Set `showTimeUpDialog = true`.
2. After a 2-second delay, call `submitTest(true)`.

### 7.9 Time Formatting Helper

```ts
const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};
```

### 7.10 Render Structure

```
SafeAreaView
│
├─ Error Toast (fixed position, shown when error is set)
│   └─ Dismissable error message
│
├─ Time's Up Overlay (Modal, shown when showTimeUpDialog)
│   ├─ Clock icon
│   ├─ "Time's Up!" title
│   ├─ "Submitting your answers now…" subtitle
│   └─ Spinner
│
├─ Submit Confirmation Modal (shown when showSubmitDialog)
│   ├─ "Ready to submit?" title
│   ├─ "You've answered {answeredCount} of {total} questions."
│   ├─ Progress bar (answeredCount / total)
│   ├─ "{answeredCount} answered" / "{unansweredCount} remaining" labels
│   ├─ Warning if unansweredCount > 0: "{N} questions will be left unanswered."
│   ├─ "Continue" button → close dialog
│   └─ "Submit Test" button → submitTest(false)
│       (shows spinner when submitting)
│
├─ Sticky Header
│   ├─ Left: "Mock Test" title + "Question {N}" subtitle
│   ├─ Right:
│   │   ├─ Answered counter pill: "{answeredCount}/{total}" (green dot)
│   │   ├─ Timer: formatTime(timeRemaining) with clock icon
│   │   │   ├─ Normal: default border
│   │   │   └─ Low time (< 5 min): red border, pulsing animation
│   │   └─ "Submit" button (always visible on mobile)
│   └─ Progress Segment Bar (full-width, below header)
│       └─ One thin segment per question, tappable:
│           - Current → primary color
│           - Answered → green
│           - Unanswered → muted/gray
│
├─ Question Card
│   ├─ Category badge: currentQuestion.categoryName
│   ├─ Language Switcher (if languageFlags.length > 0)
│   │   └─ Horizontal row of flag buttons
│   ├─ Question Assets (if currentQuestion.assets.length > 0)
│   │   ├─ Videos → expo-av Video component
│   │   └─ Images → grid (tappable → setModalImage)
│   ├─ Question Text: getQuestionText(currentQuestion, selectedLanguage)
│   │   └─ Apply text direction from content language store
│   └─ Options
│       ├─ If ALL options have asset URLs → 2-column grid layout
│       │   └─ Each: checkbox + image + optional text
│       └─ Otherwise → vertical list layout
│           └─ Each: checkbox + optional inline image + text
│       Selected option: green border + green checkbox fill
│       Tapping any option calls handleSelectOption(questionId, optionId)
│
├─ Navigation Row
│   ├─ Previous button (disabled at index 0, icon flips for RTL)
│   ├─ Question Dots (horizontal scrollable)
│   │   └─ Numbered buttons [1, 2, 3, …]
│   │       - Current: primary background
│   │       - Answered: green tint
│   │       - Unanswered: default/muted
│   │       Tapping a dot calls handleDotPress(index)
│   └─ Next button (disabled if current question not answered)
│       └─ If isLastQuestion → shows "Submit" instead of "Next"
│
└─ Mobile Submit Bar (full-width at bottom)
    └─ "Submit Test ({answeredCount}/{total})" button
```

### 7.11 Image Modal

Same pattern as in `practice-history.md` §10.10 — `Modal` overlay, dark background, close button, centered image.

---

## 8. Screen 3 — `MockTestResultsScreen`

Shown immediately after manual submission. Displays the detailed results.

### 8.1 Navigation Params

```ts
type MockTestResultsParams = {
  testId: string;       // mockTestId from submit response
  results?: SubmitMockTestAnswersResponse; // passed directly from submit
};
```

### 8.2 Stores to Read

```ts
const { user } = useAuthStore();
const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore();
```

### 8.3 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `results` | `SubmitMockTestAnswersResponse \| null` | `null` | Full results data |
| `showAllQuestions` | `boolean` | `true` | Show all vs incorrect only |
| `currentQuestionIndex` | `number` | `0` | Index into `questionsToShow` |
| `isLoading` | `boolean` | `true` | Loading indicator |
| `error` | `string \| null` | `null` | Error message |
| `modalImage` | `string \| null` | `null` | Full-screen image URL |
| `categoryOpen` | `boolean` | `false` | Category breakdown accordion open/closed |
| `selectedLanguage` | `string` | `''` | Content language code (local, also syncs to store) |

### 8.4 `useEffect` — Load Results (on mount)

```ts
const loadResults = async () => {
  // 1. Check if results were passed via navigation params
  if (params.results) {
    setResults(params.results);
    setIsLoading(false);
    return;
  }
  // 2. Otherwise fetch by testId
  //    GET /api/v1/mock-tests/{testId}/results
  if (params.testId) {
    const response = await api.get(`/api/v1/mock-tests/${params.testId}/results`);
    setResults(response.data.data || response.data);
  } else {
    setError('No results found.');
  }
  setIsLoading(false);
};
```

### 8.5 Derived Values

```ts
const accuracyRate = (results.correctAnswers / results.totalQuestions) * 100;
const timeMinutes = Math.floor(results.timeTakenSeconds / 60);
const timeSeconds = results.timeTakenSeconds % 60;
const passed = results.passed;

const questionsToShow = results.questions.filter(q => showAllQuestions || !q.isCorrect);
const currentQuestion = questionsToShow[currentQuestionIndex];
const isFirstQuestion = currentQuestionIndex === 0;
const isLastQuestion = currentQuestionIndex === questionsToShow.length - 1;

const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages ?? []) : [];
```

### 8.6 Stat Cards Data

```ts
const stats = [
  { icon: 'award',       label: 'Score',      value: `${results.correctAnswers}/${results.totalQuestions}` },
  { icon: 'trending-up', label: 'Accuracy',   value: `${accuracyRate.toFixed(1)}%` },
  { icon: 'clock',       label: 'Time Taken', value: `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}` },
  { icon: 'check',       label: 'Pass Mark',  value: `${results.passingScore}` },
];
```

### 8.7 Event Handlers

#### `handleToggleFilter()`
Toggle `showAllQuestions`. Reset `currentQuestionIndex = 0`.

#### `handlePreviousQuestion()`
`setCurrentQuestionIndex(prev => prev - 1)`. Disabled when `isFirstQuestion`.

#### `handleNextQuestion()`
`setCurrentQuestionIndex(prev => prev + 1)`. Disabled when `isLastQuestion`.

#### `handleTakeAnotherTest()`
Navigate to `MockTestStartScreen`.

#### `handleBackToDashboard()`
Navigate to the Practice dashboard / home.

#### `handleBackToHistory()`
Navigate to `MockTestHistoryScreen`.

### 8.8 Render Structure

```
SafeAreaView
  ScrollView
    ┌─ Back to History link (top-right)
    │
    ├─ Result Hero Card
    │   ├─ Pass/Fail icon (green CheckCircle or red XCircle)
    │   ├─ "You Passed!" or "Not Passed" (large, colored text)
    │   ├─ "You scored {correct} / {total} questions"
    │   └─ Stat Cards (2×2 grid): Score, Accuracy, Time Taken, Pass Mark
    │
    ├─ Category Breakdown (collapsible accordion)
    │   ├─ Header: "Performance by Category" + chevron toggle
    │   ├─ Language Switcher (if languageFlags.length > 0)
    │   └─ Expanded content:
    │       └─ For each category in results.categoryBreakdown:
    │           ├─ Category name (translated via getCategoryName)
    │           ├─ Accuracy percentage + correct/total count
    │           └─ Progress bar:
    │               - >=80% → green
    │               - >=60% → amber
    │               - <60%  → red
    │
    ├─ Question Review Section
    │   ├─ Header: "Question Review"
    │   ├─ Filter toggle: "Show All" ↔ "Incorrect Only"
    │   ├─ Language Switcher (if languageFlags.length > 0)
    │   │
    │   ├─ If questionsToShow.length === 0 (all correct, filter = incorrect only):
    │   │   └─ Green check icon + "All questions answered correctly!"
    │   │
    │   └─ Current Question Card:
    │       ├─ "Question {N} of {total}" + correct/incorrect badge
    │       ├─ Question Assets (images/videos, same pattern as test screen)
    │       ├─ Question Text (translated, dir-aware)
    │       ├─ "Your Answer" box:
    │       │   ├─ Option image (if present, tappable → modal)
    │       │   └─ Option text (green if correct, red if incorrect)
    │       ├─ "Correct Answer" box (only if user was incorrect):
    │       │   ├─ Option image (if present)
    │       │   └─ Option text (always green)
    │       ├─ Explanation box (if explanation.text exists):
    │       │   ├─ "Explanation" label
    │       │   ├─ Explanation text (translated, rendered as HTML → use a
    │       │   │   markdown/HTML renderer for React Native, dir-aware)
    │       │   └─ Explanation assets (images/videos)
    │       └─ Navigation: Previous | "N / total" | Next
    │
    ├─ Action Buttons
    │   ├─ "Take Another Test" (primary) → MockTestStartScreen
    │   └─ "Back to Dashboard" (secondary) → Practice home
    │
    └─ Image Modal (same pattern)
```

---

## 9. Screen 4 — `MockTestHistoryScreen`

Paginated list of completed mock tests.

### 9.1 Navigation Params

None.

### 9.2 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `tests` | `MockTestSummaryResponse[]` | `[]` | Current page of tests |
| `page` | `number` | `0` | 0-indexed page number |
| `totalPages` | `number` | `0` | Total pages from API |
| `isLoading` | `boolean` | `false` | Loading indicator |

### 9.3 `useEffect` — Fetch History (on mount + when `page` changes)

```ts
const fetchHistory = async () => {
  setIsLoading(true);
  // GET /api/v1/mock-tests?status=completed&page={page}&size=10&sort=completedAt,desc
  const response = await api.get('/api/v1/mock-tests', {
    params: { status: 'completed', page, size: 10, sort: 'completedAt,desc' }
  });
  const data = response.data.data || response.data;

  if (data?.content && Array.isArray(data.content)) {
    setTests(data.content);
    setTotalPages(data.page?.totalPages || data.totalPages || 1);
  } else if (Array.isArray(data)) {
    setTests(data);
    setTotalPages(1);
  } else {
    setTests([]);
    setTotalPages(0);
  }
  setIsLoading(false);
};
```

### 9.4 Helper Functions

```ts
const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

const formatTime = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
```

### 9.5 Event Handlers

#### `handleNewTest()`
Navigate to `MockTestStartScreen`.

#### `handleViewDetails(testId)`
Navigate to `MockTestResultsScreen` with `{ testId }`.

#### `handlePreviousPage()`
`setPage(page - 1)`. Disabled when `page === 0`.

#### `handleNextPage()`
`setPage(page + 1)`. Disabled when `page >= totalPages - 1`.

### 9.6 Derived Values Per Test Card

```ts
const accuracyRate = test.totalQuestions > 0
  ? (test.score / test.totalQuestions) * 100
  : 0;

const timeTakenSeconds = test.startedAt && test.finishedAt
  ? Math.floor((new Date(test.finishedAt).getTime() - new Date(test.startedAt).getTime()) / 1000)
  : null;

const passed = test.passed;
```

### 9.7 Mini Stats Per Card

```ts
const miniStats = [
  { label: 'Score',    value: `${test.score}/${test.totalQuestions}` },
  { label: 'Accuracy', value: `${accuracyRate.toFixed(1)}%` },
  { label: 'Time',     value: timeTakenSeconds != null ? formatTime(timeTakenSeconds) : '—' },
];
```

### 9.8 Render Structure

```
SafeAreaView
  ScrollView (or FlatList)
    ┌─ Header
    │   ├─ "Test History" title
    │   ├─ "View your past mock test attempts" subtitle
    │   └─ "New Test" button (top-right) → MockTestStartScreen
    │
    ├─ Loading State: centered spinner
    │
    ├─ Empty State (tests.length === 0):
    │   ├─ History icon
    │   ├─ "No history yet" text
    │   └─ "Take Your First Test" button → MockTestStartScreen
    │
    ├─ Test List
    │   └─ For each test:
    │       ┌─ Color-themed card (green if passed, red if failed)
    │       │   ├─ Top accent bar (green or red, 2px)
    │       │   ├─ Pass/Fail badge ("PASSED" with check or "FAILED" with X)
    │       │   ├─ Licence category info (code + name)
    │       │   ├─ Jurisdiction name
    │       │   ├─ Thin divider line
    │       │   ├─ Mini Stats Row (horizontal scroll):
    │       │   │   ├─ Score: "{score}/{total}"
    │       │   │   ├─ Accuracy: "{pct}%"
    │       │   │   └─ Time: "MM:SS"
    │       │   ├─ Date + time of completion
    │       │   └─ "Details →" button → MockTestResultsScreen({ testId: test.id })
    │       └─
    │
    └─ Pagination (if totalPages > 1)
        ├─ "Prev" button (disabled at page 0)
        ├─ "{page + 1} / {totalPages}" indicator
        └─ "Next" button (disabled at last page)
```

---

## 10. Navigation Flow

```
PracticeScreen (tab)
  └─ "Mock Test" card tap
      └─ MockTestStartScreen
          ├─ "Start Mock Test" → MockTestScreen
          │   ├─ Manual submit → MockTestResultsScreen
          │   │   ├─ "Take Another Test" → MockTestStartScreen
          │   │   ├─ "Back to Dashboard" → PracticeScreen
          │   │   └─ "Back to History" → MockTestHistoryScreen
          │   └─ Auto-submit (time up) → MockTestHistoryScreen
          └─ "View Test History" → MockTestHistoryScreen
              ├─ "New Test" → MockTestStartScreen
              └─ "Details" on any card → MockTestResultsScreen
```

---

## 11. API Endpoints Summary (Client Consumption Only)

| # | Method | Endpoint | When Called | Request Body | Response |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/users/me` | MockTestStartScreen mount | — | User object with `activeJurisdictionId` |
| 2 | `GET` | `/api/v1/mock-test-config/jurisdiction/{jId}/licence-category/{lcId}` | MockTestStartScreen mount | — | `MockTestConfigResponse` |
| 3 | `POST` | `/api/v1/mock-tests/questions` | MockTestScreen mount | `{ jurisdictionId, licenceCategoryId }` | `GetMockTestQuestionsResponse` |
| 4 | `POST` | `/api/v1/mock-tests/submit` | Manual or auto submit | `SubmitMockTestAnswersRequest` | `{ data: SubmitMockTestAnswersResponse }` |
| 5 | `GET` | `/api/v1/mock-tests?status=completed&page={p}&size=10&sort=completedAt,desc` | MockTestHistoryScreen mount / page change | — | `MockTestListResponse` (paginated) |
| 6 | `GET` | `/api/v1/mock-tests/{testId}/results` | MockTestResultsScreen (fallback fetch) | — | `SubmitMockTestAnswersResponse` |

---

## 12. Edge Cases

1. **App killed during test:** `testState` is persisted in AsyncStorage. On relaunch, `MockTestScreen` checks if `testState.endTime > Date.now()` and resumes. If expired, it clears the test.

2. **Time expires exactly when user taps submit:** `hasSubmittedRef` prevents double submission. The first path (manual or auto) wins.

3. **No licence category selected:** Start screen shows a warning banner and disables the start button.

4. **Config not available for jurisdiction/licence combination:** Show "not available" card on start screen.

5. **Submit with zero answers (auto-submit):** Skip the submit API call, clear test, navigate to history.

6. **User changes answer:** Freely allowed. `updateAnswer` overwrites the previous selection for that `questionId`.

7. **RTL content:** Apply `direction` from content language store. Timer should always be LTR (`formatTime` output is numeric). Navigation chevrons flip direction.

8. **Asset URLs:** Always resolve through `getAssetUrl()`.

9. **Results screen deep-link:** If `results` param is not passed (e.g., opened from history), fetch by `testId` from API endpoint #6.

10. **Explanation HTML:** Some explanations contain HTML markup. Use a React Native HTML renderer (e.g., `react-native-render-html`) with `direction` support.

11. **Question dot strip overflow:** Use a horizontal `ScrollView`/`FlatList` with auto-scroll to the active dot when `currentQuestionIndex` changes.

12. **Android back button during test:** Should show the submit confirmation dialog, NOT navigate away (user might lose their progress).

13. **Network error during submit:** Show error toast, keep `submitting = false`, keep dialogs open so user can retry.
