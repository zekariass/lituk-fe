import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Menu, X, LayoutGrid, Trophy, BookOpen, ClipboardList,
  CircleDollarSign, User, LogIn, LogOut, ChevronDown, Settings, Loader2, Download,
  Flag, MessageSquare, OctagonAlert,
  Settings2,
} from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import { useTranslations } from 'next-intl'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'
import { cn } from '@/lib/utils'
import { usePwaInstall } from '@/lib/hooks/use-pwa-install'
import { useTelegramMiniApp } from '@/lib/utils/telegram-detect'
import api from '@/lib/api/client'
import { LicenceCategory } from '@/lib/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const t        = useTranslations('dashboardShell')
  const pathname = usePathname()
  const router   = useRouter()

  const [drawerOpen, setDrawerOpen]                         = useState(false)
  const [licenceCategories, setLicenceCategories]           = useState<LicenceCategory[]>([])
  const [isLoadingLicenceCategories, setIsLoadingCategories] = useState(false)
  const { isMobile, canInstallNative, promptInstall } = usePwaInstall()
  const tPwa = useTranslations('pwa')
  const isTelegram = useTelegramMiniApp()

  const handleInstall = () => {
    // Live check: are we currently running as a PWA?
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true
    if (standalone) {
      alert(tPwa('alreadyInstalled'))
      return
    }
    if (canInstallNative) {
      void promptInstall()
    }
  }

  const {
    user, isAuthenticated, logout,
    selectedLicenceCategoryId, setSelectedLicenceCategoryId,
  } = useAuthStore()

  useEffect(() => {
    const jurisdictionId = user?.activeJurisdictionId
    if (!isAuthenticated || !jurisdictionId) {
      setLicenceCategories([])
      setIsLoadingCategories(false)
      setSelectedLicenceCategoryId(null)
      return
    }

    let isMounted = true
    const fetchCategories = async () => {
      setIsLoadingCategories(true)
      try {
        const response = await api.get(`/api/v1/content/jurisdictions/${jurisdictionId}/licence-categories`)
        const raw = response?.data?.data
        const categories: LicenceCategory[] = Array.isArray(raw)
          ? raw : Array.isArray(raw?.items) ? raw.items : []
        if (isMounted) {
          setLicenceCategories(categories)
          const hasSaved = typeof selectedLicenceCategoryId === 'number'
            && categories.some((c) => c.id === selectedLicenceCategoryId)
          if (!hasSaved) {
            const def = categories.find((c) => c.isDefault) ?? categories[0]
            setSelectedLicenceCategoryId(def?.id ?? null)
          }
        }
      } catch {
        if (isMounted) { setLicenceCategories([]); setSelectedLicenceCategoryId(null) }
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    }
    fetchCategories()
    return () => { isMounted = false }
  }, [isAuthenticated, selectedLicenceCategoryId, setSelectedLicenceCategoryId, user?.activeJurisdictionId])

  const handleLogout = async () => { await logout(); window.location.href = '/' }

  const revisionHref = selectedLicenceCategoryId
    ? `/practice/revision?licenceCategoryId=${String(selectedLicenceCategoryId)}`
    : '/practice/revision'

  const selectedCategoryName =
    licenceCategories.find((c) => c.id === selectedLicenceCategoryId)?.name
    ?? t('noLicenceCategories')

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  const navItems = [
    { href: revisionHref,            activeHref: '/practice/revision',    label: t('revision'),    icon: BookOpen },
    { href: '/practice/mock-test',   activeHref: '/practice/mock-test',   label: t('mockTest'),   icon: ClipboardList },
    // { href: '/practice/leaderboard', activeHref: '/practice/leaderboard', label: t('leaderboard'), icon: Trophy },
    { href: '/practice/flags',  activeHref: '/practice/flags', label: t('flags'), icon: Flag},
    // { href: '/practice/traffic-signs',  activeHref: '/practice/traffic-signs', label: t('trafficSigns'), icon: OctagonAlert}
  ]

  // ── Licence category switcher ─────────────────────────────────────────────
  const CategorySwitcher = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 rounded-xl
                     text-xs font-medium text-[var(--foreground)]
                     bg-[var(--background)] border border-border
                     hover:bg-[var(--background-hover)] hover:text-[var(--foreground-hover)]
                     disabled:opacity-40 disabled:cursor-not-allowed
                     transition-all duration-200 cursor-pointer"
          disabled={isLoadingLicenceCategories || licenceCategories.length === 0}
        >
          <span className="truncate">
            {isLoadingLicenceCategories
              ? <span className="flex items-center gap-1.5"><Loader2 size={11} className="animate-spin" />{t('loadingLicenceCategories')}</span>
              : selectedCategoryName}
          </span>
          <ChevronDown size={13} className="text-[var(--foreground)] shrink-0" />
        </button>
      </DropdownMenuTrigger>

      {licenceCategories.length > 0 && (
        <DropdownMenuContent
          align="start"
          className="min-w-[150px] p-1
                   !bg-[var(--background)] border border-[var(--border)] rounded-xl
                   shadow-[0_8px_32px_rgba(0,0,0,0.50)]
                   !text-[var(--foreground)]"
        >
          <DropdownMenuRadioGroup
            value={selectedLicenceCategoryId ? String(selectedLicenceCategoryId) : ''}
            onValueChange={(value) => {
              const id = Number(value)
              if (!Number.isFinite(id) || id <= 0) return
              if (id === selectedLicenceCategoryId) {
                setDrawerOpen(false)
                return
              }
              setSelectedLicenceCategoryId(id)
              setDrawerOpen(false)
              // router.push(`/practice/revision?licenceCategoryId=${id}`)
              router.push(`/practice`)
              router.refresh()
            }}
          >
            {licenceCategories.map((item) => (
              <DropdownMenuRadioItem
                key={item.id}
                value={String(item.id)}
                className="text-xs !text-[var(--foreground)] rounded-lg px-3 py-2
                           hover:text-[var(--foreground-hover)] hover:bg-[var(--background-hover)]
                           data-[state=checked]:text-primary
                           data-[state=checked]:bg-primary/[0.07]
                           cursor-pointer transition-colors duration-150
                           [&>span:first-child]:hidden"
              >
                {item.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  )

  // ── Main nav links ────────────────────────────────────────────────────────
  const MainNav = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="space-y-0.5">
      {isAuthenticated && (
        <div className="mb-3 px-1">
          {/* <p className="text-[15px] uppercase tracking-widest text-[var(--foreground)] font-medium mb-2 px-2">
            {t('licenceCategory')}
          </p> */}
          <CategorySwitcher />
        </div>
      )}

      <p className="text-[15px] uppercase tracking-widest text-[var(--foreground)] font-medium mb-2 px-3">
        {t('navigation')}
      </p>

      {navItems.map(({ href, activeHref, label, icon: Icon }) => {
        const active = isActive(activeHref)
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={cn(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
              "transition-all duration-200 group",
              active
                ? "bg-primary/[0.09] text-primary"
                : "text-foreground/40 hover:text-foreground/75 hover:bg-foreground/[0.05]"
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                               bg-primary rounded-r-full"
                    style={{ boxShadow: '0 0 8px hsl(var(--primary))' }} />
            )}
            <Icon size={16} className="shrink-0" />
            <span className="font-medium truncate">{label}</span>
            {active && (
              <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0"
                    style={{ boxShadow: '0 0 5px hsl(var(--primary))' }} />
            )}
          </Link>
        )
      })}
    </nav>
  )

  // ── Utility links (pricing / profile / logout) ────────────────────────────
  const UtilityMenu = ({ onNavigate }: { onNavigate?: () => void }) => (
    <div className="space-y-0.5">
      <Link
        href="/practice/pricing"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40
                   hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all duration-200"
      >
        <CircleDollarSign size={15} className="shrink-0" />
        {t('pricing')}
      </Link>

      <Link
        href="/contact"
        onClick={onNavigate}
        className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40
                   hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all duration-200"
      >
        <MessageSquare size={15} className="shrink-0" />
        {t('contactUs')}
      </Link>

      {isAuthenticated ? (
        <>
          <Link
            href="/profile"
            onClick={onNavigate}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40
                       hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all duration-200 "
          >
            <User size={15} className="shrink-0" />
            <span className="truncate">{t('settings')}</span>
          </Link>

          {(user?.role === 'admin' || user?.role === 'data_entry') && (
            <Link
              href="/backoffice"
              onClick={onNavigate}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40
                         hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all duration-200 cursor-pointer"
            >
              <Settings size={15} className="shrink-0" />
              {t('backOffice')}
            </Link>
          )}

          <button
            onClick={() => { onNavigate?.(); handleLogout() }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40
                       hover:text-destructive/80 hover:bg-destructive/[0.06]
                       transition-all duration-200 cursor-pointer"
          >
            <LogOut size={15} className="shrink-0" />
            {t('logout')}
          </button>
        </>
      ) : (
        <Link
          href="/login"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40 cursor-pointer
                     hover:text-primary hover:bg-primary/[0.06] transition-all duration-200"
        >
          <LogIn size={15} className="shrink-0" />
          {t('login')}
        </Link>
      )}

      {/* {!isTelegram && isMobile && (
        <button
          onClick={() => { onNavigate?.(); handleInstall() }}
          className="lg:hidden flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/40
                     hover:text-foreground/75 hover:bg-foreground/[0.05] transition-all duration-200"
        >
          <Download size={15} className="shrink-0" />
          {t('installApp')}
        </button>
      )} */}

      {/* <div className="flex items-center gap-2 px-3 pt-1">
        <LanguageSwitcher />
        <ThemeToggle />
      </div> */}
      <div className="flex items-center gap-2">
        <div className='bg-emerald-300/50 rounded-xl'>
          <LanguageSwitcher variant="dropdown" />
        </div>
        <div className='bg-emerald-300/50 rounded-xl'>
          <ThemeToggle />
        </div>
      </div>
    </div>
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        .sidebar-glow::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 260px;
          background: radial-gradient(ellipse 120% 200px at 50% -20px, hsl(var(--primary) / 0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <div className="font-dm min-h-screen bg-background text-foreground">

        {/* ── Mobile top header ── */}
        <header className="fixed inset-x-0 top-0 z-40 h-14 flex items-center justify-between px-4
                            bg-emerald-800 backdrop-blur-md border-b border-border lg:hidden">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label={t('openNavigationDrawer')}
            className="w-9 h-9 flex items-center justify-center rounded-xl
                       text-white hover:text-white/70 hover:bg-white/[0.06]
                       transition-all duration-200"
          >
            <Menu size={18} />
          </button>

          <Link href="/practice" className="flex items-center gap-2">
            <img src="/logo.svg" alt="HabeshaDrive logo" className="w-6 h-6 shrink-0" />
            <span className="font-syne font-bold text-lg text-white">
              <span className="text-white">LITUK</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <div className='bg-emerald-300/50 rounded-xl'>
              <LanguageSwitcher variant="dropdown"/>
            </div>
            <div className='bg-emerald-300/50 rounded-xl'>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* ── Mobile drawer ── */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <button
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
              aria-label={t('closeNavigationDrawer')}
            />

            {/* Drawer panel */}
            <aside className="relative h-full w-[80%] max-w-[280px] flex flex-col
                               bg-[var(--sidenav)] border-r border-border
                              shadow-[4px_0_32px_rgba(0,0,0,0.2)] sidebar-glow overflow-hidden">

              {/* Drawer header */}
              <div className="relative z-10 flex items-center justify-between h-14 px-5
                              border-b border-border shrink-0 bg-[var(--sidenav-header)]">
                <Link href="/practice" className="flex items-center gap-2" onClick={() => setDrawerOpen(false)}>
                  <img src="/logo.svg" alt="LITUK logo" className="w-6 h-6 shrink-0" />
                  <span className="font-syne font-bold text-sm">
                    <span className="text-primary">LITUK</span>
                  </span>
                </Link>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg
                             text-foreground/30 hover:text-foreground/70 hover:bg-foreground/[0.06]
                             transition-all duration-200"
                  aria-label={t('closeDrawer')}
                >
                  <X size={15} />
                </button>
              </div>

              {/* Drawer body */}
              <div className="relative z-10 flex-1 overflow-y-auto px-3 py-5 space-y-6">
                <MainNav onNavigate={() => setDrawerOpen(false)} />

                <div className="border-t border-border pt-5">
                  <p className="text-[10px] uppercase tracking-widest text-foreground/40 font-medium mb-2 px-3">
                    {t('quickActions')}
                  </p>
                  <UtilityMenu onNavigate={() => setDrawerOpen(false)} />
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* ── Main layout ── */}
        <div className="mx-auto flex min-h-screen max-w-[1600px] lg:h-screen lg:overflow-hidden">

          {/* ── Desktop sidebar ── */}
          <aside className="hidden lg:flex h-full w-[260px] shrink-0 flex-col
                            bg-[var(--sidenav)] border-r border-border
                            sidebar-glow relative overflow-hidden">

            {/* Logo */}
            <div className="relative z-10 flex items-center h-16 px-5 border-b border-border shrink-0">
              <Link href="/practice" className="flex items-center gap-2.5 group">
                <img
                  src="/logo.svg"
                  alt="HabeshaDrive logo"
                  className="w-7 h-7 shrink-0 transition-transform duration-200 group-hover:scale-105"
                />
                <span className="font-syne font-bold text-sm tracking-tight">
                  Habesha<span className="text-primary">Drive</span>
                </span>
              </Link>
            </div>

            {/* Nav */}
            <div className="relative z-10 flex-1 overflow-y-auto px-3 py-5">
              <div className="space-y-6">
                <MainNav />

                {/* Bottom controls */}
                <div className="border-t border-border pt-5">
                  <p className="text-[15px] uppercase tracking-widest text-foreground/40 font-medium mb-2 px-3">
                    {t('controls')}
                  </p>
                  <UtilityMenu />
                </div>
              </div>
            </div>
          </aside>

          {/* ── Page content ── */}
          <div className="w-full lg:flex-1 lg:h-full lg:overflow-y-auto">
            <main className="min-h-screen px-4 pb-24 pt-20 sm:px-6 lg:min-h-full lg:px-8 lg:py-8">
              {children}
            </main>
          </div>
        </div>

        {/* ── Mobile bottom nav ── */}
        <nav className="fixed inset-x-0 bottom-0 z-40 h-18 flex items-center
                         bg-emerald-800 backdrop-blur-md border-t border-border lg:hidden">
          <div className="flex w-full max-w-md mx-auto">
            {[
              { href: '/practice/revision',    icon: BookOpen,      label: t('revision') },
              { href: '/practice/mock-test',   icon: ClipboardList, label: t('mockTest') },
              // { href: '/practice/leaderboard', icon: Trophy,        label: t('leaderboard') },
              { href: '/profile',              icon: Settings2,          label: t('settings') },
            ].map(({ href, icon: Icon, label }) => {
              const active = isActive(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex flex-1 flex-col items-center justify-center gap-1 text-[13px] font-medium",
                    "transition-colors duration-200",
                    active ? "text-white" : "text-white hover:text-white/70"
                  )}
                >
                  <Icon size={18} />
                  <span className="tracking-wide">{label}</span>
                </Link>
              )
            })}
          </div>
        </nav>
      </div>
    </>
  )
}