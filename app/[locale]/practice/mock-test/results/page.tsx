"use client"

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import api from '@/lib/api/client'
import { SubmitMockTestAnswersResponse } from '@/lib/types/mock-test'
import { getAssetUrl } from '@/lib/utils/asset-url'
import {
  CheckCircle2, XCircle, Clock, TrendingUp, Award,
  Loader2, RotateCcw, LayoutDashboard, ChevronRight, ChevronDown,
  BookOpenText, Eye, EyeOff,
} from 'lucide-react'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store/auth-store'
import { useContentLanguageStore } from '@/lib/store'
import { UserLanguageInfo } from '@/lib/types'

export default function MockTestResultsPage() {
  const router = useRouter()
  const t = useTranslations('mockTestResultsPage')
  const searchParams = useSearchParams()
  const testId = searchParams.get('testId')

  const [results, setResults]               = useState<SubmitMockTestAnswersResponse | null>(null)
  const [showAllQuestions, setShowAllQuestions] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isLoading, setIsLoading]           = useState(true)
  const [error, setError]                   = useState<string | null>(null)
  const [modalImage, setModalImage]           = useState<string | null>(null)
  const [categoryOpen, setCategoryOpen]       = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState<string>('')

  const user = useAuthStore(state => state.user)
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
  const { direction, setLanguage } = useContentLanguageStore()

  useEffect(() => { loadResults() }, [testId])

  const loadResults = async () => {
    try {
      const saved = sessionStorage.getItem('mockTestResults')
      if (saved) {
        setResults(JSON.parse(saved))
        sessionStorage.removeItem('mockTestResults')
        setIsLoading(false)
        return
      }
      if (testId) {
        const response = await api.get(`/api/v1/mock-tests/${testId}/results`)
        setResults(response.data.data || response.data)
      } else {
        setError(t('noResultsFound'))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || t('failedToLoadResults'))
    } finally {
      setIsLoading(false)
    }
  }

  const getQuestionText = (question: any) => {
    if (!question) return ''
    const originalText = question.question || question.questionText || ''
    if (!selectedLanguage || !question.translations) return originalText
    const translation = question.translations[selectedLanguage]
    if (translation && typeof translation === 'object') {
      const translatedText = (translation as any).text || (translation as any).question
      if (translatedText) return translatedText
    }
    return originalText
  }

  const getOptionText = (option: any) => {
    if (!option) return ''
    const originalText = option.text || ''
    if (!selectedLanguage || !option.translations) return originalText
    const translation = option.translations[selectedLanguage]
    if (translation && typeof translation === 'object' && 'text' in translation) {
      return (translation as any).text || originalText
    }
    return originalText
  }

  const getExplanationText = (explanation: any) => {
    if (!explanation) return ''
    const originalText = explanation.text || ''
    if (!selectedLanguage || !explanation.translations) return originalText
    const translation = explanation.translations[selectedLanguage]
    if (translation && typeof translation === 'object') {
      const translatedText = (translation as any).text || (translation as any).explanation
      if (translatedText) return translatedText
    }
    return originalText
  }

  const getCategoryName = (category: any) => {
    if (!category) return ''
    const originalName = category.categoryName || ''
    if (!selectedLanguage || !category.translations) return originalName
    const translation = category.translations[selectedLanguage]
    if (translation && typeof translation === 'object') {
      const translatedName = (translation as any).name || (translation as any).categoryName || (translation as any).text
      if (translatedName) return translatedName
    }
    if (typeof translation === 'string' && translation) return translation
    return originalName
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-background to-accent/20 gap-4">
        <Loader2 size={28} className="animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground font-light">{t('loadingResults')}</p>
      </div>
    )
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error || !results) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-dm   { font-family: 'DM Sans', sans-serif; }
        `}</style>
        <div className="font-dm flex flex-col items-center justify-center min-h-screen
                        bg-background text-foreground gap-5 px-5">
          <div className="w-14 h-14 rounded-2xl bg-red-400/10 flex items-center justify-center">
            <XCircle size={24} className="text-red-400" />
          </div>
          <p className="text-sm text-foreground/70 font-light">{error || t('noResultsFound')}</p>
          <button
            onClick={() => router.push('/practice/mock-test/history')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium
                       border border-border text-foreground/60
                       hover:text-foreground/90 hover:border-foreground/20 transition-all duration-200"
          >
            {t('backToHistory')}
          </button>
        </div>
      </>
    )
  }

  const accuracyRate = (results.correctAnswers / results.totalQuestions) * 100
  const timeMinutes  = Math.floor(results.timeTakenSeconds / 60)
  const timeSeconds  = results.timeTakenSeconds % 60
  const passed       = results.passed

  const stats = [
    {
      icon: Award,
      label: t('score'),
      value: `${results.correctAnswers}/${results.totalQuestions}`,
      color: 'text-foreground/50',
      bg: 'bg-muted/30',
      border: 'border-border',
    },
    {
      icon: TrendingUp,
      label: t('accuracy'),
      value: `${accuracyRate.toFixed(1)}%`,
      color: 'text-foreground/50',
      bg: 'bg-muted/30',
      border: 'border-border',
    },
    {
      icon: Clock,
      label: t('timeTaken'),
      value: `${timeMinutes}:${timeSeconds.toString().padStart(2, '0')}`,
      color: 'text-foreground/50',
      bg: 'bg-muted/30',
      border: 'border-border',
    },
    {
      icon: CheckCircle2,
      label: t('passMark'),
      value: `${results.passingScore}`,
      color: 'text-foreground/50',
      bg: 'bg-muted/30',
      border: 'border-border',
    },
  ]

  const questionsToShow = results.questions.filter(q => showAllQuestions || !q.isCorrect)
  const currentQuestion = questionsToShow[currentQuestionIndex]
  const isFirstQuestion = currentQuestionIndex === 0
  const isLastQuestion = currentQuestionIndex === questionsToShow.length - 1

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.45s ease both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }

        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }

        .lang-btn { transition: all 0.15s ease; }
        .lang-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* 2px margin on all sides, full remaining width */}
      <div className="font-dm min-h-screen bg-gradient-to-b from-background to-accent/20 text-foreground p-0.5" dir={direction}>
        {/* Sticky top bar */}
        <div className="sticky top-15 lg:top-0 z-40 w-full max-w-full min-w-0 mb-3 overflow-hidden bg-emerald-900 border-b border-border/60">
          <div className="w-full max-w-full min-w-0 px-2 py-2 space-y-2 overflow-hidden">
            <div className="flex justify-end">
              <Link
                href="/practice/mock-test/history"
                className="text-sm font-medium text-white hover:text-white transition-all duration-200 border border-emerald-500/20 rounded-lg px-3 py-1 bg-background"
              >
                {t('backToHistory')}
              </Link>
            </div>

            {languageFlags.length > 0 && (
              <div className="w-full max-w-full min-w-0 overflow-hidden">
                <div
                  className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none"
                  aria-label="Mock test results language options"
                >
                  <div className="inline-flex w-max min-w-max items-center gap-1.5 rounded-2xl border border-white/40 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                    {languageFlags.map((languageInfo: UserLanguageInfo) => {
                      const isActive = selectedLanguage === languageInfo.language.code

                      return (
                        <button
                          key={languageInfo.language.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(languageInfo.language.code)
                            setLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')
                          }}
                          className={`lang-btn shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border
                                      text-xs font-medium transition-all duration-200 whitespace-nowrap
                                      ${isActive
                                        ? 'bg-emerald-600 border-white/50 text-white shadow-sm'
                                        : 'bg-card border-white/50 text-white hover:bg-emerald-500 hover:text-white hover:border-emerald-500'}`}
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
              </div>
            )}
          </div>
        </div>

        <div className="w-full space-y-0.5">

          {/* ── Result hero card ── */}
          <div className={`rounded-md border px-2 py-5 text-center animate-fade-up
                          ${passed
                            ? 'bg-green-500/[0.05] border-green-500/25 shadow-[0_0_40px_rgba(34,197,94,0.08)]'
                            : 'bg-red-400/[0.05] border-red-400/20'}`}>

            <div className={`w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center
                            ${passed ? 'bg-green-500/15 border border-green-500/25' : 'bg-red-400/10 border border-red-400/20'}`}>
              {passed
                ? <CheckCircle2 size={30} className="text-green-500" />
                : <XCircle     size={30} className="text-red-400" />}
            </div>

            <h1 className={`font-syne font-extrabold text-3xl sm:text-4xl tracking-tight mb-2
                           ${passed ? 'text-green-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'}`}>
              {passed ? t('youPassed') : t('notPassed')}
            </h1>
            <p className="text-sm text-foreground/70 font-light">
              {t('youScored')}{' '}
              <span className="text-foreground font-medium">{results.correctAnswers}</span>{' '}
              /{' '}
              <span className="text-foreground font-medium">{results.totalQuestions}</span>{' '}
              {t('questions')}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {stats.map(({ icon: Icon, label, value, color, bg, border }) => (
                <div key={label} className={`rounded-xl border ${bg} ${border} p-4`}>
                  <Icon size={15} className={`${color} mx-auto mb-2`} />
                  <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground font-medium mb-1">
                    {label}
                  </p>
                  <p className={`font-syne font-bold text-xl ${color}`}>{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── Category breakdown (accordion) ── */}
          <div className="bg-card border border-blue-500/50 rounded-md overflow-hidden py-5
                          shadow-[0_4px_24px_rgba(0,0,0,0.12)] animate-fade-up delay-1">
            <button
              onClick={() => setCategoryOpen(prev => !prev)}
              className="w-full flex items-center justify-between px-4 py-4 cursor-pointer
                         hover:bg-accent/30 transition-colors duration-200"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <TrendingUp size={15} className="text-primary" />
                </div>
                <div className="text-start">
                  <h2 className="font-syne font-bold text-[15px] tracking-tight text-foreground leading-none">
                    {t('performanceByCategory')}
                  </h2>
                  <p className="text-[11px] text-muted-foreground font-light mt-1">
                    {results.categoryBreakdown.length} categories
                  </p>
                </div>
              </div>
              <ChevronDown
                size={18}
                className={`text-muted-foreground transition-transform duration-300 shrink-0
                            ${categoryOpen ? 'rotate-180' : ''}`}
              />
            </button>

            <div
              className="grid transition-all duration-300 ease-in-out"
              style={{
                gridTemplateRows: categoryOpen ? '1fr' : '0fr',
                opacity: categoryOpen ? 1 : 0,
              }}
            >
              <div className="overflow-hidden">
                <div className="px-4 pb-4 pt-1 space-y-4 border-t border-border/40">
                  {results.categoryBreakdown.map((category) => {
                    const pct = category.accuracyRate
                    const barColor = pct >= 80 ? 'bg-green-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-400'
                    const textColor = pct >= 80 ? 'text-green-500 dark:text-emerald-400' : pct >= 60 ? 'text-amber-500 dark:text-amber-300' : 'text-red-500 dark:text-red-400'

                    return (
                      <div key={category.categoryId}
                           className="border-b border-border/40 pb-4 last:border-0 last:pb-0 first:pt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium text-foreground" dir={direction}>{getCategoryName(category)}</p>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-semibold tabular-nums ${textColor}`}>
                              {pct.toFixed(1)}%
                            </span>
                            <span className="text-[11px] text-muted-foreground tabular-nums">
                              {category.correctAnswers}/{category.totalQuestions}
                            </span>
                          </div>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${barColor}`}
                            style={{ width: categoryOpen ? `${pct}%` : '0%' }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
          {/* ── Question review ── */}
          <div className="bg-card border border-amber-500/50 rounded-md px-2 py-5
                          shadow-[0_4px_24px_rgba(0,0,0,0.12)] animate-fade-up delay-2">

            <div className="px-2 pt-2 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-syne font-bold text-lg tracking-tight">{t('questionReview')}</h2>
                <button
                  onClick={() => { setShowAllQuestions(!showAllQuestions); setCurrentQuestionIndex(0) }}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground/70
                             hover:text-primary transition-colors duration-200"
                >
                  {showAllQuestions ? <EyeOff size={13} /> : <Eye size={13} />}
                  {showAllQuestions ? t('incorrectOnly') : t('showAll')}
                </button>
              </div>

            </div>

            {questionsToShow.length === 0 ? (
              <div className="text-center py-10">
                <CheckCircle2 size={28} className="text-green-500/50 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground font-light">{t('allCorrect')}</p>
              </div>
            ) : currentQuestion ? (
              <div className="space-y-4">
                <div className={`rounded-xl border overflow-hidden
                                ${currentQuestion.isCorrect
                                  ? 'border-green-500/[0.15] bg-green-500/[0.15]'
                                  : 'border-red-400/[0.15] bg-red-400/[0.15]'}`}>
                  <div className="px-2 py-4">
                    <div className="flex justify-between items-start gap-3 mb-3">
                      <p className="text-sm font-medium text-foreground leading-relaxed flex-1">
                        <span className="text-foreground/70 mr-1.5">
                          {t('questionOf', { current: currentQuestionIndex + 1, total: questionsToShow.length })}
                        </span>
                      </p>
                      <p className={`inline-flex items-center gap-1.5 text-[11px] font-medium
                                      px-2.5 py-1 rounded-full shrink-0
                                      ${currentQuestion.isCorrect
                                        ? 'text-green-600 dark:text-emerald-400 bg-green-500/10 border border-green-500/20'
                                        : 'text-red-500 dark:text-red-400 bg-red-400/10 border border-red-400/20'}`}>
                        {currentQuestion.isCorrect
                          ? <><CheckCircle2 size={11} /> {t('correct')}</>
                          : <><XCircle      size={11} /> {t('incorrect')}</>}
                      </p>
                    </div>

                    {currentQuestion.question.assets && currentQuestion.question.assets.length > 0 && (() => {
                      const validAssets = currentQuestion.question.assets.filter(a => a.url)
                      const videoAssets = validAssets.filter(a => a.type?.toLowerCase().includes('video'))
                      const imageAssets = validAssets.filter(a => !a.type?.toLowerCase().includes('video'))
                      const imageGridClass = imageAssets.length === 1
                        ? 'flex justify-center md:justify-start'
                        : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
                      return (
                        <div className="mb-4 space-y-3">
                          {videoAssets.map((asset, idx) => (
                            <div key={`v-${currentQuestionIndex}-${idx}`} className="w-full md:w-3/4">
                              <video
                                key={`video-${currentQuestionIndex}-${idx}`}
                                src={getAssetUrl(asset.url)}
                                controls
                                autoPlay
                                playsInline
                                className="w-full rounded-xl border border-border bg-black"
                              />
                            </div>
                          ))}
                          {imageAssets.length > 0 && (
                            <div className={imageGridClass}>
                              {imageAssets.map((asset, idx) => (
                                <div key={`i-${currentQuestionIndex}-${idx}`} className={`flex flex-col ${imageAssets.length === 1 ? 'items-center md:items-start' : 'items-start'} space-y-1`}>
                                  <img
                                    src={getAssetUrl(asset.url)}
                                    alt={asset.alt || 'Question image'}
                                    className={`rounded-xl object-contain cursor-pointer hover:opacity-80 transition-opacity w-auto h-auto ${imageAssets.length === 1 ? 'max-w-[400px] max-h-[400px]' : 'max-w-[300px] max-h-[300px]'}`}
                                    onClick={() => setModalImage(getAssetUrl(asset.url))}
                                  />
                                  {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })()}

                    <p className="text-base font-medium text-foreground leading-relaxed" dir={direction}>
                      {getQuestionText(currentQuestion.question)}
                    </p>
                  </div>

                  <div className="px-2 pb-4 space-y-2.5">
                    <div className={`px-2 py-3 rounded-xl border
                                    ${currentQuestion.isCorrect
                                      ? 'bg-green-500/[0.2] border-green-500/[0.5]'
                                      : 'bg-red-400/[0.2] border-red-400/[0.5]'}`}>
                      <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                        {t('yourAnswer')}
                      </p>
                      <div className="flex flex-wrap gap-2" dir={direction}>
                        {(currentQuestion.selectedOptions ?? []).map((opt) => (
                          <span
                            key={`sel-${currentQuestion.itemId}-${opt.id}`}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border
                              ${currentQuestion.isCorrect ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-900 dark:text-emerald-100'
                              : 'bg-rose-500/15 border-rose-500/40 text-white dark:text-white'}`}
                          >
                            {getOptionText(opt)}
                          </span>
                        ))}
                        {(currentQuestion.selectedOptions ?? []).length === 0 && (
                          <span className="text-sm text-muted-foreground">No answer selected</span>
                        )}
                      </div>
                    </div>

                    {!currentQuestion.isCorrect && (
                      <div className="px-2 py-3 rounded-xl border bg-green-500/[0.30] border-green-500/[0.5]">
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-medium mb-1">
                          {t('correctAnswer')}
                        </p>
                        <div className="flex flex-wrap gap-2" dir={direction}>
                          {(currentQuestion.correctOptions ?? []).map((opt) => (
                            <span
                              key={`corr-${currentQuestion.itemId}-${opt.id}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border bg-emerald-500/20 border-emerald-500/50 text-white dark:text-white"
                            >
                              {getOptionText(opt)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentQuestion.explanation?.text && (
                      <div className="px-3 py-3 rounded-xl border bg-blue-500/40 border-border">
                        <p className="flex items-center gap-1.5 text-[11px] uppercase tracking-widest
                                      text-foreground/70 font-medium mb-1.5">
                          <BookOpenText size={11} />
                          {t('explanation')}
                        </p>
                        <div
                          className="text-sm text-foreground/70 font-light leading-relaxed prose prose-invert prose-sm max-w-none
                                     prose-p:text-foreground/70 prose-strong:text-foreground/80 prose-ul:text-foreground/70 prose-ol:text-foreground/70 text-justify"
                          dir={direction}
                          dangerouslySetInnerHTML={{ __html: getExplanationText(currentQuestion.explanation) }}
                        />

                        {currentQuestion.explanation.assets && currentQuestion.explanation.assets.length > 0 && (() => {
                          const validAssets = currentQuestion.explanation.assets.filter(a => a.url)
                          const videoAssets = validAssets.filter(a => a.type?.toLowerCase().includes('video'))
                          const imageAssets = validAssets.filter(a => !a.type?.toLowerCase().includes('video'))
                          const imageGridClass = imageAssets.length === 1
                            ? 'flex justify-center md:justify-start'
                            : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
                          return (
                            <div className="mt-3 space-y-3">
                              {videoAssets.map((asset, idx) => (
                                <div key={`ev-${currentQuestionIndex}-${idx}`} className="w-full md:w-3/4">
                                  <video
                                    key={`evideo-${currentQuestionIndex}-${idx}`}
                                    src={getAssetUrl(asset.url)}
                                    controls
                                    playsInline
                                    className="w-full rounded-xl border border-border bg-black"
                                  />
                                </div>
                              ))}
                              {imageAssets.length > 0 && (
                                <div className={imageGridClass}>
                                  {imageAssets.map((asset, idx) => (
                                    <div key={`ei-${currentQuestionIndex}-${idx}`} className="flex flex-col items-start space-y-1">
                                      <img
                                        src={getAssetUrl(asset.url)}
                                        alt={asset.alt || 'Explanation image'}
                                        className={`rounded-xl border border-border object-contain cursor-pointer hover:opacity-80 transition-opacity w-auto h-auto ${imageAssets.length === 1 ? 'max-w-[400px] max-h-[400px]' : 'max-w-[300px] max-h-[300px]'}`}
                                        onClick={() => setModalImage(getAssetUrl(asset.url))}
                                      />
                                      {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between gap-4 pt-2">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    disabled={isFirstQuestion}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                               text-foreground/50 border border-border bg-muted/30
                               hover:text-foreground/80 hover:border-foreground/15
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    <ChevronRight size={15} className="rotate-180" />
                    {t('previous')}
                  </button>

                  <div className="text-xs text-foreground/70 font-medium">
                    {currentQuestionIndex + 1} / {questionsToShow.length}
                  </div>

                  <button
                    onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                    disabled={isLastQuestion}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                               text-primary-foreground bg-primary
                               hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                               transition-all duration-200
                               [box-shadow:0_0_16px_hsl(var(--primary)/0.20)]"
                  >
                    {t('next')}
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            ) : null}
          </div>

          {/* ── Actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center py-4 animate-fade-up delay-3">
            <button
              onClick={() => router.push('/practice/mock-test/start')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5
                         rounded-xl text-sm font-medium text-primary-foreground bg-primary
                         hover:opacity-85 hover:-translate-y-px transition-all duration-200
                         [box-shadow:0_0_24px_hsl(var(--primary)/0.28)]"
            >
              <RotateCcw size={14} />
              {t('takeAnotherTest')}
            </button>

            <button
              onClick={() => router.push('/practice/revision')}
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5
                         rounded-xl text-sm font-medium
                         text-foreground/60 border border-border bg-muted/30
                         hover:text-foreground/90 hover:border-foreground/20 hover:bg-muted/50
                         transition-all duration-200"
            >
              <LayoutDashboard size={14} />
              {t('backToDashboard')}
            </button>
          </div>

        </div>
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
            <XCircle size={22} />
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