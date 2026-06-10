"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { guestContactApi, ContactThread } from "@/lib/api/contact"
import {
  Loader2, Search, Send, ChevronLeft, Hash, Mail, ArrowLeft,
  MessageCircle, Clock, CheckCircle2, XCircle, Copy, Check, User, Shield,
} from "lucide-react"
import Link from "next/link"

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
}

const STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  NEW: {
    label: "New",
    cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/40",
    icon: <Clock size={11} />,
  },
  READ: {
    label: "Read",
    cls: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-700/40",
    icon: <CheckCircle2 size={11} />,
  },
  REPLIED: {
    label: "Replied",
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40",
    icon: <MessageCircle size={11} />,
  },
  CLOSED: {
    label: "Closed",
    cls: "bg-red-100 text-red-600 dark:bg-red-900/25 dark:text-red-400 border-red-200 dark:border-red-800/40",
    icon: <XCircle size={11} />,
  },
}

export default function TrackContactPage() {
  const searchParams = useSearchParams()
  const [reference, setReference] = useState(searchParams.get("ref") || "")
  const [email, setEmail] = useState("")
  const [focused, setFocused] = useState<string | null>(null)
  const [thread, setThread] = useState<ContactThread | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [replyMessage, setReplyMessage] = useState("")
  const [isReplying, setIsReplying] = useState(false)
  const [replySent, setReplySent] = useState(false)
  const [copiedRef, setCopiedRef] = useState(false)

  const handleCopyRef = () => {
    if (!thread) return
    navigator.clipboard.writeText(thread.reference)
    setCopiedRef(true)
    setTimeout(() => setCopiedRef(false), 2000)
  }

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reference.trim() || !email.trim()) {
      setError("Please enter both reference number and email")
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format")
      return
    }

    setIsLoading(true)
    setError("")
    setThread(null)

    try {
      const response = await guestContactApi.trackThread(reference, email)
      if (response.success) {
        setThread(response.data)
      }
    } catch (err: any) {
      console.error("Failed to track message:", err)
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Message not found. Please check your reference number and email."
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyMessage.trim() || !thread) return

    setIsReplying(true)
    setError("")

    try {
      const response = await guestContactApi.replyToThread(thread.reference, {
        guestEmail: email,
        message: replyMessage,
      })

      if (response.success) {
        setThread(response.data)
        setReplyMessage("")
        setReplySent(true)
        setTimeout(() => setReplySent(false), 3000)
      }
    } catch (err: any) {
      console.error("Failed to send reply:", err)
      setError(
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        "Failed to send reply. Please try again."
      )
    } finally {
      setIsReplying(false)
    }
  }

  const handleNewTrack = () => {
    setThread(null)
    setReference("")
    setEmail("")
    setError("")
    setReplyMessage("")
    setReplySent(false)
  }

  const inputCls = (field: string, hasError = false) =>
    [
      'w-full pl-11 pr-4 py-3.5 rounded-xl text-sm text-foreground',
      'placeholder:text-muted-foreground/40 outline-none',
      'transition-all duration-200',
      hasError
        ? 'bg-destructive/[0.04] border border-destructive/30 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/10'
        : 'bg-background border border-border/60 focus:border-emerald-500/50 focus:bg-emerald-50/30 dark:focus:bg-emerald-950/10 focus:ring-2 focus:ring-emerald-500/10',
    ].join(' ')

  const textareaCls = (hasError = false) =>
    [
      'w-full px-4 py-3.5 rounded-xl text-sm text-foreground resize-none',
      'placeholder:text-muted-foreground/40 outline-none',
      'transition-all duration-200',
      hasError
        ? 'bg-destructive/[0.04] border border-destructive/30 focus:border-destructive/50 focus:ring-2 focus:ring-destructive/10'
        : 'bg-background border border-border/60 focus:border-emerald-500/50 focus:bg-emerald-50/30 dark:focus:bg-emerald-950/10 focus:ring-2 focus:ring-emerald-500/10',
    ].join(' ')

  /* ── Thread view ── */
  if (thread) {
    const status = STATUS_CONFIG[thread.status] || STATUS_CONFIG.NEW
    return (
      <PageShell>
        <div className="relative z-10 w-full max-w-[560px]">

          {/* Back to search */}
          <button
            onClick={handleNewTrack}
            className="inline-flex items-center gap-1.5 mb-6 text-xs font-medium
                       uppercase tracking-[0.1em] text-emerald-600 hover:text-emerald-500
                       transition-all duration-200 hover:-translate-x-0.5 bg-transparent border-none cursor-pointer"
          >
            <ArrowLeft size={13} strokeWidth={2.5} />
            New Search
          </button>

          {/* ── Header card ── */}
          <div className="animate-fade-up
                          border border-border/50 rounded-2xl
                          bg-card/70 backdrop-blur-md
                          shadow-xl shadow-black/[0.04]
                          p-5 sm:p-6 mb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="font-syne font-bold text-lg sm:text-xl tracking-tight text-foreground leading-snug truncate">
                  {thread.subject}
                </h1>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-1.5">
                    <Hash size={12} className="text-muted-foreground/50" />
                    <span className="font-mono text-xs font-semibold text-muted-foreground tracking-wider">
                      {thread.reference}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyRef}
                    className="p-1 rounded-md text-muted-foreground/40 hover:text-foreground
                               hover:bg-muted/50 transition-all duration-200"
                    title="Copy reference"
                  >
                    {copiedRef ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground/50 mt-1.5">
                  Created {formatDate(thread.createdAt)}
                </p>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px]
                                font-semibold tracking-wide uppercase border ${status.cls}`}>
                {status.icon}
                {status.label}
              </span>
            </div>
          </div>

          {/* ── Messages ── */}
          <div className="animate-fade-up delay-1 space-y-2.5 mb-4">
            {thread.messages.map((message, index) => {
              const isGuest = message.senderType === "GUEST"
              return (
                <div
                  key={message.id}
                  className={[
                    'p-4 rounded-2xl border transition-all duration-200',
                    isGuest
                      ? 'ml-0 mr-6 sm:mr-10 bg-emerald-50/50 dark:bg-emerald-950/15 border-emerald-200/40 dark:border-emerald-800/25'
                      : 'ml-6 sm:ml-10 mr-0 bg-card/80 dark:bg-card/60 border-border/40',
                  ].join(' ')}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <div className={[
                        'w-6 h-6 rounded-full flex items-center justify-center',
                        isGuest
                          ? 'bg-emerald-600/10 dark:bg-emerald-600/20'
                          : 'bg-blue-600/10 dark:bg-blue-600/20',
                      ].join(' ')}>
                        {isGuest
                          ? <User size={11} className="text-emerald-600" />
                          : <Shield size={11} className="text-blue-600 dark:text-blue-400" />
                        }
                      </div>
                      <span className={[
                        'text-[11px] font-semibold uppercase tracking-wide',
                        isGuest ? 'text-emerald-700 dark:text-emerald-400' : 'text-blue-700 dark:text-blue-400',
                      ].join(' ')}>
                        {isGuest ? "You" : "Admin"}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground/60 font-medium">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                    {message.message}
                  </p>
                </div>
              )
            })}
          </div>

          {/* ── Reply form ── */}
          {thread.status !== "CLOSED" ? (
            <div className="animate-fade-up delay-2
                            border border-border/50 rounded-2xl
                            bg-card/70 backdrop-blur-md
                            shadow-xl shadow-black/[0.04]
                            p-5 sm:p-6 mb-4">

              {replySent && (
                <div className="flex items-center gap-2.5 mb-4 px-3.5 py-2.5 rounded-xl
                                bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/30
                                animate-fade-up">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                    Reply sent successfully
                  </p>
                </div>
              )}

              <label htmlFor="reply"
                     className="block text-[10px] font-semibold tracking-[0.12em]
                                uppercase text-muted-foreground/70 mb-2">
                Send a Reply
              </label>

              <form onSubmit={handleReply} className="space-y-3.5">
                <div>
                  <textarea
                    id="reply"
                    value={replyMessage}
                    onChange={(e) => { setReplyMessage(e.target.value); setError("") }}
                    onFocus={() => setFocused('reply')}
                    onBlur={() => setFocused(null)}
                    className={textareaCls()}
                    placeholder="Type your reply…"
                    rows={4}
                    maxLength={5000}
                  />
                  <div className="flex justify-end mt-1.5">
                    <p className="text-[10px] text-muted-foreground/50">
                      {replyMessage.length.toLocaleString()} / 5,000
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                                  bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                    <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isReplying || !replyMessage.trim()}
                  className="submit-btn w-full flex items-center justify-center gap-2.5
                             px-6 py-3.5 rounded-xl text-[14px] font-semibold
                             text-white bg-emerald-600 hover:bg-emerald-700
                             disabled:opacity-50 disabled:cursor-not-allowed
                             shadow-lg shadow-emerald-600/25"
                >
                  {isReplying ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      <span>Sending…</span>
                    </>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Send Reply</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <div className="animate-fade-up delay-2
                            flex items-center gap-3 px-4 py-3.5 rounded-xl mb-4
                            border border-red-200/40 dark:border-red-800/25
                            bg-red-50/50 dark:bg-red-950/10">
              <XCircle size={16} className="text-red-500/70 shrink-0" />
              <p className="text-xs text-red-600/80 dark:text-red-400/80 font-medium">
                This thread has been closed and no further replies can be sent.
              </p>
            </div>
          )}

          {/* ── Track another ── */}
          <div className="animate-fade-up delay-3">
            <button
              onClick={handleNewTrack}
              className="w-full flex items-center justify-center gap-2.5
                         px-6 py-3.5 rounded-xl text-[14px] font-medium
                         text-muted-foreground border border-border/60
                         hover:border-emerald-500/30 hover:text-foreground
                         transition-all duration-200"
            >
              <Search size={14} />
              Track Another Message
            </button>
          </div>
        </div>
      </PageShell>
    )
  }

  /* ── Search form ── */
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
            Track your message
          </h1>
          <p className="text-sm text-muted-foreground mt-2.5 tracking-wide">
            Enter your reference number and email to view your thread
          </p>
        </div>

        {/* ── Card ── */}
        <div className="animate-fade-up delay-1
                        border border-border/50 rounded-2xl
                        bg-card/70 backdrop-blur-md
                        shadow-xl shadow-black/[0.04]
                        p-6 sm:p-8">

          <form onSubmit={handleTrack} noValidate className="animate-fade-slide space-y-5">

            {/* Reference Number */}
            <div className="space-y-1.5">
              <label htmlFor="reference"
                     className="block text-[10px] font-semibold tracking-[0.12em]
                                uppercase text-muted-foreground/70">
                Reference Number
              </label>
              <div className="relative">
                <Hash
                  size={14}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none
                             transition-colors duration-200"
                  style={{ color: focused === 'reference' ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.35)' }}
                />
                <input
                  id="reference"
                  type="text"
                  value={reference}
                  onChange={(e) => { setReference(e.target.value); setError("") }}
                  onFocus={() => setFocused('reference')}
                  onBlur={() => setFocused(null)}
                  className={inputCls('reference')}
                  placeholder="10000001"
                  maxLength={8}
                  autoComplete="off"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email"
                     className="block text-[10px] font-semibold tracking-[0.12em]
                                uppercase text-muted-foreground/70">
                Your Email
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
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError("") }}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  className={inputCls('email')}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl
                              bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0 mt-1" />
                <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">{error}</p>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
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
                    <span>Searching…</span>
                  </>
                ) : (
                  <>
                    <Search size={16} />
                    <span>Track Message</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Footer ── */}
        <div className="mt-6 text-center animate-fade-up delay-2">
          <p className="text-sm text-muted-foreground">
            Need to send a new message?{' '}
            <Link href="/contact"
                  className="text-emerald-600 hover:text-emerald-500 font-semibold
                             no-underline transition-colors duration-200">
              Contact us
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
