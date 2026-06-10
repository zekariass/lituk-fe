# Mobile Categories Page Implementation Requirements

## Overview

The Categories page (also known as Revision Start page) is the main entry point for users to browse and select practice categories. It displays a hierarchical list of categories and subcategories with progress tracking, language switching, and session management capabilities.

**Screen Name**: `Categories` or `RevisionStart`
**Reference Implementation**: `app/[locale]/practice/revision/page.tsx` (web version)

---

## Screen Purpose

1. Display top-level categories or subcategories based on navigation state
2. Show user progress for each category (questions attempted, accuracy, completion status)
3. Enable navigation between parent and child categories
4. Allow users to start or continue revision sessions for leaf categories
5. Provide language switching for translated content
6. Display locked/unlocked states based on subscription status
7. Show overall progress across all displayed categories

---

## Navigation Flow

### Entry Points
- From Home screen → Practice tab → Revision
- Navigation from other screens with route params

### Navigation Parameters
The screen should accept the following navigation params:
- `categoryId` (optional): ID of specific category to view (for deep linking)
- `parentCategoryId` (optional): ID of parent category to display its subcategories
- `licenceCategoryId` (optional): ID of licence category for filtering (defaults to user's selected licence category)

### Navigation Behavior
- **Root level**: Display all parent categories (categories without parentId). Screen is pushed onto navigation stack.
- **Subcategory level**: When `parentCategoryId` is provided as a param, display only subcategories of that parent. Screen is pushed onto stack with parent category info.
- **Leaf category auto-navigation**: If a leaf category is directly accessed via `categoryId` param, automatically initialize session and navigate to practice screen.
- **Back navigation**: When viewing subcategories, show back button in header. Pressing it pops the current screen to return to parent categories.
- **History navigation**: Leaf categories have a history icon. Pressing it navigates to the History screen with category and licence category IDs as params.

---

## Backend API Endpoints

### 1. Fetch Categories

**Endpoint**: `GET /api/v1/categories`

**Query Parameters**:
- `jurisdictionId` (optional): Filter by jurisdiction
- `includeStats` (boolean, default: true): Include user progress statistics
- `licenceCategoryId` (optional): Filter by licence category

**Response Structure**:
```typescript
{
  success: boolean;
  data: Category[];
  message?: string;
}
```

**Category Object Structure**:
```typescript
interface Category {
  id: number;
  code?: string;
  name: string;
  translations?: Record<string, Record<string, unknown>>;
  description?: string;
  parentId?: number;
  parentCategoryId?: number;
  parentCategoryName?: string;
  jurisdictionId: number;
  displayOrder: number;
  active: boolean;
  subCategories?: CategorySubCategory[];
  userStats?: CategoryUserStats;
  userProgress?: CategoryUserProgress;
  questionCount?: number;
  totalQuestions?: number;
  completedQuestions?: number;
  accuracy?: number;
  completedSessionIds?: string[];
  hasIncompleteSession?: boolean;
  isLocked?: boolean;
}
```

**CategorySubCategory Structure**:
```typescript
interface CategorySubCategory {
  id: number;
  name: string;
  translations?: Record<string, Record<string, unknown>>;
  active?: boolean;
  deletedAt?: string;
}
```

**CategoryUserStats Structure**:
```typescript
interface CategoryUserStats {
  totalQuestions: number;
  attemptedQuestions: number;
  correctQuestions: number;
  accuracyRate: number;
}
```

**CategoryUserProgress Structure**:
```typescript
interface CategoryUserProgress {
  sessionId?: string;
  totalQuestions?: number;
  attemptedQuestions: number;
  correctQuestions: number;
  flaggedQuestions?: number;
  averageTimeSeconds?: number;
  accuracyRate: number;
}
```

### 2. Initialize Revision Session

**Endpoint**: `POST /api/v1/revision/sessions`

**Request Body**:
```typescript
{
  categoryId: number;
  licenceCategoryId: number;
  restart: boolean;
}
```

**Response Structure**:
```typescript
{
  success: boolean;
  data: {
    sessionId: string;
    categoryName: string;
    lastQuestionAttemptedId?: number;
    allQuestionsAttempted: boolean;
    questions: Question[];
    sessions: RevisionSessionMeta[];
  };
}
```

---

## State Management Requirements

### Store: CategoryStore

**State Properties**:
- `categories`: Category[] - List of all categories
- `selectedCategory`: Category | null - Currently selected category
- `isLoading`: boolean - Loading state
- `error`: string | null - Error message

**Actions**:
- `fetchCategories(jurisdictionId?, includeStats?, licenceCategoryId?)`: Fetch categories from API
- `fetchCategoryById(id, licenceCategoryId?)`: Fetch single category by ID
- `selectCategory(category)`: Set selected category
- `getCategoryById(id)`: Get category from local state

### Store: RevisionStore

**State Properties**:
- `currentSession`: RevisionSession | null - Current active session
- `questions`: Question[] - Questions in current session
- `currentIndex`: number - Current question index
- `allQuestionsAttempted`: boolean - Whether all questions attempted
- `isLoading`: boolean - Loading state
- `error`: string | null - Error message

**Actions**:
- `initializeSession({ categoryId, licenceCategoryId, restart? })`: Initialize or resume session
- `resetSession()`: Clear session state

### Store: AuthStore

**Required State**:
- `isAuthenticated`: boolean
- `selectedLicenceCategoryId`: number | null
- `user`: User object with:
  - `subscription`: UserSubscriptionInfo
  - `userLanguages`: UserLanguageInfo[]

### Store: ContentLanguageStore

**State Properties**:
- `language`: string - Currently selected content language code
- `direction`: 'ltr' | 'rtl' - Text direction based on language

**Actions**:
- `setLanguage(code, direction)`: Set active content language

---

## UI Components Required

### 1. CategoryCard Component

**Purpose**: Display individual category with progress and metadata

**Props**:
```typescript
interface CategoryCardProps {
  hasSubCategories: boolean;
  subCategoryCount: number;
  totalQuestions: number;
  attemptedQuestions: number;
  progressPercent: number;
  accuracyPercent: number | undefined;
  displayName: string;
  categoryId: number;
  licenceCategoryId: number | undefined;
  isLocked: boolean;
  onPress?: () => void; // For leaf categories
}
```

**Visual Elements**:
- Icon bubble (Layers for subcategories, BookOpen for leaf categories, CheckCircle2 for completed)
- Category name (translated based on selected language)
- Subcategory count OR progress bar (for leaf categories)
- History icon (only for leaf categories)
- Lock icon OR ChevronRight (based on locked state)
- Hover/press effects
- Completion state styling (green tint when 100% complete)

**States**:
- Default
- Completed (progressPercent === 100)
- Started (progressPercent > 0 && < 100)
- Locked
- Pressed/Active

### 2. LanguageSwitcher Component

**Purpose**: Allow switching between available content languages

**Props**:
```typescript
interface LanguageSwitcherProps {
  activeLang: string;
  languages: UserLanguageInfo[];
  onChange: (code: string) => void;
  direction: 'ltr' | 'rtl';
}
```

**Visual Elements**:
- Button for each available language
- Flag icon for each language
- Language short display name (e.g., "AM", "OR")
- Active state highlighting
- RTL/LTR layout support

**Behavior**:
- Only render if languages are available
- Only show languages if user has translation subscription
- Update content language store on selection

### 3. ProgressBar Component

**Purpose**: Display progress with accuracy indicator

**Props**:
```typescript
interface ProgressBarProps {
  ratio: string; // e.g., "5 / 20"
  progress: number; // 0-100
  accuracy?: number; // 0-100
  height: number;
}
```

**Visual Elements**:
- Background track
- Progress fill bar
- Accuracy indicator (color-coded)
- Ratio text label

### 4. OverallProgress Component

**Purpose**: Display summary progress across all categories

**Visual Elements**:
- Circular progress ring with gradient
- Percentage in center
- "X of Y complete" text
- "Z remaining" text

### 5. ErrorBanner Component

**Purpose**: Display error messages

**Props**:
```typescript
interface ErrorBannerProps {
  message: string;
}
```

**Visual Elements**:
- AlertCircle icon
- Error message text
- Red/rose color scheme

### 6. LoadingSkeleton Component

**Purpose**: Placeholder during data loading

**Visual Elements**:
- Card-like structure
- Animated shimmer effect
- Matches CategoryCard layout

### 7. EmptyState Component

**Purpose**: Display when no categories available

**Visual Elements**:
- FolderOpen icon
- Title text
- Description text

---

## Screen Layout

### Header Section
- Back button (when viewing subcategories)
- Page title (translated based on navigation level)
- Subtitle (contextual description)
- Language switcher (top-right)

### Progress Section
- Overall progress indicator
- Shows only after categories are loaded
- Hidden during loading and error states

### Error Section
- Error banner for missing licence category
- Error banner for API errors
- Displayed when applicable

### Loading Section
- Grid of skeleton cards (6 items)
- Displayed during initial load

### Empty Section
- Empty state component
- Displayed when no categories available

### Categories Grid
- Single column on mobile
- Two columns on tablet
- Three columns on desktop
- Animated card entry with staggered delays

### Session Status
- Loading indicator during session initialization
- Error banner if session initialization fails

---

## User Interactions

### Category Card Press
- **Parent category**: Push new instance of Categories screen onto navigation stack with `parentCategoryId` param
- **Leaf category**: Initialize session and navigate to Practice screen with session data
- **Locked category**: Show subscription prompt or navigate to pricing screen (optional - not implemented in web version)

### Back Button Press
- Use React Navigation's header back button behavior
- Automatically pops the current screen from the navigation stack
- If at root level, navigates to previous screen in stack (e.g., Practice tab or Home)

### Language Switch
- Update content language store
- Update text direction (LTR/RTL)
- Re-render all translatable text
- Persist selection

### History Icon Press
- Navigate to History screen using React Navigation
- Pass `categoryId` and `licenceCategoryId` as route params

### Pull to Refresh
- Re-fetch categories from API
- Update local state
- Maintain scroll position

---

## Data Flow

### Initial Load
1. Check authentication (navigate to Auth/Login screen if not authenticated)
2. Get `licenceCategoryId` from navigation params or auth store
3. Call `fetchCategories` with licenceCategoryId
4. Update categories in store
5. Calculate overall progress
6. Render category cards

### Subcategory Navigation
1. User presses parent category card
2. Push new Categories screen onto navigation stack with `parentCategoryId` param
3. New screen instance filters categories by parentCategoryId from params
4. Render subcategory cards
5. Update header with parent category name

### Leaf Category Session Start
1. User presses leaf category card
2. Check for incomplete session or no completed sessions
3. Call `initializeSession` with categoryId and licenceCategoryId
4. If all questions attempted → navigate to History screen
5. Otherwise → navigate to Practice screen with session data

### Language Change
1. User selects language from switcher
2. Update content language store
3. Re-render all category names using translations
4. Update text direction if needed

---

## Edge Cases & Error Handling

### Authentication
- Redirect to login if not authenticated
- Show loading state during auth check

### Missing Licence Category
- Display error banner if licenceCategoryId is not available
- Prevent category fetching

### API Errors
- Display error banner with message
- Allow retry via pull-to-refresh
- Show empty state if categories array is empty

### Empty Categories
- Display empty state component
- Show appropriate message

### Locked Categories
- Display lock icon instead of chevron
- Check subscription status
- Show subscription prompt on press (optional)

### Translation Fallback
- If translation not available for selected language, use original text
- Handle missing translation keys gracefully

### Session Initialization Failure
- Display error banner
- Allow retry
- Keep user on categories screen

### Network Issues
- Show loading state during requests
- Timeout handling
- Offline handling (optional - for future)

---

## Mobile-Specific Considerations

### Responsive Design
- Single column layout on mobile (width < 640px)
- Full-width cards on mobile with no side borders
- Touch-friendly tap targets (minimum 44x44px)
- Proper spacing for touch interactions

### Performance
- Lazy load category images (if any)
- Optimize re-renders with memoization
- Debounce rapid language switches
- Cache API responses

### Accessibility
- Screen reader support for all interactive elements
- Proper ARIA labels
- Keyboard navigation support
- High contrast mode support
- Dynamic type support

### Platform-Specific
- iOS: Use system back button behavior
- Android: Use hardware back button
- Safe area handling for notched devices
- Status bar color adaptation

### Navigation
- Use React Navigation stack navigator for screen transitions
- Proper back button handling (both header back and hardware back on Android)
- Deep link support for category references via navigation params
- Transition animations between screens using React Navigation's built-in transitions

### Storage
- Persist selected language in AsyncStorage
- Cache categories locally for offline access (optional)
- Sync progress when back online

---

## Translation Keys

The following translation keys are used from `revisionStartPage` namespace:

- `title`: Main page title
- `subtitle`: Page subtitle
- `backToCategories`: Back button text
- `subcategorySubtitle`: Subcategory page subtitle with category name
- `noCategoriesTitle`: Empty state title
- `noCategoriesDescription`: Empty state description
- `missingLicenceCategory`: Error message for missing licence category

---

## Type Definitions

### UserLanguageInfo
```typescript
interface UserLanguageInfo {
  id: number;
  jurisdictionId: number;
  jurisdictionCode: string;
  language: {
    id: number;
    code: string;
    name: string;
    displayName: string;
    shortDisplayName: string;
    flagUrl: string;
    direction: string;
  };
}
```

### UserSubscriptionInfo
```typescript
interface UserSubscriptionInfo {
  isActive: boolean;
  type: string;
  status: string;
  expiresAt: string;
  withTranslation: boolean;
}
```

---

## Implementation Checklist

- [ ] Set up screen with React Navigation
- [ ] Implement CategoryStore with Zustand
- [ ] Implement ContentLanguageStore with Zustand
- [ ] Create CategoryCard component
- [ ] Create LanguageSwitcher component
- [ ] Create ProgressBar component
- [ ] Create OverallProgress component
- [ ] Create ErrorBanner component
- [ ] Create LoadingSkeleton component
- [ ] Create EmptyState component
- [ ] Implement category fetching logic
- [ ] Implement session initialization logic
- [ ] Implement navigation between parent/child categories
- [ ] Implement language switching with translation
- [ ] Implement progress calculation
- [ ] Implement locked/unlocked state handling
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add RTL/LTR support
- [ ] Test on different screen sizes
- [ ] Test accessibility
- [ ] Add unit tests
- [ ] Add E2E tests

---

## Notes

- The web version uses Next.js with App Router, but mobile implementation should use React Navigation
- Translation system in web uses next-intl, mobile should use i18next or similar
- Icons in web use lucide-react, mobile should use react-native-vector-icons or similar
- Styling in web uses Tailwind CSS, mobile should use StyleSheet or NativeWind
- Image loading in web uses next/image, mobile should use react-native-fast-image
- Consider using Expo for easier cross-platform development
