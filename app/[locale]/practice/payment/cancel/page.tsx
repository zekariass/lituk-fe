"use client"

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { XCircle } from 'lucide-react';

export default function PaymentCancelPage() {
  const router = useRouter();
  const t = useTranslations('paymentCancelPage');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-lg border p-8 text-center">
          <div className="w-16 h-16 bg-amber-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="h-10 w-10 text-amber-400" />
          </div>
          
          <h1 className="text-2xl font-bold mb-3">{t('paymentCancelled')}</h1>
          <p className="text-muted-foreground mb-6">
            {t('cancelMessage')}
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/practice/pricing')}
              className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-semibold"
            >
              {t('backToPricing')}
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-semibold"
            >
              {t('goToDashboard')}
            </button>
          </div>

          <div className="mt-6 text-sm text-muted-foreground">
            <p>{t('needHelp')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
