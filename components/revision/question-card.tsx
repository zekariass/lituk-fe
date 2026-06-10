// "use client";

// import { Question, QuestionOption, Tip, Explanation } from '@/lib/types';
// import { OptionList } from './option-list';
// import { ExplanationPanel } from './explanation-panel';
// import { TipsPanel } from './tips-panel';
// import { AssetRenderer } from './asset-renderer';

// interface RevisionQuestionCardProps {
//   question: Question;
//   selectedOptionId?: number;
//   answerLocked: boolean;
//   correctOptionId?: number;
//   explanation?: Explanation;
//   explanationText: string;
//   showExplanation: boolean;
//   tips: Tip[];
//   showTips: boolean;
//   questionText: string;
//   explanationTitle: string;
//   tipsTitle: string;
//   tipLabel: (index: number) => string;
//   showExplanationLabel: string;
//   hideExplanationLabel: string;
//   showTipLabel: string;
//   hideTipLabel: string;
//   onSelectOption: (optionId: number) => void;
//   onToggleExplanation: () => void;
//   onToggleTips: () => void;
//   getOptionLabel: (option: QuestionOption) => string;
//   getTipText: (tip: Tip) => string;
// }

// export function RevisionQuestionCard({
//   question,
//   selectedOptionId,
//   answerLocked,
//   correctOptionId,
//   explanation,
//   explanationText,
//   showExplanation,
//   tips,
//   showTips,
//   questionText,
//   explanationTitle,
//   tipsTitle,
//   tipLabel,
//   showExplanationLabel,
//   hideExplanationLabel,
//   showTipLabel,
//   hideTipLabel,
//   onSelectOption,
//   onToggleExplanation,
//   onToggleTips,
//   getOptionLabel,
//   getTipText,
// }: RevisionQuestionCardProps) {
//   return (
//     <>
//       <div className="space-y-4 rounded-lg border bg-blue-800/15 p-5">
//         <AssetRenderer assets={question.assets} />
//         <p className="text-lg font-semibold leading-relaxed">{questionText}</p>

//         <OptionList
//           options={question.options ?? []}
//           selectedOptionId={selectedOptionId}
//           answerLocked={answerLocked}
//           correctOptionId={correctOptionId}
//           onSelectOption={onSelectOption}
//           getOptionLabel={getOptionLabel}
//         />

//         <div className="flex flex-wrap gap-2">
//           <button
//             type="button"
//             onClick={onToggleExplanation}
//             className="rounded-md border border-border px-3 py-1.5 text-sm bg-green-600/30 hover:bg-green-500/30"
//           >
//             {showExplanation ? hideExplanationLabel : showExplanationLabel}
//           </button>
//           <button
//             type="button"
//             onClick={onToggleTips}
//             className="rounded-md border border-border px-3 py-1.5 text-sm bg-green-600/30 hover:bg-green-500/30"
//           >
//             {showTips ? hideTipLabel : showTipLabel}
//           </button>
//         </div>
//       </div>

//       {showExplanation ? (
//         <ExplanationPanel explanation={explanation} text={explanationText} title={explanationTitle} />
//       ) : null}

//       {showTips ? <TipsPanel tips={tips} title={tipsTitle} tipLabel={tipLabel} getTipText={getTipText} /> : null}
//     </>
//   );
// }



"use client"

import { JSX, useState, useEffect } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { Question, QuestionOption, Tip, Explanation } from '@/lib/types'
import { OptionList } from './option-list'
import { ExplanationPanel } from './explanation-panel'
import { TipsPanel } from './tips-panel'
import { AssetRenderer } from './asset-renderer'
import { Lightbulb, BookOpenText, Flag, X } from 'lucide-react'
import { useContentLanguageStore } from '@/lib/store'
import api from '@/lib/api/client'
import { getAssetUrl } from '@/lib/utils/asset-url'

interface RevisionQuestionCardProps {
  question: Question
  selectedOptionIds?: number[]
  answerLocked: boolean
  correctOptionIds?: number[]
  explanation?: Explanation
  explanationText: string
  showExplanation: boolean
  tips: Tip[]
  showTips: boolean
  questionText: string
  explanationTitle: string
  tipsTitle: string
  tipLabel: (index: number) => string
  showExplanationLabel: string
  hideExplanationLabel: string
  showTipLabel: string
  hideTipLabel: string
  flagLabel: string
  unflagLabel: string
  onSelectOption: (optionId: number) => void
  onToggleExplanation: () => void
  onToggleTips: () => void
  onFlagToggled?: (isFlagged: boolean) => void
  getOptionLabel: (option: QuestionOption) => string
  getTipText: (tip: Tip) => string
  navigation: () => React.ReactNode
}

export function RevisionQuestionCard({
  question,
  selectedOptionIds,
  answerLocked,
  correctOptionIds,
  explanation,
  explanationText,
  showExplanation,
  tips,
  showTips,
  questionText,
  explanationTitle,
  tipsTitle,
  tipLabel,
  showExplanationLabel,
  hideExplanationLabel,
  showTipLabel,
  hideTipLabel,
  flagLabel,
  unflagLabel,
  onSelectOption,
  onToggleExplanation,
  onToggleTips,
  onFlagToggled,
  getOptionLabel,
  getTipText,
  navigation,
}: RevisionQuestionCardProps) {
  const { language: selectedLanguage, direction } = useContentLanguageStore()
  const [isFlagged, setIsFlagged] = useState(question.isFlagged ?? false)
  const [isFlagging, setIsFlagging] = useState(false)
  const [modalImage, setModalImage] = useState<string | null>(null)

  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden'
      return () => { document.body.style.overflow = '' }
    }
  }, [modalImage])

  // Sync flag state when question changes (e.g., when navigating between questions)
  useEffect(() => {
    setIsFlagged(question.isFlagged ?? false)
  }, [question.id, question.isFlagged])

  // Get question text based on selected language
  const getQuestionText = () => {
    const originalText = questionText
    if (!selectedLanguage || selectedLanguage === '' || !question.translations) {
      return originalText
    }
    const translation = question.translations[selectedLanguage] as Record<string, unknown> | undefined
    if (translation) {
      const translatedText = (translation.question || translation.text) as string | undefined
      if (translatedText) return translatedText
    }
    return originalText
  }

  // Get option text based on selected language
  const getTranslatedOptionLabel = (option: QuestionOption): string => {
    const originalText = getOptionLabel(option)
    if (!selectedLanguage || selectedLanguage === '' || !option.translations) {
      return originalText
    }
    const translation = option.translations[selectedLanguage] as Record<string, unknown> | undefined
    if (translation && typeof translation.text === 'string') {
      return translation.text
    }
    return originalText
  }

  // Get explanation text based on selected language
  const getExplanationText = () => {
    const originalText = explanationText
    if (!selectedLanguage || selectedLanguage === '' || !explanation?.translations) {
      return originalText
    }
    const translation = explanation.translations[selectedLanguage] as Record<string, unknown> | undefined
    if (translation && typeof translation.text === 'string') {
      return translation.text
    }
    return originalText
  }

  const displayQuestionText = getQuestionText()
  const displayExplanationText = getExplanationText()

  // Handle flag toggle
  const handleToggleFlag = async () => {
    if (isFlagging) return

    setIsFlagging(true)
    try {
      if (isFlagged) {
        // Unflag the question
        await api.delete(`/api/v1/flags/${question.id}`)
        setIsFlagged(false)
        onFlagToggled?.(false)
      } else {
        // Flag the question
        await api.post(`/api/v1/flags/${question.id}`)
        setIsFlagged(true)
        onFlagToggled?.(true)
      }
    } catch (error) {
      console.error('Failed to toggle flag:', error)
    } finally {
      setIsFlagging(false)
    }
  }

  return (
    <>
      <div className="space-y-3" dir={direction}>

        {/* ── Question card ── */}
        <div className="rounded-xl border border-border bg-card p-2 sm:p-3 space-y-5">
          {/* Assets (image/video if any) */}
          {question.assets && question.assets.length > 0 && (() => {
            const videoAssets = question.assets!.filter(a => a.contentType?.startsWith('video') || a.type?.toLowerCase().includes('video'))
            const imageAssets = question.assets!.filter(a => !a.contentType?.startsWith('video') && !a.type?.toLowerCase().includes('video'))
            const imageGridClass = imageAssets.length === 1
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3'
            return (
              <div className="space-y-3">
                {videoAssets.map((asset) => {
                  const fullUrl = getAssetUrl(asset.url)
                  return (
                    <div key={`${question.id}-${asset.url}-${asset.order ?? 0}`} className="w-full md:w-3/4">
                      <video controls autoPlay muted playsInline className="w-full rounded-xl border border-border bg-black">
                        <source src={fullUrl} type={asset.contentType ?? 'video/mp4'} />
                      </video>
                    </div>
                  )
                })}
                {imageAssets.length > 0 && (
                  <div className={imageGridClass}>
                    {imageAssets.map((asset) => {
                      const fullUrl = getAssetUrl(asset.url)
                      return (
                        // <div
                        //   key={`${asset.url}-${asset.order ?? 0}`}
                        //   className={`flex flex-col items-center md:items-start space-y-1`}
                        // >
                        //   <img
                        //     src={fullUrl}
                        //     alt={asset.alt ?? 'Asset'}
                        //     className="rounded-xl border border-border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                        //     width={300}
                        //     height={300}
                        //     onClick={() => setModalImage(fullUrl)}
                        //   />
                        //   {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
                        // </div>

                        <div
                          key={`${asset.url}-${asset.order ?? 0}`}
                          className="flex flex-col items-center md:items-start space-y-1"
                        >
                          {/* <Image
                            src={fullUrl}
                            alt={asset.alt ?? "Asset"}
                            width={300}
                            height={300}
                            className="rounded-xl border border-border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setModalImage(fullUrl)}
                          /> */}

                          <Image
                            src={fullUrl}
                            alt={asset.alt ?? "Asset"}
                            // width={200}
                            // height={200}
                            className="max-w-[300px] min-w-[200px] object-contain cursor-pointer"
                            onClick={() => setModalImage(fullUrl)}
                          />
                          {asset.caption && (
                            <p className="text-xs text-muted-foreground">{asset.caption}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })()}

          {/* Question text */}
          <div className="flex items-start gap-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              #{question.id}
            </span>
            <p className="text-base sm:text-lg font-medium leading-relaxed text-[var(--foreground)] flex-1">
              {displayQuestionText}
            </p>
          </div>

          {/* Options */}
          <OptionList
            options={question.options ?? []}
            selectedOptionIds={selectedOptionIds}
            answerLocked={answerLocked}
            correctOptionIds={correctOptionIds}
            onSelectOption={onSelectOption}
            getOptionLabel={getTranslatedOptionLabel}
          />

          {/* Toggle buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={onToggleExplanation}
              className={`
                inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                ${showExplanation
                  ? `
                    bg-[hsl(var(--explanation))]
                    border-[hsl(var(--explanation-border))]
                    text-[hsl(var(--explanation-foreground))]
                  `
                  : `
                    bg-[hsl(var(--background))]
                    border-[hsl(var(--border))]
                    text-[hsl(var(--foreground))]
                    hover:text-[hsl(var(--foreground-hover))]
                    hover:border-[hsl(var(--foreground-hover))]
                  `}
              `}
            >
              <BookOpenText size={13} />
              {showExplanation ? hideExplanationLabel : showExplanationLabel}
            </button>

            {tips.length > 0 && <button
              type="button"
              onClick={onToggleTips}
              className={`
                inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                ${showTips
                  ? `
                    bg-[hsl(var(--tip))]
                    border-[hsl(var(--tip-border))]
                    text-[hsl(var(--tip-foreground))]
                  `
                  : `
                    bg-[hsl(var(--background))]
                    border-[hsl(var(--border))]
                    text-[hsl(var(--foreground))]
                    hover:text-[hsl(var(--foreground-hover))]
                    hover:border-[hsl(var(--foreground-hover))]
                  `}
              `}
            >
              <Lightbulb size={13} />
              {showTips ? hideTipLabel : showTipLabel}
            </button>}

            <button
              type="button"
              onClick={handleToggleFlag}
              disabled={isFlagging}
              className={`
                inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                ${isFlagged
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : `
                    bg-[hsl(var(--background))]
                    border-[hsl(var(--border))]
                    text-[hsl(var(--foreground))]
                    hover:text-[hsl(var(--foreground-hover))]
                    hover:border-[hsl(var(--foreground-hover))]
                  `}
                ${isFlagging ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <Flag size={13} className={isFlagged ? 'fill-current' : ''} />
              {isFlagged ? unflagLabel : flagLabel}
            </button>
            {/* ── Navigation ── */}
            <div className="rp-fade-up" style={{ animationDelay: '0.18s' }}>
              {navigation()}
            </div>
          </div>
        </div>

        {/* ── Explanation panel ── */}
        {showExplanation && (
          <div className="rounded-xl border-1 border-[hsl(var(--explanation-border))] bg-[hsl(var(--explanation))] overflow-hidden
                          shadow-sm">
            <div className="flex items-center justify-between px-2 py-3.5 border-b border-[hsl(var(--explanation-border))]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[hsl(var(--explanation-border))] flex items-center justify-center">
                  <BookOpenText size={14} className="text-[hsl(var(--explanation-foreground))]" />
                </div>
                <span className="text-[11px] font-semibold tracking-wide uppercase text-[hsl(var(--explanation-foreground))]">
                  {explanationTitle}
                </span>
              </div>
            </div>
            <div className="px-4 py-5">
              <ExplanationPanel
                explanation={explanation}
                text={displayExplanationText}
                title={explanationTitle}
              />
            </div>
          </div>
        )}

        {/* ── Tips panel ── */}
        {showTips && tips.length > 0 && (
          <div className="rounded-xl border-1 border-[hsl(var(--tip-border))] bg-[hsl(var(--tip))]/20 overflow-hidden
                          shadow-sm">
            <div className="flex items-center justify-between px-1 py-3.5 border-b border-[hsl(var(--tip-border))]">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[hsl(var(--tip-border))] flex items-center justify-center">
                  <Lightbulb size={14} className="text-[hsl(var(--tip-foreground))]" />
                </div>
                <span className="text-[13px] font-semibold tracking-wide uppercase text-[hsl(var(--tip-foreground))]">
                  {tipsTitle}
                </span>
              </div>
            </div>
            <div className="px-4 py-5">
              <TipsPanel
                tips={tips}
                title={tipsTitle}
                tipLabel={tipLabel}
                getTipText={getTipText}
              />
            </div>
          </div>
        )}

      </div>

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
    </>
  )
}