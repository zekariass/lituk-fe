// "use client"

// import { useState } from 'react';
// import { AlertCircle, XCircle } from 'lucide-react';
// import { useAuthStore } from '@/lib/store';
// import { cancelSubscriptionManagement } from '@/lib/services/payment-service';
// import { SubscriptionManagementModal } from './subscription-management-modal';

// export function SubscriptionCancelSection() {
//   const { user } = useAuthStore();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   const hasActiveSubscription = user?.subscription?.isActive && user?.subscription?.status === 'active';

//   if (!hasActiveSubscription) {
//     return null;
//   }

//   const handleCancelConfirm = async (data: any) => {
//     if (!user?.activeJurisdictionId) return;

//     setIsProcessing(true);
//     setError(null);
//     setSuccess(null);

//     try {
//       const result = await cancelSubscriptionManagement(user.activeJurisdictionId, {
//         cancelAtPeriodEnd: data.cancelAtPeriodEnd,
//         cancellationReason: data.cancellationReason,
//       });

//       setSuccess(result.message);
//       setModalOpen(false);

//       // Optionally refresh user data
//       setTimeout(() => {
//         window.location.reload();
//       }, 2000);
//     } catch (err: any) {
//       setError(err.response?.data?.message || err.message || 'Failed to cancel subscription');
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   return (
//     <div className="bg-card rounded-lg border p-6">
//       <div className="flex items-start gap-4">
//         <div className="flex-shrink-0">
//           <XCircle className="h-6 w-6 text-red-600" />
//         </div>
//         <div className="flex-1">
//           <h3 className="text-lg font-semibold mb-2">Cancel Subscription</h3>
//           <p className="text-muted-foreground text-sm mb-4">
//             Cancel your subscription at any time. You can choose to cancel immediately or at the end of your billing period.
//           </p>

//           {error && (
//             <div className="mb-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4">
//               <div className="flex gap-3">
//                 <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
//                 <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
//               </div>
//             </div>
//           )}

//           {success && (
//             <div className="mb-4 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4">
//               <div className="text-sm text-green-800 dark:text-green-300">{success}</div>
//             </div>
//           )}

//           <button
//             onClick={() => setModalOpen(true)}
//             disabled={isProcessing}
//             className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-semibold disabled:opacity-50"
//           >
//             Cancel Subscription
//           </button>
//         </div>
//       </div>

//       <SubscriptionManagementModal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         action="cancel"
//         onConfirm={handleCancelConfirm}
//       />
//     </div>
"use client"

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertCircle, XCircle, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { cancelSubscriptionManagement } from '@/lib/services/payment-service'
import { SubscriptionManagementModal } from './subscription-management-modal'

export function SubscriptionCancelSection() {
  const t = useTranslations('subscriptionModal')
  const { user } = useAuthStore()
  const [modalOpen, setModalOpen]       = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError]               = useState<string | null>(null)
  const [success, setSuccess]           = useState<string | null>(null)

  const hasActiveSubscription =
    user?.subscription?.isActive && user?.subscription?.status === 'active'

  if (!hasActiveSubscription) return null

  const handleCancelConfirm = async (data: any) => {
    if (!user?.activeJurisdictionId) return
    setIsProcessing(true)
    setError(null)
    setSuccess(null)
    try {
      const result = await cancelSubscriptionManagement(user.activeJurisdictionId, {
        cancelAtPeriodEnd: data.cancelAtPeriodEnd,
        cancellationReason: data.cancellationReason,
      })
      setSuccess(result.message)
      setModalOpen(false)
      setTimeout(() => window.location.reload(), 2000)
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || t('failedToCancel'))
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      <div className="rounded-2xl border border-red-400/[0.15] bg-red-400/[0.04] p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20
                          flex items-center justify-center shrink-0">
            <XCircle size={16} className="text-red-400" />
          </div>

          <div className="flex-1 min-w-0 space-y-3">
            <div>
              <h3 className="font-syne font-bold text-base tracking-tight text-foreground">
                {t('cancelSectionTitle')}
              </h3>
              <p className="text-xs text-muted-foreground font-light mt-1 leading-relaxed">
                {t('cancelSectionDesc')}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border
                              bg-red-400/[0.07] border-red-400/20">
                <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                <p className="text-xs text-red-400/80 font-light">{error}</p>
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl border
                              bg-emerald-300/[0.07] border-emerald-300/20">
                <CheckCircle2 size={13} className="text-emerald-300 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-300/80 font-light">{success}</p>
              </div>
            )}

            <button
              onClick={() => setModalOpen(true)}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-red-400 border border-red-400/25 bg-red-400/[0.07]
                         hover:bg-red-400/[0.14] hover:border-red-400/40
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <XCircle size={14} />
              {t('cancelSectionButton')}
            </button>
          </div>
        </div>
      </div>

      <SubscriptionManagementModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        action="cancel"
        onConfirm={handleCancelConfirm}
      />
    </>
  )
}