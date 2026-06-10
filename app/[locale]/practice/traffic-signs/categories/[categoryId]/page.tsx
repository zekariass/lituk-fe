"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import {
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Image as ImageIcon,
  X,
  RefreshCw,
  Grid3x3,
  Eye,
  Zap,
  Shield,
  Navigation,
  Maximize2,
} from "lucide-react"

import { useContentLanguageStore } from "@/lib/store"
import { useAuthStore } from "@/lib/store/auth-store"
import { useTrafficSignsStore } from "@/lib/store/traffic-signs-store"
import { useTranslations } from 'next-intl'
import trafficSignsApi from "@/lib/api/traffic-signs"
import { getAssetUrl } from "@/lib/utils/asset-url"
import { UserLanguageInfo } from "@/lib/types"

// ─── Types ────────────────────────────────────────────────────────────────────

interface Asset {
  url: string
  contentType: string
  caption?: string
  alt?: string
}

interface Sign {
  id: number
  signAsset: Asset
  description: string
  realLifeAssets: Asset[]
  additionalAssets: Asset[]
  translations?: Record<string, { description: string; caption?: string }>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

// ─── Sub-components ───────────────────────────────────────────────────────────

interface AssetItemProps {
  asset: Asset
  index: number
  onImageClick: (asset: Asset) => void
}

function AssetItem({ asset, index, onImageClick }: AssetItemProps) {
  const assetUrl = getAssetUrl(asset.url)
  const isVideo = asset.contentType.startsWith("video/")
  const [isLoading, setIsLoading] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  if (isVideo) {
    return (
      <div className="asset-tile asset-tile--video">
        <video
          src={assetUrl}
          controls
          className="asset-tile__media"
          preload="metadata"
        />
        <span className="asset-tile__badge">VIDEO</span>
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`asset-tile asset-tile--image ${isHovered ? "asset-tile--hovered" : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onImageClick(asset)}
      aria-label="View full size image"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {isLoading && (
        <div className="asset-tile__loader">
          <Loader2 className="asset-tile__spinner" />
        </div>
      )}
      <Image
        src={assetUrl}
        alt={asset.alt || "Traffic sign example"}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="asset-tile__img"
        onLoad={() => setIsLoading(false)}
      />
      <div className="asset-tile__overlay">
        <div className="asset-tile__overlay-content">
          <Eye size={14} />
          <span>Enlarge</span>
        </div>
      </div>
      <div className="asset-tile__index">{String(index + 1).padStart(2, "0")}</div>
    </button>
  )
}

interface LightboxProps {
  asset: Asset
  onClose: () => void
}

function Lightbox({ asset, onClose }: LightboxProps) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKey)
    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", handleKey)
    }
  }, [onClose])

  return (
    <div className="lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image lightbox">
      <button type="button" onClick={onClose} className="lightbox__close" aria-label="Close lightbox">
        <X size={20} />
      </button>
      <div className="lightbox__hint">ESC to close</div>
      <div className="lightbox__stage" onClick={(e) => e.stopPropagation()}>
        {isLoading && (
          <div className="lightbox__loading">
            <Loader2 size={36} className="lightbox__spinner" />
          </div>
        )}
        <Image
          src={getAssetUrl(asset.url)}
          alt={asset.alt || "Traffic sign full size"}
          fill
          sizes="100vw"
          className="lightbox__img"
          onLoad={() => setIsLoading(false)}
          priority
        />
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TrafficSignCategoryPage() {
  const params = useParams()
  const router = useRouter()
  const categoryId = Number(params.categoryId)

  const user = useAuthStore(state => state.user)
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
  const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore()
  const t = useTranslations('trafficSignsCategoryPage')

  const {
    signs,
    currentSignIndex,
    currentPage,
    totalPages,
    isLoading,
    error,
    setSigns,
    appendSigns,
    setCurrentCategoryId,
    nextSign,
    previousSign,
    setIsLoading,
    setError,
    getCurrentSign,
  } = useTrafficSignsStore()

  const [lightboxAsset, setLightboxAsset] = useState<Asset | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<"card" | "immersive">("card")
  const [prevIndex, setPrevIndex] = useState(0)
  const [slideDir, setSlideDir] = useState<"left" | "right">("right")
  const [animKey, setAnimKey] = useState(0)
  const contentRef = useRef<HTMLDivElement>(null)

  const currentSign = getCurrentSign() as Sign | null

  const canGoNext = currentSignIndex < signs.length - 1 || currentPage < totalPages - 1
  const canGoPrevious = currentSignIndex > 0
  const progress = signs.length > 0 ? ((currentSignIndex + 1) / signs.length) * 100 : 0

  useEffect(() => {
    if (!categoryId) return
    setCurrentCategoryId(categoryId)
    const fetchSigns = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await trafficSignsApi.getSigns({ categoryId, page: 0, size: PAGE_SIZE })
        setSigns(data.content, data.page.number, data.page.totalPages)
      } catch (err: unknown) {
        const errorMessage =
          (err as any)?.response?.data?.error?.message ||
          (err as Error)?.message ||
          "Failed to load traffic signs"
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }
    fetchSigns()
  }, [categoryId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchNextPage = useCallback(async () => {
    if (isLoadingMore || currentPage >= totalPages - 1) return
    setIsLoadingMore(true)
    try {
      const data = await trafficSignsApi.getSigns({
        categoryId,
        page: currentPage + 1,
        size: PAGE_SIZE,
      })
      appendSigns(data.content, data.page.number, data.page.totalPages)
    } catch (err) {
      console.error("Failed to load more signs", err)
    } finally {
      setIsLoadingMore(false)
    }
  }, [isLoadingMore, currentPage, totalPages, categoryId, appendSigns])

  const handleNext = useCallback(async () => {
    setSlideDir("left")
    setAnimKey(k => k + 1)
    if (currentSignIndex < signs.length - 1) {
      nextSign()
    } else if (currentPage < totalPages - 1) {
      await fetchNextPage()
      nextSign()
    }
  }, [currentSignIndex, signs.length, currentPage, totalPages, fetchNextPage, nextSign])

  const handlePrevious = useCallback(() => {
    if (!canGoPrevious) return
    setSlideDir("right")
    setAnimKey(k => k + 1)
    previousSign()
  }, [canGoPrevious, previousSign])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxAsset) {
        if (e.key === "Escape") setLightboxAsset(null)
        return
      }
      if (e.key === "ArrowRight" && canGoNext) { e.preventDefault(); handleNext() }
      if (e.key === "ArrowLeft" && canGoPrevious) { e.preventDefault(); handlePrevious() }
      if (e.key === "v" || e.key === "V") setViewMode(p => p === "card" ? "immersive" : "card")
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [handleNext, handlePrevious, lightboxAsset, canGoNext, canGoPrevious])

  const minSwipeDistance = 50
  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX) }
  const onTouchMove = (e: React.TouchEvent) => setTouchEnd(e.targetTouches[0].clientX)
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    if (distance > minSwipeDistance && canGoNext) handleNext()
    if (distance < -minSwipeDistance && canGoPrevious) handlePrevious()
  }

  const getDescription = useCallback(
    (sign: Sign) => {
      if (!selectedLanguage || selectedLanguage === "" || !sign.translations) return sign.description
      const translation = sign.translations[selectedLanguage]
      if (translation && typeof translation.description === "string") return translation.description
      return sign.description
    },
    [selectedLanguage]
  )

  const additionalAssets = useMemo(
    () => currentSign?.additionalAssets ?? [],
    [currentSign]
  )
  const realLifeAssets = useMemo(
    () => currentSign?.realLifeAssets ?? [],
    [currentSign]
  )
  const hasAnyAssets = additionalAssets.length > 0 || realLifeAssets.length > 0
  const [galleryTab, setGalleryTab] = useState<'additional' | 'reallife'>('additional')

  // Auto-select the first available tab when the sign changes
  useEffect(() => {
    if (additionalAssets.length > 0) setGalleryTab('additional')
    else if (realLifeAssets.length > 0) setGalleryTab('reallife')
  }, [currentSign])

  // ── Loading state ────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <>
        <PageStyles />
        <div className="tsp-root">
          <div className="tsp-loading">
            <div className="tsp-loading__icon">
              <Shield size={28} />
            </div>
            <p className="tsp-loading__label">Loading signs…</p>
            <div className="tsp-loading__bar">
              <div className="tsp-loading__bar-fill" />
            </div>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <PageStyles />
        <div className="tsp-root">
          <div className="tsp-error">
            <AlertCircle size={40} className="tsp-error__icon" />
            <h3 className="tsp-error__title">Failed to load signs</h3>
            <p className="tsp-error__msg">{error}</p>
            <div className="tsp-error__actions">
              <button onClick={() => router.push("/practice/traffic-signs")} className="tsp-btn tsp-btn--ghost">
                <ArrowLeft size={15} /> Back
              </button>
              <button onClick={() => window.location.reload()} className="tsp-btn tsp-btn--primary">
                <RefreshCw size={15} /> Retry
              </button>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!currentSign) return null

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      <PageStyles />
      <div
        className={`tsp-root tsp-root--${viewMode}`}
        dir={direction}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* ── Ambient glow behind sign ── */}
        <div className="tsp-ambient" aria-hidden />

        <div className="tsp-inner">

          {/* ── Top bar ── */}
          <header className="tsp-topbar">
            <div className="tsp-topbar__main">
              <button
                onClick={() => router.push("/practice/traffic-signs")}
                className="tsp-back-btn"
              >
                <ArrowLeft size={16} />
                <span>Categories</span>
              </button>

              <div className="tsp-topbar__center">
                <span className="tsp-counter">
                  <span className="tsp-counter__current">{String(currentSignIndex + 1).padStart(2, "0")}</span>
                  <span className="tsp-counter__sep">/</span>
                  <span className="tsp-counter__total">{String(signs.length).padStart(2, "0")}</span>
                </span>
              </div>

              <div className="tsp-topbar__right">
                {/* View toggle */}
                <div className="tsp-view-toggle">
                  <button
                    onClick={() => setViewMode("card")}
                    className={`tsp-view-toggle__btn ${viewMode === "card" ? "tsp-view-toggle__btn--active" : ""}`}
                    title="Card view"
                  >
                    <Grid3x3 size={14} />
                  </button>
                  <button
                    onClick={() => setViewMode("immersive")}
                    className={`tsp-view-toggle__btn ${viewMode === "immersive" ? "tsp-view-toggle__btn--active" : ""}`}
                    title="Immersive view"
                  >
                    <Eye size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Language flags - below back button */}
            {languageFlags.length > 0 && (
              <div className="tsp-langs sticky top-0 z-30">
                {languageFlags.map((li: UserLanguageInfo) => {
                  const active = selectedLanguage === li.language.code
                  return (
                    <button
                      key={li.language.code}
                      type="button"
                      onClick={() => setLanguage(li.language.code, li.language.direction as "ltr" | "rtl")}
                      className={`tsp-lang-btn ${active ? "tsp-lang-btn--active" : ""}`}
                      title={li.language.name}
                      aria-pressed={active}
                      data-active={active}
                    >
                      <Image
                        src={li.language.flagUrl}
                        alt={li.language.name}
                        width={18}
                        height={13}
                        className="tsp-lang-btn__flag"
                      />
                      <span>{li.language.shortDisplayName}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </header>

          {/* ── Progress track ── */}
          <div className="tsp-progress" role="progressbar" aria-valuenow={currentSignIndex + 1} aria-valuemin={1} aria-valuemax={signs.length}>
            <div className="tsp-progress__track">
              <div className="tsp-progress__fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {/* ── Main card ── */}
          <main
            ref={contentRef}
            className={`tsp-main tsp-main--${slideDir}`}
            key={animKey}
          >
            {/* Combined sign + description panel */}
            <section className="tsp-combined-panel">
              {/* Sign visual area */}
              <div className="tsp-combined-panel__sign">
                <div className="tsp-sign-panel__inner">
                  {/* Sign number badge */}
                  <div className="tsp-sign-badge">
                    <span>SIGN #{currentSignIndex + 1}</span>
                  </div>

                  {/* Sign image */}
                  <div className={`tsp-sign-img-wrap ${viewMode === "immersive" ? "tsp-sign-img-wrap--lg" : ""}`}>
                    <Image
                      src={getAssetUrl(currentSign.signAsset.url)}
                      alt={currentSign.signAsset.alt || "Traffic sign"}
                      fill
                      sizes="(max-width: 768px) 200px, 240px"
                      className="tsp-sign-img"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="tsp-combined-panel__divider" />

              {/* Description area */}
              <div className="tsp-combined-panel__desc">
                <div className="tsp-desc-panel__label">
                  <span className="tsp-desc-panel__label-line" />
                  <span>EXPLANATION</span>
                </div>
                <div
                  className="tsp-desc-body prose dark:prose-invert
                    prose-headings:text-[var(--tsp-text)] prose-headings:font-bold
                    prose-p:text-[var(--tsp-text-muted)] prose-p:leading-relaxed
                    prose-strong:text-[var(--tsp-text)] prose-li:text-[var(--tsp-text-muted)]
                    prose-a:text-[var(--tsp-accent)] text-justify"
                  dangerouslySetInnerHTML={{ __html: getDescription(currentSign) }}
                />
              </div>
            </section>
          </main>

          {/* ── Gallery (tabbed) ── */}
          {hasAnyAssets && (
            <section className="tsp-gallery">
              <div className="tsp-gallery-tabs">
                {additionalAssets.length > 0 && (
                  <button
                    type="button"
                    className={`tsp-gallery-tab ${galleryTab === 'additional' ? 'tsp-gallery-tab--active' : ''}`}
                    onClick={() => setGalleryTab('additional')}
                  >
                    <span className="tsp-gallery-tab__label">{t('additionalTab')}</span>
                    <span className="tsp-gallery-tab__count">{additionalAssets.length}</span>
                  </button>
                )}
                {realLifeAssets.length > 0 && (
                  <button
                    type="button"
                    className={`tsp-gallery-tab ${galleryTab === 'reallife' ? 'tsp-gallery-tab--active' : ''}`}
                    onClick={() => setGalleryTab('reallife')}
                  >
                    <span className="tsp-gallery-tab__label">{t('realLifeTab')}</span>
                    <span className="tsp-gallery-tab__count">{realLifeAssets.length}</span>
                  </button>
                )}
              </div>

              <div className="tsp-gallery__grid">
                {(galleryTab === 'additional' ? additionalAssets : realLifeAssets).map((asset, i) => (
                  <AssetItem key={`${galleryTab}-${i}`} asset={asset} index={i} onImageClick={setLightboxAsset} />
                ))}
              </div>
            </section>
          )}

          {/* ── Navigation ── */}
          <nav className="tsp-nav">
            <button
              onClick={handlePrevious}
              disabled={!canGoPrevious}
              aria-label="Previous sign"
              className="tsp-nav__btn tsp-nav__btn--prev"
            >
              <ChevronLeft size={18} />
              <span>Prev</span>
            </button>

            {/* Dot indicators (up to 9) */}
            <div className="tsp-nav__dots">
              {signs.slice(0, 9).map((_, i) => (
                <div
                  key={i}
                  className={`tsp-nav__dot ${i === currentSignIndex ? "tsp-nav__dot--active" : ""}`}
                />
              ))}
              {signs.length > 9 && <span className="tsp-nav__dot-more">+{signs.length - 9}</span>}
            </div>

            <button
              onClick={handleNext}
              disabled={!canGoNext || isLoadingMore}
              aria-label="Next sign"
              className="tsp-nav__btn tsp-nav__btn--next"
            >
              {isLoadingMore ? (
                <><Loader2 size={16} className="tsp-spin" /><span>Loading</span></>
              ) : (
                <><span>Next</span><ChevronRight size={18} /></>
              )}
            </button>
          </nav>

          {/* ── Keyboard hint ── */}
          <footer className="tsp-footer">
            <kbd>←</kbd><kbd>→</kbd> navigate &nbsp;·&nbsp; <kbd>V</kbd> view &nbsp;·&nbsp;
          </footer>

        </div>
      </div>

      {lightboxAsset && <Lightbox asset={lightboxAsset} onClose={() => setLightboxAsset(null)} />}
    </>
  )
}

// ─── Styles ────────────────────────────────────────────────────────────────────

function PageStyles() {
  return (
    <style>{`
      /* ── Tokens (using globals.css theme) ──────────────────────── */
      :root {
        /* Light theme - mapped from globals.css */
        --tsp-bg:          hsl(var(--background));
        --tsp-surface:     hsl(var(--card));
        --tsp-surface-2:   hsl(var(--muted));
        --tsp-border:      hsl(var(--border));
        --tsp-border-2:    hsl(var(--input));
        --tsp-accent:      hsl(var(--primary));
        --tsp-accent-dim:  hsl(var(--primary) / 0.12);
        --tsp-accent-glow: hsl(var(--primary) / 0.25);
        --tsp-text:        hsl(var(--foreground));
        --tsp-text-muted:  hsl(var(--muted-foreground));
        --tsp-text-faint:  hsl(var(--border));
        --tsp-danger:      hsl(var(--destructive));
        --tsp-success:     hsl(var(--success));
        --tsp-radius:      16px;
        --tsp-radius-sm:   10px;
        --tsp-font-head:   'Manrope', system-ui, -apple-system, sans-serif;
        --tsp-font-body:   'Inter', system-ui, -apple-system, sans-serif;
        --tsp-font-mono:   ui-monospace, 'Cascadia Code', 'Source Code Pro', monospace;
        --tsp-transition:  200ms cubic-bezier(.4,0,.2,1);
      }

      /* Dark theme inherits from globals.css .dark class */
      .dark {
        /* All color variables automatically update via globals.css */
      }

      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

      /* ── Root ──────────────────────────────────────────────────── */
      .tsp-root {
        min-height: 100svh;
        background: var(--tsp-bg);
        color: var(--tsp-text);
        font-family: var(--tsp-font-body);
        position: relative;
        overflow-x: hidden;
      }

      /* Subtle dot-grid background */
      .tsp-root::before {
        content: '';
        position: fixed;
        inset: 0;
        background-image: radial-gradient(circle, hsl(var(--foreground) / 0.03) 1px, transparent 1px);
        background-size: 28px 28px;
        pointer-events: none;
        z-index: 0;
      }

      .tsp-inner {
        position: relative;
        z-index: 1;
        max-width: 1120px;
        margin: 0 auto;
        padding: 20px 16px 32px;
      }

      @media (min-width: 768px) {
        .tsp-inner { padding: 28px 32px 40px; }
      }

      /* ── Ambient glow ───────────────────────────────────────────── */
      .tsp-ambient {
        position: fixed;
        top: -160px;
        left: 50%;
        transform: translateX(-50%);
        width: 600px;
        height: 400px;
        background: radial-gradient(ellipse at center, var(--tsp-accent-glow) 0%, transparent 70%);
        pointer-events: none;
        z-index: 0;
        opacity: 0.5;
      }

      /* ── Top bar ────────────────────────────────────────────────── */
      .tsp-topbar {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 20px;
      }

      .tsp-topbar__main {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }

      .tsp-topbar__center { flex: 1; display: flex; justify-content: center; }
      .tsp-topbar__right  { display: flex; align-items: center; gap: 10px; }

      .tsp-back-btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-family: var(--tsp-font-body);
        font-size: 13px;
        font-weight: 500;
        color: var(--tsp-text-muted);
        background: transparent;
        border: 1px solid var(--tsp-border);
        border-radius: 8px;
        padding: 7px 12px;
        cursor: pointer;
        transition: all var(--tsp-transition);
        white-space: nowrap;
      }
      .tsp-back-btn:hover {
        color: var(--tsp-text);
        border-color: var(--tsp-border-2);
        background: var(--tsp-surface);
        transform: translateX(-2px);
      }

      /* ── Counter ─────────────────────────────────────────────── */
      .tsp-counter {
        display: flex;
        align-items: baseline;
        gap: 3px;
        font-family: var(--tsp-font-mono);
      }
      .tsp-counter__current {
        font-size: 22px;
        font-weight: 500;
        color: var(--tsp-accent);
        line-height: 1;
      }
      .tsp-counter__sep {
        font-size: 14px;
        color: var(--tsp-text-faint);
      }
      .tsp-counter__total {
        font-size: 14px;
        color: var(--tsp-text-muted);
      }

      /* ── View toggle ─────────────────────────────────────────── */
      .tsp-view-toggle {
        display: flex;
        background: var(--tsp-surface);
        border: 1px solid var(--tsp-border);
        border-radius: 8px;
        padding: 3px;
        gap: 2px;
      }
      .tsp-view-toggle__btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 30px;
        height: 26px;
        border-radius: 6px;
        border: none;
        background: transparent;
        color: var(--tsp-text-faint);
        cursor: pointer;
        transition: all var(--tsp-transition);
      }
      .tsp-view-toggle__btn--active {
        background: var(--tsp-surface-2);
        color: var(--tsp-accent);
        border: 1px solid var(--tsp-border-2);
      }
      .tsp-view-toggle__btn:hover:not(.tsp-view-toggle__btn--active) {
        color: var(--tsp-text-muted);
      }

      /* ── Language buttons ─────────────────────────────────────── */
      .tsp-langs {
        display: flex;
        gap: 6px;
        align-items: center;
        overflow-x: auto;
        padding: 8px 10px;
        background: color-mix(in srgb, var(--card) 90%, transparent);
        backdrop-filter: blur(10px);
        border: 1px solid var(--tsp-border);
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.1);
      }
      .tsp-langs::-webkit-scrollbar { display: none; }
      .tsp-langs { -ms-overflow-style: none; scrollbar-width: none; }
      .tsp-lang-btn {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 3px 6px;
        border-radius: 7px;
        border: 1px solid var(--tsp-border);
        background: var(--tsp-surface);
        color: var(--tsp-text-muted);
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--tsp-transition);
        font-family: var(--tsp-font-body);
      }
      .tsp-lang-btn:hover {
        border-color: var(--tsp-border-2);
        color: var(--tsp-text);
      }
      .tsp-lang-btn--active {
        border-color: var(--tsp-accent);
        background: var(--tsp-accent-dim);
        color: var(--tsp-accent);
      }
      .tsp-lang-btn__flag {
        border-radius: 2px;
        object-fit: cover;
        flex-shrink: 0;
      }

      /* ── Progress ─────────────────────────────────────────────── */
      .tsp-progress {
        margin-bottom: 24px;
      }
      .tsp-progress__track {
        height: 3px;
        background: var(--tsp-surface-2);
        border-radius: 2px;
        overflow: hidden;
        position: relative;
      }
      .tsp-progress__fill {
        height: 100%;
        background: linear-gradient(90deg, var(--tsp-accent), #ffcf6d);
        border-radius: 2px;
        transition: width 600ms cubic-bezier(.4,0,.2,1);
        position: relative;
      }
      .tsp-progress__fill::after {
        content: '';
        position: absolute;
        right: -1px;
        top: -3px;
        width: 9px;
        height: 9px;
        background: var(--tsp-accent);
        border-radius: 50%;
        box-shadow: 0 0 8px var(--tsp-accent-glow);
      }

      /* ── Main grid ────────────────────────────────────────────── */
      .tsp-main {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 16px;
        animation: tsp-slide-in 350ms cubic-bezier(.4,0,.2,1) both;
      }

      @media (min-width: 768px) {
        .tsp-main { gap: 20px; }
        .tsp-root--immersive .tsp-main { max-width: 680px; margin-left: auto; margin-right: auto; }
      }

      @keyframes tsp-slide-in {
        from { opacity: 0; transform: translateY(14px); }
        to   { opacity: 1; transform: translateY(0); }
      }

      /* ── Combined sign + description panel ─────────────────── */
      .tsp-combined-panel {
        background: var(--tsp-surface);
        border: 1px solid var(--tsp-border);
        border-radius: var(--tsp-radius);
        overflow: hidden;
        position: relative;
        display: flex;
        flex-direction: column;
        transition: border-color var(--tsp-transition), box-shadow var(--tsp-transition);
      }
      .tsp-combined-panel:hover {
        border-color: var(--tsp-border-2);
        box-shadow: 0 0 40px rgba(0,0,0,0.4);
      }

      /* Sign area within combined panel */
      .tsp-combined-panel__sign {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 260px;
      }
      .tsp-combined-panel__sign::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at center, 
          hsl(var(--muted) / 0.3) 0%, 
          transparent 70%);
        pointer-events: none;
        z-index: 0;
      }

      @media (min-width: 768px) {
        .tsp-combined-panel__sign { min-height: 340px; }
        .tsp-root--immersive .tsp-combined-panel__sign { min-height: 460px; }
      }

      .tsp-sign-panel__inner {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        padding: 32px 24px;
        position: relative;
        width: 100%;
      }

      .tsp-sign-badge {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        background: var(--tsp-accent-dim);
        border: 1px solid rgba(245,166,35,0.25);
        border-radius: 20px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.08em;
        color: var(--tsp-accent);
        font-family: var(--tsp-font-mono);
        position: relative;
        z-index: 1;
      }

      .tsp-sign-img-wrap {
        position: relative;
        width: 200px;
        height: 200px;
        min-width: 200px;
        min-height: 200px;
        max-width: 280px;
        max-height: 280px;
        z-index: 1;
        background: white;
        border-radius: 12px;
        padding: 4px;
        filter: drop-shadow(0 4px 16px rgba(0,0,0,0.15));
        transition: all 300ms cubic-bezier(.4,0,.2,1);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .tsp-sign-img-wrap--lg { 
        width: 280px; 
        height: 280px;
        min-width: 280px;
        min-height: 280px;
        max-width: 320px;
        max-height: 320px;
      }

      @media (min-width: 768px) {
        .tsp-sign-img-wrap { 
          width: 240px; 
          height: 240px;
          min-width: 240px;
          min-height: 240px;
          max-width: 300px;
          max-height: 300px;
        }
        .tsp-sign-img-wrap--lg { 
          width: 320px; 
          height: 320px;
          min-width: 320px;
          min-height: 320px;
          max-width: 360px;
          max-height: 360px;
        }
      }

      .tsp-sign-img {
        object-fit: contain;
        border-radius: 8px;
        width: 100%;
        height: 100%;
      }
      
      .tsp-combined-panel:hover .tsp-sign-img-wrap {
        transform: scale(1.02);
        filter: drop-shadow(0 6px 20px rgba(0,0,0,0.2));
      }

      /* Divider between sign and description */
      .tsp-combined-panel__divider {
        height: 1px;
        margin: 0 24px;
        background: linear-gradient(90deg, transparent, var(--tsp-border-2), transparent);
      }

      /* Description area within combined panel */
      .tsp-combined-panel__desc {
        padding: 24px;
        overflow-y: auto;
        max-height: 360px;
        display: flex;
        flex-direction: column;
        gap: 16px;
        scrollbar-width: thin;
        scrollbar-color: var(--tsp-border-2) transparent;
      }

      @media (min-width: 768px) { .tsp-combined-panel__desc { max-height: 400px; padding: 28px; } }

      .tsp-desc-panel__label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--tsp-text-faint);
        font-family: var(--tsp-font-mono);
      }
      .tsp-desc-panel__label-line {
        display: block;
        width: 24px;
        height: 2px;
        background: var(--tsp-accent);
        border-radius: 1px;
        flex-shrink: 0;
      }

      .tsp-desc-body {
        font-size: 14px;
        line-height: 1.75;
        flex: 1;
      }

      @media (min-width: 768px) { .tsp-desc-body { font-size: 15px; } }

      /* ── Gallery ────────────────────────────────────────────── */
      .tsp-gallery {
        background: var(--tsp-surface);
        border: 1px solid var(--tsp-border);
        border-radius: var(--tsp-radius);
        padding: 20px 20px 24px;
        margin-bottom: 20px;
        transition: border-color var(--tsp-transition);
      }
      .tsp-gallery:hover {
        border-color: var(--tsp-border-2);
      }

      @media (min-width: 768px) { .tsp-gallery { padding: 24px 28px 28px; } }

      /* ── Gallery Tabs ── */
      .tsp-gallery-tabs {
        display: flex;
        gap: 4px;
        margin-bottom: 20px;
        background: rgba(255,255,255,0.03);
        border: 1px solid var(--tsp-border);
        border-radius: 12px;
        padding: 4px;
      }
      .tsp-gallery-tab {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
        padding: 10px 16px;
        border-radius: 9px;
        border: 1px solid transparent;
        background: transparent;
        color: var(--tsp-text);
        font-size: 12px;
        font-weight: 600;
        letter-spacing: 0.02em;
        cursor: pointer;
        transition: all 0.2s ease;
        justify-content: center;
        font-family: var(--tsp-font-body);
      }
      .tsp-gallery-tab:hover {
        color: var(--tsp-text-muted);
        background: rgba(255,255,255,0.03);
      }
      .tsp-gallery-tab--active {
        background: rgba(245,166,35,0.08);
        border-color: rgba(245,166,35,0.2);
        color: var(--tsp-accent);
        box-shadow: 0 1px 4px rgba(0,0,0,0.15);
      }
      .tsp-gallery-tab--active:hover {
        background: rgba(245,166,35,0.12);
        color: var(--tsp-accent);
      }
      .tsp-gallery-tab__label {
        white-space: nowrap;
      }
      .tsp-gallery-tab__count {
        font-size: 10px;
        font-weight: 700;
        font-family: var(--tsp-font-mono);
        min-width: 20px;
        height: 20px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border-radius: 6px;
        background: rgba(255,255,255,0.06);
        color: var(--tsp-text-faint);
        transition: all 0.2s ease;
      }
      .tsp-gallery-tab--active .tsp-gallery-tab__count {
        background: rgba(245,166,35,0.15);
        color: var(--tsp-accent);
      }

      .tsp-gallery__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .tsp-section-label {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.12em;
        color: var(--tsp-text-faint);
        font-family: var(--tsp-font-mono);
      }
      .tsp-section-label__line {
        display: block;
        width: 20px;
        height: 2px;
        background: var(--tsp-accent);
        border-radius: 1px;
        flex-shrink: 0;
      }

      .tsp-gallery__count {
        font-size: 11px;
        font-weight: 600;
        color: var(--tsp-accent);
        font-family: var(--tsp-font-mono);
        background: var(--tsp-accent-dim);
        padding: 3px 9px;
        border-radius: 20px;
        border: 1px solid rgba(245,166,35,0.2);
      }

      .tsp-gallery__empty {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        padding: 48px 0;
        color: var(--tsp-text-faint);
        font-size: 13px;
      }
      .tsp-gallery__empty-icon { opacity: 0.35; }

      .tsp-gallery__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      @media (min-width: 480px) { .tsp-gallery__grid { grid-template-columns: repeat(3, 1fr); } }
      @media (min-width: 768px) { .tsp-gallery__grid { grid-template-columns: repeat(4, 1fr); gap: 12px; } }
      @media (min-width: 1024px) { .tsp-gallery__grid { grid-template-columns: repeat(5, 1fr); } }

      /* ── Asset tile ─────────────────────────────────────────── */
      .asset-tile {
        position: relative;
        aspect-ratio: 16/10;
        border-radius: var(--tsp-radius-sm);
        overflow: hidden;
        border: 1px solid var(--tsp-border);
        background: var(--tsp-surface-2);
        transition: all var(--tsp-transition);
        animation: tsp-slide-in 400ms cubic-bezier(.4,0,.2,1) both;
        cursor: pointer;
        padding: 0;
        display: block;
        width: 100%;
      }
      .asset-tile--video { cursor: default; }

      .asset-tile:hover, .asset-tile--hovered {
        border-color: var(--tsp-accent);
        box-shadow: 0 0 0 1px var(--tsp-accent), 0 8px 24px rgba(0,0,0,0.4);
        transform: translateY(-2px);
      }

      .asset-tile__media {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: var(--tsp-radius-sm);
      }

      .asset-tile__badge {
        position: absolute;
        top: 6px;
        right: 6px;
        background: rgba(0,0,0,0.7);
        color: #fff;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: 0.1em;
        padding: 2px 6px;
        border-radius: 4px;
        font-family: var(--tsp-font-mono);
      }

      .asset-tile__loader {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--tsp-surface-2);
        z-index: 2;
      }

      .asset-tile__spinner {
        width: 18px;
        height: 18px;
        animation: spin 0.8s linear infinite;
        color: var(--tsp-text-faint);
      }

      .asset-tile__img {
        object-fit: contain;
        transition: transform 400ms cubic-bezier(.4,0,.2,1) !important;
      }
      .asset-tile:hover .asset-tile__img { transform: scale(1.06); }

      .asset-tile__overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%);
        opacity: 0;
        transition: opacity var(--tsp-transition);
        display: flex;
        align-items: flex-end;
        padding: 8px;
      }
      .asset-tile:hover .asset-tile__overlay { opacity: 1; }

      .asset-tile__overlay-content {
        display: flex;
        align-items: center;
        gap: 5px;
        color: #fff;
        font-size: 11px;
        font-weight: 500;
        font-family: var(--tsp-font-body);
      }

      .asset-tile__index {
        position: absolute;
        top: 6px;
        left: 6px;
        font-family: var(--tsp-font-mono);
        font-size: 9px;
        font-weight: 500;
        color: rgba(255,255,255,0.4);
        line-height: 1;
      }

      /* ── Navigation ──────────────────────────────────────────── */
      .tsp-nav {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
      }

      .tsp-nav__btn {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 10px 20px;
        border-radius: 10px;
        border: 1px solid var(--tsp-border);
        font-family: var(--tsp-font-body);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--tsp-transition);
        white-space: nowrap;
      }
      .tsp-nav__btn:disabled {
        opacity: 0.25;
        cursor: not-allowed;
      }

      .tsp-nav__btn--prev {
        background: var(--tsp-surface);
        color: var(--tsp-text-muted);
      }
      .tsp-nav__btn--prev:not(:disabled):hover {
        background: var(--tsp-surface-2);
        color: var(--tsp-text);
        border-color: var(--tsp-border-2);
        transform: translateX(-2px);
      }

      .tsp-nav__btn--next {
        background: var(--tsp-accent);
        color: #0a0b0e;
        border-color: var(--tsp-accent);
      }
      .tsp-nav__btn--next:not(:disabled):hover {
        background: #ffcf6d;
        border-color: #ffcf6d;
        transform: translateX(2px);
        box-shadow: 0 0 20px var(--tsp-accent-glow);
      }
      .tsp-nav__btn--next:disabled {
        background: var(--tsp-surface);
        border-color: var(--tsp-border);
        color: var(--tsp-text-faint);
      }

      .tsp-nav__dots {
        display: flex;
        align-items: center;
        gap: 5px;
        flex-wrap: wrap;
        justify-content: center;
      }
      .tsp-nav__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--tsp-surface-2);
        border: 1px solid var(--tsp-border);
        transition: all var(--tsp-transition);
      }
      .tsp-nav__dot--active {
        background: var(--tsp-accent);
        border-color: var(--tsp-accent);
        box-shadow: 0 0 6px var(--tsp-accent-glow);
        transform: scale(1.4);
      }
      .tsp-nav__dot-more {
        font-size: 10px;
        color: var(--tsp-text-faint);
        font-family: var(--tsp-font-mono);
        margin-left: 2px;
      }

      /* ── Footer ──────────────────────────────────────────────── */
      .tsp-footer {
        text-align: center;
        font-size: 11px;
        color: var(--tsp-text-faint);
        font-family: var(--tsp-font-mono);
      }
      .tsp-footer kbd {
        display: inline-block;
        padding: 1px 5px;
        background: var(--tsp-surface);
        border: 1px solid var(--tsp-border);
        border-radius: 4px;
        font-family: inherit;
        font-size: 10px;
      }

      /* ── Loading ─────────────────────────────────────────────── */
      .tsp-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100svh;
        gap: 16px;
      }
      .tsp-loading__icon {
        width: 52px;
        height: 52px;
        border-radius: 14px;
        background: var(--tsp-accent-dim);
        border: 1px solid rgba(245,166,35,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--tsp-accent);
      }
      .tsp-loading__label {
        font-size: 13px;
        color: var(--tsp-text-muted);
        font-family: var(--tsp-font-mono);
        letter-spacing: 0.06em;
      }
      .tsp-loading__bar {
        width: 160px;
        height: 3px;
        background: var(--tsp-surface-2);
        border-radius: 2px;
        overflow: hidden;
      }
      .tsp-loading__bar-fill {
        height: 100%;
        width: 40%;
        background: var(--tsp-accent);
        border-radius: 2px;
        animation: tsp-sweep 1.2s ease-in-out infinite;
      }

      /* ── Error ───────────────────────────────────────────────── */
      .tsp-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100svh;
        gap: 14px;
        text-align: center;
        padding: 24px;
      }
      .tsp-error__icon { color: var(--tsp-danger); }
      .tsp-error__title {
        font-family: var(--tsp-font-head);
        font-size: 22px;
        font-weight: 700;
        color: var(--tsp-text);
      }
      .tsp-error__msg {
        font-size: 14px;
        color: var(--tsp-text-muted);
        max-width: 400px;
      }
      .tsp-error__actions {
        display: flex;
        gap: 10px;
        margin-top: 8px;
      }

      /* ── Buttons (shared) ──────────────────────────────────── */
      .tsp-btn {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 9px 18px;
        border-radius: 9px;
        font-family: var(--tsp-font-body);
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--tsp-transition);
        border: 1px solid transparent;
      }
      .tsp-btn--ghost {
        background: var(--tsp-surface);
        border-color: var(--tsp-border);
        color: var(--tsp-text-muted);
      }
      .tsp-btn--ghost:hover {
        color: var(--tsp-text);
        border-color: var(--tsp-border-2);
      }
      .tsp-btn--primary {
        background: var(--tsp-accent);
        color: #0a0b0e;
        border-color: var(--tsp-accent);
      }
      .tsp-btn--primary:hover {
        background: #ffcf6d;
        box-shadow: 0 0 16px var(--tsp-accent-glow);
      }

      /* ── Lightbox ────────────────────────────────────────────── */
      .lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.96);
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 16px;
        z-index: 9999;
        animation: tsp-fade-in 200ms ease both;
      }
      .lightbox__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 38px;
        height: 38px;
        border-radius: 50%;
        border: 1px solid var(--tsp-border-2);
        background: rgba(255,255,255,0.08);
        color: rgba(255,255,255,0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all var(--tsp-transition);
        z-index: 2;
      }
      .lightbox__close:hover { background: rgba(255,255,255,0.15); color: #fff; }
      .lightbox__hint {
        position: absolute;
        top: 20px;
        left: 20px;
        font-size: 11px;
        color: rgba(255,255,255,0.35);
        font-family: var(--tsp-font-mono);
        background: rgba(255,255,255,0.05);
        padding: 4px 10px;
        border-radius: 20px;
      }
      .lightbox__stage {
        position: relative;
        width: 100%;
        max-width: 1100px;
        height: 85svh;
        animation: tsp-zoom-in 250ms cubic-bezier(.4,0,.2,1) both;
      }
      .lightbox__loading {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .lightbox__spinner {
        color: rgba(255,255,255,0.4);
        animation: spin 0.8s linear infinite;
      }
      .lightbox__img {
        object-fit: contain;
        border-radius: 12px;
      }

      /* ── Keyframes ───────────────────────────────────────────── */
      @keyframes tsp-fade-in  { from { opacity: 0; } to { opacity: 1; } }
      @keyframes tsp-zoom-in  { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
      @keyframes tsp-sweep {
        0%   { transform: translateX(-100%); }
        50%  { transform: translateX(200%); }
        100% { transform: translateX(200%); }
      }
      @keyframes spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }

      .tsp-spin { animation: spin 0.8s linear infinite; }
    `}</style>
  )
}