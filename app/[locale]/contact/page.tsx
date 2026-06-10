"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { guestContactApi, userContactApi } from "@/lib/api/contact"
import { Loader2, CheckCircle2, XCircle, ChevronLeft, User, Mail, MessageSquare, Send, ArrowRight, Copy, Check, Search } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuthStore()
  
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    subject: "",
    message: "",
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [focused, setFocused] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [referenceNumber, setReferenceNumber] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [copied, setCopied] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!isAuthenticated) {
      if (!formData.guestName.trim()) {
        newErrors.guestName = "Name is required"
      } else if (formData.guestName.length > 255) {
        newErrors.guestName = "Name must be less than 255 characters"
      }

      if (!formData.guestEmail.trim()) {
        newErrors.guestEmail = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
        newErrors.guestEmail = "Invalid email format"
      } else if (formData.guestEmail.length > 255) {
        newErrors.guestEmail = "Email must be less than 255 characters"
      }
    }

    if (!formData.subject.trim()) {
      newErrors.subject = "Subject is required"
    } else if (formData.subject.length > 255) {
      newErrors.subject = "Subject must be less than 255 characters"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.length > 5000) {
      newErrors.message = "Message must be less than 5000 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      if (isAuthenticated) {
        // Logged-in user
        const response = await userContactApi.createThread({
          subject: formData.subject,
          message: formData.message,
        })
        
        if (response.success) {
          setReferenceNumber(response.data.reference)
          setSubmitStatus("success")
          // Redirect to profile messages after 2 seconds
          setTimeout(() => {
            router.push("/profile?tab=messages")
          }, 2000)
        }
      } else {
        // Guest user
        const response = await guestContactApi.createThread({
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          subject: formData.subject,
          message: formData.message,
        })
        
        if (response.success) {
          setReferenceNumber(response.data.reference)
          setSubmitStatus("success")
        }
      }
    } catch (error: any) {
      console.error("Failed to submit contact form:", error)
      setSubmitStatus("error")
      setErrorMessage(
        error.response?.data?.error?.message || 
        error.response?.data?.message ||
        "Failed to send message. Please try again."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
  }

  const handleCopyRef = () => {
    navigator.clipboard.writeText(referenceNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const textareaCls = (field: string) =>
    [
      'w-full px-4 py-3.5 rounded-xl text-sm text-foreground resize-none',
      'placeholder:text-muted-foreground/40 outline-none',
      'transition-all duration-200',
      errors[field]
        ? 'bg-destructive/[0.04] border border-destructive/30 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/10'
        : 'bg-background border border-border/60 focus:border-emerald-500/50 focus:bg-emerald-50/30 dark:focus:bg-emerald-950/10 focus:ring-2 focus:ring-emerald-500/10',
    ].join(' ')

  /* ── Success screen ── */
  if (submitStatus === "success") {
    return (
      <PageShell>
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

          <div className="text-center mb-8 animate-fade-up">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-7 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center
                              shadow-md shadow-emerald-600/25 group-hover:shadow-emerald-600/40 transition-shadow">
                <img src="/logo.svg" alt="LITUK logo" className="w-5 h-5 shrink-0" />
              </div>
              <span className="font-syne font-extrabold text-[20px] tracking-tight text-foreground">
                LITUK
              </span>
            </Link>
            <h1 className="font-syne font-bold text-[28px] sm:text-[34px] tracking-tight leading-none">
              Message sent!
            </h1>
            <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
              We&apos;ll get back to you as soon as possible
            </p>
          </div>

          <div className="animate-fade-up delay-1
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-6 sm:p-8">
            <div className="space-y-5 py-2">
              <div className="flex justify-center animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30
                                flex items-center justify-center
                                shadow-lg shadow-emerald-600/10">
                  <CheckCircle2 size={36} className="text-emerald-600" />
                </div>
              </div>

              {/* Reference number */}
              <div className="animate-fade-up delay-1">
                <p className="text-center text-[10px] font-semibold tracking-[0.12em]
                              uppercase text-muted-foreground/70 mb-2">
                  Reference Number
                </p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-bold text-lg text-foreground tracking-wider">
                    {referenceNumber}
                  </span>
                  <button
                    onClick={handleCopyRef}
                    className="p-1.5 rounded-lg text-muted-foreground/50 hover:text-foreground
                               hover:bg-muted/50 transition-all duration-200"
                    title="Copy reference number"
                  >
                    {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 animate-fade-up delay-2">
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  {isAuthenticated
                    ? "You can view and track your message in your profile."
                    : "Please save this reference number to track your message. We\u2019ve sent a confirmation to your email."}
                </p>
              </div>

              <div className="animate-fade-up delay-3 space-y-2.5 pt-1">
                {isAuthenticated ? (
                  <Link
                    href="/profile?tab=messages"
                    className="submit-btn w-full flex items-center justify-center gap-2.5
                               px-6 py-4 rounded-xl text-[15px] font-semibold
                               text-white bg-emerald-600 hover:bg-emerald-700
                               no-underline shadow-lg shadow-emerald-600/25"
                  >
                    <span>View Messages</span>
                    <ArrowRight size={16} />
                  </Link>
                ) : (
                  <>
                    <Link
                      href={`/contact/track?ref=${referenceNumber}`}
                      className="submit-btn w-full flex items-center justify-center gap-2.5
                                 px-6 py-4 rounded-xl text-[15px] font-semibold
                                 text-white bg-emerald-600 hover:bg-emerald-700
                                 no-underline shadow-lg shadow-emerald-600/25"
                    >
                      <Search size={16} />
                      <span>Track Your Message</span>
                    </Link>
                    <Link
                      href="/"
                      className="w-full flex items-center justify-center gap-2.5
                                 px-6 py-3.5 rounded-xl text-[14px] font-medium
                                 text-muted-foreground border border-border/60
                                 hover:border-emerald-500/30 hover:text-foreground
                                 no-underline transition-all duration-200"
                    >
                      Back to Home
                    </Link>
                  </>
                )}
              </div>

              {isAuthenticated && (
                <p className="text-center text-[11px] text-muted-foreground/60 animate-fade-up delay-4">
                  Redirecting to your messages…
                </p>
              )}
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  /* ── Error screen ── */
  if (submitStatus === "error") {
    return (
      <PageShell>
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

          <div className="text-center mb-8 animate-fade-up">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-7 group">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center
                              shadow-md shadow-emerald-600/25 group-hover:shadow-emerald-600/40 transition-shadow">
                <img src="/logo.svg" alt="LITUK logo" className="w-5 h-5 shrink-0" />
              </div>
              <span className="font-syne font-extrabold text-[20px] tracking-tight text-foreground">
                LITUK
              </span>
            </Link>
            <h1 className="font-syne font-bold text-[28px] sm:text-[34px] tracking-tight leading-none">
              Something went wrong
            </h1>
            <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
              We couldn&apos;t send your message
            </p>
          </div>

          <div className="animate-fade-up delay-1
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-6 sm:p-8">
            <div className="space-y-5 py-2">
              <div className="flex justify-center animate-scale-in">
                <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20
                                flex items-center justify-center
                                shadow-lg shadow-red-600/10">
                  <XCircle size={36} className="text-red-500" />
                </div>
              </div>

              <div className="space-y-2 animate-fade-up delay-1">
                <p className="text-center text-sm text-muted-foreground leading-relaxed">
                  {errorMessage}
                </p>
              </div>

              <div className="animate-fade-up delay-2 space-y-2.5 pt-1">
                <button
                  onClick={() => setSubmitStatus("idle")}
                  className="submit-btn w-full flex items-center justify-center gap-2.5
                             px-6 py-4 rounded-xl text-[15px] font-semibold
                             text-white bg-emerald-600 hover:bg-emerald-700
                             shadow-lg shadow-emerald-600/25"
                >
                  <span>Try Again</span>
                  <ArrowRight size={16} />
                </button>
                <Link
                  href="/"
                  className="w-full flex items-center justify-center gap-2.5
                             px-6 py-3.5 rounded-xl text-[14px] font-medium
                             text-muted-foreground border border-border/60
                             hover:border-emerald-500/30 hover:text-foreground
                             no-underline transition-all duration-200"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageShell>
    )
  }

  /* ── Main form ── */
  return (
    <PageShell>
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
              <img src="/logo.svg" alt="LITUK logo" className="w-5 h-5 shrink-0" />
            </div>
            <span className="font-syne font-extrabold text-[20px] tracking-tight text-foreground">
              LITUK
            </span>
          </Link>

          <h1 className="font-syne font-bold text-[28px] sm:text-[34px] tracking-tight leading-none">
            Get in touch
          </h1>
          <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
            {isAuthenticated
              ? "Send us a message and we\u2019ll get back to you soon"
              : "Fill out the form and we\u2019ll get back to you soon"}
          </p>
        </div>

        {/* ── Logged-in user badge ── */}
        {isAuthenticated && user && (
          <div className="animate-fade-up delay-1 mb-5
                          flex items-center gap-3 px-4 py-3 rounded-xl
                          border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
            <div className="w-8 h-8 rounded-full bg-emerald-600/10 flex items-center justify-center">
              <User size={14} className="text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">
                {user.fullName || user.email}
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                Sending as logged-in user
              </p>
            </div>
          </div>
        )}

        {/* ── Card ── */}
        <div className="animate-fade-up delay-1
                        border border-border/50 rounded-2xl
                        bg-card/70 backdrop-blur-md
                        shadow-xl shadow-black/[0.04]
                        p-6 sm:p-8">

          <form onSubmit={handleSubmit} noValidate className="animate-fade-slide space-y-5">

            {/* Guest fields */}
            {!isAuthenticated && (
              <>
                {/* Name */}
                <div className="space-y-1.5">
                  <label htmlFor="guestName"
                         className="block text-[10px] font-semibold tracking-[0.12em]
                                    uppercase text-muted-foreground/70">
                    Your Name
                  </label>
                  <div className="relative">
                    <User
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                                 transition-colors duration-200"
                      style={{ color: focused === 'guestName' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="guestName"
                      type="text"
                      value={formData.guestName}
                      onChange={(e) => handleChange("guestName", e.target.value)}
                      onFocus={() => setFocused('guestName')}
                      onBlur={() => setFocused(null)}
                      className={inputCls('guestName')}
                      placeholder="John Doe"
                      maxLength={255}
                      autoComplete="name"
                    />
                  </div>
                  {errors.guestName && <FieldError message={errors.guestName} />}
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="guestEmail"
                         className="block text-[10px] font-semibold tracking-[0.12em]
                                    uppercase text-muted-foreground/70">
                    Your Email
                  </label>
                  <div className="relative">
                    <Mail
                      size={14}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                                 transition-colors duration-200"
                      style={{ color: focused === 'guestEmail' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                    />
                    <input
                      id="guestEmail"
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) => handleChange("guestEmail", e.target.value)}
                      onFocus={() => setFocused('guestEmail')}
                      onBlur={() => setFocused(null)}
                      className={inputCls('guestEmail')}
                      placeholder="you@example.com"
                      maxLength={255}
                      autoComplete="email"
                    />
                  </div>
                  {errors.guestEmail && <FieldError message={errors.guestEmail} />}
                </div>
              </>
            )}

            {/* Subject */}
            <div className="space-y-1.5">
              <label htmlFor="subject"
                     className="block text-[10px] font-semibold tracking-[0.12em]
                                uppercase text-muted-foreground/70">
                Subject
              </label>
              <div className="relative">
                <MessageSquare
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                             transition-colors duration-200"
                  style={{ color: focused === 'subject' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                />
                <input
                  id="subject"
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                  className={inputCls('subject')}
                  placeholder="How can we help you?"
                  maxLength={255}
                />
              </div>
              {errors.subject && <FieldError message={errors.subject} />}
            </div>

            {/* Message */}
            <div className="space-y-1.5">
              <label htmlFor="message"
                     className="block text-[10px] font-semibold tracking-[0.12em]
                                uppercase text-muted-foreground/70">
                Message
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => handleChange("message", e.target.value)}
                onFocus={() => setFocused('message')}
                onBlur={() => setFocused(null)}
                className={textareaCls('message')}
                placeholder="Please describe your question or issue…"
                rows={5}
                maxLength={5000}
              />
              <div className="flex justify-between items-center">
                {errors.message ? (
                  <FieldError message={errors.message} />
                ) : (
                  <p className="text-[10px] text-muted-foreground/50">
                    {formData.message.length.toLocaleString()} / 5,000
                  </p>
                )}
              </div>
            </div>

            {/* Submit error */}
            {errors.submit && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                              bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{errors.submit}</p>
              </div>
            )}

            {/* Actions */}
            <div className="pt-3 space-y-2.5">
              <button
                type="submit"
                disabled={isSubmitting}
                className="submit-btn w-full flex items-center justify-center gap-2.5
                           px-6 py-4 rounded-xl text-[15px] font-semibold
                           text-white bg-emerald-600 hover:bg-emerald-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           shadow-lg shadow-emerald-600/25"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Sending…</span>
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    <span>Send Message</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5
                           px-6 py-3.5 rounded-xl text-[14px] font-medium
                           text-muted-foreground border border-border/60
                           hover:border-emerald-500/30 hover:text-foreground
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="mt-6 text-center animate-fade-up delay-2">
          <p className="text-sm text-muted-foreground">
            Have a reference number?{' '}
            <Link href="/contact/track"
                  className="text-emerald-600 hover:text-emerald-500 font-semibold
                             no-underline transition-colors duration-200">
              Track your message
            </Link>
          </p>
        </div>

      </div>
    </PageShell>
  )
}

/* ── Layout shell with background effects ──────────────────────────── */

function PageShell({ children }: { children: React.ReactNode }) {
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

        .animate-fade-up    { animation: fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-slide  { animation: fadeSlide 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-float       { animation: float 6s ease-in-out infinite; }
        .animate-scale-in    { animation: scaleIn 0.4s cubic-bezier(0.22,1,0.36,1) both; }

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

        {children}
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
