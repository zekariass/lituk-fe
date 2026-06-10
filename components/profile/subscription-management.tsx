"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  CreditCard, Calendar, CheckCircle2, XCircle,
  AlertCircle, Loader2, ArrowUpCircle, RefreshCw, X,
} from 'lucide-react'
import { UserEntitlementStatus } from '@/lib/types'
import { useAuthStore } from '@/lib/store'
import {
  getUserSubscriptions,
  reactivateSubscription,
  cancelSubscriptionManagement,
} from '@/lib/services/payment-service'

// ── Status badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; Icon: typeof CheckCircle2 }> = {
    active: {
      label: 'Active',
      className: 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20',
      Icon: CheckCircle2,
    },
    canceled: {
      label: 'Cancelled',
      className: 'text-amber-300 bg-amber-300/10 border-amber-300/20',
      Icon: AlertCircle,
    },
    past_due: {
      label: 'Past Due',
      className: 'text-orange-300 bg-orange-300/10 border-orange-300/20',
      Icon: AlertCircle,
    },
    expired: {
      label: 'Expired',
      className: 'text-red-400 bg-red-400/10 border-red-400/20',
      Icon: XCircle,
    },
  }
  const cfg = map[status] ?? {
    label: status,
    className: 'text-muted-foreground bg-muted/50 border-border',
    Icon: AlertCircle,
  }
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium
                      tracking-widest uppercase px-2.5 py-1 rounded-full border ${cfg.className}`}>
      <cfg.Icon size={10} />
      {cfg.label}
    </span>
  )
}

// ── Shared card shell ─────────────────────────────────────────────────────
function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6
                    shadow-[0_4px_24px_rgba(0,0,0,0.10)]">
      {children}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────
function SectionHeader({ onUpgrade }: { onUpgrade: () => void }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20
                        flex items-center justify-center shrink-0">
          <CreditCard size={14} className="text-primary" />
        </div>
        <h3 className="font-syne font-bold text-base tracking-tight">Your Subscription</h3>
      </div>
      <button
        onClick={onUpgrade}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-primary/70 cursor-pointer
                   hover:text-primary transition-colors duration-200 bg-emerald-500/[0.3] hover:bg-emerald-500/50 rounded-md px-3 py-2"
      >
        <ArrowUpCircle size={13} />
        Upgrade Plan
      </button>
    </div>
  )
}

export const SubscriptionManagement = () => {
  const router = useRouter()
  const { user } = useAuthStore()

  const [entitlementStatus, setEntitlementStatus] = useState<UserEntitlementStatus | null>(null)
  const [isLoading, setIsLoading]                 = useState(true)
  const [error, setError]                         = useState<string | null>(null)
  const [processing, setProcessing]               = useState(false)
  const [showCancelDialog, setShowCancelDialog]   = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [successMessage, setSuccessMessage]       = useState<string | null>(null)

  useEffect(() => { fetchSubscriptions() }, [])

  const fetchSubscriptions = async () => {
    if (!user?.activeJurisdictionId) { setIsLoading(false); return }
    try {
      setIsLoading(true)
      setError(null)
      setEntitlementStatus(await getUserSubscriptions(user.activeJurisdictionId))
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscriptions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!user?.activeJurisdictionId) return
    setProcessing(true)
    setError(null)
    try {
      const result = await cancelSubscriptionManagement(user.activeJurisdictionId, {
        cancelAtPeriodEnd: true,
        cancellationReason: cancellationReason || undefined,
      })
      await fetchSubscriptions()
      setShowCancelDialog(false)
      setSuccessMessage(result.message)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel subscription')
      setShowCancelDialog(false)
    } finally {
      setProcessing(false)
    }
  }

  const handleReactivate = async () => {
    if (!user?.activeJurisdictionId || !entitlementStatus?.entitlement?.id) return
    setProcessing(true)
    try {
      await reactivateSubscription(user.activeJurisdictionId, entitlementStatus.entitlement.id)
      await fetchSubscriptions()
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reactivate subscription')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpgrade = () => router.push('/practice/pricing')

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <CardShell>
        <SectionHeader onUpgrade={handleUpgrade} />
        <div className="flex items-center justify-center py-14">
          <Loader2 size={24} className="animate-spin text-primary/50" />
        </div>
      </CardShell>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error && !entitlementStatus) {
    return (
      <CardShell>
        <SectionHeader onUpgrade={handleUpgrade} />
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border
                        bg-red-400/[0.07] border-red-400/20">
          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400/80 font-light flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400/40 hover:text-red-400 shrink-0">
            <X size={13} />
          </button>
        </div>
      </CardShell>
    )
  }

  // ── No subscription ──────────────────────────────────────────────────────
  if (!entitlementStatus?.hasActiveEntitlement || !entitlementStatus.entitlement) {
    return (
      <CardShell>
        <SectionHeader onUpgrade={handleUpgrade} />
        <div className="flex flex-col items-center text-center py-10 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-muted/50 border border-border
                          flex items-center justify-center">
            <CreditCard size={22} className="text-muted-foreground" />
          </div>
          <div>
            <h4 className="font-syne font-bold text-base tracking-tight mb-1">No Active Subscription</h4>
            <p className="text-xs text-muted-foreground font-light max-w-xs">
              Subscribe to unlock all features and access premium content
            </p>
          </div>
          <button
            onClick={handleUpgrade}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                       text-primary-foreground bg-primary
                       hover:opacity-85 hover:-translate-y-px transition-all duration-200
                       [box-shadow:0_0_20px_hsl(var(--primary)/0.25)]"
          >
            View Pricing Plans
          </button>
        </div>
      </CardShell>
    )
  }

  const ent = entitlementStatus.entitlement
  const isCancelled   = ent.status === 'canceled'
  const isActive      = ent.status === 'active'
  const showCancel    = isActive && ent.autoRenew && ent.purchaseType === 'subscription' && ent.provider !== 'revenuecat'
  const showReactivate = isCancelled && !ent.autoRenew

  return (
    <>
      {/* ── Success banner ── */}
      {successMessage && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border mb-4
                        bg-emerald-300/[0.07] border-emerald-300/20">
          <CheckCircle2 size={13} className="text-emerald-300 shrink-0 mt-0.5" />
          <p className="text-xs text-emerald-300/80 font-light flex-1">{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-300/40 hover:text-emerald-300 shrink-0">
            <X size={13} />
          </button>
        </div>
      )}

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border mb-4
                        bg-red-400/[0.07] border-red-400/20">
          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
          <p className="text-xs text-red-400/80 font-light flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400/40 hover:text-red-400 shrink-0">
            <X size={13} />
          </button>
        </div>
      )}

      <CardShell>
        <SectionHeader onUpgrade={handleUpgrade} />

        {/* ── Entitlement detail ── */}
        <div className="border border-border rounded-xl overflow-hidden">

          {/* Top section: plan info */}
          <div className="px-5 py-5 space-y-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <p className="font-syne font-bold text-lg tracking-tight capitalize">
                    {ent.purchaseType}
                  </p>
                  <StatusBadge status={ent.status} />
                </div>
                <p className="text-xs text-muted-foreground font-light">{entitlementStatus.jurisdictionName}</p>
              </div>

              <div className="text-right">
                <p className="font-syne font-extrabold text-2xl text-primary">
                  {ent.currency} {ent.amount.toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground capitalize">per {ent.billingPeriod}</p>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              {[
                { label: 'Start Date', date: ent.startsAt },
                { label: isCancelled ? 'Ends On' : 'Expires On', date: ent.expiresAt },
              ].map(({ label, date }) => (
                <div key={label} className="px-3.5 py-3 rounded-xl bg-muted/30 border border-border">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-1.5">
                    {label}
                  </p>
                  <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <Calendar size={12} className="text-muted-foreground shrink-0" />
                    {new Date(date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            {/* Days remaining */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border
                            bg-sky-300/[0.1] border-sky-700">
              <Calendar size={13} className="text-sky-500 shrink-0" />
              <p className="text-xs text-sky-300 font-light">
                <span className="font-bold text-sky-500">{ent.daysRemaining} days</span> remaining
                {ent.provider === 'revenuecat' && <span className="text-sky-400"> (Subscribed from mobile app)</span>}
              </p>
            </div>

            {/* Cancelled notice */}
            {ent.canceledAt && (
              <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl border
                              bg-amber-300/[0.1] border-amber-300/[0.55]">
                <AlertCircle size={14} className="text-amber-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-300 mb-0.5">Subscription Cancelled</p>
                  <p className="text-xs text-amber-500 font-bold leading-relaxed">
                    Cancelled on {new Date(ent.canceledAt).toLocaleDateString()}.
                    Access continues until {new Date(ent.expiresAt).toLocaleDateString()} — no further charges.
                  </p>
                </div>
              </div>
            )}

            {/* Will cancel notice */}
            {isCancelled && !ent.canceledAt && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border
                              bg-amber-300/[0.06] border-amber-300/[0.14]">
                <AlertCircle size={13} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-500 font-light">
                  Subscription active until{' '}
                  <span className="text-amber-500 font-bold">
                    {new Date(ent.expiresAt).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 px-5 py-4 border-t border-border bg-muted/20">
            {showCancel && (
              <button
                onClick={() => setShowCancelDialog(true)}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           text-sm font-medium text-red-400 border border-red-400/25 bg-red-400/[0.07]
                           hover:bg-red-400/[0.14] hover:border-red-400/40
                           disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
              >
                {processing ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                {processing ? 'Processing…' : 'Cancel'}
              </button>
            )}

            {showReactivate && (
              <button
                onClick={handleReactivate}
                disabled={processing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                           text-sm font-medium text-primary-foreground bg-primary
                           hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200
                           [box-shadow:0_0_16px_hsl(var(--primary)/0.22)]"
              >
                {processing
                  ? <Loader2 size={14} className="animate-spin" />
                  : <RefreshCw size={14} />}
                {processing ? 'Processing…' : 'Reactivate'}
              </button>
            )}

            <button
              onClick={handleUpgrade}
              className="row-hover flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5
                         border border-dashed border-emerald-500/70 rounded-xl
                         text-sm text-muted-foreground/50
                         hover:text-foreground/70 hover:border-emerald-500/[0.3] bg-emerald-500/[0.1] hover:bg-emerald-500/[0.2] 
                         transition-all no-underline cursor-pointer"
            >
              Change Plan
            </button>
          </div>
        </div>
      </CardShell>

      {/* ── Cancel dialog ── */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-sm flex items-center
                        justify-center z-50 p-4">
          <div className="border border-border rounded-2xl max-w-sm w-full
                          shadow-[0_24px_64px_rgba(0,0,0,0.35)] overflow-hidden"
               style={{ backgroundColor: 'var(--background)' }}>

            {/* Dialog header */}
            <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-border">
              <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20
                              flex items-center justify-center shrink-0">
                <AlertCircle size={16} className="text-red-400" />
              </div>
              <h3 className="font-syne font-bold text-base tracking-tight text-red-400">
                Cancel Subscription?
              </h3>
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={processing}
                className="ml-auto text-foreground/25 hover:text-foreground/60 disabled:opacity-30
                           transition-colors duration-200"
              >
                <X size={15} />
              </button>
            </div>

            {/* Dialog body */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-sm text-muted-foreground font-light leading-relaxed">
                Your subscription will stay active until the end of your billing period.
                You won't lose access immediately.
              </p>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                  Why are you cancelling?{' '}
                  <span className="normal-case tracking-normal text-muted-foreground/70">(optional)</span>
                </label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm font-light
                             border border-border
                             focus:outline-none focus:border-foreground/25
                             transition-colors duration-200"
                  style={{ color: 'var(--foreground)', backgroundColor: 'var(--background)' }}
                >
                  <option value="">Select a reason…</option>
                  <option value="Too expensive">Too expensive</option>
                  <option value="Not using enough">Not using enough</option>
                  <option value="Found alternative">Found a better alternative</option>
                  <option value="Technical issues">Technical issues</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Dialog footer */}
            <div className="px-6 pb-6 pt-2 flex gap-2.5 border-t border-border">
              <button
                onClick={() => setShowCancelDialog(false)}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-foreground/55 border border-border bg-muted/30
                           hover:text-foreground/85 hover:border-foreground/20
                           disabled:opacity-40 transition-all duration-200"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelSubscription}
                disabled={processing}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                           flex items-center justify-center gap-2
                           text-white bg-red-400
                           hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200
                           [box-shadow:0_0_20px_rgba(248,113,113,0.25)]"
              >
                {processing
                  ? <><Loader2 size={14} className="animate-spin" /> Cancelling…</>
                  : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}