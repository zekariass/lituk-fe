"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useTranslations } from 'next-intl'
import { BookOpen, ChevronRight, ClipboardList, Flag, OctagonAlert, Loader2 } from 'lucide-react'
import { usePwaInstall } from '@/lib/hooks/use-pwa-install'
import { useTelegramMiniApp } from '@/lib/utils/telegram-detect'
import Image from 'next/image'
import api from '@/lib/api/client'
import { LicenceCategory } from '@/lib/types'

export default function RevisionStartPage() {
  const t = useTranslations('dashboardShell')
  const tp = useTranslations('practicePage')
  const tPwa = useTranslations('pwa')
  const { isMobile: isMobilePwa, isStandalone, canInstallNative, promptInstall } = usePwaInstall()
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
  const router = useRouter()
  const { isAuthenticated, selectedLicenceCategoryId, setSelectedLicenceCategoryId, user } = useAuthStore()
  const [licenceCategories, setLicenceCategories] = useState<LicenceCategory[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const jurisdictionId = user?.activeJurisdictionId
    if (!isAuthenticated || !jurisdictionId) {
      setLicenceCategories([])
      setIsLoadingCategories(false)
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
        }
      } catch {
        if (isMounted) { setLicenceCategories([]) }
      } finally {
        if (isMounted) setIsLoadingCategories(false)
      }
    }
    fetchCategories()
    return () => { isMounted = false }
  }, [isAuthenticated, user?.activeJurisdictionId])

  if (!isAuthenticated) return null

  const revisionHref = selectedLicenceCategoryId
    ? `/practice/revision?licenceCategoryId=${String(selectedLicenceCategoryId)}`
    : '/practice/revision'

  const practiceCards = [
    {
      href: revisionHref,
      icon: BookOpen,
      label: t('revision'),
      description: tp('revisionDescription'),
      color: 'emerald',
    },
    {
      href: '/practice/mock-test',
      icon: ClipboardList,
      label: t('mockTest'),
      description: tp('mockTestDescription'),
      color: 'blue',
    },
    // {
    //   href: '/practice/traffic-signs',
    //   icon: OctagonAlert,
    //   label: tp('trafficSignsLabel'),
    //   description: tp('trafficSignsDescription'),
    //   color: 'red',
    // },
    {
      href: '/practice/flags',
      icon: Flag,
      label: t('flags'),
      description: tp('flagsDescription'),
      color: 'amber',
    },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
      `}</style>

      <div className="font-dm text-foreground space-y-8 animate-fade-up">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            {!isStandalone && (
              <button
                onClick={handleInstall}
                className="inline-flex items-center justify-center gap-2
                           text-white border border-green-600/30 px-5 py-2.5
                           rounded-lg text-[13px] bg-green-700
                           hover:bg-green-800 transition-colors cursor-pointer"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                {t('installAndroidPwa')}
              </button>
            )}
            <a
              href="https://apps.apple.com/gb/app/habesha-drive/id6770119178"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2
                         text-white border border-sky-400/30 px-5 py-2.5
                         rounded-lg text-[13px] bg-sky-500
                         hover:bg-sky-600 transition-colors cursor-pointer"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 shrink-0">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              {t('downloadIosApp')}
            </a>
          </div>
          <h1 className="font-syne font-bold text-3xl sm:text-4xl tracking-tight">
            {tp('title')}
          </h1>
          <p className="text-sm sm:text-base text-foreground/50 font-light">
            {tp('subtitle')}
          </p>
        </div>

        {/* Licence Categories Grid */}
        {isLoadingCategories ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : licenceCategories.length > 0 ? (
          <div className="space-y-3">
            <h2 className="font-syne font-semibold text-lg text-foreground/80">
              {tp('licenceCategories')}
            </h2>
            <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
              {licenceCategories.map((category) => {
                const isSelected = selectedLicenceCategoryId === category.id
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => {
                      setSelectedLicenceCategoryId(category.id)
                      // router.push(`/practice/revision?licenceCategoryId=${category.id}`)
                      router.push(`/practice`)
                    }}
                    className={`group relative flex flex-col items-center p-2 rounded-xl border
                                transition-all duration-200
                                ${isSelected
                                  ? 'bg-emerald-300/20 border-emerald-300/40 shadow-sm'
                                  : 'bg-card border-border hover:border-emerald-300/30 hover:bg-card/80'}`}
                  >
                    {/* Icon Container - Full Width */}
                    <div className={`w-full rounded-lg flex items-center justify-center overflow-hidden mb-1.5
                                    ${isSelected ? 'bg-emerald-300/30' : 'bg-primary/10 group-hover:bg-emerald-300/15'}
                                    transition-colors duration-200`}>
                      {category.localIconUrl ? (
                        <Image
                          src={category.localIconUrl}
                          alt={category.name}
                          width={80}
                          height={50}
                          className="object-contain w-full"
                        />
                      ) : (
                        <div className="w-full aspect-square flex items-center justify-center">
                          <span className={`text-2xl font-bold ${isSelected ? 'text-emerald-300' : 'text-primary/70'}`}>
                            {category.code || category.name.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Category Name */}
                    <h3 className={`font-semibold text-xs text-center leading-tight w-full px-1
                                    ${isSelected ? 'text-primary' : 'text-foreground group-hover:text-emerald-500'}
                                    transition-colors duration-200`}>
                      {category.name}
                    </h3>
                  </button>
                )
              })}
            </div>
          </div>
        ) : null}

        {/* Practice Cards Grid */}
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {practiceCards.map((card, idx) => {
            const Icon = card.icon
            const colorClasses = ({
              emerald: {
                bg: 'bg-emerald-500/10 group-hover:bg-emerald-500/20',
                icon: 'text-emerald-500',
              },
              blue: {
                bg: 'bg-blue-500/10 group-hover:bg-blue-500/20',
                icon: 'text-blue-500',
              },
              amber: {
                bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
                icon: 'text-amber-500',
              },
              red: {
                bg: 'bg-red-500/10 group-hover:bg-red-500/20',
                icon: 'text-red-500',
              },
            } as const)[card.color as 'emerald' | 'blue' | 'amber' | 'red']

            return (
              <Link
                key={card.href}
                href={card.href}
                className="group relative block no-underline
                          bg-blue-600/[0.1] border border-border rounded-2xl p-6
                          hover:border-primary/40 hover:bg-blue-600/[0.05]
                          shadow-[0_2px_16px_rgba(0,0,0,0.08)]
                          hover:shadow-[0_4px_24px_rgba(0,0,0,0.12)]
                          transition-all duration-200"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Icon and Title Row */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                                  ${colorClasses.bg} transition-colors duration-200`}>
                    <Icon size={24} className={colorClasses.icon} />
                  </div>
                  <h3 className="font-syne font-bold text-lg
                                text-foreground group-hover:text-primary
                                transition-colors duration-200">
                    {card.label}
                  </h3>
                </div>

                {/* Description */}
                <p className="text-sm font-medium text-foreground/50 leading-relaxed mb-4">
                  {card.description}
                </p>

                {/* Arrow */}
                <div className="flex items-center gap-2 text-xs font-semibold text-primary/60
                                group-hover:text-primary group-hover:gap-3
                                transition-all duration-200">
                  <span>{tp('getStarted')}</span>
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )
          })}
        </div>
        <div className="bg-amber-500/10 border border-border/50 rounded-xl p-4 text-center">
          <p className="text-xl font-medium text-foreground/60 mb-4">{tp('dvsaQuestionBankAck')}</p>
          <p className="text-sm font-medium text-foreground/60">{tp('dvsaQuestionBank')}</p>
        </div>
      </div>
    </>
  )
}