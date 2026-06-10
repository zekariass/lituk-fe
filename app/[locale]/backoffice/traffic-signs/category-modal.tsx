"use client"

import { useState, useEffect } from 'react'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { adminTrafficSignCategoryApi } from '@/lib/api/admin-traffic-signs'
import { Upload, Loader2, Check, Globe2, ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { getAssetUrl } from '@/lib/utils/asset-url'

// Language type received from parent
interface LangInfo { code: string; label: string; native: string; isPrimary: boolean; direction?: string }

function SectionBlock({ title, icon: Icon, children, action }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/40">
          {Icon && <Icon size={13} />}
          {title}
        </h4>
        {action}
      </div>
      {children}
    </div>
  )
}

function LocaleToggle({ active, onChange, languages }: {
  active: string; onChange: (c: string) => void;
  languages: LangInfo[];
}) {
  return (
    <div className="overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
      <div className="flex items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl min-w-max">
        {languages.map(({ code, native }) => (
          <button key={code} type="button" onClick={() => onChange(code)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
              ${active === code
                ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                : 'text-white/30 hover:text-white/60'}`}>
            {native}
          </button>
        ))}
      </div>
    </div>
  )
}

const inputClass = `w-full px-3 py-2.5 rounded-xl text-sm font-light
  bg-white/[0.03] border border-white/[0.09] text-[#f0f0f5]
  placeholder:text-white/20 focus:outline-none focus:border-emerald-300/40
  focus:bg-white/[0.05] transition-colors duration-200`

const textareaClass = `w-full px-3 py-2.5 rounded-xl text-sm font-light
  bg-white/[0.03] border border-white/[0.09] text-[#f0f0f5]
  placeholder:text-white/20 focus:outline-none focus:border-emerald-300/40
  focus:bg-white/[0.05] transition-colors duration-200 resize-none`

export function CategoryModal({ languages, primaryCode }: {
  languages: LangInfo[]; primaryCode: string;
}) {
  const {
    isCategoryModalOpen,
    editingCategory,
    selectedJurisdictionId,
    setCategoryModalOpen,
    setEditingCategory,
    addCategory,
    updateCategory,
  } = useAdminTrafficSignStore()

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    translations: {} as Record<string, { name: string; description: string }>,
    isActive: true,
  })

  const [locale, setLocale] = useState<string>(primaryCode || 'en')

  const [iconFile, setIconFile] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingCategory) {
      // Build translations dynamically from existing data
      const translations: Record<string, { name: string; description: string }> = {}
      if (editingCategory.translations) {
        for (const [code, fields] of Object.entries(editingCategory.translations as Record<string, any>)) {
          translations[code] = { name: fields?.name || '', description: fields?.description || '' }
        }
      }
      setFormData({
        name: editingCategory.name || '',
        description: editingCategory.description || '',
        translations,
        isActive: editingCategory.isActive ?? true,
      })
      if (editingCategory.asset) {
        setIconPreview(getAssetUrl(editingCategory.asset.url))
      }
    } else {
      resetForm()
    }
  }, [editingCategory])

  // Reset locale tab when primaryCode changes
  useEffect(() => {
    if (primaryCode) setLocale(primaryCode)
  }, [primaryCode])

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      translations: {},
      isActive: true,
    })
    setIconFile(null)
    setIconPreview(null)
    setError(null)
    setLocale(primaryCode || 'en')
  }

  const handleClose = () => {
    setCategoryModalOpen(false)
    setEditingCategory(null)
    resetForm()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Only JPG, PNG, and WEBP files are allowed')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5 MB')
      return
    }

    setIconFile(file)
    setIconPreview(URL.createObjectURL(file))
    setError(null)
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required')
      return false
    }
    if (formData.name.length > 255) {
      setError('Name must be less than 255 characters')
      return false
    }
    if (!formData.description.trim()) {
      setError('Description is required')
      return false
    }
    if (formData.description.length > 1000) {
      setError('Description must be less than 1000 characters')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!selectedJurisdictionId) {
      setError('Please select a jurisdiction first')
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('jurisdictionId', String(selectedJurisdictionId))
      formDataToSend.append('name', formData.name)
      formDataToSend.append('description', formData.description)
      formDataToSend.append('isActive', String(formData.isActive))

      // Build translations dynamically from all non-primary languages
      const translations: Record<string, { name?: string; description?: string }> = {}
      for (const [code, fields] of Object.entries(formData.translations)) {
        if (code === primaryCode) continue
        if (fields.name?.trim() || fields.description?.trim()) {
          translations[code] = {
            ...(fields.name?.trim() && { name: fields.name }),
            ...(fields.description?.trim() && { description: fields.description }),
          }
        }
      }

      if (Object.keys(translations).length > 0) {
        formDataToSend.append('translations', JSON.stringify(translations))
      }

      if (iconFile) {
        formDataToSend.append('asset', iconFile)
      }

      let result
      if (editingCategory) {
        result = await adminTrafficSignCategoryApi.updateCategory(editingCategory.id, formDataToSend)
        updateCategory(result)
      } else {
        result = await adminTrafficSignCategoryApi.createCategory(formDataToSend)
        addCategory(result)
      }

      handleClose()
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error?.message || 
                          err?.message || 
                          'Failed to save category'
      setError(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isCategoryModalOpen) return null

  return (
    <Dialog open={isCategoryModalOpen} onOpenChange={setCategoryModalOpen}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto
                                bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5]">
        <div key={`modal-${locale}`} dir={languages.find(l => l.code === locale)?.direction || 'ltr'}>
        <DialogHeader>
          <DialogTitle className="font-syne font-bold text-lg tracking-tight">
            {editingCategory ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-xl bg-red-400/10 border border-red-400/20">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-dm">
          {/* Basic Info */}
          <SectionBlock title="Basic Info">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                  Category Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Warning Signs"
                  className={inputClass}
                  maxLength={255}
                  disabled={isSubmitting}
                />
                <p className="text-[11px] text-white/25 font-light">
                  {formData.name.length} / 255 characters
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe this category..."
                  className={textareaClass}
                  maxLength={1000}
                  disabled={isSubmitting}
                />
                <p className="text-[11px] text-white/25 font-light">
                  {formData.description.length} / 1000 characters
                </p>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative shrink-0">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="sr-only peer"
                    disabled={isSubmitting}
                  />
                  <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
                </div>
                <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">
                  Active
                </span>
              </label>
            </div>
          </SectionBlock>

          {/* Translations */}
          <SectionBlock title="Translations" icon={Globe2}
            action={<LocaleToggle active={locale} onChange={setLocale} languages={languages} />}>
            {(() => {
              const langLabel = languages.find(l => l.code === locale)?.label ?? locale
              const current = formData.translations[locale] ?? { name: '', description: '' }
              const isPrimary = locale === primaryCode
              return (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Name in {langLabel}
                    </label>
                    <input
                      type="text"
                      value={isPrimary ? formData.name : current.name}
                      onChange={(e) => {
                        if (isPrimary) {
                          setFormData({ ...formData, name: e.target.value })
                        } else {
                          setFormData({
                            ...formData,
                            translations: {
                              ...formData.translations,
                              [locale]: { ...current, name: e.target.value }
                            },
                          })
                        }
                      }}
                      placeholder={`Category name in ${langLabel}`}
                      className={inputClass}
                      maxLength={255}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Description in {langLabel}
                    </label>
                    <textarea
                      rows={3}
                      value={isPrimary ? formData.description : current.description}
                      onChange={(e) => {
                        if (isPrimary) {
                          setFormData({ ...formData, description: e.target.value })
                        } else {
                          setFormData({
                            ...formData,
                            translations: {
                              ...formData.translations,
                              [locale]: { ...current, description: e.target.value }
                            },
                          })
                        }
                      }}
                      placeholder={`Description in ${langLabel}`}
                      className={textareaClass}
                      maxLength={1000}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              )
            })()}
          </SectionBlock>

          {/* Category Icon */}
          <SectionBlock title="Category Icon" icon={ImageIcon}>
            <div className="flex items-start gap-4">
              {iconPreview && (
                <div className="flex-shrink-0">
                  <Image
                    src={iconPreview}
                    alt="Icon preview"
                    width={80}
                    height={80}
                    className="rounded-xl border border-white/[0.09] object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-white/[0.09] hover:border-white/20 rounded-xl p-6 text-center transition-colors">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-white/30" />
                    <p className="text-sm text-white/60 mb-1">
                      {iconFile ? iconFile.name : 'Choose file or drag and drop'}
                    </p>
                    <p className="text-xs text-white/30">
                      JPG, PNG, WEBP • Max 5 MB
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                </label>
              </div>
            </div>
          </SectionBlock>
        </form>

        <DialogFooter className="gap-2">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                       hover:text-white/85 hover:border-white/20 transition-all duration-200"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                       transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]"
          >
            {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {isSubmitting ? 'Saving...' : editingCategory ? 'Save Changes' : 'Create Category'}
          </button>
        </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
