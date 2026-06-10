"use client"

import { useState, useEffect } from 'react'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { adminTrafficSignApi } from '@/lib/api/admin-traffic-signs'
import {
  Upload, Loader2, X, Plus, Trash2, AlertCircle,
  Image as ImageIcon, CheckCircle2,
} from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { QuillEditor } from '@/components/ui/quill-editor'
import { getAssetUrl } from '@/lib/utils/asset-url'

// Language type received from parent
interface LangInfo { code: string; label: string; native: string; isPrimary: boolean }

interface SignModalProps {
  isOpen: boolean
  onClose: () => void
  categoryId: number
  editingSign?: any
  languages: LangInfo[]
  primaryCode: string
}

// ── Shared field styles ───────────────────────────────────────────────────────
const fieldLabel = `block text-[10px] uppercase tracking-widest text-white/30 font-medium mb-1.5`
const textInputClass = `
  w-full text-sm text-[#f0f0f5] font-light bg-[#13141b] border border-white/[0.09] rounded-xl
  px-4 py-2.5 focus:outline-none focus:border-emerald-300/40 transition-colors duration-200
  placeholder:text-white/20
`

export function SignModal({ isOpen, onClose, categoryId, editingSign, languages, primaryCode }: SignModalProps) {
  const { addSign, updateSign } = useAdminTrafficSignStore()
  const [currentLocale, setCurrentLocale] = useState<string>(primaryCode || 'en')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    description: '',
    translations: {} as Record<string, { description: string }>,
    isActive: true,
  })

  const [signFile, setSignFile] = useState<File | null>(null)
  const [signPreview, setSignPreview] = useState<string>('')

  const [additionalAssets, setAdditionalAssets] = useState<Array<{
    file: File | null; caption: string; order: number; preview?: string
  }>>([])

  const [realLifeAssets, setRealLifeAssets] = useState<Array<{
    file: File | null; caption: string; order: number; preview?: string
  }>>([])

  // Track existing assets marked for deletion (by URL)
  const [deletedAdditionalUrls, setDeletedAdditionalUrls] = useState<string[]>([])
  const [deletedRealLifeUrls, setDeletedRealLifeUrls] = useState<string[]>([])

  useEffect(() => {
    if (editingSign) {
      // Build translations dynamically from existing data
      const translations: Record<string, { description: string }> = {}
      if (editingSign.translations) {
        for (const [code, fields] of Object.entries(editingSign.translations as Record<string, any>)) {
          translations[code] = { description: fields?.description || '' }
        }
      }
      setFormData({
        description: editingSign.description || '',
        translations,
        isActive: editingSign.isActive ?? true,
      })
      if (editingSign.signAsset) setSignPreview(getAssetUrl(editingSign.signAsset.url))
    } else {
      resetForm()
    }
  }, [editingSign, isOpen])

  // Reset locale tab when primaryCode changes
  useEffect(() => {
    if (primaryCode) setCurrentLocale(primaryCode)
  }, [primaryCode])

  const resetForm = () => {
    setFormData({ description: '', translations: {}, isActive: true })
    setSignFile(null)
    setSignPreview('')
    setAdditionalAssets([])
    setRealLifeAssets([])
    setDeletedAdditionalUrls([])
    setDeletedRealLifeUrls([])
    setCurrentLocale(primaryCode || 'en')
    setError(null)
  }

  const handleClose = () => { resetForm(); onClose() }

  const handleSignFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setSignFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setSignPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleAddAdditionalAsset = () =>
    setAdditionalAssets([...additionalAssets, { file: null, caption: '', order: additionalAssets.length + 1 }])

  const handleRemoveAdditionalAsset = (index: number) =>
    setAdditionalAssets(additionalAssets.filter((_, i) => i !== index))

  const handleAdditionalAssetFileChange = (index: number, file: File) => {
    const next = [...additionalAssets]
    next[index].file = file
    const reader = new FileReader()
    reader.onloadend = () => { next[index].preview = reader.result as string; setAdditionalAssets(next) }
    reader.readAsDataURL(file)
  }

  const handleAddRealLifeAsset = () =>
    setRealLifeAssets([...realLifeAssets, { file: null, caption: '', order: realLifeAssets.length + 1 }])

  const handleRemoveRealLifeAsset = (index: number) =>
    setRealLifeAssets(realLifeAssets.filter((_, i) => i !== index))

  const handleRealLifeAssetFileChange = (index: number, file: File) => {
    const next = [...realLifeAssets]
    next[index].file = file
    const reader = new FileReader()
    reader.onloadend = () => { next[index].preview = reader.result as string; setRealLifeAssets(next) }
    reader.readAsDataURL(file)
  }

  const validateForm = () => {
    if (!formData.description.trim()) { setError('English description is required'); return false }
    if (!editingSign && !signFile) { setError('Main sign image or video is required'); return false }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsSubmitting(true)
    setError(null)

    try {
      const fd = new FormData()
      fd.append('categoryId', String(categoryId))
      fd.append('description', formData.description)
      fd.append('isActive', String(formData.isActive))

      // Build translations dynamically from all non-primary languages
      const translations: Record<string, { description: string }> = {}
      for (const [code, fields] of Object.entries(formData.translations)) {
        if (code === primaryCode) continue
        if (fields.description?.trim()) {
          translations[code] = { description: fields.description }
        }
      }
      if (Object.keys(translations).length > 0) fd.append('translations', JSON.stringify(translations))

      if (signFile) fd.append('signAsset', signFile)

      additionalAssets.filter((a) => a.file).forEach((a) => { if (a.file) fd.append('additionalAssets', a.file) })
      realLifeAssets.filter((a) => a.file).forEach((a) => { if (a.file) fd.append('realLifeAssets', a.file) })

      // Send the updated list of existing assets (after removals) so the backend saves only these
      if (editingSign) {
        const keptAdditional = (editingSign.additionalAssets || [])
          .filter((a: any) => !deletedAdditionalUrls.includes(a.url))
        fd.append('existingAdditionalAssets', JSON.stringify(keptAdditional))

        const keptRealLife = (editingSign.realLifeAssets || [])
          .filter((a: any) => !deletedRealLifeUrls.includes(a.url))
        fd.append('existingRealLifeAssets', JSON.stringify(keptRealLife))
      }

      let result
      if (editingSign) { result = await adminTrafficSignApi.updateSign(editingSign.id, fd); updateSign(result) }
      else { result = await adminTrafficSignApi.createSign(fd); addSign(result) }

      handleClose()
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || err?.message || 'Failed to save traffic sign')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="font-dm max-h-[90vh] max-w-2xl overflow-y-auto
                                 bg-[#181920] border border-white/[0.09]
                                 shadow-[0_24px_64px_rgba(0,0,0,0.55)] rounded-2xl p-0">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-dm   { font-family: 'DM Sans', sans-serif; }
        `}</style>

        {/* ── Dialog Header ── */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.07]">
          <DialogTitle className="font-syne font-bold text-lg tracking-tight text-[#f0f0f5]">
            {editingSign ? 'Edit Traffic Sign' : 'Create Traffic Sign'}
          </DialogTitle>
          <p className="text-xs text-white/30 font-light mt-0.5">
            {editingSign ? 'Update sign details and assets' : 'Add a new sign to this category'}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">

          {/* ── Language switcher ── */}
          {languages.length > 1 && (
            <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <div className="flex gap-1 min-w-max bg-[#181920] border border-white/[0.08] rounded-xl p-1">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setCurrentLocale(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap
                      ${currentLocale === lang.code
                        ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_10px_rgba(110,231,183,0.2)]'
                        : 'text-white/40 hover:text-white/70'}`}
                  >
                    {lang.native}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl
                            bg-red-400/[0.07] border border-red-400/20">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400/90 font-light">{error}</p>
            </div>
          )}

          {/* ── Description ── */}
          <div className="space-y-3">
            <label className={fieldLabel}>Description</label>

            {currentLocale === primaryCode ? (
              <QuillEditor
                key={primaryCode}
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                placeholder={`Enter sign description in ${languages.find(l => l.code === primaryCode)?.label ?? primaryCode}…`}
                className="min-h-[200px]"
              />
            ) : (
              <QuillEditor
                key={currentLocale}
                value={formData.translations[currentLocale]?.description ?? ''}
                onChange={(value) => setFormData({
                  ...formData,
                  translations: {
                    ...formData.translations,
                    [currentLocale]: { description: value }
                  }
                })}
                placeholder={`Description in ${languages.find(l => l.code === currentLocale)?.label ?? currentLocale}…`}
                className="min-h-[200px]"
              />
            )}
          </div>

          {/* ── Main sign asset ── */}
          <div>
            <label className={fieldLabel}>
              Main Sign Image / Video {!editingSign && <span className="text-red-400/80">*</span>}
            </label>

            {signPreview ? (
              <div className="relative inline-block">
                <div className="w-40 h-40 rounded-xl overflow-hidden ring-1 ring-white/[0.09]">
                  <Image src={signPreview} alt="Sign preview" width={160} height={160}
                    className="object-contain w-full h-full" />
                </div>
                <button
                  type="button"
                  onClick={() => { setSignFile(null); setSignPreview('') }}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-400 text-[#12131a]
                             flex items-center justify-center hover:opacity-80 transition-opacity shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 cursor-pointer
                                 h-36 rounded-xl border border-dashed border-white/[0.12]
                                 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20
                                 transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.08]
                                flex items-center justify-center group-hover:border-emerald-300/20
                                transition-colors">
                  <Upload size={16} className="text-white/25 group-hover:text-emerald-300/50 transition-colors" />
                </div>
                <div className="text-center">
                  <p className="text-xs text-white/40 font-medium">Click to upload</p>
                  <p className="text-[10px] text-white/20 mt-0.5">JPG, PNG, WEBP, MP4, WEBM · max 50MB</p>
                </div>
                <input type="file" accept="image/*,video/*" onChange={handleSignFileChange} className="hidden" />
              </label>
            )}
          </div>

          {/* ── Additional assets ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={fieldLabel} style={{ marginBottom: 0 }}>Additional Assets</label>
              <button
                type="button"
                onClick={handleAddAdditionalAsset}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300/70
                           hover:text-emerald-300 transition-colors"
              >
                <Plus size={12} /> Add Asset
              </button>
            </div>

            {/* Existing additional assets */}
            {editingSign?.additionalAssets?.filter((a: any) => !deletedAdditionalUrls.includes(a.url)).length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-2">
                  Current Assets ({editingSign.additionalAssets.filter((a: any) => !deletedAdditionalUrls.includes(a.url)).length})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {editingSign.additionalAssets
                    .filter((a: any) => !deletedAdditionalUrls.includes(a.url))
                    .map((asset: any, index: number) => (
                    <div key={`existing-add-${index}`} className="relative group">
                      <div className="rounded-lg overflow-hidden ring-1 ring-white/[0.09] bg-white/[0.02]">
                        {asset.type === 'video' ? (
                          <div className="aspect-square flex items-center justify-center bg-white/[0.04]">
                            <ImageIcon size={16} className="text-white/20" />
                          </div>
                        ) : (
                          <div className="aspect-square overflow-hidden">
                            <Image
                              src={getAssetUrl(asset.url)}
                              alt={asset.caption || `Asset ${index + 1}`}
                              width={80}
                              height={80}
                              className="object-contain w-full h-full"
                            />
                          </div>
                        )}
                        {asset.caption && (
                          <p className="px-1.5 py-1 text-[9px] text-white/30 font-light truncate border-t border-white/[0.06]">
                            {asset.caption}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeletedAdditionalUrls(prev => [...prev, asset.url])}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-[#12131a]
                                   flex items-center justify-center opacity-0 group-hover:opacity-100
                                   hover:bg-red-500 transition-all duration-150 shadow-lg z-10"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {additionalAssets.length === 0 && !editingSign?.additionalAssets?.length && (
              <p className="text-xs text-white/20 font-light italic">No additional assets added.</p>
            )}

            <div className="space-y-3">
              {additionalAssets.map((asset, index) => (
                <div key={index} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Asset {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAdditionalAsset(index)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg
                                 text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]
                                 transition-all duration-150"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {asset.preview ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden ring-1 ring-white/[0.09]">
                        <Image src={asset.preview} alt="Preview" width={80} height={80}
                          className="object-contain w-full h-full" />
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl
                                         border border-dashed border-white/[0.09] bg-white/[0.02]
                                         hover:border-white/20 transition-colors">
                        <ImageIcon size={14} className="text-white/25 shrink-0" />
                        <span className="text-xs text-white/30">Choose file…</span>
                        <input
                          type="file" accept="image/*,video/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleAdditionalAssetFileChange(index, f) }}
                        />
                      </label>
                    )}
                    <input
                      type="text"
                      value={asset.caption}
                      onChange={(e) => {
                        const next = [...additionalAssets]
                        next[index].caption = e.target.value
                        setAdditionalAssets(next)
                      }}
                      placeholder="Caption (optional)"
                      className={textInputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Real life assets ── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className={fieldLabel} style={{ marginBottom: 0 }}>Real Life Photos</label>
              <button
                type="button"
                onClick={handleAddRealLifeAsset}
                className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300/70
                           hover:text-emerald-300 transition-colors"
              >
                <Plus size={12} /> Add Photo
              </button>
            </div>

            {/* Existing real-life assets */}
            {editingSign?.realLifeAssets?.filter((a: any) => !deletedRealLifeUrls.includes(a.url)).length > 0 && (
              <div className="mb-3">
                <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-2">
                  Current Photos ({editingSign.realLifeAssets.filter((a: any) => !deletedRealLifeUrls.includes(a.url)).length})
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {editingSign.realLifeAssets
                    .filter((a: any) => !deletedRealLifeUrls.includes(a.url))
                    .map((asset: any, index: number) => (
                    <div key={`existing-rl-${index}`} className="relative group">
                      <div className="rounded-lg overflow-hidden ring-1 ring-white/[0.09] bg-white/[0.02]">
                        <div className="aspect-square overflow-hidden">
                          <Image
                            src={getAssetUrl(asset.url)}
                            alt={asset.caption || `Photo ${index + 1}`}
                            width={80}
                            height={80}
                            className="object-contain w-full h-full"
                          />
                        </div>
                        {asset.caption && (
                          <p className="px-1.5 py-1 text-[9px] text-white/30 font-light truncate border-t border-white/[0.06]">
                            {asset.caption}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeletedRealLifeUrls(prev => [...prev, asset.url])}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-400 text-[#12131a]
                                   flex items-center justify-center opacity-0 group-hover:opacity-100
                                   hover:bg-red-500 transition-all duration-150 shadow-lg z-10"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {realLifeAssets.length === 0 && !editingSign?.realLifeAssets?.length && (
              <p className="text-xs text-white/20 font-light italic">No real life photos added.</p>
            )}

            <div className="space-y-3">
              {realLifeAssets.map((asset, index) => (
                <div key={index} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Photo {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRealLifeAsset(index)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg
                                 text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]
                                 transition-all duration-150"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {asset.preview ? (
                      <div className="w-20 h-20 rounded-lg overflow-hidden ring-1 ring-white/[0.09]">
                        <Image src={asset.preview} alt="Preview" width={80} height={80}
                          className="object-contain w-full h-full" />
                      </div>
                    ) : (
                      <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl
                                         border border-dashed border-white/[0.09] bg-white/[0.02]
                                         hover:border-white/20 transition-colors">
                        <ImageIcon size={14} className="text-white/25 shrink-0" />
                        <span className="text-xs text-white/30">Choose photo…</span>
                        <input
                          type="file" accept="image/*" className="hidden"
                          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleRealLifeAssetFileChange(index, f) }}
                        />
                      </label>
                    )}
                    <input
                      type="text"
                      value={asset.caption}
                      onChange={(e) => {
                        const next = [...realLifeAssets]
                        next[index].caption = e.target.value
                        setRealLifeAssets(next)
                      }}
                      placeholder="Caption (optional)"
                      className={textInputClass}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Status toggle ── */}
          <div className="flex items-center gap-3">
            <label className={fieldLabel} style={{ marginBottom: 0 }}>Status</label>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200
                ${formData.isActive ? 'bg-emerald-300' : 'bg-white/[0.12]'}`}
            >
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow
                                transition-transform duration-200
                                ${formData.isActive ? 'translate-x-[18px]' : 'translate-x-[3px]'}`}
              />
            </button>
            {formData.isActive ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-300/80 font-medium">
                <CheckCircle2 size={11} /> Active
              </span>
            ) : (
              <span className="text-xs text-white/30 font-medium">Inactive</span>
            )}
          </div>

        </form>

        {/* ── Footer ── */}
        <DialogFooter className="px-6 pb-6 pt-4 border-t border-white/[0.07] flex gap-2.5">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-white/55 border border-white/[0.09] bg-white/[0.03]
                       hover:text-white/85 hover:border-white/20
                       disabled:opacity-40 transition-all duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            form=""
            onClick={handleSubmit as any}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                       inline-flex items-center justify-center gap-2
                       text-[#12131a] bg-emerald-300
                       hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200
                       [box-shadow:0_0_20px_rgba(110,231,183,0.25)]"
          >
            {isSubmitting
              ? <><Loader2 size={14} className="animate-spin" /> Saving…</>
              : editingSign ? 'Update Sign' : 'Create Sign'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}