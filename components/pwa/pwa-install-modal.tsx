'use client'

import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

interface PwaInstallModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Trigger the native install prompt */
  onInstall: () => void
}

export function PwaInstallModal({
  open,
  onOpenChange,
  onInstall,
}: PwaInstallModalProps) {
  const t = useTranslations('pwa')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm rounded-2xl !bg-[var(--background)] !text-[var(--foreground)]">
        <DialogHeader className="items-center text-center">
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg shadow-emerald-600/20">
            <img src="/logo.svg" alt="LITUK" className="h-8 w-8" />
          </div>
          <DialogTitle className="text-lg">{t('installTitle')}</DialogTitle>
          <DialogDescription className="text-sm !text-[var(--muted-foreground)]">
            {t('installDescription')}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="pt-1 sm:justify-center">
          <div className="flex w-full flex-col gap-2">
            <button
              onClick={() => {
                onInstall()
                onOpenChange(false)
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5
                         text-sm font-medium text-primary-foreground hover:bg-primary/90
                         transition-colors cursor-pointer"
            >
              <Download size={15} />
              {t('installNow')}
            </button>
            <button
              onClick={() => onOpenChange(false)}
              className="w-full rounded-xl px-4 py-2 text-sm text-[var(--muted-foreground)]
                         hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors cursor-pointer"
            >
              {t('dismiss')}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
