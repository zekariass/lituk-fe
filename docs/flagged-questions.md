# Flagged Questions — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screen, components, Zustand store, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.**
> Do NOT include any Next.js routes, imports, or web-specific code.

---

## 1. Overview

The flagged-questions feature is a **single screen** where the user reviews questions they previously flagged during revision practice. Each flagged question is shown as an expandable accordion. Inside the expanded accordion the user can:

- View the question text, assets (images/videos), and answer options.
- Tap an option to answer (immediate correct/incorrect feedback).
- Toggle an **explanation** panel and a **tips** panel.
- **Unflag** (remove) a question.
- Switch the **content language** for translated text.

The list is **paginated** (server-side, page-based).

### File to Create

| File | Purpose |
|---|---|
| `src/screens/FlaggedQuestionsScreen.tsx` | Main screen (header, language switcher, list, pagination) |
| `src/components/FlaggedQuestionAccordion.tsx` | Expandable card per flagged question |
| `src/store/flagged-questions-store.ts` | Zustand store managing list, toggles, explanations, tips |

---

## 2. Types

Reuse the shared types already defined in `src/types/index.ts` (see `question-flow.md` §2). The key interfaces are repeated here for clarity.

```ts
export type TranslationMap = Record<string, Record<string, unknown>>;

export interface QuestionAsset {
  url: string;
  alt?: string;
  order?: number;
  type?: string;        // "image", "video", etc.
  caption?: string;
  size?: number;
  filename?: string;
  contentType?: string;
  uploadedAt?: string;
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

export interface FlaggedQuestionInfo {
  id: number;
  question: string;     // original question text
  text?: string;        // alternate text field
  categoryId: number;
  categoryName: string;
  translations?: TranslationMap;
  assets: QuestionAsset[];
  options: QuestionOption[];
}

export interface UserAttemptInfo {
  isCorrect: boolean;
  lastAttemptedAt: string;
}

export interface FlaggedQuestionResponse {
  id: number;                           // flag record ID
  question: FlaggedQuestionInfo;
  userAttempt: UserAttemptInfo | null;  // null if never attempted
  flaggedAt: string;
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
```

---

## 3. Zustand Store — `useFlaggedQuestionsStore`

Create `src/store/flagged-questions-store.ts`.

### 3.1 State Shape

```ts
interface FlaggedQuestionsState {
  flaggedQuestions: FlaggedQuestionResponse[];
  page: number;
  size: number;                         // default 20
  loading: boolean;
  expandedQuestionId: number | null;    // questionId of the currently-expanded accordion
  language: string;                     // content language code, default 'en'
  explanations: Record<number, Explanation>;
  tips: Record<number, Tip[]>;
  showAnswer: Record<number, boolean>;
  showExplanation: Record<number, boolean>;
  showTips: Record<number, boolean>;
  hasMore: boolean;                     // true while returned items >= size

  // Actions
  fetchFlaggedQuestions: (page?: number) => Promise<void>;
  setExpandedQuestion: (id: number | null) => void;
  setLanguage: (language: string) => void;
  removeFlag: (questionId: number) => Promise<void>;
  fetchExplanation: (questionId: number) => Promise<void>;
  fetchTips: (questionId: number) => Promise<void>;
  toggleShowAnswer: (questionId: number) => void;
  toggleShowExplanation: (questionId: number) => void;
  toggleShowTips: (questionId: number) => void;
  reset: () => void;
}
```

### 3.2 Action Behaviours

#### `fetchFlaggedQuestions(page?)`
1. `page` defaults to current `state.page` if not provided.
2. Set `loading = true`.
3. `GET /api/v1/flags?page={page}&size={size}` → response: `{ data: { content: FlaggedQuestionResponse[], page: {...} } }`.
4. Extract `content` array (ensure it's an array, fallback to `[]`).
5. Set `flaggedQuestions = content`, `page = currentPage`, `loading = false`.
6. Set `hasMore = content.length >= size`.
7. On error: `flaggedQuestions = []`, `loading = false`.

#### `setExpandedQuestion(id)`
Set `expandedQuestionId = id`. Only one accordion is open at a time.

#### `setLanguage(language)`
Set `language`. Used by the global LanguageSwitcher.

#### `removeFlag(questionId)`
1. **Optimistic update:** immediately filter out the item where `question.id === questionId`.
2. `DELETE /api/v1/flags/{questionId}`.
3. On error: **rollback** — restore the previous list. Re-throw so the UI can show an error.

#### `fetchExplanation(questionId)`
1. If `explanations[questionId]` already exists → return (cache hit).
2. `GET /api/v1/questions/{questionId}/explanation` → `Explanation`.
3. Store in `explanations[questionId]`.
4. On error: log.

#### `fetchTips(questionId)`
1. If `tips[questionId]` already exists → return (cache hit).
2. `GET /api/v1/questions/{questionId}/tips` → `Tip[]`.
3. Filter to `active !== false`, sort by `order`.
4. Store in `tips[questionId]`.
5. On error: log.

#### `toggleShowExplanation(questionId)`
1. Flip `showExplanation[questionId]`.
2. **If now showing** (was false → true): call `fetchExplanation(questionId)` to ensure data is loaded.

#### `toggleShowTips(questionId)`
1. Flip `showTips[questionId]`.
2. **If now showing** (was false → true): call `fetchTips(questionId)` to ensure data is loaded.

#### `toggleShowAnswer(questionId)`
Flip `showAnswer[questionId]`.

#### `reset()`
Reset all state to initial values (clear list, page = 0, all toggle maps empty, `hasMore = true`).

---

## 4. Utility Functions

### 4.1 `getAssetUrl(relativeUrl)`

Reuse the existing utility from `question-flow.md` §4. Prepends the base media URL to relative asset paths.

### 4.2 `sortAssets(assets)`

Sort `QuestionAsset[]` by `order` (ascending). Already documented in `question-flow.md` §4.

### 4.3 Content Language Helpers

These are local functions used in the accordion component:

```ts
// Question text
const getQuestionText = (question: FlaggedQuestionInfo, language: string): string => {
  const original = question.question || question.text || '';
  if (!language || !question.translations) return original;
  const t = question.translations[language];
  if (t && typeof t === 'object') {
    return (t as any).question || (t as any).text || original;
  }
  return original;
};

// Option text
const getOptionLabel = (option: QuestionOption, language: string): string => {
  const original = option.text || '';
  if (!language || !option.translations) return original;
  const t = option.translations[language];
  if (t && typeof t === 'object' && 'text' in t) {
    return (t as any).text || original;
  }
  return original;
};

// Explanation text
const getExplanationText = (explanation: Explanation, language: string): string => {
  const original = explanation.text || '';
  if (!language || !explanation.translations) return original;
  const t = explanation.translations[language];
  if (t && typeof t === 'object' && 'text' in t) {
    return (t as any).text || original;
  }
  return original;
};

// Tip text
const getTipText = (tip: Tip, language: string): string => {
  const original = tip.text ?? tip.body ?? tip.title ?? '';
  if (!language || !tip.translations) return original;
  const t = tip.translations[language];
  if (t && typeof t === 'object') {
    return (t as any).tip ?? (t as any).text ?? (t as any).body ?? (t as any).title ?? original;
  }
  return original;
};
```

---

## 5. Stores to Read (External)

```ts
const { isAuthenticated, user } = useAuthStore();
const { language: globalLanguage, direction, setLanguage: setGlobalLanguage } = useContentLanguageStore();
```

- `user.userLanguages` → array of `UserLanguageInfo` for the language-switcher flag buttons.
- `user.subscription.withTranslation` → if `false`, hide the language switcher entirely.
- `direction` → `'ltr'` or `'rtl'`, applied to text elements.

---

## 6. Screen — `FlaggedQuestionsScreen`

### 6.1 Navigation Params

None.

### 6.2 Auth Guard

On mount, if `!isAuthenticated` → navigate to Login. Render nothing until authenticated.

### 6.3 Store Usage

```ts
const { page, hasMore, fetchFlaggedQuestions, reset } = useFlaggedQuestionsStore();
const { direction } = useContentLanguageStore();
```

### 6.4 Cleanup

On unmount (`useEffect` cleanup), call `reset()` to clear the store.

### 6.5 Event Handlers

#### `handlePreviousPage()`
If `page > 0` → `fetchFlaggedQuestions(page - 1)`.

#### `handleNextPage()`
If `hasMore` → `fetchFlaggedQuestions(page + 1)`.

### 6.6 Render Structure

```
SafeAreaView (dir={direction})
  ScrollView
    ┌─ Header Row
    │   ├─ Left: Flag icon (in rounded bg) + "Flagged Questions" title
    │   └─ Right: LanguageSwitcher component
    │
    ├─ FlaggedQuestionsList component
    │   (renders loading skeleton, empty state, or accordion list)
    │
    └─ Pagination Row (centered)
        ├─ "Previous" button (ChevronLeft icon + text)
        │   disabled when page === 0
        ├─ "Page {page + 1}" label
        └─ "Next" button (text + ChevronRight icon)
            disabled when !hasMore
```

---

## 7. Component — `FlaggedQuestionsList`

This is an inner component (or can be part of the screen).

### 7.1 Store Usage

```ts
const {
  flaggedQuestions,
  loading,
  expandedQuestionId,
  setExpandedQuestion,
  fetchFlaggedQuestions,
} = useFlaggedQuestionsStore();
```

### 7.2 `useEffect` — Initial Fetch

On mount, call `fetchFlaggedQuestions(0)`.

### 7.3 Render States

#### Loading (initial: `loading && flaggedQuestions.length === 0`)
Show 2 skeleton placeholder cards (animated pulse):
- Each: rounded card with a circle placeholder + 2 line placeholders.

#### Empty (`!loading && flaggedQuestions.length === 0`)
```
Centered column:
  ├─ Large Flag icon in muted background circle
  ├─ "No Flagged Questions" heading
  └─ "You haven't flagged any questions yet. Flag questions during practice to review them later." body text
```

#### Data Available
```
Vertical list (FlatList or ScrollView), spacing between items:
  For each flaggedQuestion:
    <FlaggedQuestionAccordion
      flaggedQuestion={flaggedQuestion}
      isExpanded={expandedQuestionId === flaggedQuestion.question.id}
      onToggle={() => {
        if (expandedQuestionId === flaggedQuestion.question.id)
          setExpandedQuestion(null);
        else
          setExpandedQuestion(flaggedQuestion.question.id);
      }}
    />

  If loading (next page load): centered spinner at bottom.
```

---

## 8. Component — `FlaggedQuestionAccordion`

### 8.1 Props

```ts
interface FlaggedQuestionAccordionProps {
  flaggedQuestion: FlaggedQuestionResponse;
  isExpanded: boolean;
  onToggle: () => void;
}
```

### 8.2 External Stores

```ts
const { language: globalLanguage, direction, setLanguage: setGlobalLanguage } = useContentLanguageStore();
const user = useAuthStore(s => s.user);
const languageFlags = user?.subscription?.withTranslation !== false
  ? (user?.userLanguages ?? [])
  : [];
```

### 8.3 Store Selectors (from `useFlaggedQuestionsStore`)

Read individually to minimize re-renders:
```ts
const showAnswer = useFlaggedQuestionsStore(s => s.showAnswer);
const showExplanation = useFlaggedQuestionsStore(s => s.showExplanation);
const showTips = useFlaggedQuestionsStore(s => s.showTips);
const explanations = useFlaggedQuestionsStore(s => s.explanations);
const tips = useFlaggedQuestionsStore(s => s.tips);
const toggleShowAnswer = useFlaggedQuestionsStore(s => s.toggleShowAnswer);
const toggleShowExplanation = useFlaggedQuestionsStore(s => s.toggleShowExplanation);
const toggleShowTips = useFlaggedQuestionsStore(s => s.toggleShowTips);
const removeFlag = useFlaggedQuestionsStore(s => s.removeFlag);
const fetchExplanation = useFlaggedQuestionsStore(s => s.fetchExplanation);
const fetchTips = useFlaggedQuestionsStore(s => s.fetchTips);
```

### 8.4 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `language` | `string` | `''` | Per-question content language (synced from globalLanguage) |
| `isRemoving` | `boolean` | `false` | Unflag in progress |
| `selectedOptionId` | `number \| undefined` | `undefined` | User's selected option (local answer attempt) |
| `modalImage` | `string \| null` | `null` | Full-screen image URL |

Also keep a ref: `hasAutoShownRef = useRef(false)` — prevents auto-show logic from re-triggering.

### 8.5 Derived Values

```ts
const { question, userAttempt } = flaggedQuestion;
const questionId = question.id;
const correctOption = question.options.find(opt => opt.isCorrect);
const isExplanationShown = showExplanation[questionId];
const isTipsShown = showTips[questionId];
const questionText = getQuestionText(question, language);
```

### 8.6 `useEffect` — Sync Language

When `globalLanguage` changes:
- If `globalLanguage` is truthy → set local `language = globalLanguage`.
- If empty → set local `language = ''`.

### 8.7 `useEffect` — Auto-show Explanation & Tips on Answer

When `selectedOptionId` changes to a defined value **and** `hasAutoShownRef.current` is false:
1. Set `hasAutoShownRef.current = true`.
2. If `!showExplanation[questionId]` → call `toggleShowExplanation(questionId)`.
3. If `!showTips[questionId]` → call `toggleShowTips(questionId)`.

This means: when the user first picks an option, explanation and tips are automatically revealed.

### 8.8 `useEffect` — Prefetch on Expand

When `isExpanded` becomes true:
- Call `fetchExplanation(questionId)` and `fetchTips(questionId)` in parallel.
- These are cache-aware (no-op if already fetched).

### 8.9 `useEffect` — Ensure Data on Panel Show

If `showTips[questionId]` is true but `tips[questionId]` is undefined → call `fetchTips(questionId)`.
Same for explanation.

### 8.10 Event Handlers

#### `handleSelectOption(optionId)`
Set `selectedOptionId = optionId`. Answer is locked after first selection (cannot change).

#### `handleUnflag()`
1. If `isRemoving` → return.
2. Set `isRemoving = true`.
3. Call `removeFlag(questionId)`.
4. On error: set `isRemoving = false`, show toast/alert.

#### `handleToggleExplanation()`
Call `toggleShowExplanation(questionId)`.

#### `handleToggleTips()`
Call `toggleShowTips(questionId)`.

#### `handleLanguageSelect(code, direction)`
1. Set local `language = code`.
2. Call `setGlobalLanguage(code, direction)` to sync globally.

### 8.11 Render Structure — Collapsed

```
Pressable (onPress={onToggle})
  Card (rounded, bordered)
    ├─ Status Icon (left)
    │   ├─ If userAttempt?.isCorrect === true → green CheckCircle
    │   ├─ If userAttempt?.isCorrect === false → red XCircle
    │   └─ If userAttempt === null → gray "?" circle
    │
    ├─ Text Block (center, flex-1)
    │   ├─ Question text (line-clamp 2, translated)
    │   └─ Category name (small, muted)
    │
    └─ Chevron icon (rotates 180° when expanded)
```

### 8.12 Render Structure — Expanded

When `isExpanded === true`, show additional content below the header:

```
Expanded Content (below collapsed header, separated by border)
│
├─ Language Switcher (if languageFlags.length > 0)
│   └─ Horizontal row of flag buttons (icon + short label)
│       Active button: highlighted (emerald bg + border)
│       Tapping sets local language + global language
│
├─ Question Assets (if question.assets.length > 0)
│   ├─ Sort assets via sortAssets()
│   ├─ Video assets → Video player (expo-av)
│   └─ Image assets → Grid layout
│       - 1 image: single column
│       - 2+ images: 2-column grid
│       - Each image: tappable → set modalImage for full-screen
│       - Caption below image (if present)
│
├─ Question Text (full, translated, dir-aware)
│
├─ OptionList
│   Props:
│     options: question.options
│     selectedOptionId: selectedOptionId
│     answerLocked: selectedOptionId !== undefined
│     correctOptionId: selectedOptionId !== undefined ? correctOption?.id : undefined
│     onSelectOption: handleSelectOption
│     getOptionLabel: (option) => getOptionLabel(option, language)
│
│   OptionList Behaviour:
│     - If ALL options have asset URLs → 2-column grid layout
│     - Otherwise → vertical list layout
│     - Each option is a button:
│         ├─ Indicator (checkbox): empty, check, or X
│         ├─ Option image (if present)
│         └─ Option text (translated)
│     - States per option:
│         - showAsCorrect: green border + bg (selected correct, or revealed correct)
│         - showAsIncorrect: red border + bg (selected incorrect)
│         - showNeutralSelected: emerald highlight (no isCorrect data)
│         - default: muted border
│     - Immediate feedback: when user selects an option and option.isCorrect
│       is a boolean, show green/red immediately.
│     - Reveal correct: if user selected wrong, highlight the correct option green.
│     - Once selectedOptionId is set, all options are disabled (answerLocked).
│     - Text direction: apply `direction` from content language store.
│
├─ Action Buttons Row (horizontal, wrapping)
│   ├─ "Explanation" / "Hide Explanation" toggle button
│   │   Active: blue bg + border
│   │   Icon: BookOpenText
│   ├─ "Tips" / "Hide Tips" toggle button
│   │   Active: amber bg + border
│   │   Icon: Lightbulb
│   ├─ "Unflag" button (red bg)
│   │   Icon: FlagOff
│   │   Shows "Removing..." when isRemoving
│   │   Disabled when isRemoving
│   └─ "Close" button (neutral)
│       Icon: X
│       Calls onToggle() to collapse
│
├─ Explanation Card (if isExplanationShown && explanations[questionId] exists)
│   ├─ Header: BookOpenText icon + "Explanation"
│   ├─ Explanation text (translated, rendered as HTML)
│   │   → Use react-native-render-html for HTML content
│   │   → Apply direction from content language store
│   └─ Explanation assets (if any):
│       ├─ Videos → Video player
│       └─ Images → grid, tappable for modal
│
├─ Tips Panel (if isTipsShown)
│   ├─ If tips[questionId] exists and length > 0:
│   │   └─ For each tip (sorted by displayOrder):
│   │       ├─ "Tip {N}" label
│   │       ├─ Tip text (translated, rendered as HTML)
│   │       ├─ Tip videos (if any)
│   │       └─ Tip images (if any, tappable for modal)
│   ├─ If tips[questionId] === undefined: "Loading tips..."
│   └─ If tips[questionId] is empty array: "No tips available for this question."
│
└─ Bottom Close Button (shown if explanation or tips are visible)
    └─ "Close" button aligned right, calls onToggle()
```

### 8.13 Image Modal

Same pattern as other screens (see `question-flow.md`):
- Full-screen `Modal` overlay with dark background.
- Close button (top-right, X icon).
- Centered image (resizeMode: contain).
- Tap background to dismiss.

---

## 9. API Endpoints Summary (Client Consumption Only)

| # | Method | Endpoint | When Called | Request | Response |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/flags?page={p}&size={s}` | Initial load + page change | Query params | `{ data: { content: FlaggedQuestionResponse[] } }` |
| 2 | `DELETE` | `/api/v1/flags/{questionId}` | Unflag button tap | — | `void` |
| 3 | `GET` | `/api/v1/questions/{questionId}/explanation` | On expand (prefetch) or toggle show | — | `{ data: Explanation }` |
| 4 | `GET` | `/api/v1/questions/{questionId}/tips` | On expand (prefetch) or toggle show | — | `{ data: Tip[] }` |

---

## 10. Navigation Flow

```
PracticeScreen (tab)
  └─ "Flagged Questions" card tap
      └─ FlaggedQuestionsScreen
          ├─ Pagination (stays on same screen, fetches new page)
          └─ Back → PracticeScreen
```

This is a single-screen feature. No sub-navigation.

---

## 11. Edge Cases

1. **No flagged questions:** Show empty state with icon + message + suggestion to flag questions during practice.

2. **Only one accordion open at a time:** When `setExpandedQuestion(id)` is called, any previously-expanded accordion automatically collapses (store holds a single `expandedQuestionId`).

3. **Optimistic unflag with rollback:** When unflagging, the item is immediately removed from the list. If the API call fails, it is re-inserted (rollback). Show an error alert on failure.

4. **Answer is locked after first selection:** Once `selectedOptionId` is set, the user cannot change their answer. All options become disabled. Immediate feedback (green/red) is shown based on `option.isCorrect`.

5. **Auto-show explanation + tips on answer:** When the user selects their first option, explanation and tips panels automatically open (if not already). This fires only once (`hasAutoShownRef`).

6. **Prefetch on expand:** When an accordion is expanded, explanation and tips are prefetched in parallel even before the user toggles those panels. This ensures instant display when panels are toggled.

7. **HTML content in explanations and tips:** Explanation text and tip text may contain HTML markup (bold, lists, links). Use `react-native-render-html` to render. Apply `direction` from the content language store.

8. **Language switching:** Both a global switcher (in the header, syncs all accordions via store) and per-accordion switches (syncs back to global). Switching language re-computes all translated text via `useMemo` / function params.

9. **Pagination edge:** `hasMore` is `true` while the returned page has `>= size` items. When fewer items are returned, `hasMore = false` and the "Next" button is disabled.

10. **Asset URLs:** Always resolve through `getAssetUrl()`.

11. **Cleanup on unmount:** `reset()` is called when the screen unmounts, clearing all cached data. This ensures fresh data on next visit.

12. **RTL support:** Apply `direction` to text containers. The OptionList component applies `dir` to its flex layout so indicator/text/status-icon order flips for RTL content.

13. **Loading tips/explanation while showing panel:** If the user toggles the panel open but data hasn't arrived yet, show a "Loading…" message. The `useEffect` that watches `showTips`/`showExplanation` ensures the fetch is triggered if data is missing.
