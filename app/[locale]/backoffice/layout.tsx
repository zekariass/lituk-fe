"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import {
  LayoutDashboard, FileQuestion, Users, Globe,
  FolderTree, Award, ClipboardList, ArrowLeft,
  Flag, Settings, OctagonAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Dashboard',          href: '/practice/revision',             icon: LayoutDashboard },
  { label: 'Mock Test Configs',  href: '/backoffice/mock-tests/configs', icon: Settings },
  { label: 'Mock Tests',         href: '/backoffice/mock-tests',         icon: ClipboardList },
  { label: 'Questions',          href: '/backoffice/questions',          icon: FileQuestion },
  { label: 'Categories',         href: '/backoffice/categories',         icon: FolderTree },
  { label: 'Licence Categories', href: '/backoffice/licence-categories', icon: Award },
  // { label: 'Traffic Sign Categories', href: '/backoffice/traffic-signs',  icon: OctagonAlert },
  { label: 'Jurisdictions',      href: '/backoffice/jurisdictions',      icon: Globe },
  { label: 'Countries',          href: '/backoffice/countries',          icon: Flag },
  { label: 'Users',              href: '/backoffice/users',              icon: Users },
]

export default function BackofficeLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { user, isAuthenticated } = useAuthStore()
  const [isMounted, setIsMounted] = useState(false)

  const role             = user?.role
  const isAdmin          = role === 'admin'
  const isDataEntry      = role === 'data_entry'
  const isBackofficeUser = isAdmin || isDataEntry

  useEffect(() => { setIsMounted(true) }, [])

  useEffect(() => {
    if (!isMounted) return
    if (!isAuthenticated) { router.push('/login'); return }
    if (!isBackofficeUser) { router.push('/practice/revision'); return }

    if (isDataEntry) {
      const normalizedPath = (pathname?.replace(/^\/(am|en|ti|so|ar)/, '') ?? pathname ?? '')
      if (normalizedPath && !normalizedPath.startsWith('/backoffice/questions')) {
        router.replace('/backoffice/questions')
      }
    }
  }, [isMounted, isAuthenticated, isBackofficeUser, isDataEntry, pathname, router])

  if (!isMounted || !isAuthenticated || !isBackofficeUser) return null

  const filteredNavItems = isDataEntry
    ? navItems.filter(({ href }) => href === '/backoffice/questions')
    : navItems

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
          height: 240px;
          background: radial-gradient(ellipse 120% 180px at 50% -10px, rgba(110,231,183,0.06) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <div className="font-dm h-screen bg-[#12131a] text-[#f0f0f5] flex overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className="hidden md:flex w-[230px] shrink-0 flex-col h-screen
                          bg-[#181920] border-r border-white/[0.07]
                          sidebar-glow relative overflow-hidden">

          {/* Logo */}
          <div className="relative z-10 px-5 pt-6 pb-5 border-b border-white/[0.07] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-300/15 border border-emerald-300/25
                              flex items-center justify-center shrink-0">
                <LayoutDashboard size={15} className="text-emerald-300" />
              </div>
              <div className="leading-none">
                <p className="font-syne font-bold text-sm text-[#f0f0f5]">Back Office</p>
                <p className="text-[11px] text-white/30 font-light mt-0.5">Admin Panel</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="relative z-10 flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-medium px-3 mb-2">
              Navigation
            </p>
            {filteredNavItems.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href || pathname?.startsWith(href + '/')
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm",
                    "transition-all duration-200 group",
                    isActive
                      ? "bg-emerald-300/[0.09] text-emerald-300"
                      : "text-white/40 hover:text-white/75 hover:bg-white/[0.05]"
                  )}
                >
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                                     bg-emerald-300 rounded-r-full"
                          style={{ boxShadow: '0 0 8px #6ee7b7' }} />
                  )}
                  <Icon size={15} className="shrink-0" />
                  <span className="font-medium truncate">{label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-300/60 shrink-0"
                          style={{ boxShadow: '0 0 5px #6ee7b7' }} />
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Back to app */}
          <div className="relative z-10 px-3 py-4 border-t border-white/[0.07] shrink-0">
            <Link
              href="/practice/revision"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                         text-white/35 hover:text-emerald-300 hover:bg-emerald-300/[0.06]
                         transition-all duration-200 group"
            >
              <ArrowLeft size={15} className="shrink-0
                          group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="font-medium">Back to App</span>
            </Link>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 h-screen overflow-y-auto">
          <div className="max-w-[1400px] mx-auto px-5 sm:px-8 py-8">
            {children}
          </div>
        </main>

      </div>
    </>
  )
}