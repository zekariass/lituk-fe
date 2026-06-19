# Internationalization (i18n) Implementation

## Overview
The Life In The UK Test Practice application now supports three languages:
- **English (en)** - Default
- **Amharic (am)** - አማርኛ
- **Tigrinya (ti)** - ትግርኛ

## Implementation Details

### Technology Stack
- **next-intl** - Next.js internationalization library
- **Locale routing** - URL-based locale detection (`/am/dashboard`, `/ti/profile`)
- **Middleware** - Automatic locale detection and routing

### File Structure

```
life-in-the-uk/
├── i18n/
│   ├── config.ts          # Locale configuration and names
│   ├── routing.ts         # Next-intl routing setup
│   └── request.ts         # Server-side locale handling
├── messages/
│   ├── en.json           # English translations
│   ├── am.json           # Amharic translations
│   └── ti.json           # Tigrinya translations
├── middleware.ts         # Locale detection middleware
└── components/
    └── language-switcher.tsx  # Language switcher component
```

### Configuration Files

#### `i18n/config.ts`
Defines supported locales and their display names:
```typescript
export const locales = ['en', 'am', 'ti'] as const;
export const localeNames: Record<Locale, string> = {
  en: 'English',
  am: 'አማርኛ',
  ti: 'ትግርኛ',
};
```

#### `i18n/routing.ts`
Configures next-intl routing with `localePrefix: 'as-needed'`:
- Default locale (en) has no prefix: `/dashboard`
- Other locales have prefix: `/am/dashboard`, `/ti/profile`

#### `middleware.ts`
Handles automatic locale detection and routing based on:
1. URL path (`/am/...`)
2. Browser language preferences
3. Fallback to default locale (en)

### Translation Files

All translation files follow the same structure with nested keys:

```json
{
  "common": {
    "appName": "Life In The UK",
    "getStarted": "Get Started",
    ...
  },
  "dashboard": {
    "yourProgress": "Your Progress",
    ...
  },
  "revision": { ... },
  "mockTest": { ... },
  "leaderboard": { ... },
  "profile": { ... }
}
```

### Language Switcher

The `LanguageSwitcher` component is available in:
- **Top Navigation** (desktop) - Next to theme toggle
- **Sidebar Navigation** (tablet) - Bottom section
- **Can be added to mobile** - If needed

Features:
- Dropdown menu with all languages
- Current language highlighted with checkmark
- Smooth transitions between locales
- Maintains current page when switching

## Usage in Components

### Using Translations

```typescript
import { useTranslations } from 'next-intl';

function MyComponent() {
  const t = useTranslations('dashboard');
  
  return (
    <div>
      <h1>{t('yourProgress')}</h1>
      <p>{t('questionsCompleted')}</p>
    </div>
  );
}
```

### Using Locale-Aware Navigation

```typescript
import { Link, useRouter } from '@/i18n/routing';

function MyComponent() {
  const router = useRouter();
  
  return (
    <div>
      {/* Automatically includes locale prefix */}
      <Link href="/dashboard">Dashboard</Link>
      
      <button onClick={() => router.push('/profile')}>
        Go to Profile
      </button>
    </div>
  );
}
```

### Getting Current Locale

```typescript
import { useLocale } from 'next-intl';

function MyComponent() {
  const locale = useLocale(); // 'en', 'am', or 'ti'
  
  return <div>Current locale: {locale}</div>;
}
```

## Adding New Translations

### 1. Add to Translation Files

Add the new key to all three language files:

**messages/en.json:**
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

**messages/am.json:**
```json
{
  "mySection": {
    "myKey": "የእኔ አማርኛ ጽሑፍ"
  }
}
```

**messages/ti.json:**
```json
{
  "mySection": {
    "myKey": "ናይ ትግርኛ ጽሑፍ"
  }
}
```

### 2. Use in Component

```typescript
const t = useTranslations('mySection');
return <div>{t('myKey')}</div>;
```

## URL Structure

### Default Locale (English)
- `/` - Home
- `/dashboard` - Dashboard
- `/categories` - Categories
- `/profile` - Profile

### Amharic
- `/am` - Home
- `/am/dashboard` - Dashboard
- `/am/categories` - Categories
- `/am/profile` - Profile

### Tigrinya
- `/ti` - Home
- `/ti/dashboard` - Dashboard
- `/ti/categories` - Categories
- `/ti/profile` - Profile

## SEO Considerations

The implementation uses `localePrefix: 'as-needed'` which:
- ✅ Keeps default locale URLs clean (`/dashboard`)
- ✅ Adds locale prefix for other languages (`/am/dashboard`)
- ✅ Automatically handles locale detection
- ✅ Supports browser language preferences

## Testing

### Manual Testing
1. Start the dev server: `npm run dev`
2. Visit `http://localhost:3000`
3. Click the language switcher (globe icon)
4. Select a language
5. Verify:
   - URL updates with locale prefix (for am/ti)
   - Content changes to selected language
   - Navigation maintains locale
   - Page refreshes maintain locale

### Locale Switching
- From English to Amharic: `/dashboard` → `/am/dashboard`
- From Amharic to Tigrinya: `/am/dashboard` → `/ti/dashboard`
- From Tigrinya to English: `/ti/dashboard` → `/dashboard`

## Future Enhancements

### Potential Additions
1. **RTL Support** - For languages that require right-to-left layout
2. **More Languages** - Add Oromo, Somali, etc.
3. **User Preference Storage** - Save language choice in user profile
4. **Dynamic Content** - Translate API responses
5. **Date/Time Formatting** - Locale-specific formatting
6. **Number Formatting** - Locale-specific number formats

### Adding a New Language

1. Add locale to `i18n/config.ts`:
```typescript
export const locales = ['en', 'am', 'ti', 'or'] as const;
export const localeNames = {
  en: 'English',
  am: 'አማርኛ',
  ti: 'ትግርኛ',
  or: 'Oromiffa', // New language
};
```

2. Create translation file: `messages/or.json`

3. Update `i18n/routing.ts` locales array

4. Update `middleware.ts` matcher if needed

## Notes

- All translations are loaded at build time for optimal performance
- The middleware runs on every request to handle locale detection
- Static pages are pre-rendered for all locales
- Dynamic pages render with the correct locale at runtime
- Language switcher maintains the current page path when switching

## Support

For translation updates or issues:
1. Check translation files in `messages/` directory
2. Verify locale configuration in `i18n/config.ts`
3. Test middleware routing in `middleware.ts`
4. Review component usage of `useTranslations` hook
