# Profile — React Native (Expo) Implementation Spec

> **Audience:** Windsurf agent implementing the React Native mobile app.
> This specifies **only what the mobile app must implement** — screens, components, Zustand stores, local state, user interactions, and navigation.
> The backend already exists. **Do NOT create any backend code.**
> Do NOT include any Next.js routes, imports, or web-specific code.

---

## 1. Overview — Screens to Create

| # | File | Purpose |
|---|---|---|
| 1 | `src/screens/ProfileScreen.tsx` | Main profile: identity card, subscription, jurisdictions, languages, logout |
| 2 | `src/screens/ManageJurisdictionsScreen.tsx` | Full CRUD for user jurisdictions with add dialog |
| 3 | `src/screens/SettingsScreen.tsx` | Theme, notifications, learning prefs, subscription cancellation |

---

## 2. Types

Reuse shared types in `src/types/index.ts`. The key interfaces:

```ts
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

export interface ActiveJurisdiction {
  id: number;
  code: string;
  name: string;
  countryCode: string;
  regionCode?: string | null;
  country?: Country;
}

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

export interface UserJurisdiction {
  id: number;
  jurisdictionId: number;
  jurisdiction: Jurisdiction;
  jurisdictionName: string;
  countryName: string;
  isActive: boolean;
  hasActiveEntitlement: boolean;
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

export interface UserSetting {
  name: string;
  value: string;
}

export interface EntitlementDetails {
  id: number;
  jurisdictionId: number;
  purchaseType: string;
  billingPeriod: string;
  status: 'active' | 'past_due' | 'canceled' | 'expired';
  startsAt: string;
  expiresAt: string;
  daysRemaining: number;
  autoRenew: boolean;
  amount: number;
  currency: string;
  canceledAt?: string;
  localPriceCode: string;
  saleTypeApplied: string;
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

export interface SubscriptionCancelRequest {
  cancelAtPeriodEnd: boolean;
  cancellationReason?: string;
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
```

---

## 3. Zustand Stores

### 3.1 `useUserStore` — User Jurisdictions & Settings

Port from `lib/store/user-store.ts`.

```ts
interface UserState {
  jurisdictions: UserJurisdiction[];
  settings: Record<string, string>;
  isLoading: boolean;
  error: string | null;

  fetchJurisdictions: () => Promise<void>;
  addJurisdiction: (jurisdictionId: number) => Promise<void>;
  removeJurisdiction: (id: number) => Promise<void>;
  activateJurisdiction: (id: number) => Promise<void>;

  fetchSettings: () => Promise<void>;
  updateSetting: (name: string, value: string) => Promise<void>;
  deleteSetting: (name: string) => Promise<void>;
}
```

**Action Behaviours:**

| Action | Endpoint | Behaviour |
|---|---|---|
| `fetchJurisdictions` | `GET /api/v1/users/me/jurisdictions` | Replace `jurisdictions` array |
| `addJurisdiction(jurisdictionId)` | `POST /api/v1/users/me/jurisdictions` body: `{ jurisdictionId }` | Re-fetches list after success |
| `removeJurisdiction(id)` | `DELETE /api/v1/users/me/jurisdictions/{id}` | Re-fetches list after success |
| `activateJurisdiction(id)` | `PATCH /api/v1/users/me/jurisdictions/{id}/activate` | Re-fetches list after success |
| `fetchSettings` | `GET /api/v1/users/me/settings` | Map `UserSetting[]` to `Record<string,string>` |
| `updateSetting(name, value)` | `PUT /api/v1/users/me/settings/{name}` body: `{ value }` | Optimistic update in settings map |
| `deleteSetting(name)` | `DELETE /api/v1/users/me/settings/{name}` | Remove key from settings map |

All actions set `isLoading = true` before and `false` after. On error, set `error`.

### 3.2 `useComplianceStore` — Countries & Available Jurisdictions

Port from `lib/store/compliance-store.ts`.

```ts
interface ComplianceState {
  countries: Country[];
  jurisdictions: Jurisdiction[];      // available jurisdictions (for add dialog)
  selectedCountry: Country | null;
  selectedJurisdiction: Jurisdiction | null;
  isLoading: boolean;
  error: string | null;

  fetchCountries: (activeOnly?: boolean) => Promise<void>;
  fetchJurisdictions: (countryId?: number, activeOnly?: boolean) => Promise<void>;
  selectCountry: (country: Country | null) => void;
  selectJurisdiction: (jurisdiction: Jurisdiction | null) => void;
  reset: () => void;
}
```

**Action Behaviours:**

| Action | Endpoint | Behaviour |
|---|---|---|
| `fetchCountries(activeOnly=true)` | `GET /api/v1/countries?active=true` | Replace `countries` array |
| `fetchJurisdictions(countryId, activeOnly)` | `GET /api/v1/jurisdictions?countryId={}&active=true` | Response is paginated: extract `content` array → `jurisdictions` |
| `selectCountry(country)` | — | Set `selectedCountry`, clear `jurisdictions` and `selectedJurisdiction` |
| `reset` | — | Clear `selectedCountry`, `selectedJurisdiction`, `jurisdictions`, `error` |

### 3.3 `useJurisdictionLanguageStore` — Available Languages for Jurisdiction

Port from `lib/store/jurisdiction-language-store.ts`.

```ts
interface JurisdictionLanguageState {
  languages: JurisdictionLanguage[];
  isLoading: boolean;
  error: string | null;

  fetchJurisdictionLanguages: (jurisdictionId: number) => Promise<void>;
  reset: () => void;
}
```

| Action | Endpoint |
|---|---|
| `fetchJurisdictionLanguages(jurisdictionId)` | `GET /api/v1/jurisdictions/{jurisdictionId}/languages` → `JurisdictionLanguage[]` |

### 3.4 `useUserLanguageStore` — User's Language Preferences (client-side list)

Port from `lib/store/user-language-store.ts`.

```ts
interface UserLanguageState {
  userLanguages: UserLanguageInfo[];
  isLoading: boolean;
  error: string | null;

  setUserLanguages: (languages: UserLanguageInfo[]) => void;
  addUserLanguage: (language: UserLanguageInfo) => void;
  removeUserLanguage: (id: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUserLanguages: () => void;
}
```

This store is a local mirror; actual API calls go through the `userLanguagesApi`.

### 3.5 `useAuthStore` (existing)

Used for: `user`, `isAuthenticated`, `logout`, `refreshUser`.

---

## 4. API Endpoints Summary

| # | Method | Endpoint | Screen | Purpose |
|---|---|---|---|---|
| 1 | `GET` | `/api/v1/users/me/jurisdictions` | Profile, Jurisdictions | List user's jurisdictions |
| 2 | `POST` | `/api/v1/users/me/jurisdictions` | Jurisdictions | Add jurisdiction `{ jurisdictionId }` |
| 3 | `DELETE` | `/api/v1/users/me/jurisdictions/{id}` | Jurisdictions | Remove jurisdiction |
| 4 | `PATCH` | `/api/v1/users/me/jurisdictions/{id}/activate` | Jurisdictions | Set as active/primary |
| 5 | `GET` | `/api/v1/countries?active=true` | Jurisdictions | List countries (for add dialog) |
| 6 | `GET` | `/api/v1/jurisdictions?countryId={}&active=true` | Jurisdictions | List jurisdictions per country (paginated) |
| 7 | `GET` | `/api/v1/jurisdictions/{id}/languages` | Profile | Available languages for jurisdiction |
| 8 | `POST` | `/api/v1/user/languages/bulk` | Profile | Bulk add languages `{ jurisdictionId, languageIds }` |
| 9 | `DELETE` | `/api/v1/user/languages/{id}` | Profile | Remove user language |
| 10 | `GET` | `/api/v1/jurisdictions/{id}/entitlements/status` | Profile (Subscription) | Get subscription/entitlement status |
| 11 | `POST` | `/api/v1/jurisdictions/{id}/entitlements/{entId}/reactivate` | Profile (Subscription) | Reactivate cancelled subscription |
| 12 | `POST` | `/api/v1/jurisdictions/{id}/subscriptions/management/cancel` | Settings (Cancel section) | Cancel subscription `{ cancelAtPeriodEnd, cancellationReason? }` |
| 13 | `GET` | `/api/v1/users/me/settings` | Settings | Fetch all user settings |
| 14 | `PUT` | `/api/v1/users/me/settings/{name}` | Settings | Update a setting `{ value }` |

---

## 5. Screen 1 — `ProfileScreen`

### 5.1 Auth Guard

On mount, if `!isAuthenticated` → navigate to Login. Return `null` until authenticated.

### 5.2 Store Usage

```ts
const { user, isAuthenticated, logout, refreshUser } = useAuthStore();
const { jurisdictions, fetchJurisdictions, isLoading: jurisdictionsLoading } = useUserStore();
const { categories, fetchCategories } = useCategoryStore();
const { languages: jurisdictionLanguages, fetchJurisdictionLanguages } = useJurisdictionLanguageStore();
const { isLoading: languagesLoading, setLoading, setError } = useUserLanguageStore();
```

### 5.3 `useEffect` — On Mount

1. Call `fetchJurisdictions()`.
2. Call `fetchCategories(undefined, true)` (for progress stats).
3. If `user.activeJurisdictionId` → call `fetchJurisdictionLanguages(user.activeJurisdictionId)`.
4. Call `refreshUser()` (silent, catch errors).

### 5.4 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `showLogoutDialog` | `boolean` | `false` | Logout confirmation modal |
| `showAddLanguageDialog` | `boolean` | `false` | Add language modal |
| `isAddingLanguage` | `boolean` | `false` | Adding in progress |
| `selectedLanguageIds` | `number[]` | `[]` | Selected languages in add dialog |

### 5.5 Derived Values

```ts
const getInitials = (name?: string) =>
  name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U';

const availableLanguages = jurisdictionLanguages.filter(
  jLang => !user?.userLanguages?.some(uLang => uLang.language.id === jLang.id)
);
```

### 5.6 Event Handlers

#### `handleLogout()`
1. Call `logout()`.
2. Navigate to Home/Login.

#### `handleAddLanguage()`
1. Guard: `selectedLanguageIds.length === 0 || !user.activeJurisdictionId` → return.
2. Set `isAddingLanguage = true`, `setLoading(true)`.
3. `POST /api/v1/user/languages/bulk` with `{ jurisdictionId, languageIds: selectedLanguageIds }`.
4. Call `refreshUser()` to update `user.userLanguages`.
5. Close dialog, clear `selectedLanguageIds`.
6. On error: `setError(message)`.
7. Finally: `setLoading(false)`, `setIsAddingLanguage(false)`.

#### `toggleLanguageSelection(languageId)`
Toggle `languageId` in/out of `selectedLanguageIds`.

#### `handleDeleteLanguage(languageId)`
1. `setLoading(true)`.
2. `DELETE /api/v1/user/languages/{languageId}`.
3. `refreshUser()`.
4. On error: `setError(message)`.
5. `setLoading(false)`.

### 5.7 Render Structure

```
SafeAreaView
  ScrollView
    ┌─ Identity Card (rounded, bordered, card bg)
    │   ├─ Avatar (initials in rounded square + online dot)
    │   │   Text: getInitials(user.fullName), accent color
    │   ├─ Name (bold, large)
    │   ├─ Email row: Mail icon + user.email
    │   └─ Badges row:
    │       ├─ "Verified" badge (if user.emailVerified) — green
    │       └─ "Since {month year}" badge — muted, from user.createdAt
    │
    ├─ Subscription Management Component (see §5.8)
    │
    ├─ Jurisdictions Card (rounded, bordered)
    │   ├─ Header: MapPin icon + "Jurisdictions" title + "{N} added" badge
    │   │
    │   ├─ Content:
    │   │   ├─ Loading → spinner
    │   │   ├─ Empty → MapPin icon + "No jurisdictions added yet"
    │   │   └─ Data → list of jurisdiction rows:
    │   │       For each jurisdiction:
    │   │         ├─ Jurisdiction name (bold)
    │   │         ├─ Country name (muted, small)
    │   │         └─ "Primary" badge (if isActive) — amber
    │   │
    │   └─ "Manage Jurisdictions" button → navigate to ManageJurisdictionsScreen
    │       Dashed border, emerald accent, ChevronRight icon
    │
    ├─ Languages Card (rounded, bordered)
    │   ├─ Header: Languages icon + "Languages" title + "Add Language" button
    │   │   "Add Language" button: emerald bg, disabled if no activeJurisdictionId
    │   │
    │   ├─ Content:
    │   │   ├─ Has languages (user.userLanguages.length > 0):
    │   │   │   For each langInfo in user.userLanguages:
    │   │   │     ├─ Flag image (from langInfo.language.flagUrl)
    │   │   │     ├─ Display name + native name + code badge
    │   │   │     └─ "Delete" button (red, calls handleDeleteLanguage)
    │   │   │         Disabled when languagesLoading
    │   │   │
    │   │   └─ No languages:
    │   │       Languages icon + "No languages configured yet" + "Add a language to get started"
    │
    └─ (Settings section is commented out in web — optionally include as a link row)

Logout Dialog (modal):
  ├─ LogOut icon in red bg
  ├─ "Sign out?" heading
  ├─ "Your progress is saved. You can sign back in anytime." body
  └─ Buttons: "Cancel" + "Sign Out" (destructive red)

Add Language Dialog (modal):
  ├─ Header: "Add Languages" + selection count + X close button
  ├─ Body (scrollable list):
  │   ├─ availableLanguages.length > 0:
  │   │   For each lang:
  │   │     Pressable (toggles selection)
  │   │       ├─ Flag image (from lang.flagUrl)
  │   │       ├─ Display name + native name + code
  │   │       └─ Checkbox indicator (selected: green filled check)
  │   │   Selected items: highlighted border + shadow
  │   │
  │   └─ No available languages:
  │       Languages icon + "All available languages have been added"
  │
  └─ Footer: "Cancel" + "Add {N} Language(s)" button
      Add button disabled when selectedLanguageIds.length === 0 or isAddingLanguage
      Shows spinner + "Adding…" when isAddingLanguage
```

### 5.8 Subscription Management Component

Embedded in the Profile screen. This is a self-contained component.

#### Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `entitlementStatus` | `UserEntitlementStatus \| null` | `null` | Subscription data |
| `isLoading` | `boolean` | `true` | Initial load |
| `error` | `string \| null` | `null` | Error message |
| `processing` | `boolean` | `false` | Action in progress (cancel/reactivate) |
| `showCancelDialog` | `boolean` | `false` | Cancel confirmation modal |
| `cancellationReason` | `string` | `''` | Selected reason |
| `successMessage` | `string \| null` | `null` | Auto-dismissing success banner |

#### `useEffect` — Fetch on Mount

```ts
GET /api/v1/jurisdictions/{user.activeJurisdictionId}/entitlements/status
→ UserEntitlementStatus
```
If no `activeJurisdictionId`: set `isLoading = false`, return.

#### Render States

**Loading:** Spinner inside card shell.

**Error (no data):** Error message inside card shell with dismiss button.

**No subscription (`!hasActiveEntitlement || !entitlement`):**
```
Card:
  ├─ CreditCard icon + "Your Subscription" header + "Upgrade Plan" button
  ├─ CreditCard icon placeholder (large)
  ├─ "No Active Subscription" heading
  ├─ "Subscribe to unlock all features…" body
  └─ "View Pricing Plans" button → navigate to PricingScreen
```

**Has subscription:**
```
Card:
  ├─ Header: CreditCard icon + "Your Subscription" + "Upgrade Plan" button
  │
  ├─ Plan Info:
  │   ├─ Plan type (purchaseType, capitalized) + Status Badge
  │   │   Status badge colors:
  │   │     active → green, canceled → amber, past_due → orange, expired → red
  │   ├─ Jurisdiction name
  │   └─ Price: "{currency} {amount}" + "per {billingPeriod}"
  │
  ├─ Date cards (2-column grid):
  │   ├─ "Start Date" → entitlement.startsAt
  │   └─ "Expires On" (or "Ends On" if cancelled) → entitlement.expiresAt
  │
  ├─ Days remaining banner (blue accent):
  │   "{daysRemaining} days remaining"
  │
  ├─ Cancelled notice (if canceledAt exists): amber banner
  │   "Cancelled on {date}. Access continues until {expiresAt}."
  │
  └─ Action buttons row:
      ├─ "Cancel" button (if active + autoRenew) — red, opens cancel dialog
      ├─ "Reactivate" button (if canceled + !autoRenew) — primary
      └─ "Change Plan" button → PricingScreen

Cancel Dialog (modal):
  ├─ AlertCircle icon (red) + "Cancel Subscription?" heading + X close
  ├─ "Your subscription will stay active until end of billing period…" body
  ├─ Reason picker (dropdown/bottom sheet on mobile):
  │   Options: Too expensive, Not using enough, Found alternative, Technical issues, Other
  └─ Buttons: "Keep Subscription" + "Confirm Cancellation" (red)
      Shows spinner when processing
```

#### Event Handlers

- **`handleCancelSubscription()`**: `POST /api/v1/jurisdictions/{id}/subscriptions/management/cancel` with `{ cancelAtPeriodEnd: true, cancellationReason }`. Re-fetch status. Show success message (auto-dismiss after 5s).
- **`handleReactivate()`**: `POST /api/v1/jurisdictions/{id}/entitlements/{entId}/reactivate`. Re-fetch status.
- **`handleUpgrade()`**: Navigate to PricingScreen.

---

## 6. Screen 2 — `ManageJurisdictionsScreen`

### 6.1 Navigation Params

None.

### 6.2 Auth Guard

Same as ProfileScreen.

### 6.3 Store Usage

```ts
const { isAuthenticated } = useAuthStore();
const {
  jurisdictions, fetchJurisdictions, addJurisdiction,
  activateJurisdiction, removeJurisdiction, isLoading: userLoading,
} = useUserStore();
const {
  countries, jurisdictions: availableJurisdictions, selectedCountry,
  fetchCountries, fetchJurisdictions: fetchAvailableJurisdictions, selectCountry,
} = useComplianceStore();
```

### 6.4 `useEffect` — On Mount

Call `fetchJurisdictions()`.

### 6.5 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `showAddDialog` | `boolean` | `false` | Add jurisdiction modal |
| `selectedJurisdictionId` | `number \| null` | `null` | Selected jurisdiction in add dialog |

### 6.6 Derived Values

```ts
const filteredAvailable = availableJurisdictions.filter(
  j => !jurisdictions.find(uj => uj.jurisdictionId === j.id)
);
```

### 6.7 Event Handlers

#### `handleAddClick()`
1. Call `fetchCountries()`.
2. Set `showAddDialog = true`.

#### `handleCountrySelect(countryId)`
1. Find country in `countries`.
2. Call `selectCountry(country)`.
3. Call `fetchAvailableJurisdictions(countryId)`.

#### `handleAddJurisdiction()`
1. Guard: `!selectedJurisdictionId` → return.
2. Call `addJurisdiction(selectedJurisdictionId)`.
3. Close dialog, clear selection, `selectCountry(null)`.
4. Call `fetchJurisdictions()`.

#### `handleRemove(id)`
1. Show confirmation alert: "Are you sure you want to remove this jurisdiction?"
2. On confirm: call `removeJurisdiction(id)`.

#### `closeDialog()`
Set `showAddDialog = false`, `selectedJurisdictionId = null`, `selectCountry(null)`.

### 6.8 Render Structure

```
SafeAreaView
  ScrollView
    ┌─ Header
    │   ├─ "← Back to Profile" (navigate back)
    │   ├─ "SETTINGS" label (small, uppercase, accent)
    │   ├─ "Jurisdictions" heading (large, bold)
    │   ├─ "Customize which regions you're studying for" subtitle
    │   └─ "{N} added" badge (if jurisdictions.length > 0)
    │
    ├─ Loading → spinner + "Loading jurisdictions…"
    │
    ├─ Jurisdictions Card (rounded, bordered)
    │   ├─ Empty → MapPin icon + "No jurisdictions yet" + "Add one below to start learning"
    │   │
    │   └─ Data → list of jurisdiction rows:
    │       For each jurisdiction:
    │         Row (rounded, bordered):
    │           ├─ Left:
    │           │   ├─ MapPin icon (emerald if active, muted otherwise)
    │           │   ├─ Jurisdiction name (bold)
    │           │   └─ Country name (muted)
    │           │
    │           └─ Right:
    │               ├─ If isActive:
    │               │   → "Active" badge (green, with CheckCircle)
    │               └─ If NOT isActive:
    │                   ├─ "Activate" button (emerald outline)
    │                   │   Calls activateJurisdiction(id)
    │                   └─ Trash icon button (red on hover)
    │                       Calls handleRemove(id)
    │
    └─ "Add Jurisdiction" button (dashed border, emerald, Plus icon)
        Calls handleAddClick()

Add Dialog (modal, full-height on mobile):
  ├─ Top accent gradient line
  │
  ├─ Header:
  │   ├─ "← Back to countries" (if selectedCountry, calls selectCountry(null))
  │   ├─ Title: "Select Country" or "Select Jurisdiction"
  │   ├─ Subtitle: context-dependent
  │   └─ X close button
  │
  ├─ Body (scrollable):
  │   ├─ Step 1 — Country list (!selectedCountry):
  │   │   For each country:
  │   │     Pressable:
  │   │       ├─ Flag emoji
  │   │       ├─ Country name
  │   │       └─ ChevronRight
  │   │     Calls handleCountrySelect(country.id)
  │   │
  │   ├─ Step 2 — Jurisdiction list (selectedCountry):
  │   │   ├─ filteredAvailable.length === 0:
  │   │   │   "All jurisdictions in {country} have been added"
  │   │   │
  │   │   └─ filteredAvailable list:
  │   │       For each jurisdiction:
  │   │         Pressable (toggles selection):
  │   │           ├─ Jurisdiction name
  │   │           └─ Radio indicator (filled circle if selected)
  │   │         Selected: highlighted border + accent bg
  │
  └─ Footer:
      ├─ "Cancel" button (red dashed outline)
      └─ "Add Jurisdiction" button (emerald dashed outline)
          Only visible when selectedCountry is set
          Disabled when !selectedJurisdictionId
```

---

## 7. Screen 3 — `SettingsScreen`

### 7.1 Auth Guard

Same as ProfileScreen.

### 7.2 Store Usage

```ts
const { isAuthenticated } = useAuthStore();
const { settings, fetchSettings, updateSetting, isLoading } = useUserStore();
```

For theme: use React Native's `Appearance` API or `expo-system-ui` / a local store. The web version uses `next-themes`; on mobile, implement a simple theme state (stored in AsyncStorage or a Zustand store).

### 7.3 `useEffect` — On Mount

Call `fetchSettings()`.

### 7.4 Local State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `mounted` | `boolean` | `false` | Prevents theme flash |

### 7.5 Event Handlers

#### `handleSettingToggle(name, currentValue)`
Call `updateSetting(name, currentValue === 'true' ? 'false' : 'true')`.

#### `handleThemeChange(value)`
Set theme to `'light'` / `'dark'` / `'system'`. Persist via AsyncStorage or theme store.

### 7.6 Render Structure

```
SafeAreaView
  ScrollView
    ┌─ Header
    │   ├─ "← Back to Profile" (navigate back)
    │   ├─ "Settings" heading (large, bold)
    │   └─ "Customize your learning experience" subtitle
    │
    ├─ Loading → spinner
    │
    ├─ Appearance Card (rounded, bordered)
    │   ├─ Settings icon + "Appearance" heading
    │   └─ Theme row:
    │       ├─ "Theme" label + "Choose your preferred color scheme" description
    │       └─ Theme toggle buttons (3):
    │           ├─ Sun icon → Light
    │           ├─ Moon icon → Dark
    │           └─ Monitor icon → System
    │           Active button: primary bg + border highlight
    │
    ├─ Notifications Card (rounded, bordered)
    │   ├─ Bell icon + "Notifications" heading
    │   └─ Toggle rows:
    │       ├─ "Email Notifications" / "Receive updates via email"
    │       │   Toggle: enabled = settings.emailNotifications === 'true'
    │       └─ "Daily Reminders" / "Get reminded to practice daily"
    │           Toggle: enabled = settings.dailyReminders === 'true'
    │
    ├─ Learning Preferences Card (rounded, bordered)
    │   ├─ Globe icon + "Learning Preferences" heading
    │   └─ Toggle rows:
    │       ├─ "Show Explanations" / "Display explanations after answering"
    │       │   Toggle: enabled = settings.showExplanations !== 'false'
    │       └─ "Show Tips" / "Display helpful tips with questions"
    │           Toggle: enabled = settings.showTips !== 'false'
    │
    └─ Subscription Cancel Section (optional, same component as web)
        └─ SubscriptionCancelSection component (see §5.8 cancel logic)
```

### 7.7 Toggle Component

A reusable Switch/Toggle:
```
Props: { enabled: boolean; onToggle: () => void }
Renders: React Native Switch or custom toggle
  Track: primary color when enabled, muted when disabled
  Thumb: white circle, slides left/right
```

### 7.8 Setting Row Component

```
Props: { label: string; description: string; children: ReactNode }
Renders:
  Row with horizontal layout:
    ├─ Left: label (bold, sm) + description (muted, xs)
    └─ Right: children (toggle)
  Bottom border separator (except last item)
```

---

## 8. Navigation Flow

```
ProfileTab (bottom tab)
  └─ ProfileScreen
      ├─ "Manage Jurisdictions" button
      │   └─ ManageJurisdictionsScreen
      │       ├─ "← Back to Profile" → ProfileScreen
      │       └─ Add Jurisdiction dialog (inline modal)
      │
      ├─ "Settings" / "Preferences" link (if enabled)
      │   └─ SettingsScreen
      │       └─ "← Back to Profile" → ProfileScreen
      │
      ├─ "Upgrade Plan" / "View Pricing Plans" / "Change Plan"
      │   └─ PricingScreen (separate flow)
      │
      └─ "Sign Out" → Logout dialog → Login/Home
```

---

## 9. Edge Cases

1. **No `activeJurisdictionId`:** "Add Language" button is disabled. Subscription management shows "No Active Subscription". Jurisdiction languages are not fetched.

2. **Email not verified:** The "Verified" badge is hidden. No other impact on the profile screen.

3. **Logout confirmation:** Always show a confirmation modal before logging out. Never log out without user confirmation.

4. **Add Language — all added:** When `availableLanguages` is empty (all jurisdiction languages already added), show "All available languages have been added" in the dialog.

5. **Delete language:** Calls the API directly. On success, `refreshUser()` updates `user.userLanguages`. On error, show alert.

6. **Subscription status mapping:** Map status strings to badge colours:
   - `active` → green/emerald
   - `canceled` → amber
   - `past_due` → orange
   - `expired` → red
   - Unknown → muted/default

7. **Reactivate vs Cancel:** Only show "Cancel" if `status === 'active' && autoRenew === true`. Only show "Reactivate" if `status === 'canceled' && autoRenew === false`.

8. **Success message auto-dismiss:** After cancel/reactivate, show success banner for 5 seconds (`setTimeout`), then clear.

9. **Add Jurisdiction — two-step dialog:** Step 1: select country (shows flag emoji + name). Step 2: select jurisdiction within country (radio selection). Only jurisdictions not already added are shown. If all are added, show empty message.

10. **Activate jurisdiction:** Sets the jurisdiction as the user's active/primary one. This changes `user.activeJurisdictionId` (via `refreshUser` on the web — on mobile, call `refreshUser` or update the auth store after activating).

11. **Remove jurisdiction:** Shows a native `Alert.alert` confirmation before proceeding. Cannot remove the active/primary jurisdiction (the remove button is hidden for it).

12. **Theme on mobile:** Use `Appearance.getColorScheme()` for system default. Store preference in AsyncStorage. Options: Light, Dark, System.

13. **Settings defaults:** `showExplanations` and `showTips` default to `true` (check `!== 'false'`). `emailNotifications` and `dailyReminders` default to `false` (check `=== 'true'`).

14. **Concurrent loading states:** `useUserStore.isLoading` is shared across jurisdictions AND settings actions. Be aware that toggling a setting will briefly show loading. Consider using separate loading flags if needed for better UX.

15. **refreshUser after language/jurisdiction changes:** Always call `refreshUser()` from `useAuthStore` after modifying languages or jurisdictions to keep `user.userLanguages` and `user.activeJurisdictionId` in sync.
