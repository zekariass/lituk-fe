# Traffic Signs — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screens, components, Zustand store, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.**
> Do NOT include any Next.js routes, imports, or web-specific code.

---

## 1. Overview — Screens to Create

| # | File | Purpose |
|---|---|---|
| 1 | `src/screens/TrafficSignCategoriesScreen.tsx` | Lists all traffic-sign categories for the user's jurisdiction |
| 2 | `src/screens/TrafficSignDetailScreen.tsx` | Shows signs within a category one-at-a-time with swipe/tap navigation, description, and asset gallery |

---

## 2. Types — File to Create

Create `src/types/traffic-signs.ts` (or add to shared types).

```ts
// ── Asset ────────────────────────────────────────────────────────────────

export interface TrafficSignAsset {
  url: string;
  type: string;          // "image", "video", etc.
  contentType: string;   // MIME e.g. "image/png", "video/mp4"
  size: number;
  filename: string;
  alt?: string | null;
  order?: number | null;
  caption?: string | null;
  uploadedAt: string;
}

// ── Translations ─────────────────────────────────────────────────────────

export interface TrafficSignTranslations {
  [languageCode: string]: {
    name?: string;
    description?: string;
    caption?: string;
  };
}

// ── Category ─────────────────────────────────────────────────────────────

export interface TrafficSignCategory {
  id: number;
  jurisdictionId: number;
  name: string;
  description: string;
  asset?: TrafficSignAsset;       // representative image for the category
  translations: TrafficSignTranslations;
  isActive: boolean;
}

// ── Sign ─────────────────────────────────────────────────────────────────

export interface TrafficSign {
  id: number;
  categoryId: number;
  description: string;            // may contain HTML
  translations: TrafficSignTranslations;
  signAsset: TrafficSignAsset;    // the primary sign image
  additionalAssets: TrafficSignAsset[];   // diagrams, variants, etc.
  realLifeAssets: TrafficSignAsset[];     // real-life photos
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Paginated response ───────────────────────────────────────────────────

export interface TrafficSignsPage {
  content: TrafficSign[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
```

---

## 3. Zustand Store — `useTrafficSignsStore`

Create `src/store/traffic-signs-store.ts`.

### 3.1 State Shape

```ts
interface TrafficSignsState {
  // Categories list (screen 1)
  categories: TrafficSignCategory[];

  // Signs for current category (screen 2)
  signs: TrafficSign[];
  currentCategoryId: number | null;
  currentSignIndex: number;
  currentPage: number;
  totalPages: number;

  // Shared
  isLoading: boolean;
  error: string | null;

  // Actions
  setCategories: (categories: TrafficSignCategory[]) => void;
  setSigns: (signs: TrafficSign[], page: number, totalPages: number) => void;
  appendSigns: (signs: TrafficSign[], page: number, totalPages: number) => void;
  setCurrentCategoryId: (categoryId: number) => void;
  setCurrentSignIndex: (index: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;

  // Computed / helpers
  getCurrentSign: () => TrafficSign | null;
  hasNextSign: () => boolean;
  hasPreviousSign: () => boolean;
  nextSign: () => void;
  previousSign: () => void;
}
```

### 3.2 Action Behaviours

#### `setCategories(categories)`
Replace `categories` array.

#### `setSigns(signs, page, totalPages)`
Replace `signs`, set `currentPage = page`, `totalPages`, **reset `currentSignIndex = 0`**.

#### `appendSigns(signs, page, totalPages)`
**Append** new signs to existing `signs` array. Update `currentPage` and `totalPages`. Do NOT reset `currentSignIndex`.

#### `setCurrentCategoryId(categoryId)`
Set `currentCategoryId = categoryId`, reset `currentSignIndex = 0`.

#### `setCurrentSignIndex(index)`
Set `currentSignIndex = index`.

#### `setIsLoading(isLoading)` / `setError(error)`
Simple setters.

#### `reset()`
Reset `signs = []`, `currentCategoryId = null`, `currentSignIndex = 0`, `currentPage = 0`, `totalPages = 0`, `error = null`. **Do NOT clear `categories`** (they persist across navigations).

#### `getCurrentSign()`
Return `signs[currentSignIndex]` or `null`.

#### `hasNextSign()`
Return `currentSignIndex < signs.length - 1 || currentPage < totalPages - 1`.

#### `hasPreviousSign()`
Return `currentSignIndex > 0`.

#### `nextSign()`
If `currentSignIndex < signs.length - 1` → increment `currentSignIndex`.

#### `previousSign()`
If `currentSignIndex > 0` → decrement `currentSignIndex`.

---

## 4. Utility Functions

### 4.1 `getAssetUrl(relativeUrl)`

Reuse the existing utility (see `question-flow.md` §4). Prepends the base media URL.

### 4.2 Content Language Helpers (local to screens)

```ts
const getCategoryName = (category: TrafficSignCategory, selectedLanguage: string): string => {
  if (!selectedLanguage || selectedLanguage === 'en' || !category.translations)
    return category.name;
  return category.translations[selectedLanguage]?.name || category.name;
};

const getCategoryDescription = (category: TrafficSignCategory, selectedLanguage: string): string => {
  if (!selectedLanguage || selectedLanguage === 'en' || !category.translations)
    return category.description;
  return category.translations[selectedLanguage]?.description || category.description;
};

const getSignDescription = (sign: TrafficSign, selectedLanguage: string): string => {
  if (!selectedLanguage || selectedLanguage === '' || !sign.translations)
    return sign.description;
  const translation = sign.translations[selectedLanguage];
  if (translation && typeof translation.description === 'string')
    return translation.description;
  return sign.description;
};
```

---

## 5. External Stores to Read

```ts
const { user } = useAuthStore();
const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore();
```

- `user.activeJurisdictionId` → required to fetch categories.
- `user.userLanguages` → language-switcher flag buttons.
- `user.subscription.withTranslation` → if `false`, hide language switcher.

---

## 6. Screen 1 — `TrafficSignCategoriesScreen`

### 6.1 Navigation Params

None.

### 6.2 Store Usage

```ts
const { user } = useAuthStore();
const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore();
const {
  categories, setCategories, isLoading, setIsLoading, error, setError,
} = useTrafficSignsStore();
```

Derived:
```ts
const languageFlags = user?.subscription?.withTranslation !== false
  ? (user?.userLanguages ?? []) : [];
const jurisdictionId = user?.activeJurisdictionId;
```

### 6.3 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| (none needed beyond store) | — | — | — |

### 6.4 `useEffect` — Fetch Categories (on mount / when jurisdictionId changes)

```ts
if (!jurisdictionId) return;
setIsLoading(true);
setError(null);
// GET /api/v1/traffic-sign-categories/jurisdiction/{jurisdictionId}
const data = await api.get(`/api/v1/traffic-sign-categories/jurisdiction/${jurisdictionId}`);
setCategories(data);  // data is TrafficSignCategory[]
setIsLoading(false);
// On error: setError(message), setIsLoading(false)
```

### 6.5 Event Handlers

#### `handleCategoryPress(categoryId)`
Navigate to `TrafficSignDetailScreen` with `{ categoryId }`.

#### `handleLanguageSelect(code, direction)`
Call `setLanguage(code, direction)`.

### 6.6 Render States

#### Loading (`isLoading`)
Centered spinner + "Loading categories…"

#### Error (`error && !isLoading`)
```
Centered column:
  ├─ AlertCircle icon in destructive/red bg
  ├─ "Couldn't load categories" heading
  ├─ Error message text
  └─ "Retry" button → re-fetch
```

#### Empty (`!isLoading && !error && categories.length === 0`)
```
Centered column:
  ├─ TriangleAlert icon in muted bg
  ├─ "No signs available yet" heading
  └─ "Traffic signs for your jurisdiction will appear here once they're added." body
```

#### Data Available
Full UI below.

### 6.7 Render Structure — Data Available

```
SafeAreaView (dir={direction})
  ScrollView
    ┌─ Header Row
    │   ├─ Left column:
    │   │   ├─ "Traffic Signs" title (large, bold)
    │   │   └─ "Learn signs and their meanings for your jurisdiction" subtitle
    │   └─ Right: Language Switcher (if languageFlags.length > 0)
    │       └─ Horizontal row of flag buttons
    │
    ├─ Divider line
    │
    └─ Categories Grid / List
        └─ For each category:
            Pressable (onPress → handleCategoryPress(category.id))
              ┌─ Category Card (rounded, bordered)
              │   ├─ Category Asset (left or top):
              │   │   ├─ If category.asset exists and is image:
              │   │   │   → Image (rounded, cover, ~80×80)
              │   │   ├─ If category.asset exists and is video:
              │   │   │   → Video icon placeholder
              │   │   └─ If no asset:
              │   │       → TriangleAlert icon placeholder
              │   │
              │   ├─ Text Block (flex-1):
              │   │   ├─ Category name (bold, translated via getCategoryName)
              │   │   ├─ Category description (muted, translated via getCategoryDescription)
              │   │   │   (only if description exists)
              │   │   └─ "View All Signs →" link text
              │   │
              │   └─ (optional) ChevronRight or ArrowRight indicator
              └─
```

**Layout note:** On mobile, use a single-column vertical list. Each card should have the asset on top (centered) and text below, or asset on the left and text on the right — matching the current responsive behaviour.

---

## 7. Screen 2 — `TrafficSignDetailScreen`

This screen displays individual traffic signs one at a time, with swipe navigation between signs.

### 7.1 Navigation Params

```ts
type TrafficSignDetailParams = {
  categoryId: number;
};
```

### 7.2 Store Usage

```ts
const {
  signs,
  currentSignIndex,
  currentPage,
  totalPages,
  isLoading,
  error,
  setSigns,
  appendSigns,
  setCurrentCategoryId,
  nextSign,
  previousSign,
  setIsLoading,
  setError,
  getCurrentSign,
} = useTrafficSignsStore();

const { user } = useAuthStore();
const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore();
```

### 7.3 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `lightboxAsset` | `TrafficSignAsset \| null` | `null` | Full-screen image/lightbox |
| `isLoadingMore` | `boolean` | `false` | Loading next page of signs |
| `viewMode` | `'card' \| 'immersive'` | `'card'` | Display mode toggle |
| `galleryTab` | `'additional' \| 'reallife'` | `'additional'` | Active tab in asset gallery |

### 7.4 Constants

```ts
const PAGE_SIZE = 10;
```

### 7.5 Derived Values

```ts
const currentSign = getCurrentSign();
const canGoNext = currentSignIndex < signs.length - 1 || currentPage < totalPages - 1;
const canGoPrevious = currentSignIndex > 0;
const progress = signs.length > 0 ? ((currentSignIndex + 1) / signs.length) * 100 : 0;
const additionalAssets = currentSign?.additionalAssets ?? [];
const realLifeAssets = currentSign?.realLifeAssets ?? [];
const hasAnyAssets = additionalAssets.length > 0 || realLifeAssets.length > 0;
const languageFlags = user?.subscription?.withTranslation !== false
  ? (user?.userLanguages ?? []) : [];
```

### 7.6 `useEffect` — Initial Fetch (on mount)

```ts
if (!categoryId) return;
setCurrentCategoryId(categoryId);
setIsLoading(true);
setError(null);
// GET /api/v1/traffic-signs/category/{categoryId}?page=0&size=10
const data = await api.get(`/api/v1/traffic-signs/category/${categoryId}`, {
  params: { page: 0, size: PAGE_SIZE }
});
// data: TrafficSignsPage
setSigns(data.content, data.page.number, data.page.totalPages);
setIsLoading(false);
// On error: setError(message), setIsLoading(false)
```

### 7.7 `fetchNextPage` (callback)

```ts
const fetchNextPage = async () => {
  if (isLoadingMore || currentPage >= totalPages - 1) return;
  setIsLoadingMore(true);
  // GET /api/v1/traffic-signs/category/{categoryId}?page={currentPage+1}&size=10
  const data = await api.get(...);
  appendSigns(data.content, data.page.number, data.page.totalPages);
  setIsLoadingMore(false);
  // On error: log, setIsLoadingMore(false)
};
```

### 7.8 `useEffect` — Auto-select Gallery Tab

When `currentSign` changes:
- If `additionalAssets.length > 0` → `setGalleryTab('additional')`.
- Else if `realLifeAssets.length > 0` → `setGalleryTab('reallife')`.

### 7.9 Event Handlers

#### `handleNext()`
1. If `currentSignIndex < signs.length - 1` → call `nextSign()`.
2. Else if `currentPage < totalPages - 1` → call `fetchNextPage()`, then `nextSign()`.

#### `handlePrevious()`
If `canGoPrevious` → call `previousSign()`.

#### `handleBackToCategories()`
Navigate back to `TrafficSignCategoriesScreen`.

#### `handleImagePress(asset)`
Set `lightboxAsset = asset` to open the full-screen image viewer.

#### `handleCloseLightbox()`
Set `lightboxAsset = null`.

#### `handleViewModeToggle(mode)`
Set `viewMode = mode`.

#### `handleGalleryTabSwitch(tab)`
Set `galleryTab = tab`.

#### Swipe Gesture Navigation
Implement **horizontal swipe** detection on the main content area:
- Swipe left (distance > 50px) + `canGoNext` → `handleNext()`.
- Swipe right (distance > 50px) + `canGoPrevious` → `handlePrevious()`.

Use React Native's `PanResponder` or a gesture library (e.g. `react-native-gesture-handler`).

### 7.10 Render States

#### Loading (`isLoading`)
```
Centered column:
  ├─ Shield icon in accent bg
  ├─ "Loading signs…" text
  └─ Animated progress bar
```

#### Error (`error`)
```
Centered column:
  ├─ AlertCircle icon
  ├─ "Failed to load signs" heading
  ├─ Error message
  ├─ "Back" button → TrafficSignCategoriesScreen
  └─ "Retry" button → re-fetch
```

#### No Current Sign (`!currentSign`)
Return null / navigate back.

### 7.11 Render Structure — Main View

```
SafeAreaView (dir={direction}, swipe gestures attached)
  ScrollView
    ┌─ Top Bar (sticky or fixed)
    │   ├─ Row 1:
    │   │   ├─ Left: "← Categories" back button
    │   │   ├─ Center: Counter "{currentSignIndex + 1} / {signs.length}"
    │   │   │   (current number in accent color, total in muted)
    │   │   └─ Right: View Mode Toggle
    │   │       ├─ "Card" button (Grid3x3 icon)
    │   │       └─ "Immersive" button (Eye icon)
    │   │       Active mode: highlighted bg + accent color
    │   │
    │   └─ Row 2: Language Switcher (if languageFlags.length > 0)
    │       └─ Horizontal row of flag buttons
    │
    ├─ Progress Bar (full-width, thin)
    │   └─ Fill width = progress% (gradient from accent to gold)
    │       Animated transition on width change
    │
    ├─ Combined Sign + Description Card
    │   ├─ Sign Visual Area (top half)
    │   │   ├─ "SIGN #{currentSignIndex + 1}" badge (small, uppercase)
    │   │   └─ Sign Image (centered)
    │   │       src: getAssetUrl(currentSign.signAsset.url)
    │   │       - Card mode: contained size (~200px)
    │   │       - Immersive mode: larger (~300px)
    │   │
    │   ├─ Divider line
    │   │
    │   └─ Description Area (bottom half)
    │       ├─ "EXPLANATION" label (small, uppercase, with decorative line)
    │       └─ Description HTML content:
    │           getSignDescription(currentSign, selectedLanguage)
    │           → Render as HTML using react-native-render-html
    │           → Apply text direction from content language store
    │
    ├─ Asset Gallery (only if hasAnyAssets)
    │   ├─ Tab Bar:
    │   │   ├─ "Additional" tab (if additionalAssets.length > 0)
    │   │   │   └─ Label + count badge
    │   │   └─ "Real Life" tab (if realLifeAssets.length > 0)
    │   │       └─ Label + count badge
    │   │   Active tab: highlighted style
    │   │
    │   └─ Asset Grid (2-column grid):
    │       For each asset in the active tab's array:
    │         ├─ If video (contentType starts with "video/"):
    │         │   → Video player component (expo-av)
    │         │   → "VIDEO" badge overlay
    │         └─ If image:
    │             ├─ Image (rounded, object-cover)
    │             │   Tappable → handleImagePress(asset)
    │             ├─ Loading spinner overlay (while image loads)
    │             ├─ "Enlarge" overlay on press/hover
    │             └─ Index badge (e.g. "01", "02") in corner
    │
    ├─ Navigation Row
    │   ├─ "Prev" button (ChevronLeft + text)
    │   │   Disabled when !canGoPrevious
    │   │
    │   ├─ Center: Dot indicators
    │   │   └─ Up to 9 dots, active dot highlighted
    │   │       If signs.length > 9: show "+{N}" label
    │   │
    │   └─ "Next" button (text + ChevronRight)
    │       Disabled when !canGoNext || isLoadingMore
    │       If isLoadingMore: show spinner + "Loading"
    │
    └─ (Footer hint — skip on mobile, keyboard shortcuts are web-only)

Lightbox Modal (when lightboxAsset is not null):
  Full-screen overlay, dark background
  ├─ Close button (top-right, X icon)
  ├─ Centered image: getAssetUrl(lightboxAsset.url)
  │   resizeMode: contain
  └─ Tap background to dismiss
```

---

## 8. API Endpoints Summary (Client Consumption Only)

| # | Method | Endpoint | When Called | Request | Response |
|---|---|---|---|---|---|
| 1 | `GET` | `/api/v1/traffic-sign-categories/jurisdiction/{jurisdictionId}` | CategoriesScreen mount | — | `TrafficSignCategory[]` |
| 2 | `GET` | `/api/v1/traffic-signs/category/{categoryId}?page={p}&size={s}` | DetailScreen mount + next page | Query params | `TrafficSignsPage` |

---

## 9. Navigation Flow

```
PracticeScreen (tab)
  └─ "Traffic Signs" card tap
      └─ TrafficSignCategoriesScreen
          └─ Category card tap (categoryId)
              └─ TrafficSignDetailScreen (categoryId)
                  ├─ Swipe / Next / Prev → navigate between signs (same screen)
                  ├─ Auto-fetch next page when reaching end of current page
                  └─ "← Categories" back button → TrafficSignCategoriesScreen
```

---

## 10. Edge Cases

1. **No `jurisdictionId`:** If `user.activeJurisdictionId` is undefined, do not fetch categories. The list will remain empty (show empty state or prompt user to set jurisdiction).

2. **No categories:** Show empty state: "No signs available yet."

3. **Category has no signs (empty page):** `currentSign` will be `null` — render nothing or show a "No signs in this category" message.

4. **Paginated sign loading:** Signs are loaded page-by-page (`PAGE_SIZE = 10`). When the user navigates past the last sign in the current page and more pages exist, `fetchNextPage` is called automatically. New signs are **appended** (not replaced), so the user can freely navigate backwards.

5. **View modes:**
   - **Card** (default): sign image is moderately sized with description below.
   - **Immersive**: sign image is larger, layout is narrower/more focused.
   Mobile should support both — the main difference is the sign image size.

6. **HTML in descriptions:** Sign descriptions may contain HTML (bold, lists, paragraphs). Use `react-native-render-html` to render. Apply `direction` from content language store.

7. **Asset gallery tabs:** Auto-select the first available tab when the current sign changes. If only one type of assets exists, only show that tab.

8. **Lightbox / full-screen image:** Tapping any gallery image opens a full-screen modal. Close via X button or tap on the background.

9. **Swipe navigation:** Horizontal swipe left/right on the main content area navigates between signs. Minimum swipe distance: 50px. Do not interfere with vertical scrolling.

10. **Loading more indicator:** When fetching the next page of signs, the "Next" button shows a spinner and "Loading" text, and is disabled until the fetch completes.

11. **RTL support:** Apply `direction` to the root container and text elements. Navigation chevrons should visually flip in RTL mode.

12. **Asset URL resolution:** All image/video URLs must go through `getAssetUrl()`.

13. **Video assets:** Use `expo-av` Video component for video playback. Show a "VIDEO" badge overlay to distinguish from images in the gallery grid.

14. **Dot indicators overflow:** Show at most 9 dots. If more signs exist, append a "+N" label after the last dot.

15. **Category asset in list:** Some categories may not have an asset. Show a placeholder icon (e.g. TriangleAlert) when `category.asset` is undefined.
