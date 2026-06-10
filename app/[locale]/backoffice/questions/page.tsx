// "use client"

// import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import api from '@/lib/api/client'
// import { useAuthStore } from '@/lib/store'
// import { useAdminStore } from '@/lib/store/admin-store'
// import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store'
// import type {
//   AdminQuestion, QuestionOption, QuestionTip, QuestionExplanation, QuestionAsset,
//   CreateQuestionRequest, UpdateQuestionRequest, AddExplanationRequest,
//   UpdateExplanationRequest, AddTipRequest, UpdateTipRequest, UpdateOptionRequest,
//   AdminCategory, PaginatedResponse,
// } from '@/lib/types/admin'
// import type { ApiResponse } from '@/lib/types'
// import {
//   AlertCircle, Check, CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
//   Edit, Film, FileText, FileUp, Globe2, GripVertical, Hash, ImageIcon, Info,
//   Loader2, Plus, Search, Sparkles, Trash2, Upload, XCircle, SlidersHorizontal,
//   BookOpen, Lightbulb, MessageSquare,
// } from 'lucide-react'
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
// import { OptionEditorDialog } from './option-editor-dialog'
// import { TipEditorDialog } from './tip-editor-dialog'
// import { ExplanationEditorDialog } from './explanation-editor-dialog'
// import { getAssetUrl, isImageAsset, isVideoAsset } from '@/lib/utils/asset-url'

// // ── Types ─────────────────────────────────────────────────────────────────────
// type AssetType  = 'image' | 'video' | 'document' | 'diagram' | 'illustration' | 'question_image'

// interface OptionFormState {
//   id?: number; text: string; isCorrect: boolean; position: number
//   translations: Record<string, string>; assetFile?: File | null
// }

// interface AssetDraft { file: File; type: AssetType; alt: string; caption: string }

// interface QuestionFormState {
//   jurisdictionId: number; categoryId?: number; question: string
//   translations: Record<string, string>; active: boolean; assets: AssetDraft[]; variantId?: number | null
// }

// // ── Helpers ───────────────────────────────────────────────────────────────────
// function moveItem<T>(items: T[], from: number, to: number): T[] {
//   if (to < 0 || to >= items.length || from === to) return items
//   const clone = [...items]; const [moved] = clone.splice(from, 1); clone.splice(to, 0, moved); return clone
// }

// function LocalAssetPreview({ file }: { file: File }) {
//   const url = useMemo(() => URL.createObjectURL(file), [file])
//   useEffect(() => () => URL.revokeObjectURL(url), [url])
//   if (file.type.startsWith('image/')) return <img src={url} alt={file.name} className="h-20 w-full rounded-lg object-cover" />
//   if (file.type.startsWith('video/')) return <video controls className="h-20 w-full rounded-lg object-cover"><source src={url} type={file.type} /></video>
//   return (
//     <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
//       {file.type.includes('pdf') || file.type.includes('document')
//         ? <FileText size={20} className="text-white/30" />
//         : <Film       size={20} className="text-white/30" />}
//     </div>
//   )
// }

// const emptyLocaleText = (): Record<string, string> => ({})
// const createBlankOption = (pos: number): OptionFormState => ({ text: '', isCorrect: false, position: pos, translations: emptyLocaleText(), assetFile: null })
// const createInitialForm = (): QuestionFormState => ({ jurisdictionId: 0, categoryId: undefined, question: '', translations: emptyLocaleText(), active: true, assets: [], variantId: null })

// function mapQuestionToForm(q: AdminQuestion): QuestionFormState {
//   const translations: Record<string, string> = {}
//   if (q.translations) {
//     for (const [code, fields] of Object.entries(q.translations)) {
//       translations[code] = (fields as any)?.question ?? ''
//     }
//   }
//   return { jurisdictionId: q.jurisdictionId, categoryId: q.categoryId, question: q.question, translations, active: q.active, assets: [], variantId: q.variantId ?? null }
// }

// function buildQuestionTranslations(input: Record<string, string>, primaryCode: string) {
//   const result: Record<string, { question: string }> = {}
//   for (const [code, value] of Object.entries(input)) {
//     if (code === primaryCode || value.trim()) result[code] = { question: value }
//   }
//   return result
// }
// function buildOptionTranslations(input: Record<string, string>, primaryCode: string) {
//   const result: Record<string, { text: string }> = {}
//   for (const [code, value] of Object.entries(input)) {
//     if (code === primaryCode || value.trim()) result[code] = { text: value }
//   }
//   return result
// }
// function buildTipTranslations(input: Record<string, string>, primaryCode: string) {
//   const t: Record<string, { tip: string }> = {}
//   for (const [code, value] of Object.entries(input)) {
//     if (code !== primaryCode && value.trim()) t[code] = { tip: value }
//   }
//   return Object.keys(t).length > 0 ? t : undefined
// }
// function buildExplanationTranslations(input: Record<string, string>, primaryCode: string) {
//   const result: Record<string, { text: string }> = {}
//   for (const [code, value] of Object.entries(input)) {
//     if (code === primaryCode || value.trim()) result[code] = { text: value }
//   }
//   return result
// }
// function validateFiles(files: File[]): string | null {
//   const allowed = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','video/mp4','video/webm','video/ogg','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
//   for (const f of files) {
//     if (!allowed.includes(f.type)) return `Unsupported file type: ${f.name}`
//     if (f.size > 50 * 1024 * 1024) return `File too large (max 10MB): ${f.name}`
//   }
//   return null
// }
// function getErrorMessage(err: unknown, fallback: string): string {
//   const r = (err as { response?: { data?: { message?: unknown } } }).response
//   if (typeof r?.data?.message === 'string' && r.data.message.trim()) return r.data.message
//   return fallback
// }

// // ── Shared UI atoms ───────────────────────────────────────────────────────────
// const selectClass = `
//   w-full h-10 px-3 rounded-xl text-sm text-[#f0f0f5] font-light
//   bg-white/[0.04] border border-white/[0.09]
//   focus:outline-none focus:border-emerald-300/40
//   transition-colors duration-200
//   [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]
// `
// const inputClass = `
//   w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
//   bg-white/[0.04] border border-white/[0.09]
//   focus:outline-none focus:border-emerald-300/40
//   transition-colors duration-200 placeholder:text-white/20
// `
// const textareaClass = `
//   w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
//   bg-white/[0.04] border border-white/[0.09]
//   focus:outline-none focus:border-emerald-300/40
//   transition-colors duration-200 resize-none
// `

// function SectionBlock({ title, icon: Icon, children, action }: {
//   title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
// }) {
//   return (
//     <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
//       <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
//         <div className="flex items-center gap-2">
//           {Icon && <Icon size={13} className="text-white/30" />}
//           <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{title}</h4>
//         </div>
//         {action}
//       </div>
//       <div className="px-5 py-4">{children}</div>
//     </div>
//   )
// }

// function LocaleToggle({ active, onChange, languages }: { active: string; onChange: (c: string) => void; languages: { code: string; label: string; direction?: string }[] }) {
//   return (
//     <div className="flex items-center gap-0.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl flex-wrap">
//       {languages.map(({ code, label }) => (
//         <button key={code} type="button" onClick={() => onChange(code)}
//           className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
//             ${active === code
//               ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
//               : 'text-white/35 hover:text-white/70'}`}>
//           {label}
//         </button>
//       ))}
//     </div>
//   )
// }

// function ActionBtn({ onClick, title, variant = 'ghost', children }: {
//   onClick: () => void; title?: string; variant?: 'ghost' | 'danger' | 'outline'; children: React.ReactNode
// }) {
//   const cls = {
//     ghost:   'text-white/30 hover:text-white/70 hover:bg-white/[0.07]',
//     danger:  'text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]',
//     outline: 'text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20',
//   }[variant]
//   return (
//     <button type="button" onClick={onClick} title={title}
//       className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${cls}`}>
//       {children}
//     </button>
//   )
// }

// // ── Main page ─────────────────────────────────────────────────────────────────
// export default function QuestionsPage() {
//   const {
//     questions, licenceCategories, jurisdictions, categories, isLoading, error, clearError,
//     fetchQuestions, searchQuestionsByText, fetchQuestion, fetchCategories, fetchJurisdictions, fetchLicenceCategories,
//     createQuestion, updateQuestion, deleteQuestion, uploadQuestionAssets, deleteQuestionAsset,
//     addOption, updateOption, deleteOption, uploadOptionImage, deleteOptionImage,
//     createExplanation, fetchExplanationByQuestion, updateExplanation, deleteExplanation,
//     uploadExplanationAssets, deleteExplanationAsset, addTip, updateTip, deleteTip, fetchTipsByQuestion,
//     uploadTipAssets, deleteTipAsset,
//   } = useAdminStore()

//   const { user } = useAuthStore()
//   const isAdmin = user?.role === 'admin'

//   const {
//     adminLanguages,
//     fetchAdminJurisdictionLanguages,
//   } = useJurisdictionLanguageStore()

//   // Derive language list from adminLanguages
//   const languageList = adminLanguages
//     .filter(jl => jl.isActive)
//     .map(jl => ({
//       code: jl.language.code,
//       label: jl.language.displayName || jl.language.name,
//       isPrimary: jl.isPrimary,
//       direction: jl.language.direction,
//     }))

//   const primaryCode = languageList.find(l => l.isPrimary)?.code ?? languageList[0]?.code ?? 'en'

//   // ── Search state ──────────────────────────────────────────────────────────
//   const [searchById,               setSearchById]               = useState('')
//   const [searchByText,             setSearchByText]             = useState('')
//   const [search,                   setSearch]                   = useState('')

//   // ── Filter state ────────────────────────────────────────────────────────────
//   const [filterCategoryId,         setFilterCategoryId]         = useState<number | ''>('')
//   const [filterJurisdictionId,     setFilterJurisdictionId]     = useState<number | ''>('')
//   const [filterLicenceCategoryId,  setFilterLicenceCategoryId]  = useState<number | ''>('')
//   const [filterActive,             setFilterActive]             = useState<boolean | ''>('')
//   const [currentPage,              setCurrentPage]              = useState(0)
//   const [listLang,                 setListLang]                 = useState<string>('')
//   const pageSize = 10

//   // ── Form state ──────────────────────────────────────────────────────────────
//   const [questionForm,    setQuestionForm]    = useState<QuestionFormState>(createInitialForm())
//   const [questionLocale,  setQuestionLocale]  = useState<string>('')
//   const [formMode,        setFormMode]        = useState<'create' | 'edit'>('create')
//   const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null)
//   const [formOpen,        setFormOpen]        = useState(false)
//   const [variantSearchTerm,    setVariantSearchTerm]    = useState('')
//   const [variantSearchResults, setVariantSearchResults] = useState<AdminQuestion[]>([])
//   const [variantPreview,       setVariantPreview]       = useState<AdminQuestion | null>(null)
//   const [variantLookupError,   setVariantLookupError]   = useState<string | null>(null)
//   const [variantLookupLoading, setVariantLookupLoading] = useState(false)

//   // ── Details state ───────────────────────────────────────────────────────────
//   const [detailsOpen,          setDetailsOpen]          = useState(false)
//   const [detailsLang,          setDetailsLang]          = useState<string>('')
//   const [selectedQuestion,     setSelectedQuestion]     = useState<AdminQuestion | null>(null)
//   const [currentExplanation,   setCurrentExplanation]   = useState<QuestionExplanation | null>(null)
//   const [explanationLocale,    setExplanationLocale]    = useState<string>('')
//   const [tipLocale,            setTipLocale]            = useState<string>('')
//   const [newOptionDraft,       setNewOptionDraft]       = useState<OptionFormState>(createBlankOption(1))
//   const [explanationDraft,     setExplanationDraft]     = useState<Record<string, string>>(emptyLocaleText())
//   const [tipDraft,             setTipDraft]             = useState<Record<string, string>>(emptyLocaleText())
//   const [explanationAssetDrafts, setExplanationAssetDrafts] = useState<AssetDraft[]>([])
//   const [tipFormAssets,        setTipFormAssets]        = useState<AssetDraft[]>([])
//   const [tipExistingAssets,    setTipExistingAssets]    = useState<QuestionAsset[]>([])

//   // ── Option editor ───────────────────────────────────────────────────────────
//   const [optionEditorOpen,  setOptionEditorOpen]  = useState(false)
//   const [optionEditorMode,  setOptionEditorMode]  = useState<'create' | 'edit'>('create')
//   const [editingOption,     setEditingOption]     = useState<QuestionOption | null>(null)
//   const [optionFormData,    setOptionFormData]    = useState<OptionFormState>(createBlankOption(1))
//   const [optionLocale,      setOptionLocale]      = useState<string>('')

//   // ── Tip editor ──────────────────────────────────────────────────────────────
//   const [tipEditorOpen,      setTipEditorOpen]      = useState(false)
//   const [tipEditorMode,      setTipEditorMode]      = useState<'create' | 'edit'>('create')
//   const [editingTip,         setEditingTip]         = useState<QuestionTip | null>(null)
//   const [tipFormData,        setTipFormData]        = useState<Record<string, string>>(emptyLocaleText())
//   const [tipDisplayOrder,     setTipDisplayOrder]     = useState<number>(0)

//   // ── Explanation editor ──────────────────────────────────────────────────────
//   const [explanationEditorOpen,   setExplanationEditorOpen]   = useState(false)
//   const [explanationFormData,     setExplanationFormData]     = useState<Record<string, string>>(emptyLocaleText())
//   const [explanationFormAssets,   setExplanationFormAssets]   = useState<AssetDraft[]>([])

//   // ── Delete dialog ───────────────────────────────────────────────────────────
//   const [deleteOpen,        setDeleteOpen]        = useState(false)
//   const [questionToDelete,  setQuestionToDelete]  = useState<AdminQuestion | null>(null)

//   // ── Misc ────────────────────────────────────────────────────────────────────
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
//   const [draggingQuestionAssetIndex,    setDraggingQuestionAssetIndex]    = useState<number | null>(null)
//   const [draggingExplanationAssetIndex, setDraggingExplanationAssetIndex] = useState<number | null>(null)
//   const [formCategories,                setFormCategories]                = useState<AdminCategory[]>([])

//   const questionPrimaryRef = useRef<HTMLTextAreaElement | null>(null)
//   const detailsPrimaryRef  = useRef<HTMLTextAreaElement | null>(null)
//   const deleteButtonRef    = useRef<HTMLButtonElement | null>(null)

//   // ── Data loading ────────────────────────────────────────────────────────────
//   function buildFilterParams(page: number): Record<string, string | number | boolean> {
//     const params: Record<string, string | number | boolean> = { page, size: pageSize }
//     if (filterCategoryId !== '')        params.categoryId        = filterCategoryId
//     if (filterJurisdictionId !== '')    params.jurisdictionId    = filterJurisdictionId
//     if (filterLicenceCategoryId !== '') params.licenceCategoryId = filterLicenceCategoryId
//     if (filterActive !== '')            params.active            = filterActive
//     return params
//   }

//   async function loadQuestions() {
//     await fetchQuestions(buildFilterParams(currentPage))
//   }

//   const handleFetchQuestions = async () => {
//     setCurrentPage(0)
//     await fetchQuestions(buildFilterParams(0))
//   }

//   const handleSearchById = async () => {
//     const id = Number(searchById.trim())
//     if (!id || isNaN(id)) { setFeedback({ type: 'error', message: 'Please enter a valid question ID.' }); return }
//     try {
//       const q = await fetchQuestion(id)
//       await openDetailsDialog(q)
//     } catch { setFeedback({ type: 'error', message: `Question with ID ${id} not found.` }) }
//   }

//   const handleSearchByText = async () => {
//     const text = searchByText.trim()
//     if (text.length < 2) { setFeedback({ type: 'error', message: 'Please enter at least 2 characters to search.' }); return }
//     setCurrentPage(0)
//     try {
//       await searchQuestionsByText(text, { page: 0, size: pageSize })
//     } catch { /* error is set by the store */ }
//   }

//   const resetVariantState = () => {
//     setVariantPreview(null)
//     setVariantSearchResults([])
//     setVariantSearchTerm('')
//     setVariantLookupError(null)
//     setVariantLookupLoading(false)
//   }

//   const loadVariantPreview = async (id?: number | null, currentQuestionId?: number) => {
//     if (id === undefined || id === null) { resetVariantState(); return }
//     if (Number.isNaN(id) || id <= 0) { setVariantLookupError('Original question ID must be a positive number.'); setVariantPreview(null); return }
//     if ((currentQuestionId ?? editingQuestion?.id) && id === (currentQuestionId ?? editingQuestion?.id)) {
//       setVariantLookupError('A question cannot be a variant of itself.')
//       setVariantPreview(null)
//       return
//     }
//     setVariantLookupLoading(true)
//     setVariantLookupError(null)
//     try {
//       const response = await api.get<ApiResponse<AdminQuestion>>(`/api/v1/admin/questions/${id}`)
//       setVariantPreview(response.data.data)
//       setQuestionForm((prev) => ({ ...prev, variantId: response.data.data.id }))
//     } catch (err) {
//       setVariantPreview(null)
//       setVariantLookupError(getErrorMessage(err, 'Original question not found.'))
//     } finally {
//       setVariantLookupLoading(false)
//     }
//   }

//   const handleVariantSearch = async () => {
//     const term = variantSearchTerm.trim()
//     if (term.length < 2) { setVariantLookupError('Enter at least 2 characters to search.'); setVariantSearchResults([]); return }
//     setVariantLookupLoading(true)
//     setVariantLookupError(null)
//     try {
//       const response = await api.get<ApiResponse<PaginatedResponse<AdminQuestion>>>(
//         '/api/v1/admin/questions/search',
//         { params: { text: term, size: 5 } }
//       )
//       const content = response.data.data?.content ?? []
//       const filtered = content.filter((q) => q.id !== editingQuestion?.id)
//       setVariantSearchResults(filtered)
//     } catch (err) {
//       setVariantLookupError(getErrorMessage(err, 'Failed to search questions.'))
//       setVariantSearchResults([])
//     } finally {
//       setVariantLookupLoading(false)
//     }
//   }

//   const handleSelectVariant = (q: AdminQuestion) => {
//     if (editingQuestion?.id && q.id === editingQuestion.id) {
//       setVariantLookupError('A question cannot be a variant of itself.')
//       return
//     }
//     setQuestionForm((prev) => ({ ...prev, variantId: q.id }))
//     setVariantPreview(q)
//     setVariantLookupError(null)
//   }

//   const handleClearVariant = () => {
//     setQuestionForm((prev) => ({ ...prev, variantId: null }))
//     resetVariantState()
//   }

//   const filteredQuestions = useMemo(
//     () => (questions?.content ?? []).filter((q) => {
//       if (!search.trim()) return true
//       const s = search.toLowerCase()
//       return q.question.toLowerCase().includes(s) || String(q.id).includes(s)
//     }),
//     [questions, search]
//   )

//   useEffect(() => {
//     void Promise.all([fetchJurisdictions(), fetchLicenceCategories({ page: 0, size: 200 })])
//   }, [fetchJurisdictions, fetchLicenceCategories])

//   useEffect(() => {
//     const saved = localStorage.getItem('backoffice-questions-filters')
//     if (saved) {
//       try {
//         const f = JSON.parse(saved)
//         if (f.filterCategoryId        !== undefined) setFilterCategoryId(f.filterCategoryId)
//         if (f.filterJurisdictionId    !== undefined) setFilterJurisdictionId(f.filterJurisdictionId)
//         if (f.filterLicenceCategoryId !== undefined) setFilterLicenceCategoryId(f.filterLicenceCategoryId)
//         if (f.filterActive            !== undefined) setFilterActive(f.filterActive)
//       } catch (e) { console.error('Failed to parse saved filters:', e) }
//     }
//   }, [])

//   useEffect(() => {
//     localStorage.setItem('backoffice-questions-filters', JSON.stringify({ filterCategoryId, filterJurisdictionId, filterLicenceCategoryId, filterActive }))
//   }, [filterCategoryId, filterJurisdictionId, filterLicenceCategoryId, filterActive])

//   useEffect(() => { if (questions && currentPage > 0) void loadQuestions() }, [currentPage])

//   useEffect(() => { if (!formOpen)    return; const t = window.setTimeout(() => questionPrimaryRef.current?.focus(), 30); return () => clearTimeout(t) }, [formOpen])
//   useEffect(() => { if (!detailsOpen) return; const t = window.setTimeout(() => detailsPrimaryRef.current?.focus(),  30); return () => clearTimeout(t) }, [detailsOpen])
//   useEffect(() => { if (!deleteOpen)  return; const t = window.setTimeout(() => deleteButtonRef.current?.focus(),    30); return () => clearTimeout(t) }, [deleteOpen])

//   // Fetch categories when filter jurisdiction changes
//   useEffect(() => {
//     if (filterJurisdictionId !== '') {
//       void fetchCategories(filterJurisdictionId)
//     } else {
//       void fetchCategories()
//     }
//   }, [filterJurisdictionId, fetchCategories])

//   // Fetch languages when jurisdiction changes in create dialog
//   const handleJurisdictionChange = useCallback((jurisdictionId: number) => {
//     setQuestionForm(p => ({ ...p, jurisdictionId, categoryId: undefined, translations: {} }))
//     if (jurisdictionId) {
//       void fetchAdminJurisdictionLanguages(jurisdictionId)
//       fetchCategories(jurisdictionId).then(() => {
//         const cats = useAdminStore.getState().categories
//         setFormCategories(cats)
//       }).catch(() => setFormCategories([]))
//     } else {
//       setFormCategories([])
//     }
//   }, [fetchAdminJurisdictionLanguages, fetchCategories])

//   // Set default locale tab when languages load
//   useEffect(() => {
//     if (primaryCode && !questionLocale) setQuestionLocale(primaryCode)
//   }, [primaryCode, questionLocale])

//   // ── Dialog openers ──────────────────────────────────────────────────────────
//   const openCreateDialog = () => {
//     setFormMode('create'); setEditingQuestion(null); setQuestionLocale(''); setQuestionForm(createInitialForm()); setFormCategories([]); resetVariantState(); setFormOpen(true)
//   }

//   const openEditDialog = async (q: AdminQuestion) => {
//     const full = await fetchQuestion(q.id)
//     void fetchAdminJurisdictionLanguages(full.jurisdictionId)
//     try {
//       await fetchCategories(full.jurisdictionId)
//       setFormCategories(useAdminStore.getState().categories)
//     } catch { setFormCategories([]) }
//     setFormMode('edit'); setEditingQuestion(full); setQuestionLocale(''); setQuestionForm(mapQuestionToForm(full)); setFormOpen(true)
//     if (full.variantId) {
//       void loadVariantPreview(full.variantId, full.id)
//     } else {
//       resetVariantState()
//     }
//   }

//   const openDetailsDialog = async (q: AdminQuestion) => {
//     const full = await fetchQuestion(q.id)
//     void fetchAdminJurisdictionLanguages(full.jurisdictionId)
//     try { const tips = await fetchTipsByQuestion(full.id); full.tips = tips } catch { full.tips = [] }
//     setSelectedQuestion(full)
//     setNewOptionDraft(createBlankOption(Math.max(1, full.options.length + 1)))
//     setTipDraft(emptyLocaleText()); setExplanationDraft(emptyLocaleText()); setExplanationAssetDrafts([])
//     try {
//       const exp = await fetchExplanationByQuestion(full.id)
//       setCurrentExplanation(exp)
//       const expDraft: Record<string, string> = {}
//       if (exp.translations) {
//         for (const [code, fields] of Object.entries(exp.translations)) {
//           expDraft[code] = (fields as any)?.text ?? (fields as any)?.explanation ?? ''
//         }
//       }
//       if (!expDraft[primaryCode]) expDraft[primaryCode] = exp.text ?? exp.explanation ?? ''
//       setExplanationDraft(expDraft)
//     } catch { setCurrentExplanation(null) }
//     setDetailsLang(primaryCode)
//     setDetailsOpen(true)
//   }

//   // ── Asset helpers ───────────────────────────────────────────────────────────
//   const appendQuestionAssets = (files: File[]) => {
//     const err = validateFiles(files)
//     if (err) { setFeedback({ type: 'error', message: err }); return }
//     setQuestionForm((prev) => ({ ...prev, assets: [...prev.assets, ...files.map((f) => ({ file: f, type: '' as AssetType, alt: '', caption: '' }))] }))
//   }

//   const appendExplanationAssets = (files: File[]) => {
//     const err = validateFiles(files)
//     if (err) { setFeedback({ type: 'error', message: err }); return }
//     setExplanationAssetDrafts((prev) => [...prev, ...files.map((f) => ({ file: f, type: 'image' as AssetType, alt: '', caption: '' }))])
//   }

//   // ── Save / delete handlers ──────────────────────────────────────────────────
//   const validateQuestionForm = () => {
//     if (!questionForm.jurisdictionId) return 'Jurisdiction is required.'
//     if (!questionForm.question.trim() || questionForm.question.trim().length < 10) return 'Question text must be at least 10 characters.'
//     if (questionForm.assets.some(a => !a.type)) return 'Please select a type for every asset.'
//     if (questionForm.variantId !== undefined && questionForm.variantId !== null) {
//       if (Number.isNaN(questionForm.variantId) || questionForm.variantId <= 0) return 'Original question ID must be a positive number.'
//       if (editingQuestion?.id && questionForm.variantId === editingQuestion.id) return 'A question cannot be a variant of itself.'
//     }
//     return null
//   }

//   const handleSaveQuestion = async () => {
//     const validationError = validateQuestionForm()
//     if (validationError) { setFeedback({ type: 'error', message: validationError }); return }
//     try {
//       let questionId: number; let createdQuestion: AdminQuestion | null = null
//       const transInput = { ...questionForm.translations, [primaryCode]: questionForm.translations[primaryCode] || questionForm.question }
//       if (formMode === 'create') {
//         const payload: CreateQuestionRequest = {
//           jurisdictionId: questionForm.jurisdictionId,
//           categoryId: questionForm.categoryId,
//           question: questionForm.question,
//           translations: buildQuestionTranslations(transInput, primaryCode),
//           active: questionForm.active,
//           variantId: questionForm.variantId ?? null,
//         }
//         const created = await createQuestion(payload); questionId = created.id; createdQuestion = created
//       } else {
//         if (!editingQuestion) return
//         await updateQuestion(editingQuestion.id, {
//           jurisdictionId: questionForm.jurisdictionId,
//           categoryId: questionForm.categoryId,
//           question: questionForm.question,
//           translations: buildQuestionTranslations(transInput, primaryCode),
//           active: questionForm.active,
//           variantId: questionForm.variantId ?? null,
//         })
//         questionId = editingQuestion.id
//       }
//       if (questionForm.assets.length > 0) await uploadQuestionAssets(questionId, questionForm.assets.map((a) => a.file), { assetTypes: questionForm.assets.map((a) => a.type), alts: questionForm.assets.map((a) => a.alt), captions: questionForm.assets.map((a) => a.caption) })
//       await loadQuestions(); setFormOpen(false)
//       setFeedback({ type: 'success', message: formMode === 'create' ? 'Question created. Continue in details to add options, explanation, and tips.' : 'Question updated successfully.' })
//       if (formMode === 'create' && createdQuestion) await openDetailsDialog(createdQuestion)
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save question.') }) }
//   }

//   const handleDeleteQuestion = async () => {
//     if (!isAdmin || !questionToDelete) return
//     try { await deleteQuestion(questionToDelete.id); setDeleteOpen(false); setQuestionToDelete(null); await loadQuestions(); setFeedback({ type: 'success', message: 'Question deleted successfully.' }) }
//     catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to delete question.') }) }
//   }

//   const refreshSelectedQuestion = async () => {
//     if (!selectedQuestion) return
//     const refreshed = await fetchQuestion(selectedQuestion.id)
//     try { const tips = await fetchTipsByQuestion(refreshed.id); refreshed.tips = tips } catch { refreshed.tips = [] }
//     setSelectedQuestion(refreshed)
//   }

//   const handleSaveExplanation = async () => {
//     if (!selectedQuestion) return
//     const text = (explanationDraft[primaryCode] ?? '').trim()
//     if (text.length < 20) { setFeedback({ type: 'error', message: 'Explanation text must be at least 20 characters.' }); return }
//     try {
//       let explanationId = currentExplanation?.id
//       if (currentExplanation) { await updateExplanation(currentExplanation.id, { text, translations: buildExplanationTranslations(explanationDraft, primaryCode) }) }
//       else { const c = await createExplanation({ questionId: selectedQuestion.id, text, translations: buildExplanationTranslations(explanationDraft, primaryCode) }); explanationId = c.id }
//       if (explanationId && explanationAssetDrafts.length > 0) await uploadExplanationAssets(explanationId, explanationAssetDrafts.map((a) => a.file), { assetTypes: explanationAssetDrafts.map((a) => a.type), alts: explanationAssetDrafts.map((a) => a.alt), captions: explanationAssetDrafts.map((a) => a.caption) })
//       setCurrentExplanation(await fetchExplanationByQuestion(selectedQuestion.id)); setExplanationAssetDrafts([])
//       setFeedback({ type: 'success', message: 'Explanation saved.' })
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save explanation.') }) }
//   }

//   const handleAddTip = async () => {
//     if (!selectedQuestion) return
//     const tip = (tipDraft[primaryCode] ?? '').trim()
//     if (tip.length < 10) { setFeedback({ type: 'error', message: 'Tip must be at least 10 characters.' }); return }
//     try { await addTip(selectedQuestion.id, { tip, translations: buildTipTranslations(tipDraft, primaryCode) }); await refreshSelectedQuestion(); setTipDraft(emptyLocaleText()); setFeedback({ type: 'success', message: 'Tip added.' }) }
//     catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to add tip.') }) }
//   }

//   const handleAddOptionInDetails = async () => {
//     if (!selectedQuestion) return
//     if (!newOptionDraft.text.trim()) { setFeedback({ type: 'error', message: 'Option text is required.' }); return }
//     try {
//       const optTransInput = { ...newOptionDraft.translations, [primaryCode]: newOptionDraft.translations[primaryCode] || newOptionDraft.text }
//       await addOption(selectedQuestion.id, { text: newOptionDraft.text, isCorrect: newOptionDraft.isCorrect, position: newOptionDraft.position, translations: buildOptionTranslations(optTransInput, primaryCode) })
//       await refreshSelectedQuestion()
//       setNewOptionDraft(createBlankOption((selectedQuestion.options?.length ?? 0) + 1))
//       setFeedback({ type: 'success', message: 'Option added.' })
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to add option.') }) }
//   }

//   const handleUpdateOptionInDetails = async (option: QuestionOption) => {
//     try {
//       await updateOption(option.id, { text: option.text, isCorrect: option.isCorrect, position: option.position, translations: option.translations })
//       await refreshSelectedQuestion()
//       setFeedback({ type: 'success', message: 'Option updated.' })
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to update option.') }) }
//   }

//   const openOptionCreateDialog = () => {
//     if (!selectedQuestion) return
//     setOptionEditorMode('create'); setEditingOption(null); setOptionFormData(createBlankOption(Math.max(1, selectedQuestion.options.length + 1))); setOptionLocale(primaryCode); setOptionEditorOpen(true)
//   }

//   const openOptionEditDialog = (option: QuestionOption) => {
//     setOptionEditorMode('edit'); setEditingOption(option)
//     const optTrans: Record<string, string> = {}
//     if (option.translations) {
//       for (const [code, fields] of Object.entries(option.translations)) {
//         optTrans[code] = (fields as any)?.text ?? ''
//       }
//     }
//     if (!optTrans[primaryCode]) optTrans[primaryCode] = option.text
//     setOptionFormData({ text: option.text, isCorrect: option.isCorrect, position: option.position, translations: optTrans, assetFile: null })
//     setOptionLocale(primaryCode); setOptionEditorOpen(true)
//   }

//   const handleSaveOption = async () => {
//     if (!selectedQuestion) return
//     if (optionEditorMode === 'create' && !optionFormData.text.trim() && !optionFormData.assetFile) { setFeedback({ type: 'error', message: 'Either option text or asset must be provided.' }); return }
//     try {
//       let optionId: number | undefined
//       if (optionEditorMode === 'create') {
//         const created = await addOption(selectedQuestion.id, { text: optionFormData.text || ' ', isCorrect: optionFormData.isCorrect, position: optionFormData.position, translations: buildOptionTranslations(optionFormData.translations, primaryCode) }, optionFormData.assetFile || undefined)
//         optionId = created.options.find((o) => o.position === optionFormData.position)?.id
//         setFeedback({ type: 'success', message: 'Option created.' })
//       } else if (editingOption) {
//         const payload: UpdateOptionRequest = {}
//         if (optionFormData.text !== editingOption.text) payload.text = optionFormData.text || ' '
//         if (optionFormData.isCorrect !== editingOption.isCorrect) payload.isCorrect = optionFormData.isCorrect
//         if (optionFormData.position !== editingOption.position) payload.position = optionFormData.position
//         const newTrans = buildOptionTranslations(optionFormData.translations, primaryCode)
//         if (JSON.stringify(newTrans) !== JSON.stringify(editingOption.translations)) payload.translations = newTrans
//         if (Object.keys(payload).length > 0) await updateOption(editingOption.id, payload)
//         optionId = editingOption.id
//         if (optionFormData.assetFile && optionId) await uploadOptionImage(optionId, optionFormData.assetFile)
//         setFeedback({ type: 'success', message: 'Option updated.' })
//       }
//       await refreshSelectedQuestion(); setOptionEditorOpen(false)
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save option.') }) }
//   }

//   const openTipCreateDialog = () => { setTipEditorMode('create'); setEditingTip(null); setTipFormData(emptyLocaleText()); setTipDisplayOrder(0); setTipFormAssets([]); setTipExistingAssets([]); setTipLocale(primaryCode); setTipEditorOpen(true) }
//   const openTipEditDialog = (tip: QuestionTip) => {
//     setTipEditorMode('edit'); setEditingTip(tip); setTipLocale(primaryCode)
//     const tipTrans: Record<string, string> = {}
//     if (tip.translations) {
//       for (const [code, fields] of Object.entries(tip.translations)) {
//         tipTrans[code] = (fields as any)?.tip ?? ''
//       }
//     }
//     if (!tipTrans[primaryCode]) tipTrans[primaryCode] = tip.body
//     setTipFormData(tipTrans)
//     setTipFormAssets([])
//     setTipExistingAssets(tip.assets ?? [])
//     setTipDisplayOrder((tip as any).displayOrder ?? 0)
//     setTipEditorOpen(true)
//   }

//   const handleSaveTip = async () => {
//     if (!selectedQuestion) return
//     const tip = (tipFormData[primaryCode] ?? '').trim()
//     if (tip.length < 10) { setFeedback({ type: 'error', message: 'Tip must be at least 10 characters.' }); return }
//     try {
//       let tipId: number | undefined
//       if (tipEditorMode === 'create') {
//         await addTip(selectedQuestion.id, { tip, displayOrder: tipDisplayOrder, translations: buildTipTranslations(tipFormData, primaryCode) })
//         // Backend returns data:null, so fetch tips to find the newly created one
//         if (tipFormAssets.length > 0) {
//           const tips = await fetchTipsByQuestion(selectedQuestion.id)
//           const newest = tips.length > 0 ? tips.reduce((a: any, b: any) => (new Date(b.createdAt) > new Date(a.createdAt) ? b : a)) : null
//           tipId = newest?.id
//         }
//       } else if (editingTip) {
//         await updateTip(editingTip.id, { tip, displayOrder: tipDisplayOrder, translations: buildTipTranslations(tipFormData, primaryCode) })
//         tipId = editingTip.id
//       }
//       // Upload new assets if any
//       if (tipId && tipFormAssets.length > 0) {
//         await uploadTipAssets(tipId, tipFormAssets.map(a => a.file), {
//           assetTypes: tipFormAssets.map(a => a.type),
//           alts: tipFormAssets.map(a => a.alt),
//           captions: tipFormAssets.map(a => a.caption),
//         })
//       }
//       await refreshSelectedQuestion(); setTipEditorOpen(false)
//       setFeedback({ type: 'success', message: tipEditorMode === 'create' ? 'Tip created.' : 'Tip updated.' })
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save tip.') }) }
//   }

//   const openExplanationDialog = () => {
//     if (currentExplanation) {
//       const expTrans: Record<string, string> = {}
//       if (currentExplanation.translations) {
//         for (const [code, fields] of Object.entries(currentExplanation.translations)) {
//           expTrans[code] = (fields as any)?.text ?? (fields as any)?.explanation ?? ''
//         }
//       }
//       if (!expTrans[primaryCode]) expTrans[primaryCode] = currentExplanation.text ?? currentExplanation.explanation ?? ''
//       setExplanationFormData(expTrans)
//     } else {
//       setExplanationFormData(emptyLocaleText())
//     }
//     setExplanationFormAssets([]); setExplanationLocale(primaryCode); setExplanationEditorOpen(true)
//   }

//   const handleSaveExplanationFromDialog = async () => {
//     if (!selectedQuestion) return
//     const text = (explanationFormData[primaryCode] ?? '').trim()
//     if (text.length < 20) { setFeedback({ type: 'error', message: 'Explanation text must be at least 20 characters.' }); return }
//     try {
//       let explanationId = currentExplanation?.id
//       if (currentExplanation) await updateExplanation(currentExplanation.id, { text, translations: buildExplanationTranslations(explanationFormData, primaryCode) })
//       else { const c = await createExplanation({ questionId: selectedQuestion.id, text, translations: buildExplanationTranslations(explanationFormData, primaryCode) }); explanationId = c.id }
//       if (explanationId && explanationFormAssets.length > 0) await uploadExplanationAssets(explanationId, explanationFormAssets.map((a) => a.file), { assetTypes: explanationFormAssets.map((a) => a.type), alts: explanationFormAssets.map((a) => a.alt), captions: explanationFormAssets.map((a) => a.caption) })
//       setCurrentExplanation(await fetchExplanationByQuestion(selectedQuestion.id)); setExplanationEditorOpen(false)
//       setFeedback({ type: 'success', message: currentExplanation ? 'Explanation updated.' : 'Explanation created.' })
//     } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save explanation.') }) }
//   }

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
//         .font-syne { font-family: 'Syne', sans-serif; }
//         .font-dm   { font-family: 'DM Sans', sans-serif; }
//         @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
//         .animate-fade-up { animation: fadeUp 0.4s ease both; }
//         .delay-1 { animation-delay: 0.07s; }
//         .delay-2 { animation-delay: 0.14s; }
//       `}</style>

//       <div className="font-dm text-[#f0f0f5] space-y-6 pb-10">

//         {/* ── Header ── */}
//         <div className="relative overflow-hidden rounded-2xl border border-emerald-300/[0.12]
//                         bg-emerald-300/[0.04] px-6 py-5 animate-fade-up">
//           {/* Glow blobs */}
//           <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/[0.08] blur-3xl pointer-events-none" />
//           <div className="absolute -bottom-14 left-16 h-48 w-48 rounded-full bg-sky-300/[0.06] blur-3xl pointer-events-none" />

//           <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
//                               bg-emerald-300/10 border border-emerald-300/20 mb-3">
//                 <Sparkles size={11} className="text-emerald-300" />
//                 <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
//                   Admin Question Studio
//                 </span>
//               </div>
//               <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Questions</h1>
//               <p className="text-sm text-white/40 font-light mt-1">
//                 Full management for questions, options, explanations, tips, assets, and translations.
//               </p>
//             </div>
//             {isAdmin && (
//               <button onClick={openCreateDialog}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
//                            text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
//                            [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
//                 <Plus size={15} /> Create Question
//               </button>
//             )}
//           </div>
//         </div>

//         {/* ── Feedback ── */}
//         {feedback && (
//           <div className={`flex items-start gap-2.5 px-4 py-3.5 rounded-xl border animate-fade-up
//             ${feedback.type === 'success'
//               ? 'bg-emerald-300/[0.07] border-emerald-300/20 text-emerald-300/80'
//               : 'bg-red-400/[0.07] border-red-400/20 text-red-400/80'}`}>
//             {feedback.type === 'success'
//               ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-300" />
//               : <AlertCircle  size={14} className="shrink-0 mt-0.5 text-red-400" />}
//             <span className="text-sm font-light flex-1">{feedback.message}</span>
//             <button onClick={() => setFeedback(null)}
//               className="text-xs text-white/25 underline hover:text-white/50 transition-colors shrink-0">
//               Dismiss
//             </button>
//           </div>
//         )}

//         {/* ── Store error ── */}
//         {error && (
//           <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl border
//                           bg-red-400/[0.07] border-red-400/20 animate-fade-up">
//             <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
//             <span className="text-sm text-red-400/80 font-light flex-1">{error}</span>
//             <button onClick={clearError} className="text-xs text-white/25 underline hover:text-white/50 shrink-0">
//               Clear
//             </button>
//           </div>
//         )}

//         {/* ── Filters ── */}
//         <div className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
//                         shadow-[0_4px_24px_rgba(0,0,0,0.25)] animate-fade-up delay-1">
//           <div className="flex items-center gap-2 mb-4">
//             <SlidersHorizontal size={13} className="text-white/30" />
//             <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Filters</span>
//           </div>

//           {/* ── Backend search ── */}
//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-4">
//             {/* Search by ID */}
//             <div className="flex gap-2">
//               <div className="relative flex-1">
//                 <Hash size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
//                 <input value={searchById} onChange={(e) => setSearchById(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === 'Enter') void handleSearchById() }}
//                   placeholder="Search By Question ID (e.g. 10)"
//                   className={`${inputClass} pl-9`} />
//               </div>
//               <button onClick={() => void handleSearchById()} disabled={isLoading}
//                 className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
//                            text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                            transition-all duration-200 [box-shadow:0_0_12px_rgba(110,231,183,0.15)]">
//                 {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
//                 Find
//               </button>
//             </div>

//             {/* Search by Text */}
//             <div className="flex gap-2">
//               <div className="relative flex-1">
//                 <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
//                 <input value={searchByText} onChange={(e) => setSearchByText(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === 'Enter') void handleSearchByText() }}
//                   placeholder="Search question text…"
//                   className={`${inputClass} pl-9`} />
//               </div>
//               <button onClick={() => void handleSearchByText()} disabled={isLoading}
//                 className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
//                            text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                            transition-all duration-200 [box-shadow:0_0_12px_rgba(110,231,183,0.15)]">
//                 {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
//                 Search
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
//             {/* Client-side filter */}
//             <div className="relative xl:col-span-2">
//               <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
//               <input value={search} onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Filter by ID or question text"
//                 className={`${inputClass} pl-9`} />
//             </div>

//             <select value={filterJurisdictionId}
//               onChange={(e) => {
//                 const val = e.target.value ? Number(e.target.value) : '' as const
//                 setFilterJurisdictionId(val)
//                 setFilterCategoryId('')
//                 if (val) { void fetchAdminJurisdictionLanguages(val) }
//                 setListLang('')
//               }}
//               className={selectClass}>
//               <option value="">All Jurisdictions</option>
//               {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
//             </select>

//             <select value={filterCategoryId}
//               onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : '')}
//               className={selectClass}>
//               <option value="">All Categories</option>
//               {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//             </select>

//             <select value={filterLicenceCategoryId}
//               onChange={(e) => setFilterLicenceCategoryId(e.target.value ? Number(e.target.value) : '')}
//               className={selectClass}>
//               <option value="">All Licence Categories</option>
//               {(licenceCategories?.content ?? []).map((lc) => <option key={lc.id} value={lc.id}>{lc.code} – {lc.name}</option>)}
//             </select>

//             <select value={filterActive === '' ? '' : filterActive ? 'true' : 'false'}
//               onChange={(e) => setFilterActive(e.target.value === '' ? '' : e.target.value === 'true')}
//               className={selectClass}>
//               <option value="">All Statuses</option>
//               <option value="true">Active</option>
//               <option value="false">Inactive</option>
//             </select>
//           </div>

//           <div className="mt-4 flex justify-end">
//             <button onClick={() => void handleFetchQuestions()} disabled={isLoading}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                          text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                          transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
//               {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
//               Fetch Questions
//             </button>
//           </div>
//         </div>

//         {/* ── Language switcher for list ── */}
//         {filterJurisdictionId !== '' && languageList.length > 1 && (
//           <div className="flex justify-end animate-fade-up delay-1">
//             <div className="grid grid-cols-6 gap-1">
//               {languageList.map(({ code, label }) => (
//                 <button
//                   key={code}
//                   type="button"
//                   onClick={() => setListLang(code)}
//                   className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap text-center
//                     ${(listLang || primaryCode) === code
//                       ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
//                       : 'text-white/30 hover:text-white/60 bg-white/[0.03] border border-white/[0.07]'}`}
//                 >
//                   {label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── Question list ── */}
//         <div key={`list-${listLang || primaryCode}`} className="space-y-3 animate-fade-up delay-2" dir={languageList.find(l => l.code === (listLang || primaryCode))?.direction || 'ltr'}>
//           {isLoading ? (
//             Array.from({ length: 3 }).map((_, i) => (
//               <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
//             ))
//           ) : filteredQuestions.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-20 rounded-2xl
//                             border border-dashed border-white/[0.08] text-center">
//               <BookOpen size={28} className="text-white/15 mb-3" />
//               <p className="text-sm text-white/30 font-light">No questions found for the current filters.</p>
//             </div>
//           ) : filteredQuestions.map((question) => (
//             <article key={question.id}
//               className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
//                          hover:border-white/[0.14] transition-all duration-200
//                          shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
//               <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
//                 <div className="space-y-2 min-w-0 flex-1">
//                   <p className="text-sm font-medium leading-relaxed text-[#f0f0f5] mb-2">
//                     {(listLang || primaryCode) === primaryCode
//                       ? question.question
//                       : (question.translations as Record<string, any>)?.[(listLang || primaryCode)]?.question || question.question}
//                   </p>
//                   <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30 font-light">
//                     <span>ID #{question.id}</span>
//                     <span>· {question.jurisdictionName ?? 'Unknown jurisdiction'}</span>
//                     {question.categoryName && <span>· {question.categoryName}</span>}
//                     {question.variantId && (
//                       <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-emerald-300/80 border border-emerald-300/30">
//                         Variant of #{question.variantId}
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1.5 shrink-0">
//                   <button onClick={() => void openDetailsDialog(question)}
//                     className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                                text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all duration-200">
//                     <Info size={12} /> Details
//                   </button>
//                   <button onClick={() => void openEditDialog(question)}
//                     className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                                text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all duration-200">
//                     <Edit size={12} /> Edit
//                   </button>
//                   {isAdmin && (
//                     <button onClick={() => { setQuestionToDelete(question); setDeleteOpen(true) }}
//                       className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                                  text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
//                                  hover:bg-red-400/[0.07] transition-all duration-200">
//                       <Trash2 size={12} /> Delete
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </article>
//           ))}
//         </div>

//         {/* ── Pagination ── */}
//         {questions && questions.totalPages > 1 && (
//           <div className="flex items-center justify-between px-1">
//             <p className="text-xs text-white/30 tabular-nums">
//               {questions.numberOfElements} of {questions.totalElements} questions
//             </p>
//             <div className="flex items-center gap-2">
//               <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
//                 disabled={currentPage === 0 || isLoading}
//                 className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                            text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
//                            disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
//                 <ChevronLeft size={13} /> Previous
//               </button>
//               <span className="text-xs text-white/30 tabular-nums px-2">
//                 {currentPage + 1} / {questions.totalPages}
//               </span>
//               <button onClick={() => setCurrentPage((p) => p + 1)}
//                 disabled={currentPage >= questions.totalPages - 1 || isLoading}
//                 className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                            text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
//                            disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
//                 Next <ChevronRight size={13} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ══════════════════════════════════════
//             Create / Edit dialog
//         ══════════════════════════════════════ */}
//         <Dialog open={formOpen} onOpenChange={setFormOpen}>
//           <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto
//                                     bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
//             <div key={`form-${questionLocale || primaryCode}`} dir={languageList.find(l => l.code === (questionLocale || primaryCode))?.direction || 'ltr'}>
//             <DialogHeader>
//               <DialogTitle className="font-syne font-bold text-lg tracking-tight">
//                 {formMode === 'create' ? 'Create Question' : 'Edit Question'}
//               </DialogTitle>
//             </DialogHeader>

//             <div className="space-y-4 font-dm">
//               {/* Basic info */}
//               {isAdmin && (
//                 <SectionBlock title="Basic Info">
//                   <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//                         Jurisdiction <span className="text-red-400">*</span>
//                       </label>
//                       <select value={questionForm.jurisdictionId}
//                         onChange={(e) => handleJurisdictionChange(Number(e.target.value))}
//                         className={selectClass}>
//                         <option value={0}>Select jurisdiction…</option>
//                         {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
//                       </select>
//                     </div>
//                     <div className="space-y-1.5">
//                       <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Category</label>
//                       <select value={questionForm.categoryId ?? ''}
//                         onChange={(e) => setQuestionForm((p) => ({ ...p, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
//                         className={selectClass}>
//                         <option value="">No category</option>
//                         {formCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
//                       </select>
//                     </div>
//                   </div>

//                   <div className="space-y-2 mb-3">
//                     <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Variant of question (optional)</label>
//                     <div className="grid gap-3 md:grid-cols-[1fr,auto]">
//                       <div className="flex flex-col gap-2">
//                         <div className="flex gap-2">
//                           <input
//                             type="number"
//                             inputMode="numeric"
//                             min={1}
//                             value={questionForm.variantId ?? ''}
//                             onChange={(e) => {
//                               const value = e.target.value ? Number(e.target.value) : null
//                               setQuestionForm((p) => ({ ...p, variantId: value }))
//                               setVariantLookupError(null)
//                             }}
//                             placeholder="Original question ID"
//                             className={inputClass}
//                           />
//                           <button
//                             type="button"
//                             onClick={() => void loadVariantPreview(questionForm.variantId ?? undefined)}
//                             disabled={variantLookupLoading}
//                             className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50 transition-all duration-200"
//                           >
//                             {variantLookupLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
//                             Lookup
//                           </button>
//                           <button
//                             type="button"
//                             onClick={handleClearVariant}
//                             className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/70 border border-white/[0.1] hover:text-white"
//                           >
//                             Clear
//                           </button>
//                         </div>
//                         <div className="flex flex-col gap-2">
//                           <div className="flex gap-2">
//                             <input
//                               value={variantSearchTerm}
//                               onChange={(e) => setVariantSearchTerm(e.target.value)}
//                               onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleVariantSearch() } }}
//                               placeholder="Search existing questions by text"
//                               className={inputClass}
//                             />
//                             <button
//                               type="button"
//                               onClick={() => void handleVariantSearch()}
//                               disabled={variantLookupLoading}
//                               className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#12131a] bg-white/80 text-[#12131a] hover:bg-white transition-all duration-200 disabled:opacity-50"
//                             >
//                               {variantLookupLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
//                               Search
//                             </button>
//                           </div>
//                           {variantLookupError && <p className="text-xs text-red-400/80">{variantLookupError}</p>}
//                           {variantPreview && (
//                             <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/5 px-3 py-2 text-xs text-emerald-100">
//                               <div className="flex items-center justify-between gap-2">
//                                 <div className="space-y-1">
//                                   <div className="flex items-center gap-2 text-[11px] text-emerald-200/80">
//                                     <span className="px-1.5 py-0.5 rounded bg-emerald-300/10 border border-emerald-300/30">ID #{variantPreview.id}</span>
//                                     <span>{variantPreview.jurisdictionName ?? 'Unknown jurisdiction'}</span>
//                                     {variantPreview.categoryName && <span>· {variantPreview.categoryName}</span>}
//                                   </div>
//                                   <p className="text-[13px] text-emerald-50 font-medium line-clamp-2">{variantPreview.question}</p>
//                                 </div>
//                                 <button
//                                   type="button"
//                                   onClick={() => handleSelectVariant(variantPreview)}
//                                   className="px-2 py-1 rounded-lg text-[11px] font-medium text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all"
//                                 >
//                                   Use
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                           {variantSearchResults.length > 0 && (
//                             <div className="space-y-2">
//                               {variantSearchResults.map((q) => (
//                                 <button
//                                   key={q.id}
//                                   type="button"
//                                   onClick={() => handleSelectVariant(q)}
//                                   className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 hover:border-emerald-300/30 hover:bg-emerald-300/5 transition-colors"
//                                 >
//                                   <div className="flex items-center justify-between gap-2 text-[11px] text-white/40">
//                                     <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/60">ID #{q.id}</span>
//                                     <span>{q.jurisdictionName ?? 'Unknown jurisdiction'}</span>
//                                   </div>
//                                   <p className="text-[13px] text-white/80 font-medium line-clamp-2">{q.question}</p>
//                                   {q.categoryName && <p className="text-[11px] text-white/35 mt-1">{q.categoryName}</p>}
//                                 </button>
//                               ))}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <div className="space-y-2">
//                         <p className="text-xs text-white/40">Use this to link the current item as a variant of an existing question. Leave empty for original questions.</p>
//                         <p className="text-[11px] text-white/30">Avoid selecting the same question. Backend enforces validity.</p>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="space-y-1.5 mb-3">
//                     <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//                       Question text <span className="text-red-400">*</span>
//                     </label>
//                     <textarea ref={questionPrimaryRef} rows={3}
//                       value={questionForm.question}
//                       onChange={(e) => setQuestionForm((p) => ({ ...p, question: e.target.value, translations: { ...p.translations, [primaryCode]: e.target.value } }))}
//                       placeholder="Enter the question text"
//                       className={textareaClass} />
//                   </div>

//                   <label className="flex items-center gap-3 cursor-pointer group">
//                     <div className="relative shrink-0">
//                       <input type="checkbox" checked={questionForm.active}
//                         onChange={(e) => setQuestionForm((p) => ({ ...p, active: e.target.checked }))}
//                         className="sr-only peer" />
//                       <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
//                                       peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
//                       <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
//                                       peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
//                     </div>
//                     <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Active</span>
//                   </label>
//                 </SectionBlock>
//               )}

//               {/* Translations */}
//               <SectionBlock title="Translations" icon={Globe2}
//                 action={<LocaleToggle active={questionLocale} onChange={setQuestionLocale} languages={languageList} />}>
//                 <textarea rows={2} value={questionForm.translations[questionLocale] ?? ''}
//                   onChange={(e) => setQuestionForm((p) => ({ ...p, translations: { ...p.translations, [questionLocale]: e.target.value } }))}
//                   placeholder={`Question in ${languageList.find((l: { code: string; label: string }) => l.code === questionLocale)?.label ?? questionLocale}`}
//                   className={textareaClass} />
//               </SectionBlock>

//               {/* Assets */}
//               {isAdmin && (
//                 <SectionBlock title="Assets" icon={ImageIcon}
//                   action={
//                     <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer
//                                       text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
//                                       transition-all duration-200">
//                       <Upload size={12} /> Add Files
//                       <input hidden type="file" multiple onChange={(e) => appendQuestionAssets(Array.from(e.target.files ?? []))} />
//                     </label>
//                   }>
//                   {questionForm.assets.length === 0 ? (
//                     <p className="text-sm text-white/25 font-light">No assets queued for upload.</p>
//                   ) : (
//                     <div className="space-y-3">
//                       {questionForm.assets.map((asset, index) => (
//                         <div key={`${asset.file.name}-${index}`} draggable
//                           onDragStart={() => setDraggingQuestionAssetIndex(index)}
//                           onDragOver={(e) => e.preventDefault()}
//                           onDrop={() => {
//                             if (draggingQuestionAssetIndex === null) return
//                             setQuestionForm((p) => ({ ...p, assets: moveItem(p.assets, draggingQuestionAssetIndex, index) }))
//                             setDraggingQuestionAssetIndex(null)
//                           }}
//                           className="grid gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3
//                                      md:grid-cols-[140px,1fr,1fr,auto]">
//                           <div className="space-y-1">
//                             <LocalAssetPreview file={asset.file} />
//                             <p className="truncate text-[11px] text-white/30">{asset.file.name}</p>
//                           </div>
//                           <select value={asset.type}
//                             onChange={(e) => setQuestionForm((p) => ({ ...p, assets: p.assets.map((item, idx) => idx === index ? { ...item, type: e.target.value as AssetType } : item) }))}
//                             className={`${selectClass} ${!asset.type ? 'border-red-400/40 text-white/30' : ''}`}>
//                             <option value="" disabled>Select type…</option>
//                             {['image','video','document','diagram','illustration'].map(t => <option key={t} value={t}>{t}</option>)}
//                           </select>
//                           <div className="space-y-2">
//                             <input value={asset.alt} onChange={(e) => setQuestionForm((p) => ({ ...p, assets: p.assets.map((item, idx) => idx === index ? { ...item, alt: e.target.value } : item) }))} placeholder="Alt text" className={inputClass} />
//                             <input value={asset.caption} onChange={(e) => setQuestionForm((p) => ({ ...p, assets: p.assets.map((item, idx) => idx === index ? { ...item, caption: e.target.value } : item) }))} placeholder="Caption" className={inputClass} />
//                           </div>
//                           <div className="flex flex-col items-center gap-1">
//                             <GripVertical size={14} className="text-white/20" />
//                             <ActionBtn onClick={() => setQuestionForm((p) => ({ ...p, assets: moveItem(p.assets, index, index - 1) }))} variant="ghost"><ChevronUp size={13} /></ActionBtn>
//                             <ActionBtn onClick={() => setQuestionForm((p) => ({ ...p, assets: moveItem(p.assets, index, index + 1) }))} variant="ghost"><ChevronDown size={13} /></ActionBtn>
//                             <ActionBtn onClick={() => setQuestionForm((p) => ({ ...p, assets: p.assets.filter((_, idx) => idx !== index) }))} variant="danger"><Trash2 size={13} /></ActionBtn>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   )}
//                 </SectionBlock>
//               )}
//             </div>

//             <DialogFooter className="gap-2">
//               <button onClick={() => setFormOpen(false)}
//                 className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
//                            hover:text-white/85 hover:border-white/20 transition-all duration-200">
//                 Cancel
//               </button>
//               <button onClick={() => void handleSaveQuestion()} disabled={isLoading}
//                 className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                            text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                            transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
//                 {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
//                 {formMode === 'create' ? 'Create Question' : 'Save Changes'}
//               </button>
//             </DialogFooter>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* ══════════════════════════════════════
//             Details dialog
//         ══════════════════════════════════════ */}
//         <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
//           <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto
//                                     bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
//             <div key={`details-${detailsLang || primaryCode}`} dir={languageList.find(l => l.code === (detailsLang || primaryCode))?.direction || 'ltr'}>
//             <DialogHeader>
//               <DialogTitle className="font-syne font-bold text-lg tracking-tight">
//                 Question Details & Management
//               </DialogTitle>
//             </DialogHeader>

//             {selectedQuestion && (
//               <div className="space-y-4 font-dm">
//                 {/* Language switcher */}
//                 {languageList.length > 1 && (
//                   <div className="flex justify-end">
//                     <div className="grid grid-cols-6 gap-1">
//                       {languageList.map(({ code, label }) => (
//                         <button
//                           key={code}
//                           type="button"
//                           onClick={() => setDetailsLang(code)}
//                           className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap text-center
//                             ${detailsLang === code
//                               ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
//                               : 'text-white/30 hover:text-white/60 bg-white/[0.03] border border-white/[0.07]'}`}
//                         >
//                           {label}
//                         </button>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Question summary */}
//                 <SectionBlock title="Question">
//                   <div className="flex flex-wrap items-start justify-between gap-3">
//                     <div className="flex-1 min-w-0">
//                       <p className="text-sm font-medium leading-relaxed text-[#f0f0f5] mb-2">
//                         {detailsLang === primaryCode
//                           ? selectedQuestion.question
//                           : (selectedQuestion.translations as Record<string, any>)?.[detailsLang]?.question || <span className="text-white/25 italic">No translation</span>}
//                       </p>
//                       <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30 font-light">
//                         <span>ID #{selectedQuestion.id}</span>
//                         <span>· {selectedQuestion.jurisdictionName ?? 'Unknown jurisdiction'}</span>
//                         {selectedQuestion.categoryName && <span>· {selectedQuestion.categoryName}</span>}
//                         {selectedQuestion.variantId && (
//                           <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-emerald-300/80 border border-emerald-300/30">
//                             Variant of #{selectedQuestion.variantId}
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                     <div className="flex items-center gap-1.5 shrink-0">
//                       <button onClick={() => void openEditDialog(selectedQuestion)}
//                         className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                                    text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all duration-200">
//                         <Edit size={12} /> Edit
//                       </button>
//                       {isAdmin && (
//                         <button onClick={() => { setQuestionToDelete(selectedQuestion); setDeleteOpen(true); setDetailsOpen(false) }}
//                           className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                                      text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
//                                      hover:bg-red-400/[0.07] transition-all duration-200">
//                           <Trash2 size={12} /> Delete
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 </SectionBlock>

//                 {/* Question assets */}
//                 <SectionBlock title="Question Assets" icon={ImageIcon}>
//                   {selectedQuestion.assets && selectedQuestion.assets.length > 0 ? (
//                     <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
//                       {selectedQuestion.assets.map((asset) => {
//                         const url = getAssetUrl(asset.url)
//                         return (
//                           <div key={asset.url} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
//                             {isImageAsset(asset.contentType, asset.type)
//                               ? <img src={url} alt={asset.alt ?? 'asset'} className="mb-2 h-36 w-full rounded-lg object-cover" />
//                               : isVideoAsset(asset.contentType, asset.type)
//                               ? <video controls className="mb-2 h-36 w-full rounded-lg object-cover"><source src={url} type={asset.contentType ?? 'video/mp4'} /></video>
//                               : null}
//                             <div className="flex items-center justify-between">
//                               <span className="text-[11px] text-white/30">{asset.type}</span>
//                               {isAdmin && (
//                                 <ActionBtn variant="danger" onClick={async () => { await deleteQuestionAsset(selectedQuestion.id, asset.url); await refreshSelectedQuestion() }}><Trash2 size={12} /></ActionBtn>
//                               )}
//                             </div>
//                             {asset.caption && <p className="mt-1 text-[11px] text-white/25">{asset.caption}</p>}
//                           </div>
//                         )
//                       })}
//                     </div>
//                   ) : <p className="text-sm text-white/25 font-light">No assets uploaded yet.</p>}
//                 </SectionBlock>

//                 {/* Options */}
//                 <SectionBlock title="Options" icon={CheckCircle2}
//                   action={isAdmin && (
//                     <button onClick={openOptionCreateDialog}
//                       className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
//                                  text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
//                                  hover:border-emerald-300/40 transition-all duration-200">
//                       <Plus size={11} /> Add Option
//                     </button>
//                   )}>
//                   <div className="space-y-2">
//                     {selectedQuestion.options.length === 0
//                       ? <p className="text-sm text-white/25 font-light">No options added yet.</p>
//                       : selectedQuestion.options.map((option) => {
//                         const optAssetUrl = option.asset?.url ? getAssetUrl(option.asset.url) : null
//                         return (
//                           <div key={option.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
//                             <div className="flex items-start justify-between gap-3">
//                               <div className="flex-1 min-w-0">
//                                 <p className="text-sm font-medium text-[#f0f0f5]">
//                                   {detailsLang === primaryCode
//                                     ? option.text
//                                     : (option.translations as Record<string, any>)?.[detailsLang]?.text || <span className="text-white/25 italic">No translation</span>}
//                                 </p>
//                                 <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-white/30 font-light">
//                                   <span>Position {option.position}</span>
//                                   <span className={option.isCorrect ? 'text-emerald-300 font-medium' : 'text-red-400/70'}>
//                                     {option.isCorrect ? '✓ Correct' : '✗ Incorrect'}
//                                   </span>
//                                   {optAssetUrl && <a href={optAssetUrl} target="_blank" rel="noreferrer" className="underline">Has asset</a>}
//                                 </div>
//                                 {optAssetUrl && isImageAsset(option.asset?.contentType, option.asset?.type) &&
//                                   <img src={optAssetUrl} alt={option.asset?.alt ?? 'option'} className="mt-2 h-20 w-auto rounded-lg border border-white/[0.07]" />}
//                               </div>
//                               <div className="flex items-center gap-1 shrink-0">
//                                 <ActionBtn variant="outline" onClick={() => openOptionEditDialog(option)}><Edit size={12} /></ActionBtn>
//                                 {isAdmin && (
//                                   <ActionBtn variant="danger" onClick={async () => { await deleteOption(option.id); await refreshSelectedQuestion(); setFeedback({ type: 'success', message: 'Option deleted.' }) }}><Trash2 size={12} /></ActionBtn>
//                                 )}
//                               </div>
//                             </div>
//                           </div>
//                         )
//                       })}
//                   </div>
//                 </SectionBlock>

//                 {/* Explanation */}
//                 <SectionBlock title="Explanation" icon={MessageSquare}
//                   action={
//                     <div className="flex items-center gap-1.5">
//                       <button onClick={openExplanationDialog}
//                         className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
//                                    text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
//                                    hover:border-emerald-300/40 transition-all duration-200">
//                         {currentExplanation ? <><Edit size={11} /> Edit</> : <><Plus size={11} /> Add</>}
//                       </button>
//                       {isAdmin && currentExplanation && (
//                         <ActionBtn variant="danger" onClick={async () => { await deleteExplanation(currentExplanation.id); setCurrentExplanation(null); setFeedback({ type: 'success', message: 'Explanation deleted.' }) }}><Trash2 size={12} /></ActionBtn>
//                       )}
//                     </div>
//                   }>
//                   {currentExplanation ? (
//                     <div>
//                       {(() => {
//                         const expText = detailsLang === primaryCode
//                           ? (currentExplanation.text ?? currentExplanation.explanation ?? '')
//                           : ((currentExplanation.translations as Record<string, any>)?.[detailsLang]?.text
//                             ?? (currentExplanation.translations as Record<string, any>)?.[detailsLang]?.explanation
//                             ?? '')
//                         return expText
//                           ? <div className="text-sm text-white/70 font-light quill-content" dangerouslySetInnerHTML={{ __html: expText }} />
//                           : <p className="text-sm text-white/25 font-light italic">No translation</p>
//                       })()}
//                       {currentExplanation.assets && currentExplanation.assets.length > 0 && (
//                         <div className="mt-3 grid gap-3 md:grid-cols-2">
//                           {currentExplanation.assets.map((asset) => {
//                             const url = getAssetUrl(asset.url)
//                             return (
//                               <div key={asset.url} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
//                                 {isImageAsset(asset.contentType, asset.type)
//                                   ? <img src={url} alt={asset.alt ?? 'asset'} className="mb-2 h-28 w-full rounded-lg object-cover" />
//                                   : isVideoAsset(asset.contentType, asset.type)
//                                   ? <video controls className="mb-2 h-28 w-full rounded-lg object-cover"><source src={url} type={asset.contentType ?? 'video/mp4'} /></video>
//                                   : null}
//                                 <div className="flex items-center justify-between">
//                                   <a href={url} target="_blank" rel="noreferrer" className="truncate text-[11px] text-white/30 underline">{asset.filename || asset.url}</a>
//                                   {isAdmin && (
//                                     <ActionBtn variant="danger" onClick={async () => { await deleteExplanationAsset(currentExplanation.id, asset.url); setCurrentExplanation(await fetchExplanationByQuestion(selectedQuestion.id)); setFeedback({ type: 'success', message: 'Asset deleted.' }) }}><Trash2 size={12} /></ActionBtn>
//                                   )}
//                                 </div>
//                                 {asset.caption && <p className="mt-1 text-[11px] text-white/25">{asset.caption}</p>}
//                               </div>
//                             )
//                           })}
//                         </div>
//                       )}
//                     </div>
//                   ) : <p className="text-sm text-white/25 font-light">No explanation added yet.</p>}
//                 </SectionBlock>

//                 {/* Tips */}
//                 <SectionBlock title="Tips" icon={Lightbulb}
//                   action={isAdmin && (
//                     <button onClick={openTipCreateDialog}
//                       className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
//                                  text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
//                                  hover:border-emerald-300/40 transition-all duration-200">
//                       <Plus size={11} /> Add Tip
//                     </button>
//                   )}>
//                   <div className="space-y-2">
//                     {(selectedQuestion.tips ?? []).length === 0
//                       ? <p className="text-sm text-white/25 font-light">No tips added yet.</p>
//                       : (selectedQuestion.tips ?? []).map((tip) => (
//                         <div key={tip.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
//                           <div className="flex items-start justify-between gap-3">
//                             <div className="flex-1 min-w-0">
//                               {(() => {
//                                 const tipTitle = detailsLang === primaryCode
//                                   ? tip.title
//                                   : (tip.translations as Record<string, any>)?.[detailsLang]?.title ?? ''
//                                 const tipBody = detailsLang === primaryCode
//                                   ? tip.body
//                                   : ((tip.translations as Record<string, any>)?.[detailsLang]?.body
//                                     ?? (tip.translations as Record<string, any>)?.[detailsLang]?.tip
//                                     ?? '')
//                                 return (
//                                   <>
//                                     {tipTitle && <p className="text-xs font-medium text-white/50 mb-1">{tipTitle}</p>}
//                                     {tipBody
//                                       ? <div className="text-sm text-white/70 font-light quill-content" dangerouslySetInnerHTML={{ __html: tipBody }} />
//                                       : <p className="text-sm text-white/25 font-light italic">No translation</p>}
//                                   </>
//                                 )
//                               })()}
//                             </div>
//                             <div>Display Order: {tip.displayOrder}</div>
//                             <div className="flex items-center gap-1 shrink-0">
//                               <ActionBtn variant="outline" onClick={() => openTipEditDialog(tip)}><Edit size={12} /></ActionBtn>
//                               {isAdmin && (
//                                 <ActionBtn variant="danger" onClick={async () => { await deleteTip(tip.id); await refreshSelectedQuestion(); setFeedback({ type: 'success', message: 'Tip deleted.' }) }}><Trash2 size={12} /></ActionBtn>
//                               )}
//                             </div>
//                           </div>
//                           {tip.assets && tip.assets.length > 0 && (
//                             <div className="mt-3 grid gap-3 md:grid-cols-2">
//                               {tip.assets.map((asset) => {
//                                 const url = getAssetUrl(asset.url)
//                                 return (
//                                   <div key={asset.url} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
//                                     {isImageAsset(asset.contentType, asset.type)
//                                       ? <img src={url} alt={asset.alt ?? 'asset'} className="mb-2 h-28 w-full rounded-lg object-cover" />
//                                       : isVideoAsset(asset.contentType, asset.type)
//                                       ? <video controls className="mb-2 h-28 w-full rounded-lg object-cover"><source src={url} type={asset.contentType ?? 'video/mp4'} /></video>
//                                       : null}
//                                     <div className="flex items-center justify-between">
//                                       <a href={url} target="_blank" rel="noreferrer" className="truncate text-[11px] text-white/30 underline">{asset.filename || asset.url}</a>
//                                       {isAdmin && (
//                                         <ActionBtn variant="danger" onClick={async () => { await deleteTipAsset(tip.id, asset.url); await refreshSelectedQuestion(); setFeedback({ type: 'success', message: 'Tip asset deleted.' }) }}><Trash2 size={12} /></ActionBtn>
//                                       )}
//                                     </div>
//                                     {asset.caption && <p className="mt-1 text-[11px] text-white/25">{asset.caption}</p>}
//                                   </div>
//                                 )
//                               })}
//                             </div>
//                           )}
//                         </div>
//                       ))}
//                   </div>
//                 </SectionBlock>
//               </div>
//             )}

//             <DialogFooter>
//               <button onClick={() => setDetailsOpen(false)}
//                 className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
//                            hover:text-white/85 hover:border-white/20 transition-all duration-200">
//                 Close
//               </button>
//             </DialogFooter>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* ══════════════════════════════════════
//             Delete dialog
//         ══════════════════════════════════════ */}
//         <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
//           <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
//             <DialogHeader>
//               <div className="flex items-center gap-3 mb-1">
//                 <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
//                   <Trash2 size={15} className="text-red-400" />
//                 </div>
//                 <DialogTitle className="font-syne font-bold text-base tracking-tight text-red-400">
//                   Delete Question
//                 </DialogTitle>
//               </div>
//             </DialogHeader>
//             <p className="text-sm text-white/45 font-light">
//               This performs a soft delete and removes the question from active workflows.
//             </p>
//             {questionToDelete && (
//               <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
//                 <p className="text-sm text-white/60 font-light leading-relaxed">{questionToDelete.question}</p>
//               </div>
//             )}
//             <DialogFooter className="gap-2">
//               <button onClick={() => setDeleteOpen(false)}
//                 className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55
//                            border border-white/[0.09] hover:text-white/85 hover:border-white/20 transition-all duration-200">
//                 Cancel
//               </button>
//               <button ref={deleteButtonRef} onClick={() => void handleDeleteQuestion()}
//                 className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2
//                            text-[#12131a] bg-red-400 hover:opacity-85 transition-all duration-200
//                            [box-shadow:0_0_20px_rgba(248,113,113,0.25)]">
//                 Delete
//               </button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* ── Sub-dialogs (unchanged logic) ── */}
//         <OptionEditorDialog
//           open={optionEditorOpen} mode={optionEditorMode} formData={optionFormData}
//           locale={optionLocale} editingOption={editingOption} isLoading={isLoading}
//           languages={languageList} primaryCode={primaryCode}
//           onOpenChange={setOptionEditorOpen} onFormDataChange={setOptionFormData}
//           onLocaleChange={setOptionLocale} onSave={handleSaveOption}
//           onUploadImage={async (file) => { if (!editingOption) return; await uploadOptionImage(editingOption.id, file); await refreshSelectedQuestion() }}
//           onDeleteImage={async () => { if (!editingOption) return; await deleteOptionImage(editingOption.id); await refreshSelectedQuestion() }}
//         />
//         <TipEditorDialog
//           open={tipEditorOpen} mode={tipEditorMode} formData={tipFormData}
//           displayOrder={tipDisplayOrder}
//           locale={tipLocale} isLoading={isLoading}
//           assets={tipFormAssets} existingAssets={tipExistingAssets}
//           languages={languageList}
//           onOpenChange={setTipEditorOpen} onFormDataChange={setTipFormData}
//           onDisplayOrderChange={setTipDisplayOrder}
//           onLocaleChange={setTipLocale} onAssetsChange={setTipFormAssets}
//           onDeleteExistingAsset={async (assetUrl) => {
//             if (!editingTip) return
//             try {
//               await deleteTipAsset(editingTip.id, assetUrl)
//               setTipExistingAssets(prev => prev.filter(a => a.url !== assetUrl))
//               await refreshSelectedQuestion()
//               setFeedback({ type: 'success', message: 'Asset deleted.' })
//             } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to delete asset.') }) }
//           }}
//           onSave={handleSaveTip}
//         />
//         <ExplanationEditorDialog
//           open={explanationEditorOpen} formData={explanationFormData}
//           locale={explanationLocale} assets={explanationFormAssets}
//           isLoading={isLoading} hasExisting={!!currentExplanation}
//           languages={languageList}
//           onOpenChange={setExplanationEditorOpen} onFormDataChange={setExplanationFormData}
//           onLocaleChange={setExplanationLocale} onAssetsChange={setExplanationFormAssets}
//           onSave={handleSaveExplanationFromDialog}
//         />
//       </div>
//     </>
//   )
// }



"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import api from '@/lib/api/client'
import { useAuthStore } from '@/lib/store'
import { useAdminStore } from '@/lib/store/admin-store'
import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store'
import type {
  AdminQuestion, QuestionOption, QuestionTip, QuestionExplanation, QuestionAsset,
  CreateQuestionRequest, UpdateQuestionRequest, AddExplanationRequest,
  UpdateExplanationRequest, AddTipRequest, UpdateTipRequest, UpdateOptionRequest,
  AdminCategory, PaginatedResponse,
} from '@/lib/types/admin'
import type { ApiResponse } from '@/lib/types'
import {
  AlertCircle, Check, CheckCircle2, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  Edit, Film, FileText, FileUp, Globe2, GripVertical, Hash, ImageIcon, Info,
  Loader2, Plus, Search, Sparkles, Trash2, Upload, XCircle, SlidersHorizontal,
  BookOpen, Lightbulb, MessageSquare,
} from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { OptionEditorDialog } from './option-editor-dialog'
import { TipEditorDialog } from './tip-editor-dialog'
import { ExplanationEditorDialog } from './explanation-editor-dialog'
import { getAssetUrl, isImageAsset, isVideoAsset } from '@/lib/utils/asset-url'

// ── Types ─────────────────────────────────────────────────────────────────────
type AssetType  = 'image' | 'video' | 'document' | 'diagram' | 'illustration' | 'question_image'

interface OptionFormState {
  id?: number; text: string; isCorrect: boolean; position: number
  translations: Record<string, string>; assetFile?: File | null
}

interface AssetDraft { file: File; type: AssetType; alt: string; caption: string }

interface QuestionFormState {
  jurisdictionId: number; categoryId?: number; question: string
  translations: Record<string, string>; active: boolean; assets: AssetDraft[]; variantId?: number | null
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (to < 0 || to >= items.length || from === to) return items
  const clone = [...items]; const [moved] = clone.splice(from, 1); clone.splice(to, 0, moved); return clone
}

function LocalAssetPreview({ file }: { file: File }) {
  const url = useMemo(() => URL.createObjectURL(file), [file])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  if (file.type.startsWith('image/')) return <img src={url} alt={file.name} className="h-20 w-full rounded-lg object-cover" />
  if (file.type.startsWith('video/')) return <video controls className="h-20 w-full rounded-lg object-cover"><source src={url} type={file.type} /></video>
  return (
    <div className="flex h-20 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03]">
      {file.type.includes('pdf') || file.type.includes('document')
        ? <FileText size={20} className="text-white/30" />
        : <Film       size={20} className="text-white/30" />}
    </div>
  )
}

const emptyLocaleText = (): Record<string, string> => ({})
const createBlankOption = (pos: number): OptionFormState => ({ text: '', isCorrect: false, position: pos, translations: emptyLocaleText(), assetFile: null })
const createInitialForm = (): QuestionFormState => ({ jurisdictionId: 0, categoryId: undefined, question: '', translations: emptyLocaleText(), active: true, assets: [], variantId: null })

function mapQuestionToForm(q: AdminQuestion): QuestionFormState {
  const translations: Record<string, string> = {}
  if (q.translations) {
    for (const [code, fields] of Object.entries(q.translations)) {
      translations[code] = (fields as any)?.question ?? ''
    }
  }
  return { jurisdictionId: q.jurisdictionId, categoryId: q.categoryId, question: q.question, translations, active: q.active, assets: [], variantId: q.variantId ?? null }
}

function buildQuestionTranslations(input: Record<string, string>, primaryCode: string) {
  const result: Record<string, { question: string }> = {}
  for (const [code, value] of Object.entries(input)) {
    if (code === primaryCode || value.trim()) result[code] = { question: value }
  }
  return result
}
function buildOptionTranslations(input: Record<string, string>, primaryCode: string) {
  const result: Record<string, { text: string }> = {}
  for (const [code, value] of Object.entries(input)) {
    if (code === primaryCode || value.trim()) result[code] = { text: value }
  }
  return result
}
function buildTipTranslations(input: Record<string, string>, primaryCode: string) {
  const t: Record<string, { tip: string }> = {}
  for (const [code, value] of Object.entries(input)) {
    if (code !== primaryCode && value.trim()) t[code] = { tip: value }
  }
  return Object.keys(t).length > 0 ? t : undefined
}
function buildExplanationTranslations(input: Record<string, string>, primaryCode: string) {
  const result: Record<string, { text: string }> = {}
  for (const [code, value] of Object.entries(input)) {
    if (code === primaryCode || value.trim()) result[code] = { text: value }
  }
  return result
}
function validateFiles(files: File[]): string | null {
  const allowed = ['image/jpeg','image/png','image/gif','image/webp','image/svg+xml','video/mp4','video/webm','video/ogg','application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document']
  for (const f of files) {
    if (!allowed.includes(f.type)) return `Unsupported file type: ${f.name}`
    if (f.size > 50 * 1024 * 1024) return `File too large (max 10MB): ${f.name}`
  }
  return null
}
function getErrorMessage(err: unknown, fallback: string): string {
  const r = (err as { response?: { data?: { message?: unknown } } }).response
  if (typeof r?.data?.message === 'string' && r.data.message.trim()) return r.data.message
  return fallback
}

// ── Shared UI atoms ───────────────────────────────────────────────────────────
const selectClass = `
  w-full h-10 px-3 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200
  [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]
`
const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 placeholder:text-white/20
`
const textareaClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 resize-none
`

function SectionBlock({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string
  icon?: React.ElementType
  children: React.ReactNode
  action?: React.ReactNode
}) {
  return (
    <div className="w-full max-w-full min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0 min-w-fit">
          {Icon && <Icon size={13} className="text-white/30" />}
          <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium whitespace-nowrap">
            {title}
          </h4>
        </div>

        {action && (
          <div className="flex-1 min-w-0 max-w-full overflow-hidden">
            {action}
          </div>
        )}
      </div>

      <div className="px-5 py-4 w-full max-w-full min-w-0 overflow-x-hidden">
        {children}
      </div>
    </div>
  )
}

function LocaleToggle({
  active,
  onChange,
  languages,
}: {
  active: string
  onChange: (c: string) => void
  languages: { code: string; label: string; direction?: string }[]
}) {
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">
      <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <div className="inline-flex w-max min-w-max items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl">
          {languages.map(({ code, label }) => (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                ${
                  active === code
                    ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
                    : 'text-white/35 hover:text-white/70'
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function ActionBtn({ onClick, title, variant = 'ghost', children }: {
  onClick: () => void; title?: string; variant?: 'ghost' | 'danger' | 'outline'; children: React.ReactNode
}) {
  const cls = {
    ghost:   'text-white/30 hover:text-white/70 hover:bg-white/[0.07]',
    danger:  'text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]',
    outline: 'text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20',
  }[variant]
  return (
    <button type="button" onClick={onClick} title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${cls}`}>
      {children}
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QuestionsPage() {
  const {
    questions, licenceCategories, jurisdictions, categories, isLoading, error, clearError,
    fetchQuestions, searchQuestionsByText, fetchQuestion, fetchCategories, fetchJurisdictions, fetchLicenceCategories,
    createQuestion, updateQuestion, deleteQuestion, uploadQuestionAssets, deleteQuestionAsset,
    addOption, updateOption, deleteOption, uploadOptionImage, deleteOptionImage,
    createExplanation, fetchExplanationByQuestion, updateExplanation, deleteExplanation,
    uploadExplanationAssets, deleteExplanationAsset, addTip, updateTip, deleteTip, fetchTipsByQuestion,
    uploadTipAssets, deleteTipAsset,
  } = useAdminStore()

  const { user } = useAuthStore()
  const isAdmin = user?.role === 'admin'

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
      isPrimary: jl.isPrimary,
      direction: jl.language.direction,
    }))

  const primaryCode = languageList.find(l => l.isPrimary)?.code ?? languageList[0]?.code ?? 'en'

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchById,               setSearchById]               = useState('')
  const [searchByText,             setSearchByText]             = useState('')
  const [search,                   setSearch]                   = useState('')

  // ── Filter state ────────────────────────────────────────────────────────────
  const [filterCategoryId,         setFilterCategoryId]         = useState<number | ''>('')
  const [filterJurisdictionId,     setFilterJurisdictionId]     = useState<number | ''>('')
  const [filterLicenceCategoryId,  setFilterLicenceCategoryId]  = useState<number | ''>('')
  const [filterActive,             setFilterActive]             = useState<boolean | ''>('')
  const [currentPage,              setCurrentPage]              = useState(0)
  const [listLang,                 setListLang]                 = useState<string>('')
  const pageSize = 10

  // ── Form state ──────────────────────────────────────────────────────────────
  const [questionForm,    setQuestionForm]    = useState<QuestionFormState>(createInitialForm())
  const [questionLocale,  setQuestionLocale]  = useState<string>('')
  const [formMode,        setFormMode]        = useState<'create' | 'edit'>('create')
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestion | null>(null)
  const [formOpen,        setFormOpen]        = useState(false)
  const [variantSearchTerm,    setVariantSearchTerm]    = useState('')
  const [variantSearchResults, setVariantSearchResults] = useState<AdminQuestion[]>([])
  const [variantPreview,       setVariantPreview]       = useState<AdminQuestion | null>(null)
  const [variantLookupError,   setVariantLookupError]   = useState<string | null>(null)
  const [variantLookupLoading, setVariantLookupLoading] = useState(false)

  // ── Details state ───────────────────────────────────────────────────────────
  const [detailsOpen,          setDetailsOpen]          = useState(false)
  const [detailsLang,          setDetailsLang]          = useState<string>('')
  const [selectedQuestion,     setSelectedQuestion]     = useState<AdminQuestion | null>(null)
  const [currentExplanation,   setCurrentExplanation]   = useState<QuestionExplanation | null>(null)
  const [explanationLocale,    setExplanationLocale]    = useState<string>('')
  const [tipLocale,            setTipLocale]            = useState<string>('')
  const [newOptionDraft,       setNewOptionDraft]       = useState<OptionFormState>(createBlankOption(1))
  const [explanationDraft,     setExplanationDraft]     = useState<Record<string, string>>(emptyLocaleText())
  const [tipDraft,             setTipDraft]             = useState<Record<string, string>>(emptyLocaleText())
  const [explanationAssetDrafts, setExplanationAssetDrafts] = useState<AssetDraft[]>([])
  const [tipFormAssets,        setTipFormAssets]        = useState<AssetDraft[]>([])
  const [tipExistingAssets,    setTipExistingAssets]    = useState<QuestionAsset[]>([])

  // ── Option editor ───────────────────────────────────────────────────────────
  const [optionEditorOpen,  setOptionEditorOpen]  = useState(false)
  const [optionEditorMode,  setOptionEditorMode]  = useState<'create' | 'edit'>('create')
  const [editingOption,     setEditingOption]     = useState<QuestionOption | null>(null)
  const [optionFormData,    setOptionFormData]    = useState<OptionFormState>(createBlankOption(1))
  const [optionLocale,      setOptionLocale]      = useState<string>('')

  // ── Tip editor ──────────────────────────────────────────────────────────────
  const [tipEditorOpen,      setTipEditorOpen]      = useState(false)
  const [tipEditorMode,      setTipEditorMode]      = useState<'create' | 'edit'>('create')
  const [editingTip,         setEditingTip]         = useState<QuestionTip | null>(null)
  const [tipFormData,        setTipFormData]        = useState<Record<string, string>>(emptyLocaleText())
  const [tipDisplayOrder,     setTipDisplayOrder]     = useState<number>(0)

  // ── Explanation editor ──────────────────────────────────────────────────────
  const [explanationEditorOpen,   setExplanationEditorOpen]   = useState(false)
  const [explanationFormData,     setExplanationFormData]     = useState<Record<string, string>>(emptyLocaleText())
  const [explanationFormAssets,   setExplanationFormAssets]   = useState<AssetDraft[]>([])

  // ── Delete dialog ───────────────────────────────────────────────────────────
  const [deleteOpen,        setDeleteOpen]        = useState(false)
  const [questionToDelete,  setQuestionToDelete]  = useState<AdminQuestion | null>(null)

  // ── Misc ────────────────────────────────────────────────────────────────────
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [draggingQuestionAssetIndex,    setDraggingQuestionAssetIndex]    = useState<number | null>(null)
  const [draggingExplanationAssetIndex, setDraggingExplanationAssetIndex] = useState<number | null>(null)
  const [formCategories,                setFormCategories]                = useState<AdminCategory[]>([])

  const questionPrimaryRef = useRef<HTMLTextAreaElement | null>(null)
  const detailsPrimaryRef  = useRef<HTMLTextAreaElement | null>(null)
  const deleteButtonRef    = useRef<HTMLButtonElement | null>(null)

  // ── Data loading ────────────────────────────────────────────────────────────
  function buildFilterParams(page: number): Record<string, string | number | boolean> {
    const params: Record<string, string | number | boolean> = { page, size: pageSize }
    if (filterCategoryId !== '')        params.categoryId        = filterCategoryId
    if (filterJurisdictionId !== '')    params.jurisdictionId    = filterJurisdictionId
    if (filterLicenceCategoryId !== '') params.licenceCategoryId = filterLicenceCategoryId
    if (filterActive !== '')            params.active            = filterActive
    return params
  }

  async function loadQuestions() {
    await fetchQuestions(buildFilterParams(currentPage))
  }

  const handleFetchQuestions = async () => {
    setCurrentPage(0)
    await fetchQuestions(buildFilterParams(0))
  }

  const handleSearchById = async () => {
    const id = Number(searchById.trim())
    if (!id || isNaN(id)) { setFeedback({ type: 'error', message: 'Please enter a valid question ID.' }); return }
    try {
      const q = await fetchQuestion(id)
      await openDetailsDialog(q)
    } catch { setFeedback({ type: 'error', message: `Question with ID ${id} not found.` }) }
  }

  const handleSearchByText = async () => {
    const text = searchByText.trim()
    if (text.length < 2) { setFeedback({ type: 'error', message: 'Please enter at least 2 characters to search.' }); return }
    setCurrentPage(0)
    try {
      await searchQuestionsByText(text, { page: 0, size: pageSize })
    } catch { /* error is set by the store */ }
  }

  const resetVariantState = () => {
    setVariantPreview(null)
    setVariantSearchResults([])
    setVariantSearchTerm('')
    setVariantLookupError(null)
    setVariantLookupLoading(false)
  }

  const loadVariantPreview = async (id?: number | null, currentQuestionId?: number) => {
    if (id === undefined || id === null) { resetVariantState(); return }
    if (Number.isNaN(id) || id <= 0) { setVariantLookupError('Original question ID must be a positive number.'); setVariantPreview(null); return }
    if ((currentQuestionId ?? editingQuestion?.id) && id === (currentQuestionId ?? editingQuestion?.id)) {
      setVariantLookupError('A question cannot be a variant of itself.')
      setVariantPreview(null)
      return
    }
    setVariantLookupLoading(true)
    setVariantLookupError(null)
    try {
      const response = await api.get<ApiResponse<AdminQuestion>>(`/api/v1/admin/questions/${id}`)
      setVariantPreview(response.data.data)
      setQuestionForm((prev) => ({ ...prev, variantId: response.data.data.id }))
    } catch (err) {
      setVariantPreview(null)
      setVariantLookupError(getErrorMessage(err, 'Original question not found.'))
    } finally {
      setVariantLookupLoading(false)
    }
  }

  const handleVariantSearch = async () => {
    const term = variantSearchTerm.trim()
    if (term.length < 2) { setVariantLookupError('Enter at least 2 characters to search.'); setVariantSearchResults([]); return }
    setVariantLookupLoading(true)
    setVariantLookupError(null)
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<AdminQuestion>>>(
        '/api/v1/admin/questions/search',
        { params: { text: term, size: 5 } }
      )
      const content = response.data.data?.content ?? []
      const filtered = content.filter((q) => q.id !== editingQuestion?.id)
      setVariantSearchResults(filtered)
    } catch (err) {
      setVariantLookupError(getErrorMessage(err, 'Failed to search questions.'))
      setVariantSearchResults([])
    } finally {
      setVariantLookupLoading(false)
    }
  }

  const handleSelectVariant = (q: AdminQuestion) => {
    if (editingQuestion?.id && q.id === editingQuestion.id) {
      setVariantLookupError('A question cannot be a variant of itself.')
      return
    }
    setQuestionForm((prev) => ({ ...prev, variantId: q.id }))
    setVariantPreview(q)
    setVariantLookupError(null)
  }

  const handleClearVariant = () => {
    setQuestionForm((prev) => ({ ...prev, variantId: null }))
    resetVariantState()
  }

  const filteredQuestions = useMemo(
    () => (questions?.content ?? []).filter((q) => {
      if (!search.trim()) return true
      const s = search.toLowerCase()
      return q.question.toLowerCase().includes(s) || String(q.id).includes(s)
    }),
    [questions, search]
  )

  useEffect(() => {
    void Promise.all([fetchJurisdictions(), fetchLicenceCategories({ page: 0, size: 200 })])
  }, [fetchJurisdictions, fetchLicenceCategories])

  useEffect(() => {
    const saved = localStorage.getItem('backoffice-questions-filters')
    if (saved) {
      try {
        const f = JSON.parse(saved)
        if (f.filterCategoryId        !== undefined) setFilterCategoryId(f.filterCategoryId)
        if (f.filterJurisdictionId    !== undefined) setFilterJurisdictionId(f.filterJurisdictionId)
        if (f.filterLicenceCategoryId !== undefined) setFilterLicenceCategoryId(f.filterLicenceCategoryId)
        if (f.filterActive            !== undefined) setFilterActive(f.filterActive)
      } catch (e) { console.error('Failed to parse saved filters:', e) }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('backoffice-questions-filters', JSON.stringify({ filterCategoryId, filterJurisdictionId, filterLicenceCategoryId, filterActive }))
  }, [filterCategoryId, filterJurisdictionId, filterLicenceCategoryId, filterActive])

  useEffect(() => { if (questions && currentPage > 0) void loadQuestions() }, [currentPage])

  useEffect(() => { if (!formOpen)    return; const t = window.setTimeout(() => questionPrimaryRef.current?.focus(), 30); return () => clearTimeout(t) }, [formOpen])
  useEffect(() => { if (!detailsOpen) return; const t = window.setTimeout(() => detailsPrimaryRef.current?.focus(),  30); return () => clearTimeout(t) }, [detailsOpen])
  useEffect(() => { if (!deleteOpen)  return; const t = window.setTimeout(() => deleteButtonRef.current?.focus(),    30); return () => clearTimeout(t) }, [deleteOpen])

  // Fetch categories when filter jurisdiction changes
  useEffect(() => {
    if (filterJurisdictionId !== '') {
      void fetchCategories(filterJurisdictionId)
    } else {
      void fetchCategories()
    }
  }, [filterJurisdictionId, fetchCategories])

  // Fetch languages when jurisdiction changes in create dialog
  const handleJurisdictionChange = useCallback((jurisdictionId: number) => {
    setQuestionForm(p => ({ ...p, jurisdictionId, categoryId: undefined, translations: {} }))
    if (jurisdictionId) {
      void fetchAdminJurisdictionLanguages(jurisdictionId)
      fetchCategories(jurisdictionId).then(() => {
        const cats = useAdminStore.getState().categories
        setFormCategories(cats)
      }).catch(() => setFormCategories([]))
    } else {
      setFormCategories([])
    }
  }, [fetchAdminJurisdictionLanguages, fetchCategories])

  // Set default locale tab when languages load
  useEffect(() => {
    if (primaryCode && !questionLocale) setQuestionLocale(primaryCode)
  }, [primaryCode, questionLocale])

  // ── Dialog openers ──────────────────────────────────────────────────────────
  const openCreateDialog = () => {
    setFormMode('create'); setEditingQuestion(null); setQuestionLocale(''); setQuestionForm(createInitialForm()); setFormCategories([]); resetVariantState(); setFormOpen(true)
  }

  const openEditDialog = async (q: AdminQuestion) => {
    const full = await fetchQuestion(q.id)
    void fetchAdminJurisdictionLanguages(full.jurisdictionId)
    try {
      await fetchCategories(full.jurisdictionId)
      setFormCategories(useAdminStore.getState().categories)
    } catch { setFormCategories([]) }
    setFormMode('edit'); setEditingQuestion(full); setQuestionLocale(''); setQuestionForm(mapQuestionToForm(full)); setFormOpen(true)
    if (full.variantId) {
      void loadVariantPreview(full.variantId, full.id)
    } else {
      resetVariantState()
    }
  }

  const openDetailsDialog = async (q: AdminQuestion) => {
    const full = await fetchQuestion(q.id)
    void fetchAdminJurisdictionLanguages(full.jurisdictionId)
    try { const tips = await fetchTipsByQuestion(full.id); full.tips = tips } catch { full.tips = [] }
    setSelectedQuestion(full)
    setNewOptionDraft(createBlankOption(Math.max(1, full.options.length + 1)))
    setTipDraft(emptyLocaleText()); setExplanationDraft(emptyLocaleText()); setExplanationAssetDrafts([])
    try {
      const exp = await fetchExplanationByQuestion(full.id)
      setCurrentExplanation(exp)
      const expDraft: Record<string, string> = {}
      if (exp.translations) {
        for (const [code, fields] of Object.entries(exp.translations)) {
          expDraft[code] = (fields as any)?.text ?? (fields as any)?.explanation ?? ''
        }
      }
      if (!expDraft[primaryCode]) expDraft[primaryCode] = exp.text ?? exp.explanation ?? ''
      setExplanationDraft(expDraft)
    } catch { setCurrentExplanation(null) }
    setDetailsLang(primaryCode)
    setDetailsOpen(true)
  }

  // ── Asset helpers ───────────────────────────────────────────────────────────
  const appendQuestionAssets = (files: File[]) => {
    const err = validateFiles(files)
    if (err) { setFeedback({ type: 'error', message: err }); return }
    setQuestionForm((prev) => ({ ...prev, assets: [...prev.assets, ...files.map((f) => ({ file: f, type: '' as AssetType, alt: '', caption: '' }))] }))
  }

  const appendExplanationAssets = (files: File[]) => {
    const err = validateFiles(files)
    if (err) { setFeedback({ type: 'error', message: err }); return }
    setExplanationAssetDrafts((prev) => [...prev, ...files.map((f) => ({ file: f, type: 'image' as AssetType, alt: '', caption: '' }))])
  }

  // ── Save / delete handlers ──────────────────────────────────────────────────
  const validateQuestionForm = () => {
    if (!questionForm.jurisdictionId) return 'Jurisdiction is required.'
    if (!questionForm.question.trim() || questionForm.question.trim().length < 10) return 'Question text must be at least 10 characters.'
    if (questionForm.assets.some(a => !a.type)) return 'Please select a type for every asset.'
    if (questionForm.variantId !== undefined && questionForm.variantId !== null) {
      if (Number.isNaN(questionForm.variantId) || questionForm.variantId <= 0) return 'Original question ID must be a positive number.'
      if (editingQuestion?.id && questionForm.variantId === editingQuestion.id) return 'A question cannot be a variant of itself.'
    }
    return null
  }

  const handleSaveQuestion = async () => {
    const validationError = validateQuestionForm()
    if (validationError) { setFeedback({ type: 'error', message: validationError }); return }
    try {
      let questionId: number; let createdQuestion: AdminQuestion | null = null
      const transInput = { ...questionForm.translations, [primaryCode]: questionForm.translations[primaryCode] || questionForm.question }
      if (formMode === 'create') {
        const payload: CreateQuestionRequest = {
          jurisdictionId: questionForm.jurisdictionId,
          categoryId: questionForm.categoryId,
          question: questionForm.question,
          translations: buildQuestionTranslations(transInput, primaryCode),
          active: questionForm.active,
          variantId: questionForm.variantId ?? null,
        }
        const created = await createQuestion(payload); questionId = created.id; createdQuestion = created
      } else {
        if (!editingQuestion) return
        await updateQuestion(editingQuestion.id, {
          jurisdictionId: questionForm.jurisdictionId,
          categoryId: questionForm.categoryId,
          question: questionForm.question,
          translations: buildQuestionTranslations(transInput, primaryCode),
          active: questionForm.active,
          variantId: questionForm.variantId ?? null,
        })
        questionId = editingQuestion.id
      }
      if (questionForm.assets.length > 0) await uploadQuestionAssets(questionId, questionForm.assets.map((a) => a.file), { assetTypes: questionForm.assets.map((a) => a.type), alts: questionForm.assets.map((a) => a.alt), captions: questionForm.assets.map((a) => a.caption) })
      await loadQuestions(); setFormOpen(false)
      setFeedback({ type: 'success', message: formMode === 'create' ? 'Question created. Continue in details to add options, explanation, and tips.' : 'Question updated successfully.' })
      if (formMode === 'create' && createdQuestion) await openDetailsDialog(createdQuestion)
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save question.') }) }
  }

  const handleDeleteQuestion = async () => {
    if (!isAdmin || !questionToDelete) return
    try { await deleteQuestion(questionToDelete.id); setDeleteOpen(false); setQuestionToDelete(null); await loadQuestions(); setFeedback({ type: 'success', message: 'Question deleted successfully.' }) }
    catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to delete question.') }) }
  }

  const refreshSelectedQuestion = async () => {
    if (!selectedQuestion) return
    const refreshed = await fetchQuestion(selectedQuestion.id)
    try { const tips = await fetchTipsByQuestion(refreshed.id); refreshed.tips = tips } catch { refreshed.tips = [] }
    setSelectedQuestion(refreshed)
  }

  const handleSaveExplanation = async () => {
    if (!selectedQuestion) return
    const text = (explanationDraft[primaryCode] ?? '').trim()
    if (text.length < 20) { setFeedback({ type: 'error', message: 'Explanation text must be at least 20 characters.' }); return }
    try {
      let explanationId = currentExplanation?.id
      if (currentExplanation) { await updateExplanation(currentExplanation.id, { text, translations: buildExplanationTranslations(explanationDraft, primaryCode) }) }
      else { const c = await createExplanation({ questionId: selectedQuestion.id, text, translations: buildExplanationTranslations(explanationDraft, primaryCode) }); explanationId = c.id }
      if (explanationId && explanationAssetDrafts.length > 0) await uploadExplanationAssets(explanationId, explanationAssetDrafts.map((a) => a.file), { assetTypes: explanationAssetDrafts.map((a) => a.type), alts: explanationAssetDrafts.map((a) => a.alt), captions: explanationAssetDrafts.map((a) => a.caption) })
      setCurrentExplanation(await fetchExplanationByQuestion(selectedQuestion.id)); setExplanationAssetDrafts([])
      setFeedback({ type: 'success', message: 'Explanation saved.' })
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save explanation.') }) }
  }

  const handleAddTip = async () => {
    if (!selectedQuestion) return
    const tip = (tipDraft[primaryCode] ?? '').trim()
    if (tip.length < 10) { setFeedback({ type: 'error', message: 'Tip must be at least 10 characters.' }); return }
    try { await addTip(selectedQuestion.id, { tip, translations: buildTipTranslations(tipDraft, primaryCode) }); await refreshSelectedQuestion(); setTipDraft(emptyLocaleText()); setFeedback({ type: 'success', message: 'Tip added.' }) }
    catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to add tip.') }) }
  }

  const handleAddOptionInDetails = async () => {
    if (!selectedQuestion) return
    if (!newOptionDraft.text.trim()) { setFeedback({ type: 'error', message: 'Option text is required.' }); return }
    try {
      const optTransInput = { ...newOptionDraft.translations, [primaryCode]: newOptionDraft.translations[primaryCode] || newOptionDraft.text }
      await addOption(selectedQuestion.id, { text: newOptionDraft.text, isCorrect: newOptionDraft.isCorrect, position: newOptionDraft.position, translations: buildOptionTranslations(optTransInput, primaryCode) })
      await refreshSelectedQuestion()
      setNewOptionDraft(createBlankOption((selectedQuestion.options?.length ?? 0) + 1))
      setFeedback({ type: 'success', message: 'Option added.' })
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to add option.') }) }
  }

  const handleUpdateOptionInDetails = async (option: QuestionOption) => {
    try {
      await updateOption(option.id, { text: option.text, isCorrect: option.isCorrect, position: option.position, translations: option.translations })
      await refreshSelectedQuestion()
      setFeedback({ type: 'success', message: 'Option updated.' })
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to update option.') }) }
  }

  const openOptionCreateDialog = () => {
    if (!selectedQuestion) return
    setOptionEditorMode('create'); setEditingOption(null); setOptionFormData(createBlankOption(Math.max(1, selectedQuestion.options.length + 1))); setOptionLocale(primaryCode); setOptionEditorOpen(true)
  }

  const openOptionEditDialog = (option: QuestionOption) => {
    setOptionEditorMode('edit'); setEditingOption(option)
    const optTrans: Record<string, string> = {}
    if (option.translations) {
      for (const [code, fields] of Object.entries(option.translations)) {
        optTrans[code] = (fields as any)?.text ?? ''
      }
    }
    if (!optTrans[primaryCode]) optTrans[primaryCode] = option.text
    setOptionFormData({ text: option.text, isCorrect: option.isCorrect, position: option.position, translations: optTrans, assetFile: null })
    setOptionLocale(primaryCode); setOptionEditorOpen(true)
  }

  const handleSaveOption = async () => {
    if (!selectedQuestion) return
    if (optionEditorMode === 'create' && !optionFormData.text.trim() && !optionFormData.assetFile) { setFeedback({ type: 'error', message: 'Either option text or asset must be provided.' }); return }
    try {
      let optionId: number | undefined
      if (optionEditorMode === 'create') {
        const created = await addOption(selectedQuestion.id, { text: optionFormData.text || ' ', isCorrect: optionFormData.isCorrect, position: optionFormData.position, translations: buildOptionTranslations(optionFormData.translations, primaryCode) }, optionFormData.assetFile || undefined)
        optionId = created.options.find((o) => o.position === optionFormData.position)?.id
        setFeedback({ type: 'success', message: 'Option created.' })
      } else if (editingOption) {
        const payload: UpdateOptionRequest = {}
        if (optionFormData.text !== editingOption.text) payload.text = optionFormData.text || ' '
        if (optionFormData.isCorrect !== editingOption.isCorrect) payload.isCorrect = optionFormData.isCorrect
        if (optionFormData.position !== editingOption.position) payload.position = optionFormData.position
        const newTrans = buildOptionTranslations(optionFormData.translations, primaryCode)
        if (JSON.stringify(newTrans) !== JSON.stringify(editingOption.translations)) payload.translations = newTrans
        if (Object.keys(payload).length > 0) await updateOption(editingOption.id, payload)
        optionId = editingOption.id
        if (optionFormData.assetFile && optionId) await uploadOptionImage(optionId, optionFormData.assetFile)
        setFeedback({ type: 'success', message: 'Option updated.' })
      }
      await refreshSelectedQuestion(); setOptionEditorOpen(false)
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save option.') }) }
  }

  const openTipCreateDialog = () => { setTipEditorMode('create'); setEditingTip(null); setTipFormData(emptyLocaleText()); setTipDisplayOrder(0); setTipFormAssets([]); setTipExistingAssets([]); setTipLocale(primaryCode); setTipEditorOpen(true) }
  const openTipEditDialog = (tip: QuestionTip) => {
    setTipEditorMode('edit'); setEditingTip(tip); setTipLocale(primaryCode)
    const tipTrans: Record<string, string> = {}
    if (tip.translations) {
      for (const [code, fields] of Object.entries(tip.translations)) {
        tipTrans[code] = (fields as any)?.tip ?? ''
      }
    }
    if (!tipTrans[primaryCode]) tipTrans[primaryCode] = tip.body
    setTipFormData(tipTrans)
    setTipFormAssets([])
    setTipExistingAssets(tip.assets ?? [])
    setTipDisplayOrder((tip as any).displayOrder ?? 0)
    setTipEditorOpen(true)
  }

  const handleSaveTip = async () => {
    if (!selectedQuestion) return
    const tip = (tipFormData[primaryCode] ?? '').trim()
    if (tip.length < 10) { setFeedback({ type: 'error', message: 'Tip must be at least 10 characters.' }); return }
    try {
      let tipId: number | undefined
      if (tipEditorMode === 'create') {
        await addTip(selectedQuestion.id, { tip, displayOrder: tipDisplayOrder, translations: buildTipTranslations(tipFormData, primaryCode) })
        // Backend returns data:null, so fetch tips to find the newly created one
        if (tipFormAssets.length > 0) {
          const tips = await fetchTipsByQuestion(selectedQuestion.id)
          const newest = tips.length > 0 ? tips.reduce((a: any, b: any) => (new Date(b.createdAt) > new Date(a.createdAt) ? b : a)) : null
          tipId = newest?.id
        }
      } else if (editingTip) {
        await updateTip(editingTip.id, { tip, displayOrder: tipDisplayOrder, translations: buildTipTranslations(tipFormData, primaryCode) })
        tipId = editingTip.id
      }
      // Upload new assets if any
      if (tipId && tipFormAssets.length > 0) {
        await uploadTipAssets(tipId, tipFormAssets.map(a => a.file), {
          assetTypes: tipFormAssets.map(a => a.type),
          alts: tipFormAssets.map(a => a.alt),
          captions: tipFormAssets.map(a => a.caption),
        })
      }
      await refreshSelectedQuestion(); setTipEditorOpen(false)
      setFeedback({ type: 'success', message: tipEditorMode === 'create' ? 'Tip created.' : 'Tip updated.' })
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save tip.') }) }
  }

  const openExplanationDialog = () => {
    if (currentExplanation) {
      const expTrans: Record<string, string> = {}
      if (currentExplanation.translations) {
        for (const [code, fields] of Object.entries(currentExplanation.translations)) {
          expTrans[code] = (fields as any)?.text ?? (fields as any)?.explanation ?? ''
        }
      }
      if (!expTrans[primaryCode]) expTrans[primaryCode] = currentExplanation.text ?? currentExplanation.explanation ?? ''
      setExplanationFormData(expTrans)
    } else {
      setExplanationFormData(emptyLocaleText())
    }
    setExplanationFormAssets([]); setExplanationLocale(primaryCode); setExplanationEditorOpen(true)
  }

  const handleSaveExplanationFromDialog = async () => {
    if (!selectedQuestion) return
    const text = (explanationFormData[primaryCode] ?? '').trim()
    if (text.length < 20) { setFeedback({ type: 'error', message: 'Explanation text must be at least 20 characters.' }); return }
    try {
      let explanationId = currentExplanation?.id
      if (currentExplanation) await updateExplanation(currentExplanation.id, { text, translations: buildExplanationTranslations(explanationFormData, primaryCode) })
      else { const c = await createExplanation({ questionId: selectedQuestion.id, text, translations: buildExplanationTranslations(explanationFormData, primaryCode) }); explanationId = c.id }
      if (explanationId && explanationFormAssets.length > 0) await uploadExplanationAssets(explanationId, explanationFormAssets.map((a) => a.file), { assetTypes: explanationFormAssets.map((a) => a.type), alts: explanationFormAssets.map((a) => a.alt), captions: explanationFormAssets.map((a) => a.caption) })
      setCurrentExplanation(await fetchExplanationByQuestion(selectedQuestion.id)); setExplanationEditorOpen(false)
      setFeedback({ type: 'success', message: currentExplanation ? 'Explanation updated.' : 'Explanation created.' })
    } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to save explanation.') }) }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .delay-1 { animation-delay: 0.07s; }
        .delay-2 { animation-delay: 0.14s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-6 pb-10">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/[0.12]
                        bg-emerald-300/[0.04] px-6 py-5 animate-fade-up">
          {/* Glow blobs */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/[0.08] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-14 left-16 h-48 w-48 rounded-full bg-sky-300/[0.06] blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                              bg-emerald-300/10 border border-emerald-300/20 mb-3">
                <Sparkles size={11} className="text-emerald-300" />
                <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
                  Admin Question Studio
                </span>
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Questions</h1>
              <p className="text-sm text-white/40 font-light mt-1">
                Full management for questions, options, explanations, tips, assets, and translations.
              </p>
            </div>
            {isAdmin && (
              <button onClick={openCreateDialog}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                           text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                           [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
                <Plus size={15} /> Create Question
              </button>
            )}
          </div>
        </div>

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`flex items-start gap-2.5 px-4 py-3.5 rounded-xl border animate-fade-up
            ${feedback.type === 'success'
              ? 'bg-emerald-300/[0.07] border-emerald-300/20 text-emerald-300/80'
              : 'bg-red-400/[0.07] border-red-400/20 text-red-400/80'}`}>
            {feedback.type === 'success'
              ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-300" />
              : <AlertCircle  size={14} className="shrink-0 mt-0.5 text-red-400" />}
            <span className="text-sm font-light flex-1">{feedback.message}</span>
            <button onClick={() => setFeedback(null)}
              className="text-xs text-white/25 underline hover:text-white/50 transition-colors shrink-0">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Store error ── */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl border
                          bg-red-400/[0.07] border-red-400/20 animate-fade-up">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <span className="text-sm text-red-400/80 font-light flex-1">{error}</span>
            <button onClick={clearError} className="text-xs text-white/25 underline hover:text-white/50 shrink-0">
              Clear
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                        shadow-[0_4px_24px_rgba(0,0,0,0.25)] animate-fade-up delay-1">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={13} className="text-white/30" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Filters</span>
          </div>

          {/* ── Backend search ── */}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-4">
            {/* Search by ID */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Hash size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input value={searchById} onChange={(e) => setSearchById(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSearchById() }}
                  placeholder="Search By Question ID (e.g. 10)"
                  className={`${inputClass} pl-9`} />
              </div>
              <button onClick={() => void handleSearchById()} disabled={isLoading}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_12px_rgba(110,231,183,0.15)]">
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                Find
              </button>
            </div>

            {/* Search by Text */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                <input value={searchByText} onChange={(e) => setSearchByText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') void handleSearchByText() }}
                  placeholder="Search question text…"
                  className={`${inputClass} pl-9`} />
              </div>
              <button onClick={() => void handleSearchByText()} disabled={isLoading}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_12px_rgba(110,231,183,0.15)]">
                {isLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                Search
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            {/* Client-side filter */}
            <div className="relative xl:col-span-2">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by ID or question text"
                className={`${inputClass} pl-9`} />
            </div>

            <select value={filterJurisdictionId}
              onChange={(e) => {
                const val = e.target.value ? Number(e.target.value) : '' as const
                setFilterJurisdictionId(val)
                setFilterCategoryId('')
                if (val) { void fetchAdminJurisdictionLanguages(val) }
                setListLang('')
              }}
              className={selectClass}>
              <option value="">All Jurisdictions</option>
              {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>

            <select value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : '')}
              className={selectClass}>
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>

            <select value={filterLicenceCategoryId}
              onChange={(e) => setFilterLicenceCategoryId(e.target.value ? Number(e.target.value) : '')}
              className={selectClass}>
              <option value="">All Licence Categories</option>
              {(licenceCategories?.content ?? []).map((lc) => <option key={lc.id} value={lc.id}>{lc.code} – {lc.name}</option>)}
            </select>

            <select value={filterActive === '' ? '' : filterActive ? 'true' : 'false'}
              onChange={(e) => setFilterActive(e.target.value === '' ? '' : e.target.value === 'true')}
              className={selectClass}>
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          <div className="mt-4 flex justify-end">
            <button onClick={() => void handleFetchQuestions()} disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Fetch Questions
            </button>
          </div>
        </div>

        {/* ── Language switcher for list ── */}
        {filterJurisdictionId !== '' && languageList.length > 1 && (
          <div className="w-full max-w-full min-w-0 overflow-hidden animate-fade-up delay-1">
            <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <div className="inline-flex w-max min-w-max gap-1 bg-[#181920] border border-white/[0.08] rounded-xl p-1">
                {languageList.map(({ code, label }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setListLang(code)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap
                      ${
                        (listLang || primaryCode) === code
                          ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                          : 'text-white/30 hover:text-white/60'
                      }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Question list ── */}
        <div key={`list-${listLang || primaryCode}`} className="space-y-3 animate-fade-up delay-2" dir={languageList.find(l => l.code === (listLang || primaryCode))?.direction || 'ltr'}>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
            ))
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
                            border border-dashed border-white/[0.08] text-center">
              <BookOpen size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No questions found for the current filters.</p>
            </div>
          ) : filteredQuestions.map((question) => (
            <article key={question.id}
              className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                         hover:border-white/[0.14] transition-all duration-200
                         shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 min-w-0 flex-1">
                  <p className="text-sm font-medium leading-relaxed text-[#f0f0f5] mb-2">
                    {(listLang || primaryCode) === primaryCode
                      ? question.question
                      : (question.translations as Record<string, any>)?.[(listLang || primaryCode)]?.question || question.question}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30 font-light">
                    <span>ID #{question.id}</span>
                    <span>· {question.jurisdictionName ?? 'Unknown jurisdiction'}</span>
                    {question.categoryName && <span>· {question.categoryName}</span>}
                    {question.variantId && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-emerald-300/80 border border-emerald-300/30">
                        Variant of #{question.variantId}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => void openDetailsDialog(question)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all duration-200">
                    <Info size={12} /> Details
                  </button>
                  <button onClick={() => void openEditDialog(question)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all duration-200">
                    <Edit size={12} /> Edit
                  </button>
                  {isAdmin && (
                    <button onClick={() => { setQuestionToDelete(question); setDeleteOpen(true) }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                                 hover:bg-red-400/[0.07] transition-all duration-200">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Pagination ── */}
        {questions && questions.totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-white/30 tabular-nums">
              {questions.numberOfElements} of {questions.totalElements} questions
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronLeft size={13} /> Previous
              </button>
              <span className="text-xs text-white/30 tabular-nums px-2">
                {currentPage + 1} / {questions.totalPages}
              </span>
              <button onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage >= questions.totalPages - 1 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            Create / Edit dialog
        ══════════════════════════════════════ */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto overflow-x-hidden
                                    bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
            <div
              key={`form-${questionLocale || primaryCode}`}
              className="w-full max-w-full min-w-0 overflow-x-hidden"
              dir={languageList.find(l => l.code === (questionLocale || primaryCode))?.direction || 'ltr'}
            >
            <DialogHeader>
              <DialogTitle className="font-syne font-bold text-lg tracking-tight">
                {formMode === 'create' ? 'Create Question' : 'Edit Question'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 font-dm">
              {/* Basic info */}
              {isAdmin && (
                <SectionBlock title="Basic Info">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        Jurisdiction <span className="text-red-400">*</span>
                      </label>
                      <select value={questionForm.jurisdictionId}
                        onChange={(e) => handleJurisdictionChange(Number(e.target.value))}
                        className={selectClass}>
                        <option value={0}>Select jurisdiction…</option>
                        {jurisdictions.map((j) => <option key={j.id} value={j.id}>{j.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Category</label>
                      <select value={questionForm.categoryId ?? ''}
                        onChange={(e) => setQuestionForm((p) => ({ ...p, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                        className={selectClass}>
                        <option value="">No category</option>
                        {formCategories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2 mb-3">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Variant of question (optional)</label>
                    <div className="grid gap-3 md:grid-cols-[1fr,auto]">
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="number"
                            inputMode="numeric"
                            min={1}
                            value={questionForm.variantId ?? ''}
                            onChange={(e) => {
                              const value = e.target.value ? Number(e.target.value) : null
                              setQuestionForm((p) => ({ ...p, variantId: value }))
                              setVariantLookupError(null)
                            }}
                            placeholder="Original question ID"
                            className={inputClass}
                          />
                          <button
                            type="button"
                            onClick={() => void loadVariantPreview(questionForm.variantId ?? undefined)}
                            disabled={variantLookupLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50 transition-all duration-200"
                          >
                            {variantLookupLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                            Lookup
                          </button>
                          <button
                            type="button"
                            onClick={handleClearVariant}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-white/70 border border-white/[0.1] hover:text-white"
                          >
                            Clear
                          </button>
                        </div>
                        <div className="flex flex-col gap-2">
                          <div className="flex gap-2">
                            <input
                              value={variantSearchTerm}
                              onChange={(e) => setVariantSearchTerm(e.target.value)}
                              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); void handleVariantSearch() } }}
                              placeholder="Search existing questions by text"
                              className={inputClass}
                            />
                            <button
                              type="button"
                              onClick={() => void handleVariantSearch()}
                              disabled={variantLookupLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#12131a] bg-white/80 text-[#12131a] hover:bg-white transition-all duration-200 disabled:opacity-50"
                            >
                              {variantLookupLoading ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
                              Search
                            </button>
                          </div>
                          {variantLookupError && <p className="text-xs text-red-400/80">{variantLookupError}</p>}
                          {variantPreview && (
                            <div className="rounded-xl border border-emerald-300/30 bg-emerald-300/5 px-3 py-2 text-xs text-emerald-100">
                              <div className="flex items-center justify-between gap-2">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-[11px] text-emerald-200/80">
                                    <span className="px-1.5 py-0.5 rounded bg-emerald-300/10 border border-emerald-300/30">ID #{variantPreview.id}</span>
                                    <span>{variantPreview.jurisdictionName ?? 'Unknown jurisdiction'}</span>
                                    {variantPreview.categoryName && <span>· {variantPreview.categoryName}</span>}
                                  </div>
                                  <p className="text-[13px] text-emerald-50 font-medium line-clamp-2">{variantPreview.question}</p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => handleSelectVariant(variantPreview)}
                                  className="px-2 py-1 rounded-lg text-[11px] font-medium text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all"
                                >
                                  Use
                                </button>
                              </div>
                            </div>
                          )}
                          {variantSearchResults.length > 0 && (
                            <div className="space-y-2">
                              {variantSearchResults.map((q) => (
                                <button
                                  key={q.id}
                                  type="button"
                                  onClick={() => handleSelectVariant(q)}
                                  className="w-full text-left rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 hover:border-emerald-300/30 hover:bg-emerald-300/5 transition-colors"
                                >
                                  <div className="flex items-center justify-between gap-2 text-[11px] text-white/40">
                                    <span className="px-1.5 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-white/60">ID #{q.id}</span>
                                    <span>{q.jurisdictionName ?? 'Unknown jurisdiction'}</span>
                                  </div>
                                  <p className="text-[13px] text-white/80 font-medium line-clamp-2">{q.question}</p>
                                  {q.categoryName && <p className="text-[11px] text-white/35 mt-1">{q.categoryName}</p>}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <p className="text-xs text-white/40">Use this to link the current item as a variant of an existing question. Leave empty for original questions.</p>
                        <p className="text-[11px] text-white/30">Avoid selecting the same question. Backend enforces validity.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 mb-3">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Question text <span className="text-red-400">*</span>
                    </label>
                    <textarea ref={questionPrimaryRef} rows={3}
                      value={questionForm.question}
                      onChange={(e) => setQuestionForm((p) => ({ ...p, question: e.target.value, translations: { ...p.translations, [primaryCode]: e.target.value } }))}
                      placeholder="Enter the question text"
                      className={textareaClass} />
                  </div>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <div className="relative shrink-0">
                      <input type="checkbox" checked={questionForm.active}
                        onChange={(e) => setQuestionForm((p) => ({ ...p, active: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                      peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
                      <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                      peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
                    </div>
                    <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Active</span>
                  </label>
                </SectionBlock>
              )}

              {/* Translations */}
              <SectionBlock title="Translations" icon={Globe2}
                action={<LocaleToggle active={questionLocale} onChange={setQuestionLocale} languages={languageList} />}>
                <textarea rows={2} value={questionForm.translations[questionLocale] ?? ''}
                  onChange={(e) => setQuestionForm((p) => ({ ...p, translations: { ...p.translations, [questionLocale]: e.target.value } }))}
                  placeholder={`Question in ${languageList.find((l: { code: string; label: string }) => l.code === questionLocale)?.label ?? questionLocale}`}
                  className={textareaClass} />
              </SectionBlock>

              {/* Assets */}
              {isAdmin && (
                <SectionBlock title="Assets" icon={ImageIcon}
                  action={
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer
                                      text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                      transition-all duration-200">
                      <Upload size={12} /> Add Files
                      <input hidden type="file" multiple onChange={(e) => appendQuestionAssets(Array.from(e.target.files ?? []))} />
                    </label>
                  }>
                  {questionForm.assets.length === 0 ? (
                    <p className="text-sm text-white/25 font-light">No assets queued for upload.</p>
                  ) : (
                    <div className="space-y-3">
                      {questionForm.assets.map((asset, index) => (
                        <div key={`${asset.file.name}-${index}`} draggable
                          onDragStart={() => setDraggingQuestionAssetIndex(index)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (draggingQuestionAssetIndex === null) return
                            setQuestionForm((p) => ({ ...p, assets: moveItem(p.assets, draggingQuestionAssetIndex, index) }))
                            setDraggingQuestionAssetIndex(null)
                          }}
                          className="grid gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] p-3
                                     md:grid-cols-[140px,1fr,1fr,auto]">
                          <div className="space-y-1">
                            <LocalAssetPreview file={asset.file} />
                            <p className="truncate text-[11px] text-white/30">{asset.file.name}</p>
                          </div>
                          <select value={asset.type}
                            onChange={(e) => setQuestionForm((p) => ({ ...p, assets: p.assets.map((item, idx) => idx === index ? { ...item, type: e.target.value as AssetType } : item) }))}
                            className={`${selectClass} ${!asset.type ? 'border-red-400/40 text-white/30' : ''}`}>
                            <option value="" disabled>Select type…</option>
                            {['image','video','document','diagram','illustration'].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          <div className="space-y-2">
                            <input value={asset.alt} onChange={(e) => setQuestionForm((p) => ({ ...p, assets: p.assets.map((item, idx) => idx === index ? { ...item, alt: e.target.value } : item) }))} placeholder="Alt text" className={inputClass} />
                            <input value={asset.caption} onChange={(e) => setQuestionForm((p) => ({ ...p, assets: p.assets.map((item, idx) => idx === index ? { ...item, caption: e.target.value } : item) }))} placeholder="Caption" className={inputClass} />
                          </div>
                          <div className="flex flex-col items-center gap-1">
                            <GripVertical size={14} className="text-white/20" />
                            <ActionBtn onClick={() => setQuestionForm((p) => ({ ...p, assets: moveItem(p.assets, index, index - 1) }))} variant="ghost"><ChevronUp size={13} /></ActionBtn>
                            <ActionBtn onClick={() => setQuestionForm((p) => ({ ...p, assets: moveItem(p.assets, index, index + 1) }))} variant="ghost"><ChevronDown size={13} /></ActionBtn>
                            <ActionBtn onClick={() => setQuestionForm((p) => ({ ...p, assets: p.assets.filter((_, idx) => idx !== index) }))} variant="danger"><Trash2 size={13} /></ActionBtn>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionBlock>
              )}
            </div>

            <DialogFooter className="gap-2">
              <button onClick={() => setFormOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                           hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleSaveQuestion()} disabled={isLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                {formMode === 'create' ? 'Create Question' : 'Save Changes'}
              </button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Details dialog
        ══════════════════════════════════════ */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-h-[90vh] max-w-6xl overflow-y-auto overflow-x-hidden
                                    bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
            <div
              key={`details-${detailsLang || primaryCode}`}
              className="w-full max-w-full min-w-0 overflow-x-hidden"
              dir={languageList.find(l => l.code === (detailsLang || primaryCode))?.direction || 'ltr'}
            >
            <DialogHeader>
              <DialogTitle className="font-syne font-bold text-lg tracking-tight">
                Question Details & Management
              </DialogTitle>
            </DialogHeader>

            {selectedQuestion && (
              <div className="space-y-4 font-dm">
                {/* Language switcher */}
                {languageList.length > 1 && (
                  <div className="w-full max-w-full min-w-0 overflow-hidden">
                    <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                      <div className="inline-flex w-max min-w-max gap-1 bg-[#181920] border border-white/[0.08] rounded-xl p-1">
                        {languageList.map(({ code, label }) => (
                          <button
                            key={code}
                            type="button"
                            onClick={() => setDetailsLang(code)}
                            className={`shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap
                              ${
                                detailsLang === code
                                  ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                                  : 'text-white/30 hover:text-white/60'
                              }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Question summary */}
                <SectionBlock title="Question">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-relaxed text-[#f0f0f5] mb-2">
                        {detailsLang === primaryCode
                          ? selectedQuestion.question
                          : (selectedQuestion.translations as Record<string, any>)?.[detailsLang]?.question || <span className="text-white/25 italic">No translation</span>}
                      </p>
                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30 font-light">
                        <span>ID #{selectedQuestion.id}</span>
                        <span>· {selectedQuestion.jurisdictionName ?? 'Unknown jurisdiction'}</span>
                        {selectedQuestion.categoryName && <span>· {selectedQuestion.categoryName}</span>}
                        {selectedQuestion.variantId && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.04] px-2 py-0.5 text-[11px] text-emerald-300/80 border border-emerald-300/30">
                            Variant of #{selectedQuestion.variantId}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button onClick={() => void openEditDialog(selectedQuestion)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                   text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20 transition-all duration-200">
                        <Edit size={12} /> Edit
                      </button>
                      {isAdmin && (
                        <button onClick={() => { setQuestionToDelete(selectedQuestion); setDeleteOpen(true); setDetailsOpen(false) }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                     text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                                     hover:bg-red-400/[0.07] transition-all duration-200">
                          <Trash2 size={12} /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </SectionBlock>

                {/* Question assets */}
                <SectionBlock title="Question Assets" icon={ImageIcon}>
                  {selectedQuestion.assets && selectedQuestion.assets.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      {selectedQuestion.assets.map((asset) => {
                        const url = getAssetUrl(asset.url)
                        return (
                          <div key={asset.url} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                            {isImageAsset(asset.contentType, asset.type)
                              ? <img src={url} alt={asset.alt ?? 'asset'} className="mb-2 h-36 w-full rounded-lg object-cover" />
                              : isVideoAsset(asset.contentType, asset.type)
                              ? <video controls className="mb-2 h-36 w-full rounded-lg object-cover"><source src={url} type={asset.contentType ?? 'video/mp4'} /></video>
                              : null}
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] text-white/30">{asset.type}</span>
                              {isAdmin && (
                                <ActionBtn variant="danger" onClick={async () => { await deleteQuestionAsset(selectedQuestion.id, asset.url); await refreshSelectedQuestion() }}><Trash2 size={12} /></ActionBtn>
                              )}
                            </div>
                            {asset.caption && <p className="mt-1 text-[11px] text-white/25">{asset.caption}</p>}
                          </div>
                        )
                      })}
                    </div>
                  ) : <p className="text-sm text-white/25 font-light">No assets uploaded yet.</p>}
                </SectionBlock>

                {/* Options */}
                <SectionBlock title="Options" icon={CheckCircle2}
                  action={isAdmin && (
                    <button onClick={openOptionCreateDialog}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                 text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
                                 hover:border-emerald-300/40 transition-all duration-200">
                      <Plus size={11} /> Add Option
                    </button>
                  )}>
                  <div className="space-y-2">
                    {selectedQuestion.options.length === 0
                      ? <p className="text-sm text-white/25 font-light">No options added yet.</p>
                      : selectedQuestion.options.map((option) => {
                        const optAssetUrl = option.asset?.url ? getAssetUrl(option.asset.url) : null
                        return (
                          <div key={option.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#f0f0f5]">
                                  {detailsLang === primaryCode
                                    ? option.text
                                    : (option.translations as Record<string, any>)?.[detailsLang]?.text || <span className="text-white/25 italic">No translation</span>}
                                </p>
                                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-white/30 font-light">
                                  <span>Position {option.position}</span>
                                  <span className={option.isCorrect ? 'text-emerald-300 font-medium' : 'text-red-400/70'}>
                                    {option.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                                  </span>
                                  {optAssetUrl && <a href={optAssetUrl} target="_blank" rel="noreferrer" className="underline">Has asset</a>}
                                </div>
                                {optAssetUrl && isImageAsset(option.asset?.contentType, option.asset?.type) &&
                                  <img src={optAssetUrl} alt={option.asset?.alt ?? 'option'} className="mt-2 h-20 w-auto rounded-lg border border-white/[0.07]" />}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <ActionBtn variant="outline" onClick={() => openOptionEditDialog(option)}><Edit size={12} /></ActionBtn>
                                {isAdmin && (
                                  <ActionBtn variant="danger" onClick={async () => { await deleteOption(option.id); await refreshSelectedQuestion(); setFeedback({ type: 'success', message: 'Option deleted.' }) }}><Trash2 size={12} /></ActionBtn>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </SectionBlock>

                {/* Explanation */}
                <SectionBlock title="Explanation" icon={MessageSquare}
                  action={
                    <div className="flex items-center gap-1.5">
                      <button onClick={openExplanationDialog}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                   text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
                                   hover:border-emerald-300/40 transition-all duration-200">
                        {currentExplanation ? <><Edit size={11} /> Edit</> : <><Plus size={11} /> Add</>}
                      </button>
                      {isAdmin && currentExplanation && (
                        <ActionBtn variant="danger" onClick={async () => { await deleteExplanation(currentExplanation.id); setCurrentExplanation(null); setFeedback({ type: 'success', message: 'Explanation deleted.' }) }}><Trash2 size={12} /></ActionBtn>
                      )}
                    </div>
                  }>
                  {currentExplanation ? (
                    <div>
                      {(() => {
                        const expText = detailsLang === primaryCode
                          ? (currentExplanation.text ?? currentExplanation.explanation ?? '')
                          : ((currentExplanation.translations as Record<string, any>)?.[detailsLang]?.text
                            ?? (currentExplanation.translations as Record<string, any>)?.[detailsLang]?.explanation
                            ?? '')
                        return expText
                          ? <div className="text-sm text-white/70 font-light quill-content" dangerouslySetInnerHTML={{ __html: expText }} />
                          : <p className="text-sm text-white/25 font-light italic">No translation</p>
                      })()}
                      {currentExplanation.assets && currentExplanation.assets.length > 0 && (
                        <div className="mt-3 grid gap-3 md:grid-cols-2">
                          {currentExplanation.assets.map((asset) => {
                            const url = getAssetUrl(asset.url)
                            return (
                              <div key={asset.url} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                                {isImageAsset(asset.contentType, asset.type)
                                  ? <img src={url} alt={asset.alt ?? 'asset'} className="mb-2 h-28 w-full rounded-lg object-cover" />
                                  : isVideoAsset(asset.contentType, asset.type)
                                  ? <video controls className="mb-2 h-28 w-full rounded-lg object-cover"><source src={url} type={asset.contentType ?? 'video/mp4'} /></video>
                                  : null}
                                <div className="flex items-center justify-between">
                                  <a href={url} target="_blank" rel="noreferrer" className="truncate text-[11px] text-white/30 underline">{asset.filename || asset.url}</a>
                                  {isAdmin && (
                                    <ActionBtn variant="danger" onClick={async () => { await deleteExplanationAsset(currentExplanation.id, asset.url); setCurrentExplanation(await fetchExplanationByQuestion(selectedQuestion.id)); setFeedback({ type: 'success', message: 'Asset deleted.' }) }}><Trash2 size={12} /></ActionBtn>
                                  )}
                                </div>
                                {asset.caption && <p className="mt-1 text-[11px] text-white/25">{asset.caption}</p>}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ) : <p className="text-sm text-white/25 font-light">No explanation added yet.</p>}
                </SectionBlock>

                {/* Tips */}
                <SectionBlock title="Tips" icon={Lightbulb}
                  action={isAdmin && (
                    <button onClick={openTipCreateDialog}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                                 text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
                                 hover:border-emerald-300/40 transition-all duration-200">
                      <Plus size={11} /> Add Tip
                    </button>
                  )}>
                  <div className="space-y-2">
                    {(selectedQuestion.tips ?? []).length === 0
                      ? <p className="text-sm text-white/25 font-light">No tips added yet.</p>
                      : (selectedQuestion.tips ?? []).map((tip) => (
                        <div key={tip.id} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              {(() => {
                                const tipTitle = detailsLang === primaryCode
                                  ? tip.title
                                  : (tip.translations as Record<string, any>)?.[detailsLang]?.title ?? ''
                                const tipBody = detailsLang === primaryCode
                                  ? tip.body
                                  : ((tip.translations as Record<string, any>)?.[detailsLang]?.body
                                    ?? (tip.translations as Record<string, any>)?.[detailsLang]?.tip
                                    ?? '')
                                return (
                                  <>
                                    {tipTitle && <p className="text-xs font-medium text-white/50 mb-1">{tipTitle}</p>}
                                    {tipBody
                                      ? <div className="text-sm text-white/70 font-light quill-content" dangerouslySetInnerHTML={{ __html: tipBody }} />
                                      : <p className="text-sm text-white/25 font-light italic">No translation</p>}
                                  </>
                                )
                              })()}
                            </div>
                            <div>Display Order: {tip.displayOrder}</div>
                            <div className="flex items-center gap-1 shrink-0">
                              <ActionBtn variant="outline" onClick={() => openTipEditDialog(tip)}><Edit size={12} /></ActionBtn>
                              {isAdmin && (
                                <ActionBtn variant="danger" onClick={async () => { await deleteTip(tip.id); await refreshSelectedQuestion(); setFeedback({ type: 'success', message: 'Tip deleted.' }) }}><Trash2 size={12} /></ActionBtn>
                              )}
                            </div>
                          </div>
                          {tip.assets && tip.assets.length > 0 && (
                            <div className="mt-3 grid gap-3 md:grid-cols-2">
                              {tip.assets.map((asset) => {
                                const url = getAssetUrl(asset.url)
                                return (
                                  <div key={asset.url} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                                    {isImageAsset(asset.contentType, asset.type)
                                      ? <img src={url} alt={asset.alt ?? 'asset'} className="mb-2 h-28 w-full rounded-lg object-cover" />
                                      : isVideoAsset(asset.contentType, asset.type)
                                      ? <video controls className="mb-2 h-28 w-full rounded-lg object-cover"><source src={url} type={asset.contentType ?? 'video/mp4'} /></video>
                                      : null}
                                    <div className="flex items-center justify-between">
                                      <a href={url} target="_blank" rel="noreferrer" className="truncate text-[11px] text-white/30 underline">{asset.filename || asset.url}</a>
                                      {isAdmin && (
                                        <ActionBtn variant="danger" onClick={async () => { await deleteTipAsset(tip.id, asset.url); await refreshSelectedQuestion(); setFeedback({ type: 'success', message: 'Tip asset deleted.' }) }}><Trash2 size={12} /></ActionBtn>
                                      )}
                                    </div>
                                    {asset.caption && <p className="mt-1 text-[11px] text-white/25">{asset.caption}</p>}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </SectionBlock>
              </div>
            )}

            <DialogFooter>
              <button onClick={() => setDetailsOpen(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                           hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Close
              </button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Delete dialog
        ══════════════════════════════════════ */}
        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <DialogTitle className="font-syne font-bold text-base tracking-tight text-red-400">
                  Delete Question
                </DialogTitle>
              </div>
            </DialogHeader>
            <p className="text-sm text-white/45 font-light">
              This performs a soft delete and removes the question from active workflows.
            </p>
            {questionToDelete && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <p className="text-sm text-white/60 font-light leading-relaxed">{questionToDelete.question}</p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <button onClick={() => setDeleteOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55
                           border border-white/[0.09] hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button ref={deleteButtonRef} onClick={() => void handleDeleteQuestion()}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2
                           text-[#12131a] bg-red-400 hover:opacity-85 transition-all duration-200
                           [box-shadow:0_0_20px_rgba(248,113,113,0.25)]">
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Sub-dialogs (unchanged logic) ── */}
        <OptionEditorDialog
          open={optionEditorOpen} mode={optionEditorMode} formData={optionFormData}
          locale={optionLocale} editingOption={editingOption} isLoading={isLoading}
          languages={languageList} primaryCode={primaryCode}
          onOpenChange={setOptionEditorOpen} onFormDataChange={setOptionFormData}
          onLocaleChange={setOptionLocale} onSave={handleSaveOption}
          onUploadImage={async (file) => { if (!editingOption) return; await uploadOptionImage(editingOption.id, file); await refreshSelectedQuestion() }}
          onDeleteImage={async () => { if (!editingOption) return; await deleteOptionImage(editingOption.id); await refreshSelectedQuestion() }}
        />
        <TipEditorDialog
          open={tipEditorOpen} mode={tipEditorMode} formData={tipFormData}
          displayOrder={tipDisplayOrder}
          locale={tipLocale} isLoading={isLoading}
          assets={tipFormAssets} existingAssets={tipExistingAssets}
          languages={languageList}
          onOpenChange={setTipEditorOpen} onFormDataChange={setTipFormData}
          onDisplayOrderChange={setTipDisplayOrder}
          onLocaleChange={setTipLocale} onAssetsChange={setTipFormAssets}
          onDeleteExistingAsset={async (assetUrl) => {
            if (!editingTip) return
            try {
              await deleteTipAsset(editingTip.id, assetUrl)
              setTipExistingAssets(prev => prev.filter(a => a.url !== assetUrl))
              await refreshSelectedQuestion()
              setFeedback({ type: 'success', message: 'Asset deleted.' })
            } catch (err) { setFeedback({ type: 'error', message: getErrorMessage(err, 'Failed to delete asset.') }) }
          }}
          onSave={handleSaveTip}
        />
        <ExplanationEditorDialog
          open={explanationEditorOpen} formData={explanationFormData}
          locale={explanationLocale} assets={explanationFormAssets}
          isLoading={isLoading} hasExisting={!!currentExplanation}
          languages={languageList}
          onOpenChange={setExplanationEditorOpen} onFormDataChange={setExplanationFormData}
          onLocaleChange={setExplanationLocale} onAssetsChange={setExplanationFormAssets}
          onSave={handleSaveExplanationFromDialog}
        />
      </div>
    </>
  )
}