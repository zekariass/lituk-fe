"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { mainNavItems } from './nav-items'
import { cn } from '@/lib/utils'
import { ThemeToggle } from './theme-toggle'
import { LanguageSwitcher } from '@/components/language-switcher'

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }

        /* Subtle noise texture overlay */
        .sidebar-texture::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
        }

        /* Radial gradient atmosphere */
        .sidebar-glow::after {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 280px;
          background: radial-gradient(ellipse 120% 200px at 50% -20px, hsl(var(--primary) / 0.07) 0%, transparent 70%);
          pointer-events: none;
          z-index: 0;
        }
      `}</style>

      <aside className={cn(
        "font-dm hidden md:flex fixed left-0 top-0 bottom-0 flex-col z-40",
        "w-[220px]",
        "bg-[var(--sidenav)] border-r border-border",
        "sidebar-texture sidebar-glow relative overflow-hidden"
      )}>

        {/* ── Logo ── */}
        <div className="relative z-10 flex items-center h-16 px-5 border-b border-border shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* Logomark */}
            <div className="relative flex items-center justify-center w-7 h-7 rounded-lg
                            bg-primary/15 border border-primary/25 shrink-0
                            group-hover:bg-primary/20 transition-colors duration-200">
              <span
                className="w-2 h-2 rounded-full bg-primary"
                style={{ boxShadow: '0 0 10px hsl(var(--primary)), 0 0 4px hsl(var(--primary))' }}
              />
            </div>

            {/* Wordmark */}
            <div className="leading-none">
              <span className="font-syne font-bold text-sm tracking-tight text-foreground">
                Habesha
              </span>
              <span className="font-syne font-bold text-sm tracking-tight text-primary">
                Drive
              </span>
            </div>
          </Link>
        </div>

        {/* ── Nav items ── */}
        <nav className="relative z-10 flex-1 flex flex-col gap-0.5 py-4 px-3 overflow-y-auto">
          {mainNavItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 w-full h-11 px-3 rounded-xl",
                  "transition-all duration-200 group",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                  isActive
                    ? "bg-primary/[0.09] text-primary"
                    : "text-foreground/35 hover:text-foreground/75 hover:bg-foreground/[0.05]"
                )}
              >
                {/* Active left bar */}
                {isActive && (
                  <motion.div
                    layoutId="sidebarNavIndicator"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5
                               bg-primary rounded-r-full"
                    style={{ boxShadow: '0 0 8px hsl(var(--primary))' }}
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <span className={cn(
                  "shrink-0 transition-transform duration-200",
                  !isActive && "group-hover:translate-x-0.5"
                )}>
                  <Icon size={17} />
                </span>

                {/* Label */}
                <span className={cn(
                  "text-sm font-medium truncate transition-colors duration-200",
                  isActive ? "text-primary" : "text-foreground/50 group-hover:text-foreground/80"
                )}>
                  {item.label}
                </span>

                {/* Active dot on the right */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0"
                        style={{ boxShadow: '0 0 5px hsl(var(--primary))' }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* ── Bottom controls ── */}
        <div className="relative z-10 flex flex-col gap-2 py-4 px-3
                        border-t border-border shrink-0">
          <LanguageSwitcher variant="dropdown" />
          <ThemeToggle />
        </div>

      </aside>
    </>
  )
}