// "use client";

// import { Check, CheckCircle, X, XCircle } from "lucide-react";
// import Image from "next/image";
// import { QuestionOption } from "@/lib/types";
// import { cn } from "@/lib/utils";
// import { getAssetUrl } from "@/lib/utils/asset-url";

// interface OptionListProps {
//   options: QuestionOption[];
//   selectedOptionId?: number;
//   answerLocked: boolean;
//   correctOptionId?: number;
//   onSelectOption: (optionId: number) => void;
//   getOptionLabel: (option: QuestionOption) => string;
// }

// export function OptionList({
//   options,
//   selectedOptionId,
//   answerLocked,
//   correctOptionId,
//   onSelectOption,
//   getOptionLabel,
// }: OptionListProps) {
//   const selectedOption = options.find(
//     (candidate) => candidate.id === selectedOptionId
//   );

//   // Check if all options have assets (image-only mode)
//   const allOptionsHaveAssets = options.length > 0 && options.every(opt => opt.asset?.url);
//   const isGridLayout = allOptionsHaveAssets;

//   return (
//     <div className={cn(
//       isGridLayout 
//         ? "grid grid-cols-2 gap-3" 
//         : "space-y-3"
//     )}>
//       {options.map((option) => {
//         const isSelected = option.id === selectedOptionId;
//         const selectedOption = options.find((opt) => opt.id === selectedOptionId);

//         // Immediate feedback: check option.isCorrect when selected (before answerLocked)
//         const canShowImmediateFeedback = isSelected && typeof option.isCorrect === 'boolean';
//         const isSelectedCorrect = canShowImmediateFeedback && option.isCorrect === true;
//         const isSelectedIncorrect = canShowImmediateFeedback && option.isCorrect === false;

//         // Reveal correct option when user selects wrong option
//         const shouldRevealCorrect = 
//           !answerLocked && 
//           selectedOption && 
//           typeof selectedOption.isCorrect === 'boolean' && 
//           selectedOption.isCorrect === false && 
//           option.isCorrect === true;

//         // Locked answer feedback (after submit)
//         const isCorrectLocked = answerLocked && option.id === correctOptionId;
//         const isIncorrectLocked = answerLocked && isSelected && option.id !== correctOptionId;

//         // Combined states
//         const showAsCorrect = isSelectedCorrect || shouldRevealCorrect || isCorrectLocked;
//         const showAsIncorrect = isSelectedIncorrect || isIncorrectLocked;
//         const showNeutralSelected = !answerLocked && isSelected && !showAsCorrect && !showAsIncorrect;

//         return (
//           <button
//             key={option.id}
//             type="button"
//             disabled={answerLocked}
//             onClick={() => onSelectOption(option.id)}
//             className={cn(
//               "w-full rounded-lg border-1 bg-background hover:bg-blue-500/10 p-4 text-left transition-colors cursor-pointer",
//               // "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
//               showAsCorrect && "border-green-600 bg-green-500/10 border-3",
//               showAsIncorrect && "border-red-600 bg-red-500/10 border-3",
//               showNeutralSelected && "border-primary",
//               !isSelected && !answerLocked && "hover:border-primary"
//             )}
//           >
//             <div className="flex items-center gap-3">
//               {/* Left indicator */}
//               <div
//                 className={cn(
//                   "flex h-5 w-5 items-center justify-center rounded border-2 bg-background flex-shrink-0",
//                   showAsCorrect && "border-green-600",
//                   showAsIncorrect && "border-red-600",
//                   showNeutralSelected && "border-primary",
//                   !isSelected && !showAsCorrect && !showAsIncorrect && "border-border"
//                 )}
//               >
//                 {showAsCorrect && (
//                   <Check className="h-3.5 w-3.5 text-green-600" />
//                 )}
//                 {showAsIncorrect && (
//                   <X className="h-3.5 w-3.5 text-red-600" />
//                 )}
//                 {showNeutralSelected && (
//                   <Check className="h-3.5 w-3.5 text-primary" />
//                 )}
//               </div>

//               {/* Option content: image first, then text */}
//               {isGridLayout ? (
//                 // Grid layout: Image-only mode with responsive sizing
//                 <div className="flex flex-col items-center justify-center flex-1 p-2">
//                   {option.asset?.url && (
//                     <div className="relative w-full aspect-square rounded overflow-hidden bg-muted max-w-[200px] sm:max-w-[160px]">
//                       <Image
//                         src={getAssetUrl(option.asset.url)}
//                         alt={getOptionLabel(option) || `Option ${option.id}`}
//                         fill
//                         className="object-cover"
//                         sizes="(max-width: 640px) 200px, 160px"
//                       />
//                     </div>
//                   )}
//                   {getOptionLabel(option) && (
//                     <span className="mt-2 text-sm font-medium text-center">
//                       {getOptionLabel(option)}
//                     </span>
//                   )}
//                 </div>
//               ) : (
//                 // List layout: Image on left, text on right
//                 <div className="flex items-center gap-3 flex-1">
//                   {option.asset?.url && (
//                     <div className="relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
//                       <Image
//                         src={getAssetUrl(option.asset.url)}
//                         alt={getOptionLabel(option) || "Option image"}
//                         fill
//                         className="object-cover"
//                         sizes="(max-width: 640px) 80px, 96px"
//                       />
//                     </div>
//                   )}
//                   {getOptionLabel(option) && (
//                     <span className="flex-1 font-medium">
//                       {getOptionLabel(option)}
//                     </span>
//                   )}
//                 </div>
//               )}

//               {showAsCorrect && (
//                 <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
//               )}
//               {showAsIncorrect && (
//                 <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
//               )}
//             </div>
//           </button>
//         );
//       })}
//     </div>
//   );
// }


// "use client"

// import { Check, CheckCircle2, X, XCircle } from "lucide-react"
// import Image from "next/image"
// import { QuestionOption } from "@/lib/types"
// import { cn } from "@/lib/utils"
// import { getAssetUrl } from "@/lib/utils/asset-url"

// interface OptionListProps {
//   options: QuestionOption[]
//   selectedOptionId?: number
//   answerLocked: boolean
//   correctOptionId?: number
//   onSelectOption: (optionId: number) => void
//   getOptionLabel: (option: QuestionOption) => string
// }

// export function OptionList({
//   options,
//   selectedOptionId,
//   answerLocked,
//   correctOptionId,
//   onSelectOption,
//   getOptionLabel,
// }: OptionListProps) {
//   const allOptionsHaveAssets = options.length > 0 && options.every((opt) => opt.asset?.url)
//   const isGridLayout = allOptionsHaveAssets

//   return (
//     <div className={cn(
//       isGridLayout ? "grid grid-cols-2 gap-2.5" : "space-y-2"
//     )}>
//       {options.map((option) => {
//         const isSelected    = option.id === selectedOptionId
//         const selectedOption = options.find((opt) => opt.id === selectedOptionId)

//         // Immediate feedback before answerLocked
//         const canShowImmediateFeedback = isSelected && typeof option.isCorrect === "boolean"
//         const isSelectedCorrect        = canShowImmediateFeedback && option.isCorrect === true
//         const isSelectedIncorrect      = canShowImmediateFeedback && option.isCorrect === false

//         // Reveal correct when user picks wrong
//         const shouldRevealCorrect =
//           !answerLocked &&
//           selectedOption &&
//           typeof selectedOption.isCorrect === "boolean" &&
//           selectedOption.isCorrect === false &&
//           option.isCorrect === true

//         // Locked states (post-submit)
//         const isCorrectLocked   = answerLocked && option.id === correctOptionId
//         const isIncorrectLocked = answerLocked && isSelected && option.id !== correctOptionId

//         // Combined
//         const showAsCorrect        = isSelectedCorrect || shouldRevealCorrect || isCorrectLocked
//         const showAsIncorrect      = isSelectedIncorrect || isIncorrectLocked
//         const showNeutralSelected  = !answerLocked && isSelected && !showAsCorrect && !showAsIncorrect

//         // ── Derived style tokens ────────────────────────────────────────────
//         const buttonCls = cn(
//           // Base
//           "w-full rounded-xl border text-left transition-all duration-200 cursor-pointer",
//           "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40",
//           // Padding varies by layout
//           isGridLayout ? "p-3" : "p-4",
//           // State colours
//           showAsCorrect
//             ? "border-emerald-400/50 bg-emerald-300/[0.08] hover:bg-emerald-300/[0.10]"
//             : showAsIncorrect
//             ? "border-red-400/50 bg-red-400/[0.08] hover:bg-red-400/[0.10]"
//             : showNeutralSelected
//             ? "border-emerald-300/40 bg-emerald-300/[0.06]"
//             : answerLocked
//             ? "border-white/[0.07] bg-white/[0.02] opacity-60 cursor-default"
//             : "border-white/[0.09] bg-white/[0.03] hover:border-emerald-300/30 hover:bg-emerald-300/[0.04]"
//         )

//         const indicatorCls = cn(
//           "flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0 transition-colors duration-200",
//           showAsCorrect
//             ? "border-emerald-400 bg-emerald-400/20"
//             : showAsIncorrect
//             ? "border-red-400 bg-red-400/20"
//             : showNeutralSelected
//             ? "border-emerald-300 bg-emerald-300/10"
//             : "border-white/20 bg-transparent"
//         )

//         const labelCls = cn(
//           "font-medium leading-snug transition-colors duration-200",
//           isGridLayout ? "text-xs text-center mt-2" : "text-sm flex-1",
//           showAsCorrect   ? "text-emerald-300"   :
//           showAsIncorrect ? "text-red-400"        :
//           showNeutralSelected ? "text-[#f0f0f5]" :
//           "text-white/70"
//         )

//         return (
//           <button
//             key={option.id}
//             type="button"
//             disabled={answerLocked}
//             onClick={() => onSelectOption(option.id)}
//             className={buttonCls}
//           >
//             {isGridLayout ? (
//               // ── Grid layout (image-only) ─────────────────────────────────
//               <div className="flex flex-col items-center gap-0">
//                 {/* Status indicator top-right */}
//                 <div className="w-full flex justify-end mb-1.5">
//                   <div className={indicatorCls}>
//                     {showAsCorrect      && <Check size={11} className="text-emerald-400" />}
//                     {showAsIncorrect    && <X     size={11} className="text-red-400"     />}
//                     {showNeutralSelected && <Check size={11} className="text-emerald-300" />}
//                   </div>
//                 </div>

//                 {option.asset?.url && (
//                   <div className="relative w-full aspect-square rounded-lg overflow-hidden
//                                   bg-white/[0.04] border border-white/[0.06]">
//                     <Image
//                       src={getAssetUrl(option.asset.url)}
//                       alt={getOptionLabel(option) || `Option ${option.id}`}
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 640px) 160px, 200px"
//                     />
//                   </div>
//                 )}

//                 {getOptionLabel(option) && (
//                   <span className={labelCls}>{getOptionLabel(option)}</span>
//                 )}
//               </div>
//             ) : (
//               // ── List layout ──────────────────────────────────────────────
//               <div className="flex items-center gap-3">
//                 {/* Indicator */}
//                 <div className={indicatorCls}>
//                   {showAsCorrect      && <Check size={11} className="text-emerald-400" />}
//                   {showAsIncorrect    && <X     size={11} className="text-red-400"     />}
//                   {showNeutralSelected && <Check size={11} className="text-emerald-300" />}
//                 </div>

//                 {/* Image (if present) */}
//                 {option.asset?.url && (
//                   <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg
//                                   overflow-hidden bg-white/[0.04] border border-white/[0.06]">
//                     <Image
//                       src={getAssetUrl(option.asset.url)}
//                       alt={getOptionLabel(option) || "Option image"}
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 640px) 64px, 80px"
//                     />
//                   </div>
//                 )}

//                 {/* Label */}
//                 {getOptionLabel(option) && (
//                   <span className={labelCls}>{getOptionLabel(option)}</span>
//                 )}

//                 {/* Trailing status icon */}
//                 <div className="ml-auto shrink-0">
//                   {showAsCorrect   && <CheckCircle2 size={17} className="text-emerald-400" />}
//                   {showAsIncorrect && <XCircle      size={17} className="text-red-400"     />}
//                 </div>
//               </div>
//             )}
//           </button>
//         )
//       })}
//     </div>
//   )
// }




// "use client"

// import { Check, CheckCircle2, X, XCircle } from "lucide-react"
// import Image from "next/image"
// import { QuestionOption } from "@/lib/types"
// import { cn } from "@/lib/utils"
// import { getAssetUrl } from "@/lib/utils/asset-url"
// import { useContentLanguageStore } from "@/lib/store"

// interface OptionListProps {
//   options: QuestionOption[]
//   selectedOptionId?: number
//   answerLocked: boolean
//   correctOptionId?: number
//   onSelectOption: (optionId: number) => void
//   getOptionLabel: (option: QuestionOption) => string
// }

// export function OptionList({
//   options,
//   selectedOptionId,
//   answerLocked,
//   correctOptionId,
//   onSelectOption,
//   getOptionLabel,
// }: OptionListProps) {
//   const { direction } = useContentLanguageStore()
//   const allOptionsHaveAssets = options.length > 0 && options.every((opt) => opt.asset?.url)
//   const isGridLayout = allOptionsHaveAssets

//   return (
//     <div className={cn(
//       isGridLayout ? "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-2 max-w-lg sm:max-w-xl" : "space-y-2"
//     )}>
//       {options.map((option) => {
//         const isSelected    = option.id === selectedOptionId
//         const selectedOption = options.find((opt) => opt.id === selectedOptionId)

//         // Immediate feedback before answerLocked
//         const canShowImmediateFeedback = isSelected && typeof option.isCorrect === "boolean"
//         const isSelectedCorrect        = canShowImmediateFeedback && option.isCorrect === true
//         const isSelectedIncorrect      = canShowImmediateFeedback && option.isCorrect === false

//         // Reveal correct when user picks wrong
//         const shouldRevealCorrect =
//           !answerLocked &&
//           selectedOption &&
//           typeof selectedOption.isCorrect === "boolean" &&
//           selectedOption.isCorrect === false &&
//           option.isCorrect === true

//         // Locked states (post-submit)
//         const isCorrectLocked   = answerLocked && option.id === correctOptionId
//         const isIncorrectLocked = answerLocked && isSelected && option.id !== correctOptionId

//         // Combined
//         const showAsCorrect        = isSelectedCorrect || shouldRevealCorrect || isCorrectLocked
//         const showAsIncorrect      = isSelectedIncorrect || isIncorrectLocked
//         const showNeutralSelected  = !answerLocked && isSelected && !showAsCorrect && !showAsIncorrect

//         // ── Derived style tokens ────────────────────────────────────────────
//         const buttonCls = cn(
//           // Base
//           "w-full rounded-xl border text-start transition-all duration-200 cursor-pointer",
//           "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40",
//           // Padding varies by layout
//           isGridLayout ? "p-3" : "p-4",
//           // State colours
//           showAsCorrect
//             ? "border-emerald-400/50 bg-green-500/[0.08] hover:bg-green-500/[0.10]"
//             : showAsIncorrect
//             ? "border-red-400/50 bg-red-400/[0.08] hover:bg-red-400/[0.10]"
//             : showNeutralSelected
//             ? "border-emerald-300/40 bg-green-500/[0.06]"
//             : answerLocked
//             ? "border-border bg-[var(--background)] opacity-60 cursor-default"
//             : "border-border bg-[var(--background)] hover:border-emerald-300 hover:bg-emerald-300/[0.15]"
//         )

//         const indicatorCls = cn(
//           "flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0 transition-colors duration-200",
//           showAsCorrect
//             ? "border-emerald-400 bg-green-500/20"
//             : showAsIncorrect
//             ? "border-red-400 bg-red-400/20"
//             : showNeutralSelected
//             ? "border-emerald-300 bg-green-500/10"
//             : "border-border bg-transparent"
//         )

//         const labelCls = cn(
//           "font-medium leading-snug transition-colors duration-200",
//           isGridLayout ? "text-xs text-center mt-2" : "text-sm flex-1",
//           showAsCorrect   ? "text-emerald-300"   :
//           showAsIncorrect ? "text-red-400"        :
//           showNeutralSelected ? "text-[var(--foreground)]" :
//           "text-[var(--foreground)]"
//         )

//         return (
//           <button
//             key={option.id}
//             type="button"
//             disabled={answerLocked}
//             onClick={() => onSelectOption(option.id)}
//             className={buttonCls}
//           >
//             {isGridLayout ? (
//               // ── Grid layout (image-only) ─────────────────────────────────
//               <div className="flex flex-col items-center gap-0">
//                 {/* Status indicator top-right */}
//                 <div className="w-full flex justify-end mb-1.5">
//                   <div className={indicatorCls}>
//                     {showAsCorrect      && <Check size={11} className="text-emerald-400" />}
//                     {showAsIncorrect    && <X     size={11} className="text-red-400"     />}
//                     {showNeutralSelected && <Check size={11} className="text-emerald-300" />}
//                   </div>
//                 </div>

//                 {option.asset?.url && (
//                   <div className="relative w-full aspect-square rounded-lg overflow-hidden
//                                   bg-[var(--background)] border border-border">
//                     <Image
//                       src={getAssetUrl(option.asset.url)}
//                       alt={getOptionLabel(option) || `Option ${option.id}`}
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 640px) 160px, 200px"
//                     />
//                   </div>
//                 )}

//                 {getOptionLabel(option) && (
//                   <span className={labelCls} dir={direction}>{getOptionLabel(option)}</span>
//                 )}
//               </div>
//             ) : (
//               // ── List layout ──────────────────────────────────────────────
//               <div className="flex items-center gap-3">
//                 {/* Indicator */}
//                 <div className={indicatorCls}>
//                   {showAsCorrect      && <Check size={11} className="text-emerald-400" />}
//                   {showAsIncorrect    && <X     size={11} className="text-red-400"     />}
//                   {showNeutralSelected && <Check size={11} className="text-emerald-300" />}
//                 </div>

//                 {/* Image (if present) */}
//                 {option.asset?.url && (
//                   <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg
//                                   overflow-hidden bg-[var(--background)] border border-border">
//                     <Image
//                       src={getAssetUrl(option.asset.url)}
//                       alt={getOptionLabel(option) || "Option image"}
//                       fill
//                       className="object-cover"
//                       sizes="(max-width: 640px) 64px, 80px"
//                     />
//                   </div>
//                 )}

//                 {/* Label */}
//                 {getOptionLabel(option) && (
//                   <span className={labelCls} dir={direction}>{getOptionLabel(option)}</span>
//                 )}

//                 {/* Trailing status icon */}
//                 <div className="ml-auto shrink-0">
//                   {showAsCorrect   && <CheckCircle2 size={17} className="text-emerald-400" />}
//                   {showAsIncorrect && <XCircle      size={17} className="text-red-400"     />}
//                 </div>
//               </div>
//             )}
//           </button>
//         )
//       })}
//     </div>
//   )
// }


"use client"

import { type ReactNode } from "react"
import { Check, CheckCircle2, X, XCircle } from "lucide-react"
import Image from "next/image"
import { QuestionOption } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getAssetUrl } from "@/lib/utils/asset-url"
import { useContentLanguageStore } from "@/lib/store"

type OptionState = "default" | "selected" | "correct" | "incorrect" | "revealCorrect"

interface OptionListProps {
  options: QuestionOption[]
  selectedOptionIds?: number[]
  answerLocked: boolean
  correctOptionIds?: number[]
  onSelectOption: (optionId: number) => void
  getOptionLabel: (option: QuestionOption) => ReactNode
  getOptionAltText?: (option: QuestionOption) => string
}

export function OptionList({
  options,
  selectedOptionIds,
  answerLocked,
  correctOptionIds,
  onSelectOption,
  getOptionLabel,
  getOptionAltText,
}: OptionListProps) {
  const { direction } = useContentLanguageStore()
  const selectedIds = selectedOptionIds ?? []

  const resolvedCorrectIdSet = (() => {
    if (correctOptionIds && correctOptionIds.length > 0) return new Set(correctOptionIds)
    const inferred = options.filter((opt) => opt.isCorrect).map((opt) => opt.id)
    return new Set(inferred)
  })()

  const getState = (optionId: number): OptionState => {
    if (!selectedIds.length) return "default"
    if (answerLocked) {
      const isSelected = selectedIds.includes(optionId)
      const isCorrect = resolvedCorrectIdSet.has(optionId)
      if (isSelected && isCorrect) return "correct"
      if (isSelected && !isCorrect) return "incorrect"
      if (!isSelected && isCorrect) return "revealCorrect"
      return isSelected ? "selected" : "default"
    }
    return selectedIds.includes(optionId) ? "selected" : "default"
  }

  const hasImageOption = options.some((opt) => opt.asset?.url)
  const isGridLayout = hasImageOption

  const stateStyles: Record<OptionState, { border: string; bg: string; text: string; indicatorBorder: string; indicatorBg: string }> = {
    default: {
      border: "border-[#D1D5DB]",
      bg: "bg-[#F9FAFB]",
      text: "text-[#1F2937]",
      indicatorBorder: "border-[#D1D5DB]",
      indicatorBg: "bg-transparent",
    },
    selected: {
      border: "border-[#1B6B4A]",
      bg: "bg-[rgba(27,107,74,0.1)]",
      text: "text-[#1B6B4A]",
      indicatorBorder: "border-[#1B6B4A]",
      indicatorBg: "bg-[rgba(27,107,74,0.1)]",
    },
    correct: {
      border: "border-[#22C55E]",
      bg: "bg-[rgba(34,197,94,0.1)]",
      text: "text-[#15d85c]",
      indicatorBorder: "border-[#22C55E]",
      indicatorBg: "bg-[rgba(34,197,94,0.1)]",
    },
    incorrect: {
      border: "border-[#EF4444]",
      bg: "bg-[rgba(239,68,68,0.1)]",
      text: "text-[#dc1c1c]",
      indicatorBorder: "border-[#EF4444]",
      indicatorBg: "bg-[rgba(239,68,68,0.1)]",
    },
    revealCorrect: {
      border: "border-[#22C55E]",
      bg: "bg-[rgba(34,197,94,0.05)]",
      text: "text-[#15d85c]",
      indicatorBorder: "border-[#22C55E]",
      indicatorBg: "bg-[rgba(34,197,94,0.05)]",
    },
  }

  return (
    <div className={cn(
      isGridLayout ? "grid grid-cols-2 gap-3" : "space-y-2"
    )}>
      {options.map((option, index) => {
        const state = getState(option.id)
        const isSelected = selectedIds.includes(option.id)
        const styles = stateStyles[state]
        const optionLabel = getOptionLabel(option)
        const optionAltText = getOptionAltText?.(option)
          ?? (typeof optionLabel === 'string' ? optionLabel : `Option ${option.id}`)
        const letter = String.fromCharCode(65 + index)

        const buttonCls = cn(
          "w-full rounded-xl border text-start transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40",
          isGridLayout ? "p-3" : "p-4",
          styles.border,
          styles.bg,
          styles.text,
          answerLocked
            ? "cursor-default opacity-90"
            : "cursor-pointer hover:opacity-90",
          "disabled:cursor-not-allowed disabled:opacity-60"
        )

        const indicatorCls = cn(
          "flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0 transition-colors duration-200",
          styles.indicatorBorder,
          styles.indicatorBg
        )

        const labelCls = cn(
          "font-medium leading-snug transition-colors duration-200",
          isGridLayout ? "text-xs text-center mt-2" : "text-sm flex-1",
          styles.text
        )

        return (
          <button
            key={option.id}
            type="button"
            disabled={answerLocked}
            onClick={() => onSelectOption(option.id)}
            role="checkbox"
            aria-checked={isSelected}
            className={buttonCls}
          >
            {isGridLayout ? (
              <div className="flex flex-col items-center gap-0">
                <div className="w-full flex justify-end mb-1.5">
                  <div className={indicatorCls}>
                    {(state === "selected" || state === "correct" || state === "revealCorrect") && (
                      <Check size={11} className={styles.text} />
                    )}
                    {state === "incorrect" && (
                      <X size={11} className={styles.text} />
                    )}
                  </div>
                </div>

                {option.asset?.url && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-[var(--background)]">
                    <Image
                      src={getAssetUrl(option.asset.url)}
                      alt={optionAltText}
                      fill
                      className="object-scale-down"
                      sizes="(max-width: 640px) 160px, 200px"
                    />
                  </div>
                )}

                {optionLabel && (
                  <span className={labelCls} dir={direction}>
                    <span className="font-bold me-1">{letter}.</span>
                    {optionLabel}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-3" dir={direction}>
                <div className={indicatorCls}>
                  {(state === "selected" || state === "correct" || state === "revealCorrect") && (
                    <Check size={11} className={styles.text} />
                  )}
                  {state === "incorrect" && (
                    <X size={11} className={styles.text} />
                  )}
                </div>

                {option.asset?.url && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg overflow-hidden bg-[var(--background)] border border-border">
                    <Image
                      src={getAssetUrl(option.asset.url)}
                      alt={optionAltText}
                      fill
                      className="object-scale-down"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  </div>
                )}

                {optionLabel && (
                  <span className={labelCls}>
                    <span className="font-bold me-1">{letter}.</span>
                    {optionLabel}
                  </span>
                )}

                <div className="ms-auto shrink-0">
                  {(state === "correct" || state === "revealCorrect") && (
                    <CheckCircle2 size={17} className="text-[#22C55E]" />
                  )}
                  {state === "incorrect" && (
                    <XCircle size={17} className="text-[#EF4444]" />
                  )}
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}