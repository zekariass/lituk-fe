// "use client"

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import api from '@/lib/api/client';
// import { CreateMockTestConfigRequest } from '@/lib/types/mock-test';
// import { ArrowLeft, Loader2 } from 'lucide-react';

// interface Jurisdiction {
//   id: number;
//   name: string;
//   code: string;
// }

// export default function CreateMockTestConfigPage() {
//   const router = useRouter();
//   const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [formData, setFormData] = useState<CreateMockTestConfigRequest>({
//     jurisdictionId: 0,
//     totalQuestions: 50,
//     durationMinutes: 60,
//     passPercentage: 86,
//     passMark: 43,
//     active: true
//   });

//   useEffect(() => {
//     fetchJurisdictions();
//   }, []);

//   useEffect(() => {
//     const calculatedPassMark = Math.ceil(
//       (formData.totalQuestions * formData.passPercentage) / 100
//     );
//     setFormData(prev => ({ ...prev, passMark: calculatedPassMark }));
//   }, [formData.totalQuestions, formData.passPercentage]);

//   const fetchJurisdictions = async () => {
//     try {
//       const response = await api.get('/api/v1/admin/jurisdictions');
//       setJurisdictions(response.data.data || []);
//     } catch (error) {
//       console.error('Failed to fetch jurisdictions:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     if (formData.jurisdictionId === 0) {
//       alert('Please select a jurisdiction');
//       return;
//     }

//     setIsLoading(true);
//     try {
//       await api.post('/api/v1/admin/mock-test-configs', formData);
//       router.push('/backoffice/mock-tests/configs');
//     } catch (error: any) {
//       console.error('Failed to create configuration:', error);
//       alert(error.response?.data?.message || 'Failed to create configuration');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       <div className="flex items-center gap-4">
//         <button
//           onClick={() => router.back()}
//           className="p-2 hover:bg-accent rounded-lg transition-colors"
//         >
//           <ArrowLeft className="h-5 w-5" />
//         </button>
//         <div>
//           <h1 className="text-3xl font-bold">Create Mock Test Configuration</h1>
//           <p className="text-muted-foreground mt-2">
//             Set up test parameters for a jurisdiction
//           </p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-6 bg-card rounded-lg border p-6">
//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Jurisdiction <span className="text-destructive">*</span>
//           </label>
//           <select
//             value={formData.jurisdictionId}
//             onChange={(e) => setFormData({ ...formData, jurisdictionId: Number(e.target.value) })}
//             className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//             required
//           >
//             <option value={0}>Select Jurisdiction</option>
//             {jurisdictions.map(j => (
//               <option key={j.id} value={j.id}>
//                 {j.name} ({j.code})
//               </option>
//             ))}
//           </select>
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Total Questions <span className="text-destructive">*</span>
//             </label>
//             <input
//               type="number"
//               min="1"
//               max="200"
//               value={formData.totalQuestions}
//               onChange={(e) => setFormData({ ...formData, totalQuestions: Number(e.target.value) })}
//               className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//               required
//             />
//             <p className="text-xs text-muted-foreground mt-1">Min: 1, Max: 200</p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-2">
//               Duration (minutes) <span className="text-destructive">*</span>
//             </label>
//             <input
//               type="number"
//               min="1"
//               max="300"
//               value={formData.durationMinutes}
//               onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
//               className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//               required
//             />
//             <p className="text-xs text-muted-foreground mt-1">Min: 1, Max: 300</p>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Pass Percentage (%) <span className="text-destructive">*</span>
//           </label>
//           <input
//             type="number"
//             min="1"
//             max="100"
//             value={formData.passPercentage}
//             onChange={(e) => setFormData({ ...formData, passPercentage: Number(e.target.value) })}
//             className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
//             required
//           />
//           <p className="text-xs text-muted-foreground mt-1">Min: 1%, Max: 100%</p>
//         </div>

//         <div>
//           <label className="block text-sm font-medium mb-2">
//             Pass Mark (auto-calculated)
//           </label>
//           <input
//             type="number"
//             value={formData.passMark}
//             readOnly
//             className="w-full px-4 py-2 border border-border rounded-lg bg-muted cursor-not-allowed"
//           />
//           <p className="text-sm text-muted-foreground mt-2">
//             Learners must answer <span className="font-semibold">{formData.passMark}</span> out of{' '}
//             <span className="font-semibold">{formData.totalQuestions}</span> questions correctly to pass
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <input
//             type="checkbox"
//             id="active"
//             checked={formData.active}
//             onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
//             className="w-4 h-4 rounded border-border"
//           />
//           <label htmlFor="active" className="text-sm font-medium cursor-pointer">
//             Active (enable this configuration for learners)
//           </label>
//         </div>

//         <div className="flex gap-4 pt-4 border-t">
//           <button
//             type="button"
//             onClick={() => router.back()}
//             className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
//           >
//             {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
//             {isLoading ? 'Creating...' : 'Create Configuration'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }



"use client"

import { useEffect, useState } from 'react'
// ── Shared field wrapper ──────────────────────────────────────────────────────
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: React.ReactNode
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs uppercase tracking-widest text-white/35 font-medium">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-white/25 font-light">{hint}</p>}
    </div>
  )
}

// ── Shared input style ────────────────────────────────────────────────────────
const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40 focus:bg-white/[0.06]
  transition-colors duration-200
  placeholder:text-white/20
`

import { useRouter } from 'next/navigation'
import api from '@/lib/api/client'
import { CreateMockTestConfigRequest } from '@/lib/types/mock-test'
import { ArrowLeft, Loader2, Settings, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Jurisdiction {
  id: number
  name: string
  code: string
}

interface LicenceCategory {
  id: number
  name: string
  code: string
}

export default function CreateMockTestConfigPage() {
  const router = useRouter()

  const [jurisdictions, setJurisdictions] = useState<Jurisdiction[]>([])
  const [licenceCategories, setLicenceCategories] = useState<LicenceCategory[]>([])
  const [isLoading, setIsLoading]         = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const [formData, setFormData] = useState<CreateMockTestConfigRequest>({
    jurisdictionId: 0,
    licenceCategoryId: 0,
    totalQuestions: 50,
    durationMinutes: 60,
    passPercentage: 86,
    passMark: 43,
    active: true,
  })

  useEffect(() => { 
    fetchJurisdictions()
  }, [])

  useEffect(() => {
    const calculated = Math.ceil((formData.totalQuestions * formData.passPercentage) / 100)
    setFormData((prev) => ({ ...prev, passMark: calculated }))
  }, [formData.totalQuestions, formData.passPercentage])

  useEffect(() => {
    if (formData.jurisdictionId > 0) {
      fetchLicenceCategoriesForJurisdiction(formData.jurisdictionId)
    } else {
      setLicenceCategories([])
    }
  }, [formData.jurisdictionId])

  const fetchJurisdictions = async () => {
    try {
      const response = await api.get('/api/v1/admin/jurisdictions')
      setJurisdictions(response.data.data ?? [])
    } catch (err) {
      console.error('Failed to fetch jurisdictions:', err)
    }
  }

  const fetchLicenceCategoriesForJurisdiction = async (jurisdictionId: number) => {
    try {
      const response = await api.get(`/api/v1/content/jurisdictions/${jurisdictionId}/licence-categories`)
      const data = response.data.data ?? response.data
      setLicenceCategories(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Failed to fetch licence categories:', err)
      setLicenceCategories([])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.jurisdictionId === 0) {
      setError('Please select a jurisdiction')
      return
    }
    if (formData.licenceCategoryId === 0) {
      setError('Please select a licence category')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await api.post('/api/v1/admin/mock-test-configs', formData)
      router.push('/backoffice/mock-tests/configs')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create configuration')
    } finally {
      setIsLoading(false)
    }
  }

  const patch = (fields: Partial<CreateMockTestConfigRequest>) =>
    setFormData((prev) => ({ ...prev, ...fields }))

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
        .animate-fade-up { animation: fadeUp 0.35s ease both; }
        .delay-1 { animation-delay: 0.07s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3 animate-fade-up">
          <button
            type="button"
            onClick={() => router.back()}
            className="w-9 h-9 flex items-center justify-center rounded-xl shrink-0
                       text-white/35 border border-white/[0.08] bg-white/[0.03]
                       hover:text-white/70 hover:border-white/15 transition-all duration-200"
          >
            <ArrowLeft size={15} />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                            flex items-center justify-center shrink-0">
              <Settings size={14} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-xl sm:text-2xl tracking-tight leading-tight">
                Create Configuration
              </h1>
              <p className="text-xs text-white/35 font-light">
                Set up test parameters for a jurisdiction
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3.5 rounded-xl border
                          bg-red-400/[0.07] border-red-400/20 animate-fade-up">
            <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-400/90 font-light">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-[#181920] border border-white/[0.07] rounded-2xl
                     shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden animate-fade-up delay-1"
        >
          <div className="px-6 py-5 border-b border-white/[0.06] space-y-5">
            <Field label="Jurisdiction" required>
              <select
                value={formData.jurisdictionId}
                onChange={(e) => patch({ jurisdictionId: Number(e.target.value), licenceCategoryId: 0 })}
                required
                className={`${inputClass} [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]`}
              >
                <option value={0} disabled>Select a jurisdiction…</option>
                {jurisdictions.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.name} ({j.code})
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Licence Category" required>
              <select
                value={formData.licenceCategoryId}
                onChange={(e) => patch({ licenceCategoryId: Number(e.target.value) })}
                required
                className={`${inputClass} [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]`}
              >
                <option value={0} disabled>Select a licence category…</option>
                {licenceCategories.map((lc) => (
                  <option key={lc.id} value={lc.id}>
                    {lc.name} ({lc.code})
                  </option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Total Questions" required hint="Min 1 — Max 200">
                <input
                  type="number"
                  min={1} max={200}
                  value={formData.totalQuestions}
                  onChange={(e) => patch({ totalQuestions: Number(e.target.value) })}
                  required
                  className={inputClass}
                />
              </Field>

              <Field label="Duration (min)" required hint="Min 1 — Max 300">
                <input
                  type="number"
                  min={1} max={300}
                  value={formData.durationMinutes}
                  onChange={(e) => patch({ durationMinutes: Number(e.target.value) })}
                  required
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Pass Percentage (%)" required hint="Min 1% — Max 100%">
              <input
                type="number"
                min={1} max={100}
                value={formData.passPercentage}
                onChange={(e) => patch({ passPercentage: Number(e.target.value) })}
                required
                className={inputClass}
              />
            </Field>

            <Field label="Pass Mark (auto-calculated)">
              <input
                type="number"
                value={formData.passMark}
                readOnly
                className={`${inputClass} opacity-50 cursor-not-allowed`}
              />
              <div className="flex items-center gap-2 mt-2 px-3 py-2.5 rounded-xl
                              bg-emerald-300/[0.06] border border-emerald-300/[0.12]">
                <CheckCircle2 size={13} className="text-emerald-300/70 shrink-0" />
                <p className="text-xs text-emerald-300/70 font-light">
                  Learners must answer{' '}
                  <span className="font-medium text-emerald-300">{formData.passMark}</span>
                  {' '}of{' '}
                  <span className="font-medium text-emerald-300">{formData.totalQuestions}</span>
                  {' '}questions correctly to pass
                </p>
              </div>
            </Field>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative shrink-0">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => patch({ active: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40
                                transition-all duration-200" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                peer-checked:translate-x-[18px] peer-checked:bg-[#12131a]
                                transition-all duration-200" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#f0f0f5]/80
                               group-hover:text-[#f0f0f5] transition-colors duration-200">
                  Active
                </p>
                <p className="text-[11px] text-white/25 font-light">
                  Enable this configuration for learners
                </p>
              </div>
            </label>
          </div>

          <div className="px-6 py-4 bg-white/[0.02] flex gap-2.5">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-white/55 border border-white/[0.09] bg-white/[0.03]
                         hover:text-white/85 hover:border-white/20
                         disabled:opacity-40 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                         flex items-center justify-center gap-2
                         text-[#12131a] bg-emerald-300
                         hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]"
            >
              {isLoading
                ? <><Loader2 size={14} className="animate-spin" />Creating…</>
                : 'Create Configuration'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}