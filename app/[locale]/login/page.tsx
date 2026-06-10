"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import { Loader2, Mail, Lock, ArrowRight, Eye, EyeOff, ChevronLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google'

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''

function LoginPageContent() {
  const router = useRouter()
  const { login, googleLogin, isLoading } = useAuthStore()
  const t = useTranslations('loginPage')

  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleGoogleLogin = async (credentialResponse: any) => {
    try {
      await googleLogin(credentialResponse.credential)
      router.push('/practice')
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || t('invalidCredentials'),
      })
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.email.trim()) {
      newErrors.email = t('emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('invalidEmail')
    }
    if (!formData.password) {
      newErrors.password = t('passwordRequired')
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!validateForm()) return
    try {
      await login(formData.email, formData.password)
      router.push('/practice')
    } catch (error: any) {
      setErrors({
        submit: error.response?.data?.message || t('invalidCredentials'),
      })
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
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50%      { transform: translateY(-8px); }
        }

        .animate-fade-up   { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-slide { animation: fadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-float      { animation: float 6s ease-in-out infinite; }

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
            className="inline-flex items-center gap-1.5 mb-6 text-xs font-medium
                       uppercase tracking-[0.1em] text-emerald-600 hover:text-emerald-500
                       no-underline transition-all duration-200 hover:-translate-x-0.5"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
            {t('home')}
          </Link>

          {/* ── Logo + heading ── */}
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
                HabeshaDrive
              </span>
            </Link>

            <h1 className="font-syne font-bold text-[28px] sm:text-[34px] tracking-tight leading-none">
              {t('welcomeBack')}
            </h1>
            <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
              {t('subtitle')}
            </p>
          </div>

          {/* ── Card ── */}
          <div className="animate-fade-up delay-1
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-6 sm:p-8">

            {/* Google Sign-In Button */}
            {GOOGLE_CLIENT_ID && (
              <>
                <div className="mb-6 animate-fade-slide">
                  <GoogleLogin
                    onSuccess={handleGoogleLogin}
                    onError={() => {
                      setErrors({ submit: t('invalidCredentials') })
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

            <form onSubmit={handleSubmit} noValidate className="animate-fade-slide space-y-5">

              {/* Email field */}
              <div className="space-y-1.5">
                <label htmlFor="email"
                       className="block text-[10px] font-semibold tracking-[0.12em]
                                  uppercase text-muted-foreground/70">
                  {t('emailLabel')}
                </label>
                <div className="relative">
                  <Mail
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                               transition-colors duration-200"
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

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password"
                         className="block text-[10px] font-semibold tracking-[0.12em]
                                    uppercase text-muted-foreground/70">
                    {t('passwordLabel')}
                  </label>
                  <Link href="/password/forgot-password"
                        className="text-[12px] font-medium text-emerald-600/70 hover:text-emerald-600
                                   transition-colors no-underline">
                    {t('forgotPassword')}
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    size={14}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                               transition-colors duration-200"
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
                    autoComplete="current-password"
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
              </div>

              {/* Submit-level error */}
              {errors.submit && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                                bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                  <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{errors.submit}</p>
                </div>
              )}

              {/* Submit button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-btn w-full flex items-center justify-center gap-2.5
                             px-6 py-4 rounded-xl text-[15px] font-semibold
                             text-white bg-emerald-600 hover:bg-emerald-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg shadow-emerald-600/25"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('signingIn')}</span>
                    </>
                  ) : (
                    <>
                      <span>{t('signIn')}</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* ── Footer ── */}
          <div className="mt-6 text-center animate-fade-up delay-2">
            <p className="text-sm text-muted-foreground">
              {t('noAccount')}{' '}
              <Link href="/register"
                    className="text-emerald-600 hover:text-emerald-500 font-semibold
                               no-underline transition-colors duration-200">
                {t('createOne')}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}

/* ── Small helper component ──────────────────────────────────────────── */

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 mt-1.5 font-medium">
      <span className="w-1 h-1 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
      {message}
    </p>
  )
}

export default function LoginPage() {
  if (!GOOGLE_CLIENT_ID) {
    return <LoginPageContent />
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <LoginPageContent />
    </GoogleOAuthProvider>
  )
}