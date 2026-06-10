"use client"

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useAuthStore, useSubscriptionStore, useJurisdictionLanguageStore } from '@/lib/store'
import {
  Loader2, AlertCircle, CheckCircle2,
  ArrowUp, Zap, X,
  Shield, CreditCard, ChevronDown, Clock,
} from 'lucide-react'
import { createCheckoutSession, upgradeSubscription, downgradeSubscription } from '@/lib/services/payment-service'
import { UserEntitlementStatus, SubscriptionPackage, JurisdictionLanguage } from '@/lib/types'
import { SubscriptionManagementModal } from '@/components/subscription/subscription-management-modal'
import { motion, AnimatePresence, Variants } from 'framer-motion'

// ── Animation variants ──────────────────────────────────────────────────────
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
}
const scaleFade: Variants = {
  hidden: { opacity: 0, scale: 0.95, y: 16 },
  show:   { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
}

// ── Currency symbol helper ──────────────────────────────────────────────────
function getCurrencySymbol(currency: string): string {
  const map: Record<string, string> = {
    GBP: '£', USD: '$', EUR: '€', ETB: 'Br', KES: 'KSh', NGN: '₦',
    ZAR: 'R', INR: '₹', AUD: 'A$', CAD: 'C$', JPY: '¥', CNY: '¥',
  }
  return map[currency.toUpperCase()] ?? currency
}

// ── Sale helpers ─────────────────────────────────────────────────────────────
function hasSale(pkg: SubscriptionPackage): boolean {
  if (!pkg.saleType || pkg.saleType === 'NONE' || !pkg.saleValue || pkg.saleValue <= 0) return false
  if (!pkg.saleExpireAt) return false
  return new Date(pkg.saleExpireAt).getTime() > Date.now()
}

function getSalePrice(pkg: SubscriptionPackage): number {
  if (pkg.saleType === 'PERCENTAGE') return pkg.amountMajor * (1 - pkg.saleValue / 100)
  if (pkg.saleType === 'FIXED') return Math.max(0, pkg.amountMajor - pkg.saleValue)
  return pkg.amountMajor
}

function getGroupSaleExpiry(packages: SubscriptionPackage[]): Date | null {
  const expiries = packages
    .filter(hasSale)
    .map(p => new Date(p.saleExpireAt!))
  if (expiries.length === 0) return null
  return new Date(Math.min(...expiries.map(d => d.getTime())))
}

// ── Sale countdown ───────────────────────────────────────────────────────────
function SaleCountdown({ expiry, t }: { expiry: Date; t: ReturnType<typeof useTranslations> }) {
  const calcRemaining = useCallback(() => {
    const diff = expiry.getTime() - Date.now()
    if (diff <= 0) return { diff: 0, hours: 0, minutes: 0, seconds: 0, expired: true }
    return {
      diff,
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
      expired: false,
    }
  }, [expiry])

  const [remaining, setRemaining] = useState(calcRemaining)

  useEffect(() => {
    const id = setInterval(() => setRemaining(calcRemaining()), 1000)
    return () => clearInterval(id)
  }, [calcRemaining])

  if (remaining.expired) return null

  const pad = (n: number) => String(n).padStart(2, '0')
  const totalHours = remaining.diff / 3600000

  let display: string
  if (totalHours >= 24) {
    const totalDays = remaining.diff / 86400000
    const rounded = remaining.hours >= 12 ? Math.ceil(totalDays) : Math.floor(totalDays)
    display = `${rounded} ${t('days')}`
  } else {
    display = `${pad(remaining.hours)}:${pad(remaining.minutes)}:${pad(remaining.seconds)}`
  }

  return (
    <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs text-red-500 font-medium tabular-nums whitespace-nowrap">
      <Clock size={10} className="shrink-0" />
      {t('saleEndsIn')} {display}
    </span>
  )
}

// ── Alert banner ────────────────────────────────────────────────────────────
function AlertBanner({
  type,
  message,
  title,
  onDismiss,
}: {
  type: 'success' | 'error' | 'warning'
  message: string
  title?: string
  onDismiss: () => void
}) {
  const styles = {
    success: {
      wrap: 'bg-primary/[0.07] border-primary/20',
      icon: 'text-primary',
      text: 'text-primary/90',
      btn:  'text-primary/50 hover:text-primary',
      Icon: CheckCircle2,
    },
    error: {
      wrap: 'bg-red-400/[0.07] border-red-400/20',
      icon: 'text-red-400',
      text: 'text-red-400/90',
      btn:  'text-red-400/50 hover:text-red-400',
      Icon: AlertCircle,
    },
    warning: {
      wrap: 'bg-amber-300/[0.07] border-amber-300/20',
      icon: 'text-amber-300',
      text: 'text-amber-300/90',
      btn:  'text-amber-300/50 hover:text-amber-300',
      Icon: AlertCircle,
    },
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={`flex items-start gap-3 p-4 rounded-2xl border ${styles.wrap}`}
    >
      <styles.Icon size={16} className={`${styles.icon} shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${styles.text} mb-0.5`}>{title}</p>}
        <p className={`text-sm ${styles.text} font-light`}>{message}</p>
      </div>
      <button onClick={onDismiss} className={`shrink-0 transition-colors duration-200 ${styles.btn}`}>
        <X size={15} />
      </button>
    </motion.div>
  )
}

// ── Skeleton row ────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-border animate-pulse">
      <div className="h-4 w-28 rounded bg-muted/40" />
      <div className="flex items-center gap-4">
        <div className="h-4 w-24 rounded bg-muted/30" />
        <div className="h-8 w-20 rounded-lg bg-muted/30" />
      </div>
    </div>
  )
}

// ── FAQ Accordion item ──────────────────────────────────────────────────────
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div
      className="border border-border rounded-xl overflow-hidden
                 bg-card/60 backdrop-blur-sm
                 transition-all duration-200 hover:border-foreground/15"
    >
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-5 py-4 text-left
                   transition-colors duration-200 hover:bg-muted/20"
      >
        <span className="font-syne font-semibold text-[0.94rem] tracking-tight pr-4">{question}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="shrink-0"
        >
          <ChevronDown size={16} className="text-muted-foreground" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-0">
              <p className="text-sm text-muted-foreground font-light leading-relaxed">{answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Package row ─────────────────────────────────────────────────────────────
function PackageRow({
  pkg,
  isActive,
  isUpgrade,
  isProcessing,
  hasActiveSubscription,
  showSale = true,
  entitlementAmount,
  onAction,
  t,
}: {
  pkg: SubscriptionPackage
  isActive: boolean
  isUpgrade: boolean
  isProcessing: boolean
  hasActiveSubscription: boolean
  showSale?: boolean
  entitlementAmount?: number
  onAction: (pkg: SubscriptionPackage) => void
  t: ReturnType<typeof useTranslations>
}) {
  const symbol = getCurrencySymbol(pkg.currency)
  const isMissing = !pkg.stripePriceId
  const onSale = showSale && hasSale(pkg)
  const salePrice = onSale ? getSalePrice(pkg) : null

  // For the active package, show actual entitlement amount if it differs from list price
  const hasEntitlementOverride = isActive && entitlementAmount != null && entitlementAmount !== pkg.amountMajor

  // Determine button label
  let buttonLabel: string | null = null
  if (isProcessing) buttonLabel = t('processing')
  else if (isActive) buttonLabel = t('currentPlan')
  else if (isMissing) buttonLabel = t('notAvailable')
  else if (isUpgrade) buttonLabel = t('upgrade')
  else if (hasActiveSubscription && !isUpgrade) buttonLabel = null
  else if (!hasActiveSubscription) buttonLabel = t('subscribeNow')

  // Button style per action type
  const buttonStyle = isProcessing
    ? 'bg-zinc-500 text-white'
    : isMissing
    ? 'bg-slate-500/70 text-white/80'
    : isUpgrade
    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20'
    : 'bg-amber-600/60 text-white hover:bg-amber-700 shadow-sm shadow-amber-600/20'

  return (
    <motion.div
      variants={fadeUp}
      className={`flex items-center justify-between gap-1.5 sm:gap-3 px-2 sm:px-4 py-2.5 sm:py-3.5 rounded-xl border
                  transition-all duration-200
                  ${isActive
                    ? 'border-emerald-500 border-2 bg-emerald-500/[0.05]'
                    : 'border-border bg-card/70 hover:border-foreground/20 hover:bg-card/90'}`}
    >
      {/* Left: name + sale countdown */}
      <div className="min-w-0">
        <h3 className="font-semibold text-sm sm:text-base md:text-lg tracking-tight text-foreground truncate">
          {pkg.name}
        </h3>
        {onSale && pkg.saleExpireAt && (
          <SaleCountdown expiry={new Date(pkg.saleExpireAt)} t={t} />
        )}
      </div>

      {/* Right: price + button */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        {/* Price */}
        <div className="text-right whitespace-nowrap">
          {hasEntitlementOverride ? (
            <>
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through tabular-nums mr-1">
                {symbol}{pkg.amountMajor.toFixed(2)}
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-bold text-primary tabular-nums">
                {symbol}{entitlementAmount!.toFixed(2)}
              </span>
            </>
          ) : onSale && salePrice !== null ? (
            <>
              <span className="text-[10px] sm:text-xs text-muted-foreground line-through tabular-nums mr-1">
                {symbol}{pkg.amountMajor.toFixed(2)}
              </span>
              <span className="text-xs sm:text-lg md:text-xl font-extrabold text-red-500 tabular-nums">
                {symbol}{salePrice.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xs sm:text-lg md:text-xl font-bold text-primary tabular-nums">
              {symbol}{pkg.amountMajor.toFixed(2)}
            </span>
          )}
          <span className="text-[10px] hidden sm:inline sm:text-xs md:text-sm text-muted-foreground font-light ml-1">
            {pkg.periodDisplay}
          </span>
        </div>

        {/* Action */}
        {isActive ? (
          <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg
                           text-[10px] sm:text-xs font-semibold
                           bg-emerald-500 text-white whitespace-nowrap">
            <CheckCircle2 size={11} className="hidden sm:block" />
            {t('currentPlan')}
          </span>
        ) : buttonLabel ? (
          <button
            onClick={() => onAction(pkg)}
            disabled={isProcessing || isMissing}
            className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-4 py-1 sm:py-2 rounded-lg
                       text-[10px] sm:text-xs md:text-sm font-semibold whitespace-nowrap cursor-pointer
                       transition-all duration-200
                       disabled:opacity-40 disabled:cursor-not-allowed
                       active:scale-[0.98] ${buttonStyle}`}
          >
            {isProcessing && <Loader2 size={12} className="animate-spin" />}
            {isUpgrade && !isProcessing && <ArrowUp size={12} />}
            {buttonLabel}
          </button>
        ) : null}
      </div>
    </motion.div>
  )
}

export default function PricingPage() {
  const t = useTranslations('pricingPage')
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason')
  const { user } = useAuthStore()
  const {
    packages, isLoading, error, fetchPackages, clearError,
    userEntitlement, fetchUserEntitlement,
  } = useSubscriptionStore()

  const [mounted, setMounted]                         = useState(false)
  const [processingPackageId, setProcessingPackageId] = useState<number | null>(null)
  const [checkoutError, setCheckoutError]             = useState<string | null>(null)
  const [modalOpen, setModalOpen]                     = useState(false)
  const [modalAction, setModalAction]                 = useState<'upgrade' | 'downgrade'>('upgrade')
  const [selectedPackage, setSelectedPackage]         = useState<SubscriptionPackage | null>(null)
  const [currentActivePackage, setCurrentActivePackage] = useState<SubscriptionPackage | null>(null)
  const [successMessage, setSuccessMessage]           = useState<string | null>(null)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!mounted || !user?.activeJurisdictionId) return
    console.log('[Pricing] Fetching packages and entitlement for jurisdiction:', user.activeJurisdictionId)
    fetchPackages(user.activeJurisdictionId)
    fetchUserEntitlement(user.activeJurisdictionId)
  }, [mounted, user?.activeJurisdictionId, fetchPackages, fetchUserEntitlement])

  const handleModalConfirm = async (data: any) => {
    if (!user?.activeJurisdictionId || !selectedPackage) return
    try {
      const fn = modalAction === 'upgrade' ? upgradeSubscription : downgradeSubscription
      const result = await fn(user.activeJurisdictionId, data)
      setSuccessMessage(result.message)
      await fetchPackages(user.activeJurisdictionId)
      await fetchUserEntitlement(user.activeJurisdictionId)
      setTimeout(() => setSuccessMessage(null), 5000)
    } catch (err) {
      throw err
    }
  }

  const handleSubscriptionAction = async (pkg: SubscriptionPackage) => {
    const hasActive = userEntitlement?.hasActiveEntitlement && userEntitlement?.entitlement?.status === 'active'
    if (!hasActive) { await handleSubscribe(pkg); return }

    const currentPkg = packages.find(p =>
      p.code.toLowerCase().trim() === userEntitlement?.entitlement?.localPriceCode?.toLowerCase().trim()
    )
    if (!currentPkg) { await handleSubscribe(pkg); return }

    setCurrentActivePackage(currentPkg)
    setSelectedPackage(pkg)

    if (pkg.amountMajor > currentPkg.amountMajor)      { setModalAction('upgrade');   setModalOpen(true) }
    else if (pkg.amountMajor < currentPkg.amountMajor) { /* Downgrade disabled - do nothing */ }
    else await handleSubscribe(pkg)
  }

  const handleSubscribe = async (pkg: SubscriptionPackage) => {
    if (!user?.activeJurisdictionId) { setCheckoutError(t('selectJurisdiction')); return }
    if (!pkg.stripePriceId)          { setCheckoutError(t('notConfigured')); return }

    setProcessingPackageId(pkg.id)
    setCheckoutError(null)
    try {
      const purchaseType: 'subscription' | 'lifetime' = pkg.period.toLowerCase().includes('lifetime')
        ? 'lifetime' : 'subscription'
      const response = await createCheckoutSession(user.activeJurisdictionId, {
        purchaseType,
        subscriptionPackageId: pkg.id,
        billingPeriod: pkg.period,
        priceId: pkg.stripePriceId,
        successUrl: `${window.location.origin}/practice/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl:  `${window.location.origin}/practice/pricing?canceled=true`,
      })
      if (response.url) window.location.href = response.url
      else if (response.sessionId) window.location.href = `https://checkout.stripe.com/c/pay/${response.sessionId}`
      else throw new Error('No checkout URL received')
    } catch (err: any) {
      setCheckoutError(err.response?.data?.message || t('paymentError'))
    } finally {
      setProcessingPackageId(null)
    }
  }

  if (!mounted) return null

  if (!user?.activeJurisdictionId) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center text-center gap-4
                     bg-amber-300/[0.07] border border-amber-300/20 rounded-2xl p-8"
        >
          <div className="w-12 h-12 rounded-2xl bg-muted/30 border border-border
                          flex items-center justify-center">
            <AlertCircle size={22} className="text-amber-300" />
          </div>
          <p className="text-sm text-amber-300/80 font-light leading-relaxed">
            {t('selectJurisdiction')}
          </p>
        </motion.div>
      </div>
    )
  }

  const hasActive = userEntitlement?.hasActiveEntitlement && userEntitlement?.entitlement?.status === 'active'

  return (
    <>
      <div className="font-dm min-h-screen text-foreground">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/[0.04] rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/6 w-72 h-72 bg-accent/[0.06] rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-2 sm:px-5 py-10 sm:py-5 space-y-10">
          <motion.div
            initial="hidden" animate="show" variants={stagger}
            className="text-center space-y-4"
          >
            <motion.h1 variants={fadeUp}
              className="font-syne font-extrabold text-3xl sm:text-[2.6rem] sm:leading-[1.15] tracking-tight"
            >
              {t('chooseYourPlan')}
            </motion.h1>
          </motion.div>

          <AnimatePresence>
            <div className="space-y-3">
              {reason === 'free_usage_exceeded' && (
                <AlertBanner
                  type="warning"
                  title={t('freeTestsExhaustedTitle')}
                  message={t('freeTestsExhaustedMessage')}
                  onDismiss={() => {
                    const url = new URL(window.location.href)
                    url.searchParams.delete('reason')
                    window.history.replaceState({}, '', url.toString())
                  }}
                />
              )}
              {successMessage && (
                <AlertBanner type="success" message={successMessage} onDismiss={() => setSuccessMessage(null)} />
              )}
              {error && (
                <AlertBanner type="error" message={error} title={t('error')} onDismiss={clearError} />
              )}
              {checkoutError && (
                <AlertBanner type="error" message={checkoutError} title={t('paymentError')} onDismiss={() => setCheckoutError(null)} />
              )}
            </div>
          </AnimatePresence>

          {isLoading ? (
            <div className="max-w-2xl mx-auto space-y-3">
              {[1, 2, 3].map(i => <SkeletonRow key={i} />)}
            </div>
          ) : packages.length === 0 ? (
            <motion.div
              initial="hidden" animate="show" variants={scaleFade}
              className="flex flex-col items-center text-center py-16 gap-4
                         border border-border rounded-2xl bg-card/60 backdrop-blur-sm"
            >
              <div className="w-14 h-14 rounded-2xl bg-muted/30 border border-border
                              flex items-center justify-center">
                <Zap size={22} className="text-foreground/20" />
              </div>
              <div>
                <p className="text-base font-medium text-muted-foreground">{t('noPackages')}</p>
                <p className="text-sm text-foreground/30 mt-1 font-light">{t('checkBackLater')}</p>
              </div>
            </motion.div>
          ) : (
            <PricingGroups
              packages={packages}
              userRole={user?.role}
              hasActive={!!hasActive}
              userEntitlement={userEntitlement}
              processingPackageId={processingPackageId}
              jurisdictionId={user?.activeJurisdictionId!}
              onAction={handleSubscriptionAction}
              t={t}
            />
          )}

          {packages.length > 0 && (
            <motion.div initial="hidden" animate="show" variants={fadeUp} className="text-center">
              <p className="text-sm text-muted-foreground font-light">
                {t('renewsAutomatically')}{' '}
                <a href="/terms" className="underline underline-offset-2 hover:text-foreground transition-colors">
                  {t('termsApply')}
                </a>
              </p>
            </motion.div>
          )}

          {packages.length > 0 && (
            <motion.div
              initial="hidden" animate="show" variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-muted-foreground"
            >
              <div className="flex items-center gap-2 text-xs font-light">
                <Shield size={14} className="text-primary/60" />
                <span>{t('trustSecure')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-light">
                <CreditCard size={14} className="text-primary/60" />
                <span>{t('trustPayments')}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-light">
                <CheckCircle2 size={14} className="text-primary/60" />
                <span>{t('trustCancel')}</span>
              </div>
            </motion.div>
          )}

          {packages.length > 0 && (
            <motion.div
              initial="hidden" animate="show" variants={stagger}
              className="pt-2 pb-6"
            >
              <motion.h2 variants={fadeUp}
                className="font-syne font-bold text-2xl tracking-tight text-center mb-6"
              >
                {t('faqTitle')}
              </motion.h2>
              <div className="max-w-2xl mx-auto space-y-2.5">
                {[
                  { q: t('faqCancel'), a: t('faqCancelAnswer') },
                  { q: t('faqPaymentMethods'), a: t('faqPaymentMethodsAnswer') },
                  { q: t('faqFreeTrial'), a: t('faqFreeTrialAnswer') },
                ].map(({ q, a }) => (
                  <motion.div key={q} variants={fadeUp}>
                    <FaqItem question={q} answer={a} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <SubscriptionManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action={modalAction}
        currentPackage={currentActivePackage || undefined}
        targetPackage={selectedPackage || undefined}
        entitlementAmount={userEntitlement?.entitlement?.amount}
        showTargetSale={currentActivePackage?.withTranslation !== selectedPackage?.withTranslation}
        onConfirm={handleModalConfirm}
      />
    </>
  )
}

// ── Pricing groups (with translation / no translation) ──────────────────────
function PricingGroups({
  packages,
  userRole,
  hasActive,
  userEntitlement,
  processingPackageId,
  jurisdictionId,
  onAction,
  t,
}: {
  packages: SubscriptionPackage[]
  userRole: string | undefined
  hasActive: boolean
  userEntitlement: UserEntitlementStatus | null
  processingPackageId: number | null
  jurisdictionId: number
  onAction: (pkg: SubscriptionPackage) => void
  t: ReturnType<typeof useTranslations>
}) {
  const { languages, fetchJurisdictionLanguages } = useJurisdictionLanguageStore()

  useEffect(() => {
    if (jurisdictionId) fetchJurisdictionLanguages(jurisdictionId)
  }, [jurisdictionId, fetchJurisdictionLanguages])

  // Filter test packages for non-admin users
  const visiblePackages = packages.filter(pkg => {
    const isTestPackage = pkg.code?.toUpperCase().includes('TEST')
    return !isTestPackage || userRole === 'admin'
  })

  const withTranslation    = visiblePackages.filter(p => p.withTranslation === true)
  const withoutTranslation = visiblePackages.filter(p => p.withTranslation === false)

  // Determine current active package
  const currentPkg = hasActive
    ? packages.find(p =>
        p.code.toLowerCase().trim() === userEntitlement?.entitlement?.localPriceCode?.toLowerCase().trim()
      )
    : null

  const isActivePackage = (pkg: SubscriptionPackage) =>
    hasActive &&
    pkg.code.toLowerCase().trim() === userEntitlement?.entitlement?.localPriceCode?.toLowerCase().trim()

  const isUpgradePackage = (pkg: SubscriptionPackage) =>
    !!currentPkg && pkg.amountMajor > currentPkg.amountMajor

  // Determine sale visibility per group
  // Active in "With Translation" → hide discounts in BOTH groups
  // Active in "No Translation" → hide discounts only in "No Translation" group
  const activeInWithTranslation = !!currentPkg && currentPkg.withTranslation === true
  const activeInNoTranslation   = !!currentPkg && currentPkg.withTranslation === false
  const showSaleWithTranslation = !activeInWithTranslation
  const showSaleNoTranslation   = !activeInWithTranslation && !activeInNoTranslation

  // Active languages for the "supported languages" display (including primary)
  const activeLanguages = languages.filter((l: JurisdictionLanguage) => l.isActive)
  const primaryLanguage = languages.find((l: JurisdictionLanguage) => l.isPrimary)

  return (
    <div className="max-w-2xl mx-auto space-y-10">

      {/* ── Group 1: With Translation ── */}
      {withTranslation.length > 0 && (
        <motion.div initial="hidden" animate="show" variants={stagger}
          className="space-y-4 rounded-2xl border border-blue-500/30 bg-blue-500/[0.06] p-2 sm:p-4 md:p-6">
          {/* Group header */}
          <motion.div variants={fadeUp} className="space-y-2">
            <h2 className="font-syne font-bold text-lg tracking-tight">
              {t('withTranslationGroup')}
            </h2>

            {/* Supported languages */}
            {activeLanguages.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* <p className="text-xs text-muted-foreground font-light">
                  {t('withTranslationDesc')}
                </p> */}
                {activeLanguages.map((lang: JurisdictionLanguage) => (
                  <span
                    key={lang.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md
                               bg-emerald-500/[0.25] border border-primary/15 text-xs font-medium text-foreground/70"
                  >
                    {lang.flagUrl && (
                      <Image
                        src={lang.flagUrl}
                        alt={lang.name}
                        width={14}
                        height={10}
                        className="rounded-[2px] object-cover"
                      />
                    )}
                    {lang.displayName}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Package rows */}
          <div className="space-y-2">
            {withTranslation.map(pkg => (
              <PackageRow
                key={pkg.id}
                pkg={pkg}
                isActive={isActivePackage(pkg)}
                isUpgrade={isUpgradePackage(pkg)}
                isProcessing={processingPackageId === pkg.id}
                hasActiveSubscription={hasActive}
                showSale={showSaleWithTranslation}
                entitlementAmount={userEntitlement?.entitlement?.amount}
                onAction={onAction}
                t={t}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Group 2: No Translation ── */}
      {withoutTranslation.length > 0 && (
        <motion.div initial="hidden" animate="show" variants={stagger}
          className="space-y-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.06] p-2 sm:p-4 md:p-6">
          {/* Group header */}
          <motion.div variants={fadeUp} className="space-y-2">
            <h2 className="font-syne font-bold text-lg tracking-tight text-foreground/70">
              {t('noTranslationGroup')}
            </h2>
            {primaryLanguage && (
              <div className="flex items-center gap-2 flex-wrap">
                {/* <p className="text-xs text-muted-foreground font-light">
                  {t('noTranslationDesc')}
                </p> */}
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md
                                 bg-emerald-500/[0.25] border border-primary/15 text-xs font-medium text-foreground/70">
                  {primaryLanguage.flagUrl && (
                    <Image
                      src={primaryLanguage.flagUrl}
                      alt={primaryLanguage.name}
                      width={14}
                      height={10}
                      className="rounded-[2px] object-cover"
                    />
                  )}
                  {primaryLanguage.displayName}
                </span>
              </div>
            )}
          </motion.div>

          {/* Package rows */}
          <div className="space-y-2">
            {withoutTranslation.map(pkg => (
              <PackageRow
                key={pkg.id}
                pkg={pkg}
                isActive={isActivePackage(pkg)}
                isUpgrade={isUpgradePackage(pkg)}
                isProcessing={processingPackageId === pkg.id}
                hasActiveSubscription={hasActive}
                showSale={showSaleNoTranslation}
                entitlementAmount={userEntitlement?.entitlement?.amount}
                onAction={onAction}
                t={t}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}