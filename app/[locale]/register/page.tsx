"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore, useComplianceStore, useJurisdictionLanguageStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, Loader2, User, Mail, Lock, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import { Country, Jurisdiction } from '@/lib/types'
import { useTranslations } from 'next-intl'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

type Step = 'country' | 'jurisdiction' | 'form'

const STEP_ORDER: Step[] = ['country', 'jurisdiction', 'form']

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

function RegisterPageContent() {
  const router = useRouter()
  const { register, googleLogin, isLoading: authLoading } = useAuthStore()
  const t = useTranslations('registerPage')

  const STEP_LABELS: Record<Step, string> = {
    country:      t('selectCountry'),
    jurisdiction: t('selectJurisdiction'),
    form:         '',
  }
  const {
    countries,
    jurisdictions,
    selectedCountry,
    selectedJurisdiction,
    isLoading: complianceLoading,
    fetchCountries,
    fetchJurisdictions,
    selectCountry,
    selectJurisdiction,
    reset,
  } = useComplianceStore()

  const {
    languages: jurisdictionLanguages,
    selectedLanguageIds,
    isLoading: loadingLanguages,
    error: languagesError,
    fetchJurisdictionLanguages,
    toggleLanguageSelection,
    reset: resetLanguages,
  } = useJurisdictionLanguageStore()

  const [step, setStep]       = useState<Step>('country')
  const [focused, setFocused] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    fullName:        '',
    email:           '',
    password:        '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [languageConfirmed, setLanguageConfirmed] = useState(false)
  const languageCheckboxRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchCountries()
    return () => {
      reset()
      resetLanguages()
    }
  }, [])

  // Auto-select if only one country is available
  useEffect(() => {
    if (!complianceLoading && countries.length === 1 && step === 'country') {
      void handleCountrySelect(countries[0])
    }
  }, [countries, complianceLoading, step])

  const handleCountrySelect = async (country: Country) => {
    selectCountry(country)
    await fetchJurisdictions(country.id)
    const nextJurisdictions = useComplianceStore.getState().jurisdictions
    if (nextJurisdictions.length === 1) {
      selectJurisdiction(nextJurisdictions[0])
      await fetchJurisdictionLanguages(nextJurisdictions[0].id)
      setStep('form')
      return
    }
    setStep('jurisdiction')
  }

  const handleJurisdictionSelect = async (jurisdiction: Jurisdiction) => {
    selectJurisdiction(jurisdiction)
    await fetchJurisdictionLanguages(jurisdiction.id)
    setStep('form')
  }

  const handleBack = () => {
    if (step === 'jurisdiction') { setStep('country'); selectCountry(null) }
    if (step === 'form') {
      selectJurisdiction(null)
      if (jurisdictions.length === 1) { setStep('country'); selectCountry(null) }
      else setStep('jurisdiction')
    }
  }

  const hasNonPrimarySelection = jurisdictionLanguages.some(
    (lang) => !lang.isPrimary && selectedLanguageIds.includes(lang.id)
  )

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.fullName.trim())   newErrors.fullName = t('fullNameRequired')
    if (!formData.email.trim())      newErrors.email = t('emailRequired')
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
                                     newErrors.email = t('invalidEmail')
    if (!formData.password)          newErrors.password = t('passwordRequired')
    else if (formData.password.length < 8)
                                     newErrors.password = t('passwordMinLength')
    if (formData.password !== formData.confirmPassword)
                                     newErrors.confirmPassword = t('passwordsNoMatch')
    // Language validation removed - all languages are auto-selected by default
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || !selectedJurisdiction) return
    try {
      await register(formData.email, formData.password, formData.fullName, selectedJurisdiction.id, selectedLanguageIds)
      router.push('/practice')
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || t('registrationFailed') })
    }
  }

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential, selectedJurisdiction?.id, selectedLanguageIds)
      router.push('/practice')
    } catch (error: any) {
      setErrors({ submit: error.response?.data?.message || t('registrationFailed') })
    }
  }

  const inputCls = (field: string) =>
    [
      'w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-foreground',
      'placeholder:text-muted-foreground/40 outline-none',
      'transition-all duration-200',
      errors[field]
        ? 'bg-destructive/[0.04] border border-destructive/30 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/10'
        : 'bg-background border border-border/60 focus:border-emerald-500/50 focus:bg-emerald-50/30 dark:focus:bg-emerald-950/10 focus:ring-2 focus:ring-emerald-500/10',
    ].join(' ')

  const currentStepIndex = STEP_ORDER.indexOf(step)

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.2; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .animate-fade-up   { animation: fadeUp   0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-slide { animation: fadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-blink     { animation: blink 2.4s ease-in-out infinite; }
        .animate-float     { animation: float 6s ease-in-out infinite; }

        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }

        .grid-bg {
          background-image:
            linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          -webkit-mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
          mask-image: radial-gradient(ellipse 70% 70% at 50% 40%, black 0%, transparent 100%);
        }

        .selection-btn {
          transition: border-color 0.2s ease, background-color 0.2s ease,
                      box-shadow 0.2s ease, transform 0.15s ease;
        }
        .selection-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(16,185,129,0.12);
        }
        .selection-btn:active { transform: translateY(0); }

        .submit-btn {
          transition: opacity 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 36px rgba(16,185,129,0.35) !important;
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div className="font-dm min-h-screen bg-background text-foreground
                      flex items-center justify-center px-5 py-12 sm:py-14 relative overflow-hidden">

        {/* Ambient glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="animate-float absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[500px] rounded-full
                          bg-[radial-gradient(ellipse,rgba(16,185,129,0.08)_0%,rgba(16,185,129,0.03)_40%,transparent_70%)]" />
          <div className="absolute bottom-[-80px] -left-20 w-80 h-80 rounded-full
                          bg-[radial-gradient(ellipse,rgba(16,185,129,0.05)_0%,transparent_70%)]" />
          <div className="absolute top-1/3 -right-16 w-64 h-64 rounded-full
                          bg-[radial-gradient(ellipse,rgba(16,185,129,0.04)_0%,transparent_70%)]" />
        </div>

        {/* Grid overlay */}
        <div className="grid-bg absolute inset-0 pointer-events-none" />

        <div className="relative z-10 w-full max-w-[440px]">
          <Link
            href="/"
            className="absolute -top-1 left-0 z-20 pointer-events-auto inline-flex items-center gap-1.5 text-xs font-medium
                       uppercase tracking-[0.1em] text-emerald-600 hover:text-emerald-500
                       no-underline transition-all duration-200 hover:-translate-x-0.5"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
            {t('home')}
          </Link>

          {/* ── Logo ── */}
          <div className="text-center mb-8 animate-fade-up">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-7 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center
                              shadow-md shadow-emerald-600/25 group-hover:shadow-emerald-600/40 transition-shadow">
                <img
                  src="/logo.svg"
                  alt="LITUK logo"
                  className="w-5 h-5 shrink-0"
                />
              </div>
              <span className="font-syne font-extrabold text-[20px] tracking-tight text-foreground">
                LITUK
              </span>
            </Link>

            <h1 className="font-syne font-bold text-[28px] sm:text-[34px] tracking-tight leading-none">
              {t('createAccount')}
            </h1>
            {STEP_LABELS[step] && (
              <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
                {STEP_LABELS[step]}
              </p>
            )}
          </div>

          {/* ── Step progress ── */}
          <div className="flex items-center justify-center gap-2 mb-5 animate-fade-up delay-1">
            {STEP_ORDER.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold
                              transition-all duration-300
                              ${i === currentStepIndex
                                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-110'
                                : i < currentStepIndex
                                ? 'bg-emerald-600/20 text-emerald-600'
                                : 'bg-muted/50 text-muted-foreground/50'}`}
                >
                  {i < currentStepIndex ? <Check size={13} strokeWidth={3} /> : i + 1}
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div className={`w-8 h-0.5 rounded-full transition-all duration-300
                                  ${i < currentStepIndex ? 'bg-emerald-600/30' : 'bg-border/60'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ── Card ── */}
          <div className="animate-fade-up delay-1
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-6 sm:p-8">

            {/* Back button */}
            {step !== 'country' && (
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide
                           uppercase text-emerald-600 hover:text-emerald-500
                           transition-all duration-200 mb-5 -mt-1 hover:-translate-x-0.5"
              >
                <ChevronLeft size={13} strokeWidth={2.5} />
                {t('back')}
              </button>
            )}

            {/* ── STEP: Country ── */}
            {step === 'country' && (
              <div key="country" className="animate-fade-slide space-y-2.5">
                {complianceLoading ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <Loader2 size={20} className="animate-spin text-emerald-500" />
                    <p className="text-sm text-muted-foreground">{t('loadingCountries')}</p>
                  </div>
                ) : (
                  countries.map((country, i) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country)}
                      style={{ animationDelay: `${i * 0.05}s` }}
                      className="selection-btn animate-fade-slide
                                 w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left
                                 border border-border/50 bg-background/80
                                 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20
                                 group"
                    >
                      <span className="text-2xl shrink-0 leading-none">{country.flagEmoji}</span>
                      <span className="text-sm font-semibold text-foreground flex-1 tracking-tight">
                        {country.name}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-muted/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40
                                      flex items-center justify-center transition-all duration-200">
                        <ChevronRight
                          size={14}
                          className="text-muted-foreground/40 group-hover:text-emerald-600
                                     group-hover:translate-x-0.5
                                     transition-all duration-200 shrink-0"
                        />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ── STEP: Jurisdiction ── */}
            {step === 'jurisdiction' && (
              <div key="jurisdiction" className="animate-fade-slide space-y-2.5">
                {complianceLoading ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <Loader2 size={20} className="animate-spin text-emerald-500" />
                    <p className="text-sm text-muted-foreground">{t('loadingRegions')}</p>
                  </div>
                ) : jurisdictions.length === 0 ? (
                  <div className="text-center py-14 space-y-2">
                    <p className="text-sm text-muted-foreground">
                      {t('noJurisdictions')}
                    </p>
                  </div>
                ) : (
                  jurisdictions.map((jurisdiction, i) => (
                    <button
                      key={jurisdiction.id}
                      onClick={() => handleJurisdictionSelect(jurisdiction)}
                      style={{ animationDelay: `${i * 0.05}s` }}
                      className="selection-btn animate-fade-slide
                                 w-full flex items-center gap-4 px-5 py-4 rounded-xl text-left
                                 border border-border/50 bg-background/80
                                 hover:border-emerald-500/40 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20
                                 group"
                    >
                      <span className="text-sm font-semibold text-foreground flex-1 tracking-tight">
                        {jurisdiction.name}
                      </span>
                      <div className="w-7 h-7 rounded-full bg-muted/50 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40
                                      flex items-center justify-center transition-all duration-200">
                        <ChevronRight
                          size={14}
                          className="text-muted-foreground/40 group-hover:text-emerald-600
                                     group-hover:translate-x-0.5
                                     transition-all duration-200 shrink-0"
                        />
                      </div>
                    </button>
                  ))
                )}
              </div>
            )}

            {/* ── STEP: Form ── */}
            {step === 'form' && (
              <>
                {/* Google Sign-In Button */}
                {GOOGLE_CLIENT_ID && (
                  <>
                    <div className="mb-6 animate-fade-slide">
                      <GoogleLogin
                        onSuccess={handleGoogleLogin}
                        onError={() => {
                          setErrors({ submit: t('registrationFailed') })
                        }}
                        useOneTap={false}
                        type="standard"
                        theme="outline"
                        size="large"
                        text="continue_with"
                        shape="rectangular"
                        logo_alignment="left"
                        width="100%"
                      />
                    </div>

                    {/* Divider */}
                    <div className="relative mb-6 animate-fade-slide">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/40" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card/70 backdrop-blur-md px-3 text-muted-foreground/70 font-semibold tracking-wider">
                          {t('orContinueWithEmail') || 'or continue with email'}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                <form key="form" onSubmit={handleSubmit} noValidate
                      className="animate-fade-slide space-y-4">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label htmlFor="fullName"
                         className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                    {t('fullNameLabel')}
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                      style={{ color: focused === 'fullName' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      onFocus={() => setFocused('fullName')}
                      onBlur={() => setFocused(null)}
                      className={inputCls('fullName')}
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </div>
                  {errors.fullName && <FieldError message={errors.fullName} />}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email"
                         className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                    {t('emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                      style={{ color: focused === 'email' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      className={inputCls('email')}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <FieldError message={errors.email} />}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password"
                         className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                    {t('passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                      style={{ color: focused === 'password' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      onFocus={() => setFocused('password')}
                      onBlur={() => setFocused(null)}
                      className={inputCls('password')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50
                                hover:text-muted-foreground transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.password && <FieldError message={errors.password} />}

                  {/* Password strength hint */}
                  {formData.password && !errors.password && (
                    <PasswordStrength password={formData.password} />
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword"
                         className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                    {t('confirmPasswordLabel')}
                  </label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200"
                      style={{ color: focused === 'confirmPassword' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      onFocus={() => setFocused('confirmPassword')}
                      onBlur={() => setFocused(null)}
                      className={inputCls('confirmPassword')}
                      placeholder="••••••••"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50
                                hover:text-muted-foreground transition-colors duration-200"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <FieldError message={errors.confirmPassword} />}
                </div>

                {/* Language Selection - Auto-selected all languages by default */}
                {/* <div className="space-y-2">
                  <label className="block text-[10px] font-semibold tracking-[0.12em] uppercase text-muted-foreground/70">
                    {t('chooseLanguages')}
                  </label>
                  {loadingLanguages ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 size={18} className="animate-spin text-emerald-500" />
                    </div>
                  ) : languagesError ? (
                    <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-destructive/[0.05] border border-destructive/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0 mt-1" />
                      <p className="text-xs text-destructive/80 leading-relaxed">{languagesError}</p>
                    </div>
                  ) : jurisdictionLanguages.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-4">{t('noLanguages')}</p>
                  ) : (
                    <div className="grid grid-cols-5 gap-1.5">
                      {jurisdictionLanguages.map((language) => {
                        const isSelected = selectedLanguageIds.includes(language.id)
                        const isPrimary = language.isPrimary
                        return (
                          <button
                            key={language.id}
                            type="button"
                            onClick={() => toggleLanguageSelection(language.id)}
                            disabled={isPrimary}
                            className={`
                              flex flex-row items-center justify-center gap-1 px-1 py-1.5 rounded-lg
                              border-2 transition-all duration-200 min-w-0
                              ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-200 dark:bg-emerald-800/50 hover:bg-emerald-300 dark:hover:bg-emerald-800/60 text-gray-900 dark:text-white'
                                  : 'border-border/50 bg-background/80 hover:border-emerald-400/40 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/10'
                              }
                              ${isPrimary ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}
                            `}
                          >
                            {language.flagUrl && (
                              <img
                                src={language.flagUrl}
                                alt={language.name}
                                className="w-4 h-3 rounded-sm object-cover shrink-0"
                              />
                            )}
                            <span className="text-[10px] sm:text-xs font-medium text-foreground truncate">
                              {language.shortDisplayName}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                  {errors.languages && <FieldError message={errors.languages} />}
                </div> */}

                {/* Language confirmation checkbox - Auto-confirmed since all languages are selected */}
                {/* <div ref={languageCheckboxRef} className="space-y-1.5">
                  <label
                    className={`flex items-start gap-2.5 px-3.5 py-3 rounded-xl border cursor-pointer transition-all duration-200
                      ${
                        hasNonPrimarySelection
                          ? 'border-emerald-500/30 bg-emerald-50/40 dark:bg-emerald-950/20 opacity-60 cursor-not-allowed'
                          : errors.languageConfirm
                            ? 'border-red-300 dark:border-red-800/40 bg-red-50/50 dark:bg-red-950/10'
                            : 'border-border/60 bg-muted/10 hover:border-emerald-400/30'
                      }
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={hasNonPrimarySelection || languageConfirmed}
                      disabled={hasNonPrimarySelection}
                      onChange={(e) => {
                        setLanguageConfirmed(e.target.checked)
                        if (e.target.checked) setErrors((prev) => { const { languageConfirm, ...rest } = prev; return rest })
                      }}
                      className="mt-0.5 h-4 w-4 rounded border-border accent-emerald-600 shrink-0"
                    />
                    <span className="text-xs leading-relaxed text-muted-foreground">
                      {hasNonPrimarySelection
                        ? t('langConfirmedAllSet')
                        : t('langConfirmDefault')
                      }
                    </span>
                  </label>
                  {errors.languageConfirm && <FieldError message={errors.languageConfirm} />}
                </div> */}

                {/* Submit error */}
                {errors.submit && (
                  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                                  bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{errors.submit}</p>
                  </div>
                )}

                {/* Submit */}
                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="submit-btn w-full flex items-center justify-center gap-2.5
                               px-6 py-4 rounded-xl text-[15px] font-semibold
                               text-white bg-emerald-600 hover:bg-emerald-700
                               disabled:opacity-50 disabled:cursor-not-allowed
                               shadow-lg shadow-emerald-600/25"
                  >
                    {authLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>{t('creatingAccount')}</span>
                      </>
                    ) : (
                      <>
                        <span>{t('createAccountBtn')}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                </form>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="mt-6 text-center animate-fade-up delay-2">
            <p className="text-sm text-muted-foreground">
              {t('alreadyHaveAccount')}{' '}
              <Link href="/login"
                    className="text-emerald-600 hover:text-emerald-500 font-semibold
                               no-underline transition-colors duration-200">
                {t('signIn')}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

/* ── Small helper components ──────────────────────────────────────────── */

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 mt-1.5 font-medium">
      <span className="w-1 h-1 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
      {message}
    </p>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const t = useTranslations('registerPage')
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['', t('strengthWeak'), t('strengthFair'), t('strengthGood'), t('strengthStrong')]
  const colors = ['', 'bg-destructive/60', 'bg-[hsl(var(--tip-foreground))]', 'bg-primary/70', 'bg-[hsl(var(--success))]']
  const textColors = ['', 'text-destructive/60', 'text-[hsl(var(--tip-foreground))]', 'text-primary/80', 'text-[hsl(var(--success))]']

  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-0.5 flex-1 rounded-full transition-all duration-300
                        ${i <= score ? colors[score] : 'bg-border'}`}
          />
        ))}
      </div>
      <p className={`text-[10px] font-medium transition-colors duration-300 ${textColors[score]}`}>
        {labels[score]}
      </p>
    </div>
  )
}

export default function RegisterPage() {
  if (!GOOGLE_CLIENT_ID) {
    return <RegisterPageContent />
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <RegisterPageContent />
    </GoogleOAuthProvider>
  )
}




