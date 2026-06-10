// "use client";

// import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import { QuillEditor } from '@/components/ui/quill-editor';
// import { Check, ChevronDown, ChevronUp, FileUp, ImageIcon, Loader2, MessageSquare, Trash2, Upload } from 'lucide-react';
// import { useAuthStore } from '@/lib/store';

// type AssetType = 'image' | 'video' | 'document' | 'diagram' | 'illustration' | 'question_image';

// interface AssetDraft {
//   file: File;
//   type: AssetType;
//   alt: string;
//   caption: string;
// }

// interface ExplanationEditorDialogProps {
//   open: boolean;
//   formData: Record<string, string>;
//   locale: string;
//   assets: AssetDraft[];
//   isLoading?: boolean;
//   hasExisting: boolean;
//   languages: { code: string; label: string; direction?: string }[];
//   onOpenChange: (open: boolean) => void;
//   onFormDataChange: (data: Record<string, string>) => void;
//   onLocaleChange: (locale: string) => void;
//   onAssetsChange: (assets: AssetDraft[]) => void;
//   onSave: () => void;
// }

// const ASSET_TYPES: AssetType[] = ['image', 'video', 'document', 'diagram', 'illustration', 'question_image'];

// const selectClass = `
//   w-full h-9 px-3 rounded-xl text-xs text-[#f0f0f5] font-light
//   bg-white/[0.04] border border-white/[0.09]
//   focus:outline-none focus:border-emerald-300/40
//   transition-colors duration-200
//   [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]
// `
// const inputClass = `
//   w-full px-3 py-2 rounded-xl text-xs text-[#f0f0f5] font-light
//   bg-white/[0.04] border border-white/[0.09]
//   focus:outline-none focus:border-emerald-300/40
//   transition-colors duration-200 placeholder:text-white/20
// `

// function moveItem<T>(array: T[], from: number, to: number): T[] {
//   if (to < 0 || to >= array.length) return array;
//   const result = [...array];
//   const [removed] = result.splice(from, 1);
//   result.splice(to, 0, removed);
//   return result;
// }

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

// export function ExplanationEditorDialog({
//   open,
//   formData,
//   locale,
//   assets,
//   isLoading,
//   hasExisting,
//   languages,
//   onOpenChange,
//   onFormDataChange,
//   onLocaleChange,
//   onAssetsChange,
//   onSave,
// }: ExplanationEditorDialogProps) {
//   const { user } = useAuthStore();
//   const isAdmin = user?.role === 'admin';

//   const appendAssets = (files: File[]) => {
//     onAssetsChange([
//       ...assets,
//       ...files.map(file => ({ file, type: '' as AssetType, alt: '', caption: '' })),
//     ]);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
//         <div key={`explanation-${locale}`} dir={languages.find(l => l.code === locale)?.direction || 'ltr'}>
//           {/* ── Header ── */}
//           <DialogHeader>
//             <div className="flex items-center gap-3">
//               <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
//                 <MessageSquare size={14} className="text-emerald-300" />
//               </div>
//               <DialogTitle className="font-syne font-bold text-lg tracking-tight">
//                 {hasExisting ? 'Edit Explanation' : 'Add Explanation'}
//               </DialogTitle>
//             </div>
//           </DialogHeader>

//           {/* ── Body ── */}
//           <div className="space-y-4 py-1">

//             {/* Explanation text */}
//             <SectionBlock title="Explanation Text" icon={MessageSquare}
//               action={
//                 /* Locale toggle */
//                 <div className="min-w-0 overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
//                   <div className="flex items-center gap-0.5 p-1 bg-[#181920] border border-white/[0.08] rounded-xl min-w-max">
//                     {languages.map(({ code, label }) => (
//                       <button key={code} type="button" onClick={() => onLocaleChange(code)}
//                         className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
//                           ${locale === code
//                             ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_8px_rgba(110,231,183,0.25)]'
//                             : 'text-white/35 hover:text-white/70'}`}>
//                         {label}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               }>
//               <QuillEditor
//                 key={locale}
//                 value={formData[locale]}
//                 onChange={value => onFormDataChange({ ...formData, [locale]: value })}
//                 placeholder={`Enter explanation in ${languages.find(l => l.code === locale)?.label ?? locale}…`}
//                 className="min-h-[200px]"
//                 dir={languages.find(l => l.code === locale)?.direction || 'ltr'}
//               />
//               <p className="mt-2 text-[11px] text-white/25 font-light">Minimum 20 characters required</p>
//             </SectionBlock>

//             {/* Assets */}
//             {isAdmin && (
//               <SectionBlock title="Assets" icon={ImageIcon}
//                 action={
//                   <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer
//                                     text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
//                                     transition-all duration-200">
//                     <Upload size={12} /> Add Files
//                     <input hidden multiple type="file"
//                       onChange={e => appendAssets(Array.from(e.target.files ?? []))} />
//                   </label>
//                 }>
//                 {assets.length === 0 ? (
//                   <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.01]">
//                     <FileUp size={14} className="text-white/20 shrink-0" />
//                     <p className="text-sm text-white/25 font-light">No assets queued for upload.</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {assets.map((asset, index) => (
//                       <div key={`${asset.file.name}-${index}`}
//                         className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
//                         {/* File name row */}
//                         <div className="flex items-center justify-between gap-3 mb-3">
//                           <div className="flex items-center gap-2 min-w-0">
//                             <ImageIcon size={13} className="text-white/25 shrink-0" />
//                             <p className="truncate text-sm text-white/60 font-light">{asset.file.name}</p>
//                             <span className="text-[11px] text-white/20 shrink-0">
//                               {(asset.file.size / 1024).toFixed(1)} KB
//                             </span>
//                           </div>
//                           <div className="flex items-center gap-0.5 shrink-0">
//                             <button type="button" disabled={index === 0}
//                               onClick={() => onAssetsChange(moveItem(assets, index, index - 1))}
//                               className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25
//                                          hover:text-white/60 hover:bg-white/[0.07] disabled:opacity-25
//                                          disabled:cursor-not-allowed transition-all">
//                               <ChevronUp size={13} />
//                             </button>
//                             <button type="button" disabled={index === assets.length - 1}
//                               onClick={() => onAssetsChange(moveItem(assets, index, index + 1))}
//                               className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25
//                                          hover:text-white/60 hover:bg-white/[0.07] disabled:opacity-25
//                                          disabled:cursor-not-allowed transition-all">
//                               <ChevronDown size={13} />
//                             </button>
//                             <button type="button"
//                               onClick={() => onAssetsChange(assets.filter((_, idx) => idx !== index))}
//                               className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25
//                                          hover:text-red-400 hover:bg-red-400/[0.08] transition-all">
//                               <Trash2 size={13} />
//                             </button>
//                           </div>
//                         </div>

//                         {/* Type / Alt / Caption */}
//                         <div className="grid grid-cols-3 gap-2">
//                           <div className="space-y-1">
//                             <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Type <span className="text-red-400">*</span></label>
//                             <select value={asset.type}
//                               onChange={e => onAssetsChange(assets.map((a, i) => i === index ? { ...a, type: e.target.value as AssetType } : a))}
//                               className={`${selectClass} ${!asset.type ? 'border-red-400/40 text-white/30' : ''}`}>
//                               <option value="" disabled>Select type…</option>
//                               {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
//                             </select>
//                           </div>
//                           <div className="space-y-1">
//                             <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Alt text</label>
//                             <input value={asset.alt}
//                               onChange={e => onAssetsChange(assets.map((a, i) => i === index ? { ...a, alt: e.target.value } : a))}
//                               placeholder="Describe the image…"
//                               className={inputClass} />
//                           </div>
//                           <div className="space-y-1">
//                             <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Caption</label>
//                             <input value={asset.caption}
//                               onChange={e => onAssetsChange(assets.map((a, i) => i === index ? { ...a, caption: e.target.value } : a))}
//                               placeholder="Optional caption…"
//                               className={inputClass} />
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </SectionBlock>
//             )}
//           </div>

//           {/* ── Footer ── */}
//           <DialogFooter className="gap-2">
//             <button type="button" onClick={() => onOpenChange(false)}
//               className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
//                          hover:text-white/85 hover:border-white/20 transition-all duration-200">
//               Cancel
//             </button>
//             <button type="button" onClick={onSave} disabled={isLoading || assets.some(a => !a.type)}
//               className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
//                          text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
//                          transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
//               {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
//               {hasExisting ? 'Update Explanation' : 'Create Explanation'}
//             </button>
//           </DialogFooter>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }




"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { QuillEditor } from '@/components/ui/quill-editor';
import { Check, ChevronDown, ChevronUp, FileUp, ImageIcon, Loader2, MessageSquare, Trash2, Upload } from 'lucide-react';
import { useAuthStore } from '@/lib/store';

type AssetType = 'image' | 'video' | 'document' | 'diagram' | 'illustration' | 'question_image';

interface AssetDraft {
  file: File;
  type: AssetType;
  alt: string;
  caption: string;
}

interface ExplanationEditorDialogProps {
  open: boolean;
  formData: Record<string, string>;
  locale: string;
  assets: AssetDraft[];
  isLoading?: boolean;
  hasExisting: boolean;
  languages: { code: string; label: string; direction?: string }[];
  onOpenChange: (open: boolean) => void;
  onFormDataChange: (data: Record<string, string>) => void;
  onLocaleChange: (locale: string) => void;
  onAssetsChange: (assets: AssetDraft[]) => void;
  onSave: () => void;
}

const ASSET_TYPES: AssetType[] = ['image', 'video', 'document', 'diagram', 'illustration', 'question_image'];

const selectClass = `
  w-full h-9 px-3 rounded-xl text-xs text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200
  [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]
`
const inputClass = `
  w-full px-3 py-2 rounded-xl text-xs text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 placeholder:text-white/20
`

function moveItem<T>(array: T[], from: number, to: number): T[] {
  if (to < 0 || to >= array.length) return array;
  const result = [...array];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

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

export function ExplanationEditorDialog({
  open,
  formData,
  locale,
  assets,
  isLoading,
  hasExisting,
  languages,
  onOpenChange,
  onFormDataChange,
  onLocaleChange,
  onAssetsChange,
  onSave,
}: ExplanationEditorDialogProps) {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const appendAssets = (files: File[]) => {
    onAssetsChange([
      ...assets,
      ...files.map(file => ({ file, type: '' as AssetType, alt: '', caption: '' })),
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl w-[calc(100vw-2rem)] overflow-y-auto overflow-x-hidden bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
        <div
          key={`explanation-${locale}`}
          className="w-full max-w-full min-w-0 overflow-x-hidden"
          dir={languages.find(l => l.code === locale)?.direction || 'ltr'}
        >
          {/* ── Header ── */}
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                <MessageSquare size={14} className="text-emerald-300" />
              </div>
              <DialogTitle className="font-syne font-bold text-lg tracking-tight">
                {hasExisting ? 'Edit Explanation' : 'Add Explanation'}
              </DialogTitle>
            </div>
          </DialogHeader>

          {/* ── Body ── */}
          <div className="space-y-4 py-1">

            {/* Explanation text */}
            <SectionBlock title="Explanation Text" icon={MessageSquare}
              action={
                /* Locale toggle */
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
              <QuillEditor
                key={locale}
                value={formData[locale]}
                onChange={value => onFormDataChange({ ...formData, [locale]: value })}
                placeholder={`Enter explanation in ${languages.find(l => l.code === locale)?.label ?? locale}…`}
                className="min-h-[200px]"
                dir={languages.find(l => l.code === locale)?.direction || 'ltr'}
              />
              <p className="mt-2 text-[11px] text-white/25 font-light">Minimum 20 characters required</p>
            </SectionBlock>

            {/* Assets */}
            {isAdmin && (
              <SectionBlock title="Assets" icon={ImageIcon}
                action={
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer
                                    text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                    transition-all duration-200">
                    <Upload size={12} /> Add Files
                    <input hidden multiple type="file"
                      onChange={e => appendAssets(Array.from(e.target.files ?? []))} />
                  </label>
                }>
                {assets.length === 0 ? (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.01]">
                    <FileUp size={14} className="text-white/20 shrink-0" />
                    <p className="text-sm text-white/25 font-light">No assets queued for upload.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {assets.map((asset, index) => (
                      <div key={`${asset.file.name}-${index}`}
                        className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3">
                        {/* File name row */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 min-w-0">
                            <ImageIcon size={13} className="text-white/25 shrink-0" />
                            <p className="truncate text-sm text-white/60 font-light">{asset.file.name}</p>
                            <span className="text-[11px] text-white/20 shrink-0">
                              {(asset.file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button type="button" disabled={index === 0}
                              onClick={() => onAssetsChange(moveItem(assets, index, index - 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25
                                         hover:text-white/60 hover:bg-white/[0.07] disabled:opacity-25
                                         disabled:cursor-not-allowed transition-all">
                              <ChevronUp size={13} />
                            </button>
                            <button type="button" disabled={index === assets.length - 1}
                              onClick={() => onAssetsChange(moveItem(assets, index, index + 1))}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25
                                         hover:text-white/60 hover:bg-white/[0.07] disabled:opacity-25
                                         disabled:cursor-not-allowed transition-all">
                              <ChevronDown size={13} />
                            </button>
                            <button type="button"
                              onClick={() => onAssetsChange(assets.filter((_, idx) => idx !== index))}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-white/25
                                         hover:text-red-400 hover:bg-red-400/[0.08] transition-all">
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>

                        {/* Type / Alt / Caption */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Type <span className="text-red-400">*</span></label>
                            <select value={asset.type}
                              onChange={e => onAssetsChange(assets.map((a, i) => i === index ? { ...a, type: e.target.value as AssetType } : a))}
                              className={`${selectClass} ${!asset.type ? 'border-red-400/40 text-white/30' : ''}`}>
                              <option value="" disabled>Select type…</option>
                              {ASSET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Alt text</label>
                            <input value={asset.alt}
                              onChange={e => onAssetsChange(assets.map((a, i) => i === index ? { ...a, alt: e.target.value } : a))}
                              placeholder="Describe the image…"
                              className={inputClass} />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Caption</label>
                            <input value={asset.caption}
                              onChange={e => onAssetsChange(assets.map((a, i) => i === index ? { ...a, caption: e.target.value } : a))}
                              placeholder="Optional caption…"
                              className={inputClass} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionBlock>
            )}
          </div>

          {/* ── Footer ── */}
          <DialogFooter className="gap-2">
            <button type="button" onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                         hover:text-white/85 hover:border-white/20 transition-all duration-200">
              Cancel
            </button>
            <button type="button" onClick={onSave} disabled={isLoading || assets.some(a => !a.type)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              {hasExisting ? 'Update Explanation' : 'Create Explanation'}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}