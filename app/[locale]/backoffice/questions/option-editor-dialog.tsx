// "use client";

// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { Check, CheckCircle2, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
// import { useAuthStore } from '@/lib/store';
// import type { QuestionOption } from '@/lib/types/admin';
// import { getAssetUrl, isImageAsset, isVideoAsset } from '@/lib/utils/asset-url';

// interface OptionFormState {
//   text: string;
//   isCorrect: boolean;
//   position: number;
//   translations: Record<string, string>;
//   assetFile?: File | null;
// }

// interface OptionEditorDialogProps {
//   open: boolean;
//   mode: 'create' | 'edit';
//   formData: OptionFormState;
//   locale: string;
//   editingOption: QuestionOption | null;
//   isLoading?: boolean;
//   languages: { code: string; label: string; direction?: string }[];
//   primaryCode: string;
//   onOpenChange: (open: boolean) => void;
//   onFormDataChange: (data: OptionFormState) => void;
//   onLocaleChange: (locale: string) => void;
//   onSave: () => void;
//   onUploadImage?: (file: File) => void;
//   onDeleteImage?: () => void;
//   onRemoveAssetFile?: () => void;
// }

// // ── Shared style tokens ────────────────────────────────────────────────────────
// const inputClass = `
//   w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
//   bg-white/[0.04] border border-white/[0.09]
//   focus:outline-none focus:border-emerald-300/40
//   transition-colors duration-200 placeholder:text-white/20
// `

// function SectionBlock({ title, icon: Icon, children, action }: {
//   title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
// }) {
//   return (
//     <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
//       <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] overflow-x-hidden">
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

// export function OptionEditorDialog({
//   open,
//   mode,
//   formData,
//   locale,
//   editingOption,
//   isLoading,
//   onOpenChange,
//   onFormDataChange,
//   onLocaleChange,
//   onSave,
//   onUploadImage,
//   onDeleteImage,
//   onRemoveAssetFile,
//   languages,
//   primaryCode,
// }: OptionEditorDialogProps) {
//   const existingAsset = editingOption?.asset?.url ? editingOption.asset : null;
//   const { user } = useAuthStore();
//   const isAdmin = user?.role === 'admin';

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="max-w-2xl overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm"
//       >
//         <div key={`option-${locale}`} dir={languages.find(l => l.code === locale)?.direction || 'ltr'}>
//           {/* ── Header ── */}
//           <DialogHeader>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
//                 <CheckCircle2 size={14} className="text-emerald-300" />
//               </div>
//               <DialogTitle className="font-syne font-bold text-lg tracking-tight">
//                 {mode === 'create' ? 'Add Option' : 'Edit Option'}
//               </DialogTitle>
//             </div>
//           </DialogHeader>

//           {/* ── Body ── */}
//           <div className="space-y-4 py-1">

//             {/* Position & Correct */}
//             {isAdmin && (
//               <SectionBlock title="Settings">
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="space-y-1.5">
//                     <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
//                       Position
//                     </label>
//                     <input
//                       type="number"
//                       min={1}
//                       value={formData.position}
//                       onChange={e => onFormDataChange({ ...formData, position: Number(e.target.value) })}
//                       className={inputClass}
//                     />
//                   </div>

//                   <div className="flex items-end pb-0.5">
//                     <label className="flex items-center gap-3 cursor-pointer group">
//                       <div className="relative shrink-0">
//                         <input
//                           type="checkbox"
//                           checked={formData.isCorrect}
//                           onChange={e => onFormDataChange({ ...formData, isCorrect: e.target.checked })}
//                           className="sr-only peer"
//                         />
//                         <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
//                                       peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40
//                                       transition-all duration-200" />
//                         <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
//                                       peer-checked:translate-x-[18px] peer-checked:bg-[#12131a]
//                                       transition-all duration-200" />
//                       </div>
//                       <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">
//                         Correct answer
//                       </span>
//                     </label>
//                   </div>
//                 </div>
//               </SectionBlock>
//             )}

//             {/* Option Text + locale toggle */}
//             <SectionBlock title="Option Text"
//               action={
//                 <div className="min-w-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
//                   <div className="flex items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl min-w-max">
//                     {languages.map(({ code, label }) => (
//                       <button
//                         key={code}
//                         type="button"
//                         onClick={() => onLocaleChange(code)}
//                         className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
//                           ${locale === code
//                             ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
//                             : 'text-white/35 hover:text-white/70'}`}
//                       >
//                         {label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               }>
//               <input
//                 value={formData.translations[locale] ?? ''}
//                 onChange={e =>
//                   onFormDataChange({
//                     ...formData,
//                     text: locale === primaryCode ? e.target.value : formData.text,
//                     translations: { ...formData.translations, [locale]: e.target.value },
//                   })
//                 }
//                 placeholder={`Option text in ${languages.find(l => l.code === locale)?.label ?? locale}…`}
//                 className={inputClass}
//               />
//             </SectionBlock>

//             {/* Asset */}
//             {isAdmin && (
//             <SectionBlock title="Asset" icon={ImageIcon}>
//               {/* Existing saved asset (edit mode) */}
//               {mode === 'edit' && existingAsset ? (
//                 <div className="space-y-3">
//                   {isImageAsset(existingAsset.contentType, existingAsset.type) ? (
//                     <img
//                       src={getAssetUrl(existingAsset.url)}
//                       alt="Option asset"
//                       className="h-36 w-full rounded-xl border border-white/[0.07] object-cover"
//                     />
//                   ) : isVideoAsset(existingAsset.contentType, existingAsset.type) ? (
//                     <video controls className="h-36 w-full rounded-xl border border-white/[0.07] object-cover">
//                       <source src={getAssetUrl(existingAsset.url)} type={existingAsset.contentType ?? 'video/mp4'} />
//                     </video>
//                   ) : (
//                     <div className="h-20 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
//                       <p className="text-sm text-white/30 font-light">Document asset</p>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-2">
//                     <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer
//                                     text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
//                                     transition-all duration-200">
//                       <Upload size={12} /> Replace Asset
//                       <input hidden type="file" accept="image/*,video/*,.pdf,.doc,.docx"
//                         onChange={e => { const f = e.target.files?.[0]; if (f && onUploadImage) onUploadImage(f) }} />
//                     </label>
//                     {onDeleteImage && (
//                       <button
//                         type="button"
//                         onClick={onDeleteImage}
//                         className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
//                                  text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
//                                  hover:bg-red-400/[0.07] transition-all duration-200"
//                       >
//                         <Trash2 size={12} /> Remove Asset
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               ) : formData.assetFile ? (
//                 /* Staged file (not yet uploaded) */
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
//                     <ImageIcon size={15} className="text-white/30 shrink-0" />
//                     <div className="min-w-0 flex-1">
//                       <p className="text-sm text-white/70 font-light truncate">{formData.assetFile.name}</p>
//                       <p className="text-[11px] text-white/25 mt-0.5">
//                         {(formData.assetFile.size / 1024).toFixed(1)} KB
//                       </p>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => { onFormDataChange({ ...formData, assetFile: null }); onRemoveAssetFile?.() }}
//                       className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30
//                                hover:text-red-400 hover:bg-red-400/[0.08] transition-all shrink-0"
//                     >
//                       <Trash2 size={13} />
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 /* No asset yet */
//                 <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.10]
//                                 bg-white/[0.02] cursor-pointer hover:border-white/20 transition-colors group">
//                   <Upload size={14} className="text-white/25 group-hover:text-white/50 transition-colors shrink-0" />
//                   <span className="text-sm text-white/30 font-light group-hover:text-white/50 transition-colors">
//                     Click to upload an image, video, or document (optional)
//                   </span>
//                   <input hidden type="file" accept="image/*,video/*,.pdf,.doc,.docx"
//                     onChange={e => { const f = e.target.files?.[0]; if (f) onFormDataChange({ ...formData, assetFile: f }) }} />
//                 </label>
//               )}
//             </SectionBlock>
//             )}
//           </div>

//           {/* ── Footer ── */}
//           <DialogFooter className="gap-2">
//             <button
//               type="button"
//               onClick={() => onOpenChange(false)}
//               className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
//                        hover:text-white/85 hover:border-white/20 transition-all duration-200"
//             >
//               Cancel
//             </button>
//             <button
//               type="button"
//               onClick={onSave}
//               disabled={isLoading}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                        text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                        transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]"
//             >
//               {isLoading
//                 ? <Loader2 size={14} className="animate-spin" />
//                 : <Check size={14} />
//               }
//               {mode === 'create' ? 'Add Option' : 'Save Changes'}
//             </button>
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }



"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, CheckCircle2, ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { useAuthStore } from '@/lib/store';
import type { QuestionOption } from '@/lib/types/admin';
import { getAssetUrl, isImageAsset, isVideoAsset } from '@/lib/utils/asset-url';

interface OptionFormState {
  text: string;
  isCorrect: boolean;
  position: number;
  translations: Record<string, string>;
  assetFile?: File | null;
}

interface OptionEditorDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  formData: OptionFormState;
  locale: string;
  editingOption: QuestionOption | null;
  isLoading?: boolean;
  languages: { code: string; label: string; direction?: string }[];
  primaryCode: string;
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: OptionFormState) => void;
  onLocaleChange: (locale: string) => void;
  onSave: () => void;
  onUploadImage?: (file: File) => void;
  onDeleteImage?: () => void;
  onRemoveAssetFile?: () => void;
}

// ── Shared style tokens ────────────────────────────────────────────────────────
const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 placeholder:text-white/20
`

function SectionBlock({ title, icon: Icon, children, action }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="w-full max-w-full min-w-0 rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/[0.06] w-full max-w-full min-w-0 overflow-hidden">
        <div className="flex items-center gap-2 shrink-0 min-w-fit">
          {Icon && <Icon size={13} className="text-white/30" />}
          <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium whitespace-nowrap">{title}</h4>
        </div>

        {action && (
          <div className="flex-1 min-w-0 max-w-full overflow-hidden">
            {action}
          </div>
        )}
      </div>
      <div className="px-5 py-4 w-full max-w-full min-w-0 overflow-x-hidden">{children}</div>
    </div>
  )
}

export function OptionEditorDialog({
  open,
  mode,
  formData,
  locale,
  editingOption,
  isLoading,
  onOpenChange,
  onFormDataChange,
  onLocaleChange,
  onSave,
  onUploadImage,
  onDeleteImage,
  onRemoveAssetFile,
  languages,
  primaryCode,
}: OptionEditorDialogProps) {
  const existingAsset = editingOption?.asset?.url ? editingOption.asset : null;
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl w-[calc(100vw-2rem)] overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm"
      >
        <div
          key={`option-${locale}`}
          className="w-full max-w-full min-w-0 overflow-x-hidden"
          dir={languages.find(l => l.code === locale)?.direction || 'ltr'}
        >
          {/* ── Header ── */}
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                <CheckCircle2 size={14} className="text-emerald-300" />
              </div>
              <DialogTitle className="font-syne font-bold text-lg tracking-tight">
                {mode === 'create' ? 'Add Option' : 'Edit Option'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* ── Body ── */}
          <div className="space-y-4 py-1">

            {/* Position & Correct */}
            {isAdmin && (
              <SectionBlock title="Settings">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Position
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={formData.position}
                      onChange={e => onFormDataChange({ ...formData, position: Number(e.target.value) })}
                      className={inputClass}
                    />
                  </div>

                  <div className="flex items-end pb-0.5">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative shrink-0">
                        <input
                          type="checkbox"
                          checked={formData.isCorrect}
                          onChange={e => onFormDataChange({ ...formData, isCorrect: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                      peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40
                                      transition-all duration-200" />
                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                      peer-checked:translate-x-[18px] peer-checked:bg-[#12131a]
                                      transition-all duration-200" />
                      </div>
                      <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">
                        Correct answer
                      </span>
                    </label>
                  </div>
                </div>
              </SectionBlock>
            )}

            {/* Option Text + locale toggle */}
            <SectionBlock title="Option Text"
              action={
                <div className="w-full max-w-full min-w-0 overflow-hidden">
                  <div className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
                    <div className="inline-flex w-max min-w-max items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl">
                      {languages.map(({ code, label }) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => onLocaleChange(code)}
                          className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                            ${locale === code
                              ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
                              : 'text-white/35 hover:text-white/70'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              }>
              <input
                value={formData.translations[locale] ?? ''}
                onChange={e =>
                  onFormDataChange({
                    ...formData,
                    text: locale === primaryCode ? e.target.value : formData.text,
                    translations: { ...formData.translations, [locale]: e.target.value },
                  })
                }
                placeholder={`Option text in ${languages.find(l => l.code === locale)?.label ?? locale}…`}
                className={inputClass}
              />
            </SectionBlock>

            {/* Asset */}
            {isAdmin && (
            <SectionBlock title="Asset" icon={ImageIcon}>
              {/* Existing saved asset (edit mode) */}
              {mode === 'edit' && existingAsset ? (
                <div className="space-y-3">
                  {isImageAsset(existingAsset.contentType, existingAsset.type) ? (
                    <img
                      src={getAssetUrl(existingAsset.url)}
                      alt="Option asset"
                      className="h-36 w-full rounded-xl border border-white/[0.07] object-cover"
                    />
                  ) : isVideoAsset(existingAsset.contentType, existingAsset.type) ? (
                    <video controls className="h-36 w-full rounded-xl border border-white/[0.07] object-cover">
                      <source src={getAssetUrl(existingAsset.url)} type={existingAsset.contentType ?? 'video/mp4'} />
                    </video>
                  ) : (
                    <div className="h-20 w-full rounded-xl border border-white/[0.07] bg-white/[0.03] flex items-center justify-center">
                      <p className="text-sm text-white/30 font-light">Document asset</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer
                                    text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                    transition-all duration-200">
                      <Upload size={12} /> Replace Asset
                      <input hidden type="file" accept="image/*,video/*,.pdf,.doc,.docx"
                        onChange={e => { const f = e.target.files?.[0]; if (f && onUploadImage) onUploadImage(f) }} />
                    </label>
                    {onDeleteImage && (
                      <button
                        type="button"
                        onClick={onDeleteImage}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                                 hover:bg-red-400/[0.07] transition-all duration-200"
                      >
                        <Trash2 size={12} /> Remove Asset
                      </button>
                    )}
                  </div>
                </div>
              ) : formData.assetFile ? (
                /* Staged file (not yet uploaded) */
                <div className="space-y-3">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/[0.07] bg-white/[0.02]">
                    <ImageIcon size={15} className="text-white/30 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-white/70 font-light truncate">{formData.assetFile.name}</p>
                      <p className="text-[11px] text-white/25 mt-0.5">
                        {(formData.assetFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onFormDataChange({ ...formData, assetFile: null }); onRemoveAssetFile?.() }}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-white/30
                               hover:text-red-400 hover:bg-red-400/[0.08] transition-all shrink-0"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ) : (
                /* No asset yet */
                <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.10]
                                bg-white/[0.02] cursor-pointer hover:border-white/20 transition-colors group">
                  <Upload size={14} className="text-white/25 group-hover:text-white/50 transition-colors shrink-0" />
                  <span className="text-sm text-white/30 font-light group-hover:text-white/50 transition-colors">
                    Click to upload an image, video, or document (optional)
                  </span>
                  <input hidden type="file" accept="image/*,video/*,.pdf,.doc,.docx"
                    onChange={e => { const f = e.target.files?.[0]; if (f) onFormDataChange({ ...formData, assetFile: f }) }} />
                </label>
              )}
            </SectionBlock>
            )}
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                       hover:text-white/85 hover:border-white/20 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                       transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]"
            >
              {isLoading
                ? <Loader2 size={14} className="animate-spin" />
                : <Check size={14} />
              }
              {mode === 'create' ? 'Add Option' : 'Save Changes'}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}