'use client'

import { X, Share } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface IosInstallPromptProps {
  onDismiss: () => void
}

export function IosInstallPrompt({ onDismiss }: IosInstallPromptProps) {
  const t = useTranslations('pwa')

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[9999] mx-auto max-w-md animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="relative rounded-2xl border border-border bg-card p-4 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <button
          onClick={onDismiss}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full
                     text-muted-foreground hover:text-foreground hover:bg-muted/50
                     transition-colors cursor-pointer"
          aria-label={t('dismiss')}
        >
          <X size={14} />
        </button>

        <div className="flex items-start gap-3 pr-6">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center">
            <img src="/logo.svg" alt="HabeshaDrive" className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1.5">
              {t('installTitle')}
            </p>
            <div className="space-y-1.5 text-xs text-muted-foreground leading-relaxed">
              <p className="flex items-center gap-1.5">
                <span className="font-medium">1.</span>
                {t('iosStep1Prefix')}
                <Share size={13} className="inline shrink-0 text-blue-500" />
                {t('iosStep1Suffix')}
              </p>
              <p className="flex items-center gap-1.5">
                <span className="font-medium">2.</span>
                {t('iosStep2')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
