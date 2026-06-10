"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/lib/store'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { adminTrafficSignCategoryApi } from '@/lib/api/admin-traffic-signs'
import { adminJurisdictionsApi, type Jurisdiction } from '@/lib/api/admin-jurisdictions'
import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store'
import {
  Loader2, AlertCircle, Plus, Edit, Trash2, ArrowRight,
  CheckCircle2, ShieldAlert, MapPin, Tag, TrafficCone,
} from 'lucide-react'
import Image from 'next/image'
import { CategoryModal } from './category-modal'
import { DeleteCategoryDialog } from './delete-category-dialog'
import { getAssetUrl } from '@/lib/utils/asset-url'

// ── Shared input style ────────────────────────────────────────────────────────
const inputClass = `
  text-sm text-[#f0f0f5] font-light bg-[#181920] border border-white/[0.09] rounded-xl
  px-4 py-2.5 focus:outline-none focus:border-emerald-300/40 transition-colors duration-200
  placeholder:text-white/20
`

// ── Active badge ──────────────────────────────────────────────────────────────
function ActiveBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-widest
                     uppercase px-2.5 py-1 rounded-full border
                     text-emerald-300 bg-emerald-300/10 border-emerald-300/20">
      <CheckCircle2 size={10} /> Active
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium tracking-widest
                     uppercase px-2.5 py-1 rounded-full border
                     text-white/30 bg-white/[0.04] border-white/[0.09]">
      Inactive
    </span>
  )
}

// ── Translation pill ──────────────────────────────────────────────────────────
function TranslationPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium tracking-widest
                     uppercase px-2 py-0.5 rounded-md
                     text-emerald-300/70 bg-emerald-300/[0.06] border border-emerald-300/15">
      <CheckCircle2 size={8} /> {label}
    </span>
  )
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                    shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="flex gap-4 mb-5">
        <div className="w-11 h-11 rounded-xl bg-white/[0.05] shrink-0 animate-pulse" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-white/[0.05] rounded animate-pulse w-2/3" />
          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-full" />
          <div className="h-3 bg-white/[0.03] rounded animate-pulse w-1/2" />
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <div className="h-5 w-16 bg-white/[0.05] rounded-full animate-pulse" />
        <div className="h-5 w-12 bg-white/[0.04] rounded-full animate-pulse" />
      </div>
      <div className="pt-4 border-t border-white/[0.06] flex justify-between items-center">
        <div className="h-3 w-20 bg-white/[0.05] rounded animate-pulse" />
        <div className="flex gap-1.5">
          <div className="w-8 h-8 bg-white/[0.05] rounded-lg animate-pulse" />
          <div className="w-8 h-8 bg-white/[0.05] rounded-lg animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export default function TrafficSignCategoriesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuthStore()

  const {
    categories,
    selectedJurisdictionId,
    setCategories,
    setSelectedJurisdiction,
    setCategoryModalOpen,
    setEditingCategory,
  } = useAdminTrafficSignStore()

  const {
    adminLanguages,
    fetchAdminJurisdictionLanguages,
  } = useJurisdictionLanguageStore()

  // Derive language list from adminLanguages
  const languageList = adminLanguages
    .filter(jl => jl.isActive)
    .map(jl => ({
      code: jl.language.code,
      label: jl.language.displayName || jl.language.name,
      native: jl.language.shortDisplayName || jl.language.name,
      isPrimary: jl.isPrimary,
      direction: jl.language.direction,
    }))

  const primaryCode = languageList.find(l => l.isPrimary)?.code ?? languageList[0]?.code ?? 'en'

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteCategory, setDeleteCategory] = useState<any>(null)
  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])
  const [isLoadingJurisdictions, setIsLoadingJurisdictions] = useState(false)
  const [listLang, setListLang] = useState<string>('')

  useEffect(() => {
    const fetchJurisdictions = async () => {
      setIsLoadingJurisdictions(true)
      try {
        const data = await adminJurisdictionsApi.getJurisdictions()
        setJurisdictions(data)
      } catch (err: any) {
        console.error('Failed to load jurisdictions:', err)
      } finally {
        setIsLoadingJurisdictions(false)
      }
    }
    fetchJurisdictions()
  }, [])

  useEffect(() => {
    const jurisdictionIdParam = searchParams.get('jurisdictionId')
    const storedJurisdictionId =
      typeof window !== 'undefined' ? localStorage.getItem('ts_last_jurisdiction') : null

    let jurisdictionId: number | null = null
    if (jurisdictionIdParam) jurisdictionId = Number(jurisdictionIdParam)
    else if (storedJurisdictionId) jurisdictionId = Number(storedJurisdictionId)
    else if (user?.activeJurisdictionId) jurisdictionId = user.activeJurisdictionId

    if (jurisdictionId && jurisdictionId !== selectedJurisdictionId) {
      setSelectedJurisdiction(jurisdictionId)
      if (!jurisdictionIdParam) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('jurisdictionId', String(jurisdictionId))
        router.replace(`/backoffice/traffic-signs?${params.toString()}`)
      }
    }
  }, [searchParams, user, selectedJurisdictionId, setSelectedJurisdiction, router])

  useEffect(() => {
    if (!selectedJurisdictionId) return
    const fetchCategories = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await adminTrafficSignCategoryApi.getCategories(selectedJurisdictionId)
        setCategories(data)
        if (typeof window !== 'undefined')
          localStorage.setItem('ts_last_jurisdiction', String(selectedJurisdictionId))
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Failed to load categories')
      } finally {
        setIsLoading(false)
      }
    }
    fetchCategories()
  }, [selectedJurisdictionId, setCategories])

  const handleJurisdictionChange = useCallback((id: number) => {
    setSelectedJurisdiction(id)
    if (id) void fetchAdminJurisdictionLanguages(id)
    setListLang('')
    const params = new URLSearchParams(searchParams.toString())
    params.set('jurisdictionId', String(id))
    router.push(`/backoffice/traffic-signs?${params.toString()}`)
  }, [setSelectedJurisdiction, fetchAdminJurisdictionLanguages, searchParams, router])

  const handleCreateCategory = () => { setEditingCategory(null); setCategoryModalOpen(true) }
  const handleEditCategory = (category: any) => { setEditingCategory(category); setCategoryModalOpen(true) }
  const handleViewSigns = (categoryId: number) =>
    router.push(`/backoffice/traffic-signs/categories/${categoryId}`)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    })

  const hasTranslation = (category: any, langCode: string) =>
    category.translations?.[langCode]?.name?.trim() !== ''

  // Fetch languages for the initially selected jurisdiction
  useEffect(() => {
    if (selectedJurisdictionId) {
      void fetchAdminJurisdictionLanguages(selectedJurisdictionId)
    }
  }, [selectedJurisdictionId, fetchAdminJurisdictionLanguages])

  // ── 403 ──────────────────────────────────────────────────────────────────
  if (user && user.role !== 'admin') {
    return (
      <div className="font-dm flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-[#181920] border border-white/[0.09] rounded-2xl
                        shadow-[0_24px_64px_rgba(0,0,0,0.45)] max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-400/10 border border-red-400/20
                          flex items-center justify-center mx-auto mb-5">
            <ShieldAlert size={20} className="text-red-400" />
          </div>
          <h1 className="font-syne font-bold text-xl text-red-400 mb-2">Access Restricted</h1>
          <p className="text-sm text-white/40 font-light leading-relaxed">
            You don't have permission to access this page. Contact your administrator.
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .delay-1 { animation-delay: 0.07s; }
        .delay-2 { animation-delay: 0.14s; }
        .category-card {
          transition: box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
        }
        .category-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255,255,255,0.12);
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .action-btn { transition: background 0.15s, color 0.15s, transform 0.15s; }
        .action-btn:hover { transform: scale(1.08); }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 animate-fade-up">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                            flex items-center justify-center shrink-0">
              <TrafficCone size={14} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
                Sign Categories
              </h1>
              <p className="text-xs text-white/35 font-light">
                Manage traffic sign categories and translations
              </p>
            </div>
          </div>

          <button
            onClick={handleCreateCategory}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-[#12131a] bg-emerald-300 hover:opacity-85 active:scale-95
                       transition-all duration-150 whitespace-nowrap shrink-0
                       [box-shadow:0_0_20px_rgba(110,231,183,0.2)]"
          >
            <Plus size={14} />
            New Category
          </button>
        </div>

        {/* ── Jurisdiction selector ── */}
        <div className="animate-fade-up delay-1">
          <label className="block text-[10px] uppercase tracking-widest text-white/30 font-medium mb-1.5">
            Jurisdiction
          </label>
          <div className="relative inline-flex">
            <MapPin size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <select
              value={selectedJurisdictionId || ''}
              onChange={(e) => handleJurisdictionChange(Number(e.target.value))}
              disabled={isLoadingJurisdictions}
              className={`${inputClass} pl-9 pr-10 appearance-none cursor-pointer min-w-[260px]
                          [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]
                          disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <option value="">
                {isLoadingJurisdictions ? 'Loading…' : 'Select a jurisdiction'}
              </option>
              {jurisdictions.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name} — {j.countryName}
                </option>
              ))}
            </select>
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/25 pointer-events-none"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
            </svg>
          </div>
        </div>

        {/* ── Loading skeleton grid ── */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {/* ── Error state ── */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-up
                          bg-[#181920] border border-white/[0.07] rounded-2xl
                          shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
            <div className="w-12 h-12 rounded-2xl bg-red-400/10 border border-red-400/20
                            flex items-center justify-center mb-4">
              <AlertCircle size={20} className="text-red-400" />
            </div>
            <p className="text-sm font-medium text-white/60 mb-1">Failed to load categories</p>
            <p className="text-xs text-white/30 font-light mb-6 max-w-xs text-center">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#12131a]
                         bg-emerald-300 hover:opacity-85 transition-all duration-150"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && !error && categories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-up
                          bg-[#181920] border border-white/[0.07] rounded-2xl
                          shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07]
                            flex items-center justify-center mb-4">
              <TrafficCone size={22} className="text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/40 mb-1">
              {selectedJurisdictionId ? 'No categories yet' : 'Select a jurisdiction'}
            </p>
            <p className="text-xs text-white/25 font-light mb-6 max-w-xs text-center">
              {selectedJurisdictionId
                ? 'This jurisdiction has no sign categories. Create the first one to get started.'
                : 'Choose a jurisdiction above to view and manage its sign categories.'}
            </p>
            {selectedJurisdictionId && (
              <button
                onClick={handleCreateCategory}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm
                           font-medium text-[#12131a] bg-emerald-300 hover:opacity-85
                           transition-all duration-150 [box-shadow:0_0_20px_rgba(110,231,183,0.2)]"
              >
                <Plus size={14} />
                Create First Category
              </button>
            )}
          </div>
        )}

        {/* ── Categories grid ── */}
        {!isLoading && !error && categories.length > 0 && (
          <>
            {/* Language switcher for list */}
            {languageList.length > 1 && (
              <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-up delay-1">
                <div className="flex gap-1 min-w-max bg-[#181920] border border-white/[0.08] rounded-xl p-1">
                  {languageList.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setListLang(code)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap
                        ${(listLang || primaryCode) === code
                          ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                          : 'text-white/30 hover:text-white/60'}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="flex items-center gap-3 animate-fade-up delay-1">
              <p className="text-xs text-white/30 tabular-nums">
                {categories.length} {categories.length === 1 ? 'category' : 'categories'}
              </p>
              <span className="w-px h-3 bg-white/[0.09]" />
              <p className="text-xs text-white/30 tabular-nums">
                {categories.filter((c) => c.isActive).length} active
              </p>
              <span className="w-px h-3 bg-white/[0.09]" />
              <p className="text-xs text-white/30 tabular-nums">
                {categories.reduce((acc, c) => acc + (c.signCount || 0), 0)} total signs
              </p>
            </div>

            <div key={`list-${listLang || primaryCode}`} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-up delay-2" dir={languageList.find(l => l.code === (listLang || primaryCode))?.direction || 'ltr'}>
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card bg-[#181920] border border-white/[0.07] rounded-2xl
                             overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
                >
                  {/* Active stripe */}
                  <div className={`h-px w-full ${category.isActive ? 'bg-emerald-300/40' : 'bg-white/[0.06]'}`} />

                  <div className="p-5">
                    {/* Icon + title */}
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="shrink-0">
                        {category.asset ? (
                          <div className="w-11 h-11 rounded-xl overflow-hidden ring-1 ring-white/[0.09]">
                            <Image
                              src={getAssetUrl(category.asset.url)}
                              alt={category.name}
                              width={44}
                              height={44}
                              className="object-cover w-full h-full"
                            />
                          </div>
                        ) : (
                          <div className="w-11 h-11 bg-white/[0.04] border border-white/[0.08]
                                          rounded-xl flex items-center justify-center text-xl">
                            🚦
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className={`font-syne font-bold text-base leading-tight truncate mb-1
                          ${(listLang || primaryCode) !== primaryCode && !(category.translations as Record<string, any>)?.[(listLang || primaryCode)]?.name
                            ? 'text-white/25 italic'
                            : 'text-[#f0f0f5]'}`}>
                          {(listLang || primaryCode) === primaryCode
                            ? category.name
                            : (category.translations as Record<string, any>)?.[(listLang || primaryCode)]?.name || category.name}
                        </h3>
                        <p className={`text-xs font-light leading-relaxed line-clamp-2
                          ${(listLang || primaryCode) !== primaryCode && !(category.translations as Record<string, any>)?.[(listLang || primaryCode)]?.description
                            ? 'text-white/20 italic'
                            : 'text-white/35'}`}>
                          {(listLang || primaryCode) === primaryCode
                            ? category.description
                            : (category.translations as Record<string, any>)?.[(listLang || primaryCode)]?.description || category.description}
                        </p>
                      </div>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      <ActiveBadge isActive={category.isActive} />

                      <span className="inline-flex items-center gap-1 text-[11px] font-medium
                                       tracking-widest uppercase px-2.5 py-1 rounded-full border
                                       text-white/30 bg-white/[0.03] border-white/[0.08]">
                        <Tag size={9} />
                        {category.signCount || 0}
                      </span>

                      {languageList.filter(l => l.code !== primaryCode).map(l =>
                        hasTranslation(category, l.code) && <TranslationPill key={l.code} label={l.code.toUpperCase()} />
                      )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleViewSigns(category.id)}
                        className="inline-flex items-center gap-1 text-xs font-medium
                                   text-emerald-300/70 hover:text-emerald-300 transition-colors group"
                      >
                        View Signs
                        <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </button>

                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-white/20 tabular-nums mr-1.5">
                          {formatDate(category.createdAt)}
                        </span>
                        <button
                          onClick={() => handleEditCategory(category)}
                          title="Edit"
                          className="action-btn w-8 h-8 flex items-center justify-center rounded-lg
                                     text-white/30 hover:text-white/70 hover:bg-white/[0.07]"
                        >
                          <Edit size={13} />
                        </button>
                        <button
                          onClick={() => setDeleteCategory(category)}
                          title="Delete"
                          className="action-btn w-8 h-8 flex items-center justify-center rounded-lg
                                     text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

      </div>

      {/* Modals */}
      <CategoryModal languages={languageList} primaryCode={primaryCode} />
      {deleteCategory && (
        <DeleteCategoryDialog
          category={deleteCategory}
          onClose={() => setDeleteCategory(null)}
        />
      )}
    </>
  )
}