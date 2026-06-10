"use client"

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { getEntitlements } from '@/lib/services/payment-service';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations('paymentSuccessPage');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setStatus('error');
      setMessage(t('invalidSession'));
      return;
    }

    let retryCount = 0;
    const maxRetries = 10;

    const checkEntitlement = async () => {
      try {
        const entitlements = await getEntitlements();
        
        if (entitlements && entitlements.length > 0) {
          setStatus('success');
          setMessage(t('subscriptionActive'));
          setTimeout(() => router.push('/practice/revision'), 3000);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setMessage(t('activating', { current: retryCount, max: maxRetries }));
          setTimeout(checkEntitlement, 2000);
        } else {
          setStatus('error');
          setMessage(t('activationDelayed'));
        }
      } catch (error: any) {
        console.error('Failed to check entitlement:', error);
        
        if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(checkEntitlement, 2000);
        } else {
          setStatus('error');
          setMessage(t('failedToVerify'));
        }
      }
    };

    checkEntitlement();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-card rounded-2xl shadow-lg border p-8 text-center">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-bold mb-3">{t('processingPayment')}</h1>
              <p className="text-muted-foreground">{message || t('processingMessage')}</p>
              <div className="mt-6 text-sm text-muted-foreground">
                {t('dontClosePage')}
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-3">{t('paymentSuccessful')}</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="bg-primary/[0.07] border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-primary">
                  {t('redirecting')}
                </p>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <XCircle className="h-10 w-10 text-destructive" />
              </div>
              <h1 className="text-2xl font-bold mb-3">{t('paymentIssue')}</h1>
              <p className="text-muted-foreground mb-6">{message}</p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/practice/pricing')}
                  className="w-full px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 font-semibold"
                >
                  {t('backToPricing')}
                </button>
                <button
                  onClick={() => router.push('/practice/revision')}
                  className="w-full px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 font-semibold"
                >
                  {t('goToRevisions')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
