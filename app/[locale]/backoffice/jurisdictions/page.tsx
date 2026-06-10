// "use client"

// import { useEffect, useState } from 'react';
// import { useAdminStore } from '@/lib/store/admin-store';
// import { AdminJurisdiction, CreateJurisdictionRequest } from '@/lib/types/admin';
// import {
//   Plus,
//   Trash2,
//   Edit,
//   Loader2,
//   CheckCircle,
//   XCircle,
//   Globe,
//   Filter,
// } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';

// export default function JurisdictionsPage() {
//   const {
//     jurisdictions,
//     isLoading,
//     fetchJurisdictions,
//     createJurisdiction,
//     updateJurisdiction,
//     deleteJurisdiction,
//     countries,
//     fetchCountries,
//   } = useAdminStore();

//   const [showCreateDialog, setShowCreateDialog] = useState(false);
//   const [showEditDialog, setShowEditDialog] = useState(false);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [selectedJurisdiction, setSelectedJurisdiction] = useState<AdminJurisdiction | null>(null);
//   const [filterCountryId, setFilterCountryId] = useState<number | ''>('');
//   const [formData, setFormData] = useState<CreateJurisdictionRequest>({
//     countryId: 0,
//     code: '',
//     name: '',
//     active: true,
//   });

//   useEffect(() => {
//     fetchCountries();
//   }, [fetchCountries]);

//   const handleCreate = async () => {
//     try {
//       await createJurisdiction(formData);
//       setShowCreateDialog(false);
//       setFormData({ countryId: 0, code: '', name: '', active: true });
//       handleFetchJurisdictions();
//     } catch (error) {
//       console.error('Failed to create jurisdiction:', error);
//     }
//   };

//   const handleUpdate = async () => {
//     if (!selectedJurisdiction) return;
//     try {
//       await updateJurisdiction(selectedJurisdiction.id, formData);
//       setShowEditDialog(false);
//       setSelectedJurisdiction(null);
//       setFormData({ countryId: 0, code: '', name: '', active: true });
//       handleFetchJurisdictions();
//     } catch (error) {
//       console.error('Failed to update jurisdiction:', error);
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedJurisdiction) return;
//     try {
//       await deleteJurisdiction(selectedJurisdiction.id);
//       setShowDeleteDialog(false);
//       setSelectedJurisdiction(null);
//       handleFetchJurisdictions();
//     } catch (error) {
//       console.error('Failed to delete jurisdiction:', error);
//     }
//   };

//   const handleFetchJurisdictions = () => {
//     const countryId = filterCountryId === '' ? undefined : filterCountryId;
//     fetchJurisdictions(countryId);
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Jurisdictions</h1>
//           <p className="text-muted-foreground mt-2">
//             Manage jurisdictions and their settings
//           </p>
//         </div>
//         <button
//           onClick={() => setShowCreateDialog(true)}
//           className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
//         >
//           <Plus className="h-4 w-4" />
//           Create Jurisdiction
//         </button>
//       </div>

//       {/* Filter Section */}
//       <div className="rounded-lg border bg-card p-4">
//         <div className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
//           <Filter className="h-4 w-4" />
//           Filter
//         </div>
//         <div className="flex items-center gap-3">
//           <select
//             value={filterCountryId}
//             onChange={(e) => setFilterCountryId(e.target.value ? Number(e.target.value) : '')}
//             className="flex-1 h-10 rounded-lg border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
//           >
//             <option value="">All Countries</option>
//             {countries.map((country) => (
//               <option key={country.id} value={country.id}>
//                 {country.name}
//               </option>
//             ))}
//           </select>
//           <button
//             onClick={handleFetchJurisdictions}
//             disabled={isLoading}
//             className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
//           >
//             {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Filter className="h-4 w-4" />}
//             Fetch Jurisdictions
//           </button>
//         </div>
//       </div>

//       {/* Jurisdictions Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {isLoading ? (
//           <div className="col-span-full flex items-center justify-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         ) : jurisdictions.length === 0 ? (
//           <div className="col-span-full text-center py-12 text-muted-foreground rounded-lg border bg-card">
//             <p>No jurisdictions found</p>
//           </div>
//         ) : (
//           jurisdictions.map((jurisdiction) => (
//             <div
//               key={jurisdiction.id}
//               className="p-6 rounded-lg border bg-card hover:bg-accent transition-colors"
//             >
//               <div className="flex items-start justify-between mb-4">
//                 <div className="flex items-center gap-3">
//                   <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
//                     <Globe className="h-6 w-6 text-primary" />
//                   </div>
//                   <div>
//                     <h3 className="font-semibold text-lg">{jurisdiction.name}</h3>
//                     <p className="text-sm text-muted-foreground">{jurisdiction.code}</p>
//                   </div>
//                 </div>
//                 {jurisdiction.active ? (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-500">
//                     <CheckCircle className="h-3 w-3" />
//                     Active
//                   </span>
//                 ) : (
//                   <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
//                     <XCircle className="h-3 w-3" />
//                     Inactive
//                   </span>
//                 )}
//               </div>
//               <div className="space-y-2 text-sm text-muted-foreground mb-4">
//                 <div className="flex items-center justify-between">
//                   <span>ID:</span>
//                   <span className="font-medium">{jurisdiction.id}</span>
//                 </div>
//                 {jurisdiction.countryName && (
//                   <div className="flex items-center justify-between">
//                     <span>Country:</span>
//                     <span className="font-medium">{jurisdiction.countryName}</span>
//                   </div>
//                 )}
//                 <div className="flex items-center justify-between">
//                   <span>Created:</span>
//                   <span className="font-medium">
//                     {new Date(jurisdiction.createdAt).toLocaleDateString()}
//                   </span>
//                 </div>
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => {
//                     setSelectedJurisdiction(jurisdiction);
//                     setFormData({
//                       countryId: jurisdiction.countryId,
//                       code: jurisdiction.code,
//                       name: jurisdiction.name,
//                       active: jurisdiction.active,
//                     });
//                     setShowEditDialog(true);
//                   }}
//                   className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//                 >
//                   <Edit className="h-4 w-4" />
//                   Edit
//                 </button>
//                 <button
//                   onClick={() => {
//                     setSelectedJurisdiction(jurisdiction);
//                     setShowDeleteDialog(true);
//                   }}
//                   className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors"
//                 >
//                   <Trash2 className="h-4 w-4" />
//                   Delete
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
//             <DialogTitle>Create Jurisdiction</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Country</label>
//               <select
//                 value={formData.countryId}
//                 onChange={(e) => setFormData({ ...formData, countryId: Number(e.target.value) })}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               >
//                 <option value={0}>Select Country</option>
//                 {countries.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Code</label>
//               <input
//                 type="text"
//                 value={formData.code}
//                 onChange={(e) => setFormData({ ...formData, code: e.target.value })}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//                 placeholder="e.g., UK, US"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium mb-2">Name</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//                 placeholder="Jurisdiction name"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 id="active"
//                 checked={formData.active}
//                 onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
//                 className="w-4 h-4"
//               />
//               <label htmlFor="active" className="text-sm font-medium">
//                 Active
//               </label>
//             </div>
//           </div>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowCreateDialog(false);
//                 setFormData({ countryId: 0, code: '', name: '', active: true });
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleCreate}
//               disabled={isLoading || !formData.countryId || !formData.code || !formData.name}
//               className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
//             <DialogTitle>Edit Jurisdiction</DialogTitle>
//           </DialogHeader>
//           <div className="space-y-4">
//             <div>
//               <label className="block text-sm font-medium mb-2">Name</label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full px-4 py-2 border border-border rounded-lg bg-card focus:outline-none focus:ring-2 focus:ring-primary"
//               />
//             </div>
//             <div className="flex items-center gap-2">
//               <input
//                 type="checkbox"
//                 id="edit-active"
//                 checked={formData.active}
//                 onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
//                 className="w-4 h-4"
//               />
//               <label htmlFor="edit-active" className="text-sm font-medium">
//                 Active
//               </label>
//             </div>
//           </div>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowEditDialog(false);
//                 setSelectedJurisdiction(null);
//                 setFormData({ countryId: 0, code: '', name: '', active: true });
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleUpdate}
//               disabled={isLoading || !formData.name}
//               className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
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
//             <DialogTitle>Delete Jurisdiction</DialogTitle>
//           </DialogHeader>
//           <p className="text-muted-foreground">
//             Are you sure you want to delete the jurisdiction "{selectedJurisdiction?.name}"? This action cannot be undone.
//           </p>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowDeleteDialog(false);
//                 setSelectedJurisdiction(null);
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
import { useAdminStore } from '@/lib/store/admin-store';
import { AdminJurisdiction, CreateJurisdictionRequest } from '@/lib/types/admin';
import {
  AlertCircle, Check, CheckCircle2, Edit, Globe2,
  Loader2, Plus, Search, SlidersHorizontal, Sparkles, Trash2,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

// ── Page ───────────────────────────────────────────────────────────────────────
export default function JurisdictionsPage() {
  const {
    jurisdictions, isLoading,
    fetchJurisdictions, createJurisdiction, updateJurisdiction, deleteJurisdiction,
    countries, fetchCountries,
  } = useAdminStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog,   setShowEditDialog]   = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<AdminJurisdiction | null>(null);
  const [filterCountryId, setFilterCountryId] = useState<number | ''>('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState<CreateJurisdictionRequest>({
    countryId: 0, code: '', name: '', active: true,
  });

  useEffect(() => { void fetchCountries() }, [fetchCountries]);

  const handleFetch = () => {
    void fetchJurisdictions(filterCountryId === '' ? undefined : filterCountryId);
  };

  const resetForm = () => setFormData({ countryId: 0, code: '', name: '', active: true });

  const handleCreate = async () => {
    try {
      await createJurisdiction(formData);
      setShowCreateDialog(false); resetForm(); handleFetch();
      setFeedback({ type: 'success', message: 'Jurisdiction created successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to create jurisdiction.' }) }
  };

  const handleUpdate = async () => {
    if (!selectedJurisdiction) return;
    try {
      await updateJurisdiction(selectedJurisdiction.id, formData);
      setShowEditDialog(false); setSelectedJurisdiction(null); resetForm(); handleFetch();
      setFeedback({ type: 'success', message: 'Jurisdiction updated successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to update jurisdiction.' }) }
  };

  const handleDelete = async () => {
    if (!selectedJurisdiction) return;
    try {
      await deleteJurisdiction(selectedJurisdiction.id);
      setShowDeleteDialog(false); setSelectedJurisdiction(null); handleFetch();
      setFeedback({ type: 'success', message: 'Jurisdiction deleted.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to delete jurisdiction.' }) }
  };

  const openEdit = (j: AdminJurisdiction) => {
    setSelectedJurisdiction(j);
    setFormData({ countryId: j.countryId, code: j.code, name: j.name, active: j.active });
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
                  Admin · Jurisdictions
                </span>
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Jurisdictions</h1>
              <p className="text-sm text-white/40 font-light mt-1">
                Manage jurisdictions and their settings.
              </p>
            </div>
            <button onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
              <Plus size={15} /> Create Jurisdiction
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
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <select value={filterCountryId}
              onChange={e => setFilterCountryId(e.target.value ? Number(e.target.value) : '')}
              className={`${selectClass} sm:flex-1`}>
              <option value="">All Countries</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={handleFetch} disabled={isLoading}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Fetch Jurisdictions
            </button>
          </div>
        </div>

        {/* ── Grid ── */}
        <div className="animate-fade-up delay-2">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-52 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
              ))}
            </div>
          ) : jurisdictions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
                            border border-dashed border-white/[0.08] text-center">
              <Globe2 size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No jurisdictions found. Create one to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {jurisdictions.map(jurisdiction => (
                <div key={jurisdiction.id}
                  className="flex flex-col bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                             hover:border-white/[0.14] transition-all duration-200
                             shadow-[0_2px_16px_rgba(0,0,0,0.2)]">

                  {/* Card header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                                      flex items-center justify-center shrink-0">
                        <Globe2 size={16} className="text-emerald-300" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-medium text-[#f0f0f5] truncate">{jurisdiction.name}</h3>
                        <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium
                                         uppercase tracking-widest border text-emerald-300 bg-emerald-300/10 border-emerald-300/20">
                          {jurisdiction.code}
                        </span>
                      </div>
                    </div>
                    {/* Active / Inactive badge */}
                    <span className={`inline-flex items-center shrink-0 px-2 py-0.5 rounded-full text-[10px] font-medium
                                      uppercase tracking-widest border
                                      ${jurisdiction.active
                                        ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20'
                                        : 'text-white/30 bg-white/[0.04] border-white/[0.09]'}`}>
                      {jurisdiction.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  {/* Meta rows */}
                  <div className="space-y-1.5 text-xs text-white/35 font-light mb-5 flex-1">
                    <div className="flex items-center justify-between">
                      <span>ID</span>
                      <span className="text-white/55 tabular-nums">#{jurisdiction.id}</span>
                    </div>
                    {jurisdiction.countryName && (
                      <div className="flex items-center justify-between">
                        <span>Country</span>
                        <span className="text-white/55">{jurisdiction.countryName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span>Created</span>
                      <span className="text-white/55 tabular-nums">
                        {new Date(jurisdiction.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Card actions */}
                  <div className="flex items-center gap-1.5 pt-4 border-t border-white/[0.06]">
                    <button onClick={() => openEdit(jurisdiction)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                 transition-all duration-200">
                      <Edit size={12} /> Edit
                    </button>
                    <button onClick={() => { setSelectedJurisdiction(jurisdiction); setShowDeleteDialog(true) }}
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
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">Create Jurisdiction</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <SectionBlock title="Details">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Country <span className="text-red-400">*</span>
                    </label>
                    <select value={formData.countryId}
                      onChange={e => setFormData(p => ({ ...p, countryId: Number(e.target.value) }))}
                      className={selectClass}>
                      <option value={0}>Select country…</option>
                      {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        Code <span className="text-red-400">*</span>
                      </label>
                      <input value={formData.code}
                        onChange={e => setFormData(p => ({ ...p, code: e.target.value }))}
                        placeholder="e.g. UK"
                        className={inputClass} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input value={formData.name}
                        onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                        placeholder="Jurisdiction name"
                        className={inputClass} />
                    </div>
                  </div>
                  <Toggle checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
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
                disabled={isLoading || !formData.countryId || !formData.code || !formData.name}
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
        <Dialog open={showEditDialog} onOpenChange={open => { setShowEditDialog(open); if (!open) { setSelectedJurisdiction(null); resetForm() } }}>
          <DialogContent className="max-w-md bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                  <Edit size={14} className="text-emerald-300" />
                </div>
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">Edit Jurisdiction</DialogTitle>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-1">
              <SectionBlock title="Details">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                      Name <span className="text-red-400">*</span>
                    </label>
                    <input value={formData.name}
                      onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                      className={inputClass} />
                  </div>
                  <Toggle checked={formData.active} onChange={v => setFormData(p => ({ ...p, active: v }))} />
                </div>
              </SectionBlock>
            </div>

            <DialogFooter className="gap-2">
              <button onClick={() => { setShowEditDialog(false); setSelectedJurisdiction(null); resetForm() }}
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
                  Delete Jurisdiction
                </DialogTitle>
              </div>
            </DialogHeader>
            <p className="text-sm text-white/45 font-light">
              This performs a soft delete and removes the jurisdiction from active workflows.
            </p>
            {selectedJurisdiction && (
              <div className="px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <p className="text-sm text-white/60 font-medium">{selectedJurisdiction.name}</p>
                <p className="text-xs text-white/30 mt-0.5 font-light">
                  {selectedJurisdiction.code} · ID #{selectedJurisdiction.id}
                </p>
              </div>
            )}
            <DialogFooter className="gap-2">
              <button onClick={() => { setShowDeleteDialog(false); setSelectedJurisdiction(null) }}
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