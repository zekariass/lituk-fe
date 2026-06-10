"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowRight, Loader2, CheckCircle2, ChevronLeft, RotateCcw } from 'lucide-react'
import axios from 'axios'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [focused, setFocused] = useState(false)

  const validateEmail = (email: string) => {
    if (!email.trim()) {
      return 'Email is required'
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Invalid email format'
    }
    return ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateEmail(email)
    if (validationError) {
      setError(validationError)
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || ''
      await axios.post(`${apiBaseUrl}/api/v1/auth/forgot-password`, { email })
      setIsSuccess(true)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputCls = [
    'w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-foreground',
    'placeholder:text-muted-foreground/40 outline-none',
    'transition-all duration-200',
    error
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
            href="/login"
            className="inline-flex items-center gap-1.5 mb-6 text-xs font-medium
                       uppercase tracking-[0.1em] text-emerald-600 hover:text-emerald-500
                       no-underline transition-all duration-200 hover:-translate-x-0.5"
          >
            <ChevronLeft size={13} strokeWidth={2.5} />
            Back to Login
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
              {isSuccess ? 'Check your email' : 'Forgot password?'}
            </h1>
            <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
              {isSuccess
                ? 'We sent you a password reset link'
                : 'Enter your email to receive a reset link'}
            </p>
          </div>

          {/* ── Card ── */}
          <div className="animate-fade-up delay-1
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-6 sm:p-8">

            {isSuccess ? (
              <div className="animate-fade-slide space-y-5">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                                  flex items-center justify-center
                                  shadow-md shadow-emerald-600/10">
                    <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  We've sent a password reset link to{' '}
                  <strong className="text-foreground font-semibold">{email}</strong>.
                  Please check your inbox and follow the instructions.
                </p>
                <p className="text-center text-xs text-muted-foreground/60">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => { setIsSuccess(false); setEmail('') }}
                  className="mx-auto flex items-center gap-2 text-xs font-medium text-emerald-600 hover:text-emerald-500
                             transition-colors duration-200"
                >
                  <RotateCcw size={12} />
                  Try a different email
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="animate-fade-slide space-y-5">

                {/* Email field */}
                <div className="space-y-1.5">
                  <label htmlFor="email"
                         className="block text-[10px] font-semibold tracking-[0.12em]
                                    uppercase text-muted-foreground/70">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                                 transition-colors duration-200"
                      style={{ color: focused ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setError('')
                      }}
                      onFocus={() => setFocused(true)}
                      onBlur={() => setFocused(false)}
                      className={inputCls}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  {error && <FieldError message={error} />}
                </div>

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
                        <span>Sending link…</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
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

/* ── Small helper component ──────────────────────────────────────────── */

function FieldError({ message }: { message: string }) {
  return (
    <p className="flex items-center gap-1.5 text-[11px] text-red-500 dark:text-red-400 mt-1.5 font-medium">
      <span className="w-1 h-1 rounded-full bg-red-500 dark:bg-red-400 shrink-0" />
      {message}
    </p>
  )
}
