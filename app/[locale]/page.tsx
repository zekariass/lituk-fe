"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/lib/store"
import { useTranslations, useLocale } from "next-intl"
import { useTheme } from "next-themes"
import { useIsMobile } from "@/lib/hooks/use-media-query"
import { usePwaInstall } from "@/lib/hooks/use-pwa-install"
import { useTelegramMiniApp } from "@/lib/utils/telegram-detect"
import {
  BookOpen,
  Trophy,
  Target,
  Zap,
  CheckCircle,
  Globe,
  ArrowRight,
  Sun,
  Moon,
  FileQuestionIcon,
  PenBox,
  LayoutGrid,
  Lightbulb,
} from "lucide-react"
import { motion, useInView, AnimatePresence } from "framer-motion"
import Image from "next/image"

const LOCALES = [
  { code: "en", label: "EN", flagSrc: "https://flagcdn.com/w40/gb.png", flagAlt: "UK flag", direction: "ltr" },
  { code: "am", label: "AM", flagSrc: "https://flagcdn.com/w40/et.png", flagAlt: "Ethiopia flag", direction: "ltr" },
  { code: "ti", label: "TI", flagSrc: "https://flagcdn.com/w40/er.png", flagAlt: "Eritrea flag", direction: "ltr" },
  { code: "ar", label: "AR", flagSrc: "https://flagcdn.com/w40/sa.png", flagAlt: "Saudi Arabia flag", direction: "rtl" },
  { code: "bg", label: "BG", flagSrc: "https://flagcdn.com/w40/bg.png", flagAlt: "Bulgaria flag", direction: "ltr" },
  { code: "bn", label: "BN", flagSrc: "https://flagcdn.com/w40/bd.png", flagAlt: "Bangladesh flag", direction: "ltr" },
  { code: "cs", label: "CS", flagSrc: "https://flagcdn.com/w40/cz.png", flagAlt: "Czech Republic flag", direction: "ltr" },
  { code: "el", label: "EL", flagSrc: "https://flagcdn.com/w40/gr.png", flagAlt: "Greece flag", direction: "ltr" },
  { code: "es", label: "ES", flagSrc: "https://flagcdn.com/w40/es.png", flagAlt: "Spain flag", direction: "ltr" },
  { code: "fa", label: "FA", flagSrc: "https://flagcdn.com/w40/ir.png", flagAlt: "Iran flag", direction: "rtl" },
  { code: "fr", label: "FR", flagSrc: "https://flagcdn.com/w40/fr.png", flagAlt: "France flag", direction: "ltr" },
  { code: "gu", label: "GU", flagSrc: "https://flagcdn.com/w40/in.png", flagAlt: "India flag", direction: "ltr" },
  { code: "hi", label: "HI", flagSrc: "https://flagcdn.com/w40/in.png", flagAlt: "India flag", direction: "ltr" },
  { code: "hu", label: "HU", flagSrc: "https://flagcdn.com/w40/hu.png", flagAlt: "Hungary flag", direction: "ltr" },
  { code: "it", label: "IT", flagSrc: "https://flagcdn.com/w40/it.png", flagAlt: "Italy flag", direction: "ltr" },
  { code: "ku", label: "KU", flagSrc: "https://flagcdn.com/w40/iq.png", flagAlt: "Iraq flag", direction: "rtl" },
  { code: "lt", label: "LT", flagSrc: "https://flagcdn.com/w40/lt.png", flagAlt: "Lithuania flag", direction: "ltr" },
  { code: "lv", label: "LV", flagSrc: "https://flagcdn.com/w40/lv.png", flagAlt: "Latvia flag", direction: "ltr" },
  { code: "ne", label: "NE", flagSrc: "https://flagcdn.com/w40/np.png", flagAlt: "Nepal flag", direction: "ltr" },
  { code: "pa", label: "PA", flagSrc: "https://flagcdn.com/w40/in.png", flagAlt: "India flag", direction: "ltr" },
  { code: "pl", label: "PL", flagSrc: "https://flagcdn.com/w40/pl.png", flagAlt: "Poland flag", direction: "ltr" },
  { code: "prs", label: "PRS", flagSrc: "https://flagcdn.com/w40/af.png", flagAlt: "Afghanistan flag", direction: "rtl" },
  { code: "ps", label: "PS", flagSrc: "https://flagcdn.com/w40/af.png", flagAlt: "Afghanistan flag", direction: "rtl" },
  { code: "pt", label: "PT", flagSrc: "https://flagcdn.com/w40/pt.png", flagAlt: "Portugal flag", direction: "ltr" },
  { code: "ro", label: "RO", flagSrc: "https://flagcdn.com/w40/ro.png", flagAlt: "Romania flag", direction: "ltr" },
  { code: "ru", label: "RU", flagSrc: "https://flagcdn.com/w40/ru.png", flagAlt: "Russia flag", direction: "ltr" },
  { code: "sk", label: "SK", flagSrc: "https://flagcdn.com/w40/sk.png", flagAlt: "Slovakia flag", direction: "ltr" },
  { code: "so", label: "SO", flagSrc: "https://flagcdn.com/w40/so.png", flagAlt: "Somalia flag", direction: "ltr" },
  { code: "sq", label: "SQ", flagSrc: "https://flagcdn.com/w40/al.png", flagAlt: "Albania flag", direction: "ltr" },
  { code: "ta", label: "TA", flagSrc: "https://flagcdn.com/w40/in.png", flagAlt: "India flag", direction: "ltr" },
  { code: "tl", label: "TL", flagSrc: "https://flagcdn.com/w40/ph.png", flagAlt: "Philippines flag", direction: "ltr" },
  { code: "tr", label: "TR", flagSrc: "https://flagcdn.com/w40/tr.png", flagAlt: "Turkey flag", direction: "ltr" },
  { code: "uk", label: "UK", flagSrc: "https://flagcdn.com/w40/ua.png", flagAlt: "Ukraine flag", direction: "ltr" },
  { code: "ur", label: "UR", flagSrc: "https://flagcdn.com/w40/pk.png", flagAlt: "Pakistan flag", direction: "rtl" },
  { code: "zh", label: "ZH", flagSrc: "https://flagcdn.com/w40/cn.png", flagAlt: "China flag", direction: "ltr" },
]

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
}

function AnimatedSection({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={stagger}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const t = useTranslations("landingPage")
  const router = useRouter()
  const pathname = usePathname()
  const currentLocale = useLocale()
  const { isAuthenticated, selectedLicenceCategoryId } = useAuthStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeShowcase, setActiveShowcase] = useState(0)
  const [localeDirection, setLocaleDirection] = useState("ltr")
  const isMobile = useIsMobile()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const direction = LOCALES.find((l) => l.code === currentLocale)?.direction || "ltr"
    setLocaleDirection(direction)
  }, [currentLocale])

  const isDark =
    mounted &&
    (theme === "dark" ||
      (theme === "system" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches))

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])


  const { isMobile: isMobilePwa, isStandalone, canInstallNative, promptInstall } = usePwaInstall()
  const tPwa = useTranslations('pwa')
  const isTelegram = useTelegramMiniApp()
  const isIPhone = typeof window !== 'undefined' && /iPhone/.test(navigator.userAgent) && !(window as any).MSStream

  const handleInstall = () => {
    if (isStandalone) {
      alert(tPwa('alreadyInstalled'))
      return
    }
    if (canInstallNative) {
      void promptInstall()
    }
  }

  const switchLocale = (locale: string) => {
    setLocaleDirection(LOCALES.find((l) => l.code === locale)?.direction || "ltr")
    const segments = pathname.split("/")
    segments[1] = locale
    router.push(segments.join("/"))
  }

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/practice")
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated])

  if (isAuthenticated) return null

  const features = [
    {
      icon: FileQuestionIcon,
      title: t("featureQuestionsTitle"),
      description: t("featureQuestionsDescription"),
    },
    {
      icon: PenBox,
      title: t("featureMockTitle"),
      description: t("featureMockDescription"),
    },
    {
      icon: Trophy,
      title: t("featureLeaderboardTitle"),
      description: t("featureLeaderboardDescription"),
    },
  ]

  const benefits = [
    {
      icon: CheckCircle,
      title: t("benefitProgressTitle"),
      description: t("benefitProgressDescription"),
    },
    {
      icon: Zap,
      title: t("benefitFeedbackTitle"),
      description: t("benefitFeedbackDescription"),
    },
    {
      icon: Globe,
      title: t("benefitJurisdictionTitle"),
      description: t("benefitJurisdictionDescription"),
    },
    {
      icon: Target,
      title: t("benefitAdaptiveTitle"),
      description: t("benefitAdaptiveDescription"),
    },
  ]

  const stats = [
    { number: "2,000+", label: "Questions" },
    { number: "95%", label: "Pass Rate" },
    { number: "10k+", label: "Learners" },
  ]

  const showcaseItems = [
    {
      id: "categories",
      icon: LayoutGrid,
      label: t("showcaseCategoriesLabel"),
      description: t("showcaseCategoriesDescription"),
      src: "/screenshots/categories-with-easy-language-switch.jpg",
      alt: "Categories view with language switch",
    },
    {
      id: "questions",
      icon: FileQuestionIcon,
      label: t("showcaseQuestionsLabel"),
      description: t("showcaseQuestionsDescription"),
      src: "/screenshots/questions-with-easy-language-switch.jpg",
      alt: "Questions view with language switch",
    },
    {
      id: "explanations",
      icon: BookOpen,
      label: t("showcaseExplanationsLabel"),
      description: t("showcaseExplanationsDescription"),
      src: "/screenshots/explanations-with-easy-language-switch.jpg",
      alt: "Explanations view with language switch",
    },
    // {
    //   id: "tips",
    //   icon: Lightbulb,
    //   label: t("showcaseTipsLabel"),
    //   description: t("showcaseTipsDescription"),
    //   src: "/screenshots/tips-with-easy-language-switch.jpg",
    //   alt: "Tips view with language switch",
    // },
  ]

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden" dir={localeDirection}>
      {/* ── NAV ── */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-emerald-800 backdrop-blur-xl shadow-sm border-b border-white/20 font-semibold"
            : "bg-emerald-800 backdrop-blur-xl shadow-sm border-b border-white/20 font-semibold"
        }`}
      >
        {/* ── TOP LANGUAGE SCROLLER ── */}
        <div className="w-full border-b border-white/10 bg-emerald-900/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-2 sm:px-4">
            <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar" ref={(el) => {
              if (!el) return
              // On mount, scroll the active button to center
              const activeBtn = el.querySelector('[data-active="true"]') as HTMLElement
              if (activeBtn) {
                activeBtn.scrollIntoView({ inline: 'center', behavior: 'instant' as ScrollBehavior })
              }
            }}>
              {LOCALES.map(({ code, label, flagSrc, flagAlt, direction }) => (
                <button
                  key={code}
                  data-active={currentLocale === code}
                  onClick={(e) => {
                    switchLocale(code)
                    // Scroll the clicked button to center
                    e.currentTarget.scrollIntoView({ inline: 'center', behavior: 'smooth' })
                  }}
                  className={`shrink-0 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer outline-none border ${
                    currentLocale === code
                      ? "bg-emerald-950 text-white shadow-sm border-white/50"
                      : "bg-emerald-800/80 text-white/70 hover:bg-emerald-700 border-white/40 hover:border-white/30"
                  }`}
                >
                  <img
                    src={flagSrc}
                    alt={flagAlt}
                    className="w-3.5 h-2.5 sm:w-4 sm:h-3 object-cover rounded-sm shrink-0"
                  />
                  <span className={direction === 'rtl' ? 'hidden sm:inline' : ''}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 sm:px-8 lg:px-12 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-white no-underline select-none"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <Image src="/logo.svg" alt="Life in the UK Test" width={32} height={32} />
            </div>
            <span className="font-semibold text-lg tracking-tight hidden sm:block">
              Life in the UK Test
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-5">
            <Link
              href="#features"
              className="hidden md:block text-sm text-white hover:text-white/80 transition-colors no-underline"
            >
              {t("navFeatures")}
            </Link>
            <Link
              href="#why"
              className="hidden md:block text-sm text-white hover:text-white/80 transition-colors no-underline"
            >
              {t("navWhyUs")}
            </Link>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
              className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center
                         text-white hover:text-white/20 font-semibold bg-emerald-600/80 hover:bg-emerald-600/90
                         transition-all duration-200 cursor-pointer outline-none relative overflow-hidden"
            >
              <Sun
                size={15}
                className={`absolute transition-all duration-300 text-white ${
                  isDark
                    ? "opacity-0 rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
              <Moon
                size={15}
                className={`absolute transition-all duration-300 ${
                  !isDark
                    ? "opacity-0 -rotate-90 scale-50"
                    : "opacity-100 rotate-0 scale-100"
                }`}
              />
            </button>

            <Link
              href="/login"
              className="text-sm font-semibold text-white bg-emerald-600/80
                         px-4 py-2 rounded-full no-underline hover:opacity-90
                         transition-opacity whitespace-nowrap shadow-sm border border-white/20"
            >
              {t("signIn")}
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section
        className="relative min-h-0 sm:min-h-[100dvh] flex flex-col items-center justify-center
                   text-center px-5 sm:px-8 pt-32 sm:pt-6 pb-6 sm:pb-10 overflow-hidden"
      >
        {/* Background decoration */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] sm:w-[800px] h-[400px] sm:h-[600px]
                        bg-[radial-gradient(ellipse,hsl(var(--primary)/0.08)_0%,transparent_70%)]"
          />
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-4xl sm:text-5xl md:text-6xl lg:text-7xl
                     font-bold tracking-tight leading-[1.1] max-w-4xl mb-6"
        >
          {t("heroTitle")}
        </motion.h1>

        {/* Sub-headline */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 text-base sm:text-lg text-muted-foreground max-w-lg mb-6 leading-relaxed"
        >
          {t("heroSubtitle")}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto"
        >
          <Link
            href="/practice"
            className="group inline-flex items-center justify-center gap-2.5 font-bold
                       text-white bg-gradient-to-r from-emerald-900 to-emerald-800
                       px-10 py-3.5 rounded-xl no-underline text-xl sm:text-xl
                       hover:from-emerald-800 hover:to-emerald-700
                       shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-500/40
                       hover:-translate-y-0.5 active:translate-y-0
                       transition-all duration-300 w-full sm:w-auto"
          >
            {t("startPractising")}
            {/* <ArrowRight size={20} className="transition-transform duration-300 group-hover:translate-x-1" /> */}
          </Link>
          {/* <Link
            href="/login"
            className="inline-flex items-center justify-center text-muted-foreground
                       border border-border px-7 py-3.5 rounded-lg no-underline
                       text-[15px] hover:text-foreground hover:border-foreground/20
                       bg-emerald-300/[0.5] hover:bg-emerald-300/50 transition-all w-full sm:w-auto"
          >
            {t("signIn")}
          </Link> */}
          {!isStandalone && (
            <button
              onClick={handleInstall}
              className="inline-flex items-center justify-center gap-2
                         text-white border border-green-600/30 px-7 py-3.5
                         rounded-lg text-[15px] bg-green-700 w-full sm:w-auto
                         hover:bg-green-800 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
              </svg>
              {t("installAndroidPwa")}
            </button>
          )}
        </motion.div>
        {/* <p className="text-center text-sm text-muted-foreground sm:hidden inline-flex items-center justify-center">
          This is not a native mobile app. It is a Progressive Web App (PWA) that saves the website to your device, allowing you to access it like a mobile app.
        </p> */}
      </section>

      {/* ── STATS ── */}
      {/* <AnimatedSection className="max-w-3xl mx-auto px-5 sm:px-8 -mt-8 mb-8">
        <div
          className="grid grid-cols-3 border border-border/60 rounded-2xl overflow-hidden
                     bg-card/50 backdrop-blur-sm divide-x divide-border/60"
        >
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              variants={fadeUp}
              custom={i}
              className="py-8 sm:py-10 px-4 sm:px-6 text-center"
            >
              <span className="text-2xl sm:text-4xl font-bold block text-foreground tracking-tight">
                {s.number}
              </span>
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-muted-foreground mt-2 block font-medium">
                {s.label}
              </span>
            </motion.div>
          ))}
        </div>
      </AnimatedSection> */}


      {/* ── FEATURES ── */}
      <section
        id="features"
        className="px-5 sm:px-8 lg:px-12 py-12 sm:py-16 w-full mx-auto bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-900"
      >
        <AnimatedSection className="mb-16 max-w-xl">
          <motion.p
            variants={fadeUp}
            className="text-sm font-semibold tracking-widest uppercase text-white mb-4"
          >
            {t("featuresLabel")}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight text-white"
          >
            {t("featuresHeading")}
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="group relative bg-cardbg-emerald-300 border border-white rounded-2xl
                         p-8 sm:p-9 transition-all duration-300
                         hover:shadow-xl hover:shadow-primary/5
                         hover:border-primary/20 hover:-translate-y-1"
            >
              <div
                className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center
                           text-white mb-6 group-hover:bg-primary/15 transition-colors"
              >
                <feature.icon size={22} strokeWidth={1.75} />
              </div>
              <h3 className="text-lg font-semibold tracking-tight mb-2 text-white">
                {feature.title}
              </h3>
              <p className="text-sm font-medium text-white leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </AnimatedSection>
      </section>

      {/* ── APP SHOWCASE ── */}
      <section id="showcase" className="px-5 sm:px-8 lg:px-12 py-24 sm:py-32 max-w-6xl mx-auto">
        <AnimatedSection className="mb-12 text-center max-w-2xl mx-auto">
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest uppercase text-primary mb-4"
          >
            {t("showcaseLabel")}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-4"
          >
            {t("showcaseHeading")}
          </motion.h2>
          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base text-muted-foreground leading-relaxed"
          >
            {t("showcaseDescription")}
          </motion.p>
        </AnimatedSection>

        <AnimatedSection>
          <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-2 mb-4">
            {showcaseItems.map((item, i) => (
              <button
                key={item.id}
                onClick={() => setActiveShowcase(i)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium
                           transition-all duration-300 cursor-pointer border-0 outline-none
                           ${activeShowcase === i
                             ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/25"
                             : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                           }`}
              >
                <item.icon size={16} />
                {item.label}
              </button>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} custom={1} className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-border/60 shadow-2xl shadow-black/10 bg-card">
              <div className="flex items-center gap-2 px-4 py-3 bg-muted/50 border-b border-border/60">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/70" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/70" />
                  <span className="w-3 h-3 rounded-full bg-green-400/70" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-background/60 rounded-md px-3 py-1 text-xs text-muted-foreground text-center max-w-xs mx-auto">
                    lifeintheuk.app
                  </div>
                </div>
              </div>

              <div className="relative h-[280px] sm:h-[400px] lg:h-[500px] overflow-hidden bg-slate-950">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeShowcase}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={showcaseItems[activeShowcase].src}
                      alt={showcaseItems[activeShowcase].alt}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 1100px"
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={activeShowcase}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.25 }}
                className="text-center text-sm text-muted-foreground mt-6 max-w-lg mx-auto"
              >
                {showcaseItems[activeShowcase].description}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-5">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ── WHY CHOOSE US ── */}
      <section
        id="why"
        className="px-5 sm:px-8 lg:px-8 py-12 sm:py-10 max-w-6xl mx-auto"
      >
        <AnimatedSection className="mb-8 max-w-xl">
          <motion.p
            variants={fadeUp}
            className="text-xs font-semibold tracking-widest uppercase text-primary mb-4"
          >
            {t("whyChooseLabel")}
          </motion.p>
          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight"
          >
            {t("whyChooseTitle")}
          </motion.h2>
        </AnimatedSection>

        <AnimatedSection className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {benefits.map((item, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              custom={i}
              className="group flex gap-5 p-7 sm:p-8 border border-white/20
                         rounded-2xl transition-all duration-300
                         hover:border-primary/20 bg-gradient-to-br from-emerald-900 via-emerald-700 to-emerald-900 hover:opacity-90
                         hover:shadow-lg hover:shadow-primary/5"
            >
              <div
                className="shrink-0 w-11 h-11 rounded-xl bg-primary/10
                           flex items-center justify-center text-white font-semibold
                           group-hover:bg-primary/15 transition-colors"
              >
                <item.icon size={20} strokeWidth={1.75} />
              </div>
              <div>
                <h3 className="font-semibold text-white tracking-tight mb-1.5">
                  {item.title}
                </h3>
                <p className="text-sm text-white font-semibold leading-relaxed">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatedSection>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-5 sm:px-8 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          <div
            className="absolute bottom-1/3 left-1/2 -translate-x-1/2
                        w-[500px] sm:w-[700px] h-[300px] sm:h-[400px]
                        bg-[radial-gradient(ellipse,hsl(var(--primary)/0.06)_0%,transparent_70%)]"
          />
        </div>

        <AnimatedSection className="relative z-10 text-center max-w-2xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="inline-flex items-center gap-2 text-xs font-medium
                       tracking-wider uppercase text-primary border border-primary/20
                       rounded-full px-4 py-1.5 bg-primary/5 mb-8"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
            {t("readyToPass")}
          </motion.div>

          <motion.h2
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-5"
          >
            {t("ctaTitle")}
          </motion.h2>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-10 max-w-md mx-auto"
          >
            {t("ctaDescription")}
          </motion.p>

          <motion.div variants={fadeUp} custom={3}>
            <Link
              href="/practice"
              className="group inline-flex items-center justify-center gap-2.5 font-bold
                       text-white bg-gradient-to-r from-emerald-600 to-emerald-500
                       px-10 py-3.5 rounded-xl no-underline text-lg sm:text-xl
                       hover:from-emerald-500 hover:to-emerald-400
                       shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-500/40
                       hover:-translate-y-0.5 active:translate-y-0
                       transition-all duration-300 w-full sm:w-auto"
            >
              {t("ctaButton")}
              <ArrowRight size={16} />
            </Link>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/20 px-5 sm:px-10 lg:px-12 py-8 bg-gradient-to-r from-emerald-900 via-emerald-900 to-emerald-900">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row items-center justify-between w-full gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded flex items-center justify-center">
                <Image src="/logo.svg" alt="Life in the UK Test" width={20} height={20} />
              </div>
              <span className="text-xs text-white">
                {t("footerCopyright")}
              </span>
            </div>
            <div className="flex items-center gap-6">
              {[
                [t("footerPrivacy"), "/privacy"],
                [t("footerTerms"), "/terms"],
                [t("footerCookies"), "/cookies"],
                [t("footerContact"), "/contact"],
              ].map(([label, href]) => (
                <Link
                  key={label}
                  href={href}
                  className="text-xs text-white hover:text-white/80 transition-colors no-underline"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          {/* Official test disclaimer */}
          <p className="text-xs text-white/70 text-center max-w-lg leading-relaxed">
            {t.rich("footerDisclaimer", {
              strong: (chunks) => <span className="font-semibold text-white/90">{chunks}</span>,
            })}
          </p>
        </div>
      </footer>

    </div>
  )
}