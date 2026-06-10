"use client"

import { useEffect, useState, useCallback } from 'react';
import { useAdminStore } from '@/lib/store/admin-store';
import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store';
import { LicenceCategory, CreateLicenceCategoryRequest, UpdateLicenceCategoryRequest } from '@/lib/types/admin';
import {
  AlertCircle, Award, Check, CheckCircle2, ChevronLeft, ChevronRight,
  Edit, ExternalLink, Globe2, Loader2, Plus, Search, SlidersHorizontal, Sparkles, Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ── Types ──────────────────────────────────────────────────────────────────────
interface LocalizedFields {
  name: string;
  description: string;
}

interface LicenceCategoryFormData {
  jurisdictionId: number;
  code: string;
  name: string;
  description: string;
  isDefault: boolean;
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
function buildCreatePayload(data: LicenceCategoryFormData): CreateLicenceCategoryRequest {
  const translations: Record<string, { name?: string; description?: string }> = {}
  for (const [code, fields] of Object.entries(data.translations)) {
    if (fields.name.trim() || fields.description.trim()) {
      translations[code] = {
        ...(fields.name.trim() && { name: fields.name }),
        ...(fields.description.trim() && { description: fields.description }),
      }
    }
  }
  const payload: CreateLicenceCategoryRequest = {
    jurisdictionId: data.jurisdictionId,
    code: data.code,
    name: data.name,
    isDefault: data.isDefault,
  }
  if (data.description.trim()) payload.description = data.description
  if (Object.keys(translations).length) payload.translations = translations
  return payload
}

function buildUpdatePayload(data: LicenceCategoryFormData): UpdateLicenceCategoryRequest {
  const translations: Record<string, { name?: string; description?: string }> = {}
  for (const [code, fields] of Object.entries(data.translations)) {
    if (fields.name.trim() || fields.description.trim()) {
      translations[code] = {
        ...(fields.name.trim() && { name: fields.name }),
        ...(fields.description.trim() && { description: fields.description }),
      }
    }
  }
  const payload: UpdateLicenceCategoryRequest = {
    code: data.code,
    name: data.name,
    isDefault: data.isDefault,
  }
  if (data.description.trim()) payload.description = data.description
  if (Object.keys(translations).length) payload.translations = translations
  return payload
}

const createBlankForm = (): LicenceCategoryFormData => ({
  jurisdictionId: 0, code: '', name: '', description: '', isDefault: false,
  translations: {},
})

// ── Shared UI ──────────────────────────────────────────────────────────────────
function SectionBlock({ title, icon: Icon, children, action }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex flex-col gap-2 px-5 py-3.5 border-b border-white/[0.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-white/30" />}
          <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{title}</h4>
        </div>
        {action && <div className="flex items-center">{action}</div>}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

function LocaleToggle({ active, onChange, languages }: {
  active: string;
  onChange: (c: string) => void;
  languages: { code: string; label: string; native: string; direction?: string }[];
}) {
  return (
    <div className="flex items-center gap-0.5 p-1 bg-white/[0.04] border border-white/[0.08] rounded-xl flex-wrap">
      {languages.map(({ code, native }) => (
        <button key={code} type="button" onClick={() => onChange(code)}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
            ${active === code
              ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
              : 'text-white/35 hover:text-white/70'}`}>
          {native}
        </button>
      ))}
    </div>
  )
}

function TranslationDots({ formData, languages, primaryCode }: {
  formData: LicenceCategoryFormData;
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

// ── Localised name + description panel ────────────────────────────────────────
function LocalizedContentFields({
  locale, formData, onChange, primaryCode, languages,
}: {
  locale: string;
  formData: LicenceCategoryFormData;
  onChange: (d: LicenceCategoryFormData) => void;
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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LicenceCategoriesPage() {
  const {
    licenceCategories, isLoading,
    fetchLicenceCategories, createLicenceCategory, updateLicenceCategory, deleteLicenceCategory,
    jurisdictions, fetchJurisdictions,
  } = useAdminStore();

  const {
    adminLanguages,
    fetchAdminJurisdictionLanguages,
  } = useJurisdictionLanguageStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog,   setShowEditDialog]   = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<LicenceCategory | null>(null);
  const [filterJurisdictionId, setFilterJurisdictionId] = useState<number | ''>('');
  const [currentPage, setCurrentPage] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const pageSize = 20;

  const [formData,     setFormData]     = useState<LicenceCategoryFormData>(createBlankForm());
  const [createLocale, setCreateLocale] = useState<string>('');
  const [editLocale,   setEditLocale]   = useState<string>('');
  const [listLang,     setListLang]     = useState<string>('');

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

  // Fetch languages when jurisdiction changes in create dialog
  const handleJurisdictionChange = useCallback((jurisdictionId: number) => {
    setFormData(p => ({ ...p, jurisdictionId, translations: {} }))
    if (jurisdictionId) {
      void fetchAdminJurisdictionLanguages(jurisdictionId)
    }
  }, [fetchAdminJurisdictionLanguages])

  // Set default locale tab when languages load
  useEffect(() => {
    if (primaryCode && !createLocale) setCreateLocale(primaryCode)
  }, [primaryCode, createLocale])

  useEffect(() => {
    if (primaryCode && !editLocale) setEditLocale(primaryCode)
  }, [primaryCode, editLocale])

  useEffect(() => { void fetchJurisdictions() }, [fetchJurisdictions]);

  useEffect(() => {
    if (licenceCategories && currentPage > 0) void loadLicenceCategories();
  }, [currentPage]);

  const loadLicenceCategories = async () => {
    const params: Record<string, unknown> = { page: currentPage, size: pageSize };
    if (filterJurisdictionId !== '') params.jurisdictionId = filterJurisdictionId;
    await fetchLicenceCategories(params);
  };

  const handleFetch = async () => {
    setCurrentPage(0);
    const params: Record<string, unknown> = { page: 0, size: pageSize };
    if (filterJurisdictionId !== '') params.jurisdictionId = filterJurisdictionId;
    await fetchLicenceCategories(params);
  };

  const resetForm = () => { setFormData(createBlankForm()); setCreateLocale(''); setEditLocale('') };

  const handleCreate = async () => {
    try {
      await createLicenceCategory(buildCreatePayload(formData));
      setShowCreateDialog(false); resetForm(); void handleFetch();
      setFeedback({ type: 'success', message: 'Licence category created successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to create licence category.' }) }
  };

  const handleUpdate = async () => {
    if (!selectedCategory) return;
    try {
      await updateLicenceCategory(selectedCategory.id, buildUpdatePayload(formData));
      setShowEditDialog(false); setSelectedCategory(null); resetForm(); void handleFetch();
      setFeedback({ type: 'success', message: 'Licence category updated successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to update licence category.' }) }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;
    try {
      await deleteLicenceCategory(selectedCategory.id);
      setShowDeleteDialog(false); setSelectedCategory(null); void handleFetch();
      setFeedback({ type: 'success', message: 'Licence category deleted.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to delete licence category.' }) }
  };

  const openEdit = (category: LicenceCategory) => {
    setSelectedCategory(category)
    void fetchAdminJurisdictionLanguages(category.jurisdictionId)
    const translations: Record<string, LocalizedFields> = {}
    if (category.translations) {
      for (const [code, fields] of Object.entries(category.translations)) {
        translations[code] = {
          name: fields?.name ?? '',
          description: fields?.description ?? '',
        }
      }
    }
    setFormData({
      jurisdictionId: category.jurisdictionId,
      code: category.code,
      name: category.name,
      description: category.description ?? '',
      isDefault: category.isDefault ?? false,
      translations,
    })
    setEditLocale('')
    setShowEditDialog(true)
  }

  const content = licenceCategories?.content ?? [];

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
                  Admin · Licence Categories
                </span>
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Licence Categories</h1>
              <p className="text-sm text-white/40 font-light mt-1">
                Manage licence categories for different jurisdictions.
              </p>
            </div>
            <button onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
              <Plus size={15} /> Create Licence Category
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select value={filterJurisdictionId}
              onChange={e => {
                const val = e.target.value ? Number(e.target.value) : '' as const
                setFilterJurisdictionId(val)
                if (val) {
                  void fetchAdminJurisdictionLanguages(val)
                }
                setListLang('')
              }}
              className={`${selectClass} sm:flex-1`}>
              <option value="">All Jurisdictions</option>
              {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
            <button onClick={() => void handleFetch()} disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                         disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Fetch Categories
            </button>
          </div>
        </div>

        {/* ── Language switcher for list ── */}
        {filterJurisdictionId !== '' && languageList.length > 1 && (
          <div className="flex justify-end animate-fade-up delay-1">
            <div className="grid grid-cols-6 gap-1">
              {languageList.map(({ code, label }) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setListLang(code)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap text-center
                    ${(listLang || primaryCode) === code
                      ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                      : 'text-white/30 hover:text-white/60 bg-white/[0.03] border border-white/[0.07]'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Grid ── */}
        <div key={`list-${listLang || primaryCode}`} className="animate-fade-up delay-2" dir={languageList.find(l => l.code === (listLang || primaryCode))?.direction || 'ltr'}>
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
          ) : content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
                            border border-dashed border-white/[0.08] text-center">
              <Award size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No licence categories found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {content.map(category => (
                <div key={category.id}
                  className="flex flex-col bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                             hover:border-white/[0.14] transition-all duration-200
                             shadow-[0_2px_16px_rgba(0,0,0,0.2)]">

                  {/* Card header */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                                    flex items-center justify-center shrink-0">
                      <Award size={16} className="text-emerald-300" />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-sm font-medium leading-snug truncate ${listLang && listLang !== primaryCode && !(category.translations as Record<string, any>)?.[listLang]?.name ? 'text-white/25 italic' : 'text-[#f0f0f5]'}`}>
                        {listLang && listLang !== primaryCode
                          ? ((category.translations as Record<string, any>)?.[listLang]?.name || category.name)
                          : category.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                         uppercase tracking-widest border text-emerald-300 bg-emerald-300/10 border-emerald-300/20">
                          {category.code}
                        </span>
                        {category.isDefault && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                           uppercase tracking-widest border text-sky-300 bg-sky-300/10 border-sky-300/20">
                            Default
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {(() => {
                    const desc = listLang && listLang !== primaryCode
                      ? ((category.translations as Record<string, any>)?.[listLang]?.description || category.description)
                      : category.description
                    return desc ? (
                      <p className="text-xs text-white/30 font-light leading-relaxed line-clamp-2 mb-3">
                        {desc}
                      </p>
                    ) : null
                  })()}

                  {/* Meta rows */}
                  <div className="space-y-1.5 text-xs text-white/35 font-light mb-5 flex-1">
                    <div className="flex items-center justify-between">
                      <span>ID</span>
                      <span className="text-white/55 tabular-nums">#{category.id}</span>
                    </div>
                    {category.jurisdictionName && (
                      <div className="flex items-center justify-between">
                        <span>Jurisdiction</span>
                        <span className="text-white/55">{category.jurisdictionName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Questions</span>
                      <span className="text-white/55 tabular-nums">{category.questionCount ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Created</span>
                      <span className="text-white/55 tabular-nums">
                        {new Date(category.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center gap-1.5 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={() => openEdit(category)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                 transition-all duration-200">
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => { window.location.href = `/backoffice/licence-categories/${category.id}` }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                 transition-all duration-200">
                      <ExternalLink size={12} /> Questions
                    </button>
                    <button
                      onClick={() => { setSelectedCategory(category); setShowDeleteDialog(true) }}
                      className="w-8 h-8 flex items-center justify-center rounded-xl text-red-400/50
                                 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                                 hover:bg-red-400/[0.07] transition-all duration-200 shrink-0">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {licenceCategories && licenceCategories.totalPages > 1 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1">
            <p className="text-xs text-white/30 tabular-nums">
              Page {currentPage + 1} of {licenceCategories.totalPages} · {licenceCategories.numberOfElements} of {licenceCategories.totalElements} results
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronLeft size={13} /> Previous
              </button>
              <button onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= licenceCategories.totalPages - 1 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            Create Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showCreateDialog} onOpenChange={open => { setShowCreateDialog(open); if (!open) resetForm() }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <div key={`create-${createLocale || primaryCode}`} dir={languageList.find(l => l.code === (createLocale || primaryCode))?.direction || 'ltr'}>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                    <Award size={14} className="text-emerald-300" />
                  </div>
                  <DialogTitle className="font-syne font-bold text-lg tracking-tight">Create Licence Category</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-1">
                {/* Basic info */}
                <SectionBlock title="Basic Info">
                  <div className="space-y-3">
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
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                          Code <span className="text-red-400">*</span>
                        </label>
                        <input value={formData.code}
                          onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                          placeholder="e.g. CAT_B"
                          className={inputClass} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                          Default
                        </label>
                        <label className="flex items-center gap-3 cursor-pointer group h-10">
                          <div className="relative shrink-0">
                            <input type="checkbox" checked={formData.isDefault}
                              onChange={e => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                              className="sr-only peer" />
                            <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                            peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
                            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                            peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
                          </div>
                          <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Default</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </SectionBlock>

                {/* Name & Description with locale tabs */}
                {languageList.length > 0 && (
                <SectionBlock title="Name & Description" icon={Globe2}
                  action={
                    <div className="flex items-center gap-2">
                      <TranslationDots formData={formData} languages={languageList} primaryCode={primaryCode} />
                      <LocaleToggle active={createLocale || primaryCode} onChange={setCreateLocale} languages={languageList} />
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
                <button onClick={() => void handleCreate()} disabled={isLoading || !formData.jurisdictionId || !formData.code || !formData.name}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                             transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Create
                </button>
              </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Edit Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showEditDialog} onOpenChange={open => { setShowEditDialog(open); if (!open) { setSelectedCategory(null); resetForm() } }}>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <div key={`edit-${editLocale || primaryCode}`} dir={languageList.find(l => l.code === (editLocale || primaryCode))?.direction || 'ltr'}>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                    <Edit size={14} className="text-emerald-300" />
                  </div>
                  <DialogTitle className="font-syne font-bold text-lg tracking-tight">Edit Licence Category</DialogTitle>
                </div>
              </DialogHeader>

              <div className="space-y-4 py-1">
                {/* Code + Default */}
                <SectionBlock title="Settings">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        Code <span className="text-red-400">*</span>
                      </label>
                      <input value={formData.code}
                        onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                        className={inputClass} />
                    </div>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative shrink-0">
                        <input type="checkbox" checked={formData.isDefault}
                          onChange={e => setFormData(p => ({ ...p, isDefault: e.target.checked }))}
                          className="sr-only peer" />
                        <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                        peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                        peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
                      </div>
                      <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Default category</span>
                    </label>
                  </div>
                </SectionBlock>

                {/* Name & Description with locale tabs */}
                {languageList.length > 0 && (
                <SectionBlock title="Name & Description" icon={Globe2}
                  action={
                    <div className="flex items-center gap-2">
                      <TranslationDots formData={formData} languages={languageList} primaryCode={primaryCode} />
                      <LocaleToggle active={editLocale || primaryCode} onChange={setEditLocale} languages={languageList} />
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
                <button onClick={() => void handleUpdate()} disabled={isLoading || !formData.name || !formData.code}
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
                  Delete Licence Category
                </DialogTitle>
              </div>
            </DialogHeader>
            <p className="text-sm text-white/45 font-light">
              This performs a soft delete and removes the licence category from active workflows.
            </p>
            {selectedCategory && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <p className="text-sm text-white/60 font-medium">{selectedCategory.name}</p>
                <p className="text-xs text-white/30 mt-0.5 font-light">
                  {selectedCategory.code} · ID #{selectedCategory.id}
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
  );
}