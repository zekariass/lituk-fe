// "use client"

// import { useEffect, useRef, useState } from 'react'
// import { createPortal } from 'react-dom'
// import Image from 'next/image'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { useMockTestStore } from '@/lib/store/mock-test-store'
// import { useAuthStore } from '@/lib/store/auth-store'
// import { useContentLanguageStore } from '@/lib/store'
// import api from '@/lib/api/client'
// import { checkEntitlementStatus } from '@/lib/services/payment-service'
// import { SubmitMockTestAnswersRequest } from '@/lib/types/mock-test'
// import { UserLanguageInfo } from '@/lib/types'
// import { Loader2, Clock, AlertCircle, X, ChevronLeft, ChevronRight, Send } from 'lucide-react'
// import { getAssetUrl } from '@/lib/utils/asset-url'


// export default function MockTestPage() {
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const jurisdictionId    = Number(searchParams.get('jurisdictionId'))
//   const licenceCategoryId = Number(searchParams.get('licenceCategoryId'))

//   const user = useAuthStore(state => state.user)
//   const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
//   const { direction, setLanguage } = useContentLanguageStore()

//   const {
//     testState,
//     initializeTest,
//     updateAnswer,
//     setCurrentQuestion,
//     updateTimeRemaining,
//     clearTest,
//     getAnsweredCount,
//     getProgress,
//     isQuestionAnswered,
//   } = useMockTestStore()

//   const [loading, setLoading]                     = useState(true)
//   const [submitting, setSubmitting]               = useState(false)
//   const [showSubmitDialog, setShowSubmitDialog]   = useState(false)
//   const [showTimeUpDialog, setShowTimeUpDialog]   = useState(false)
//   const [error, setError]                         = useState<string | null>(null)
//   const [selectedLanguage, setSelectedLanguage]   = useState<string>('')
//   const [modalImage, setModalImage] = useState<string | null>(null)

//   const dotsContainerRef = useRef<HTMLDivElement>(null)

//   useEffect(() => { loadTest() }, [])

//   const hasSubmittedRef = useRef(false)

//   useEffect(() => {
//     if (!testState?.endTime) return

//     const interval = setInterval(() => {
//       const now = Date.now()
//       const remaining = Math.max(0, Math.floor((testState.endTime - now) / 1000))
//       updateTimeRemaining(remaining)

//       if (now >= testState.endTime && !hasSubmittedRef.current) {
//         hasSubmittedRef.current = true
//         clearInterval(interval)
//         handleAutoSubmit()
//       }
//     }, 1000)

//     return () => clearInterval(interval)
//   }, [testState?.endTime])

//   useEffect(() => {
//     if (!testState) return
//     const container = dotsContainerRef.current
//     if (!container) return
//     const activeBtn = container.children[testState.currentQuestionIndex] as HTMLElement | undefined
//     if (activeBtn) {
//       activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
//     }
//   }, [testState?.currentQuestionIndex])

//   const loadTest = async () => {
//     try {
//       if (!jurisdictionId || !licenceCategoryId || isNaN(jurisdictionId) || isNaN(licenceCategoryId)) {
//         setError('Invalid test parameters. Please start from the mock test page.')
//         setLoading(false)
//         setTimeout(() => router.push('/practice/mock-test/start'), 3000)
//         return
//       }
//       if (testState && testState.endTime > Date.now()) { setLoading(false); return }
//       if (testState && testState.endTime <= Date.now()) clearTest()

//       const response = await api.post('/api/v1/mock-tests/questions', { jurisdictionId, licenceCategoryId })
//       const responseData = response.data.data || response.data

//       // Pre-access check:
//       // 1. Active subscription → allow
//       // 2. No subscription but free tests remaining → allow
//       // 3. Otherwise → redirect to pricing
//       let hasActiveSubscription = user?.subscription?.isActive === true
//       try {
//         const entitlement = await checkEntitlementStatus(jurisdictionId)
//         hasActiveSubscription = hasActiveSubscription || entitlement.hasAccess
//       } catch {
//         // Entitlement check failed — fall through to subscription/free-usage check
//       }

//       if (!hasActiveSubscription) {
//         const { freeMockTests, mockTestsTaken } = responseData.config
//         if (freeMockTests == null || mockTestsTaken >= freeMockTests) {
//           router.replace('/practice/pricing?reason=free_usage_exceeded')
//           return
//         }
//       }

//       initializeTest(responseData, jurisdictionId, licenceCategoryId)
//       setLoading(false)
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to load test')
//       setLoading(false)
//       setTimeout(() => router.push('/practice/mock-test/start'), 3000)
//     }
//   }

//   const submitTest = async (isAutoSubmit = false) => {
//     if (!testState || submitting) return
//     setSubmitting(true)
//     try {
//       const durationSeconds = Math.floor((Date.now() - testState.startTime) / 1000)
//       const answersArray = Object.values(testState.answers).map(a => ({
//         questionId: a.questionId,
//         selectedOptionIds: Array.from(new Set(a.selectedOptionIds)).sort((x, y) => x - y),
//         timeTakenSeconds: a.timeTakenSeconds,
//       }))

//       if (answersArray.length === 0 && isAutoSubmit) {
//         clearTest()
//         router.push('/practice/mock-test/history')
//         return
//       }

//       const payload: SubmitMockTestAnswersRequest = {
//         jurisdictionId: testState.jurisdictionId,
//         licenceCategoryId: testState.licenceCategoryId,
//         durationSeconds,
//         answers: answersArray,
//       }
//       const response = await api.post('/api/v1/mock-tests/submit', payload)
//       const result   = response.data
//       sessionStorage.setItem('mockTestResults', JSON.stringify(result))
//       clearTest()

//       if (isAutoSubmit) {
//         router.push('/practice/mock-test/history')
//       } else {
//         router.push(`/practice/mock-test/results?testId=${result.data.mockTestId}`)
//       }
//     } catch (err: any) {
//       setError(err.response?.data?.message || 'Failed to submit test')
//       setSubmitting(false)
//       setShowSubmitDialog(false)
//       setShowTimeUpDialog(false)
//     }
//   }

//   const getQuestionText = (question: any) => {
//     if (!question) return ''
//     const originalText = question.questionText || ''
//     if (!selectedLanguage || selectedLanguage === '' || !question.translations) {
//       return originalText
//     }
//     const translation = question.translations[selectedLanguage]
//     if (translation && typeof translation === 'object') {
//       const translatedText = (translation as any).text || (translation as any).question
//       if (translatedText) return translatedText
//     }
//     return originalText
//   }

//   const getOptionText = (option: any) => {
//     if (!option) return ''
//     const originalText = option.text || ''
//     if (!selectedLanguage || selectedLanguage === '' || !option.translations) {
//       return originalText
//     }
//     const translation = option.translations[selectedLanguage]
//     if (translation && typeof translation === 'object' && 'text' in translation) {
//       return (translation as any).text || originalText
//     }
//     return originalText
//   }

//   const handleAutoSubmit = async () => {
//     setShowTimeUpDialog(true)
//     setTimeout(() => submitTest(true), 2000)
//   }

//   const formatTime = (seconds: number) => {
//     const m = Math.floor(seconds / 60).toString().padStart(2, '0')
//     const s = (seconds % 60).toString().padStart(2, '0')
//     return `${m}:${s}`
//   }

//   // ── Loading ────────────────────────────────────────────────────────────────
//   if (loading || !testState) {
//     return (
//       <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
//         <style>{`
//           @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
//           .font-syne { font-family: 'Syne', sans-serif; }
//           .font-dm   { font-family: 'DM Sans', sans-serif; }
//         `}</style>
//         <div className="relative">
//           <div className="w-12 h-12 rounded-2xl border border-border bg-card flex items-center justify-center">
//             <Loader2 size={20} className="animate-spin text-muted-foreground" />
//           </div>
//         </div>
//         <p className="text-sm text-muted-foreground font-dm font-light tracking-wide">Loading your test…</p>
//       </div>
//     )
//   }

//   const currentQuestion = testState.questions[testState.currentQuestionIndex]
//   const answeredCount   = getAnsweredCount()
//   const progress        = getProgress()
//   const isLastQuestion  = testState.currentQuestionIndex === testState.questions.length - 1
//   const isLowTime       = testState.timeRemaining < 300
//   const unansweredCount = testState.questions.length - answeredCount

//   // Chevron helpers — flip for RTL
//   const PrevIcon = direction === 'rtl' ? ChevronRight : ChevronLeft
//   const NextIcon = direction === 'rtl' ? ChevronLeft  : ChevronRight

//   return (
//     <>
//       {modalImage && createPortal(
//         <div
//           style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)', overflow: 'hidden' }}
//           onClick={() => setModalImage(null)}
//         >
//           <button
//             onClick={() => setModalImage(null)}
//             style={{ position: 'absolute', top: 12, right: 12, zIndex: 10000, padding: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
//           >
//             <X size={22} />
//           </button>
//           <img
//             src={modalImage!}
//             alt="Full size"
//             onClick={(e) => e.stopPropagation()}
//             style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: 8 }}
//           />
//         </div>,
//         document.body
//       )}
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
//         .font-syne { font-family: 'Syne', sans-serif; }
//         .font-dm   { font-family: 'DM Sans', sans-serif; }

//         @keyframes fadeUp {
//           from { opacity: 0; transform: translateY(12px); }
//           to   { opacity: 1; transform: translateY(0); }
//         }
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to   { opacity: 1; }
//         }
//         @keyframes scaleIn {
//           from { opacity: 0; transform: scale(0.96) translateY(8px); }
//           to   { opacity: 1; transform: scale(1) translateY(0); }
//         }
//         @keyframes pulse-ring {
//           0%   { box-shadow: 0 0 0 0 hsl(var(--destructive) / 0.35); }
//           70%  { box-shadow: 0 0 0 6px hsl(var(--destructive) / 0); }
//           100% { box-shadow: 0 0 0 0 hsl(var(--destructive) / 0); }
//         }

//         .animate-fade-up      { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
//         .animate-fade-in      { animation: fadeIn 0.3s ease both; }
//         .animate-scale-in     { animation: scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
//         .animate-pulse-ring   { animation: pulse-ring 1.5s ease-out infinite; }

//         .option-btn { transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease; }
//         .option-btn:hover:not(:disabled) { transform: translateY(-1px); }
//         .option-btn:active:not(:disabled) { transform: translateY(0); }

//         .scrollbar-none { scrollbar-width: none; }
//         .scrollbar-none::-webkit-scrollbar { display: none; }

//         .dot-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.12s ease; }
//         .dot-btn:hover { transform: scale(1.1); }
//         .dot-btn:active { transform: scale(0.95); }

//         .submit-glow { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); transition: box-shadow 0.2s ease, opacity 0.2s ease, transform 0.15s ease; }
//         .submit-glow:hover:not(:disabled) { box-shadow: 0 4px 24px hsl(var(--primary) / 0.3); transform: translateY(-1px); }
//         .submit-glow:active:not(:disabled) { transform: translateY(0); }

//         .lang-btn { transition: all 0.15s ease; }
//         .lang-btn:hover { transform: translateY(-1px); }
//       `}</style>

//       {/* ── Root: dir applied here cascades to all children ── */}
//       <div className="font-dm min-h-screen bg-background text-foreground" dir={direction}>

//         {/* ── Floating error toast ─────────────────────────────────────────── */}
//         {error && (
//           <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-up">
//             <div className="flex items-start gap-3 p-4 rounded-2xl
//                             bg-destructive/8 border border-destructive/20
//                             shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
//               <div className="w-7 h-7 rounded-lg bg-destructive/12 flex items-center justify-center shrink-0">
//                 <AlertCircle size={13} className="text-destructive" />
//               </div>
//               <div className="flex-1 min-w-0 pt-0.5">
//                 <p className="text-xs font-semibold text-destructive tracking-wide uppercase">Error</p>
//                 <p className="text-xs text-destructive/70 font-light mt-0.5 leading-relaxed">{error}</p>
//               </div>
//               <button
//                 onClick={() => setError(null)}
//                 className="text-destructive/30 hover:text-destructive/60 transition-colors shrink-0 mt-0.5 p-1 rounded-lg hover:bg-destructive/8"
//               >
//                 <X size={12} />
//               </button>
//             </div>
//           </div>
//         )}

//         {/* ── Time's up overlay ────────────────────────────────────────────── */}
//         {showTimeUpDialog && (
//           <div className="fixed inset-0 bg-foreground/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
//             <div className="bg-background border border-border rounded-3xl max-w-xs w-full p-8
//                             text-center space-y-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)] animate-scale-in">
//               <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--tip))] border border-[hsl(var(--tip-border))]
//                               flex items-center justify-center mx-auto">
//                 <Clock size={26} className="text-[hsl(var(--tip-foreground))]" />
//               </div>
//               <div className="space-y-2">
//                 <h2 className="font-syne font-bold text-xl tracking-tight text-foreground">Time's Up!</h2>
//                 <p className="text-sm text-muted-foreground font-light leading-relaxed">
//                   Your test time has expired. Submitting your answers now…
//                 </p>
//               </div>
//               <div className="flex items-center justify-center gap-2 text-muted-foreground">
//                 <Loader2 size={16} className="animate-spin" />
//                 <span className="text-xs font-light">Please wait</span>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Submit confirmation dialog ───────────────────────────────────── */}
//         {showSubmitDialog && (
//           <div className="fixed inset-0 bg-foreground/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
//             <div className="border border-border rounded-3xl max-w-sm w-full p-7
//                             space-y-6 shadow-[0_32px_80px_rgba(0,0,0,0.22)] animate-scale-in"
//                  style={{ backgroundColor: 'var(--card)' }}>

//               <div className="space-y-1.5">
//                 <h2 className="font-syne font-bold text-xl tracking-tight text-card-foreground">Ready to submit?</h2>
//                 <p className="text-sm text-muted-foreground font-light leading-relaxed">
//                   You've answered{' '}
//                   <span className="text-foreground font-medium">{answeredCount}</span>{' '}
//                   of{' '}
//                   <span className="text-foreground font-medium">{testState.questions.length}</span>{' '}
//                   questions.
//                 </p>
//               </div>

//               {/* Progress visual */}
//               <div className="space-y-2">
//                 <div className="h-1.5 bg-border rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-[hsl(var(--success))] rounded-full transition-all duration-700"
//                     style={{ width: `${(answeredCount / testState.questions.length) * 100}%` }}
//                   />
//                 </div>
//                 <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
//                   <span>{answeredCount} answered</span>
//                   <span>{unansweredCount} remaining</span>
//                 </div>
//               </div>

//               {unansweredCount > 0 && (
//                 <div className="flex items-start gap-2.5 p-3.5 rounded-xl
//                                 bg-[hsl(var(--tip))] border border-[hsl(var(--tip-border))]">
//                   <AlertCircle size={13} className="text-[hsl(var(--tip-foreground))] shrink-0 mt-0.5" />
//                   <p className="text-xs text-[hsl(var(--tip-foreground))] font-light leading-relaxed">
//                     {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} will be left unanswered.
//                   </p>
//                 </div>
//               )}

//               <div className="flex gap-2.5 pt-1">
//                 <button
//                   onClick={() => setShowSubmitDialog(false)}
//                   disabled={submitting}
//                   className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
//                              text-muted-foreground border border-border bg-background
//                              hover:text-foreground hover:border-border/60 hover:bg-accent/40
//                              disabled:opacity-40 transition-all duration-200"
//                 >
//                   Continue
//                 </button>
//                 <button
//                   onClick={() => submitTest(false)}
//                   disabled={submitting}
//                   className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
//                              text-primary-foreground bg-[hsl(var(--primary))]
//                              hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
//                              transition-all duration-200 submit-glow"
//                 >
//                   {submitting
//                     ? <><Loader2 size={14} className="animate-spin" /><span>Submitting…</span></>
//                     : <><Send size={13} /><span>Submit Test</span></>}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Sticky header ───────────────────────────────────────────────── */}
//         <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-xl border-b border-border/60">
//           {/*
//             No dir needed here — it inherits from the root div.
//             justify-between already handles start/end correctly in RTL.
//           */}
//           <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between gap-4">

//             {/* Start — title + counter */}
//             <div className="flex items-center gap-3.5">
//               <div>
//                 <h1 className="font-syne font-bold text-base tracking-tight text-foreground leading-none">
//                   Mock Test
//                 </h1>
//                 <p className="text-[11px] text-muted-foreground font-light mt-1 tabular-nums">
//                   Current Question <span className="text-foreground font-medium">{testState.currentQuestionIndex + 1}</span>
//                   {/* <span className="text-muted-foreground/50 mx-0.5">/</span> */}
//                   {/* {testState.questions.length} */}
//                 </p>
//               </div>
//             </div>

//             {/* End — answered pill + timer + submit */}
//             <div className="flex items-center gap-2.5 sm:gap-3">

//               {/* Answered counter — hidden on xs */}
//               <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
//                               bg-[hsl(var(--success))/0.08] border border-[hsl(var(--success)/0.2)]">
//                 <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
//                 <span className="text-xs font-medium text-[hsl(var(--success))] tabular-nums">
//                   {answeredCount}<span className="text-[hsl(var(--success)/0.5)]">/{testState.questions.length}</span>
//                 </span>
//               </div>

//               {/* Timer — always LTR so MM:SS never flips */}
//               <div
//                 dir="ltr"
//                 className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm tabular-nums
//                             transition-all duration-500
//                             ${isLowTime
//                               ? 'border-destructive/25 bg-destructive/8 text-destructive animate-pulse-ring'
//                               : 'border-border bg-card text-foreground'}`}
//               >
//                 <Clock size={13} className={`shrink-0 ${isLowTime ? 'text-destructive' : 'text-muted-foreground'}`} />
//                 <span>{formatTime(testState.timeRemaining)}</span>
//               </div>

//               {/* Desktop submit */}
//               <button
//                 onClick={() => setShowSubmitDialog(true)}
//                 disabled={submitting}
//                 className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium
//                            text-primary-foreground bg-[hsl(var(--primary))]
//                            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
//                            transition-all duration-200 submit-glow"
//               >
//                 <Send size={12} />
//                 <span>Submit</span>
//               </button>
//             </div>
//           </div>

//           {/* Progress bar — always fills from the visual start regardless of dir */}
//           <div className="overflow-x-auto scrollbar-none" dir="ltr">
//             <div className="flex h-[6px] min-w-full cursor-pointer">
//               {testState.questions.map((q, idx) => {
//                 const answered = isQuestionAnswered(q.questionId)
//                 const isCurrent = idx === testState.currentQuestionIndex
//                 return (
//                   <button
//                     key={idx}
//                     onClick={() => setCurrentQuestion(idx)}
//                     title={`Question ${idx + 1}`}
//                     className={`flex-1 min-w-[6px] border-r border-background/40 last:border-r-0 transition-colors duration-300
//                                 ${isCurrent
//                                   ? 'bg-[hsl(var(--primary))]'
//                                   : answered
//                                   ? 'bg-[hsl(var(--success))]'
//                                   : 'bg-border/50 hover:bg-border'}`}
//                   />
//                 )
//               })}
//             </div>
//           </div>
//         </header>

//         {/* ── Page content ────────────────────────────────────────────────── */}
//         <main className="px-0.5 py-3 space-y-4">

//           {/* Question card */}
//           <div className="bg-card border border-border/60 rounded-2xl overflow-hidden
//                           shadow-[0_2px_20px_rgba(0,0,0,0.06)] animate-fade-up">

//             {/* Card header — category + language switcher */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between
//                             gap-3 px-6 pt-5 pb-4 border-b border-border/50">
//               <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold
//                                tracking-[0.08em] uppercase text-muted-foreground
//                                bg-muted/60 border border-border/50 w-fit">
//                 {currentQuestion.categoryName}
//               </span>

//               {/* Language buttons */}
//               {languageFlags.length > 0 && (
//                 <div className="grid grid-cols-5 sm:flex sm:flex-row gap-1.5">
//                   {languageFlags.map((languageInfo: UserLanguageInfo) => {
//                     const isActive = selectedLanguage === languageInfo.language.code
//                     return (
//                       <button
//                         key={languageInfo.language.code}
//                         type="button"
//                         onClick={() => {
//                           setSelectedLanguage(languageInfo.language.code)
//                           setLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')
//                         }}
//                         className={`inline-flex items-center justify-center gap-1.5 px-1.5 py-2 rounded-lg border
//                                     text-xs font-medium transition-all duration-200 whitespace-nowrap
//                                     ${isActive
//                                       ? 'bg-emerald-300/50 border-emerald-300/40 text-white shadow-sm'
//                                       : 'bg-card border-border text-foreground/60 hover:text-foreground hover:bg-emerald-300/5 hover:border-emerald-300/30'}`}
//                       >
//                         <Image
//                           src={languageInfo.language.flagUrl}
//                           alt={languageInfo.language.name}
//                           width={16}
//                           height={11}
//                           className="rounded-[2px] object-cover flex-shrink-0"
//                         />
//                         <span className="leading-none">{languageInfo.language.shortDisplayName}</span>
//                       </button>
//                     )
//                   })}
//                 </div>
//               )}
//             </div>

//             {/* Card body — content direction controlled here */}
//             <div className="px-6 py-6 space-y-6">

//               {/* Question images */}
//               {currentQuestion.assets && currentQuestion.assets.length > 0 && (() => {
//                 const videoAssets = currentQuestion.assets!.filter(a => a.type?.toLowerCase().includes('video'))
//                 const imageAssets = currentQuestion.assets!.filter(a => !a.type?.toLowerCase().includes('video'))
//                 const imageGridClass = imageAssets.length === 1
//                   ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
//                   : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
//                 return (
//                   <div className="space-y-3">
//                     {videoAssets.map((asset) => {
//                       const fullUrl = getAssetUrl(asset.url)
//                       return (
//                         <div key={`${asset.url}-${asset.order ?? 0}`} className="w-full md:w-3/4">
//                           <video controls autoPlay className="w-full rounded-xl border border-border bg-black">
//                             <source src={fullUrl} type="video/mp4" />
//                           </video>
//                         </div>
//                       )
//                     })}
//                     {imageAssets.length > 0 && (
//                       <div className={imageGridClass}>
//                         {imageAssets.map((asset) => {
//                           const fullUrl = getAssetUrl(asset.url)
//                           return (
//                             <div
//                               key={`${asset.url}-${asset.order ?? 0}`}
//                               className="flex flex-col items-center md:items-start space-y-1"
//                             >
//                               <img
//                                 src={fullUrl}
//                                 alt={asset.alt ?? 'Asset'}
//                                 className="rounded-xl object-contain cursor-pointer hover:opacity-80 transition-opacity"
//                                 width={300}
//                                 height={300}
//                                 onClick={() => setModalImage(fullUrl)}
//                               />
//                               {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
//                             </div>
//                           )
//                         })}
//                       </div>
//                     )}
//                   </div>
//                 )
//               })()}

//               {/* Question text — dir applied directly for correct text alignment */}
//               <p className="text-base sm:text-[17px] font-medium leading-relaxed text-foreground" dir={direction}>
//                 {getQuestionText(currentQuestion)}
//               </p>

//               {/* Options */}
//               {(() => {
//                 const allOptionsHaveAssets = currentQuestion.options.length > 0 &&
//                   currentQuestion.options.every((opt) => opt.asset?.url)
//                 const isGridLayout = allOptionsHaveAssets

//                 return (
//                   <div className={isGridLayout
//                     ? "grid grid-cols-2 sm:grid-cols-4 gap-2.5"
//                     : "flex flex-col gap-2"}>
//                     {currentQuestion.options.map((option, optIdx) => {
//                       const isSelected =
//                         isQuestionAnswered(currentQuestion.questionId) &&
//                         (testState.answers[currentQuestion.questionId]?.selectedOptionIds ?? []).includes(option.id)

//                       const optionLabel = String.fromCharCode(65 + optIdx) // A, B, C, D

//                       if (isGridLayout) {
//                         return (
//                           <button
//                             key={option.id}
//                             onClick={() => updateAnswer(currentQuestion.questionId, option.id)}
//                             className={`option-btn w-full rounded-xl border text-start cursor-pointer p-3
//                                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]
//                                         ${isSelected
//                                           ? 'border-[hsl(var(--success)/0.5)] bg-[hsl(var(--success)/0.06)] shadow-[0_0_0_1px_hsl(var(--success)/0.2)]'
//                                           : 'border-border/60 bg-card hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.03)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]'}`}
//                           >
//                             <div className="flex flex-col items-center gap-2">
//                               {/* Checkmark floats to inline-end */}
//                               <div className="w-full flex justify-end">
//                                 <div className={`h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0
//                                                 ${isSelected
//                                                   ? 'border-[hsl(var(--success))] bg-[hsl(var(--success)/0.12)]'
//                                                   : 'border-border/60 bg-transparent'}`}>
//                                   {isSelected && <div className="w-2 h-2 rounded-sm bg-[hsl(var(--success))]" />}
//                                 </div>
//                               </div>

//                               {option.asset?.url && (
//                                 <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted/30 border border-border/40">
//                                   <Image
//                                     src={getAssetUrl(option.asset.url)}
//                                     alt={getOptionText(option) || `Option ${option.id}`}
//                                     fill
//                                     className="object-scale-down"
//                                     sizes="(max-width: 640px) 140px, 120px"
//                                   />
//                                 </div>
//                               )}

//                               {getOptionText(option) && (
//                                 <span
//                                   className={`text-[11px] font-medium leading-snug text-center
//                                               ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
//                                   dir={direction}
//                                 >
//                                   {getOptionText(option)}
//                                 </span>
//                               )}
//                             </div>
//                           </button>
//                         )
//                       } else {
//                         return (
//                           <button
//                             key={option.id}
//                             onClick={() => updateAnswer(currentQuestion.questionId, option.id)}
//                             dir={direction}
//                             className={`option-btn w-full rounded-xl border text-start cursor-pointer px-4 py-3.5
//                                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]
//                                         ${isSelected
//                                           ? 'border-[hsl(var(--success)/0.5)] bg-[hsl(var(--success)/0.05)] shadow-[0_0_0_1px_hsl(var(--success)/0.15)]'
//                                           : 'border-border/60 bg-card hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.025)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]'}`}
//                           >
//                             <div className="flex items-center gap-3.5">

//                               {/* Checkbox — always visible, fills green on selection */}
//                               <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0
//                                               transition-all duration-200
//                                               ${isSelected
//                                                 ? 'bg-[hsl(var(--success))] border-[hsl(var(--success))] shadow-[0_2px_8px_hsl(var(--success)/0.35)]'
//                                                 : 'bg-transparent border-border/60'}`}>
//                                 {isSelected && (
//                                   <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
//                                     <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
//                                   </svg>
//                                 )}
//                               </div>

//                               {option.asset?.url && (
//                                 <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-muted/30 border border-border/40">
//                                   <Image
//                                     src={getAssetUrl(option.asset.url)}
//                                     alt={getOptionText(option) || 'Option image'}
//                                     fill
//                                     className="object-scale-down"
//                                     sizes="(max-width: 640px) 64px, 80px"
//                                   />
//                                 </div>
//                               )}

//                               {getOptionText(option) && (
//                                 <span
//                                   className={`flex-1 text-sm font-medium leading-snug
//                                               ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}
//                                 >
//                                   {getOptionText(option)}
//                                 </span>
//                               )}
//                             </div>
//                           </button>
//                         )
//                       }
//                     })}
//                   </div>
//                 )
//               })()}
//             </div>
//           </div>

//           {/* ── Navigation row ───────────────────────────────────────────── */}
//           <div className="flex items-center gap-3">

//             {/* Previous — icon flips for RTL */}
//             <button
//               onClick={() => setCurrentQuestion(testState.currentQuestionIndex - 1)}
//               disabled={testState.currentQuestionIndex === 0}
//               className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-sm font-medium
//                          text-muted-foreground border border-border/60 bg-card
//                          hover:text-foreground hover:border-border hover:bg-accent/40
//                          disabled:opacity-30 disabled:cursor-not-allowed
//                          transition-all duration-200 cursor-pointer shrink-0"
//             >
//               <PrevIcon size={15} />
//               <span className="hidden sm:inline">Previous</span>
//             </button>

//             {/* Question dots — horizontally scrollable */}
//             <div ref={dotsContainerRef} className="flex items-center gap-1 overflow-x-auto py-1 flex-1 scrollbar-none touch-auto">
//               {testState.questions.map((q, idx) => {
//                 const answered = isQuestionAnswered(q.questionId)
//                 const isCurrent = idx === testState.currentQuestionIndex
//                 return (
//                   <button
//                     key={idx}
//                     onClick={() => setCurrentQuestion(idx)}
//                     className={`dot-btn w-7 h-7 rounded-lg text-[10px] font-semibold shrink-0 border
//                                 ${isCurrent
//                                   ? 'bg-[hsl(var(--primary))] text-primary-foreground border-[hsl(var(--primary))]'
//                                   : answered
//                                   ? 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]'
//                                   : 'bg-card text-muted-foreground border-border/60 hover:bg-accent/60 hover:text-foreground hover:border-border'}`}
//                   >
//                     {idx + 1}
//                   </button>
//                 )
//               })}
//             </div>

//             {/* Next / Submit — Next icon flips for RTL */}
//             {isLastQuestion ? (
//               <button
//                 onClick={() => setShowSubmitDialog(true)}
//                 disabled={submitting || !isQuestionAnswered(currentQuestion.questionId)}
//                 className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
//                            text-primary-foreground bg-[hsl(var(--primary))]
//                            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
//                            transition-all duration-200 submit-glow shrink-0"
//               >
//                 <Send size={13} />
//                 <span>Submit</span>
//               </button>
//             ) : (
//               <button
//                 onClick={() => setCurrentQuestion(testState.currentQuestionIndex + 1)}
//                 disabled={!isQuestionAnswered(currentQuestion.questionId)}
//                 className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-sm font-medium
//                            text-primary-foreground bg-[hsl(var(--primary))]
//                            hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
//                            transition-all duration-200 submit-glow shrink-0"
//               >
//                 <span className="hidden sm:inline">Next</span>
//                 <NextIcon size={15} />
//               </button>
//             )}
//           </div>

//           {/* ── Mobile submit bar ────────────────────────────────────────── */}
//           <div className="sm:hidden pt-1">
//             <button
//               onClick={() => setShowSubmitDialog(true)}
//               disabled={submitting}
//               className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium
//                          text-primary-foreground bg-[hsl(var(--primary))]
//                          hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
//                          transition-all duration-200 submit-glow"
//             >
//               <Send size={13} />
//               <span>Submit Test</span>
//               <span className="opacity-60 text-xs">({answeredCount}/{testState.questions.length})</span>
//             </button>
//           </div>

//         </main>
//       </div>
//     </>
//   )
// }


"use client"

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMockTestStore } from '@/lib/store/mock-test-store'
import { useAuthStore } from '@/lib/store/auth-store'
import { useContentLanguageStore, useLocalSettingsStore } from '@/lib/store'
import api from '@/lib/api/client'
import { checkEntitlementStatus } from '@/lib/services/payment-service'
import { SubmitMockTestAnswersRequest } from '@/lib/types/mock-test'
import { UserLanguageInfo } from '@/lib/types'
import { Loader2, Clock, AlertCircle, X, ChevronLeft, ChevronRight, Send } from 'lucide-react'
import { getAssetUrl } from '@/lib/utils/asset-url'


export default function MockTestPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const jurisdictionId    = Number(searchParams.get('jurisdictionId'))
  const licenceCategoryId = Number(searchParams.get('licenceCategoryId'))

  const user = useAuthStore(state => state.user)
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : []
  const { direction, setLanguage } = useContentLanguageStore()
  const { showOriginalAndTranslation } = useLocalSettingsStore()

  const {
    testState,
    initializeTest,
    updateAnswer,
    setCurrentQuestion,
    updateTimeRemaining,
    clearTest,
    getAnsweredCount,
    getProgress,
    isQuestionAnswered,
  } = useMockTestStore()

  const [loading, setLoading]                     = useState(true)
  const [submitting, setSubmitting]               = useState(false)
  const [showSubmitDialog, setShowSubmitDialog]   = useState(false)
  const [showTimeUpDialog, setShowTimeUpDialog]   = useState(false)
  const [error, setError]                         = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage]   = useState<string>('')
  const [modalImage, setModalImage] = useState<string | null>(null)

  const dotsContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => { loadTest() }, [])

  const hasSubmittedRef = useRef(false)

  useEffect(() => {
    if (!testState?.endTime) return

    const interval = setInterval(() => {
      const now = Date.now()
      const remaining = Math.max(0, Math.floor((testState.endTime - now) / 1000))
      updateTimeRemaining(remaining)

      if (now >= testState.endTime && !hasSubmittedRef.current) {
        hasSubmittedRef.current = true
        clearInterval(interval)
        handleAutoSubmit()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [testState?.endTime])

  useEffect(() => {
    if (!testState) return
    const container = dotsContainerRef.current
    if (!container) return
    const activeBtn = container.children[testState.currentQuestionIndex] as HTMLElement | undefined
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
    }
  }, [testState?.currentQuestionIndex])

  // Intercept browser back button to show submit dialog instead of leaving
  useEffect(() => {
    if (!testState) return
    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href)
      setShowSubmitDialog(true)
    }
    window.history.pushState(null, '', window.location.href)
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [testState])

  const loadTest = async () => {
    try {
      if (!jurisdictionId || !licenceCategoryId || isNaN(jurisdictionId) || isNaN(licenceCategoryId)) {
        setError('Invalid test parameters. Please start from the mock test page.')
        setLoading(false)
        setTimeout(() => router.push('/practice/mock-test/start'), 3000)
        return
      }
      if (testState && testState.endTime > Date.now()) { setLoading(false); return }
      if (testState && testState.endTime <= Date.now()) clearTest()

      const response = await api.post('/api/v1/mock-tests/questions', { jurisdictionId, licenceCategoryId })
      const responseData = response.data.data || response.data

      // Pre-access check:
      // 1. Active subscription → allow
      // 2. No subscription but free tests remaining → allow
      // 3. Otherwise → redirect to pricing
      let hasActiveSubscription = user?.subscription?.isActive === true
      try {
        const entitlement = await checkEntitlementStatus(jurisdictionId)
        hasActiveSubscription = hasActiveSubscription || entitlement.hasAccess
      } catch {
        // Entitlement check failed — fall through to subscription/free-usage check
      }

      if (!hasActiveSubscription) {
        const { freeMockTests, mockTestsTaken } = responseData.config
        if (freeMockTests == null || mockTestsTaken >= freeMockTests) {
          router.replace('/practice/pricing?reason=free_usage_exceeded')
          return
        }
      }

      initializeTest(responseData, jurisdictionId, licenceCategoryId)
      setLoading(false)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load test')
      setLoading(false)
      setTimeout(() => router.push('/practice/mock-test/start'), 3000)
    }
  }

  const submitTest = async (isAutoSubmit = false) => {
    if (!testState || submitting) return
    setSubmitting(true)
    try {
      const timeTakenSeconds = Math.floor((Date.now() - testState.startTime) / 1000)
      const answersArray = Object.values(testState.answers).map(a => ({
        questionId: a.questionId,
        selectedOptionIds: Array.from(new Set(a.selectedOptionIds)).sort((x, y) => x - y),
        timeTakenSeconds: a.timeTakenSeconds,
      }))

      if (answersArray.length === 0 && isAutoSubmit) {
        clearTest()
        router.push('/practice/mock-test/history')
        return
      }

      const payload: SubmitMockTestAnswersRequest = {
        jurisdictionId: testState.jurisdictionId,
        licenceCategoryId: testState.licenceCategoryId,
        timeTakenSeconds,
        answers: answersArray,
      }
      const response = await api.post('/api/v1/mock-tests/submit', payload)
      const result   = response.data
      sessionStorage.setItem('mockTestResults', JSON.stringify(result))
      clearTest()

      if (isAutoSubmit) {
        router.push('/practice/mock-test/history')
      } else {
        router.push(`/practice/mock-test/results?testId=${result.data.mockTestId}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit test')
      setSubmitting(false)
      setShowSubmitDialog(false)
      setShowTimeUpDialog(false)
    }
  }

  const resolveDualText = (
    original: string | undefined,
    translated: string | undefined
  ): ReactNode => {
    if (!showOriginalAndTranslation || selectedLanguage === 'en' || !original) {
      return translated ?? original ?? ''
    }
    if (!translated || translated === original) {
      return original
    }
    return (
      <>
        <span>{original}</span>
        <span className="block mt-1.5 opacity-60 text-sm">{translated}</span>
      </>
    )
  }

  const getQuestionText = (question: any): ReactNode => {
    if (!question) return ''
    const originalText = question.questionText || ''
    if (!selectedLanguage || selectedLanguage === '' || !question.translations) {
      return originalText
    }
    const translation = question.translations[selectedLanguage]
    let translatedText: string | undefined
    if (translation && typeof translation === 'object') {
      translatedText = (translation as any).text || (translation as any).question
    }
    return resolveDualText(originalText, translatedText)
  }

  const getOptionText = (option: any): string => {
    if (!option) return ''
    const originalText = option.text || ''
    if (!selectedLanguage || selectedLanguage === '' || !option.translations) {
      return originalText
    }
    const translation = option.translations[selectedLanguage]
    if (translation && typeof translation === 'object' && 'text' in translation) {
      return (translation as any).text || originalText
    }
    return originalText
  }

  const getOptionDisplayText = (option: any): ReactNode => {
    if (!option) return ''
    const originalText = option.text || ''
    if (!selectedLanguage || selectedLanguage === '' || !option.translations) {
      return originalText
    }
    const translation = option.translations[selectedLanguage]
    let translatedText: string | undefined
    if (translation && typeof translation === 'object' && 'text' in translation) {
      translatedText = (translation as any).text
    }
    return resolveDualText(originalText, translatedText)
  }

  const handleAutoSubmit = async () => {
    setShowTimeUpDialog(true)
    setTimeout(() => submitTest(true), 2000)
  }

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading || !testState) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-dm   { font-family: 'DM Sans', sans-serif; }
        `}</style>
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl border border-border bg-card flex items-center justify-center">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground font-dm font-light tracking-wide">Loading your test…</p>
      </div>
    )
  }

  const currentQuestion = testState.questions[testState.currentQuestionIndex]
  const answeredCount   = getAnsweredCount()
  const progress        = getProgress()
  const isLastQuestion  = testState.currentQuestionIndex === testState.questions.length - 1
  const isLowTime       = testState.timeRemaining < 300
  const unansweredCount = testState.questions.length - answeredCount

  // Chevron helpers — flip for RTL
  const PrevIcon = direction === 'rtl' ? ChevronRight : ChevronLeft
  const NextIcon = direction === 'rtl' ? ChevronLeft  : ChevronRight

  return (
    <>
      {modalImage && createPortal(
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.92)', overflow: 'hidden' }}
          onClick={() => setModalImage(null)}
        >
          <button
            onClick={() => setModalImage(null)}
            style={{ position: 'absolute', top: 12, right: 12, zIndex: 10000, padding: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={22} />
          </button>
          <img
            src={modalImage!}
            alt="Full size"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '92vw', maxHeight: '92vh', objectFit: 'contain', borderRadius: 8 }}
          />
        </div>,
        document.body
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 hsl(var(--destructive) / 0.35); }
          70%  { box-shadow: 0 0 0 6px hsl(var(--destructive) / 0); }
          100% { box-shadow: 0 0 0 0 hsl(var(--destructive) / 0); }
        }

        .animate-fade-up      { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-fade-in      { animation: fadeIn 0.3s ease both; }
        .animate-scale-in     { animation: scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-pulse-ring   { animation: pulse-ring 1.5s ease-out infinite; }

        .option-btn { transition: border-color 0.18s ease, background-color 0.18s ease, box-shadow 0.18s ease, transform 0.15s ease; }
        .option-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .option-btn:active:not(:disabled) { transform: translateY(0); }

        .scrollbar-none { scrollbar-width: none; }
        .scrollbar-none::-webkit-scrollbar { display: none; }

        .dot-btn { transition: background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.12s ease; }
        .dot-btn:hover { transform: scale(1.1); }
        .dot-btn:active { transform: scale(0.95); }

        .submit-glow { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); transition: box-shadow 0.2s ease, opacity 0.2s ease, transform 0.15s ease; }
        .submit-glow:hover:not(:disabled) { box-shadow: 0 4px 24px hsl(var(--primary) / 0.3); transform: translateY(-1px); }
        .submit-glow:active:not(:disabled) { transform: translateY(0); }

        .lang-btn { transition: all 0.15s ease; }
        .lang-btn:hover { transform: translateY(-1px); }
      `}</style>

      {/* ── Root: dir applied here cascades to all children ── */}
      <div className="font-dm min-h-screen bg-background text-foreground" dir={direction}>

        {/* ── Floating error toast ─────────────────────────────────────────── */}
        {error && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 animate-fade-up">
            <div className="flex items-start gap-3 p-4 rounded-2xl
                            bg-destructive/8 border border-destructive/20
                            shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-md">
              <div className="w-7 h-7 rounded-lg bg-destructive/12 flex items-center justify-center shrink-0">
                <AlertCircle size={13} className="text-destructive" />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-xs font-semibold text-destructive tracking-wide uppercase">Error</p>
                <p className="text-xs text-destructive/70 font-light mt-0.5 leading-relaxed">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-destructive/30 hover:text-destructive/60 transition-colors shrink-0 mt-0.5 p-1 rounded-lg hover:bg-destructive/8"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}

        {/* ── Time's up overlay ────────────────────────────────────────────── */}
        {showTimeUpDialog && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-background border border-border rounded-3xl max-w-xs w-full p-8
                            text-center space-y-6 shadow-[0_32px_80px_rgba(0,0,0,0.25)] animate-scale-in">
              <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--tip))] border border-[hsl(var(--tip-border))]
                              flex items-center justify-center mx-auto">
                <Clock size={26} className="text-[hsl(var(--tip-foreground))]" />
              </div>
              <div className="space-y-2">
                <h2 className="font-syne font-bold text-xl tracking-tight text-foreground">Time's Up!</h2>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  Your test time has expired. Submitting your answers now…
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-light">Please wait</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Submit confirmation dialog ───────────────────────────────────── */}
        {showSubmitDialog && (
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="border border-border rounded-3xl max-w-sm w-full p-7
                            space-y-6 shadow-[0_32px_80px_rgba(0,0,0,0.22)] animate-scale-in"
                 style={{ backgroundColor: 'var(--card)' }}>

              <div className="space-y-1.5">
                <h2 className="font-syne font-bold text-xl tracking-tight text-card-foreground">Ready to submit?</h2>
                <p className="text-sm text-muted-foreground font-light leading-relaxed">
                  You've answered{' '}
                  <span className="text-foreground font-medium">{answeredCount}</span>{' '}
                  of{' '}
                  <span className="text-foreground font-medium">{testState.questions.length}</span>{' '}
                  questions.
                </p>
              </div>

              {/* Progress visual */}
              <div className="space-y-2">
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[hsl(var(--success))] rounded-full transition-all duration-700"
                    style={{ width: `${(answeredCount / testState.questions.length) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                  <span>{answeredCount} answered</span>
                  <span>{unansweredCount} remaining</span>
                </div>
              </div>

              {unansweredCount > 0 && (
                <div className="flex items-start gap-2.5 p-3.5 rounded-xl
                                bg-[hsl(var(--tip))] border border-[hsl(var(--tip-border))]">
                  <AlertCircle size={13} className="text-[hsl(var(--tip-foreground))] shrink-0 mt-0.5" />
                  <p className="text-xs text-[hsl(var(--tip-foreground))] font-light leading-relaxed">
                    {unansweredCount} question{unansweredCount !== 1 ? 's' : ''} will be left unanswered.
                  </p>
                </div>
              )}

              <div className="flex gap-2.5 pt-1">
                <button
                  onClick={() => setShowSubmitDialog(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-muted-foreground border border-border bg-background
                             hover:text-foreground hover:border-border/60 hover:bg-accent/40
                             disabled:opacity-40 transition-all duration-200"
                >
                  Continue
                </button>
                <button
                  onClick={() => submitTest(false)}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-primary-foreground bg-[hsl(var(--primary))]
                             hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200 submit-glow"
                >
                  {submitting
                    ? <><Loader2 size={14} className="animate-spin" /><span>Submitting…</span></>
                    : <><Send size={13} /><span>Submit Test</span></>}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Sticky header ───────────────────────────────────────────────── */}
        <header className="sticky top-0 z-10 bg-background/75 backdrop-blur-xl border-b border-border/60">
          {/*
            No dir needed here — it inherits from the root div.
            justify-between already handles start/end correctly in RTL.
          */}
          <div className="max-w-4xl mx-auto px-5 py-3 flex items-center justify-between gap-4">

            {/* Start — title + counter */}
            <div className="flex items-center gap-3.5">
              <div>
                <h1 className="font-syne font-bold text-base tracking-tight text-foreground leading-none">
                  Mock Test
                </h1>
                <p className="text-[11px] text-muted-foreground font-light mt-1 tabular-nums">
                  Current Question <span className="text-foreground font-medium">{testState.currentQuestionIndex + 1}</span>
                  {/* <span className="text-muted-foreground/50 mx-0.5">/</span> */}
                  {/* {testState.questions.length} */}
                </p>
              </div>
            </div>

            {/* End — answered pill + timer + submit */}
            <div className="flex items-center gap-2.5 sm:gap-3">

              {/* Answered counter — hidden on xs */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl
                              bg-[hsl(var(--success))/0.08] border border-[hsl(var(--success)/0.2)]">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))]" />
                <span className="text-xs font-medium text-[hsl(var(--success))] tabular-nums">
                  {answeredCount}<span className="text-[hsl(var(--success)/0.5)]">/{testState.questions.length}</span>
                </span>
              </div>

              {/* Timer — always LTR so MM:SS never flips */}
              <div
                dir="ltr"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono font-bold text-sm tabular-nums
                            transition-all duration-500
                            ${isLowTime
                              ? 'border-destructive/25 bg-destructive/8 text-destructive animate-pulse-ring'
                              : 'border-border bg-card text-foreground'}`}
              >
                <Clock size={13} className={`shrink-0 ${isLowTime ? 'text-destructive' : 'text-muted-foreground'}`} />
                <span>{formatTime(testState.timeRemaining)}</span>
              </div>

              {/* Desktop submit */}
              <button
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-sm font-medium
                           text-primary-foreground bg-[hsl(var(--primary))]
                           hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 submit-glow"
              >
                <Send size={12} />
                <span>Submit</span>
              </button>
            </div>
          </div>

          {/* Progress bar — always fills from the visual start regardless of dir */}
          <div className="overflow-x-auto scrollbar-none" dir="ltr">
            <div className="flex h-[6px] min-w-full cursor-pointer">
              {testState.questions.map((q, idx) => {
                const answered = isQuestionAnswered(q.questionId)
                const isCurrent = idx === testState.currentQuestionIndex
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    title={`Question ${idx + 1}`}
                    className={`flex-1 min-w-[6px] border-r border-background/40 last:border-r-0 transition-colors duration-300
                                ${isCurrent
                                  ? 'bg-[hsl(var(--primary))]'
                                  : answered
                                  ? 'bg-[hsl(var(--success))]'
                                  : 'bg-border/50 hover:bg-border'}`}
                  />
                )
              })}
            </div>
          </div>

          {/* Sticky language switcher — only this row scrolls horizontally */}
          {languageFlags.length > 0 && (
            <div className="w-full max-w-full min-w-0 overflow-hidden bg-background border-t border-border/40">
              <div className="max-w-4xl mx-auto w-full max-w-full min-w-0 px-5 py-2 overflow-hidden">
                <div
                  className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden overscroll-x-contain scrollbar-none"
                  aria-label="Mock test language options"
                >
                  <div className="inline-flex w-max min-w-max items-center gap-1.5 rounded-2xl border border-border bg-card p-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]">
                    {languageFlags.map((languageInfo: UserLanguageInfo) => {
                      const isActive = selectedLanguage === languageInfo.language.code

                      return (
                        <button
                          key={languageInfo.language.code}
                          type="button"
                          onClick={() => {
                            setSelectedLanguage(languageInfo.language.code)
                            setLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl')
                          }}
                          className={`lang-btn shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border
                                      text-xs font-medium transition-all duration-200 whitespace-nowrap
                                      ${isActive
                                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-sm'
                                        : 'bg-card border-border text-foreground hover:bg-emerald-700 hover:text-white hover:border-emerald-500'}`}
                          aria-pressed={isActive}
                        >
                          <Image
                            src={languageInfo.language.flagUrl}
                            alt={languageInfo.language.name}
                            width={16}
                            height={11}
                            className="rounded-[2px] object-cover flex-shrink-0"
                          />
                          <span className="leading-none">{languageInfo.language.shortDisplayName}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </header>

        {/* ── Page content ────────────────────────────────────────────────── */}
        <main className="px-0.5 py-3 space-y-4">

          {/* Question card */}
          <div className="bg-card border border-border/60 rounded-2xl overflow-hidden
                          shadow-[0_2px_20px_rgba(0,0,0,0.06)] animate-fade-up">

            {/* Card header — category + answered pill */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border/50 gap-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold
                               tracking-[0.08em] uppercase text-muted-foreground
                               bg-muted/60 border border-border/50 w-fit">
                {currentQuestion.categoryName}
              </span>
              {(() => {
                const currentAnswer = testState.answers[currentQuestion.questionId]
                const isAnswered = currentAnswer && currentAnswer.selectedOptionIds.length > 0
                return (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-semibold tracking-wide border
                    ${isAnswered
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                      : 'bg-gray-100/60 text-gray-500 border-gray-200/50'}`}>
                    {isAnswered ? 'Answered' : 'Remaining'}
                  </span>
                )
              })()}
            </div>

            {/* Card body — content direction controlled here */}
            <div className="px-6 py-6 space-y-6">

              {/* Question images */}
              {currentQuestion.assets && currentQuestion.assets.length > 0 && (() => {
                const videoAssets = currentQuestion.assets!.filter(a => a.type?.toLowerCase().includes('video'))
                const imageAssets = currentQuestion.assets!.filter(a => !a.type?.toLowerCase().includes('video'))
                const imageGridClass = imageAssets.length === 1
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
                  : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
                return (
                  <div className="space-y-3">
                    {videoAssets.map((asset) => {
                      const fullUrl = getAssetUrl(asset.url)
                      return (
                        <div key={`${asset.url}-${asset.order ?? 0}`} className="w-full md:w-3/4">
                          <video controls autoPlay className="w-full rounded-xl border border-border bg-black">
                            <source src={fullUrl} type="video/mp4" />
                          </video>
                        </div>
                      )
                    })}
                    {imageAssets.length > 0 && (
                      <div className={imageGridClass}>
                        {imageAssets.map((asset) => {
                          const fullUrl = getAssetUrl(asset.url)
                          return (
                            <div
                              key={`${asset.url}-${asset.order ?? 0}`}
                              className="flex flex-col items-center md:items-start space-y-1"
                            >
                              <img
                                src={fullUrl}
                                alt={asset.alt ?? 'Asset'}
                                className="rounded-xl object-contain cursor-pointer hover:opacity-80 transition-opacity"
                                width={300}
                                height={300}
                                onClick={() => setModalImage(fullUrl)}
                              />
                              {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* Question text — dir applied directly for correct text alignment */}
              <p className="text-base sm:text-[17px] font-medium leading-relaxed text-foreground" dir={direction}>
                {getQuestionText(currentQuestion)}
              </p>

              {/* Options */}
              {(() => {
                const sortedOptions = [...currentQuestion.options].sort(
                  (a, b) => (a.position ?? 0) - (b.position ?? 0)
                )
                const allOptionsHaveAssets = sortedOptions.length > 0 &&
                  sortedOptions.every((opt) => opt.asset?.url)
                const isGridLayout = allOptionsHaveAssets

                return (
                  <div className={isGridLayout
                    ? "grid grid-cols-2 gap-3"
                    : "flex flex-col gap-2"}>
                    {sortedOptions.map((option, optIdx) => {
                      const isSelected =
                        isQuestionAnswered(currentQuestion.questionId) &&
                        (testState.answers[currentQuestion.questionId]?.selectedOptionIds ?? []).includes(option.id)

                      const letter = String.fromCharCode(65 + optIdx)

                      if (isGridLayout) {
                        return (
                          <button
                            key={option.id}
                            onClick={() => updateAnswer(currentQuestion.questionId, option.id)}
                            className={`option-btn w-full rounded-xl border text-start cursor-pointer p-3
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]
                                        ${isSelected
                                          ? 'border-emerald-700 bg-emerald-700 shadow-[0_4px_24px_rgba(4,120,87,0.35)]'
                                          : 'border-border/60 bg-card hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.03)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.06)]'}`}
                          >
                            <div className="flex flex-col items-center gap-2">
                              {/* Top row: letter badge left, check indicator right */}
                              <div className="w-full flex items-center justify-between">
                                <span className={`inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold
                                  ${isSelected ? 'bg-white/20 text-white' : 'bg-muted/60 text-muted-foreground'}`}>
                                  {letter}
                                </span>
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0
                                                ${isSelected
                                                  ? 'border-white bg-white'
                                                  : 'border-border/60 bg-transparent'}`}>
                                  {isSelected && (
                                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-[hsl(var(--primary))]">
                                      <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  )}
                                </div>
                              </div>

                              {option.asset?.url && (
                                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted/30 border border-border/40">
                                  <Image
                                    src={getAssetUrl(option.asset.url)}
                                    alt={getOptionText(option) || `Option ${option.id}`}
                                    fill
                                    className="object-scale-down"
                                    sizes="(max-width: 640px) 140px, 120px"
                                  />
                                </div>
                              )}

                              {getOptionDisplayText(option) && (
                                <span
                                  className={`text-[11px] font-medium leading-snug text-center
                                              ${isSelected ? 'text-white font-extrabold' : 'text-muted-foreground'}`}
                                  dir={direction}
                                >
                                  {getOptionDisplayText(option)}
                                </span>
                              )}
                            </div>
                          </button>
                        )
                      } else {
                        return (
                          <button
                            key={option.id}
                            onClick={() => updateAnswer(currentQuestion.questionId, option.id)}
                            dir={direction}
                            className={`option-btn w-full rounded-xl border text-start cursor-pointer px-4 py-3.5
                                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary)/0.35)]
                                        ${isSelected
                                          ? 'border-emerald-700 bg-emerald-700 shadow-[0_4px_24px_rgba(4,120,87,0.35)]'
                                          : 'border-border/60 bg-card hover:border-[hsl(var(--primary)/0.4)] hover:bg-[hsl(var(--primary)/0.025)] hover:shadow-[0_2px_12px_rgba(0,0,0,0.05)]'}`}
                          >
                            <div className="flex items-center gap-3.5">

                              {/* Letter badge */}
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold shrink-0
                                ${isSelected ? 'bg-white/20 text-white' : 'bg-muted/60 text-muted-foreground'}`}>
                                {letter}
                              </span>

                              {option.asset?.url && (
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-muted/30 border border-border/40">
                                  <Image
                                    src={getAssetUrl(option.asset.url)}
                                    alt={getOptionText(option) || 'Option image'}
                                    fill
                                    className="object-scale-down"
                                    sizes="(max-width: 640px) 64px, 80px"
                                  />
                                </div>
                              )}

                              {getOptionDisplayText(option) && (
                                <span
                                  className={`flex-1 text-sm leading-snug
                                              ${isSelected ? 'text-white font-extrabold' : 'text-muted-foreground font-semibold'}`}
                                >
                                  {getOptionDisplayText(option)}
                                </span>
                              )}

                              {/* Trailing check indicator */}
                              <div className={`ms-auto h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0
                                              ${isSelected
                                                ? 'border-white bg-white'
                                                : 'border-border/60 bg-transparent'}`}>
                                {isSelected && (
                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-[hsl(var(--primary))]">
                                    <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                )}
                              </div>
                            </div>
                          </button>
                        )
                      }
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

          {/* ── Navigation row ───────────────────────────────────────────── */}
          <div className="flex items-center gap-3">

            {/* Previous — icon flips for RTL */}
            <button
              onClick={() => setCurrentQuestion(testState.currentQuestionIndex - 1)}
              disabled={testState.currentQuestionIndex === 0}
              className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-sm font-medium
                         text-muted-foreground border border-border/60 bg-card
                         hover:text-foreground hover:border-border hover:bg-accent/40
                         disabled:opacity-30 disabled:cursor-not-allowed
                         transition-all duration-200 cursor-pointer shrink-0"
            >
              <PrevIcon size={15} />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Question dots — horizontally scrollable */}
            <div ref={dotsContainerRef} className="flex items-center gap-1 overflow-x-auto py-1 flex-1 scrollbar-none touch-auto">
              {testState.questions.map((q, idx) => {
                const answered = isQuestionAnswered(q.questionId)
                const isCurrent = idx === testState.currentQuestionIndex
                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentQuestion(idx)}
                    className={`dot-btn w-7 h-7 rounded-lg text-[10px] font-semibold shrink-0 border
                                ${isCurrent
                                  ? 'bg-[hsl(var(--primary))] text-primary-foreground border-[hsl(var(--primary))]'
                                  : answered
                                  ? 'bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))] border-[hsl(var(--success)/0.3)]'
                                  : 'bg-card text-muted-foreground border-border/60 hover:bg-accent/60 hover:text-foreground hover:border-border'}`}
                  >
                    {idx + 1}
                  </button>
                )
              })}
            </div>

            {/* Next / Submit — Next icon flips for RTL */}
            {isLastQuestion ? (
              <button
                onClick={() => setShowSubmitDialog(true)}
                disabled={submitting || !isQuestionAnswered(currentQuestion.questionId)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-sm font-medium
                           text-primary-foreground bg-[hsl(var(--primary))]
                           hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 submit-glow shrink-0"
              >
                <Send size={13} />
                <span>Submit</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentQuestion(testState.currentQuestionIndex + 1)}
                disabled={!isQuestionAnswered(currentQuestion.questionId)}
                className="inline-flex items-center gap-1 px-3.5 py-2.5 rounded-xl text-sm font-medium
                           text-primary-foreground bg-[hsl(var(--primary))]
                           hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                           transition-all duration-200 submit-glow shrink-0"
              >
                <span className="hidden sm:inline">Next</span>
                <NextIcon size={15} />
              </button>
            )}
          </div>

          {/* ── Mobile submit bar ────────────────────────────────────────── */}
          <div className="sm:hidden pt-1">
            <button
              onClick={() => setShowSubmitDialog(true)}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium
                         text-primary-foreground bg-[hsl(var(--primary))]
                         hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all duration-200 submit-glow"
            >
              <Send size={13} />
              <span>Submit Test</span>
              <span className="opacity-60 text-xs">({answeredCount}/{testState.questions.length})</span>
            </button>
          </div>

        </main>
      </div>
    </>
  )
}