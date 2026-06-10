"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import api from '@/lib/api/client'
import { useAuthStore } from '@/lib/store'
import { MockTestConfigResponse } from '@/lib/types/mock-test'
import {
  Loader2, Clock, FileText, Target, TrendingUp,
  AlertTriangle, X, ArrowRight, History, Shield,
  CheckCircle2, Sparkles,
} from 'lucide-react'

export default function MockTestStartPage() {
  const router = useRouter()
  const t      = useTranslations('mockTestStartPage')
  const { selectedLicenceCategoryId } = useAuthStore()

  const [config, setConfig]                         = useState<MockTestConfigResponse | null>(null)
  const [isLoading, setIsLoading]                   = useState(true)
  const [userJurisdictionId, setUserJurisdictionId] = useState<number>(0)
  const [showCategoryWarning, setShowCategoryWarning] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const userResponse = await api.get('/api/v1/users/me')
      const userData     = userResponse.data.data || userResponse.data
      const jurisdictionId =
        userData.activeJurisdictionId ||
        userData.jurisdictionId ||
        userData.activeJurisdiction?.id
      if (!jurisdictionId) return
      setUserJurisdictionId(jurisdictionId)
      
      // Only fetch config if user has selected a licence category
      if (selectedLicenceCategoryId) {
        const configResponse = await api.get(
          `/api/v1/mock-test-config/jurisdiction/${jurisdictionId}/licence-category/${selectedLicenceCategoryId}`
        )
        setConfig(configResponse.data.data || configResponse.data)
      }
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleStartTest = () => {
    if (!selectedLicenceCategoryId) {
      setShowCategoryWarning(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    router.push(
      `/practice/mock-test/test?jurisdictionId=${userJurisdictionId}&licenceCategoryId=${selectedLicenceCategoryId}`
    )
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <Loader2 size={28} className="relative animate-spin text-primary/60" />
        </div>
        <p className="text-sm text-foreground/30 font-medium animate-pulse">
          Loading test configuration...
        </p>
      </div>
    )
  }

  // ── No config ──────────────────────────────────────────────────────────────
  if (!config) {
    return (
      <>
        <style>{STYLES}</style>
        <div className="max-w-lg mx-auto py-16 px-4">
          <div className="mt-fade-up relative overflow-hidden flex flex-col items-center text-center gap-5 rounded-2xl p-10
                          bg-card border border-border/60 shadow-sm">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400/60 via-amber-300/40 to-amber-400/60" />
            <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center">
              <AlertTriangle size={22} className="text-amber-400" />
            </div>
            <div className="space-y-2">
              <h2 className="font-heading font-extrabold text-lg tracking-tight">{t('noConfigTitle')}</h2>
              <p className="text-sm text-foreground/45 leading-relaxed max-w-xs mx-auto">{t('noConfigDescription')}</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  const criteria = [
    {
      icon: FileText,
      label: t('totalQuestions'),
      value: String(config.totalQuestions),
      accent: '#38bdf8',
      gradient: 'from-sky-400/20 to-sky-500/5',
    },
    {
      icon: Clock,
      label: t('duration'),
      value: `${config.durationMinutes}`,
      unit: t('minSuffix'),
      accent: '#34d399',
      gradient: 'from-emerald-400/20 to-emerald-500/5',
    },
    {
      icon: Target,
      label: t('passMark'),
      value: `${config.passMark}`,
      unit: `/${config.totalQuestions}`,
      accent: '#fbbf24',
      gradient: 'from-amber-400/20 to-amber-500/5',
    },
    {
      icon: TrendingUp,
      label: t('passPercentage'),
      value: `${config.passPercentage}`,
      unit: '%',
      accent: '#a78bfa',
      gradient: 'from-violet-400/20 to-violet-500/5',
    },
  ]

  const instructions = [
    t('instruction1'),
    t('instruction2', { minutes: config.durationMinutes }),
    t('instruction3', { passMark: config.passMark, passPercentage: config.passPercentage }),
    t('instruction4'),
    t('instruction5'),
    // t('instruction6'),
  ]

  return (
    <>
      <style>{STYLES}</style>

      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-4 space-y-6 text-foreground">

        {/* ── Hero header ── */}
        <div className="mt-fade-up relative overflow-hidden rounded-2xl bg-card border border-border/60 p-6 sm:p-8">
          {/* Decorative background elements */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-primary/[0.06] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-40 h-40 rounded-full bg-violet-500/[0.04] blur-3xl pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                              bg-primary/10 border border-primary/15
                              text-[11px] font-semibold tracking-[0.12em] uppercase text-primary">
                <Shield size={10} />
                {t('practiceExam')}
              </div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-[1.75rem] tracking-tight leading-tight">
                {t('mockTest')}
              </h1>
              <p className="text-sm text-foreground/45 leading-relaxed max-w-sm">
                {t('subtitle')}
              </p>
            </div>

            {/* Decorative icon cluster */}
            <div className="hidden sm:flex items-center justify-center w-20 h-20 rounded-2xl
                            bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10
                            shrink-0">
              <Sparkles size={28} className="text-primary/50" />
            </div>
          </div>
        </div>

        {/* ── Warning banner ── */}
        {showCategoryWarning && (
          <div className="mt-fade-up flex items-start gap-3 px-4 py-3.5 rounded-2xl
                          bg-amber-400/[0.08] border border-amber-400/20
                          shadow-[0_2px_12px_rgba(251,191,36,0.06)]">
            <div className="w-7 h-7 rounded-lg bg-amber-400/15 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={13} className="text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-amber-400/90">{t('licenceCategoryRequired')}</p>
              <p className="text-[12px] text-amber-400/55 mt-0.5 leading-relaxed">{t('licenceCategoryRequiredDesc')}</p>
            </div>
            <button
              onClick={() => setShowCategoryWarning(false)}
              className="text-amber-400/35 hover:text-amber-400/70 transition-colors shrink-0 cursor-pointer p-1 rounded-lg hover:bg-amber-400/10"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Stat cards ── */}
        <div>
          <p className="text-[10px] font-semibold tracking-[0.18em] uppercase text-foreground/30 mb-3 ml-1">
            {t('testCriteria')}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {criteria.map(({ icon: Icon, label, value, unit, accent, gradient }, idx) => (
              <div
                key={label}
                className={`mt-fade-up relative overflow-hidden rounded-2xl p-4 group cursor-default
                           bg-card border border-border/60 shadow-sm
                           hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]
                           transition-all duration-300 ease-out`}
                style={{ animationDelay: `${0.08 + idx * 0.06}s` }}
              >
                {/* Accent top strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] opacity-70 group-hover:opacity-100 transition-opacity"
                  style={{ background: accent }}
                />
                {/* Subtle gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative">
                  {/* Icon */}
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: `${accent}15` }}
                  >
                    <Icon size={15} style={{ color: accent }} />
                  </div>
                  {/* Label */}
                  <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-foreground/30 mb-1.5">
                    {label}
                  </p>
                  {/* Value */}
                  <p className="font-extrabold text-[1.5rem] leading-none tracking-tight text-foreground">
                    {value}
                    {unit && (
                      <span className="text-[0.8rem] font-semibold text-foreground/35 ml-0.5">{unit}</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Instructions ── */}
        <div
          className="mt-fade-up relative overflow-hidden rounded-2xl bg-card border border-border/60 shadow-sm"
          style={{ animationDelay: '0.35s' }}
        >
          {/* Header */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-border/40">
            <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield size={13} className="text-primary/70" />
            </div>
            <h3 className="text-[13.5px] font-bold text-foreground/80 tracking-tight">{t('beforeYouBegin')}</h3>
          </div>

          {/* Items */}
          <div className="px-5 py-4 space-y-0.5">
            {instructions.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-3 py-2.5 group"
              >
                <div className="w-6 h-6 rounded-full bg-primary/[0.08] border border-primary/10
                                flex items-center justify-center shrink-0 mt-px
                                group-hover:bg-primary/15 transition-colors">
                  <CheckCircle2 size={12} className="text-primary/50 group-hover:text-primary/70 transition-colors" />
                </div>
                <span className="text-[13px] text-foreground/55 leading-relaxed group-hover:text-foreground/70 transition-colors">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div
          className="mt-fade-up space-y-2.5 pb-4"
          style={{ animationDelay: '0.42s' }}
        >
          {/* Primary */}
          <button
            onClick={handleStartTest}
            disabled={!selectedLicenceCategoryId}
            className="group relative w-full flex items-center justify-center gap-2.5
                       py-4 rounded-2xl text-[14px] font-bold overflow-hidden
                       text-primary-foreground bg-primary cursor-pointer
                       transition-all duration-300 border border-primary/20
                       hover:brightness-110 hover:-translate-y-0.5
                       active:translate-y-0 active:brightness-95
                       disabled:opacity-30 disabled:cursor-not-allowed disabled:translate-y-0
                       shadow-[0_4px_20px_color-mix(in_srgb,hsl(var(--primary))_25%,transparent)]
                       hover:shadow-[0_8px_32px_color-mix(in_srgb,hsl(var(--primary))_35%,transparent)]"
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                            -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out" />
            <span className="relative">{t('startMockTest')}</span>
            <ArrowRight size={16} className="relative transition-transform duration-300 group-hover:translate-x-1" />
          </button>

          {/* Secondary */}
          <button
            onClick={() => router.push('/practice/mock-test/history')}
            className="group w-full flex items-center justify-center gap-2
                       py-3 rounded-xl text-[13px] font-semibold tracking-wide
                       text-foreground/40 cursor-pointer
                       border border-border/50 bg-transparent
                       hover:text-foreground/65 hover:border-border
                       hover:bg-foreground/[0.03]
                       transition-all duration-200"
          >
            <History size={13} className="group-hover:-rotate-45 transition-transform duration-300" />
            {t('viewTestHistory')}
          </button>
        </div>

      </div>
    </>
  )
}

// ── Minimal styles (only for animation keyframes not achievable via Tailwind) ──
const STYLES = `
  @keyframes mtFadeUp {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .mt-fade-up {
    opacity: 0;
    animation: mtFadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  }
`