"use client"

import { useEffect, useState, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { adminTrafficSignCategoryApi, adminTrafficSignApi } from '@/lib/api/admin-traffic-signs'
import {
  Loader2, AlertCircle, Plus, Edit, Trash2, ArrowLeft,
  Eye, Image as ImageIcon, Video, CheckCircle2, ChevronLeft, ChevronRight,
} from 'lucide-react'
import Image from 'next/image'
import { getAssetUrl } from '@/lib/utils/asset-url'
import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store'
import { useContentLanguageStore } from '@/lib/store'
import { SignModal } from './sign-modal'
import { SignDetailModal } from './sign-detail-modal'
import { DeleteSignDialog } from './delete-sign-dialog'

// ── Skeleton row ──────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <div className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                    shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-xl bg-white/[0.05] shrink-0 animate-pulse" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3.5 bg-white/[0.05] rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/[0.04] rounded animate-pulse w-full" />
          <div className="h-3 bg-white/[0.03] rounded animate-pulse w-1/2" />
          <div className="flex gap-2 pt-2">
            <div className="h-7 w-24 bg-white/[0.05] rounded-lg animate-pulse" />
            <div className="h-7 w-16 bg-white/[0.05] rounded-lg animate-pulse" />
            <div className="h-7 w-18 bg-white/[0.05] rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CategoryDetailPage() {
  const router = useRouter()
  const params = useParams()
  const categoryId = Number(params.categoryId)

  const {
    selectedCategory,
    setSelectedCategory,
    signs,
    setSigns,
    setPagination,
    currentPage,
    totalPages,
    totalElements,
    setSelectedSign,
    setDetailOpen,
    setCreating,
    setEditing,
  } = useAdminTrafficSignStore()

  const {
    adminLanguages,
    fetchAdminJurisdictionLanguages,
  } = useJurisdictionLanguageStore()

  const { language: selectedLanguage, direction, setLanguage } = useContentLanguageStore()

  // Derive language list from adminLanguages
  const languageList = adminLanguages
    .filter(jl => jl.isActive)
    .map(jl => ({
      code: jl.language.code,
      label: jl.language.displayName || jl.language.name,
      native: jl.language.shortDisplayName || jl.language.name,
      isPrimary: jl.isPrimary,
    }))

  const primaryCode = languageList.find(l => l.isPrimary)?.code ?? languageList[0]?.code ?? 'en'

  const [isLoading, setIsLoading] = useState(false)
  const [isCategoryLoading, setIsCategoryLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteSign, setDeleteSign] = useState<any>(null)
  const [signModalOpen, setSignModalOpen] = useState(false)
  const [editingSign, setEditingSign] = useState<any>(null)
  const [listLang, setListLang] = useState<string>('')

  // Fetch category details
  useEffect(() => {
    if (!categoryId) return

    const fetchCategory = async () => {
      setIsCategoryLoading(true)
      try {
        let jurisdictionId = selectedCategory?.jurisdictionId

        if (!jurisdictionId) {
          const urlParams = new URLSearchParams(window.location.search)
          const urlJurisdictionId = urlParams.get('jurisdictionId')
          const storedJurisdictionId = localStorage.getItem('ts_last_jurisdiction')
          if (urlJurisdictionId) jurisdictionId = Number(urlJurisdictionId)
          else if (storedJurisdictionId) jurisdictionId = Number(storedJurisdictionId)
        }

        if (jurisdictionId) {
          const categories = await adminTrafficSignCategoryApi.getCategories(jurisdictionId)
          const category = categories.find((c) => c.id === categoryId)
          if (category) setSelectedCategory(category)
          else setError('Category not found')
        } else {
          setError('Jurisdiction not specified. Please select a jurisdiction from the categories page.')
        }
      } catch (err: any) {
        console.error('Failed to load category:', err)
        setError('Failed to load category details')
      } finally {
        setIsCategoryLoading(false)
      }
    }

    if (!selectedCategory || selectedCategory.id !== categoryId) fetchCategory()
    else setIsCategoryLoading(false)
  }, [categoryId, selectedCategory, setSelectedCategory])

  // Fetch languages when we know the jurisdiction
  useEffect(() => {
    if (selectedCategory?.jurisdictionId) {
      void fetchAdminJurisdictionLanguages(selectedCategory.jurisdictionId)
    }
  }, [selectedCategory?.jurisdictionId, fetchAdminJurisdictionLanguages])

  // Fetch signs
  useEffect(() => {
    if (!categoryId) return

    const fetchSigns = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await adminTrafficSignApi.getSignsByCategory(categoryId)
        setSigns(data)
        setPagination(0, 1, data.length)
      } catch (err: any) {
        setError(err?.response?.data?.error?.message || err?.message || 'Failed to load traffic signs')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSigns()
  }, [categoryId, setSigns, setPagination])

  const handleCreateSign = () => { setEditingSign(null); setCreating(true); setSignModalOpen(true) }
  const handleEditSign = (sign: any) => { setEditingSign(sign); setEditing(true); setSignModalOpen(true) }
  const handleViewDetails = (sign: any) => { setSelectedSign(sign); setDetailOpen(true) }
  const handleDeleteClick = (sign: any) => setDeleteSign(sign)
  const handlePageChange = (newPage: number) => setPagination(newPage, totalPages, totalElements)

  // ── Category loading ──────────────────────────────────────────────────────
  if (isCategoryLoading) {
    return (
      <div className="font-dm flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-emerald-300/50" />
      </div>
    )
  }

  // ── Fatal error (no category) ─────────────────────────────────────────────
  if (!selectedCategory && error) {
    return (
      <div className="font-dm flex items-center justify-center min-h-[60vh]">
        <div className="text-center p-10 bg-[#181920] border border-white/[0.09] rounded-2xl
                        shadow-[0_24px_64px_rgba(0,0,0,0.45)] max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-red-400/10 border border-red-400/20
                          flex items-center justify-center mx-auto mb-5">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <h2 className="font-syne font-bold text-lg text-red-400 mb-2">Failed to load category</h2>
          <p className="text-sm text-white/40 font-light leading-relaxed mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#12131a]
                       bg-emerald-300 hover:opacity-85 transition-all duration-150"
          >
            Back to Categories
          </button>
        </div>
      </div>
    )
  }

  if (!selectedCategory) {
    return (
      <div className="font-dm flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-emerald-300/50" />
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
        .sign-row { transition: border-color 0.2s ease, background 0.2s ease; }
        .sign-row:hover { border-color: rgba(255,255,255,0.12); background: rgba(255,255,255,0.025); }
        .action-btn { transition: background 0.15s, color 0.15s, transform 0.15s; }
        .action-btn:hover { transform: scale(1.05); }
        
        /* RTL support */
        .rtl {
          direction: rtl;
        }
        .rtl .flex {
          flex-direction: row-reverse;
        }
        .rtl .text-left {
          text-align: right;
        }
        .rtl .text-right {
          text-align: left;
        }
        .rtl .ml-auto {
          margin-left: 0;
          margin-right: auto;
        }
        .rtl .mr-auto {
          margin-right: 0;
          margin-left: auto;
        }
        .rtl .gap-4 {
          gap: 1rem;
        }
        .rtl .gap-1\\.5 {
          gap: 0.375rem;
        }
        .rtl .justify-end {
          justify-content: flex-start;
        }
        .rtl .justify-start {
          justify-content: flex-end;
        }
        .rtl .items-start {
          align-items: flex-end;
        }
        .rtl .items-end {
          align-items: flex-start;
        }
        .rtl .rounded-l-xl {
          border-radius: 0 0.75rem 0.75rem 0;
        }
        .rtl .rounded-r-xl {
          border-radius: 0.75rem 0 0 0.75rem;
        }
        .rtl .chevron-left {
          transform: rotate(180deg);
        }
        .rtl .chevron-right {
          transform: rotate(180deg);
        }
        
        /* Prose styles for rich text content */
        .prose {
          color: inherit;
          max-width: none;
        }
        .prose p {
          margin: 0;
          color: inherit;
        }
        .prose-invert {
          color: inherit;
        }
        .prose-invert p {
          color: inherit;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>

      <div className={`font-dm text-[#f0f0f5] space-y-6 ${direction === 'rtl' ? 'rtl' : ''}`} dir={direction}>

        {/* ── Back link ── */}
        <button
          onClick={() => router.back()}
          className="animate-fade-up inline-flex items-center gap-1.5 text-xs text-white/35
                     hover:text-white/70 transition-colors font-medium uppercase tracking-widest group"
        >
          <ChevronLeft size={13} className={`transition-transform group-hover:-translate-x-0.5 ${direction === 'rtl' ? 'rotate-180' : ''}`} />
          Categories
        </button>

        {/* ── Header card ── */}
        <div className="animate-fade-up delay-1 bg-[#181920] border border-white/[0.07] rounded-2xl
                        overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
          {/* Active stripe */}
          <div className={`h-px w-full ${selectedCategory.isActive ? 'bg-emerald-300/40' : 'bg-white/[0.06]'}`} />

          <div className="p-6 flex items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              {/* Category icon */}
              {selectedCategory.asset ? (
                <div className="w-14 h-14 rounded-xl overflow-hidden ring-1 ring-white/[0.09] shrink-0">
                  <Image
                    src={getAssetUrl(selectedCategory.asset.url)}
                    alt={selectedCategory.name}
                    width={56}
                    height={56}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-14 h-14 bg-white/[0.04] border border-white/[0.08] rounded-xl
                                flex items-center justify-center text-2xl shrink-0">
                  🚦
                </div>
              )}

              <div>
                <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight text-[#f0f0f5] mb-1">
                  {selectedCategory.name}
                </h1>
                <p className="text-sm text-white/40 font-light leading-relaxed mb-3 max-w-xl">
                  {selectedCategory.description}
                </p>

                {/* Meta pills */}
                <div className="flex items-center flex-wrap gap-2">
                  {selectedCategory.isActive ? (
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
                  )}
                  <span className="text-[10px] uppercase tracking-widest text-white/25 tabular-nums">
                    {totalElements} {totalElements === 1 ? 'sign' : 'signs'}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCreateSign}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 active:scale-95
                         transition-all duration-150 whitespace-nowrap shrink-0
                         [box-shadow:0_0_20px_rgba(110,231,183,0.2)]"
            >
              <Plus size={14} />
              New Sign
            </button>
          </div>
        </div>

        {/* ── Inline error banner ── */}
        {error && (
          <div className="animate-fade-up flex items-center gap-3 px-4 py-3 rounded-xl
                          bg-red-400/[0.07] border border-red-400/20">
            <AlertCircle size={14} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400/90 font-light">{error}</p>
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {isLoading && (
          <div className="space-y-3 animate-fade-up">
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && signs && signs.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center py-24 animate-fade-up
                          bg-[#181920] border border-white/[0.07] rounded-2xl
                          shadow-[0_4px_24px_rgba(0,0,0,0.25)]">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.07]
                            flex items-center justify-center mb-4">
              <ImageIcon size={22} className="text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/40 mb-1">No traffic signs yet</p>
            <p className="text-xs text-white/25 font-light mb-6 max-w-xs text-center">
              Create the first traffic sign for this category to get started.
            </p>
            <button
              onClick={handleCreateSign}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-150
                         [box-shadow:0_0_20px_rgba(110,231,183,0.2)]"
            >
              <Plus size={14} />
              Create Sign
            </button>
          </div>
        )}

        {/* ── Signs list ── */}
        {!isLoading && signs && signs.length > 0 && (
          <>
            {/* Language switcher for list */}
            {languageList.length > 1 && (
              <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-up delay-1">
                <div className="flex gap-1 min-w-max bg-[#181920] border border-white/[0.08] rounded-xl p-1">
                  {languageList.map(({ code, label }) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => {
                        setListLang(code)
                        // Set language direction for RTL support
                        const lang = adminLanguages.find(jl => jl.language.code === code)
                        if (lang) {
                          setLanguage(code, lang.language.direction as "ltr" | "rtl")
                        }
                      }}
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
                {signs.length} {signs.length === 1 ? 'sign' : 'signs'}
              </p>
              <span className="w-px h-3 bg-white/[0.09]" />
              <p className="text-xs text-white/30 tabular-nums">
                {signs.filter((s: any) => s.isActive).length} active
              </p>
            </div>

            <div className="space-y-3 animate-fade-up delay-2">
              {signs.map((sign: any) => (
                <div
                  key={sign.id}
                  className="sign-row bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                             shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
                >
                  <div className="flex items-start gap-4">

                    {/* Sign image */}
                    <div className="shrink-0">
                      {sign.signAsset ? (
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden
                                        ring-1 ring-white/[0.09] bg-white/[0.03]">
                          <Image
                            src={getAssetUrl(sign.signAsset.url)}
                            alt="Traffic sign"
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                          {sign.signAsset.type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center
                                            bg-black/40">
                              <Video size={18} className="text-white" />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-xl bg-white/[0.04] border border-white/[0.08]
                                        flex items-center justify-center">
                          <ImageIcon size={20} className="text-white/20" />
                        </div>
                      )}
                    </div>

                    {/* Sign info */}
                    <div className="flex-1 min-w-0">
                      <div 
                        className={`text-sm font-light leading-relaxed mb-2 line-clamp-2 prose prose-invert prose-p:text-sm prose-p:font-light prose-p:leading-relaxed
                          ${(listLang || primaryCode) !== primaryCode && !(sign.translations as Record<string, any>)?.[(listLang || primaryCode)]?.description
                            ? 'text-white/25 italic'
                            : 'text-white/80'}`}
                        dangerouslySetInnerHTML={{
                          __html: (listLang || primaryCode) === primaryCode
                            ? sign.description || ''
                            : (sign.translations as Record<string, any>)?.[(listLang || primaryCode)]?.description || sign.description || ''
                        }}
                      />

                      {/* Meta */}
                      <div className="flex items-center flex-wrap gap-2 mb-3">
                        {sign.isActive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium
                                           tracking-widest uppercase px-2 py-0.5 rounded-full border
                                           text-emerald-300 bg-emerald-300/10 border-emerald-300/20">
                            <CheckCircle2 size={8} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium
                                           tracking-widest uppercase px-2 py-0.5 rounded-full border
                                           text-white/30 bg-white/[0.04] border-white/[0.09]">
                            Inactive
                          </span>
                        )}

                        <span className="text-[10px] uppercase tracking-widest text-white/25 tabular-nums">
                          1 main
                          {sign.additionalAssets?.length > 0 && ` · ${sign.additionalAssets.length} additional`}
                          {sign.realLifeAssets?.length > 0 && ` · ${sign.realLifeAssets.length} real-life`}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleViewDetails(sign)}
                          className="action-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                     text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.08]
                                     hover:text-white/80 hover:bg-white/[0.08]"
                        >
                          <Eye size={12} /> View Details
                        </button>
                        <button
                          onClick={() => handleEditSign(sign)}
                          className="action-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                     text-xs font-medium text-white/50 bg-white/[0.04] border border-white/[0.08]
                                     hover:text-white/80 hover:bg-white/[0.08]"
                        >
                          <Edit size={12} /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(sign)}
                          className="action-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                     text-xs font-medium text-red-400/60 bg-red-400/[0.06] border border-red-400/15
                                     hover:text-red-400 hover:bg-red-400/[0.10]"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between animate-fade-up">
                <p className="text-xs text-white/30 tabular-nums">
                  Page {currentPage + 1} of {totalPages}
                </p>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className="w-9 h-9 flex items-center justify-center rounded-xl
                               text-white/40 border border-white/[0.07]
                               hover:text-white/70 hover:border-white/15
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    <ChevronLeft size={14} className={direction === 'rtl' ? 'rotate-180' : ''} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => handlePageChange(i)}
                      className={`w-9 h-9 rounded-xl text-sm tabular-nums font-medium
                                   transition-all duration-200
                                   ${currentPage === i
                                     ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_12px_rgba(110,231,183,0.25)]'
                                     : 'text-white/35 border border-white/[0.07] hover:text-white/70 hover:border-white/15'}`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages - 1}
                    className="w-9 h-9 flex items-center justify-center rounded-xl
                               text-white/40 border border-white/[0.07]
                               hover:text-white/70 hover:border-white/15
                               disabled:opacity-30 disabled:cursor-not-allowed
                               transition-all duration-200"
                  >
                    <ChevronRight size={14} className={direction === 'rtl' ? 'rotate-180' : ''} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Modals ── */}
      {signModalOpen && (
        <SignModal
          isOpen={signModalOpen}
          onClose={() => {
            setSignModalOpen(false)
            setEditingSign(null)
            setCreating(false)
            setEditing(false)
          }}
          categoryId={categoryId}
          editingSign={editingSign}
          languages={languageList}
          primaryCode={primaryCode}
        />
      )}

      <SignDetailModal languages={languageList} primaryCode={primaryCode} />

      {deleteSign && (
        <DeleteSignDialog
          sign={deleteSign}
          onClose={() => setDeleteSign(null)}
        />
      )}
    </>
  )
}