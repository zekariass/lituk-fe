// "use client"

// import { useTransition } from 'react';
// import { useLocale } from 'next-intl';
// import { usePathname, useRouter } from '@/i18n/routing';
// import { locales, localeNames, type Locale } from '@/i18n/config';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { Button } from '@/components/ui/button';
// import { Languages, Check } from 'lucide-react';
// import { useTheme } from 'next-themes';

// export function LanguageSwitcher() {
//   const locale = useLocale() as Locale;
//   const router = useRouter();
//   const pathname = usePathname();
//   const [isPending, startTransition] = useTransition();
//   const { resolvedTheme } = useTheme();
//   const isDark = resolvedTheme === 'dark';

//   const handleLocaleChange = (newLocale: Locale) => {
//     startTransition(() => {
//       router.replace(pathname, { locale: newLocale });
//     });
//   };

//   return (
//     <DropdownMenu>
//       <DropdownMenuTrigger asChild>
//         <Button
//           variant="ghost"
//           size="icon"
//           disabled={isPending}
//           className={`relative border ${
//             isDark
//               ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800'
//               : 'bg-white border-slate-200 text-slate-900 hover:bg-slate-100'
//           }`}
//         >
//           <Languages className="h-5 w-5" />
//           <span className="sr-only">Switch language</span>
//         </Button>
//       </DropdownMenuTrigger>
//       <DropdownMenuContent
//         align="end"
//         className={`w-[160px] ${
//           isDark
//             ? 'bg-slate-900 border-slate-700 text-slate-100'
//             : 'bg-white border-slate-200 text-slate-900'
//         }`}
//       >
//         {locales.map((loc) => (
//           <DropdownMenuItem
//             key={loc}
//             onClick={() => handleLocaleChange(loc)}
//             className={`flex items-center justify-between cursor-pointer ${
//               isDark ? 'focus:bg-slate-800' : 'focus:bg-slate-100'
//             }`}
"use client"

import { useEffect, useRef, useTransition } from 'react'
import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/i18n/routing'
import { useSearchParams } from 'next/navigation'
import { locales, localeNames, type Locale } from '@/i18n/config'
import { Check, Globe } from 'lucide-react'
import { useAuthStore } from '@/lib/store/auth-store'
import { useStaticContentLanguageStore } from '@/lib/store/static-content-language-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type LanguageSwitcherVariant = 'bar' | 'dropdown'

interface LanguageSwitcherProps {
  variant?: LanguageSwitcherVariant
}

export function LanguageSwitcher({ variant = 'bar' }: LanguageSwitcherProps) {
  const locale   = useLocale() as Locale
  const router   = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const user = useAuthStore(state => state.user)
  const userLanguages = user?.userLanguages || []
  const { direction, setLocale } = useStaticContentLanguageStore()
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  // Apply direction to document element for whole window
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.dir = direction
    }
  }, [direction])

  // Ensure active locale pill stays in view
  useEffect(() => {
    const active = scrollerRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    if (active) {
      active.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' as ScrollBehavior })
    }
  }, [locale, userLanguages])

  const languageOptions = (userLanguages.length > 0
    ? userLanguages.map((languageInfo) => ({
        code: languageInfo.language.code as Locale,
        displayName: languageInfo.language.displayName || localeNames[languageInfo.language.code as Locale] || languageInfo.language.name,
        shortName: languageInfo.language.shortDisplayName || languageInfo.language.code,
        direction: languageInfo.language.direction as 'ltr' | 'rtl',
      }))
    : locales.map((code) => ({
        code,
        displayName: localeNames[code] ?? code,
        shortName: localeNames[code] ?? code,
        direction: 'ltr' as const,
      })))

  const activeOption = languageOptions.find((opt) => opt.code === locale)

  const handleLocaleChange = (newLocale: Locale, direction: 'ltr' | 'rtl') => {
    // Update static content language store with direction
    setLocale(newLocale, direction)
    
    startTransition(() => {
      const params = searchParams.toString()
      const pathnameWithParams = params ? `${pathname}?${params}` : pathname
      router.replace(pathnameWithParams, { locale: newLocale })
    })
  }

  if (variant === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            disabled={isPending}
            className="w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-xl
                       bg-[var(--background)] border border-[var(--border)] text-[var(--foreground)]
                       hover:border-[var(--border-hover)] hover:text-[var(--foreground-hover)]
                       disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Switch language"
          >
            <div className="inline-flex items-center gap-2 truncate">
              <Globe size={14} />
              <span className="text-sm font-medium truncate">{activeOption?.displayName ?? 'Language'}</span>
            </div>
            <span className="text-xs text-[var(--foreground)]/60">{activeOption?.shortName ?? locale}</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[180px] p-1 !bg-[var(--background)] border border-[var(--border)] rounded-xl">
          {languageOptions.map(({ code, displayName, direction: dir }) => {
            const isActive = locale === code
            return (
              <DropdownMenuItem
                key={code}
                onClick={() => handleLocaleChange(code, dir)}
                className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm cursor-pointer
                            ${isActive
                              ? 'text-emerald-500 bg-emerald-300/[0.08]'
                              : '!text-[var(--foreground)] hover:!text-[var(--foreground-hover)] hover:bg-[var(--background-hover)]'}`}
              >
                <span className="font-medium truncate">{displayName}</span>
                {isActive && <Check size={13} className="text-emerald-500 shrink-0" />}
              </DropdownMenuItem>
            )
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // return (
  //   <div className="sticky top-0 z-40 w-full">
  //     <div
  //       ref={scrollerRef}
  //       className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-2
  //                  bg-[var(--background)]/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
  //                  border border-[var(--border)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)]
  //                  min-w-[220px] max-w-full"
  //       role="listbox"
  //       aria-label="Switch language"
  //     >
  //       {languageOptions.map(({ code, displayName, shortName, direction: dir }) => {
  //         const isActive = locale === code
  //         return (
  //           <button
  //             key={code}
  //             type="button"
  //             data-active={isActive}
  //             onClick={() => handleLocaleChange(code, dir)}
  //             disabled={isPending}
  //             className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
  //                         transition-all duration-200 border
  //                         ${isActive
  //                           ? 'bg-emerald-400/20 border-emerald-400/50 text-emerald-100 shadow-sm'
  //                           : 'bg-emerald-800/50 border-white/30 text-white hover:text-white/50 hover:border-white/50'}
  //                           // : 'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]/70 hover:text-[var(--foreground)] hover:border-[var(--border-hover)]'}
  //                         ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
  //             aria-pressed={isActive}
  //           >
  //             <span className="truncate">{shortName || displayName}</span>
  //             {isActive && <Check size={13} className="text-emerald-400 shrink-0" />}
  //           </button>
  //         )
  //       })}
  //     </div>
  //   </div>
  // )

return (
  <div className="sticky top-0 z-40 w-full bg-[var(--background)]">
    <div
      ref={scrollerRef}
      className="flex items-center gap-2 overflow-x-auto no-scrollbar px-2 py-2
                 bg-[var(--background)]
                 border border-[var(--border)] rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.12)]
                 min-w-[220px] max-w-full"
      role="listbox"
      aria-label="Switch language"
    >
      {languageOptions.map(({ code, displayName, shortName, direction: dir }) => {
        const isActive = locale === code

        return (
          <button
            key={code}
            type="button"
            data-active={isActive}
            onClick={() => handleLocaleChange(code, dir)}
            disabled={isPending}
            className={`shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium
                        transition-all duration-200 border
                        ${
                          isActive
                            ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                            : 'bg-emerald-800 border-white text-white hover:bg-emerald-700 hover:border-white'
                        }
                        ${isPending ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            aria-pressed={isActive}
          >
            <span className="truncate">{shortName || displayName}</span>
            {isActive && <Check size={13} className="text-white shrink-0" />}
          </button>
        )
      })}
    </div>
  </div>
)
}
