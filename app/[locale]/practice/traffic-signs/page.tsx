"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useContentLanguageStore } from '@/lib/store'
import { useTrafficSignsStore } from '@/lib/store/traffic-signs-store'
import trafficSignsApi from '@/lib/api/traffic-signs'
import { Loader2, AlertCircle, ArrowRight, TriangleAlert, Video } from 'lucide-react'
import Image from 'next/image'
import { getAssetUrl } from '@/lib/utils/asset-url'
import { UserLanguageInfo } from '@/lib/types'

export default function TrafficSignsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
  const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore()
  const { categories, setCategories, setIsLoading, isLoading, error, setError } = useTrafficSignsStore()
  const [isMounted, setIsMounted] = useState(false)
  const [hoveredId, setHoveredId] = useState<number | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const jurisdictionId = user?.activeJurisdictionId
    if (!jurisdictionId) return

    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await trafficSignsApi.getCategories({ jurisdictionId })
        setCategories(data)
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.error?.message ||
          err?.message ||
          'Failed to load traffic sign categories'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [user?.activeJurisdictionId, setCategories, setIsLoading, setError])

  const getCategoryName = (category: any) =>
    selectedLanguage === 'en'
      ? category.name
      : category.translations?.[selectedLanguage]?.name || category.name

  const getCategoryDescription = (category: any) =>
    selectedLanguage === 'en'
      ? category.description
      : category.translations?.[selectedLanguage]?.description || category.description

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/practice/traffic-signs/categories/${categoryId}`)
  }

  if (!isMounted) return null

  return (
    <div className="px-2 py-2" dir={direction}>

      {/* Header Row */}
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight leading-none">
            Traffic Signs
          </h1>
          <p className="text-sm text-muted-foreground mt-2 hidden sm:block">
            Learn signs and their meanings for your jurisdiction
          </p>
        </div>

        {/* Language Selector */}
        {languageFlags.length > 0 && (
          <div className="sticky top-0 z-30 w-full max-w-full">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-2 py-2
                           bg-card/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur-md
                           border border-border rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
              {languageFlags.map((languageInfo: UserLanguageInfo) => {
                const isActive = selectedLanguage === languageInfo.language.code
                return (
                  <button
                    key={languageInfo.language.code}
                    type="button"
                    onClick={() => setLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')}
                    className={`shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border
                                text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer
                                ${isActive
                                  ? 'bg-emerald-300/20 border-emerald-300/40 text-emerald-300 shadow-sm'
                                  : 'bg-card border-border text-foreground/60 hover:text-foreground hover:bg-emerald-300/5 hover:border-emerald-300/30'}`}
                    aria-pressed={isActive}
                  >
                    <Image
                      src={languageInfo.language.flagUrl}
                      alt={languageInfo.language.name}
                      width={16}
                      height={11}
                      className="rounded-[2px] object-cover flex-shrink-0"
                    />
                    <span className="leading-none">{languageInfo.language.shortDisplayName}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-border mb-8" />

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-28 gap-4 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading categories…</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-destructive/10 text-destructive">
            <AlertCircle className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Couldn't load categories
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-5 py-2 text-sm font-medium bg-primary text-primary-foreground
                       rounded-full hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && categories.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-muted text-muted-foreground">
            <TriangleAlert className="h-7 w-7" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              No signs available yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Traffic signs for your jurisdiction will appear here once they're added.
            </p>
          </div>
        </div>
      )}

      {/* Categories Grid */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {categories.map((category, index) => {
            const isHovered = hoveredId === category.id
            const categoryAsset = category.asset
            
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                onMouseEnter={() => setHoveredId(category.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`
                  group relative text-left w-full rounded-2xl border p-4
                  transition-all duration-200 cursor-pointer bg-card
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 
                  ${isHovered
                    ? 'border-primary shadow-lg shadow-primary/10 -translate-y-0.5'
                    : 'border-border hover:border-primary/40'
                  }
                `}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {/* Mobile: Vertical layout | Desktop: Horizontal layout */}
                <div className="lg:flex lg:items-center lg:gap-4 space-y-4 lg:space-y-0">
                  {/* Category Asset */}
                  <div className="lg:flex-shrink-0 flex justify-center lg:justify-start">
                    {categoryAsset ? (
                      <div className="relative w-20 h-20 lg:w-16 lg:h-16 rounded-xl lg:rounded-lg overflow-hidden bg-muted">
                        {categoryAsset.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center bg-muted">
                            <Video className="h-10 w-10 lg:h-8 lg:w-8 text-muted-foreground" />
                          </div>
                        ) : (
                          <Image
                            src={getAssetUrl(categoryAsset.url)}
                            alt={categoryAsset.alt || getCategoryName(category)}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="w-20 h-20 lg:w-16 lg:h-16 rounded-xl lg:rounded-lg bg-muted flex items-center justify-center">
                        <TriangleAlert className="h-10 w-10 lg:h-8 lg:w-8 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Category Content */}
                  <div className="flex-1 min-w-0 text-center lg:text-left">
                    <h3 className={`
                      text-xl lg:text-base font-bold lg:font-semibold leading-tight lg:leading-snug transition-colors duration-150
                      ${isHovered ? 'text-primary' : 'text-foreground'}
                    `}>
                      {getCategoryName(category)}
                    </h3>
                    {category.description && (
                      <p className={`
                        text-base lg:text-sm text-muted-foreground mt-2 lg:mt-1 leading-relaxed
                        transition-colors duration-150
                        ${isHovered ? 'text-primary/80' : ''}
                      `}>
                        {getCategoryDescription(category)}
                      </p>
                    )}
                    <div className={`
                      inline-flex items-center gap-1.5 text-sm lg:text-xs font-medium mt-3 lg:mt-2
                      transition-all duration-200 justify-center lg:justify-start
                      ${isHovered ? 'text-primary translate-x-0.5' : 'text-muted-foreground'}
                    `}>
                      View All Signs
                      <ArrowRight className={`h-4 w-4 lg:h-3 lg:w-3 transition-transform duration-200 ${isHovered ? 'translate-x-0.5' : ''}`} />
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}