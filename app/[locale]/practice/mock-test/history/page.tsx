// "use client"

// import { useEffect, useState } from 'react'
// import { useRouter } from 'next/navigation'
// import { useTranslations } from 'next-intl'
// import api from '@/lib/api/client'
// import { MockTestSummaryResponse } from '@/lib/types/mock-test'
// import {
//   Loader2, CheckCircle2, XCircle, Clock, TrendingUp,
//   ChevronLeft, ChevronRight, Plus, History, ArrowRight,
// } from 'lucide-react'

// export default function MockTestHistoryPage() {
//   const router = useRouter()
//   const t = useTranslations('mockTestHistoryPage')
//   const [tests, setTests]           = useState<MockTestSummaryResponse[]>([])
//   const [page, setPage]             = useState(0)
//   const [totalPages, setTotalPages] = useState(0)
//   const [isLoading, setIsLoading]   = useState(false)

//   useEffect(() => { fetchHistory() }, [page])

//   const fetchHistory = async () => {
//     setIsLoading(true)
//     try {
//       const response = await api.get(
//         `/api/v1/mock-tests?status=completed&page=${page}&size=10&sort=completedAt,desc`
//       )
//       const data = response.data.data || response.data
//       if (data?.content && Array.isArray(data.content)) {
//         setTests(data.content)
//         setTotalPages(data.page?.totalPages || data.totalPages || 1)
//       } else if (Array.isArray(data)) {
//         setTests(data)
//         setTotalPages(1)
//       } else {
//         setTests([])
//         setTotalPages(0)
//       }
//     } catch {
//       setTests([])
//       setTotalPages(0)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const formatDate = (dateString: string) =>
//     new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

//   const formatTime = (seconds: number) =>
//     `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`

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
//         .animate-fade-up { animation: fadeUp 0.4s ease both; }
//         .delay-1 { animation-delay: 0.06s; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//       `}</style>

//       <div className="font-dm max-w-5xl mx-auto px-2 py-10 space-y-6 text-foreground">

//         {/* ── Header ── */}
//         <div className="flex items-start justify-between gap-4 animate-fade-up">
//           <div>
//             <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
//               {t('title')}
//             </h1>
//             <p className="text-sm text-muted-foreground font-light mt-1">
//               {t('subtitle')}
//             </p>
//           </div>
//           <button
//             onClick={() => router.push('/practice/mock-test/start')}
//             className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
//                        text-primary-foreground bg-primary shrink-0
//                        hover:opacity-85 hover:-translate-y-px transition-all duration-200
//                        [box-shadow:0_0_20px_hsl(var(--primary)/0.25)]"
//           >
//             <Plus size={14} />
//             {t('newTest')}
//           </button>
//         </div>

//         {/* ── Loading ── */}
//         {isLoading && (
//           <div className="flex items-center justify-center py-20">
//             <Loader2 size={24} className="animate-spin text-primary/50" />
//           </div>
//         )}

//         {/* ── Empty state ── */}
//         {!isLoading && tests.length === 0 && (
//           <div className="flex flex-col items-center justify-center py-20 text-center
//                           border border-border rounded-2xl bg-card">
//             <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center
//                             justify-center mb-5">
//               <History size={22} className="text-foreground/20" />
//             </div>
//             <p className="text-sm text-muted-foreground font-light mb-5">{t('noHistoryYet')}</p>
//             <button
//               onClick={() => router.push('/practice/mock-test/start')}
//               className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
//                          text-primary-foreground bg-primary
//                          hover:opacity-85 transition-all duration-200
//                          [box-shadow:0_0_20px_hsl(var(--primary)/0.25)]"
//             >
//               <Plus size={14} />
//               {t('takeFirstTest')}
//             </button>
//           </div>
//         )}

//         {/* ── Test list ── */}
//         {!isLoading && tests.length > 0 && (
//           <div className="space-y-3 animate-fade-up delay-1">
//             {tests.map((test, idx) => {
//               const accuracyRate = test.totalQuestions > 0
//                 ? (test.score / test.totalQuestions) * 100 : 0
//               const timeTakenSeconds = test.startedAt && test.finishedAt
//                 ? Math.floor((new Date(test.finishedAt).getTime() - new Date(test.startedAt).getTime()) / 1000)
//                 : null

//               const passed = test.passed

//               const miniStats = [
//                 {
//                   icon: CheckCircle2,
//                   label: t('score'),
//                   value: `${test.score ?? 0}/${test.totalQuestions ?? 0}`,
//                   color: 'text-sky-300',
//                 },
//                 {
//                   icon: TrendingUp,
//                   label: t('accuracy'),
//                   value: `${isNaN(accuracyRate) ? '0.0' : accuracyRate.toFixed(1)}%`,
//                   color: 'text-violet-300',
//                 },
//                 {
//                   icon: Clock,
//                   label: t('time'),
//                   value: timeTakenSeconds != null ? formatTime(timeTakenSeconds) : '—',
//                   color: 'text-amber-300',
//                 },
//               ]

//               return (
//                 <div
//                   key={test.id}
//                   className="bg-card border border-border rounded-2xl p-2 sm:p-2
//                              hover:border-border/80 transition-all duration-200
//                              shadow-[0_2px_16px_rgba(0,0,0,0.08)]"
//                   style={{ animationDelay: `${0.06 + idx * 0.04}s` }}
//                 >
//                   <div className="space-y-3">

//                     {/* Top row: badge + meta */}
//                     <div className="flex flex-wrap items-center gap-2">
//                       <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium
//                                         tracking-widest uppercase px-2.5 py-1 rounded-full border
//                                         ${passed
//                                           ? 'text-primary bg-primary/10 border-primary/20'
//                                           : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
//                         {passed
//                           ? <><CheckCircle2 size={10} /> {t('passed')}</>
//                           : <><XCircle      size={10} /> {t('failed')}</>}
//                       </span>
//                       {test.licenceCategory?.name && (
//                         <span className="text-xs text-muted-foreground font-light">
//                           {test.licenceCategory.code} · {test.licenceCategory.name}
//                         </span>
//                       )}
//                       {test.jurisdiction?.name && (
//                         <span className="text-xs text-foreground/25 font-light">
//                           {test.jurisdiction.name}
//                         </span>
//                       )}
//                     </div>

//                     {/* Scrollable mini stats */}
//                     <div className="flex gap-2 overflow-x-auto no-scrollbar">
//                       {miniStats.map(({ icon: Icon, label, value, color }) => (
//                         <div key={label}
//                              className="flex items-center gap-2 px-3 py-2.5 rounded-xl shrink-0
//                                         bg-muted/20 border border-border">
//                           {/* <Icon size={13} className={`${color} shrink-0`} /> */}
//                           <div>
//                             <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium leading-tight whitespace-nowrap">
//                               {label}
//                             </p>
//                             <p className={`font-syne font-bold text-sm ${color} leading-tight`}>
//                               {value}
//                             </p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>

//                     {/* Date + Details button */}
//                     <div className="flex items-center justify-between gap-3 pt-1">
//                       <div>
//                         <p className="text-xs text-muted-foreground whitespace-nowrap">{formatDate(test.finishedAt)}</p>
//                         <p className="text-[11px] text-foreground/20">
//                           {new Date(test.finishedAt).toLocaleTimeString()}
//                         </p>
//                       </div>
//                       <button
//                         onClick={() => router.push(`/practice/mock-test/results?testId=${test.id}`)}
//                         className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
//                                    text-foreground/50 border border-border bg-muted/20 shrink-0
//                                    hover:text-foreground/80 hover:border-foreground/15 hover:bg-muted/40
//                                    transition-all duration-200"
//                       >
//                         {t('details')}
//                         <ArrowRight size={12} />
//                       </button>
//                     </div>

//                   </div>
//                 </div>
//               )
//             })}
//           </div>
//         )}

//         {/* ── Pagination ── */}
//         {totalPages > 1 && (
//           <div className="flex items-center justify-center gap-3 pt-2">
//             <button
//               onClick={() => setPage(page - 1)}
//               disabled={page === 0}
//               className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
//                          text-foreground/50 border border-border bg-muted/20
//                          hover:text-foreground/80 hover:border-foreground/15
//                          disabled:opacity-30 disabled:cursor-not-allowed
//                          transition-all duration-200"
//             >
//               <ChevronLeft size={15} />
//               {t('prev')}
//             </button>

//             <span className="text-xs text-muted-foreground font-light tabular-nums">
//               {page + 1} / {totalPages}
//             </span>

//             <button
//               onClick={() => setPage(page + 1)}
//               disabled={page >= totalPages - 1}
//               className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
//                          text-foreground/50 border border-border bg-muted/20
//                          hover:text-foreground/80 hover:border-foreground/15
//                          disabled:opacity-30 disabled:cursor-not-allowed
//                          transition-all duration-200"
//             >
//               {t('next')}
//               <ChevronRight size={15} />
//             </button>
//           </div>
//         )}

//       </div>
//     </>
//   )
// }


"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import api from '@/lib/api/client'
import { MockTestSummaryResponse } from '@/lib/types/mock-test'
import {
  Loader2, CheckCircle2, XCircle, Clock, TrendingUp,
  ChevronLeft, ChevronRight, Plus, History, ArrowRight,
} from 'lucide-react'

export default function MockTestHistoryPage() {
  const router = useRouter()
  const t = useTranslations('mockTestHistoryPage')
  const [tests, setTests]           = useState<MockTestSummaryResponse[]>([])
  const [page, setPage]             = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading]   = useState(false)

  useEffect(() => { fetchHistory() }, [page])

  const fetchHistory = async () => {
    setIsLoading(true)
    try {
      const response = await api.get(
        `/api/v1/mock-tests?status=completed&page=${page}&size=10&sort=completedAt,desc`
      )
      const data = response.data.data || response.data
      if (data?.content && Array.isArray(data.content)) {
        setTests(data.content)
        setTotalPages(data.page?.totalPages || data.totalPages || 1)
      } else if (Array.isArray(data)) {
        setTests(data)
        setTotalPages(1)
      } else {
        setTests([])
        setTotalPages(0)
      }
    } catch {
      setTests([])
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  const formatTime = (seconds: number) =>
    `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`

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
        .delay-1 { animation-delay: 0.06s; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="font-dm max-w-5xl mx-auto px-2 py-10 space-y-6 text-foreground">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 animate-fade-up">
          <div>
            <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
              {t('title')}
            </h1>
            <p className="text-sm text-muted-foreground font-light mt-1">
              {t('subtitle')}
            </p>
          </div>
          <button
            onClick={() => router.push('/practice/mock-test/start')}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                       text-primary-foreground bg-primary shrink-0
                       hover:opacity-85 hover:-translate-y-px transition-all duration-200
                       [box-shadow:0_0_20px_hsl(var(--primary)/0.25)]"
          >
            <Plus size={14} />
            {t('newTest')}
          </button>
        </div>

        {/* ── Loading ── */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        )}

        {/* ── Empty state ── */}
        {!isLoading && tests.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center
                          border border-border rounded-2xl bg-card">
            <div className="w-14 h-14 rounded-2xl bg-muted/30 flex items-center justify-center mb-5">
              <History size={22} className="text-foreground/20" />
            </div>
            <p className="text-sm text-muted-foreground font-light mb-5">{t('noHistoryYet')}</p>
            <button
              onClick={() => router.push('/practice/mock-test/start')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
                         text-primary-foreground bg-primary
                         hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_hsl(var(--primary)/0.25)]"
            >
              <Plus size={14} />
              {t('takeFirstTest')}
            </button>
          </div>
        )}

        {/* ── Test list ── */}
        {!isLoading && tests.length > 0 && (
          <div className="space-y-3 animate-fade-up delay-1">
            {tests.map((test, idx) => {
              const accuracyRate = test.totalQuestions > 0
                ? (test.score / test.totalQuestions) * 100 : 0
              const timeTakenSeconds = test.startedAt && test.finishedAt
                ? Math.floor((new Date(test.finishedAt).getTime() - new Date(test.startedAt).getTime()) / 1000)
                : null

              const passed = test.passed

              // ── Per-card theme tokens ────────────────────────────────────
              const card = passed ? {
                // Green theme
                wrapper:    'bg-green-500/[0.04] border-green-500/30 shadow-[0_2px_20px_rgba(34,197,94,0.08)] hover:border-green-500/50 hover:shadow-[0_4px_28px_rgba(34,197,94,0.14)]',
                badge:      'text-green-600 dark:text-emerald-400 bg-green-500/10 border-green-500/25',
                badgeIcon:  <CheckCircle2 size={10} />,
                badgeLabel: t('passed'),
                divider:    'bg-green-500/15',
                statChip:   'bg-green-500/[0.06] border-green-500/20',
                statValue:  'text-green-600 dark:text-emerald-400',
                detailBtn:  'text-green-700 dark:text-emerald-400 border-green-500/30 bg-green-500/[0.06] hover:bg-green-500/[0.12] hover:border-green-500/50',
                accent:     'bg-green-500',
              } : {
                // Red theme
                wrapper:    'bg-red-400/[0.04] border-red-400/30 shadow-[0_2px_20px_rgba(248,113,113,0.08)] hover:border-red-400/50 hover:shadow-[0_4px_28px_rgba(248,113,113,0.14)]',
                badge:      'text-red-500 dark:text-red-400 bg-red-400/10 border-red-400/25',
                badgeIcon:  <XCircle size={10} />,
                badgeLabel: t('failed'),
                divider:    'bg-red-400/15',
                statChip:   'bg-red-400/[0.06] border-red-400/20',
                statValue:  'text-red-500 dark:text-red-400',
                detailBtn:  'text-red-600 dark:text-red-400 border-red-400/30 bg-red-400/[0.06] hover:bg-red-400/[0.12] hover:border-red-400/50',
                accent:     'bg-red-400',
              }

              const miniStats = [
                {
                  icon: CheckCircle2,
                  label: t('score'),
                  value: `${test.score ?? 0}/${test.totalQuestions ?? 0}`,
                },
                {
                  icon: TrendingUp,
                  label: t('accuracy'),
                  value: `${isNaN(accuracyRate) ? '0.0' : accuracyRate.toFixed(1)}%`,
                },
                {
                  icon: Clock,
                  label: t('time'),
                  value: timeTakenSeconds != null ? formatTime(timeTakenSeconds) : '—',
                },
              ]

              return (
                <div
                  key={test.id}
                  className={`border rounded-2xl overflow-hidden transition-all duration-200 ${card.wrapper}`}
                  style={{ animationDelay: `${0.06 + idx * 0.04}s` }}
                >
                  {/* Coloured top accent bar */}
                  <div className={`h-0.5 w-full ${card.accent}`} />

                  <div className="p-3 space-y-3">

                    {/* Top row: pass/fail badge + category meta */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold
                                        tracking-widest uppercase px-2.5 py-1 rounded-full border
                                        ${card.badge}`}>
                        {card.badgeIcon}
                        {card.badgeLabel}
                      </span>
                      {test.licenceCategory?.name && (
                        <span className="text-xs text-muted-foreground font-light">
                          {test.licenceCategory.code} · {test.licenceCategory.name}
                        </span>
                      )}
                      {test.jurisdiction?.name && (
                        <span className="text-xs text-foreground/25 font-light">
                          {test.jurisdiction.name}
                        </span>
                      )}
                    </div>

                    {/* Thin divider */}
                    <div className={`h-px w-full ${card.divider}`} />

                    {/* Mini stats row */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {miniStats.map(({ label, value }) => (
                        <div
                          key={label}
                          className={`flex flex-col px-3 py-2 rounded-xl shrink-0 border ${card.statChip}`}
                        >
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium leading-tight whitespace-nowrap">
                            {label}
                          </p>
                          <p className={`font-syne font-bold text-sm leading-tight ${card.statValue}`}>
                            {value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Date + Details button */}
                    <div className="flex items-center justify-between gap-3 pt-0.5">
                      <div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(test.finishedAt)}
                        </p>
                        <p className="text-[11px] text-foreground/20">
                          {new Date(test.finishedAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <button
                        onClick={() => router.push(`/practice/mock-test/results?testId=${test.id}`)}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium
                                   border shrink-0 transition-all duration-200 ${card.detailBtn}`}
                      >
                        {t('details')}
                        <ArrowRight size={12} />
                      </button>
                    </div>

                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-foreground/50 border border-border bg-muted/20
                         hover:text-foreground/80 hover:border-foreground/15
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              <ChevronLeft size={15} />
              {t('prev')}
            </button>

            <span className="text-xs text-muted-foreground font-light tabular-nums">
              {page + 1} / {totalPages}
            </span>

            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-foreground/50 border border-border bg-muted/20
                         hover:text-foreground/80 hover:border-foreground/15
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-200"
            >
              {t('next')}
              <ChevronRight size={15} />
            </button>
          </div>
        )}

      </div>
    </>
  )
}