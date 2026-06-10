import { useState, useEffect } from 'react'

/**
 * Detects if the app is running inside a Telegram Mini App (client-side only)
 */
function detectTelegramMiniApp(): boolean {
  if (typeof window === 'undefined') return false

  // Check for Telegram WebApp API
  if (window.Telegram?.WebApp) return true

  // Check user-agent for TelegramBot or Telegram WebView
  const ua = navigator.userAgent || ''
  if (/Telegram/i.test(ua)) return true

  // Check URL parameters that Telegram injects
  const urlParams = new URLSearchParams(window.location.search)
  if (
    urlParams.has('tgWebAppData') ||
    urlParams.has('tgWebAppVersion') ||
    urlParams.has('tgWebAppPlatform') ||
    window.location.hash.includes('tgWebApp')
  ) return true

  // Check if loaded in iframe with Telegram origin
  try {
    if (window.self !== window.top) {
      const parentOrigin = window.parent.location.origin
      if (parentOrigin.includes('telegram.org') || parentOrigin.includes('t.me')) {
        return true
      }
    }
  } catch (e) {
    // If cross-origin iframe, check if it might be Telegram
    // Telegram WebApps are often in cross-origin iframes
    if (window.self !== window.top) {
      // Assume it's Telegram if in cross-origin iframe with Telegram URL params
      return true
    }
  }

  // Check referrer for Telegram
  if (document.referrer) {
    if (document.referrer.includes('telegram.org') || document.referrer.includes('t.me')) {
      return true
    }
  }

  // Additional user agent patterns for Telegram
  if (/TelegramBot/i.test(ua) || /TelegramWebView/i.test(ua)) {
    return true
  }

  return false
}

/**
 * React hook – returns true when running inside a Telegram Mini App.
 * Uses lazy initialization to avoid flash of content.
 */
export function useTelegramMiniApp(): boolean {
  const [isTelegram, setIsTelegram] = useState(() => {
    if (typeof window === 'undefined') return false
    const detected = detectTelegramMiniApp()
    console.log('[TelegramDetect] Initial detection:', detected)
    return detected
  })

  useEffect(() => {
    const detected = detectTelegramMiniApp()
    console.log('[TelegramDetect] Re-check detection:', detected)
    setIsTelegram(detected)
  }, [])

  return isTelegram
}

// Keep the plain function export for non-hook contexts
export const isTelegramMiniApp = detectTelegramMiniApp

// Extend Window interface for TypeScript
declare global {
  interface Window {
    Telegram?: {
      WebApp?: any
    }
  }
}
