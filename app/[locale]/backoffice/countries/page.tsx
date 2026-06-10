// "use client"

// import { useEffect, useState } from 'react';
// import { useAdminStore } from '@/lib/store';
// import { AdminCountry, CreateCountryRequest } from '@/lib/types/admin';
// import { Plus, Edit, Trash2, Globe, Loader2 } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';

// export default function CountriesPage() {
//   const { countries, isLoading, fetchCountries, createCountry, updateCountry, deleteCountry } = useAdminStore();
//   const [showCreateDialog, setShowCreateDialog] = useState(false);
//   const [showEditDialog, setShowEditDialog] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [selectedCountry, setSelectedCountry] = useState<AdminCountry | null>(null);
//   const [formData, setFormData] = useState<CreateCountryRequest>({
//     code: '',
//     name: '',
//     flagUrl: '',
//   });

//   useEffect(() => {
//     fetchCountries();
//   }, [fetchCountries]);

//   const handleCreate = async () => {
//     try {
//       await createCountry(formData);
//       setShowCreateDialog(false);
//       setFormData({ code: '', name: '', flagUrl: '' });
//       fetchCountries();
//     } catch (error) {
//       console.error('Failed to create country:', error);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!selectedCountry) return;
//     try {
//       await updateCountry(selectedCountry.id, formData);
//       setShowEditDialog(false);
//       setSelectedCountry(null);
//       setFormData({ code: '', name: '', flagUrl: '' });
//       fetchCountries();
//     } catch (error) {
//       console.error('Failed to update country:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedCountry) return;
//     try {
//       await deleteCountry(selectedCountry.id);
//       setShowDeleteDialog(false);
//       setSelectedCountry(null);
//       fetchCountries();
//     } catch (error) {
//       console.error('Failed to delete country:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Countries</h1>
//           <p className="text-muted-foreground mt-2">
//             Manage countries for jurisdictions
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateDialog(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
//         >
//           <Plus className="h-4 w-4" />
//           Create Country
//         </button>
//       </div>

//       {/* Countries Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {isLoading ? (
//           <div className="col-span-full flex items-center justify-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         ) : countries.length === 0 ? (
//           <div className="col-span-full text-center py-12 text-muted-foreground">
//             No countries found. Create one to get started.
//           </div>
//         ) : (
//           countries.map((country) => (
//             <div
//               key={country.id}
//               className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   {country.flagUrl ? (
//                     <img src={country.flagUrl} alt={country.name} className="w-12 h-8 object-cover rounded" />
//                   ) : (
//                     <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
//                       <Globe className="h-6 w-6 text-primary" />
//                     </div>
//                   )}
//                   <div>
//                     <h3 className="font-semibold text-lg">{country.name}</h3>
//                     <p className="text-sm text-muted-foreground">{country.code}</p>
//                   </div>
//                 </div>
//               </div>
//               <div className="space-y-2 text-sm text-muted-foreground mb-4">
//                 <div className="flex items-center justify-between">
//                   <span>ID:</span>
//                   <span className="font-medium">{country.id}</span>
//                 </div>
//                 <div className="flex items-center justify-between">
//                   <span>Created:</span>
//                   <span className="font-medium">{new Date(country.createdAt).toLocaleDateString()}</span>
//                 </div>
//               </div>
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => {
//                     setSelectedCountry(country);
//                     setFormData({
//                       code: country.code,
//                       name: country.name,
//                       flagUrl: country.flagUrl || '',
//                     });
//                     setShowEditDialog(true);
//                   }}
//                   className="flex-1 px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors text-sm"
//                 >
//                   <Edit className="h-4 w-4 mx-auto" />
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedCountry(country);
//                     setShowDeleteDialog(true);
//                   }}
//                   className="flex-1 px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-red-100 dark:hover:bg-red-950 transition-colors text-sm"
//                 >
//                   <Trash2 className="h-4 w-4 mx-auto" />
//                 </button>
//               </div>
//             </div>
//           ))
//         )}
//       </div>

//       {/* Create Dialog */}
//       <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Create Country</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Country Code *</label>
//               <input
//                 type="text"
//                 value={formData.code}
//                 onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
//                 placeholder="e.g., GB, US, ET"
//                 maxLength={3}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Country Name *</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="e.g., United Kingdom"
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Flag URL (optional)</label>
//               <input
//                 type="url"
//                 value={formData.flagUrl}
//                 onChange={(e) => setFormData({ ...formData, flagUrl: e.target.value })}
//                 placeholder="https://example.com/flag.png"
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowCreateDialog(false);
//                 setFormData({ code: '', name: '', flagUrl: '' });
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreate}
//               disabled={isLoading || !formData.code || !formData.name}
//               className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//             >
//               {isLoading ? 'Creating...' : 'Create'}
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Edit Dialog */}
//       <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Edit Country</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Country Code</label>
//               <input
//                 type="text"
//                 value={formData.code}
//                 disabled
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-accent cursor-not-allowed"
//               />
//               <p className="text-xs text-muted-foreground mt-1">Country code cannot be changed</p>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Country Name *</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Flag URL (optional)</label>
//               <input
//                 type="url"
//                 value={formData.flagUrl}
//                 onChange={(e) => setFormData({ ...formData, flagUrl: e.target.value })}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//           </div>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowEditDialog(false);
//                 setSelectedCountry(null);
//                 setFormData({ code: '', name: '', flagUrl: '' });
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               disabled={isLoading || !formData.name}
//               className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//             >
//               {isLoading ? 'Updating...' : 'Update'}
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>

//       {/* Delete Dialog */}
//       <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Delete Country</DialogTitle>
//           </DialogHeader>
//           <p className="text-muted-foreground">
//             Are you sure you want to delete the country "{selectedCountry?.name}"? This action cannot be undone.
//           </p>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowDeleteDialog(false);
//                 setSelectedCountry(null);
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDelete}
//               disabled={isLoading}
//               className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//             >
//               {isLoading ? 'Deleting...' : 'Delete'}
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }


"use client"

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/lib/store';
import { AdminCountry, CreateCountryRequest } from '@/lib/types/admin';
import {
  AlertCircle, Check, CheckCircle2, Edit,
  Globe2, Loader2, Plus, Sparkles, Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ── Style tokens ───────────────────────────────────────────────────────────────
const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 placeholder:text-white/20
`
const inputDisabledClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-white/25 font-light
  bg-white/[0.02] border border-white/[0.05] cursor-not-allowed
`

function SectionBlock({ title, icon: Icon, children }: {
  title: string; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.06]">
        {Icon && <Icon size={13} className="text-white/30" />}
        <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{title}</h4>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function CountriesPage() {
  const { countries, isLoading, fetchCountries, createCountry, updateCountry, deleteCountry } = useAdminStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog,   setShowEditDialog]   = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCountry,  setSelectedCountry]  = useState<AdminCountry | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<CreateCountryRequest>({
    code: '', name: '', flagUrl: '',
  });

  useEffect(() => { void fetchCountries() }, [fetchCountries]);

  const resetForm = () => setFormData({ code: '', name: '', flagUrl: '' });

  const handleCreate = async () => {
    try {
      await createCountry(formData);
      setShowCreateDialog(false); resetForm(); void fetchCountries();
      setFeedback({ type: 'success', message: 'Country created successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to create country.' }) }
  };

  const handleUpdate = async () => {
    if (!selectedCountry) return;
    try {
      await updateCountry(selectedCountry.id, formData);
      setShowEditDialog(false); setSelectedCountry(null); resetForm(); void fetchCountries();
      setFeedback({ type: 'success', message: 'Country updated successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to update country.' }) }
  };

  const handleDelete = async () => {
    if (!selectedCountry) return;
    try {
      await deleteCountry(selectedCountry.id);
      setShowDeleteDialog(false); setSelectedCountry(null); void fetchCountries();
      setFeedback({ type: 'success', message: 'Country deleted.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to delete country.' }) }
  };

  const openEdit = (country: AdminCountry) => {
    setSelectedCountry(country);
    setFormData({ code: country.code, name: country.name, flagUrl: country.flagUrl ?? '' });
    setShowEditDialog(true);
  };

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
                  Admin · Countries
                </span>
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Countries</h1>
              <p className="text-sm text-white/40 font-light mt-1">
                Manage countries for jurisdictions.
              </p>
            </div>
            <button onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
              <Plus size={15} /> Create Country
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

        {/* ── Grid ── */}
        <div className="animate-fade-up delay-1">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
          ) : countries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
                            border border-dashed border-white/[0.08] text-center">
              <Globe2 size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No countries found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {countries.map(country => (
                <div key={country.id}
                  className="flex flex-col bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                             hover:border-white/[0.14] transition-all duration-200
                             shadow-[0_2px_16px_rgba(0,0,0,0.2)]">

                  {/* Card header */}
                  <div className="flex items-center gap-3 mb-4">
                    {country.flagUrl ? (
                      <img src={country.flagUrl} alt={country.name}
                        className="w-12 h-8 object-cover rounded-lg border border-white/[0.08] shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                                      flex items-center justify-center shrink-0">
                        <Globe2 size={16} className="text-emerald-300" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-[#f0f0f5] truncate">{country.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium
                                       uppercase tracking-widest border text-emerald-300/70 bg-emerald-300/10 border-emerald-300/20">
                        {country.code}
                      </span>
                    </div>
                  </div>

                  {/* Meta rows */}
                  <div className="space-y-1.5 text-xs text-white/35 font-light mb-5 flex-1">
                    <div className="flex items-center justify-between">
                      <span>ID</span>
                      <span className="text-white/55 tabular-nums">#{country.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Created</span>
                      <span className="text-white/55 tabular-nums">
                        {new Date(country.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center gap-1.5 pt-4 border-t border-white/[0.06]">
                    <button onClick={() => openEdit(country)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                 transition-all duration-200">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => { setSelectedCountry(country); setShowDeleteDialog(true) }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                                 hover:bg-red-400/[0.07] transition-all duration-200">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════
            Create Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showCreateDialog} onOpenChange={open => { setShowCreateDialog(open); if (!open) resetForm() }}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                  <Globe2 size={14} className="text-emerald-300" />
                </div>
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">Create Country</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <SectionBlock title="Details">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        Code <span className="text-red-400">*</span>
                      </label>
                      <input value={formData.code}
                        onChange={e => setFormData(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                        placeholder="e.g. GB"
                        maxLength={3}
                        className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="United Kingdom"
                        className={inputClass} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Flag URL</label>
                    <input type="url" value={formData.flagUrl}
                      onChange={e => setFormData(p => ({ ...p, flagUrl: e.target.value }))}
                      placeholder="https://example.com/flag.png"
                      className={inputClass} />
                    <p className="text-[11px] text-white/25">Optional — leave blank to use the default globe icon.</p>
                  </div>
                </div>
              </SectionBlock>
            </div>

            <DialogFooter className="gap-2">
              <button onClick={() => { setShowCreateDialog(false); resetForm() }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                           hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleCreate()}
                disabled={isLoading || !formData.code || !formData.name}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Create
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ══════════════════════════════════════
            Edit Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showEditDialog} onOpenChange={open => { setShowEditDialog(open); if (!open) { setSelectedCountry(null); resetForm() } }}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                  <Edit size={14} className="text-emerald-300" />
                </div>
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">Edit Country</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <SectionBlock title="Details">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Code</label>
                    <input value={formData.code} disabled className={inputDisabledClass} />
                    <p className="text-[11px] text-white/20">Country code cannot be changed after creation.</p>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className={inputClass} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Flag URL</label>
                    <input type="url" value={formData.flagUrl}
                      onChange={e => setFormData(p => ({ ...p, flagUrl: e.target.value }))}
                      placeholder="https://example.com/flag.png"
                      className={inputClass} />
                  </div>
                </div>
              </SectionBlock>
            </div>

            <DialogFooter className="gap-2">
              <button onClick={() => { setShowEditDialog(false); setSelectedCountry(null); resetForm() }}
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
                  Delete Country
                </DialogTitle>
              </div>
            </DialogHeader>
            <p className="text-sm text-white/45 font-light">
              This performs a soft delete and removes the country from active workflows.
            </p>
            {selectedCountry && (
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                {selectedCountry.flagUrl ? (
                  <img src={selectedCountry.flagUrl} alt={selectedCountry.name}
                    className="w-10 h-7 object-cover rounded border border-white/[0.08] shrink-0" />
                ) : (
                  <Globe2 size={16} className="text-white/25 shrink-0" />
                )}
                <div>
                  <p className="text-sm text-white/60 font-medium">{selectedCountry.name}</p>
                  <p className="text-xs text-white/30 mt-0.5 font-light">
                    {selectedCountry.code} · ID #{selectedCountry.id}
                  </p>
                </div>
              </div>
            )}
            <DialogFooter className="gap-2">
              <button onClick={() => { setShowDeleteDialog(false); setSelectedCountry(null) }}
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