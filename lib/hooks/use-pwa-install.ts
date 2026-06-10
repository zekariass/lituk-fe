import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type PwaWindow = Window & {
  __deferredInstallPrompt?: BeforeInstallPromptEvent
}

export interface PwaInstallState {
  /** True when on a mobile / tablet device */
  isMobile: boolean
  /** True when on any iOS device (Safari, Chrome, Firefox, etc.) */
  isIos: boolean
  /** True when app is running in standalone / PWA mode */
  isStandalone: boolean
  /** True when Chrome/Edge native prompt is captured and ready */
  canInstallNative: boolean
  /** Trigger the native install prompt (Android / Chrome / Edge) */
  promptInstall: () => Promise<void>
}

// ── Detection helpers ──────────────────────────────────────────────────────

function detectMobile(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(ua) ||
    (navigator.maxTouchPoints > 1 && /Macintosh/i.test(ua)) // iPad pretending to be Mac
}

function detectIos(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  return /iPad|iPhone|iPod/.test(ua) ||
    (/Macintosh/i.test(ua) && navigator.maxTouchPoints > 1)
}

function detectStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function usePwaInstall(): PwaInstallState {
  const [isMobile, setIsMobile] = useState(false)
  const [isIos, setIsIos] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [canInstallNative, setCanInstallNative] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsMobile(detectMobile())
    setIsIos(detectIos())
    setIsStandalone(detectStandalone())

    // On iOS, beforeinstallprompt never fires — nothing more to do
    if (detectIos()) return

    // ── Android / Chrome / Edge path ──
    const pwaWindow = window as PwaWindow

    // Pick up prompt captured by the early <head> script
    if (pwaWindow.__deferredInstallPrompt) {
      setDeferredPrompt(pwaWindow.__deferredInstallPrompt)
      setCanInstallNative(true)
    }

    const handleBIP = (event: Event) => {
      event.preventDefault()
      const e = event as BeforeInstallPromptEvent
      pwaWindow.__deferredInstallPrompt = e
      setDeferredPrompt(e)
      setCanInstallNative(true)
    }

    const handleInstalled = () => {
      delete pwaWindow.__deferredInstallPrompt
      setDeferredPrompt(null)
      // Don't set isStandalone here — let it be re-checked live
      // The user may uninstall and try again in the same session
    }

    window.addEventListener('beforeinstallprompt', handleBIP)
    window.addEventListener('appinstalled', handleInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBIP)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return
    const pwaWindow = window as PwaWindow
    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        // Installation accepted — prompt consumed
      }
    } catch {
      // prompt() can throw if already called once
    }
    delete pwaWindow.__deferredInstallPrompt
    setDeferredPrompt(null)
  }, [deferredPrompt])

  return {
    isMobile,
    isIos,
    isStandalone,
    canInstallNative,
    promptInstall,
  }
}
