// "use client"

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuthStore, useUserStore, useComplianceStore } from '@/lib/store';
// import { ChevronLeft, MapPin, Plus, Trash2, Star, Loader2 } from 'lucide-react';

// export default function JurisdictionsPage() {
//   const router = useRouter();
//   const { isAuthenticated } = useAuthStore();
//   const { 
//     jurisdictions, 
//     fetchJurisdictions, 
//     setPrimaryJurisdiction,
//     removeJurisdiction,
//     isLoading: userLoading 
//   } = useUserStore();
//   const {
//     countries,
//     jurisdictions: availableJurisdictions,
//     selectedCountry,
//     fetchCountries,
//     fetchJurisdictions: fetchAvailableJurisdictions,
//     selectCountry,
//   } = useComplianceStore();

//   const [showAddDialog, setShowAddDialog] = useState(false);
//   const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<number | null>(null);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/login');
//       return;
//     }

//     fetchJurisdictions();
//   }, [isAuthenticated, router]);

//   if (!isAuthenticated) {
//     return null;
//   }

//   const handleAddClick = async () => {
//     await fetchCountries();
//     setShowAddDialog(true);
//   };

//   const handleCountrySelect = async (countryId: number) => {
//     const country = countries.find(c => c.id === countryId);
//     if (country) {
//       selectCountry(country);
//       await fetchAvailableJurisdictions(countryId);
//     }
//   };

//   const handleAddJurisdiction = async () => {
//     if (selectedJurisdictionId) {
//       // This would call addJurisdiction from userStore
//       // await addJurisdiction(selectedJurisdictionId);
//       setShowAddDialog(false);
//       setSelectedJurisdictionId(null);
//       selectCountry(null);
//       await fetchJurisdictions();
//     }
//   };

//   const handleSetPrimary = async (id: number) => {
//     await setPrimaryJurisdiction(id);
//   };

//   const handleRemove = async (id: number) => {
//     if (confirm('Are you sure you want to remove this jurisdiction?')) {
//       await removeJurisdiction(id);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       <div>
//         <Link
//           href="/profile"
//           className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
//         >
//           <ChevronLeft className="h-4 w-4" />
//           Back to Profile
//         </Link>

//         <h1 className="text-3xl font-bold">Manage Jurisdictions</h1>
//         <p className="text-muted-foreground mt-2">
//           Add or remove jurisdictions to customize your learning experience
//         </p>
//       </div>

//       {userLoading ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       ) : (
//         <>
//           <div className="space-y-3">
//             {jurisdictions.map((jurisdiction) => (
//               <div
//                 key={jurisdiction.id}
//                 className={`rounded-lg border p-4 ${
//                   jurisdiction.isPrimary ? 'border-primary bg-primary/5' : 'bg-card'
//                 }`}
//               >
//                 <div className="flex items-start justify-between">
//                   <div className="flex items-start gap-3">
//                     <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
//                       <MapPin className="h-5 w-5 text-primary" />
//                     </div>
//                     <div>
//                       <h3 className="font-semibold">{jurisdiction.jurisdictionName}</h3>
//                       <p className="text-sm text-muted-foreground">{jurisdiction.countryName}</p>
//                       {jurisdiction.isPrimary && (
//                         <div className="flex items-center gap-1 mt-2">
//                           <Star className="h-4 w-4 text-primary fill-primary" />
//                           <span className="text-xs text-primary font-medium">Primary Jurisdiction</span>
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   <div className="flex items-center gap-2">
//                     {!jurisdiction.isPrimary && (
//                       <button
//                         onClick={() => handleSetPrimary(jurisdiction.id)}
//                         className="p-2 rounded-lg hover:bg-accent transition-colors"
//                         title="Set as primary"
//                       >
//                         <Star className="h-4 w-4 text-muted-foreground" />
//                       </button>
//                     )}
//                     {!jurisdiction.isPrimary && (
//                       <button
//                         onClick={() => handleRemove(jurisdiction.id)}
//                         className="p-2 rounded-lg hover:bg-destructive/10 hover:text-destructive transition-colors"
//                         title="Remove"
//                       >
//                         <Trash2 className="h-4 w-4" />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>

//           <button
//             onClick={handleAddClick}
//             className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-accent transition-colors"
//           >
//             <Plus className="h-5 w-5" />
//             Add Jurisdiction
//           </button>
//         </>
//       )}

//       {showAddDialog && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
//           <div className="bg-card rounded-lg border max-w-md w-full p-6 space-y-4 max-h-[80vh] overflow-y-auto">
//             <h3 className="text-xl font-bold">Add Jurisdiction</h3>

//             {!selectedCountry ? (
//               <>
//                 <p className="text-sm text-muted-foreground">Select a country:</p>
//                 <div className="space-y-2">
//                   {countries.map((country) => (
//                     <button
//                       key={country.id}
//                       onClick={() => handleCountrySelect(country.id)}
//                       className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left"
//                     >
//                       <span className="text-2xl">{country.flagEmoji}</span>
//                       <span className="font-medium">{country.name}</span>
//                     </button>
//                   ))}
//                 </div>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={() => selectCountry(null)}
//                   className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
//                 >
//                   <ChevronLeft className="h-4 w-4" />
//                   Back to countries
//                 </button>

//                 <p className="text-sm text-muted-foreground">Select a jurisdiction:</p>
//                 <div className="space-y-2">
//                   {availableJurisdictions
//                     .filter(j => !jurisdictions.find(uj => uj.jurisdictionId === j.id))
//                     .map((jurisdiction) => (
//                       <button
//                         key={jurisdiction.id}
//                         onClick={() => setSelectedJurisdictionId(jurisdiction.id)}
//                         className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors text-left ${
//                           selectedJurisdictionId === jurisdiction.id
//                             ? 'border-primary bg-primary/5'
//                             : 'border-border hover:border-primary hover:bg-accent'
//                         }`}
//                       >
//                         <span className="font-medium">{jurisdiction.name}</span>
//                         {selectedJurisdictionId === jurisdiction.id && (
//                           <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
//                             <div className="w-2 h-2 rounded-full bg-white" />
//                           </div>
//                         )}
//                       </button>
//                     ))}
//                 </div>
//               </>
//             )}

//             <div className="flex gap-3 pt-4">
//               <button
//                 onClick={() => {
//                   setShowAddDialog(false);
//                   setSelectedJurisdictionId(null);
//                   selectCountry(null);
//                 }}
//                 className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//               >
//                 Cancel
//               </button>
//               {selectedCountry && (
//                 <button
//                   onClick={handleAddJurisdiction}
//                   disabled={!selectedJurisdictionId}
//                   className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Add
//                 </button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




// "use client"

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { useAuthStore, useUserStore, useComplianceStore } from '@/lib/store'
// import { ChevronLeft, ChevronRight, MapPin, Plus, Trash2, Star, Loader2 } from 'lucide-react'

// export default function JurisdictionsPage() {
//   const router = useRouter()
//   const { isAuthenticated } = useAuthStore()
//   const {
//     jurisdictions,
//     fetchJurisdictions,
//     setPrimaryJurisdiction,
//     removeJurisdiction,
//     isLoading: userLoading,
//   } = useUserStore()
//   const {
//     countries,
//     jurisdictions: availableJurisdictions,
//     selectedCountry,
//     fetchCountries,
//     fetchJurisdictions: fetchAvailableJurisdictions,
//     selectCountry,
//   } = useComplianceStore()

//   const [showAddDialog, setShowAddDialog]           = useState(false)
//   const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<number | null>(null)

//   useEffect(() => {
//     if (!isAuthenticated) { router.push('/login'); return }
//     fetchJurisdictions()
//   }, [isAuthenticated, router])

//   if (!isAuthenticated) return null

//   const handleAddClick = async () => {
//     await fetchCountries()
//     setShowAddDialog(true)
//   }

//   const handleCountrySelect = async (countryId: number) => {
//     const country = countries.find(c => c.id === countryId)
//     if (country) {
//       selectCountry(country)
//       await fetchAvailableJurisdictions(countryId)
//     }
//   }

//   const handleAddJurisdiction = async () => {
//     if (!selectedJurisdictionId) return
//     // await addJurisdiction(selectedJurisdictionId)
//     setShowAddDialog(false)
//     setSelectedJurisdictionId(null)
//     selectCountry(null)
//     await fetchJurisdictions()
//   }

//   const handleRemove = async (id: number) => {
//     if (confirm('Are you sure you want to remove this jurisdiction?')) {
//       await removeJurisdiction(id)
//     }
//   }

//   const closeDialog = () => {
//     setShowAddDialog(false)
//     setSelectedJurisdictionId(null)
//     selectCountry(null)
//   }

//   return (
//     <>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
//         .font-syne { font-family: 'Syne', sans-serif; }
//         .font-dm   { font-family: 'DM Sans', sans-serif; }
//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(10px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateX(8px); }
//           to   { opacity: 1; transform: translateX(0); }
//         }
//         .animate-fade-up { animation: fadeUp 0.4s ease both; }
//         .animate-fade-in { animation: fadeIn 0.25s ease both; }
//         .delay-1 { animation-delay: 0.06s; }
//         .delay-2 { animation-delay: 0.12s; }
//       `}</style>

//       <div className="font-dm max-w-2xl mx-auto space-y-5 text-foreground">

//         {/* ── Header ── */}
//         <div className="animate-fade-up">
//           <Link
//             href="/profile"
//             className="inline-flex items-center gap-1.5 text-xs text-muted-foreground
//                        hover:text-primary transition-colors duration-200 no-underline mb-4"
//           >
//             <ChevronLeft size={13} />
//             Back to Profile
//           </Link>
//           <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
//             Manage Jurisdictions
//           </h1>
//           <p className="text-sm text-muted-foreground font-light mt-1">
//             Add or remove jurisdictions to customize your learning experience
//           </p>
//         </div>

//         {/* ── Loading ── */}
//         {userLoading ? (
//           <div className="flex items-center justify-center py-20">
//             <Loader2 size={24} className="animate-spin text-primary/50" />
//           </div>
//         ) : (
//           <>
//             {/* ── Jurisdiction list ── */}
//             <div className="space-y-2 animate-fade-up delay-1">
//               {jurisdictions.length === 0 && (
//                 <div className="text-center py-12 text-sm text-muted-foreground font-light
//                                 border border-border rounded-2xl bg-card">
//                   No jurisdictions added yet
//                 </div>
//               )}

//               {jurisdictions.map((jurisdiction) => (
//                 <div
//                   key={jurisdiction.id}
//                   className={`flex items-start justify-between gap-4 px-5 py-4 rounded-2xl
//                               border transition-colors duration-200
//                               ${jurisdiction.isPrimary
//                                 ? 'bg-primary/[0.05] border-primary/[0.18]'
//                                 : 'bg-card border-border'}`}
//                 >
//                   {/* Left */}
//                   <div className="flex items-start gap-3.5 min-w-0">
//                     <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
//                                     ${jurisdiction.isPrimary
//                                       ? 'bg-primary/10'
//                                       : 'bg-muted/20'}`}>
//                       <MapPin size={15}
//                               className={jurisdiction.isPrimary ? 'text-primary/80' : 'text-foreground/30'} />
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-sm font-medium text-foreground truncate">
//                         {jurisdiction.jurisdictionName}
//                       </p>
//                       <p className="text-xs text-muted-foreground mt-0.5">{jurisdiction.countryName}</p>
//                       {jurisdiction.isPrimary && (
//                         <div className="inline-flex items-center gap-1 mt-2
//                                         text-[10px] font-medium tracking-widest uppercase
//                                         text-primary bg-primary/10 border border-primary/20
//                                         px-2 py-0.5 rounded-full">
//                           <Star size={9} className="fill-primary text-primary" />
//                           Primary
//                         </div>
//                       )}
//                     </div>
//                   </div>

//                   {/* Actions */}
//                   {!jurisdiction.isPrimary && (
//                     <div className="flex items-center gap-1 shrink-0">
//                       <button
//                         onClick={() => setPrimaryJurisdiction(jurisdiction.id)}
//                         title="Set as primary"
//                         className="p-2 rounded-xl text-foreground/25 hover:text-amber-300
//                                    hover:bg-amber-300/[0.08] transition-all duration-200"
//                       >
//                         <Star size={15} />
//                       </button>
//                       <button
//                         onClick={() => handleRemove(jurisdiction.id)}
//                         title="Remove"
//                         className="p-2 rounded-xl text-foreground/25 hover:text-destructive
//                                    hover:bg-destructive/[0.08] transition-all duration-200"
//                       >
//                         <Trash2 size={15} />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>

//             {/* ── Add button ── */}
//             <button
//               onClick={handleAddClick}
//               className="animate-fade-up delay-2
//                          w-full flex items-center justify-center gap-2 px-4 py-3.5
//                          border border-dashed border-border rounded-2xl
//                          text-sm text-foreground/40 font-medium
//                          hover:border-primary/30 hover:text-primary hover:bg-primary/[0.04]
//                          transition-all duration-200"
//             >
//               <Plus size={16} />
//               Add Jurisdiction
//             </button>
//           </>
//         )}
//       </div>

//       {/* ── Add dialog ── */}
//       {showAddDialog && (
//         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center
//                         justify-center z-50 p-4">
//           <div className="bg-card border border-border rounded-2xl
//                           max-w-md w-full max-h-[80vh] flex flex-col
//                           shadow-[0_24px_64px_rgba(0,0,0,0.25)] animate-fade-up">

//             {/* Dialog header */}
//             <div className="px-6 pt-6 pb-4 border-b border-border shrink-0">
//               {selectedCountry && (
//                 <button
//                   onClick={() => selectCountry(null)}
//                   className="inline-flex items-center gap-1.5 text-xs text-muted-foreground
//                              hover:text-primary transition-colors duration-200 mb-3"
//                 >
//                   <ChevronLeft size={13} />
//                   Back to countries
//                 </button>
//               )}
//               <h3 className="font-syne font-bold text-lg tracking-tight">
//                 {selectedCountry ? `Select jurisdiction` : 'Select country'}
//               </h3>
//               <p className="text-xs text-muted-foreground font-light mt-1">
//                 {selectedCountry
//                   ? `Choose a jurisdiction in ${selectedCountry.name}`
//                   : 'Which country do you want to practice for?'}
//               </p>
//             </div>

//             {/* Dialog body */}
//             <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 animate-fade-in">
//               {!selectedCountry ? (
//                 countries.map((country) => (
//                   <button
//                     key={country.id}
//                     onClick={() => handleCountrySelect(country.id)}
//                     className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-left
//                                border border-border bg-muted/10
//                                hover:border-primary/30 hover:bg-primary/[0.04]
//                                transition-all duration-200 group"
//                   >
//                     <span className="text-xl shrink-0">{country.flagEmoji}</span>
//                     <span className="text-sm font-medium text-foreground flex-1">{country.name}</span>
//                     <ChevronRight size={14}
//                                   className="text-foreground/20 group-hover:text-primary/60
//                                              transition-colors duration-200 shrink-0" />
//                   </button>
//                 ))
//               ) : (
//                 availableJurisdictions
//                   .filter(j => !jurisdictions.find(uj => uj.jurisdictionId === j.id))
//                   .map((jurisdiction) => {
//                     const isSelected = selectedJurisdictionId === jurisdiction.id
//                     return (
//                       <button
//                         key={jurisdiction.id}
//                         onClick={() => setSelectedJurisdictionId(jurisdiction.id)}
//                         className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl
//                                     text-left border transition-all duration-200
//                                     ${isSelected
//                                       ? 'border-primary/40 bg-primary/[0.07]'
//                                       : 'border-border bg-muted/10 hover:border-primary/25 hover:bg-primary/[0.04]'}`}
//                       >
//                         <span className={`text-sm font-medium transition-colors duration-200
//                                          ${isSelected ? 'text-primary' : 'text-foreground'}`}>
//                           {jurisdiction.name}
//                         </span>
//                         {isSelected && (
//                           <div className="w-4 h-4 rounded-full bg-primary flex items-center
//                                           justify-center shrink-0">
//                             <div className="w-1.5 h-1.5 rounded-full bg-primary-foreground" />
//                           </div>
//                         )}
//                       </button>
//                     )
//                   })
//               )}
//             </div>

//             {/* Dialog footer */}
//             <div className="px-6 py-4 border-t border-border flex gap-2.5 shrink-0">
//               <button
//                 onClick={closeDialog}
//                 className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
//                            text-foreground/60 border border-border bg-muted/20
//                            hover:text-foreground/90 hover:border-foreground/20
//                            transition-all duration-200"
//               >
//                 Cancel
//               </button>
//               {selectedCountry && (
//                 <button
//                   onClick={handleAddJurisdiction}
//                   disabled={!selectedJurisdictionId}
//                   className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
//                              text-primary-foreground bg-primary
//                              hover:opacity-85 hover:-translate-y-px
//                              disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0
//                              transition-all duration-200
//                              [box-shadow:0_0_20px_hsl(var(--primary)/0.25)]"
//                 >
//                   Add Jurisdiction
//                 </button>
//               )}
//             </div>

//           </div>
//         </div>
//       )}
//     </>
//   )
// }


"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore, useUserStore, useComplianceStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, MapPin, Plus, Trash2, CheckCircle2, Loader2, X } from 'lucide-react'

export default function JurisdictionsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const {
    jurisdictions,
    fetchJurisdictions,
    addJurisdiction,
    activateJurisdiction,
    removeJurisdiction,
    isLoading: userLoading,
  } = useUserStore()
  const {
    countries,
    jurisdictions: availableJurisdictions,
    selectedCountry,
    fetchCountries,
    fetchJurisdictions: fetchAvailableJurisdictions,
    selectCountry,
  } = useComplianceStore()

  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedJurisdictionId, setSelectedJurisdictionId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchJurisdictions()
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleAddClick = async () => {
    await fetchCountries()
    setShowAddDialog(true)
  }

  const handleCountrySelect = async (countryId: number) => {
    const country = countries.find(c => c.id === countryId)
    if (country) {
      selectCountry(country)
      await fetchAvailableJurisdictions(countryId)
    }
  }

  const handleAddJurisdiction = async () => {
    if (!selectedJurisdictionId) return
    await addJurisdiction(selectedJurisdictionId)
    setShowAddDialog(false)
    setSelectedJurisdictionId(null)
    selectCountry(null)
    await fetchJurisdictions()
  }

  const handleRemove = async (id: number) => {
    if (confirm('Are you sure you want to remove this jurisdiction?')) {
      await removeJurisdiction(id)
    }
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setSelectedJurisdictionId(null)
    selectCountry(null)
  }

  const filteredAvailable = availableJurisdictions.filter(
    j => !jurisdictions.find(uj => uj.jurisdictionId === j.id)
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes fadeSlide {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .animate-fade-up   { animation: fadeUp   0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-scale-in  { animation: scaleIn  0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-slide{ animation: fadeSlide 0.25s cubic-bezier(0.22,1,0.36,1) both; }

        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }

        .row-hover {
          transition: background 0.18s ease, border-color 0.18s ease,
                      transform 0.18s ease, box-shadow 0.18s ease;
        }
        .row-hover:hover { transform: translateX(2px); }

        .action-btn {
          transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease;
        }
        .action-btn:hover  { transform: scale(1.1); }
        .action-btn:active { transform: scale(0.95); }

        .add-btn {
          transition: border-color 0.2s ease, color 0.2s ease,
                      background 0.2s ease, transform 0.2s ease;
        }
        .add-btn:hover  { transform: translateY(-1px); }
        .add-btn:active { transform: translateY(0); }

        .list-scroll::-webkit-scrollbar { width: 4px; }
        .list-scroll::-webkit-scrollbar-track { background: transparent; }
        .list-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 99px;
        }
      `}</style>

      <div className="font-dm max-w-2xl mx-auto space-y-5 text-foreground pb-10">

        {/* ── Header ── */}
        <div className="animate-fade-up">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60
                       hover:text-primary transition-colors duration-200 no-underline mb-4
                       group"
          >
            <ChevronLeft size={13} className="transition-transform group-hover:-translate-x-0.5" />
            Back to Profile
          </Link>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-[11px] font-medium tracking-[0.18em] uppercase
                            text-primary/50 mb-1">
                Settings
              </p>
              <h1 className="font-syne font-bold text-2xl sm:text-[2rem] tracking-tight leading-none">
                Jurisdictions
              </h1>
              <p className="text-sm text-muted-foreground/60 font-light mt-2">
                Customize which regions you're studying for
              </p>
            </div>
            {!userLoading && jurisdictions.length > 0 && (
              <span className="text-[11px] text-muted-foreground/50 font-medium
                               bg-muted/20 border border-border/50
                               px-2.5 py-1 rounded-full mb-1">
                {jurisdictions.length} added
              </span>
            )}
          </div>
        </div>

        {/* ── Loading ── */}
        {userLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={22} className="animate-spin text-primary/40" />
              <p className="text-xs text-muted-foreground/40">Loading jurisdictions…</p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Card wrapper ── */}
            <div className="animate-fade-up delay-1
                            bg-card border border-border rounded-2xl overflow-hidden
                            shadow-[0_2px_20px_rgba(0,0,0,0.1)]">

              <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

              <div className="p-2">
                {jurisdictions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-14 gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-muted/20 border border-border/50
                                    flex items-center justify-center">
                      <MapPin size={20} className="text-muted-foreground/25" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground/50 font-medium">
                        No jurisdictions yet
                      </p>
                      <p className="text-xs text-muted-foreground/35 font-light mt-0.5">
                        Add one below to start learning
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {jurisdictions.map((jurisdiction, i) => (
                      <div
                        key={jurisdiction.id}
                        className={`row-hover group flex items-center justify-between gap-4
                                    px-4 py-3.5 rounded-xl border
                                    ${jurisdiction.isActive
                                      ? 'bg-emerald-500/[0.05] border-emerald-500/40'
                                      : 'bg-transparent border-transparent hover:bg-muted/10 hover:border-border/60'}`}
                        style={{ animationDelay: `${i * 0.04}s` }}
                      >
                        {/* Left */}
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                          shrink-0 transition-colors duration-200
                                          ${jurisdiction.isActive
                                            ? 'bg-emerald-500/10 border border-emerald-500/20'
                                            : 'bg-muted/20 border border-border/50 group-hover:bg-muted/30'}`}>
                            <MapPin
                              size={14}
                              className={jurisdiction.isActive
                                ? 'text-emerald-500/70'
                                : 'text-muted-foreground/40'}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground truncate leading-tight">
                              {jurisdiction.jurisdictionName}
                            </p>
                            <p className="text-xs text-muted-foreground/50 mt-0.5">
                              {jurisdiction.countryName}
                            </p>
                          </div>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {jurisdiction.isActive ? (
                            <span className="inline-flex items-center gap-1.5
                                             text-[10px] font-semibold tracking-[0.15em] uppercase
                                             text-emerald-600 bg-emerald-500/10 border border-emerald-500/30
                                             px-2.5 py-1 rounded-full">
                              <CheckCircle2 size={9} className="fill-emerald-600 text-emerald-600" />
                              Active
                            </span>
                          ) : (
                            <>
                              <button
                                onClick={() => activateJurisdiction(jurisdiction.id)}
                                className="action-btn px-3 py-1.5 rounded-lg text-[11px] font-medium
                                           text-emerald-600 bg-emerald-500/10 border border-emerald-500/30
                                           hover:bg-emerald-500/20 hover:border-emerald-500/40"
                              >
                                Activate
                              </button>
                              <button
                                onClick={() => handleRemove(jurisdiction.id)}
                                title="Remove jurisdiction"
                                className="action-btn p-2 rounded-lg
                                           text-muted-foreground/25
                                           hover:text-destructive hover:bg-destructive/[0.09]"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Add button ── */}
            <button
              onClick={handleAddClick}
              className="row-hover flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5
                         border border-dashed border-emerald-500/70 rounded-xl
                         text-sm text-muted-foreground/50
                         hover:text-foreground/70 hover:border-emerald-500/[0.3] bg-emerald-500/[0.1] hover:bg-emerald-500/[0.2] 
                         transition-all no-underline"
            >
              <Plus size={15} />
              Add Jurisdiction
            </button>
          </>
        )}
      </div>

      {/* ── Add dialog ── */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/65 backdrop-blur-md
                        flex items-center justify-center z-50 p-4">
          <div className="animate-scale-in bg-card border border-border rounded-2xl
                          max-w-md w-full max-h-[82vh] flex flex-col
                          shadow-[0_32px_80px_rgba(0,0,0,0.35)]">

            {/* Top accent */}
            <div className="h-[2px] w-full shrink-0 bg-gradient-to-r
                            from-transparent via-primary/40 to-transparent rounded-t-2xl" />

            {/* Dialog header */}
            <div className="px-6 pt-5 pb-4 border-b border-border/70 shrink-0">
              <div className="flex items-start justify-between">
                <div>
                  {selectedCountry && (
                    <button
                      onClick={() => { selectCountry(null); setSelectedJurisdictionId(null) }}
                      className="inline-flex items-center gap-1.5
                                 text-xs text-muted-foreground/50
                                 hover:text-primary transition-colors mb-3 group"
                    >
                      <ChevronLeft size={12}
                                   className="transition-transform group-hover:-translate-x-0.5" />
                      Back to countries
                    </button>
                  )}
                  <h3 className="font-syne font-bold text-lg tracking-tight leading-tight">
                    {selectedCountry ? 'Select Jurisdiction' : 'Select Country'}
                  </h3>
                  <p className="text-xs text-muted-foreground/50 font-light mt-1">
                    {selectedCountry
                      ? `Choose a jurisdiction in ${selectedCountry.name}`
                      : 'Which country are you studying for?'}
                  </p>
                </div>
                <button
                  onClick={closeDialog}
                  className="p-1.5 rounded-lg text-muted-foreground/40
                             hover:text-foreground/70 hover:bg-muted/20
                             active:scale-95 transition-all ml-4 mt-0.5"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Dialog body */}
            <div className="list-scroll flex-1 overflow-y-auto px-6 py-4">
              {!selectedCountry ? (
                <div className="animate-fade-slide space-y-1.5">
                  {countries.map((country) => (
                    <button
                      key={country.id}
                      onClick={() => handleCountrySelect(country.id)}
                      className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-left
                                 border border-border/60 bg-muted/10
                                 hover:border-primary/25 hover:bg-primary/[0.04]
                                 active:scale-[0.99]
                                 transition-all duration-150 group"
                    >
                      <span className="text-xl shrink-0 leading-none">{country.flagEmoji}</span>
                      <span className="text-sm font-medium text-foreground flex-1 truncate">
                        {country.name}
                      </span>
                      <ChevronRight
                        size={13}
                        className="text-foreground/20 group-hover:text-primary/50
                                   group-hover:translate-x-0.5
                                   transition-all duration-150 shrink-0"
                      />
                    </button>
                  ))}
                </div>
              ) : filteredAvailable.length === 0 ? (
                <div className="animate-fade-slide flex flex-col items-center
                                justify-center py-12 gap-2">
                  <MapPin size={22} className="text-muted-foreground/20" />
                  <p className="text-sm text-muted-foreground/40 text-center">
                    All jurisdictions in {selectedCountry.name} have been added
                  </p>
                </div>
              ) : (
                <div className="animate-fade-slide space-y-1.5">
                  {filteredAvailable.map((jurisdiction) => {
                    const isSelected = selectedJurisdictionId === jurisdiction.id
                    return (
                      <button
                        key={jurisdiction.id}
                        onClick={() => setSelectedJurisdictionId(jurisdiction.id)}
                        className={`w-full flex items-center justify-between
                                    px-4 py-3.5 rounded-xl text-left border
                                    active:scale-[0.99] transition-all duration-150
                                    ${isSelected
                                      ? 'border-primary/30 bg-primary/[0.07] shadow-[0_0_0_1px_hsl(var(--primary)/0.12)]'
                                      : 'border-border/60 bg-muted/10 hover:border-primary/20 hover:bg-muted/20'}`}
                      >
                        <span className={`text-sm font-medium transition-colors duration-150
                                         ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                          {jurisdiction.name}
                        </span>
                        {isSelected ? (
                          <div className="w-4 h-4 rounded-full bg-primary
                                          flex items-center justify-center shrink-0">
                            <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                              <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5"
                                    strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-border/60 shrink-0" />
                        )}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Dialog footer */}
            <div className="px-6 py-4 border-t border-border/70 flex gap-2.5 shrink-0">
              <button
                onClick={closeDialog}
                className="row-hover flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5
                         border border-dashed border-red-500/70 rounded-xl
                         text-sm text-muted-foreground/50
                         hover:text-foreground/70 hover:border-red-500/[0.3] bg-red-500/[0.1] hover:bg-red-500/[0.2] 
                         transition-all no-underline"
              >
                Cancel
              </button>
              {selectedCountry && (
                <button
                  onClick={handleAddJurisdiction}
                  disabled={!selectedJurisdictionId}
                  className="row-hover flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5
                         border border-dashed border-emerald-500/70 rounded-xl
                         text-sm text-muted-foreground/50
                         hover:text-foreground/70 hover:border-emerald-500/[0.3] bg-emerald-500/[0.1] hover:bg-emerald-500/[0.2] 
                         transition-all no-underline"
                >
                  Add Jurisdiction
                </button>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  )
}