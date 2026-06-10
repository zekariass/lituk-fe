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

import { Check, CheckCircle2, X, XCircle } from "lucide-react"
import Image from "next/image"
import { QuestionOption } from "@/lib/types"
import { cn } from "@/lib/utils"
import { getAssetUrl } from "@/lib/utils/asset-url"
import { useContentLanguageStore } from "@/lib/store"

interface OptionListProps {
  options: QuestionOption[]
  selectedOptionIds?: number[]
  answerLocked: boolean
  correctOptionIds?: number[]
  onSelectOption: (optionId: number) => void
  getOptionLabel: (option: QuestionOption) => string
}

export function OptionList({
  options,
  selectedOptionIds,
  answerLocked,
  correctOptionIds,
  onSelectOption,
  getOptionLabel,
}: OptionListProps) {
  const { direction } = useContentLanguageStore()
  const selectedIds = selectedOptionIds ?? []
  const correctIds = correctOptionIds ?? []
  const resolvedCorrectIdSet = (() => {
    if (correctIds.length > 0) return new Set(correctIds)
    const inferred = options.filter((opt) => opt.isCorrect).map((opt) => opt.id)
    return new Set(inferred)
  })()

  const totalCorrectCount    = resolvedCorrectIdSet.size
  const selectedCorrectCount = selectedIds.filter((id) => resolvedCorrectIdSet.has(id)).length
  const hasAllCorrectSelected = totalCorrectCount > 0 && selectedCorrectCount >= totalCorrectCount
  const hasSingleCorrect = totalCorrectCount === 1
  const allOptionsHaveAssets = options.length > 0 && options.every((opt) => opt.asset?.url)
  const isGridLayout = allOptionsHaveAssets

  return (
    <div className={cn(
      isGridLayout ? "grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-2 max-w-lg sm:max-w-xl" : "space-y-2"
    )}>
      {options.map((option) => {
        const isSelected    = selectedIds.includes(option.id)
        const isInCorrectSet = resolvedCorrectIdSet.has(option.id)
        const knowsCorrectness = resolvedCorrectIdSet.size > 0 || typeof option.isCorrect === "boolean"

        const shouldRevealCorrectOnSingle = hasSingleCorrect && selectedIds.length > 0 && !answerLocked

        // Immediate feedback before answerLocked
        const isSelectedCorrect   = isSelected && !answerLocked && knowsCorrectness && isInCorrectSet
        const isSelectedIncorrect = isSelected && !answerLocked && knowsCorrectness && !isInCorrectSet

        // Locked states (post-submit)
        const isCorrectLocked   = answerLocked && isInCorrectSet
        const isIncorrectLocked = answerLocked && isSelected && !isInCorrectSet

        // Combined
        const showAsCorrect        = isSelectedCorrect || isCorrectLocked || (shouldRevealCorrectOnSingle && isInCorrectSet)
        const showAsIncorrect      = isSelectedIncorrect || isIncorrectLocked
        const showNeutralSelected  = !answerLocked && isSelected && !showAsCorrect && !showAsIncorrect

        const isOptionIndividuallyDisabled = !hasAllCorrectSelected
          && totalCorrectCount > 1
          && isSelected
          && isInCorrectSet

        const shouldDisableAfterSingleSelection = hasSingleCorrect && selectedIds.length > 0

        const isDisabled = answerLocked || hasAllCorrectSelected || isOptionIndividuallyDisabled || shouldDisableAfterSingleSelection

        // ── Derived style tokens ────────────────────────────────────────────
        const buttonCls = cn(
          // Base
          "w-full rounded-xl border text-start transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300/40",
          // Padding varies by layout
          isGridLayout ? "p-3" : "p-4",
          // State colours
          showAsCorrect
            ? "border-emerald-400/50 bg-green-500/[0.20] hover:bg-green-500/[0.25]"
            : showAsIncorrect
            ? "border-red-400/50 bg-red-400/[0.20] hover:bg-red-400/[0.25]"
            : showNeutralSelected
            ? "border-emerald-300/40 bg-green-500/[0.20]"
            : answerLocked
            ? "border-border bg-[var(--background)] opacity-60 cursor-default"
            : "border-border bg-[var(--background)] hover:border-emerald-300 hover:bg-emerald-300/[0.15]"
        )

        const indicatorCls = cn(
          "flex h-5 w-5 items-center justify-center rounded-md border-2 shrink-0 transition-colors duration-200",
          showAsCorrect
            ? "border-emerald-400 bg-green-500/20"
            : showAsIncorrect
            ? "border-red-400 bg-red-400/20"
            : showNeutralSelected
            ? "border-emerald-300 bg-green-500/10"
            : "border-border bg-transparent"
        )

        const labelCls = cn(
          "font-medium leading-snug transition-colors duration-200",
          isGridLayout ? "text-xs text-center mt-2" : "text-sm flex-1",
          showAsCorrect   ? "text-white fw-bold"   :
          showAsIncorrect ? "text-white fw-bold"        :
          showNeutralSelected ? "text-[var(--foreground)]" :
          "text-[var(--foreground)]"
        )

        return (
          <button
            key={option.id}
            type="button"
            disabled={isDisabled}
            onClick={() => onSelectOption(option.id)}
            role="checkbox"
            aria-checked={isSelected}
            className={buttonCls}
          >
            {isGridLayout ? (
              // ── Grid layout (image-only) ─────────────────────────────────
              <div className="flex flex-col items-center gap-0">
                {/* Status indicator top-right */}
                <div className="w-full flex justify-end mb-1.5">
                  <div className={indicatorCls}>
                    {showAsCorrect      && <Check size={11} className="text-emerald-400" />}
                    {showAsIncorrect    && <X     size={11} className="text-red-400"     />}
                    {showNeutralSelected && <Check size={11} className="text-emerald-300" />}
                  </div>
                </div>

                {option.asset?.url && (
                  <div className="relative w-full aspect-square rounded-lg overflow-hidden
                                  bg-[var(--background)]">
                    <Image
                      src={getAssetUrl(option.asset.url)}
                      alt={getOptionLabel(option) || `Option ${option.id}`}
                      fill
                      className="object-scale-down"
                      sizes="(max-width: 640px) 160px, 200px"
                    />
                  </div>
                )}

                {getOptionLabel(option) && (
                  <span className={labelCls} dir={direction}>{getOptionLabel(option)}</span>
                )}
              </div>
            ) : (
              // ── List layout ──────────────────────────────────────────────
              // dir={direction} on the flex container flips the visual order
              // (indicator on right, status icon on left for RTL) and ensures
              // the label text renders in the correct direction via inheritance.
              <div className="flex items-center gap-3" dir={direction}>
                {/* Indicator */}
                <div className={indicatorCls}>
                  {showAsCorrect      && <Check size={11} className="text-emerald-400" />}
                  {showAsIncorrect    && <X     size={11} className="text-red-400"     />}
                  {showNeutralSelected && <Check size={11} className="text-emerald-300" />}
                </div>

                {/* Image (if present) */}
                {option.asset?.url && (
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-lg
                                  overflow-hidden bg-[var(--background)] border border-border">
                    <Image
                      src={getAssetUrl(option.asset.url)}
                      alt={getOptionLabel(option) || "Option image"}
                      fill
                      className="object-scale-down"
                      sizes="(max-width: 640px) 64px, 80px"
                    />
                  </div>
                )}

                {/* Label — dir inherited from parent, no need to repeat */}
                {getOptionLabel(option) && (
                  <span className={labelCls}>{getOptionLabel(option)}</span>
                )}

                {/* Trailing status icon — ms-auto respects RTL (logical margin) */}
                <div className="ms-auto shrink-0">
                  {showAsCorrect   && <CheckCircle2 size={17} className="text-emerald-400" />}
                  {showAsIncorrect && <XCircle      size={17} className="text-red-400"     />}
                </div>
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}