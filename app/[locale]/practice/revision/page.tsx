"use client"

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store/auth-store'
import { useCategoryStore } from '@/lib/store/category-store'
import { useRevisionStore } from '@/lib/store/revision-store'
import { useContentLanguageStore, ContentLanguage } from '@/lib/store/content-language-store'
import { useTranslations } from 'next-intl'
import { Loader2, BookOpen, ArrowLeft, Layers, ChevronRight, AlertCircle, FolderOpen, CheckCircle2, History, Lock } from 'lucide-react'
import { ProgressBar } from '@/components/charts/progress-bar'
import { Category, UserLanguageInfo } from '@/lib/types'
import { useEntitlement } from '@/lib/hooks/use-entitlement'
import Image from 'next/image'

// ── Language switcher ─────────────────────────────────────────────────────────
function QuestionLangSwitcher({
  activeLang,
  onChange,
  setActiveLang,
}: {
  activeLang: string
  onChange: (code: string) => void
  setActiveLang: (code: string, dir: 'ltr' | 'rtl') => void
}) {
  const user = useAuthStore(state => state.user)
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []

  // Don't render if no languages available
  if (!languageFlags || languageFlags.length === 0) {
    return null
  }

  return (
    <div className="sticky top-0 z-30 w-full border-b border-border/40 bg-muted/50 backdrop-blur-sm supports-[backdrop-filter]:backdrop-blur
                    -mx-4 sm:mx-0 sm:rounded-t-xl px-2 sm:px-4">
      <div className="flex items-center gap-1.5 overflow-x-auto py-2 no-scrollbar" ref={(el) => {
        if (!el) return
        const activeBtn = el.querySelector('[data-active="true"]') as HTMLElement
        if (activeBtn) {
          activeBtn.scrollIntoView({ inline: 'center', behavior: 'instant' as ScrollBehavior })
        }
      }}>
        {languageFlags.map((languageInfo: UserLanguageInfo) => {
          const active = activeLang === languageInfo.language.code
          return (
            <button
              key={languageInfo.language.code}
              data-active={active}
              type="button"
              onClick={(e) => {
                onChange(languageInfo.language.code)
                setActiveLang(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')
                e.currentTarget.scrollIntoView({ inline: 'center', behavior: 'smooth' })
              }}
              className={`shrink-0 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer outline-none border ${
                active
                  ? 'bg-emerald-900 text-white shadow-sm border-white/50'
                  : 'bg-card border-border text-foreground/60 hover:text-foreground hover:bg-muted hover:border-foreground/20'
              }`}
            >
              <Image
                src={languageInfo.language.flagUrl}
                alt={languageInfo.language.name}
                width={14}
                height={10}
                className="w-3.5 h-2.5 sm:w-4 sm:h-3 rounded-sm object-cover flex-shrink-0"
              />
              <span className="leading-none">{languageInfo.language.shortDisplayName}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Category card ─────────────────────────────────────────────────────────────
function CategoryCard({
  hasSubCategories,
  subCategoryCount,
  totalQuestions,
  attemptedQuestions,
  progressPercent,
  accuracyPercent,
  displayName,
  categoryId,
  licenceCategoryId,
  isLocked,
}: {
  hasSubCategories: boolean
  subCategoryCount: number
  totalQuestions: number
  attemptedQuestions: number
  progressPercent: number
  accuracyPercent: number | undefined
  displayName: string
  categoryId: number
  licenceCategoryId: number | undefined
  isLocked: boolean
}) {
  const isComplete = !hasSubCategories && progressPercent === 100
  const isStarted  = !hasSubCategories && progressPercent > 0 && progressPercent < 100

  return (
    <div className={`
      group relative overflow-hidden shadow-lg
      rs-card rounded-none sm:rounded-xl
      transition-all duration-250 ease-out
      hover:-translate-y-0.5 hover:rs-card-hover
      ${isComplete ? 'rs-card-complete' : ''}
    `}>
      {/* Shimmer on hover */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      bg-gradient-to-br from-white/[0.04] to-transparent rounded-2xl" />

      <div className="relative flex items-center gap-3.5 px-4 py-3.5">
        {/* Icon bubble */}
        <div className={`
          w-9 h-9 rounded-xl flex items-center justify-center shrink-0
          transition-all duration-200
          ${isComplete
            ? 'bg-emerald-400/20 group-hover:bg-emerald-400/30'
            : 'rs-icon-bg group-hover:rs-icon-bg-hover'
          }
        `}>
          {isComplete
            ? <CheckCircle2 size={16} className="text-emerald-400" />
            : hasSubCategories
              ? <Layers   size={15} className="text-foreground/50 group-hover:text-primary/80 transition-colors duration-200" />
              : <BookOpen size={15} className="text-foreground/50 group-hover:text-primary/80 transition-colors duration-200" />
          }
        </div>

        {/* Text block */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={`
                text-[15px] font-semibold leading-snug break-words transition-colors duration-200
                ${isComplete ? 'text-foreground/70' : 'text-foreground group-hover:text-primary'}
              `}
            >
              {displayName}
            </p>

            {/* History icon for leaf categories */}
            {!hasSubCategories && (
              <Link
                href={`/revision/history?categoryId=${categoryId}&licenceCategoryId=${licenceCategoryId}`}
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 p-1.5 rounded-lg hover:bg-foreground/10 transition-colors duration-200 text-emerald-500 hover-emerald-600"
                title="View history"
              >
                <History
                  size={15}
                  className="text-foreground/40 hover:text-primary transition-colors duration-200"
                />
              </Link>
            )}
          </div>

          {hasSubCategories ? (
            <p className="text-[13px] text-foreground/35 mt-0.5 font-medium">
              {subCategoryCount} topics
            </p>
          ) : (
            <div className="mt-1.5">
              <ProgressBar
                ratio={`${attemptedQuestions} / ${totalQuestions}`}
                progress={progressPercent}
                accuracy={accuracyPercent}
                height={8}
              />
            </div>
          )}
        </div>

        

        {/* Arrow / Lock */}
        {isLocked ? (
          <Lock
            size={14}
            strokeWidth={2.5}
            className="text-amber-500/60 shrink-0"
          />
        ) : (
          <ChevronRight
            size={14}
            strokeWidth={2.5}
            className="text-foreground/15 group-hover:text-primary/60 group-hover:translate-x-0.5 transition-all duration-200 shrink-0"
          />
        )}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rs-card rounded-2xl animate-pulse">
      <div className="flex items-center gap-3.5 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl rs-skel shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 rs-skel rounded-lg w-3/5" />
          <div className="h-2 rs-skel rounded w-1/3" />
        </div>
      </div>
    </div>
  )
}

// ── Error banner ──────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
      <AlertCircle size={14} className="text-rose-400/80 shrink-0 mt-px" />
      <p className="text-[14px] text-rose-400/80 leading-relaxed">{message}</p>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
function RevisionStartContent() {
  const t            = useTranslations('revisionStartPage')
  const router       = useRouter()
  const searchParams = useSearchParams()

  const { language: activeLang, direction, setLanguage: setActiveLang } = useContentLanguageStore()

  const getTranslatedText = (category: Category, field: 'name' | 'description'): string => {
    const originalText = field === 'name' ? category.name : (category.description || '')
    
    // If no language selected or no translations available, return original text
    if (!activeLang || activeLang === '' || !category.translations) {
      return originalText
    }
    
    // Try to get translation for current language
    const translation = category.translations[activeLang] as Record<string, unknown> | undefined
    if (translation && typeof translation[field] === 'string') {
      return translation[field] as string
    }
    
    // Fallback to original text
    return originalText
  }

  const categoryId        = Number(searchParams.get('categoryId'))
  const parentCategoryId  = Number(searchParams.get('parentCategoryId'))
  const licenceCategoryId = Number(searchParams.get('licenceCategoryId'))

  const hasCategoryId       = Number.isFinite(categoryId)       && categoryId > 0
  const hasParentCategoryId = Number.isFinite(parentCategoryId) && parentCategoryId > 0

  const { isAuthenticated, selectedLicenceCategoryId, refreshUser, user } = useAuthStore()
  const { hasAccess: hasEntitlement, loading: entitlementLoading } = useEntitlement(user?.activeJurisdictionId)
  const hasActiveSubscription = hasEntitlement || user?.subscription?.isActive === true
  const resolvedLicenceCategoryId =
    Number.isFinite(licenceCategoryId) && licenceCategoryId > 0
      ? licenceCategoryId
      : selectedLicenceCategoryId

  const { initializeSession, isLoading: sessionLoading, error: sessionError } = useRevisionStore()
  const { categories, isLoading: categoriesLoading, error: categoriesError, fetchCategories } = useCategoryStore()

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (resolvedLicenceCategoryId) fetchCategories(undefined, true, resolvedLicenceCategoryId).catch(() => undefined)
  }, [isAuthenticated, fetchCategories, resolvedLicenceCategoryId, router])

  useEffect(() => {
    if (!isAuthenticated || !hasCategoryId || categories.length === 0) return
    const selected = categories.find((c) => c.id === categoryId)
    if (!selected) return
    if ((selected.subCategories ?? []).filter((ch) => ch.active !== false).length > 0) return
    void handleLeafCategoryClick(selected)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, hasCategoryId, categoryId, categories])

  const startOrContinueSession = async (selectedCategory: Category) => {
    if (!resolvedLicenceCategoryId) return
    const hasIncomplete          = selectedCategory.hasIncompleteSession === true
    const hasNoCompletedSessions = !selectedCategory.completedSessionIds || selectedCategory.completedSessionIds.length === 0
    if (hasIncomplete || hasNoCompletedSessions) {
      await initializeSession({ categoryId: selectedCategory.id, licenceCategoryId: resolvedLicenceCategoryId, restart: false })
      const latest = useRevisionStore.getState()
      if (!latest.allQuestionsAttempted) { router.push('/revision/practice'); return }
      router.push(`/revision/history?categoryId=${selectedCategory.id}&licenceCategoryId=${resolvedLicenceCategoryId}`)
    } else {
      router.push(`/revision/history?categoryId=${selectedCategory.id}&licenceCategoryId=${resolvedLicenceCategoryId}`)
    }
  }

  const handleLeafCategoryClick = async (c: Category) => {
    if (c.isLocked === true && !hasActiveSubscription && !entitlementLoading) {
      router.push('/practice/pricing')
      return
    }
    try { await startOrContinueSession(c) } catch {}
  }

  const selectedParentCategory = hasParentCategoryId ? categories.find((c) => c.id === parentCategoryId) : undefined
  const parentCategories       = categories.filter((c) => !c.parentId && !c.parentCategoryId)
  const selectedParentSubcats  = hasParentCategoryId
    ? categories.filter((c) => c.parentId === parentCategoryId || c.parentCategoryId === parentCategoryId)
    : []
  const categoriesToDisplay = hasParentCategoryId ? selectedParentSubcats : parentCategories

  if (!isAuthenticated) return null

  const total     = categoriesToDisplay.length
  const completed = categoriesToDisplay.filter(c => {
    const q = c.userProgress?.totalQuestions ?? c.totalQuestions ?? c.questionCount ?? 0
    const a = c.userProgress?.attemptedQuestions ?? c.completedQuestions ?? 0
    return q > 0 && a >= q
  }).length

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        * { font-family: 'Plus Jakarta Sans', sans-serif; }

        /* ── Tokens ──_ */
        .rs-glass-muted  { background: color-mix(in srgb, var(--foreground) 6%, transparent); backdrop-filter: blur(8px); border: 1px solid color-mix(in srgb, var(--categories-card-border) 60%, transparent); }
        .rs-glass-active { background: color-mix(in srgb, var(--background) 80%, transparent); backdrop-filter: blur(8px); border: 1px solid color-mix(in srgb, var(--categories-card-border) 80%, transparent); }

        .rs-card         { background: color-mix(in srgb, var(--card) 99%, transparent); border: 1px solid color-mix(in srgb, var(--categories-card-border) 65%, transparent); box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04); }
        @media (max-width: 639px) { .rs-card { border-left: none; border-right: none; border-radius: 0; padding-left: 6px; padding-right: 6px; } }
        .rs-card-hover   { box-shadow: 0 6px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06); border-color: color-mix(in srgb, var(--primary) 30%, var(--border)); }
        .rs-card-complete{ border: 1px solid color-mix(in srgb, var(--categories-card-border) 50%, transparent) !important; background: rgba(69, 248, 84, 0.1) !important; }

        .rs-icon-bg      { background: color-mix(in srgb, var(--foreground) 7%, transparent); }
        .rs-icon-bg-hover{ background: color-mix(in srgb, var(--primary) 14%, transparent); }

        .rs-skel         { background: color-mix(in srgb, var(--foreground) 7%, transparent); }

        /* ── Animations ── */
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(10px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes cardPop {
          from { opacity:0; transform:translateY(8px) scale(0.99); }
          to   { opacity:1; transform:translateY(0)   scale(1); }
        }
        .anim-up  { opacity:0; animation: fadeUp  0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .anim-card{ opacity:0; animation: cardPop 0.38s cubic-bezier(0.16,1,0.3,1) both; }
        .d0{ animation-delay:0s; }
        .d1{ animation-delay:0.07s; }
        .d2{ animation-delay:0.13s; }
      `}</style>

      <div className="space-y-5 sm:overflow-hidden" dir={direction}>

        {/* ── Language switcher ── */}
        <QuestionLangSwitcher activeLang={activeLang} onChange={setActiveLang} setActiveLang={setActiveLang} />

        {/* ── Header ── */}
        <div className="anim-up d0 flex items-start justify-between gap-4">
          <div className="min-w-0">
            {hasParentCategoryId && (
              <Link
                href={resolvedLicenceCategoryId
                  ? `/practice/revision?licenceCategoryId=${resolvedLicenceCategoryId}`
                  : '/practice/revision'}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold tracking-[0.14em] uppercase
                           text-foreground/35 hover:text-foreground/60 transition-colors duration-150 no-underline mb-2"
              >
                <ArrowLeft size={11} strokeWidth={2.5} />
                {t('backToCategories')}
              </Link>
            )}
            <h4 className="hidden sm:block text-[1.3rem] font-extrabold leading-tight tracking-tight text-foreground">
              {hasParentCategoryId && selectedParentCategory
                ? getTranslatedText(selectedParentCategory, 'name')
                : t('title')}
            </h4>
            <p className="hidden sm:block text-[13px] text-foreground/40 mt-1 font-normal">
              {hasParentCategoryId
                ? t('subcategorySubtitle', {
                    category: selectedParentCategory ? getTranslatedText(selectedParentCategory, 'name') : t('title'),
                  })
                : t('subtitle')}
            </p>
          </div>
        </div>

        {/* ── Overall progress ── */}
        {!categoriesLoading && !categoriesError && total > 0 && (
          <div className="anim-up d1 flex items-center gap-3 px-4 py-3 rounded-2xl rs-glass-muted">
            {/* Ring */}
            <div className="relative w-9 h-9 shrink-0">
              <svg viewBox="0 0 36 36" className="w-9 h-9 -rotate-90">
                <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="3" className="text-foreground/[0.08]" />
                <circle
                  cx="18" cy="18" r="14" fill="none"
                  stroke="url(#ring-grad)" strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 14}`}
                  strokeDashoffset={`${2 * Math.PI * 14 * (1 - completed / Math.max(total, 1))}`}
                  style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
                />
                <defs>
                  <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#34d399" />
                    <stop offset="100%" stopColor="#2dd4bf" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-foreground/60 tabular-nums">
                {total > 0 ? Math.round((completed / total) * 100) : 0}
              </span>
            </div>
            <div>
              <p className="text-[15px] font-semibold text-foreground/80 leading-none">
                {completed} of {total} complete
              </p>
              <p className="text-[13px] text-foreground/35 mt-0.5">
                {total - completed} remaining
              </p>
            </div>
          </div>
        )}

        {/* ── Errors ── */}
        {!categoriesLoading && !resolvedLicenceCategoryId && <ErrorBanner message={t('missingLicenceCategory')} />}
        {!categoriesLoading && categoriesError && <ErrorBanner message={categoriesError} />}

        {/* ── Loading ── */}
        {categoriesLoading && (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Empty ── */}
        {!categoriesLoading && !categoriesError && resolvedLicenceCategoryId && categoriesToDisplay.length === 0 && (
          <div className="anim-up d2 flex flex-col items-center gap-3 py-16 rounded-2xl rs-glass-muted text-center">
            <FolderOpen size={28} className="text-foreground/20" />
            <div>
              <p className="text-[16px] font-semibold text-foreground/40">{t('noCategoriesTitle')}</p>
              <p className="text-[14px] text-foreground/25 mt-0.5">{t('noCategoriesDescription')}</p>
            </div>
          </div>
        )}

        {/* ── Card grid ── */}
        {!categoriesLoading && !categoriesError && resolvedLicenceCategoryId && categoriesToDisplay.length > 0 && (
          <div className="-mx-4 sm:mx-0 grid sm:gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {categoriesToDisplay.map((category, idx) => {
              const subCategoryCount   = (category.subCategories ?? []).filter((s) => s.active !== false).length
              const hasSubCategories   = subCategoryCount > 0
              const totalQuestions     = category.userProgress?.totalQuestions ?? category.userStats?.totalQuestions ?? category.totalQuestions ?? category.questionCount ?? 0
              const attemptedQuestions = category.userProgress?.attemptedQuestions ?? category.userStats?.attemptedQuestions ?? category.completedQuestions ?? 0
              const progressPercent    = totalQuestions > 0 ? Math.round((attemptedQuestions / totalQuestions) * 100) : 0
              const accuracyPercent    =
                category.userProgress?.accuracyRate !== undefined ? Math.round(category.userProgress.accuracyRate * 100)
                : category.userStats?.accuracyRate   !== undefined ? Math.round(category.userStats.accuracyRate * 100)
                : category.accuracy                  !== undefined ? Math.round(category.accuracy)
                : undefined

              const isLocked = (category.isLocked === true) && !hasActiveSubscription && !entitlementLoading
              const cardProps = { hasSubCategories, subCategoryCount, totalQuestions, attemptedQuestions, progressPercent, accuracyPercent, displayName: getTranslatedText(category, 'name'), categoryId: category.id, licenceCategoryId: resolvedLicenceCategoryId, isLocked }
              const cls   = 'anim-card'
              const style = { animationDelay: `${0.06 + idx * 0.04}s` }

              if (hasSubCategories) {
                return (
                  <Link
                    key={category.id}
                    href={resolvedLicenceCategoryId
                      ? `/practice/revision?parentCategoryId=${category.id}&licenceCategoryId=${resolvedLicenceCategoryId}`
                      : `/practice/revision?parentCategoryId=${category.id}`}
                    className={`block no-underline ${cls}`}
                    style={style}
                  >
                    <CategoryCard {...cardProps} />
                  </Link>
                )
              }
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => void handleLeafCategoryClick(category)}
                  className={`block w-full text-left cursor-pointer ${cls}`}
                  style={style}
                >
                  <CategoryCard {...cardProps} />
                </button>
              )
            })}
          </div>
        )}

        {/* ── Session states ── */}
        {sessionLoading && (
          <div className="flex items-center gap-2 text-[12px] text-foreground/35 font-medium">
            <Loader2 size={13} className="animate-spin text-primary/50" />
            Initialising session…
          </div>
        )}
        {sessionError && <ErrorBanner message={sessionError} />}

      </div>
    </>
  )
}

export default function RevisionStartPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={22} className="animate-spin text-primary/30" />
        </div>
      }
    >
      <RevisionStartContent />
    </Suspense>
  )
}