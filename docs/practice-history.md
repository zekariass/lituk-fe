# Practice History Screen — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screen, components, store reads, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.** Only implement React Native / Expo code.
> All types, utility functions, and the revision Zustand store referenced here are defined in `question-flow.md`. Do not re-create them.

---

## 1. File to Create

| File | Purpose |
|---|---|
| `src/screens/PracticeHistoryScreen.tsx` | Main screen showing completed session history |
| `src/components/revision/SessionSummaryChart.tsx` | Donut/pie chart showing correct vs incorrect |

The following components are **reused** from the question flow (already defined in `question-flow.md`):
- `OptionList` — renders options in read-only mode
- `LanguageSwitcher` — content language toggle

---

## 2. Navigation Params

```ts
type PracticeHistoryParams = {
  categoryId: number;
  licenceCategoryId: number;
};
```

This screen is reached via:
- Tapping a leaf category that has completed sessions and no incomplete session.
- After `initializeSession` resolves with `allQuestionsAttempted === true`.
- After `handleComplete()` in QuestionScreen completes a session.

---

## 3. Stores to Read

### 3.1 From `useRevisionStore`

```ts
const {
  initializeSession,
  openCompletedSession,
  loadCompletedSessionPage,
  selectedSessionId,
  selectedSessionSummary,
  selectedSessionQuestions,
  selectedSessionPagination,
  isLoading,
  error,
} = useRevisionStore();
```

### 3.2 From `useCategoryStore`

```ts
const { categories } = useCategoryStore();
```

Used to find the category and read `completedSessionIds`.

### 3.3 From `useAuthStore`

```ts
const { isAuthenticated, user } = useAuthStore();
```

Used for authentication guard and to get `user.userLanguages` and `user.subscription.withTranslation`.

### 3.4 From `useContentLanguageStore`

```ts
const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore();
```

Used for translating question/option text.

---

## 4. Guards (on mount)

1. If `!isAuthenticated` → navigate to Login screen.
2. If `!categoryId` or category not found in store → navigate back to CategoriesScreen.

---

## 5. Derived Values

```ts
const selectedCategory = categories.find((cat) => cat.id === categoryId);
const completedSessionIds = [...(selectedCategory?.completedSessionIds ?? [])];
const languageFlags = user?.subscription?.withTranslation !== false
  ? (user?.userLanguages ?? [])
  : [];
```

---

## 6. Local Screen State (`useState`)

| State | Type | Initial | Purpose |
|---|---|---|---|
| `expandedQuestions` | `Record<number, boolean>` | `{}` | Tracks which question in the accordion is expanded. Only one at a time. |
| `isStartingSession` | `boolean` | `false` | Loading state for "Start Again" button |
| `modalImage` | `string \| null` | `null` | URL of image to show in full-screen modal |

---

## 7. `useEffect` — On Mount / Session Auto-Open

```ts
useEffect(() => {
  if (!isAuthenticated) { navigate('Login'); return; }
  if (!categoryId || !selectedCategory) { navigate('CategoriesScreen'); return; }
  if (completedSessionIds.length > 0 && !selectedSessionId) {
    openCompletedSession(completedSessionIds[0]);
  }
}, [isAuthenticated, categoryId, selectedCategory, completedSessionIds.length, selectedSessionId]);
```

This auto-opens the latest completed session when the screen mounts.

---

## 8. Event Handlers

### 8.1 `toggleQuestion(questionId: number)`

Accordion behaviour — only one question expanded at a time:

```ts
const toggleQuestion = (questionId: number) => {
  setExpandedQuestions((prev) => {
    if (prev[questionId]) return {};        // collapse if already open
    return { [questionId]: true };           // close all, open this one
  });
};
```

### 8.2 `handleStartAgain()`

```ts
const handleStartAgain = async () => {
  setIsStartingSession(true);
  try {
    await initializeSession({ categoryId, licenceCategoryId, restart: true });
    navigate('QuestionScreen');
  } catch {
    setIsStartingSession(false);
  }
};
```

### 8.3 `handleSessionTabPress(sessionId: string)`

```ts
const handleSessionTabPress = (sessionId: string) => {
  openCompletedSession(sessionId);
  setExpandedQuestions({});
};
```

### 8.4 Localized Text Helpers (local to this screen)

```ts
const getTranslatedQuestionText = (question: Question): string => {
  if (!selectedLanguage || !question.translations?.[selectedLanguage]) return question.text;
  const translation = question.translations[selectedLanguage] as any;
  return translation?.text || translation?.question || question.text;
};

const getTranslatedOptionLabel = (option: QuestionOption): string => {
  if (!selectedLanguage || !option.translations?.[selectedLanguage]) return option.text;
  const translation = option.translations[selectedLanguage] as any;
  return translation?.text || option.text;
};
```

---

## 9. Screen Render Structure

```
SafeAreaView
  ScrollView
    ┌─ Header
    │   ├─ Back button → navigates to CategoriesScreen
    │   │   (pass licenceCategoryId so categories screen can filter)
    │   ├─ Category name (selectedCategory.name)
    │   ├─ "Session History" subtitle
    │   └─ "Start Again" button (with loading spinner when isStartingSession)
    │
    ├─ if completedSessionIds.length === 0 → EmptyState
    │   └─ Icon + "No completed sessions" message
    │
    └─ if completedSessionIds.length > 0 → Content Card
        ├─ Session Tabs (horizontal ScrollView)
        ├─ Session Summary Chart (pie/donut)
        ├─ Summary Legend (correct count + incorrect count)
        ├─ Language Switcher (if languageFlags.length > 0)
        ├─ Questions Accordion (or loading spinner)
        ├─ Pagination controls (Previous / page indicator / Next)
        └─ Error banner (if error)

  ImageModal (full-screen overlay when modalImage is set)
```

---

## 10. UI Elements — Detailed Specs

### 10.1 Header

- **Back button:** Left-aligned. Navigates back to CategoriesScreen (or revision categories list). Pass `licenceCategoryId` as param so the categories screen shows the right category group.
- **Category name:** Large, bold text — `selectedCategory.name`.
- **Subtitle:** "Session History" (smaller, muted text).
- **"Start Again" button:** Right-aligned. Shows a restart icon normally. When `isStartingSession === true`, show a spinner and "Starting…" text. Disabled while `isStartingSession`.

### 10.2 Empty State

Shown when `completedSessionIds.length === 0`.

- Centered content: icon + "No completed sessions" text.
- The "Start Again" button in the header still works here to begin a new session.

### 10.3 Session Tabs

- Horizontal `ScrollView` (or `FlatList` with `horizontal`).
- One button per `completedSessionIds` entry.
- **Label logic:**
  - Index 0 → "Latest"
  - Index N (N > 0) → "Attempt {completedSessionIds.length - N}" (so the second session shows a lower attempt number)
- **Active tab** (where `selectedSessionId === sessionId`): highlighted background (primary color).
- **Inactive tabs:** bordered, muted text.
- Tapping a tab calls `handleSessionTabPress(sessionId)`.

### 10.4 Session Summary Chart — `SessionSummaryChart`

Create `src/components/revision/SessionSummaryChart.tsx`.

**Props:**

```ts
interface SessionSummaryChartProps {
  correct: number;
  incorrect: number;
  size?: number; // default 200
}
```

**What it renders:**

A donut/pie chart with two segments:
- **Correct** — green (`#10b981`)
- **Incorrect** — red/rose (`#f43f5e`)

**Center label:**
- Percentage: `Math.round((correct / total) * 100)` followed by `%`
- "Accuracy" label below the percentage
- Grade badge: `>=90%` → "Excellent" (green), `>=75%` → "Good" (blue), `>=60%` → "Fair" (amber), `<60%` → "Needs Work" (rose)

Use `react-native-svg` to draw the donut chart (two `Arc` paths inside a `Svg` component), or use a library like `react-native-svg-charts` or `victory-native`.

**If `total === 0`:** Show a "No data" placeholder instead.

### 10.5 Summary Legend

Below the chart, show a row with:
- Green dot + "Correct" label + count (`selectedSessionSummary.correctlyAnswered`)
- Red dot + "Incorrect" label + count (`selectedSessionSummary.incorrectlyAnswered`)

### 10.6 Language Switcher

Render the shared `LanguageSwitcher` component (from `question-flow.md` §7.1). Only show if `languageFlags.length > 0`.

### 10.7 Questions Accordion

**Loading state:** If `isLoading && selectedSessionQuestions.length === 0` → show a centered `ActivityIndicator`.

**Question list:** Render each question from `selectedSessionQuestions` using a `FlatList` or plain `map` inside the `ScrollView`.

Each question item:

#### Collapsed State (default)

A pressable row with:
- **Q number:** `Q{index + 1}` — colored green if correct, red if incorrect.
- **Question text:** `getTranslatedQuestionText(question)` — bold, colored green/red matching correctness. Truncate to ~2 lines.
- **Correct/Incorrect label:** Small badge, hidden on small screens (optional for mobile — can always show since it's the only indicator).
- **Chevron:** Down arrow, rotates 180° when expanded.
- **Background tint:** Light green if correct, light red if incorrect.

**Determining correctness:**
```ts
const attempt = question.currentSessionAttempt ?? (question as any).attempt;
const isCorrect = Boolean(attempt?.isCorrect);
```

**Text direction:** Apply `direction` from content language store (for RTL languages).

#### Expanded State

When `expandedQuestions[question.id] === true`, show below the collapsed row:

1. **Question assets** (if `question.assets?.length > 0`):
   - Separate video and image assets:
     ```ts
     const videoAssets = question.assets.filter(a =>
       a.contentType?.startsWith('video') || a.type?.toLowerCase().includes('video')
     );
     const imageAssets = question.assets.filter(a =>
       !a.contentType?.startsWith('video') && !a.type?.toLowerCase().includes('video')
     );
     ```
   - **Videos:** Render with `expo-av` `Video` component, controls enabled, muted, inline playback.
   - **Images:** Render in a grid (1-column if single image, 2-column if multiple). Each image:
     - Use `getAssetUrl(asset.url)` for the source.
     - Tappable → sets `modalImage` to the full URL.
     - Show `asset.caption` below if present.

2. **OptionList** component (reused):
   ```tsx
   <OptionList
     options={question.options ?? []}
     selectedOptionId={attempt?.selectedOptionId}
     answerLocked={true}
     correctOptionId={question.options?.find((opt) => opt.isCorrect)?.id}
     onSelectOption={() => {}}  // no-op, locked
     contentLanguage={selectedLanguage}
   />
   ```
   - All options are read-only (`answerLocked=true`).
   - The user's selected option is highlighted (green if correct, red if incorrect).
   - The correct option is always shown in green.

### 10.8 Pagination Controls

Only show if `selectedSessionPagination && selectedSessionPagination.totalPages > 1`.

Render a row with:

- **Previous button:** Calls `loadCompletedSessionPage('previous')`. Disabled if `!selectedSessionPagination.hasPrevious || isLoading`.
- **Page indicator:** `"{currentPage} / {totalPages}"` (centered text).
- **Next button:** Calls `loadCompletedSessionPage('next')`. Disabled if `!selectedSessionPagination.hasNext || isLoading`.

### 10.9 Error Banner

Shown when `error` is non-null.

- Red-tinted container with alert icon + error message text.
- Clears automatically when the next successful store action runs.

### 10.10 Image Modal

Full-screen overlay for viewing tapped images:

- **Trigger:** `modalImage` is set to a URL string.
- **Render:** `Modal` (React Native) with:
  - Dark semi-transparent background (`rgba(0,0,0,0.92)`).
  - Close button (X icon) in top-right corner.
  - The image centered, `resizeMode="contain"`, max width/height constrained to screen dimensions.
  - Tapping the backdrop closes the modal (`setModalImage(null)`).

---

## 11. Store Actions Used (already defined — do NOT re-implement)

These actions are already defined in the revision store (`question-flow.md` §4.2). This screen simply calls them:

| Action | When Called |
|---|---|
| `openCompletedSession(sessionId)` | On mount (auto-open latest), on session tab tap |
| `loadCompletedSessionPage(direction)` | On Previous/Next pagination button tap |
| `initializeSession({ categoryId, licenceCategoryId, restart: true })` | On "Start Again" button tap |

### What `openCompletedSession` does (for reference)

1. Sets `isLoading=true`, clears previous session data.
2. HTTP `GET /api/v1/revision/sessions/{sessionId}/questions?page=1&size=10&sort=id,asc`.
3. Normalizes questions, stores `selectedSessionId`, `selectedSessionSummary`, `selectedSessionQuestions`, `selectedSessionPagination`.
4. Sets `isLoading=false`.

### What `loadCompletedSessionPage` does (for reference)

1. Checks pagination guards (`hasNext`/`hasPrevious`).
2. HTTP `GET /api/v1/revision/sessions/{sessionId}/questions?page={targetPage}&size={pageSize}&sort=id,asc`.
3. Merges incoming questions with existing `selectedSessionQuestions` via `mergeQuestionsById`.
4. Updates `selectedSessionPagination`.

---

## 12. Navigation Flow

```
PracticeHistoryScreen
  ├─ Back button → CategoriesScreen (with licenceCategoryId param)
  ├─ "Start Again" → initializeSession(restart: true) → QuestionScreen
  ├─ Session tabs → switch between completed sessions (stays on this screen)
  └─ Question accordion → expand/collapse questions (stays on this screen)
```

---

## 13. Edge Cases

1. **No completed sessions:** Render empty state. "Start Again" button still functional.
2. **`selectedCategory` is null:** Navigate back to CategoriesScreen.
3. **`openCompletedSession` fails:** Error banner shown, `selectedSessionQuestions` remains empty.
4. **Pagination edge:** Buttons correctly disabled when at first/last page.
5. **Session tab switch while loading:** `openCompletedSession` resets questions to `[]` and shows loading spinner, preventing stale data display.
6. **Image modal on Android back button:** Intercept hardware back to close modal before navigating away.
7. **RTL content:** Apply `direction` from content language store to question text and options.
8. **Asset URLs:** Always resolve through `getAssetUrl()` to handle relative paths.
