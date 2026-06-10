// "use client"

// import { useState } from 'react';
// import { X, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
// import { SubscriptionPackage } from '@/lib/types';

// interface SubscriptionManagementModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   action: 'cancel' | 'upgrade' | 'downgrade';
//   currentPackage?: SubscriptionPackage;
//   targetPackage?: SubscriptionPackage;
//   onConfirm: (data: any) => Promise<void>;
// }

// export function SubscriptionManagementModal({
//   isOpen,
//   onClose,
//   action,
//   currentPackage,
//   targetPackage,
//   onConfirm,
// }: SubscriptionManagementModalProps) {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
  
//   // Cancellation specific state
//   const [cancellationReason, setCancellationReason] = useState('');

//   if (!isOpen) return null;

//   const handleConfirm = async () => {
//     setIsProcessing(true);
//     setError(null);

//     try {
//       if (action === 'cancel') {
//         await onConfirm({
//           cancelAtPeriodEnd: true, // Always cancel at period end
//           cancellationReason: cancellationReason || undefined,
//         });
//       } else if (action === 'upgrade') {
//         await onConfirm({
//           newPriceId: targetPackage?.stripePriceId,
//           newBillingPeriod: targetPackage?.period,
//           prorationBehavior: true, // Always true for upgrades
//         });
//       } else if (action === 'downgrade') {
//         await onConfirm({
//           newPriceId: targetPackage?.stripePriceId,
//           newBillingPeriod: targetPackage?.period,
//           prorationBehavior: false, // Always false for downgrades
//         });
//       }
//       onClose();
//     } catch (err: any) {
//       setError(err.response?.data?.message || err.message || 'An error occurred');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const renderCancellationContent = () => (
//     <>
//       <h2 className="text-2xl font-bold mb-4">Cancel Subscription</h2>
      
//       <div className="mb-6">
//         <p className="text-muted-foreground mb-4">
//           We're sorry to see you go. Your subscription will be cancelled at the end of your current billing period.
//         </p>
//       </div>

//       <div className="mb-6">
//         <label className="block text-sm font-medium mb-2">
//           Why are you canceling? (Optional)
//         </label>
//         <select
//           value={cancellationReason}
//           onChange={(e) => setCancellationReason(e.target.value)}
//           className="w-full px-4 py-2 rounded-lg border border-border bg-background"
//         >
//           <option value="">Select a reason...</option>
//           <option value="Too expensive">Too expensive</option>
//           <option value="Not using enough">Not using enough</option>
//           <option value="Found alternative">Found a better alternative</option>
//           <option value="Technical issues">Technical issues</option>
//           <option value="Other">Other</option>
//         </select>
//       </div>

//       <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
//         <div className="flex gap-3">
//           <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//           <div className="text-sm text-blue-800 dark:text-blue-300">
//             <p>Your subscription will remain active until the end of your current billing period. You'll keep access to all features until then.</p>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   const renderUpgradeContent = () => (
//     <>
//       <h2 className="text-2xl font-bold mb-4">Upgrade Subscription</h2>
      
//       <div className="mb-6">
//         <div className="bg-card border rounded-lg p-4 mb-4">
//           <h3 className="font-semibold mb-3">Plan Comparison</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="text-sm text-muted-foreground mb-1">Current Plan</div>
//               <div className="font-semibold">{currentPackage?.name}</div>
//               <div className="text-lg font-bold text-primary">
//                 {currentPackage?.currency} {currentPackage?.amountMajor.toFixed(2)}
//               </div>
//               <div className="text-sm text-muted-foreground">{currentPackage?.periodDisplay}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground mb-1">New Plan</div>
//               <div className="font-semibold">{targetPackage?.name}</div>
//               <div className="text-lg font-bold text-green-600">
//                 {targetPackage?.currency} {targetPackage?.amountMajor.toFixed(2)}
//               </div>
//               <div className="text-sm text-muted-foreground">{targetPackage?.periodDisplay}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
//         <div className="flex gap-3">
//           <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
//           <div className="text-sm text-green-800 dark:text-green-300">
//             <p>Your upgrade will be applied immediately and you'll be charged a prorated amount for the remaining days of your billing period.</p>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   const renderDowngradeContent = () => (
//     <>
//       <h2 className="text-2xl font-bold mb-4">Downgrade Subscription</h2>
      
//       <div className="mb-6">
//         <div className="bg-card border rounded-lg p-4 mb-4">
//           <h3 className="font-semibold mb-3">Plan Comparison</h3>
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <div className="text-sm text-muted-foreground mb-1">Current Plan</div>
//               <div className="font-semibold">{currentPackage?.name}</div>
//               <div className="text-lg font-bold text-primary">
//                 {currentPackage?.currency} {currentPackage?.amountMajor.toFixed(2)}
//               </div>
//               <div className="text-sm text-muted-foreground">{currentPackage?.periodDisplay}</div>
//             </div>
//             <div>
//               <div className="text-sm text-muted-foreground mb-1">New Plan</div>
//               <div className="font-semibold">{targetPackage?.name}</div>
//               <div className="text-lg font-bold">
//                 {targetPackage?.currency} {targetPackage?.amountMajor.toFixed(2)}
//               </div>
//               <div className="text-sm text-muted-foreground">{targetPackage?.periodDisplay}</div>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
//         <div className="flex gap-3">
//           <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
//           <div className="text-sm text-blue-800 dark:text-blue-300">
//             <p>Your downgrade will be applied at the end of your current billing period. You'll keep your current plan features until then.</p>
//           </div>
//         </div>
//       </div>
//     </>
//   );

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
//       <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800">
//         <div className="p-6">
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
//             disabled={isProcessing}
//           >
//             <X className="h-5 w-5" />
//           </button>

//           {action === 'cancel' && renderCancellationContent()}
//           {action === 'upgrade' && renderUpgradeContent()}
//           {action === 'downgrade' && renderDowngradeContent()}

//           {error && (
//             <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
//               <div className="flex gap-3">
//                 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
//                 <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
//               </div>
//             </div>
//           )}

//           <div className="flex gap-3">
//             <button
//               onClick={onClose}
//               disabled={isProcessing}
//               className="flex-1 px-6 py-3 border border-border rounded-lg hover:bg-accent font-semibold disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleConfirm}
//               disabled={isProcessing}
//               className={`flex-1 px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50 ${
//                 action === 'cancel'
//                   ? 'bg-red-600 text-white hover:bg-red-700'
//                   : action === 'upgrade'
//                   ? 'bg-green-600 text-white hover:bg-green-700'
//                   : 'bg-yellow-600 text-white hover:bg-yellow-700'
//               }`}
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                   Processing...
//                 </>
//               ) : (
//                 `Confirm ${action === 'cancel' ? 'Cancellation' : action === 'upgrade' ? 'Upgrade' : 'Downgrade'}`
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, AlertCircle, CheckCircle2, Loader2, ArrowUp, ArrowDown, ArrowRight } from 'lucide-react'
import { SubscriptionPackage } from '@/lib/types'

interface SubscriptionManagementModalProps {
  isOpen: boolean
  onClose: () => void
  action: 'cancel' | 'upgrade' | 'downgrade'
  currentPackage?: SubscriptionPackage
  targetPackage?: SubscriptionPackage
  entitlementAmount?: number
  showTargetSale?: boolean
  onConfirm: (data: any) => Promise<void>
}

// ── Sale helpers (local) ─────────────────────────────────────────────────────
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

// ── Plan comparison card ─────────────────────────────────────────────────────
function PlanCard({
  label,
  pkg,
  accent,
  actualAmount,
  showSale = true,
}: {
  label: string
  pkg?: SubscriptionPackage
  accent: 'muted' | 'emerald' | 'red' | 'amber'
  actualAmount?: number
  showSale?: boolean
}) {
  const valueColor = {
    muted:   'text-muted-foreground',
    emerald: 'text-emerald-300',
    red:     'text-red-400',
    amber:   'text-amber-300',
  }[accent]

  const onSale = showSale && pkg ? hasSale(pkg) : false
  const salePrice = pkg && onSale ? getSalePrice(pkg) : null

  // If an actualAmount is provided and differs from package price, show it
  const hasActualOverride = pkg != null && actualAmount != null && actualAmount !== pkg.amountMajor

  return (
    <div className="flex-1 px-4 py-3.5 rounded-xl border border-border bg-muted/30">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium mb-2">{label}</p>
      <p className="text-sm font-medium text-foreground mb-1">{pkg?.name ?? '—'}</p>
      {pkg ? (
        hasActualOverride ? (
          <div>
            <p className="text-xs text-muted-foreground line-through">
              {pkg.currency} {pkg.amountMajor.toFixed(2)}
            </p>
            <p className={`font-syne font-bold text-xl ${valueColor}`}>
              {pkg.currency} {actualAmount!.toFixed(2)}
            </p>
          </div>
        ) : onSale && salePrice !== null ? (
          <div>
            <p className="text-xs text-muted-foreground line-through">
              {pkg.currency} {pkg.amountMajor.toFixed(2)}
            </p>
            <p className="font-syne font-bold text-xl text-red-400">
              {pkg.currency} {salePrice.toFixed(2)}
            </p>
          </div>
        ) : (
          <p className={`font-syne font-bold text-xl ${valueColor}`}>
            {pkg.currency} {pkg.amountMajor.toFixed(2)}
          </p>
        )
      ) : (
        <p className={`font-syne font-bold text-xl ${valueColor}`}>—</p>
      )}
      <p className="text-[11px] text-muted-foreground mt-0.5">{pkg?.periodDisplay}</p>
    </div>
  )
}

// ── Info notice ──────────────────────────────────────────────────────────────
function Notice({
  type,
  children,
}: {
  type: 'info' | 'success' | 'warning'
  children: React.ReactNode
}) {
  const styles = {
    info:    { wrap: 'bg-sky-300/[0.07] border-sky-300/20',    icon: 'text-sky-300',    Icon: CheckCircle2 },
    success: { wrap: 'bg-emerald-300/[0.07] border-emerald-300/20', icon: 'text-emerald-300', Icon: CheckCircle2 },
    warning: { wrap: 'bg-amber-300/[0.07] border-amber-300/20', icon: 'text-amber-300',  Icon: AlertCircle },
  }[type]

  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border ${styles.wrap}`}>
      <styles.Icon size={14} className={`${styles.icon} shrink-0 mt-0.5`} />
      <p className={`text-xs font-light leading-relaxed ${styles.icon}`}>{children}</p>
    </div>
  )
}

export function SubscriptionManagementModal({
  isOpen,
  onClose,
  action,
  currentPackage,
  targetPackage,
  entitlementAmount,
  showTargetSale = true,
  onConfirm,
}: SubscriptionManagementModalProps) {
  const t = useTranslations('subscriptionModal')
  const [isProcessing, setIsProcessing]       = useState(false)
  const [error, setError]                     = useState<string | null>(null)
  const [cancellationReason, setCancellationReason] = useState('')

  if (!isOpen) return null

  const handleConfirm = async () => {
    setIsProcessing(true)
    setError(null)
    try {
      if (action === 'cancel') {
        await onConfirm({ cancelAtPeriodEnd: true, cancellationReason: cancellationReason || undefined })
      } else if (action === 'upgrade') {
        await onConfirm({ newPriceId: targetPackage?.stripePriceId, newBillingPeriod: targetPackage?.period, prorationBehavior: true })
      } else if (action === 'downgrade') {
        await onConfirm({ newPriceId: targetPackage?.stripePriceId, newBillingPeriod: targetPackage?.period, prorationBehavior: false })
      }
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('errorOccurred'))
    } finally {
      setIsProcessing(false)
    }
  }

  // ── Content per action ──────────────────────────────────────────────────
  const content = {
    cancel: {
      title:      t('cancelTitle'),
      titleColor: 'text-red-400',
      icon:       <X size={18} className="text-red-400" />,
      iconBg:     'bg-red-400/10 border-red-400/20',
      body: (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground font-light leading-relaxed">
            {t('cancelDesc')}
          </p>

          <div className="space-y-1.5">
            <label className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
              {t('cancelReasonLabel')} <span className="normal-case tracking-normal text-muted-foreground/70">{t('cancelReasonOptional')}</span>
            </label>
            <select
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm text-foreground font-light
                         bg-muted/30 border border-border
                         focus:outline-none focus:border-foreground/25
                         transition-colors duration-200
                         [&>option]:bg-card [&>option]:text-foreground"
            >
              <option value="">{t('selectReason')}</option>
              <option value="Too expensive">{t('reasonTooExpensive')}</option>
              <option value="Not using enough">{t('reasonNotUsing')}</option>
              <option value="Found alternative">{t('reasonFoundAlternative')}</option>
              <option value="Technical issues">{t('reasonTechnicalIssues')}</option>
              <option value="Other">{t('reasonOther')}</option>
            </select>
          </div>

          <Notice type="info">
            {t('cancelNotice')}
          </Notice>
        </div>
      ),
      confirmLabel: t('confirmCancellation'),
      confirmClass: 'bg-red-400 text-white hover:opacity-85 [box-shadow:0_0_20px_rgba(248,113,113,0.25)]',
    },
    upgrade: {
      title:      t('upgradeTitle'),
      titleColor: 'text-emerald-300',
      icon:       <ArrowUp size={18} className="text-emerald-300" />,
      iconBg:     'bg-emerald-300/10 border-emerald-300/20',
      body: (
        <div className="space-y-4">
          {/* Plan comparison */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{t('planComparison')}</p>
            <div className="flex items-center gap-2">
              <PlanCard label={t('currentPlan')} pkg={currentPackage} accent="muted" actualAmount={entitlementAmount} />
              <ArrowRight size={14} className="text-muted-foreground shrink-0" />
              <PlanCard label={t('newPlan')} pkg={targetPackage} accent="emerald" showSale={showTargetSale} />
            </div>
          </div>

          <Notice type="success">
            {t('upgradeNotice')}
          </Notice>
        </div>
      ),
      confirmLabel: t('confirmUpgrade'),
      confirmClass: 'bg-primary text-primary-foreground hover:opacity-85 [box-shadow:0_0_20px_hsl(var(--primary)/0.28)]',
    },
    downgrade: {
      title:      t('downgradeTitle'),
      titleColor: 'text-amber-300',
      icon:       <ArrowDown size={18} className="text-amber-300" />,
      iconBg:     'bg-amber-300/10 border-amber-300/20',
      body: (
        <div className="space-y-4">
          {/* Plan comparison */}
          <div className="space-y-1.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">{t('planComparison')}</p>
            <div className="flex items-center gap-2">
              <PlanCard label={t('currentPlan')} pkg={currentPackage} accent="muted" actualAmount={entitlementAmount} />
              <ArrowRight size={14} className="text-muted-foreground shrink-0" />
              <PlanCard label={t('newPlan')} pkg={targetPackage} accent="amber" showSale={showTargetSale} />
            </div>
          </div>

          <Notice type="warning">
            {t('downgradeNotice')}
          </Notice>
        </div>
      ),
      confirmLabel: t('confirmDowngrade'),
      confirmClass: 'bg-amber-300 text-black hover:opacity-85 [box-shadow:0_0_20px_rgba(251,191,36,0.25)]',
    },
  }[action]

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
        .animate-fade-up { animation: fadeUp 0.3s ease both; }
      `}</style>

      {/* Backdrop */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                      bg-black/65 backdrop-blur-sm">

        {/* Modal */}
        <div className="font-dm bg-card border border-border rounded-2xl
                        w-full max-w-md max-h-[90vh] flex flex-col
                        shadow-[0_24px_64px_rgba(0,0,0,0.35)] animate-fade-up text-foreground">

          {/* Header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-border shrink-0">
            <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${content.iconBg}`}>
              {content.icon}
            </div>
            <h2 className={`font-syne font-bold text-lg tracking-tight ${content.titleColor}`}>
              {content.title}
            </h2>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="ml-auto text-foreground/25 hover:text-foreground/60
                         disabled:opacity-30 transition-colors duration-200 shrink-0"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {content.body}
          </div>

          {/* Error */}
          {error && (
            <div className="px-6 pb-3">
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border
                              bg-red-400/[0.07] border-red-400/20">
                <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400/80 font-light">{error}</p>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="px-6 pb-6 pt-3 flex gap-2.5 border-t border-border shrink-0">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-foreground/55 border border-border bg-muted/30
                         hover:text-foreground/85 hover:border-foreground/20
                         disabled:opacity-40 transition-all duration-200"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isProcessing}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                          flex items-center justify-center gap-2
                          disabled:opacity-40 disabled:cursor-not-allowed
                          transition-all duration-200 ${content.confirmClass}`}
            >
              {isProcessing
                ? <><Loader2 size={14} className="animate-spin" /> {t('processing')}</>
                : content.confirmLabel}
            </button>
          </div>

        </div>
      </div>
    </>
  )
}