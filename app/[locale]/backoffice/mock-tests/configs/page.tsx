// "use client"

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import api from '@/lib/api/client';
// import { useAuthStore } from '@/lib/store';
// import { MockTestConfigAdminResponse, MockTestConfigListResponse } from '@/lib/types/mock-test';
// import { Plus, Edit, Trash2, Loader2, CheckCircle, XCircle } from 'lucide-react';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from '@/components/ui/dialog';

// export default function MockTestConfigsPage() {
//   const router = useRouter();
//   const { user } = useAuthStore();
//   const [configs, setConfigs] = useState<MockTestConfigAdminResponse[]>([]);
//   const [page, setPage] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [showDeleteDialog, setShowDeleteDialog] = useState(false);
//   const [selectedConfig, setSelectedConfig] = useState<MockTestConfigAdminResponse | null>(null);

//   useEffect(() => {
//     fetchConfigs();
//   }, [page]);

//   const fetchConfigs = async () => {
//     if (!user?.activeJurisdictionId) {
//       setError('No jurisdiction selected');
//       setIsLoading(false);
//       return;
//     }

//     setIsLoading(true);
//     setError(null);
//     try {
//       // Build query params manually to avoid sending undefined values
//       const queryParams = new URLSearchParams();
//       queryParams.append('jurisdictionId', user.activeJurisdictionId.toString());
//       queryParams.append('page', page.toString());
//       queryParams.append('size', '10');
//       queryParams.append('sort', 'createdAt,desc');
      
//       const response = await api.get<MockTestConfigListResponse>(
//         `/api/v1/admin/mock-test-configs?${queryParams.toString()}`
//       );
      
//       console.log('Mock Test Configs API Response:', response);
      
//       // Handle different possible response structures
//       const data = response.data;
      
//       if (data && data.content && Array.isArray(data.content)) {
//         console.log('Setting configs from paginated response:', data.content);
//         setConfigs(data.content);
//         setTotalPages(data.page?.totalPages || 1);
//       } else if (Array.isArray(data)) {
//         // If API returns array directly
//         console.log('Setting configs from array response:', data);
//         setConfigs(data);
//         setTotalPages(1);
//       } else if (data && typeof data === 'object') {
//         // Check if data itself is the config object wrapped differently
//         console.log('Checking for alternative response structure:', data);
//         const anyData = data as any;
//         const possibleConfigs = anyData.data || anyData.configs || anyData.items;
//         if (Array.isArray(possibleConfigs)) {
//           setConfigs(possibleConfigs);
//           setTotalPages(anyData.totalPages || anyData.total_pages || 1);
//         } else {
//           console.warn('Unexpected API response structure:', data);
//           setConfigs([]);
//           setTotalPages(0);
//           setError('Unexpected response format from server');
//         }
//       } else {
//         console.warn('Unexpected API response structure:', data);
//         setConfigs([]);
//         setTotalPages(0);
//         setError('Invalid response format from server');
//       }
//     } catch (error: any) {
//       console.error('Failed to fetch configs:', error);
//       console.error('Error details:', error.response?.data);
//       setConfigs([]);
//       setTotalPages(0);
//       setError(error.response?.data?.message || error.message || 'Failed to load configurations');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleDelete = async () => {
//     if (!selectedConfig) return;
//     try {
//       await api.delete(`/api/v1/admin/mock-test-configs/${selectedConfig.id}`);
//       setShowDeleteDialog(false);
//       setSelectedConfig(null);
//       fetchConfigs();
//     } catch (error) {
//       console.error('Failed to delete config:', error);
//     }
//   };

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <div>
//           <h1 className="text-3xl font-bold">Mock Test Configurations</h1>
//           <p className="text-muted-foreground mt-2">
//             Configure mock test parameters per jurisdiction
//           </p>
//         </div>
//         <button
//           onClick={() => router.push('/backoffice/mock-tests/configs/new')}
//           className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
//         >
//           <Plus className="h-4 w-4" />
//           Create Configuration
//         </button>
//       </div>

//       {error && (
//         <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4">
//           <p className="text-sm text-destructive">{error}</p>
//           <button
//             onClick={fetchConfigs}
//             className="text-sm text-destructive underline mt-2"
//           >
//             Try again
//           </button>
//         </div>
//       )}

//       <div className="rounded-lg border bg-card">
//         {isLoading ? (
//           <div className="flex items-center justify-center py-12">
//             <Loader2 className="h-8 w-8 animate-spin text-primary" />
//           </div>
//         ) : error ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <p>Failed to load configurations</p>
//             <p className="text-sm mt-2">Check the console for details</p>
//           </div>
//         ) : configs.length === 0 ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <p>No configurations found</p>
//             <p className="text-sm mt-2">Create your first mock test configuration</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead className="border-b border-border">
//                 <tr>
//                   <th className="text-left p-4 font-semibold">Jurisdiction</th>
//                   <th className="text-left p-4 font-semibold">Questions</th>
//                   <th className="text-left p-4 font-semibold">Duration</th>
//                   <th className="text-left p-4 font-semibold">Pass Mark</th>
//                   <th className="text-left p-4 font-semibold">Status</th>
//                   <th className="text-left p-4 font-semibold">Created</th>
//                   <th className="text-right p-4 font-semibold">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {configs.map((config) => (
//                   <tr key={config.id} className="border-b border-border hover:bg-accent">
//                     <td className="p-4">
//                       <div className="font-medium">{config.jurisdictionName}</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="text-sm">{config.totalQuestions}</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="text-sm">{config.durationMinutes} min</div>
//                     </td>
//                     <td className="p-4">
//                       <div className="text-sm font-medium">
//                         {config.passMark}/{config.totalQuestions}
//                       </div>
//                       <div className="text-xs text-muted-foreground">
//                         {config.passPercentage}%
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       {config.active ? (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-950 text-green-600">
//                           <CheckCircle className="h-3 w-3" />
//                           Active
//                         </span>
//                       ) : (
//                         <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500">
//                           <XCircle className="h-3 w-3" />
//                           Inactive
//                         </span>
//                       )}
//                     </td>
//                     <td className="p-4">
//                       <div className="text-sm">
//                         {new Date(config.createdAt).toLocaleDateString()}
//                       </div>
//                     </td>
//                     <td className="p-4">
//                       <div className="flex items-center justify-end gap-2">
//                         <button
//                           onClick={() => router.push(`/backoffice/mock-tests/configs/${config.id}/edit`)}
//                           className="p-2 hover:bg-accent rounded-lg transition-colors"
//                           title="Edit"
//                         >
//                           <Edit className="h-4 w-4" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setSelectedConfig(config);
//                             setShowDeleteDialog(true);
//                           }}
//                           className="p-2 hover:bg-destructive/10 text-destructive rounded-lg transition-colors"
//                           title="Delete"
//                         >
//                           <Trash2 className="h-4 w-4" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {totalPages > 1 && (
//         <div className="flex items-center justify-center gap-2">
//           <button
//             onClick={() => setPage(page - 1)}
//             disabled={page === 0}
//             className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Previous
//           </button>
//           <span className="text-sm text-muted-foreground">
//             Page {page + 1} of {totalPages}
//           </span>
//           <button
//             onClick={() => setPage(page + 1)}
//             disabled={page >= totalPages - 1}
//             className="px-4 py-2 border border-border rounded-lg hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             Next
//           </button>
//         </div>
//       )}

//       <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
//         <DialogContent className="max-w-md">
//           <DialogHeader>
//             <DialogTitle>Delete Configuration</DialogTitle>
//           </DialogHeader>
//           <p className="text-muted-foreground">
//             Are you sure you want to delete the configuration for {selectedConfig?.jurisdictionName}?
//             This action cannot be undone.
//           </p>
//           <DialogFooter>
//             <button
//               onClick={() => {
//                 setShowDeleteDialog(false);
//                 setSelectedConfig(null);
//               }}
//               className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDelete}
//               className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity"
//             >
//               Delete
//             </button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// }



"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api/client'
import { useAuthStore } from '@/lib/store'
import { MockTestConfigAdminResponse, MockTestConfigListResponse } from '@/lib/types/mock-test'
import {
  Plus, Edit, Trash2, Loader2, CheckCircle2, XCircle,
  Settings, AlertCircle, ChevronLeft, ChevronRight,
} from 'lucide-react'

export default function MockTestConfigsPage() {
  const router    = useRouter()
  const { user }  = useAuthStore()

  const [configs, setConfigs]               = useState<MockTestConfigAdminResponse[]>([])
  const [page, setPage]                     = useState(0)
  const [totalPages, setTotalPages]         = useState(0)
  const [isLoading, setIsLoading]           = useState(false)
  const [error, setError]                   = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<MockTestConfigAdminResponse | null>(null)
  const [isDeleting, setIsDeleting]         = useState(false)

  useEffect(() => { fetchConfigs() }, [page])

  const fetchConfigs = async () => {
    if (!user?.activeJurisdictionId) { setError('No jurisdiction selected'); setIsLoading(false); return }
    setIsLoading(true); setError(null)
    try {
      const params = new URLSearchParams({
        jurisdictionId: user.activeJurisdictionId.toString(),
        page: page.toString(), size: '10', sort: 'createdAt,desc',
      })
      const response = await api.get<MockTestConfigListResponse>(
        `/api/v1/admin/mock-test-configs?${params.toString()}`
      )
      const data = response.data
      if (data?.content && Array.isArray(data.content)) {
        setConfigs(data.content); setTotalPages(data.page?.totalPages ?? 1)
      } else if (Array.isArray(data)) {
        setConfigs(data); setTotalPages(1)
      } else {
        const any = data as any
        const items = any?.data || any?.configs || any?.items
        if (Array.isArray(items)) {
          setConfigs(items); setTotalPages(any.totalPages ?? 1)
        } else {
          setConfigs([]); setTotalPages(0); setError('Unexpected response format from server')
        }
      }
    } catch (err: any) {
      setConfigs([]); setTotalPages(0)
      setError(err.response?.data?.message || err.message || 'Failed to load configurations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!selectedConfig) return
    setIsDeleting(true)
    try {
      await api.delete(`/api/v1/admin/mock-test-configs/${selectedConfig.id}`)
      setShowDeleteDialog(false); setSelectedConfig(null)
      fetchConfigs()
    } catch (err) {
      console.error('Failed to delete config:', err)
    } finally {
      setIsDeleting(false)
    }
  }

  const COL_HEADERS = ['Jurisdiction', 'Licence Category', 'Questions', 'Duration', 'Pass Mark', 'Status', 'Created', '']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .delay-1 { animation-delay: 0.07s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 animate-fade-up">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                              flex items-center justify-center shrink-0">
                <Settings size={14} className="text-emerald-300" />
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
                Mock Test Configurations
              </h1>
            </div>
            <p className="text-sm text-white/40 font-light ml-[2.625rem]">
              Configure mock test parameters per jurisdiction
            </p>
          </div>

          <button
            onClick={() => router.push('/backoffice/mock-tests/configs/new')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-[#12131a] bg-emerald-300 shrink-0
                       hover:opacity-85 hover:-translate-y-px transition-all duration-200
                       [box-shadow:0_0_20px_rgba(110,231,183,0.25)]"
          >
            <Plus size={15} />
            Create Config
          </button>
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl border
                          bg-red-400/[0.07] border-red-400/20 animate-fade-up">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-red-400/90 font-light">{error}</p>
              <button
                onClick={fetchConfigs}
                className="text-xs text-red-400/60 underline mt-1 hover:text-red-400 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Table card ── */}
        <div className="bg-[#181920] border border-white/[0.07] rounded-2xl overflow-hidden
                        shadow-[0_4px_24px_rgba(0,0,0,0.25)] animate-fade-up delay-1">

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-emerald-300/50" />
            </div>

          ) : configs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07]
                              flex items-center justify-center mb-4">
                <Settings size={20} className="text-white/20" />
              </div>
              <p className="text-sm font-medium text-white/40 mb-1">No configurations found</p>
              <p className="text-xs text-white/25 font-light">Create your first mock test configuration</p>
            </div>

          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                {/* Table head */}
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {COL_HEADERS.map((h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3.5 text-[10px] uppercase tracking-widest
                                   text-white/25 font-medium
                                   ${i === COL_HEADERS.length - 1 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                {/* Table body */}
                <tbody className="divide-y divide-white/[0.04]">
                  {configs.map((config) => (
                    <tr
                      key={config.id}
                      className="hover:bg-white/[0.03] transition-colors duration-150"
                    >
                      {/* Jurisdiction */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#f0f0f5]">
                          {config.jurisdictionName}
                        </p>
                      </td>

                      {/* Licence Category */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium text-[#f0f0f5]">
                          {config.licenceCategoryName}
                        </p>
                        <p className="text-[11px] text-white/30">{config.licenceCategoryCode}</p>
                      </td>

                      {/* Questions */}
                      <td className="px-5 py-4">
                        <p className="text-sm tabular-nums text-white/60">{config.totalQuestions}</p>
                      </td>

                      {/* Duration */}
                      <td className="px-5 py-4">
                        <p className="text-sm tabular-nums text-white/60">{config.durationMinutes} min</p>
                      </td>

                      {/* Pass mark */}
                      <td className="px-5 py-4">
                        <p className="text-sm font-medium tabular-nums text-[#f0f0f5]">
                          {config.passMark}/{config.totalQuestions}
                        </p>
                        <p className="text-[11px] text-white/30 tabular-nums">{config.passPercentage}%</p>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        {config.active ? (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                                           tracking-widest uppercase px-2.5 py-1 rounded-full border
                                           text-emerald-300 bg-emerald-300/10 border-emerald-300/20">
                            <CheckCircle2 size={10} /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                                           tracking-widest uppercase px-2.5 py-1 rounded-full border
                                           text-white/30 bg-white/[0.04] border-white/[0.09]">
                            <XCircle size={10} /> Inactive
                          </span>
                        )}
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">
                        <p className="text-sm text-white/40 tabular-nums">
                          {new Date(config.createdAt).toLocaleDateString()}
                        </p>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/backoffice/mock-tests/configs/${config.id}/edit`)}
                            title="Edit"
                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                       text-white/30 hover:text-white/70 hover:bg-white/[0.07]
                                       transition-all duration-150"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => { setSelectedConfig(config); setShowDeleteDialog(true) }}
                            title="Delete"
                            className="w-8 h-8 flex items-center justify-center rounded-lg
                                       text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]
                                       transition-all duration-150"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-white/50 border border-white/[0.07]
                         hover:text-white/80 hover:border-white/15
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <ChevronLeft size={14} />
              Previous
            </button>

            <span className="text-xs text-white/30 tabular-nums">
              {page + 1} / {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-white/50 border border-white/[0.07]
                         hover:text-white/80 hover:border-white/15
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              Next
              <ChevronRight size={14} />
            </button>
          </div>
        )}

        {/* ── Delete confirmation dialog ── */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                          bg-black/65 backdrop-blur-sm">
            <div className="bg-[#181920] border border-white/[0.09] rounded-2xl
                            w-full max-w-sm overflow-hidden
                            shadow-[0_24px_64px_rgba(0,0,0,0.55)]">

              {/* Dialog header */}
              <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-white/[0.07]">
                <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20
                                flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <h3 className="font-syne font-bold text-base tracking-tight text-red-400">
                  Delete Configuration
                </h3>
              </div>

              {/* Dialog body */}
              <div className="px-6 py-5">
                <p className="text-sm text-white/50 font-light leading-relaxed">
                  Are you sure you want to delete the configuration for{' '}
                  <span className="text-[#f0f0f5] font-medium">
                    {selectedConfig?.jurisdictionName}
                  </span>?
                  This action cannot be undone.
                </p>
              </div>

              {/* Dialog footer */}
              <div className="px-6 pb-6 pt-2 flex gap-2.5 border-t border-white/[0.07]">
                <button
                  onClick={() => { setShowDeleteDialog(false); setSelectedConfig(null) }}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-white/55 border border-white/[0.09] bg-white/[0.03]
                             hover:text-white/85 hover:border-white/20
                             disabled:opacity-40 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             flex items-center justify-center gap-2
                             text-[#12131a] bg-red-400
                             hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200
                             [box-shadow:0_0_20px_rgba(248,113,113,0.25)]"
                >
                  {isDeleting
                    ? <><Loader2 size={14} className="animate-spin" /> Deleting…</>
                    : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}