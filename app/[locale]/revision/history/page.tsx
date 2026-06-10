"use client"

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import Image from 'next/image'
import { useRevisionStore, useAuthStore, useCategoryStore, useContentLanguageStore } from '@/lib/store'
import { getLocalizedText } from '@/components/revision/content-utils'
import { ChevronDown, ChevronLeft, Loader2, RotateCcw, CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { OptionList } from '@/components/revision/option-list'
import { PieChart } from '@/components/charts/pie-chart'
import { ContentLanguage } from '@/lib/store/content-language-store'
import { UserLanguageInfo } from '@/lib/types'
import { getAssetUrl } from '@/lib/utils/asset-url'

export default function RevisionHistoryPage() {
  const t      = useTranslations('revisionHistoryPage')
  const locale = useLocale()
  const router = useRouter()
  const searchParams      = useSearchParams()
  const categoryId        = Number(searchParams.get('categoryId'))
  const licenceCategoryId = Number(searchParams.get('licenceCategoryId'))

  const { isAuthenticated, user } = useAuthStore()
  const { categories }      = useCategoryStore()
  const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore()
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
  } = useRevisionStore()

  const [expandedQuestions, setExpandedQuestions] = useState<Record<number, boolean>>({})
  const [isStartingSession, setIsStartingSession] = useState(false)
  const [modalImage, setModalImage] = useState<string | null>(null)
  const langBarRef = useRef<HTMLDivElement | null>(null)
  
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []

  const selectedCategory   = categories.find((cat) => cat.id === categoryId)
  const completedSessionIds = [...(selectedCategory?.completedSessionIds ?? [])]

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!categoryId || !selectedCategory) { router.push('/practice/revision'); return }
    if (completedSessionIds.length > 0 && !selectedSessionId) {
      void openCompletedSession(completedSessionIds[0])
    }
  }, [isAuthenticated, categoryId, selectedCategory, completedSessionIds, selectedSessionId, openCompletedSession, router])

  // Ensure active language pill stays in view
  useEffect(() => {
    if (!languageFlags.length) return
    const active = langBarRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [selectedLanguage, languageFlags])

  if (!isAuthenticated || !selectedCategory) return null

  const toggleQuestion = (questionId: number) => {
    setExpandedQuestions((s) => {
      const isCurrentlyExpanded = s[questionId]
      // If clicking on an already expanded question, close it
      if (isCurrentlyExpanded) {
        return {}
      }
      // Otherwise, close all and open only the clicked one
      return { [questionId]: true }
    })
  }

  const handleStartAgain = async () => {
    setIsStartingSession(true)
    try {
      await initializeSession({ categoryId, licenceCategoryId, restart: true })
      router.push('/revision/practice')
    } catch {
      setIsStartingSession(false)
    }
  }

  // Get translated question text based on selected language
  const getTranslatedQuestionText = (question: any) => {
    if (!selectedLanguage || !question.translations?.[selectedLanguage]) return question.text
    const translation = question.translations[selectedLanguage] as any
    return translation?.text || translation?.question || question.text
  }

  // Get translated option text based on selected language
  const getTranslatedOptionLabel = (option: any) => {
    if (!selectedLanguage || !option.translations?.[selectedLanguage]) return option.text
    const translation = option.translations[selectedLanguage] as any
    return translation?.text || option.text
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .animate-fade-in { animation: fadeIn 0.25s ease both; }
        .delay-1 { animation-delay: 0.07s; }
        .delay-2 { animation-delay: 0.14s; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="font-dm max-w-4xl mx-auto space-y-5 text-[hsl(var(--foreground))]">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 animate-fade-up">
          <div>
            <button
              onClick={() => router.push(`/practice/revision?licenceCategoryId=${licenceCategoryId}`)}
              className="inline-flex items-center gap-1.5 text-xs text-[var(--foreground)]
                         hover:text-[var(--foreground-hover)] transition-colors duration-200 mb-3"
            >
              <ChevronLeft size={13} />
              {t('backToCategories')}
            </button>
            <h1 className="font-syne font-bold text-xl sm:text-3xl tracking-tight leading-tight">
              {selectedCategory.name}
            </h1>
            <p className="text-sm text-[hsl(var(--foreground))/0.35] font-light mt-1">{t('sessionHistory')}</p>
          </div>

          <button
            type="button"
            onClick={handleStartAgain}
            disabled={isStartingSession}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-[hsl(var(--foreground))] bg-[hsl(var(--primary))] shrink-0
                       hover:opacity-85 hover:-translate-y-px disabled:opacity-40
                       disabled:cursor-not-allowed disabled:translate-y-0
                       transition-all duration-200
                       [box-shadow:0_0_20px_rgba(110,231,183,0.25)]"
          >
            {isStartingSession
              ? <Loader2 size={14} className="animate-spin" />
              : <RotateCcw size={14} />}
            {isStartingSession ? t('starting') : t('startAgain')}
          </button>
        </div>

        {/* ── Language Switcher ── */}
        {languageFlags.length > 0 && (
          <div className="sticky top-15 lg:top-0 z-50 -mx-4 sm:mx-0 mb-3">
            <div
              ref={langBarRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-2 py-2
                         bg-card/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
                         border border-border shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
              aria-label="Content language options"
            >
              {languageFlags.map((languageInfo: UserLanguageInfo) => {
                const isActive = selectedLanguage === languageInfo.language.code
                return (
                  <button
                    key={languageInfo.language.code}
                    type="button"
                    data-active={isActive}
                    onClick={() => setLanguage(languageInfo.language.code as ContentLanguage, languageInfo.language.direction as 'ltr' | 'rtl')}
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
        )}

        {/* ── Empty state ── */}
        {completedSessionIds.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center
                          border border-[hsl(var(--border))/0.07] rounded-2xl bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--accent))/0.2]">
            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--foreground))/0.04] flex items-center
                            justify-center mb-5">
              <CheckCircle2 size={22} className="text-[hsl(var(--foreground))/0.2]" />
            </div>
            <p className="text-sm text-[hsl(var(--foreground))/0.35] font-light">
              {t('noCompletedSessions')}
            </p>
          </div>
        ) : (
          <div className="bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--accent))/0.2] border border-[hsl(var(--border))/0.07] rounded-2xl overflow-hidden
                          shadow-[0_4px_24px_rgba(0,0,0,0.25)] animate-fade-up delay-1">

            {/* ── Session tabs ── */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar px-5 pt-5 pb-3">
              {completedSessionIds.map((sessionId, index) => {
                const label    = index === 0 ? t('latest') : t('attempt', { number: completedSessionIds.length - index })
                const isActive = selectedSessionId === sessionId
                return (
                  <button
                    key={sessionId}
                    type="button"
                    onClick={() => {
                      void openCompletedSession(sessionId)
                      setExpandedQuestions({})
                    }}
                    className={`whitespace-nowrap px-4 py-2 rounded-xl text-xs font-medium
                                shrink-0 transition-all duration-200 cursor-pointer
                                ${isActive
                                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] [box-shadow:0_0_14px_rgba(110,231,183,0.25)]'
                                  : 'text-[hsl(var(--foreground))/0.4] border border-[hsl(var(--border))/0.08] hover:text-[hsl(var(--foreground))/0.7] hover:border-[hsl(var(--foreground))/0.15]'}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>

            <div className="px-5 pb-5 space-y-4">

              {/* ── Pie chart summary ── */}
              {selectedSessionSummary && (
                <div className="flex items-center justify-center rounded-2xl border border-[hsl(var(--border))/0.06]
                                bg-[hsl(var(--foreground))/0.02] py-8 animate-fade-in">
                  <div className="flex flex-col items-center gap-5">
                    <PieChart
                      correct={selectedSessionSummary.correctlyAnswered}
                      incorrect={selectedSessionSummary.incorrectlyAnswered}
                      size={220}
                    />
                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--primary))/0.8] shrink-0" />
                        <span className="text-xs text-[hsl(var(--foreground))/0.4] font-light">
                          {t('correct')}
                          <span className="text-[hsl(var(--foreground))] font-medium ml-1.5">
                            {selectedSessionSummary.correctlyAnswered}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 shrink-0" />
                        <span className="text-xs text-[hsl(var(--foreground))/0.4] font-light">
                          {t('incorrect')}
                          <span className="text-[hsl(var(--foreground))] font-medium ml-1.5">
                            {selectedSessionSummary.incorrectlyAnswered}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── Questions accordion ── */}
              {isLoading && selectedSessionQuestions.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 size={22} className="animate-spin text-[hsl(var(--primary))/0.5]" />
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedSessionQuestions.map((question, index) => {
                    const attempt      = question.currentSessionAttempt
                                        ?? (question as { attempt?: { isCorrect?: boolean; selectedOptionIds?: number[] } }).attempt
                    const isCorrect    = Boolean(attempt?.isCorrect)
                    const isExpanded   = Boolean(expandedQuestions[question.id])
                    const questionText = getTranslatedQuestionText(question)
                    const selectedIds  = Array.from(new Set((attempt?.selectedOptionIds ?? []) as number[])).sort((a, b) => a - b)
                    const correctIds   = Array.from(new Set((question.options ?? []).filter((opt) => opt.isCorrect).map((opt) => opt.id))).sort((a, b) => a - b)

                    return (
                      <div
                        key={question.id}
                        dir={direction}
                        className={`rounded-xl border overflow-hidden transition-colors duration-200
                                    ${isExpanded
                                      ? 'border-sky-500/[0.3] bg-sky-500/[0.01]'
                                      : isCorrect
                                      ? 'border-green-400/12 bg-green-400/5'
                                      : 'border-red-400/12 bg-red-400/5'}`}
                      >
                        {/* Accordion trigger */}
                        <button
                          type="button"
                          onClick={() => toggleQuestion(question.id)}
                          className="flex w-full items-start justify-between gap-3 px-2 py-3 text-start
                                     hover:bg-[hsl(var(--background-hover))/0.08] transition-colors duration-150"
                        >
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            {/* <div className="shrink-0 mt-0.5">
                              {isCorrect
                                ? <CheckCircle2 size={15} className="text-green-400/70" />
                                : <XCircle      size={15} className="text-red-400/70" />}
                            </div> */}
                            <span className={`text-xs font-bold ${isCorrect ? 'text-green-400/70' : 'text-red-400/70'} shrink-0 mt-0.5 tabular-nums`}>
                              Q{index + 1}
                            </span>
                            <span className={`text-sm font-bold leading-snug ${isCorrect ? 'text-green-400/70' : 'text-red-400/70'}`}>
                              {questionText}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0 mt-0.5">
                            <span className={`text-[12px] font-bold hidden sm:inline
                                             ${isCorrect ? 'text-green-400/70' : 'text-red-400/70'}`}>
                              {isCorrect ? t('correct') : t('incorrect')}
                            </span>
                            <ChevronDown
                              size={14}
                              className={`text-[var(--foreground)] transition-transform duration-200
                                          ${isExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>
                        </button>

                        {/* Expanded option list */}
                        {isExpanded && (
                          <div className="border-t border-border px-4 py-4 bg-gradient-to-b from-[hsl(var(--background))] to-[hsl(var(--accent))/0.5]
                                          animate-fade-in space-y-4">
                            {/* Assets */}
                            {question.assets && question.assets.length > 0 && (() => {
                              const videoAssets = question.assets!.filter(a => a.contentType?.startsWith('video') || a.type?.toLowerCase().includes('video'))
                              const imageAssets = question.assets!.filter(a => !a.contentType?.startsWith('video') && !a.type?.toLowerCase().includes('video'))
                              const imageGridClass = imageAssets.length === 1
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                                : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
                              return (
                                <div className="space-y-3">
                                  {videoAssets.map((asset) => {
                                    const fullUrl = getAssetUrl(asset.url)
                                    return (
                                      <div key={`${asset.url}-${asset.order ?? 0}`} className="w-full md:w-3/4">
                                        <video controls autoPlay muted playsInline className="w-full rounded-xl border border-border bg-black">
                                          <source src={fullUrl} type={asset.contentType ?? 'video/mp4'} />
                                        </video>
                                      </div>
                                    )
                                  })}
                                  {imageAssets.length > 0 && (
                                    <div className={imageGridClass}>
                                      {imageAssets.map((asset) => {
                                        const fullUrl = getAssetUrl(asset.url)
                                        return (
                                          <div
                                            key={`${asset.url}-${asset.order ?? 0}`}
                                            className="flex flex-col items-center md:items-start space-y-1"
                                          >
                                            <img
                                              src={fullUrl}
                                              alt={asset.alt ?? 'Asset'}
                                              className="rounded-xl border border-border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                              width={300}
                                              height={300}
                                              onClick={() => setModalImage(fullUrl)}
                                            />
                                            {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}
                                </div>
                              )
                            })()}
                            <OptionList
                              options={question.options ?? []}
                              selectedOptionIds={selectedIds}
                              answerLocked={true}
                              correctOptionIds={correctIds}
                              onSelectOption={() => undefined}
                              getOptionLabel={(option) => getTranslatedOptionLabel(option)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* ── Pagination ── */}
              {selectedSessionPagination && selectedSessionPagination.totalPages > 1 && (
                <div className="flex items-center justify-between pt-3 border-t border-[hsl(var(--border))/0.06]">
                  <button
                    type="button"
                    onClick={() => void loadCompletedSessionPage('previous')}
                    disabled={!selectedSessionPagination.hasPrevious || isLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                               text-[hsl(var(--foreground))/0.5] border border-[hsl(var(--border))/0.07]
                               hover:text-[hsl(var(--foreground))/0.8] hover:border-[hsl(var(--border))/0.15]
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    <ChevronLeft size={14} />
                    {t('previous')}
                  </button>

                  <span className="text-xs text-[hsl(var(--foreground))/0.3] tabular-nums">
                    {selectedSessionPagination.currentPage} / {selectedSessionPagination.totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() => void loadCompletedSessionPage('next')}
                    disabled={!selectedSessionPagination.hasNext || isLoading}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                               text-[hsl(var(--foreground))/0.5] border border-[hsl(var(--border))/0.07]
                               hover:text-[hsl(var(--foreground))/0.8] hover:border-[hsl(var(--border))/0.15]
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    {t('next')}
                    <ChevronDown size={14} className="-rotate-90" />
                  </button>
                </div>
              )}

              {/* ── Error ── */}
              {error && (
                <div className="flex items-start gap-2.5 p-4 rounded-xl
                                bg-[hsl(var(--destructive))/0.07] border border-[hsl(var(--destructive))/0.2]">
                  <AlertCircle size={14} className="text-[hsl(var(--destructive))] shrink-0 mt-0.5" />
                  <p className="text-sm text-[hsl(var(--destructive))]/0.8 font-light">{error}</p>
                </div>
              )}

            </div>
          </div>
        )}
      </div>

      {modalImage && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)', overflow: 'hidden' }}
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 10000, padding: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={22} />
          </button>
          <img
            src={modalImage!}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: 8 }}
          />
        </div>,
        document.body
      )}
    </>
  )
}