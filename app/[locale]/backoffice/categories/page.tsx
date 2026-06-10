// "use client"

// import { useEffect, useState, useCallback } from 'react';
// import { useAdminStore } from '@/lib/store/admin-store';
// import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store';
// import { AdminCategory, CreateCategoryRequest } from '@/lib/types/admin';
// import {
//   AlertCircle, Check, CheckCircle2, ChevronRight,
//   Edit, FolderTree, Globe2, Loader2, Plus, Search,
//   SlidersHorizontal, Sparkles, Trash2,
// } from 'lucide-react';
// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// // ── Types ──────────────────────────────────────────────────────────────────────
// interface LocalizedFields {
//   name: string;
//   description: string;
// }

// interface CategoryFormData {
//   jurisdictionId: number;
//   name: string;
//   description: string;
//   active: boolean;
//   parentCategoryId?: number;
//   translations: Record<string, LocalizedFields>;
// }

// // ── Style tokens ───────────────────────────────────────────────────────────────
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
//   transition-colors duration-200 resize-none placeholder:text-white/20
// `

// // ── Helpers ────────────────────────────────────────────────────────────────────
// function buildPayload(data: CategoryFormData): CreateCategoryRequest {
//   const translations: Record<string, LocalizedFields> = {}
//   for (const [code, fields] of Object.entries(data.translations)) {
//     if (fields.name.trim() || fields.description.trim()) {
//       translations[code] = fields
//     }
//   }

//   const payload: any = {
//     jurisdictionId: data.jurisdictionId,
//     name: data.name,
//     active: data.active,
//   }
//   if (data.description.trim())           payload.description  = data.description
//   if (data.parentCategoryId)             payload.parentCategoryId = data.parentCategoryId
//   if (Object.keys(translations).length)  payload.translations = translations
//   return payload as CreateCategoryRequest
// }

// const createBlankForm = (): CategoryFormData => ({
//   jurisdictionId: 0, name: '', description: '', active: true,
//   translations: {},
// })

// // ── Shared UI ──────────────────────────────────────────────────────────────────
// function SectionBlock({ title, icon: Icon, children, action }: {
//   title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
// }) {
//   return (
//     <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
//       <div className="flex flex-col gap-2 px-5 py-3.5 border-b border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
//         <div className="flex items-center gap-2">
//           {Icon && <Icon size={13} className="text-white/30" />}
//           <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{title}</h4>
//         </div>
//         {action && <div className="flex items-center min-w-0 overflow-x-hidden">{action}</div>}
//       </div>
//       <div className="px-5 py-4">{children}</div>
//     </div>
//   )
// }

// function Toggle({ checked, onChange }: { checked: boolean | undefined; onChange: (v: boolean) => void }) {
//   return (
//     <label className="flex items-center gap-3 cursor-pointer group w-fit">
//       <div className="relative shrink-0">
//         <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
//         <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
//                         peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
//         <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
//                         peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
//       </div>
//       <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Active</span>
//     </label>
//   )
// }

// function LocaleToggle({ active, onChange, languages }: {
//   active: string;
//   onChange: (c: string) => void;
//   languages: { code: string; label: string; native: string; direction?: string }[];
// }) {
//   return (
//     <div className="min-w-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
//       <div className="flex items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl min-w-max">
//         {languages.map(({ code, native }) => (
//           <button key={code} type="button" onClick={() => onChange(code)}
//             className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
//               ${active === code
//                 ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
//                 : 'text-white/35 hover:text-white/70'}`}>
//             {native}
//           </button>
//         ))}
//       </div>
//     </div>
//   )
// }

// // ── Localised name + description panel ────────────────────────────────────────
// function LocalizedContentFields({
//   locale, formData, onChange, primaryCode, languages,
// }: {
//   locale: string;
//   formData: CategoryFormData;
//   onChange: (d: CategoryFormData) => void;
//   primaryCode: string;
//   languages: { code: string; label: string; native: string; direction?: string }[];
// }) {
//   const currentLang = languages.find(l => l.code === locale);
//   const textDirection = currentLang?.direction || 'ltr';
//   if (locale === primaryCode) {
//     const langLabel = languages.find(l => l.code === locale)?.label ?? locale
//     return (
//       <div className="space-y-3" dir={textDirection}>
//         <div className="space-y-1.5">
//           <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//             Name <span className="text-red-400">*</span>
//           </label>
//           <input
//             value={formData.name}
//             onChange={e => onChange({ ...formData, name: e.target.value })}
//             placeholder={`Category name in ${langLabel}`}
//             className={inputClass}
//           />
//         </div>
//         <div className="space-y-1.5">
//           <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Description</label>
//           <textarea
//             rows={2}
//             value={formData.description}
//             onChange={e => onChange({ ...formData, description: e.target.value })}
//             placeholder={`Optional description in ${langLabel}`}
//             className={textareaClass}
//           />
//         </div>
//       </div>
//     )
//   }

//   const current = formData.translations[locale] ?? { name: '', description: '' }
//   const langLabel = languages.find(l => l.code === locale)?.label ?? locale

//   const setField = (field: keyof LocalizedFields, value: string) =>
//     onChange({
//       ...formData,
//       translations: { ...formData.translations, [locale]: { ...current, [field]: value } },
//     })

//   return (
//     <div className="space-y-3" dir={textDirection}>
//       {/* Translation hint */}
//       <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
//         <Globe2 size={12} className="text-white/25 shrink-0" />
//         <p className="text-[11px] text-white/35 font-light leading-relaxed">
//           Enter the <span className="text-white/55">{langLabel}</span> translation below.
//           Fields left blank will not be included in the payload.
//         </p>
//       </div>
//       <div className="space-y-1.5">
//         <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//           Name ({langLabel})
//         </label>
//         <input
//           value={current.name}
//           onChange={e => setField('name', e.target.value)}
//           placeholder={`Category name in ${langLabel}…`}
//           className={inputClass}
//         />
//       </div>
//       <div className="space-y-1.5">
//         <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//           Description ({langLabel})
//         </label>
//         <textarea
//           rows={2}
//           value={current.description}
//           onChange={e => setField('description', e.target.value)}
//           placeholder={`Description in ${langLabel}…`}
//           className={textareaClass}
//         />
//       </div>
//     </div>
//   )
// }

// // ── Translation completeness indicator ─────────────────────────────────────────
// function TranslationDots({ formData, languages, primaryCode }: {
//   formData: CategoryFormData;
//   languages: { code: string; label: string; native: string; direction?: string }[];
//   primaryCode: string;
// }) {
//   const nonPrimary = languages.filter(l => l.code !== primaryCode)
//   return (
//     <div className="flex items-center gap-1.5">
//       {nonPrimary.map(({ code, label }) => {
//         const filled = !!(formData.translations[code]?.name?.trim())
//         return (
//           <span key={code} title={`${label}: ${filled ? 'translated' : 'missing'}`}
//             className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider
//               ${filled
//                 ? 'text-emerald-300/70 bg-emerald-300/10 border border-emerald-300/20'
//                 : 'text-white/20 bg-white/[0.03] border border-white/[0.07]'}`}>
//             {code}
//           </span>
//         )
//       })}
//     </div>
//   )
// }

// // ── Category row (recursive) ───────────────────────────────────────────────────
// function CategoryRow({
//   category, level = 0, onEdit, onDelete, listLang, primaryCode,
// }: {
//   category: AdminCategory; level?: number;
//   onEdit: (cat: AdminCategory) => void; onDelete: (cat: AdminCategory) => void;
//   listLang: string; primaryCode: string;
// }) {
//   const [expanded, setExpanded] = useState(true)
//   const hasSubs = (category.subCategories?.length ?? 0) > 0

//   const displayName = listLang === primaryCode
//     ? category.name
//     : (category.translations as Record<string, any>)?.[listLang]?.name || category.name

//   const isTranslated = listLang !== primaryCode && !!(category.translations as Record<string, any>)?.[listLang]?.name

//   return (
//     <div>
//       <div
//         className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/[0.07]
//                    bg-[#181920] hover:border-white/[0.14] transition-all duration-200
//                    shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
//         style={{ marginLeft: `${level * 1.5}rem` }}
//       >
//         <div className="flex items-center gap-3 min-w-0 flex-1">
//           <button type="button" onClick={() => hasSubs && setExpanded(e => !e)}
//             className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0
//               ${hasSubs ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.07]' : 'text-white/20 cursor-default'}`}>
//             {hasSubs
//               ? <ChevronRight size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
//               : <FolderTree size={13} />}
//           </button>
//           <div className="min-w-0">
//             <div className="flex flex-wrap items-center gap-2">
//               <span className={`text-sm font-medium ${listLang !== primaryCode && !isTranslated ? 'text-white/25 italic' : 'text-[#f0f0f5]'}`}>
//                 {displayName}
//               </span>
//               <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
//                                 uppercase tracking-widest border
//                                 ${category.active
//                                   ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20'
//                                   : 'text-white/30 bg-white/[0.04] border-white/[0.09]'}`}>
//                 {category.active ? 'Active' : 'Inactive'}
//               </span>
//               {category.deletedAt && (
//                 <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
//                                  uppercase tracking-widest border text-red-400 bg-red-400/10 border-red-400/20">
//                   Deleted
//                 </span>
//               )}
//             </div>
//             <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-white/30 font-light">
//               <span>ID #{category.id}</span>
//               {category.jurisdictionName && <span>· {category.jurisdictionName}</span>}
//               <span>· {category.questionCount ?? 0} questions</span>
//               {hasSubs && <span>· {category.subCategories!.length} subcategories</span>}
//             </div>
//           </div>
//         </div>
//         <div className="flex items-center gap-1.5 shrink-0 ml-3">
//           <button onClick={() => onEdit(category)}
//             className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                        text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
//                        transition-all duration-200">
//             <Edit size={12} /> Edit
//           </button>
//           <button onClick={() => onDelete(category)}
//             className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                        text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
//                        hover:bg-red-400/[0.07] transition-all duration-200">
//             <Trash2 size={12} /> Delete
//           </button>
//         </div>
//       </div>
//       {hasSubs && expanded && (
//         <div className="mt-2 space-y-2">
//           {category.subCategories!.map(sub => (
//             <CategoryRow key={sub.id} category={sub} level={level + 1} onEdit={onEdit} onDelete={onDelete} listLang={listLang} primaryCode={primaryCode} />
//           ))}
//         </div>
//       )}
//     </div>
//   )
// }

// // ── Page ───────────────────────────────────────────────────────────────────────
// export default function CategoriesPage() {
//   const {
//     categories, isLoading,
//     fetchCategories, createCategory, updateCategory, deleteCategory,
//     jurisdictions, fetchJurisdictions,
//   } = useAdminStore()

//   const {
//     adminLanguages,
//     fetchAdminJurisdictionLanguages,
//   } = useJurisdictionLanguageStore()

//   const [showCreateDialog, setShowCreateDialog] = useState(false)
//   const [showEditDialog,   setShowEditDialog]   = useState(false)
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false)
//   const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null)
//   const [filterJurisdictionId, setFilterJurisdictionId] = useState<number | ''>('')
//   const [listLang, setListLang] = useState<string>('')
//   const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

//   const [formData,       setFormData]       = useState<CategoryFormData>(createBlankForm())
//   const [createLocale,   setCreateLocale]   = useState<string>('')
//   const [editLocale,     setEditLocale]     = useState<string>('')
//   const [formCategories, setFormCategories] = useState<AdminCategory[]>([])

//   // Derive language list from adminLanguages
//   const languageList = adminLanguages
//     .filter(jl => jl.isActive)
//     .map(jl => ({
//       code: jl.language.code,
//       label: jl.language.displayName || jl.language.name,
//       native: jl.language.shortDisplayName || jl.language.name,
//       isPrimary: jl.isPrimary,
//       direction: jl.language.direction,
//     }))

//   const primaryCode = languageList.find(l => l.isPrimary)?.code ?? languageList[0]?.code ?? 'en'

//   // Debug: Log language list with directions
//   useEffect(() => {
//     if (languageList.length > 0) {
//       console.log('Language list with directions:', languageList)
//     }
//   }, [languageList])

//   // Fetch languages when jurisdiction changes in create dialog
//   const handleJurisdictionChange = useCallback((jurisdictionId: number) => {
//     setFormData(p => ({ ...p, jurisdictionId, parentCategoryId: undefined, translations: {} }))
//     if (jurisdictionId) {
//       void fetchAdminJurisdictionLanguages(jurisdictionId)
//       fetchCategories(jurisdictionId).then(() => {
//         setFormCategories(useAdminStore.getState().categories)
//       }).catch(() => setFormCategories([]))
//     } else {
//       setFormCategories([])
//     }
//   }, [fetchAdminJurisdictionLanguages, fetchCategories])

//   // Set default locale tab when languages load
//   useEffect(() => {
//     if (primaryCode && !createLocale) {
//       setCreateLocale(primaryCode)
//     }
//   }, [primaryCode, createLocale])

//   useEffect(() => {
//     if (primaryCode && !editLocale) {
//       setEditLocale(primaryCode)
//     }
//   }, [primaryCode, editLocale])

//   useEffect(() => { void fetchJurisdictions() }, [fetchJurisdictions])
//   useEffect(() => { void fetchCategories() }, [fetchCategories])

//   const handleFetchCategories = () => {
//     void fetchCategories(filterJurisdictionId === '' ? undefined : filterJurisdictionId)
//   }

//   const resetForm = () => { setFormData(createBlankForm()); setCreateLocale(''); setEditLocale(''); setFormCategories([]) }

//   const handleCreate = async () => {
//     try {
//       await createCategory(buildPayload(formData))
//       setShowCreateDialog(false); resetForm(); handleFetchCategories()
//       setFeedback({ type: 'success', message: 'Category created successfully.' })
//     } catch { setFeedback({ type: 'error', message: 'Failed to create category.' }) }
//   }

//   const handleUpdate = async () => {
//     if (!selectedCategory) return
//     try {
//       await updateCategory(selectedCategory.id, buildPayload(formData))
//       setShowEditDialog(false); setSelectedCategory(null); resetForm(); handleFetchCategories()
//       setFeedback({ type: 'success', message: 'Category updated successfully.' })
//     } catch { setFeedback({ type: 'error', message: 'Failed to update category.' }) }
//   }

//   const handleDelete = async () => {
//     if (!selectedCategory) return
//     try {
//       await deleteCategory(selectedCategory.id)
//       setShowDeleteDialog(false); setSelectedCategory(null); handleFetchCategories()
//       setFeedback({ type: 'success', message: 'Category deleted.' })
//     } catch { setFeedback({ type: 'error', message: 'Failed to delete category.' }) }
//   }

//   const openEdit = async (cat: AdminCategory) => {
//     setSelectedCategory(cat)
//     void fetchAdminJurisdictionLanguages(cat.jurisdictionId)
//     try {
//       await fetchCategories(cat.jurisdictionId)
//       setFormCategories(useAdminStore.getState().categories)
//     } catch { setFormCategories([]) }
//     const translations: Record<string, LocalizedFields> = {}
//     if ((cat as any).translations) {
//       for (const [code, fields] of Object.entries((cat as any).translations as Record<string, any>)) {
//         translations[code] = {
//           name: fields?.name ?? '',
//           description: fields?.description ?? '',
//         }
//       }
//     }
//     setFormData({
//       jurisdictionId:  cat.jurisdictionId,
//       name:            cat.name,
//       description:     (cat as any).description ?? '',
//       active:          cat.active,
//       parentCategoryId: cat.parentCategoryId ?? undefined,
//       translations,
//     })
//     setEditLocale('')
//     setShowEditDialog(true)
//   }

//   const openDelete = (cat: AdminCategory) => { setSelectedCategory(cat); setShowDeleteDialog(true) }

//   const rootCategories = categories.filter(c => !c.parentCategoryId)

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
//           <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/[0.08] blur-3xl pointer-events-none" />
//           <div className="absolute -bottom-14 left-16 h-48 w-48 rounded-full bg-sky-300/[0.06] blur-3xl pointer-events-none" />
//           <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
//             <div>
//               <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
//                               bg-emerald-300/10 border border-emerald-300/20 mb-3">
//                 <Sparkles size={11} className="text-emerald-300" />
//                 <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
//                   Admin · Categories
//                 </span>
//               </div>
//               <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Categories</h1>
//               <p className="text-sm text-white/40 font-light mt-1">
//                 Organise questions into categories and subcategories.
//               </p>
//             </div>
//             <button onClick={() => setShowCreateDialog(true)}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
//                          text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
//                          [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
//               <Plus size={15} /> Create Category
//             </button>
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
//               className="text-xs text-white/25 underline hover:text-white/50 shrink-0 transition-colors">
//               Dismiss
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
//           <div className="flex items-center gap-3">
//             <select value={filterJurisdictionId}
//               onChange={e => {
//                 const val = e.target.value ? Number(e.target.value) : '' as const
//                 setFilterJurisdictionId(val)
//                 if (val) {
//                   void fetchAdminJurisdictionLanguages(val)
//                 }
//                 setListLang('')
//               }}
//               className={`${selectClass} flex-1`}>
//               <option value="">All Jurisdictions</option>
//               {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
//             </select>
//             <button onClick={handleFetchCategories} disabled={isLoading}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
//                          text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                          transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
//               {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
//               Fetch Categories
//             </button>
//           </div>
//         </div>

//         {/* ── Language switcher for list ── */}
//         {filterJurisdictionId !== '' && languageList.length > 1 && (
//           <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none] animate-fade-up delay-1">
//             <div className="flex gap-1 min-w-max bg-[#181920] border border-white/[0.08] rounded-xl p-1">
//               {languageList.map(({ code, label }) => (
//                 <button
//                   key={code}
//                   type="button"
//                   onClick={() => setListLang(code)}
//                   className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap
//                     ${(listLang || primaryCode) === code
//                       ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
//                       : 'text-white/30 hover:text-white/60'}`}>
//                   {label}
//                 </button>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* ── Categories list ── */}
//         <div key={`list-${listLang || primaryCode}`} className="space-y-2 animate-fade-up delay-2" dir={languageList.find(l => l.code === (listLang || primaryCode))?.direction || 'ltr'}>
//           {isLoading ? (
//             Array.from({ length: 4 }).map((_, i) => (
//               <div key={i} className="h-16 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />
//             ))
//           ) : rootCategories.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-20 rounded-2xl
//                             border border-dashed border-white/[0.08] text-center">
//               <FolderTree size={28} className="text-white/15 mb-3" />
//               <p className="text-sm text-white/30 font-light">No categories found. Create one to get started.</p>
//             </div>
//           ) : rootCategories.map(cat => (
//             <CategoryRow key={cat.id} category={cat} onEdit={openEdit} onDelete={openDelete}
//               listLang={listLang || primaryCode} primaryCode={primaryCode} />
//           ))}
//         </div>

//         {/* ══════════════════════════════════════
//             Create Dialog
//         ══════════════════════════════════════ */}
//         <Dialog open={showCreateDialog} onOpenChange={open => { setShowCreateDialog(open); if (!open) resetForm() }}>
//           <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
//             <div key={`create-${createLocale || primaryCode}`} dir={languageList.find(l => l.code === (createLocale || primaryCode))?.direction || 'ltr'}>
//               <DialogHeader>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
//                     <FolderTree size={14} className="text-emerald-300" />
//                   </div>
//                   <DialogTitle className="font-syne font-bold text-lg tracking-tight">Create Category</DialogTitle>
//                 </div>
//               </DialogHeader>

//               <div className="space-y-4 py-1">
//                 {/* Jurisdiction + Parent + Active */}
//                 <SectionBlock title="Basic Info">
//                   <div className="space-y-3">
//                     <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//                       <div className="space-y-1.5">
//                         <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//                           Jurisdiction <span className="text-red-400">*</span>
//                         </label>
//                         <select value={formData.jurisdictionId}
//                           onChange={e => handleJurisdictionChange(Number(e.target.value))}
//                           className={selectClass}>
//                           <option value={0}>Select jurisdiction…</option>
//                           {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
//                         </select>
//                       </div>
//                       <div className="space-y-1.5">
//                         <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Parent Category</label>
//                         <select value={formData.parentCategoryId ?? ''}
//                           onChange={e => setFormData(p => ({ ...p, parentCategoryId: e.target.value ? Number(e.target.value) : undefined }))}
//                           className={selectClass}>
//                           <option value="">None (top level)</option>
//                           {formCategories.filter(c => !c.parentCategoryId).map(c => (
//                             <option key={c.id} value={c.id}>{c.name}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>
//                     <Toggle checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
//                   </div>
//                 </SectionBlock>

//                 {/* Name + Description with locale tabs */}
//                 {languageList.length > 0 && (
//                   <SectionBlock title="Name & Description" icon={Globe2}
//                     action={
//                       <div className="flex items-center gap-2">
//                         <TranslationDots formData={formData} languages={languageList} primaryCode={primaryCode} />
//                         <LocaleToggle active={createLocale || primaryCode} onChange={setCreateLocale} languages={languageList} />
//                       </div>
//                     }>
//                     <LocalizedContentFields locale={createLocale || primaryCode} formData={formData} onChange={setFormData} primaryCode={primaryCode} languages={languageList} />
//                   </SectionBlock>
//                 )}
//               </div>

//               <DialogFooter className="gap-2">
//                 <button onClick={() => { setShowCreateDialog(false); resetForm() }}
//                   className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
//                              hover:text-white/85 hover:border-white/20 transition-all duration-200">
//                   Cancel
//                 </button>
//                 <button onClick={() => void handleCreate()} disabled={isLoading || !formData.jurisdictionId || !formData.name}
//                   className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                              text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                              transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
//                   {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
//                   Create Category
//                 </button>
//               </DialogFooter>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* ══════════════════════════════════════
//             Edit Dialog
//         ══════════════════════════════════════ */}
//         <Dialog open={showEditDialog} onOpenChange={open => { setShowEditDialog(open); if (!open) { setSelectedCategory(null); resetForm() } }}>
//           <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
//             <div key={`edit-${editLocale || primaryCode}`} dir={languageList.find(l => l.code === (editLocale || primaryCode))?.direction || 'ltr'}>
//               <DialogHeader>
//                 <div className="flex items-center gap-3">
//                   <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
//                     <Edit size={14} className="text-emerald-300" />
//                   </div>
//                   <DialogTitle className="font-syne font-bold text-lg tracking-tight">Edit Category</DialogTitle>
//                 </div>
//               </DialogHeader>

//               <div className="space-y-4 py-1">
//                 <SectionBlock title="Settings">
//                   <Toggle checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
//                 </SectionBlock>

//                 {languageList.length > 0 && (
//                   <SectionBlock title="Name & Description" icon={Globe2}
//                     action={
//                       <div className="flex items-center gap-2">
//                         <TranslationDots formData={formData} languages={languageList} primaryCode={primaryCode} />
//                         <LocaleToggle active={editLocale || primaryCode} onChange={setEditLocale} languages={languageList} />
//                       </div>
//                     }>
//                     <LocalizedContentFields locale={editLocale || primaryCode} formData={formData} onChange={setFormData} primaryCode={primaryCode} languages={languageList} />
//                   </SectionBlock>
//                 )}
//               </div>

//               <DialogFooter className="gap-2">
//                 <button onClick={() => { setShowEditDialog(false); setSelectedCategory(null); resetForm() }}
//                   className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
//                              hover:text-white/85 hover:border-white/20 transition-all duration-200">
//                   Cancel
//                 </button>
//                 <button onClick={() => void handleUpdate()} disabled={isLoading || !formData.name}
//                   className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                              text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                              transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
//                   {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
//                   Save Changes
//                 </button>
//               </DialogFooter>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* ══════════════════════════════════════
//             Delete Dialog
//         ══════════════════════════════════════ */}
//         <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//           <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
//             <DialogHeader>
//               <div className="flex items-center gap-3">
//                 <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
//                   <Trash2 size={15} className="text-red-400" />
//                 </div>
//                 <DialogTitle className="font-syne font-bold text-base tracking-tight text-red-400">
//                   Delete Category
//                 </DialogTitle>
//               </div>
//             </DialogHeader>
//             <p className="text-sm text-white/45 font-light">
//               This performs a soft delete and removes the category from active workflows.
//             </p>
//             {selectedCategory && (
//               <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
//                 <p className="text-sm text-white/60 font-light">{selectedCategory.name}</p>
//                 <p className="text-xs text-white/30 mt-0.5">
//                   {selectedCategory.questionCount ?? 0} questions · ID #{selectedCategory.id}
//                 </p>
//               </div>
//             )}
//             <DialogFooter className="gap-2">
//               <button onClick={() => { setShowDeleteDialog(false); setSelectedCategory(null) }}
//                 className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55
//                            border border-white/[0.09] hover:text-white/85 hover:border-white/20 transition-all duration-200">
//                 Cancel
//               </button>
//               <button onClick={() => void handleDelete()} disabled={isLoading}
//                 className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                            text-[#12131a] bg-red-400 hover:opacity-85 disabled:opacity-50 transition-all duration-200
//                            [box-shadow:0_0_20px_rgba(248,113,113,0.25)]">
//                 {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
//                 Delete
//               </button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//       </div>
//     </>
//   )
// }


"use client"

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/lib/store/admin-store';
import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store';
import { AdminCategory, CreateCategoryRequest } from '@/lib/types/admin';
import {
  AlertCircle, Check, CheckCircle2, ChevronRight,
  Edit, FolderTree, Globe2, Loader2, Plus, Search,
  SlidersHorizontal, Sparkles, Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ── Types ──────────────────────────────────────────────────────────────────────
interface LocalizedFields {
  name: string;
  description: string;
}

interface CategoryFormData {
  jurisdictionId: number;
  name: string;
  description: string;
  active: boolean;
  parentCategoryId?: number;
  translations: Record<string, LocalizedFields>;
}

// ── Style tokens ───────────────────────────────────────────────────────────────
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
  transition-colors duration-200 resize-none placeholder:text-white/20
`

// ── Helpers ────────────────────────────────────────────────────────────────────
function buildPayload(data: CategoryFormData): CreateCategoryRequest {
  const translations: Record<string, LocalizedFields> = {}
  for (const [code, fields] of Object.entries(data.translations)) {
    if (fields.name.trim() || fields.description.trim()) {
      translations[code] = fields
    }
  }

  const payload: any = {
    jurisdictionId: data.jurisdictionId,
    name: data.name,
    active: data.active,
  }
  if (data.description.trim())           payload.description  = data.description
  if (data.parentCategoryId)             payload.parentCategoryId = data.parentCategoryId
  if (Object.keys(translations).length)  payload.translations = translations
  return payload as CreateCategoryRequest
}

const createBlankForm = (): CategoryFormData => ({
  jurisdictionId: 0, name: '', description: '', active: true,
  translations: {},
})

// ── Shared UI ──────────────────────────────────────────────────────────────────
function SectionBlock({ title, icon: Icon, children, action }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="w-full max-w-full min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex flex-col gap-2 px-5 py-3.5 border-b border-white/[0.06] w-full max-w-full min-w-0 overflow-hidden sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 shrink-0 min-w-fit">
          {Icon && <Icon size={13} className="text-white/30" />}
          <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium whitespace-nowrap">{title}</h4>
        </div>

        {action && (
          <div className="w-full max-w-full min-w-0 overflow-hidden sm:flex-1">
            {action}
          </div>
        )}
      </div>
      <div className="px-5 py-4 w-full max-w-full min-w-0 overflow-x-hidden">{children}</div>
    </div>
  )
}

function Toggle({ checked, onChange }: { checked: boolean | undefined; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group w-fit">
      <div className="relative shrink-0">
        <input type="checkbox" checked={!!checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                        peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                        peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
      </div>
      <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Active</span>
    </label>
  )
}

function LocaleToggle({ active, onChange, languages }: {
  active: string;
  onChange: (c: string) => void;
  languages: { code: string; label: string; native: string; direction?: string }[];
}) {
  return (
    <div className="w-full max-w-full min-w-0 overflow-hidden">
      <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        <div className="inline-flex w-max min-w-max items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl">
          {languages.map(({ code, native }) => (
            <button
              key={code}
              type="button"
              onClick={() => onChange(code)}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                ${active === code
                  ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
                  : 'text-white/35 hover:text-white/70'}`}
            >
              {native}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Localised name + description panel ────────────────────────────────────────
function LocalizedContentFields({
  locale, formData, onChange, primaryCode, languages,
}: {
  locale: string;
  formData: CategoryFormData;
  onChange: (d: CategoryFormData) => void;
  primaryCode: string;
  languages: { code: string; label: string; native: string; direction?: string }[];
}) {
  const currentLang = languages.find(l => l.code === locale);
  const textDirection = currentLang?.direction || 'ltr';
  if (locale === primaryCode) {
    const langLabel = languages.find(l => l.code === locale)?.label ?? locale
    return (
      <div className="space-y-3" dir={textDirection}>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
            Name <span className="text-red-400">*</span>
          </label>
          <input
            value={formData.name}
            onChange={e => onChange({ ...formData, name: e.target.value })}
            placeholder={`Category name in ${langLabel}`}
            className={inputClass}
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Description</label>
          <textarea
            rows={2}
            value={formData.description}
            onChange={e => onChange({ ...formData, description: e.target.value })}
            placeholder={`Optional description in ${langLabel}`}
            className={textareaClass}
          />
        </div>
      </div>
    )
  }

  const current = formData.translations[locale] ?? { name: '', description: '' }
  const langLabel = languages.find(l => l.code === locale)?.label ?? locale

  const setField = (field: keyof LocalizedFields, value: string) =>
    onChange({
      ...formData,
      translations: { ...formData.translations, [locale]: { ...current, [field]: value } },
    })

  return (
    <div className="space-y-3" dir={textDirection}>
      {/* Translation hint */}
      <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
        <Globe2 size={12} className="text-white/25 shrink-0" />
        <p className="text-[11px] text-white/35 font-light leading-relaxed">
          Enter the <span className="text-white/55">{langLabel}</span> translation below.
          Fields left blank will not be included in the payload.
        </p>
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
          Name ({langLabel})
        </label>
        <input
          value={current.name}
          onChange={e => setField('name', e.target.value)}
          placeholder={`Category name in ${langLabel}…`}
          className={inputClass}
        />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
          Description ({langLabel})
        </label>
        <textarea
          rows={2}
          value={current.description}
          onChange={e => setField('description', e.target.value)}
          placeholder={`Description in ${langLabel}…`}
          className={textareaClass}
        />
      </div>
    </div>
  )
}

// ── Translation completeness indicator ─────────────────────────────────────────
function TranslationDots({ formData, languages, primaryCode }: {
  formData: CategoryFormData;
  languages: { code: string; label: string; native: string; direction?: string }[];
  primaryCode: string;
}) {
  const nonPrimary = languages.filter(l => l.code !== primaryCode)
  return (
    <div className="flex items-center gap-1.5">
      {nonPrimary.map(({ code, label }) => {
        const filled = !!(formData.translations[code]?.name?.trim())
        return (
          <span key={code} title={`${label}: ${filled ? 'translated' : 'missing'}`}
            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase tracking-wider
              ${filled
                ? 'text-emerald-300/70 bg-emerald-300/10 border border-emerald-300/20'
                : 'text-white/20 bg-white/[0.03] border border-white/[0.07]'}`}>
            {code}
          </span>
        )
      })}
    </div>
  )
}

// ── Category row (recursive) ───────────────────────────────────────────────────
function CategoryRow({
  category, level = 0, onEdit, onDelete, listLang, primaryCode,
}: {
  category: AdminCategory; level?: number;
  onEdit: (cat: AdminCategory) => void; onDelete: (cat: AdminCategory) => void;
  listLang: string; primaryCode: string;
}) {
  const [expanded, setExpanded] = useState(true)
  const hasSubs = (category.subCategories?.length ?? 0) > 0

  const displayName = listLang === primaryCode
    ? category.name
    : (category.translations as Record<string, any>)?.[listLang]?.name || category.name

  const isTranslated = listLang !== primaryCode && !!(category.translations as Record<string, any>)?.[listLang]?.name

  return (
    <div>
      <div
        className="flex items-center justify-between px-4 py-3.5 rounded-xl border border-white/[0.07]
                   bg-[#181920] hover:border-white/[0.14] transition-all duration-200
                   shadow-[0_2px_12px_rgba(0,0,0,0.18)]"
        style={{ marginLeft: `${level * 1.5}rem` }}
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button type="button" onClick={() => hasSubs && setExpanded(e => !e)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0
              ${hasSubs ? 'text-white/40 hover:text-white/70 hover:bg-white/[0.07]' : 'text-white/20 cursor-default'}`}>
            {hasSubs
              ? <ChevronRight size={14} className={`transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
              : <FolderTree size={13} />}
          </button>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-sm font-medium ${listLang !== primaryCode && !isTranslated ? 'text-white/25 italic' : 'text-[#f0f0f5]'}`}>
                {displayName}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                uppercase tracking-widest border
                                ${category.active
                                  ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20'
                                  : 'text-white/30 bg-white/[0.04] border-white/[0.09]'}`}>
                {category.active ? 'Active' : 'Inactive'}
              </span>
              {category.deletedAt && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                 uppercase tracking-widest border text-red-400 bg-red-400/10 border-red-400/20">
                  Deleted
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-xs text-white/30 font-light">
              <span>ID #{category.id}</span>
              {category.jurisdictionName && <span>· {category.jurisdictionName}</span>}
              <span>· {category.questionCount ?? 0} questions</span>
              {hasSubs && <span>· {category.subCategories!.length} subcategories</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 ml-3">
          <button onClick={() => onEdit(category)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                       text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                       transition-all duration-200">
            <Edit size={12} /> Edit
          </button>
          <button onClick={() => onDelete(category)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                       text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                       hover:bg-red-400/[0.07] transition-all duration-200">
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
      {hasSubs && expanded && (
        <div className="mt-2 space-y-2">
          {category.subCategories!.map(sub => (
            <CategoryRow key={sub.id} category={sub} level={level + 1} onEdit={onEdit} onDelete={onDelete} listLang={listLang} primaryCode={primaryCode} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const {
    categories, isLoading,
    fetchCategories, createCategory, updateCategory, deleteCategory,
    jurisdictions, fetchJurisdictions,
  } = useAdminStore()

  const {
    adminLanguages,
    fetchAdminJurisdictionLanguages,
  } = useJurisdictionLanguageStore()

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog,   setShowEditDialog]   = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null)
  const [filterJurisdictionId, setFilterJurisdictionId] = useState<number | ''>('')
  const [listLang, setListLang] = useState<string>('')
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const [formData,       setFormData]       = useState<CategoryFormData>(createBlankForm())
  const [createLocale,   setCreateLocale]   = useState<string>('')
  const [editLocale,     setEditLocale]     = useState<string>('')
  const [formCategories, setFormCategories] = useState<AdminCategory[]>([])

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

  // Debug: Log language list with directions
  useEffect(() => {
    if (languageList.length > 0) {
      console.log('Language list with directions:', languageList)
    }
  }, [languageList])

  // Fetch languages when jurisdiction changes in create dialog
  const handleJurisdictionChange = useCallback((jurisdictionId: number) => {
    setFormData(p => ({ ...p, jurisdictionId, parentCategoryId: undefined, translations: {} }))
    if (jurisdictionId) {
      void fetchAdminJurisdictionLanguages(jurisdictionId)
      fetchCategories(jurisdictionId).then(() => {
        setFormCategories(useAdminStore.getState().categories)
      }).catch(() => setFormCategories([]))
    } else {
      setFormCategories([])
    }
  }, [fetchAdminJurisdictionLanguages, fetchCategories])

  // Set default locale tab when languages load
  useEffect(() => {
    if (primaryCode && !createLocale) {
      setCreateLocale(primaryCode)
    }
  }, [primaryCode, createLocale])

  useEffect(() => {
    if (primaryCode && !editLocale) {
      setEditLocale(primaryCode)
    }
  }, [primaryCode, editLocale])

  useEffect(() => { void fetchJurisdictions() }, [fetchJurisdictions])
  useEffect(() => { void fetchCategories() }, [fetchCategories])

  const handleFetchCategories = () => {
    void fetchCategories(filterJurisdictionId === '' ? undefined : filterJurisdictionId)
  }

  const resetForm = () => { setFormData(createBlankForm()); setCreateLocale(''); setEditLocale(''); setFormCategories([]) }

  const handleCreate = async () => {
    try {
      await createCategory(buildPayload(formData))
      setShowCreateDialog(false); resetForm(); handleFetchCategories()
      setFeedback({ type: 'success', message: 'Category created successfully.' })
    } catch { setFeedback({ type: 'error', message: 'Failed to create category.' }) }
  }

  const handleUpdate = async () => {
    if (!selectedCategory) return
    try {
      await updateCategory(selectedCategory.id, buildPayload(formData))
      setShowEditDialog(false); setSelectedCategory(null); resetForm(); handleFetchCategories()
      setFeedback({ type: 'success', message: 'Category updated successfully.' })
    } catch { setFeedback({ type: 'error', message: 'Failed to update category.' }) }
  }

  const handleDelete = async () => {
    if (!selectedCategory) return
    try {
      await deleteCategory(selectedCategory.id)
      setShowDeleteDialog(false); setSelectedCategory(null); handleFetchCategories()
      setFeedback({ type: 'success', message: 'Category deleted.' })
    } catch { setFeedback({ type: 'error', message: 'Failed to delete category.' }) }
  }

  const openEdit = async (cat: AdminCategory) => {
    setSelectedCategory(cat)
    void fetchAdminJurisdictionLanguages(cat.jurisdictionId)
    try {
      await fetchCategories(cat.jurisdictionId)
      setFormCategories(useAdminStore.getState().categories)
    } catch { setFormCategories([]) }
    const translations: Record<string, LocalizedFields> = {}
    if ((cat as any).translations) {
      for (const [code, fields] of Object.entries((cat as any).translations as Record<string, any>)) {
        translations[code] = {
          name: fields?.name ?? '',
          description: fields?.description ?? '',
        }
      }
    }
    setFormData({
      jurisdictionId:  cat.jurisdictionId,
      name:            cat.name,
      description:     (cat as any).description ?? '',
      active:          cat.active,
      parentCategoryId: cat.parentCategoryId ?? undefined,
      translations,
    })
    setEditLocale('')
    setShowEditDialog(true)
  }

  const openDelete = (cat: AdminCategory) => { setSelectedCategory(cat); setShowDeleteDialog(true) }

  const rootCategories = categories.filter(c => !c.parentCategoryId)

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
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/[0.08] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-14 left-16 h-48 w-48 rounded-full bg-sky-300/[0.06] blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                              bg-emerald-300/10 border border-emerald-300/20 mb-3">
                <Sparkles size={11} className="text-emerald-300" />
                <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
                  Admin · Categories
                </span>
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Categories</h1>
              <p className="text-sm text-white/40 font-light mt-1">
                Organise questions into categories and subcategories.
              </p>
            </div>
            <button onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
              <Plus size={15} /> Create Category
            </button>
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
              className="text-xs text-white/25 underline hover:text-white/50 shrink-0 transition-colors">
              Dismiss
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
          <div className="flex items-center gap-3">
            <select value={filterJurisdictionId}
              onChange={e => {
                const val = e.target.value ? Number(e.target.value) : '' as const
                setFilterJurisdictionId(val)
                if (val) {
                  void fetchAdminJurisdictionLanguages(val)
                }
                setListLang('')
              }}
              className={`${selectClass} flex-1`}>
              <option value="">All Jurisdictions</option>
              {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
            <button onClick={handleFetchCategories} disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Fetch Categories
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
                      ${(listLang || primaryCode) === code
                        ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                        : 'text-white/30 hover:text-white/60'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Categories list ── */}
        <div key={`list-${listLang || primaryCode}`} className="space-y-2 animate-fade-up delay-2" dir={languageList.find(l => l.code === (listLang || primaryCode))?.direction || 'ltr'}>
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />
            ))
          ) : rootCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
                            border border-dashed border-white/[0.08] text-center">
              <FolderTree size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No categories found. Create one to get started.</p>
            </div>
          ) : rootCategories.map(cat => (
            <CategoryRow key={cat.id} category={cat} onEdit={openEdit} onDelete={openDelete}
              listLang={listLang || primaryCode} primaryCode={primaryCode} />
          ))}
        </div>

        {/* ══════════════════════════════════════
            Create Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showCreateDialog} onOpenChange={open => { setShowCreateDialog(open); if (!open) resetForm() }}>
          <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <div
              key={`create-${createLocale || primaryCode}`}
              className="w-full max-w-full min-w-0 overflow-x-hidden"
              dir={languageList.find(l => l.code === (createLocale || primaryCode))?.direction || 'ltr'}
            >
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                    <FolderTree size={14} className="text-emerald-300" />
                  </div>
                  <DialogTitle className="font-syne font-bold text-lg tracking-tight">Create Category</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-1">
                {/* Jurisdiction + Parent + Active */}
                <SectionBlock title="Basic Info">
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                          Jurisdiction <span className="text-red-400">*</span>
                        </label>
                        <select value={formData.jurisdictionId}
                          onChange={e => handleJurisdictionChange(Number(e.target.value))}
                          className={selectClass}>
                          <option value={0}>Select jurisdiction…</option>
                          {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Parent Category</label>
                        <select value={formData.parentCategoryId ?? ''}
                          onChange={e => setFormData(p => ({ ...p, parentCategoryId: e.target.value ? Number(e.target.value) : undefined }))}
                          className={selectClass}>
                          <option value="">None (top level)</option>
                          {formCategories.filter(c => !c.parentCategoryId).map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <Toggle checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
                  </div>
                </SectionBlock>

                {/* Name + Description with locale tabs */}
                {languageList.length > 0 && (
                  <SectionBlock title="Name & Description" icon={Globe2}
                    action={
                      <div className="flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden">
                        {/* <div className="shrink-0">
                          <TranslationDots formData={formData} languages={languageList} primaryCode={primaryCode} />
                        </div> */}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <LocaleToggle active={createLocale || primaryCode} onChange={setCreateLocale} languages={languageList} />
                        </div>
                      </div>
                    }>
                    <LocalizedContentFields locale={createLocale || primaryCode} formData={formData} onChange={setFormData} primaryCode={primaryCode} languages={languageList} />
                  </SectionBlock>
                )}
              </div>

              <DialogFooter className="gap-2">
                <button onClick={() => { setShowCreateDialog(false); resetForm() }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                             hover:text-white/85 hover:border-white/20 transition-all duration-200">
                  Cancel
                </button>
                <button onClick={() => void handleCreate()} disabled={isLoading || !formData.jurisdictionId || !formData.name}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                             transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Create Category
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Edit Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showEditDialog} onOpenChange={open => { setShowEditDialog(open); if (!open) { setSelectedCategory(null); resetForm() } }}>
          <DialogContent className="max-w-lg w-[calc(100vw-2rem)] max-h-[90vh] overflow-y-auto overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <div
              key={`edit-${editLocale || primaryCode}`}
              className="w-full max-w-full min-w-0 overflow-x-hidden"
              dir={languageList.find(l => l.code === (editLocale || primaryCode))?.direction || 'ltr'}
            >
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                    <Edit size={14} className="text-emerald-300" />
                  </div>
                  <DialogTitle className="font-syne font-bold text-lg tracking-tight">Edit Category</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-1">
                <SectionBlock title="Settings">
                  <Toggle checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
                </SectionBlock>

                {languageList.length > 0 && (
                  <SectionBlock title="Name & Description" icon={Globe2}
                    action={
                      <div className="flex w-full max-w-full min-w-0 items-center gap-2 overflow-hidden">
                        {/* <div className="shrink-0">
                          <TranslationDots formData={formData} languages={languageList} primaryCode={primaryCode} />
                        </div> */}
                        <div className="min-w-0 flex-1 overflow-hidden">
                          <LocaleToggle active={editLocale || primaryCode} onChange={setEditLocale} languages={languageList} />
                        </div>
                      </div>
                    }>
                    <LocalizedContentFields locale={editLocale || primaryCode} formData={formData} onChange={setFormData} primaryCode={primaryCode} languages={languageList} />
                  </SectionBlock>
                )}
              </div>

              <DialogFooter className="gap-2">
                <button onClick={() => { setShowEditDialog(false); setSelectedCategory(null); resetForm() }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                             hover:text-white/85 hover:border-white/20 transition-all duration-200">
                  Cancel
                </button>
                <button onClick={() => void handleUpdate()} disabled={isLoading || !formData.name}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                             transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Save Changes
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Delete Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <DialogTitle className="font-syne font-bold text-base tracking-tight text-red-400">
                  Delete Category
                </DialogTitle>
              </div>
            </DialogHeader>
            <p className="text-sm text-white/45 font-light">
              This performs a soft delete and removes the category from active workflows.
            </p>
            {selectedCategory && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <p className="text-sm text-white/60 font-light">{selectedCategory.name}</p>
                <p className="text-xs text-white/30 mt-0.5">
                  {selectedCategory.questionCount ?? 0} questions · ID #{selectedCategory.id}
                </p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <button onClick={() => { setShowDeleteDialog(false); setSelectedCategory(null) }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55
                           border border-white/[0.09] hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleDelete()} disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-red-400 hover:opacity-85 disabled:opacity-50 transition-all duration-200
                           [box-shadow:0_0_20px_rgba(248,113,113,0.25)]">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  )
}