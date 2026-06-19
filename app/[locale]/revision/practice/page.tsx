"use client"

import { useEffect, useMemo, useState, useCallback, useRef, type ReactNode } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useRevisionStore, useAuthStore, useCategoryStore, useContentLanguageStore, useLocalSettingsStore } from '@/lib/store'
import { RevisionQuestionCard } from '@/components/revision/question-card'
import { NavigationBar } from '@/components/revision/navigation-bar'
import { OptionList } from '@/components/revision/option-list'
import { getLocalizedText, normalizeTipText } from '@/components/revision/content-utils'
import { ChevronDown, ArrowLeft, Loader2, RotateCcw, BookOpen, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Image from 'next/image'

export default function RevisionPracticePage() {
  const t = useTranslations('revisionPracticePage')
  const { language: contentLanguage, direction, setLanguage } = useContentLanguageStore()
  const { showOriginalAndTranslation } = useLocalSettingsStore()
  const router       = useRouter()
  const searchParams = useSearchParams()
  const isReviewMode = searchParams.get('mode') === 'review'

  const { isAuthenticated, user } = useAuthStore()
  const { fetchCategoryById } = useCategoryStore()
  const {
    currentSession,
    questions,
    currentIndex,
    answers,
    explanations,
    tips,
    timers,
    questionStartTimes,
    flaggedQuestions,
    viewedExplanation,
    viewedTip,
    setCurrentIndex,
    submitAnswer,
    fetchExplanation,
    fetchTips,
    prefetchQuestionContext,
    markExplanationViewed,
    markTipViewed,
    startQuestionTimer,
    setQuestionElapsedSeconds,
    loadAdjacentQuestions,
    restartCurrentSession,
    sessionPagination,
    completeSession,
    activeLicenceCategoryId,
    setQuestionFlagged,
    isLoading,
    error,
  } = useRevisionStore()

  const [explanationVisibility, setExplanationVisibility]     = useState<Record<number, boolean>>({})
  const [tipsVisibility, setTipsVisibility]                   = useState<Record<number, boolean>>({})
  const [expandedReviewQuestions, setExpandedReviewQuestions] = useState<Record<number, boolean>>({})
  const [selectedOptionIds, setSelectedOptionIds]             = useState<Record<number, number[]>>({})

  const currentQuestion        = questions[currentIndex] ?? null
  const currentQuestionId      = currentQuestion?.id
  const currentAnswer          = currentQuestionId ? answers[currentQuestionId] : undefined
  const pendingSelectedOptionIds = currentQuestionId
    ? (selectedOptionIds[currentQuestionId] ?? currentAnswer?.selectedOptionIds ?? [])
    : []
  const isAnswered             = Boolean(currentAnswer)
  const isLastQuestionInLoadedSet = currentIndex === questions.length - 1

  const currentCorrectOptionIds = useMemo(() => {
    if (!currentQuestion) return []
    const ids = currentQuestion.options
      ?.filter((o) => o.isCorrect)
      ?.map((o) => o.id)
      ?.sort((a, b) => a - b) ?? []
    return ids
  }, [currentQuestion])

  const isLocked = currentCorrectOptionIds.length > 0 && pendingSelectedOptionIds.length >= currentCorrectOptionIds.length

  const currentExplanation = currentQuestionId ? explanations[currentQuestionId] : undefined
  const currentTips        = currentQuestionId ? tips[currentQuestionId] ?? [] : []

  const showExplanation = currentQuestionId
    ? (explanationVisibility[currentQuestionId] ?? Boolean(currentAnswer))
    : false
  const showTips = currentQuestionId
    ? (tipsVisibility[currentQuestionId] ?? Boolean(currentAnswer))
    : false

  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
  const langBarRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    if (!currentSession)  { router.push('/practice/revision'); return }
  }, [isAuthenticated, currentSession, router])

  useEffect(() => {
    if (!currentQuestion) return
    startQuestionTimer(currentQuestion.id)
    const nextId = questions[currentIndex + 1]?.id
    const ids    = nextId ? [currentQuestion.id, nextId] : [currentQuestion.id]
    prefetchQuestionContext(ids).catch(() => undefined)
  }, [currentQuestion, questions, currentIndex, prefetchQuestionContext, startQuestionTimer])

  useEffect(() => {
    const active = langBarRef.current?.querySelector('[data-active="true"]') as HTMLElement | null
    active?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'instant' as ScrollBehavior })
  }, [contentLanguage, languageFlags])

  if (!isAuthenticated || !currentSession) return null

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="rp-glass flex flex-col items-center justify-center py-20 text-center rounded-2xl">
          <div className="w-14 h-14 rounded-2xl rp-icon-bg flex items-center justify-center mb-5">
            <BookOpen size={22} className="text-primary/60" />
          </div>
          <p className="text-[16px] font-semibold text-foreground/50">{t('noQuestionsFound')}</p>
        </div>
      </div>
    )
  }

  if (!currentQuestion || !currentQuestionId) return null

  // ── Text resolvers ───────────────────────────────────────────────────────────
  const resolveDualText = useCallback((
    original: string | undefined,
    translated: string | undefined
  ): ReactNode => {
    if (!showOriginalAndTranslation || contentLanguage === 'en' || !original) {
      return translated ?? original ?? ''
    }
    if (!translated || translated === original) {
      return original
    }
    return (
      <>
        <span>{original}</span>
        <span className="block mt-1.5 opacity-60 text-sm">{translated}</span>
      </>
    )
  }, [showOriginalAndTranslation, contentLanguage])

  const resolveQuestionText = useCallback((): ReactNode => {
    const translated = getLocalizedText(currentQuestion.text, currentQuestion.translations, contentLanguage, ['question', 'text', 'body'])
    return resolveDualText(currentQuestion.text, translated)
  }, [currentQuestion, contentLanguage, resolveDualText])

  const resolveOptionText = useCallback((option: { text: string; translations?: Record<string, Record<string, unknown>> }): ReactNode => {
    const translated = getLocalizedText(option.text, option.translations, contentLanguage, ['text', 'body', 'label'])
    return resolveDualText(option.text, translated)
  }, [contentLanguage, resolveDualText])

  const resolveTipText = useCallback((tip: (typeof currentTips)[number]): string =>
    normalizeTipText(tip, contentLanguage), [contentLanguage])

  // ── Timer ────────────────────────────────────────────────────────────────────
  const elapsedSeconds = useMemo(() => {
    const recorded = timers[currentQuestionId]
    if (typeof recorded === 'number' && recorded > 0) return recorded
    const startedAt = questionStartTimes[currentQuestionId] ?? Date.now()
    return Math.max(1, Math.floor((Date.now() - startedAt) / 1000))
  }, [currentQuestionId, questionStartTimes, timers])

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectOption = async (optionId: number) => {
    if (isAnswered || isLocked) return

    const previous = selectedOptionIds[currentQuestionId] ?? []
    const togglingOff = previous.includes(optionId)
    let next: number[]

    if (togglingOff) {
      next = previous.filter((id) => id !== optionId).sort((a, b) => a - b)
    } else {
      if (currentCorrectOptionIds.length > 0 && previous.length >= currentCorrectOptionIds.length) {
        return // prevent over-selection
      }
      next = Array.from(new Set([...previous, optionId])).sort((a, b) => a - b)
    }

    setSelectedOptionIds((s) => ({ ...s, [currentQuestionId]: next }))

    // Auto-lock & auto-reveal
    const becameLocked = currentCorrectOptionIds.length > 0 && next.length >= currentCorrectOptionIds.length
    if (becameLocked) {
      try {
        await Promise.all([fetchExplanation(currentQuestionId), fetchTips(currentQuestionId)])
        markExplanationViewed(currentQuestionId)
        markTipViewed(currentQuestionId)
        setExplanationVisibility((s) => ({ ...s, [currentQuestionId]: true }))
        setTipsVisibility((s) => ({ ...s, [currentQuestionId]: true }))
      } catch { /* silently fail */ }
    }
  }

  const submitCurrentAnswer = async (): Promise<boolean> => {
    if (isAnswered)        return true
    const selections = Array.from(new Set(pendingSelectedOptionIds)).sort((a, b) => a - b)
    if (selections.length === 0) return false
    setQuestionElapsedSeconds(currentQuestionId, elapsedSeconds)
    const wasExplanationViewed = viewedExplanation[currentQuestionId] ?? false
    const wasTipViewed = viewedTip[currentQuestionId] ?? false
    try {
      await submitAnswer(currentSession.id, {
        questionId: currentQuestionId,
        selectedOptionIds: selections,
        timeTakenSeconds: elapsedSeconds,
        viewedExplanation: wasExplanationViewed,
        viewedTip: wasTipViewed,
      })
      return true
    } catch { return false }
  }

  const toggleExplanation = async () => {
    const next = !showExplanation
    setExplanationVisibility((s) => ({ ...s, [currentQuestionId]: next }))
    if (next) { await fetchExplanation(currentQuestionId); markExplanationViewed(currentQuestionId) }
  }

  const toggleTips = async () => {
    const next = !showTips
    setTipsVisibility((s) => ({ ...s, [currentQuestionId]: next }))
    if (next) { await fetchTips(currentQuestionId); markTipViewed(currentQuestionId) }
  }

  const handlePrevious = async () => {
    if (currentIndex > 0) { setCurrentIndex(currentIndex - 1); return }
    const loaded = await loadAdjacentQuestions('previous')
    if (!loaded) return
    const latest = useRevisionStore.getState()
    const idx    = latest.questions.findIndex((q) => q.id === currentQuestionId)
    if (idx > 0) latest.setCurrentIndex(idx - 1)
  }

  const handleNext = async () => {
    const submitted = await submitCurrentAnswer()
    if (!submitted) return
    if (currentIndex < questions.length - 1) { setCurrentIndex(currentIndex + 1); return }
    const loaded = await loadAdjacentQuestions('next')
    if (loaded) {
      const latest = useRevisionStore.getState()
      const idx    = latest.questions.findIndex((q) => q.id === currentQuestionId)
      if (idx >= 0 && idx < latest.questions.length - 1) { latest.setCurrentIndex(idx + 1); return }
    }
    await handleComplete()
  }

  const handleComplete = async () => {
    try {
      await completeSession(currentSession.id)
      const categoryId = currentSession?.categoryId
      if (categoryId && activeLicenceCategoryId) {
        await fetchCategoryById(categoryId, activeLicenceCategoryId)
        router.push(`/revision/history?categoryId=${categoryId}&licenceCategoryId=${activeLicenceCategoryId}`)
      } else {
        router.push('/practice/revision')
      }
    } catch { /* surface store error */ }
  }

  const handleRestartSession = async () => {
    try {
      await restartCurrentSession()
      setSelectedOptionIds({})
      setExplanationVisibility({})
      setTipsVisibility({})
      router.replace('/revision/practice')
    } catch { /* surface store error */ }
  }

  const handleFlagToggled = (isFlagged: boolean) => {
    if (!currentQuestionId) return
    setQuestionFlagged(currentQuestionId, isFlagged)
  }

  const toggleReviewQuestion = (questionId: number) => {
    setExpandedReviewQuestions((s) => ({ ...s, [questionId]: !s[questionId] }))
  }

  const progress      = ((currentIndex + 1) / questions.length) * 100
  const canGoPrevious = currentIndex > 0 || Boolean(sessionPagination?.hasPrevious)
  const canGoNext     = Boolean(pendingSelectedOptionIds.length > 0 || currentAnswer)
  const isFinalQuestion = isLastQuestionInLoadedSet && !sessionPagination?.hasNext

  const navigation = () => (
    <NavigationBar
      canGoPrevious={canGoPrevious}
      canGoNext={canGoNext}
      onPrevious={() => void handlePrevious()}
      onNext={() => void handleNext()}
      previousLabel={t('previous')}
      nextLabel={isFinalQuestion ? t('finish') : t('next')}
    />
  )

  // ── REVIEW MODE ──────────────────────────────────────────────────────────────
  const languageSwitcher = languageFlags.length > 0 ? (
    <div className="sticky top-15 lg:top-0  z-50 -mx-4 sm:mx-0 mb-3">
      <div
        ref={langBarRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-2 py-2
                   bg-card/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
                   border border-border shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
        aria-label="Content language options"
      >
        {languageFlags.map((languageInfo) => {
          const isActive = contentLanguage === languageInfo.language.code
          return (
            <button
              key={languageInfo.language.code}
              type="button"
              data-active={isActive}
              onClick={() => setLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')}
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
  ) : null

  if (isReviewMode) {
    return (
      <>
        <style>{STYLES}</style>

        <div className="rp-body max-w-2xl mx-auto space-y-5 text-foreground" dir={direction}>

          {/* Header */}
          <div className="rp-fade-up flex items-center justify-between gap-4">
            <div>
              <p className="rp-label mb-1">Review</p>
              <h1 className="rp-title">{t('reviewTitle')}</h1>
              <p className="rp-sub mt-1">
                {t('questionsReviewed', { count: questions.length })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => router.push('/revision/practice')}
              className="rp-btn-ghost inline-flex items-center gap-1.5"
            >
              <ArrowLeft size={13} strokeWidth={2.5} />
              {t('backToCategories')}
            </button>
          </div>

          {languageSwitcher}

          {/* Question accordion list */}
          <div className="space-y-2 rp-fade-up" style={{ animationDelay: '0.07s' }}>
            {questions.map((question, index) => {
              const translatedQuestionText = getLocalizedText(question.text, question.translations, contentLanguage, ['question', 'text', 'body'])
              const questionText = resolveDualText(question.text, translatedQuestionText)
              const answer       = answers[question.id]
              const isExpanded   = Boolean(expandedReviewQuestions[question.id])
              const isCorrect    = answer?.isCorrect

              return (
                <div
                  key={question.id}
                  className={`rp-glass rounded-2xl overflow-hidden transition-all duration-200
                    ${isCorrect === true  ? 'rp-card-correct'  : ''}
                    ${isCorrect === false ? 'rp-card-wrong'    : ''}
                    ${!answer            ? 'rp-card-unanswered': ''}
                  `}
                >
                  <button
                    type="button"
                    onClick={() => toggleReviewQuestion(question.id)}
                    className="flex w-full items-center gap-3.5 px-4 py-3.5 text-left"
                  >
                    {/* Status icon */}
                    <div className="shrink-0">
                      {!answer ? (
                        <div className="w-7 h-7 rounded-full rp-icon-bg flex items-center justify-center">
                          <span className="rp-mono text-[11px] font-bold text-foreground/30">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                        </div>
                      ) : answer.isCorrect ? (
                        <div className="w-7 h-7 rounded-full bg-emerald-400/15 flex items-center justify-center">
                          <CheckCircle2 size={15} className="text-emerald-400" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-rose-400/15 flex items-center justify-center">
                          <XCircle size={15} className="text-rose-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-[15px] font-semibold leading-snug line-clamp-2 ${
                        !answer           ? 'text-foreground/60'
                        : answer.isCorrect ? 'text-foreground'
                        : 'text-foreground/80'
                      }`}>
                        {questionText}
                      </p>
                    </div>

                    <ChevronDown
                      size={14}
                      strokeWidth={2.5}
                      className={`shrink-0 text-foreground/25 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border/50 px-4 py-4">
                      <OptionList
                        options={question.options ?? []}
                        selectedOptionIds={answer?.selectedOptionIds ?? []}
                        answerLocked
                        correctOptionIds={answer?.correctOptionIds ?? []}
                        onSelectOption={() => undefined}
                        getOptionLabel={(option) => {
                          const translated = getLocalizedText(option.text, option.translations, contentLanguage, ['text', 'body', 'label'])
                          return resolveDualText(option.text, translated)
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  // ── PRACTICE MODE ─────────────────────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>

      <div className="rp-body max-w-4xl mx-auto space-y-4 text-foreground" dir={direction}>

        {/* ── Top bar ── */}
        <div className="rp-fade-up flex items-center justify-between gap-3">

          {/* Left: title + subtitle */}
          <div className="min-w-0">
            <p className="rp-label">{t('title')}</p>
            <p className="rp-sub mt-0.5">
              {t('questionOf', { current: currentIndex + 1, total: questions.length })}
            </p>
          </div>

          {/* Right: restart + counter */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => void handleRestartSession()}
              disabled={isLoading}
              className="rp-btn-ghost inline-flex items-center gap-1.5 text-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-500 p-2"
            >
              <RotateCcw size={12} strokeWidth={2.5} className='text-emerald-500'/>
              <span className="sm:inline text-emerald-500">{t('startAgain')}</span>

            </button>

            {/* Q counter pill */}
            <div className="rp-glass inline-flex items-center gap-1 px-3 py-1.5 rounded-xl">
              <span className="rp-mono text-[15px] font-bold text-foreground tabular-nums">{currentIndex + 1}</span>
              <span className="rp-mono text-[13px] text-foreground/25">/</span>
              <span className="rp-mono text-[14px] text-foreground/50 tabular-nums">{questions.length}</span>
            </div>
          </div>
        </div>

        {languageSwitcher}

        {/* ── Progress bar ── */}
        <div className="rp-fade-up" style={{ animationDelay: '0.06s' }}>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-foreground/[0.08] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, hsl(var(--primary)) 0%, color-mix(in srgb, hsl(var(--primary)) 70%, #2dd4bf) 100%)',
                }}
              />
            </div>
            <span className="rp-mono text-[12px] text-foreground/30 tabular-nums shrink-0 w-8 text-right">
              {Math.round(progress)}%
            </span>
          </div>

          {/* Step dots — show up to 20 */}
          {questions.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {questions.map((_, i) => {
                const answered = answers[questions[i]?.id ?? 0]
                const isCurrent = i === currentIndex
                return (
                  <div
                    key={i}
                    className={`rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'w-4 h-1.5 bg-primary'
                        : answered?.isCorrect === true
                          ? 'w-1.5 h-1.5 bg-emerald-400/70'
                          : answered?.isCorrect === false
                            ? 'w-1.5 h-1.5 bg-rose-400/60'
                            : 'w-1.5 h-1.5 bg-foreground/[0.10]'
                    }`}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* ── Question card ── */}
        <div className="rp-fade-up" style={{ animationDelay: '0.12s' }}>
          <RevisionQuestionCard
            question={{
              ...currentQuestion,
              isFlagged: currentQuestionId in flaggedQuestions 
                ? flaggedQuestions[currentQuestionId] 
                : currentQuestion.isFlagged
            }}
            selectedOptionIds={pendingSelectedOptionIds}
            answerLocked={isAnswered || isLocked}
            correctOptionIds={currentCorrectOptionIds}
            explanation={currentExplanation}
            explanationText={currentExplanation?.text ?? ''}
            showExplanation={showExplanation}
            tips={currentTips}
            showTips={showTips}
            questionText={currentQuestion.text}
            explanationTitle={t('explanation')}
            tipsTitle={t('tips')}
            tipLabel={(index) => t('tipNumber', { index })}
            showExplanationLabel={t('showExplanation')}
            hideExplanationLabel={t('hideExplanation')}
            showTipLabel={t('showTip')}
            hideTipLabel={t('hideTip')}
            flagLabel={t('flag')}
            unflagLabel={t('unflag')}
            onSelectOption={(optionId) => void handleSelectOption(optionId)}
            onToggleExplanation={() => void toggleExplanation()}
            onToggleTips={() => void toggleTips()}
            onFlagToggled={handleFlagToggled}
            getOptionLabel={(option) => option.text}
            getTipText={resolveTipText}
            navigation={navigation}
            showOriginalAndTranslation={showOriginalAndTranslation}
          />
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <AlertCircle size={14} className="text-rose-400/70 shrink-0 mt-px" />
            <p className="text-[14px] text-rose-400/80 leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── Submitting ── */}
        {isLoading && (
          <div className="flex items-center gap-2 rp-mono text-[13px] text-foreground/30">
            <Loader2 size={12} className="animate-spin text-primary/50" />
            {t('submitting')}
          </div>
        )}

        {/* ── Navigation ── */}
        <div className="rp-fade-up" style={{ animationDelay: '0.18s' }}>
          {navigation()}
        </div>

      </div>
    </>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500&display=swap');

.rp-body  { font-family: 'Plus Jakarta Sans', sans-serif; }
.rp-mono  { font-family: 'DM Mono', monospace; }

.rp-title {
font-family: 'Plus Jakarta Sans', sans-serif;
font-weight: 800;
font-size: 1.6rem;
line-height: 1.25;
letter-spacing: -0.02em;
color: var(--foreground);
}
.rp-label {
font-family: 'DM Mono', monospace;
font-size: 13px;
font-weight: 500;
letter-spacing: 0.18em;
text-transform: uppercase;
color: color-mix(in srgb, var(--foreground) 70%, transparent);
}
.rp-sub {
font-size: 14px;
color: color-mix(in srgb, var(--foreground) 70%, transparent);
font-weight: 400;
}

/* Glass surface */
.rp-glass {
background: color-mix(in srgb, var(--card) 88%, transparent);
border: 1px solid color-mix(in srgb, var(--border) 60%, transparent);
box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}

/* Icon bg */
.rp-icon-bg {
background: color-mix(in srgb, var(--foreground) 7%, transparent);
}

/* Ghost button */
.rp-btn-ghost {
font-family: 'Plus Jakarta Sans', sans-serif;
font-size: 13px;
font-weight: 600;
letter-spacing: 0.01em;
padding: 6px 14px;
border-radius: 10px;
border: 1px solid color-mix(in srgb, var(--border) 65%, transparent);
color: color-mix(in srgb, var(--foreground) 50%, transparent);
background: transparent;
cursor: pointer;
transition: all 0.15s ease;
}
.rp-btn-ghost:hover {
color: var(--foreground);
border-color: color-mix(in srgb, var(--border) 90%, transparent);
background: color-mix(in srgb, var(--foreground) 5%, transparent);
}
    transition: all 0.15s ease;
  }
  .rp-btn-ghost:hover {
    color: var(--foreground);
    border-color: color-mix(in srgb, var(--border) 90%, transparent);
    background: color-mix(in srgb, var(--foreground) 5%, transparent);
  }

  /* Review card states */
  .rp-card-correct  { border-color: color-mix(in srgb, #34d399 25%, var(--border)) !important; }
  .rp-card-wrong    { border-color: color-mix(in srgb, #fb7185 20%, var(--border)) !important; }
  .rp-card-unanswered { border-color: color-mix(in srgb, var(--border) 55%, transparent) !important; }

  /* Entrance animations */
  @keyframes rpFadeUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .rp-fade-up {
    opacity: 0;
    animation: rpFadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both;
  }
`