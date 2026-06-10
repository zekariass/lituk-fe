"use client"

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Lock, ArrowRight, Loader2, CheckCircle2, Eye, EyeOff, ChevronLeft, ShieldCheck, Check, X } from 'lucide-react'
import axios from 'axios'

export default function ResetPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  useEffect(() => {
    if (!token) {
      setErrors({ submit: 'Invalid or missing reset token' })
    }
  }, [token])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!token) {
      setErrors({ submit: 'Invalid or missing reset token' })
      return
    }

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      await axios.post(`${apiBaseUrl}/api/v1/auth/reset-password`, {
        token,
        newPassword: formData.password,
      })
      setIsSuccess(true)
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (err: any) {
      console.error('Reset password error:', err)
      console.error('Error response:', err.response?.data)
      
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.response?.data?.error 
        || err.response?.data?.detail
        || err.message 
        || 'Failed to reset password. Please try again.'
      
      setErrors({
        submit: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = (field: string) =>
    [
      'w-full pl-11 pr-11 py-3.5 rounded-xl text-sm text-foreground',
      'placeholder:text-muted-foreground/40 outline-none',
      'transition-all duration-200',
      errors[field]
        ? 'bg-destructive/[0.04] border border-destructive/30 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/10'
        : 'bg-background border border-border/60 focus:border-emerald-500/50 focus:bg-emerald-50/30 dark:focus:bg-emerald-950/10 focus:ring-2 focus:ring-emerald-500/10',
    ].join(' ')

  const passwordsMatch = formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword

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
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes checkDraw {
          from { stroke-dashoffset: 24; }
          to   { stroke-dashoffset: 0; }
        }

        .animate-fade-up    { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-slide  { animation: fadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-float       { animation: float 6s ease-in-out infinite; }
        .animate-scale-in    { animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }

        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }
        .delay-5 { animation-delay: 0.40s; }

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

        {/* Content */}
        <div className="relative z-10 w-full max-w-[440px]">

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mb-6 text-xs font-medium
                       uppercase tracking-[0.1em] text-emerald-600 hover:text-emerald-500
                       no-underline transition-all duration-200 hover:-translate-x-0.5"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
            Home
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
                LITUK
              </span>
            </Link>

            <h1 className="font-syne font-bold text-[28px] sm:text-[34px]
                           tracking-tight leading-none">
              {isSuccess ? 'Password reset!' : 'Reset your password'}
            </h1>
            <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
              {isSuccess 
                ? 'Your password has been successfully reset' 
                : 'Choose a strong new password for your account'}
            </p>
          </div>

          {/* ── Card ── */}
          <div className="animate-fade-up delay-1
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-6 sm:p-8">

            {isSuccess ? (
              <div className="space-y-5 py-2">
                <div className="flex justify-center animate-scale-in">
                  <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                                  flex items-center justify-center
                                  shadow-lg shadow-emerald-600/10">
                    <ShieldCheck size={36} className="text-emerald-600" />
                  </div>
                </div>
                <div className="space-y-2 animate-fade-up delay-1">
                  <p className="text-center text-sm text-foreground font-medium leading-relaxed">
                    Your password has been successfully reset.
                  </p>
                  <p className="text-center text-sm text-muted-foreground leading-relaxed">
                    You can now sign in with your new password.
                  </p>
                </div>
                <div className="animate-fade-up delay-2 pt-1">
                  <Link
                    href="/login"
                    className="submit-btn w-full flex items-center justify-center gap-2.5
                               px-6 py-4 rounded-xl text-[15px] font-semibold
                               text-white bg-emerald-600 hover:bg-emerald-700
                               no-underline shadow-lg shadow-emerald-600/25"
                  >
                    <span>Go to Sign In</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
                <p className="text-center text-[11px] text-muted-foreground/60 animate-fade-up delay-3">
                  Redirecting automatically in a few seconds…
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="animate-fade-slide space-y-5">

                {/* Password field */}
                <div className="space-y-1.5">
                  <label htmlFor="password"
                         className="block text-[10px] font-semibold tracking-[0.12em]
                                    uppercase text-muted-foreground/70">
                    New Password
                  </label>
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
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value })
                        setErrors({ ...errors, password: '' })
                      }}
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
                  
                  {/* Password strength indicator */}
                  {formData.password && !errors.password && (
                    <PasswordStrength password={formData.password} />
                  )}

                  {/* Password requirements checklist */}
                  {formData.password && (
                    <PasswordRequirements password={formData.password} />
                  )}
                </div>

                {/* Confirm Password field */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword"
                         className="block text-[10px] font-semibold tracking-[0.12em]
                                    uppercase text-muted-foreground/70">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                                 transition-colors duration-200"
                      style={{ color: focused === 'confirmPassword' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => {
                        setFormData({ ...formData, confirmPassword: e.target.value })
                        setErrors({ ...errors, confirmPassword: '' })
                      }}
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
                  {/* Real-time match indicator */}
                  {formData.confirmPassword && !errors.confirmPassword && (
                    <p className={`flex items-center gap-1.5 text-[11px] font-medium mt-1.5 transition-colors duration-200
                                   ${passwordsMatch ? 'text-emerald-600' : 'text-muted-foreground/50'}`}>
                      {passwordsMatch ? (
                        <>
                          <Check size={11} strokeWidth={3} />
                          Passwords match
                        </>
                      ) : (
                        <>
                          <X size={11} strokeWidth={3} />
                          Passwords don&apos;t match yet
                        </>
                      )}
                    </p>
                  )}
                </div>

                {/* Submit error */}
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
                    disabled={isLoading || !token}
                    className="submit-btn w-full flex items-center justify-center gap-2.5
                               px-6 py-4 rounded-xl text-[15px] font-semibold
                               text-white bg-emerald-600 hover:bg-emerald-700
                               disabled:opacity-50 disabled:cursor-not-allowed
                               shadow-lg shadow-emerald-600/25"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>Resetting password…</span>
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="mt-6 text-center animate-fade-up delay-2">
            <p className="text-sm text-muted-foreground">
              Remember your password?{' '}
              <Link href="/login"
                    className="text-emerald-600 hover:text-emerald-500 font-semibold
                               no-underline transition-colors duration-200">
                Sign in
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

function PasswordRequirements({ password }: { password: string }) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One number', met: /[0-9]/.test(password) },
    { label: 'One special character', met: /[^A-Za-z0-9]/.test(password) },
  ]

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-2">
      {requirements.map((req) => (
        <div key={req.label} className="flex items-center gap-1.5">
          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                          ${req.met
                            ? 'bg-emerald-100 dark:bg-emerald-900/40'
                            : 'bg-muted/40'}`}>
            {req.met ? (
              <Check size={8} strokeWidth={3} className="text-emerald-600" />
            ) : (
              <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
            )}
          </div>
          <span className={`text-[10px] transition-colors duration-200
                           ${req.met ? 'text-emerald-600 font-medium' : 'text-muted-foreground/50'}`}>
            {req.label}
          </span>
        </div>
      ))}
    </div>
  )
}

function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong']
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
      {score > 0 && (
        <p className={`text-[10px] font-medium ${textColors[score]}`}>{labels[score]}</p>
      )}
    </div>
  )
}
