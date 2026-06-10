"use client"

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { useFlaggedQuestionsStore, useContentLanguageStore, useAuthStore } from '@/lib/store'
import { UserLanguageInfo } from '@/lib/types'


export function LanguageSwitcher() {
  const { language, setLanguage } = useContentLanguageStore()
  const { setLanguage: setFlaggedLanguage } = useFlaggedQuestionsStore()
  const user = useAuthStore(state => state.user)
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
  const scrollerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const active = scrollerRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' as ScrollBehavior })
  }, [language, languageFlags])

  if (!languageFlags || languageFlags.length === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-30 w-full">
      <div
        ref={scrollerRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-2 py-2
                   bg-card/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
                   border border-border rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]
                   min-w-[220px] max-w-full"
        aria-label="Content language options"
      >
        {languageFlags.map((languageInfo: UserLanguageInfo) => {
          const isActive = language === languageInfo.language.code

          return (
            <button
              key={languageInfo.language.code}
              type="button"
              data-active={isActive}
              onClick={() => {
                setLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')
                setFlaggedLanguage(languageInfo.language.code)
              }}
              className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border
                          text-xs font-medium transition-all duration-200 whitespace-nowrap
                          ${isActive
                            ? 'bg-emerald-400/20 border-emerald-300 text-primary shadow-sm'
                            : 'bg-card border-border text-foreground/60 hover:text-foreground hover:bg-emerald-300/5 hover:border-emerald-300/30'}`}
              aria-pressed={isActive}
            >
              <Image
                src={languageInfo.language.flagUrl}
                alt={languageInfo.language.name}
                width={16}
                height={11}
                className="rounded-[2px] object-cover flex-shrink-0"
              />
              <span className="leading-none">{languageInfo.language.shortDisplayName}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
