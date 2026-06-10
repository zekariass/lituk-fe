// "use client"

// import { useState } from 'react';
// import Image from 'next/image';
// import { Question, QuestionOption } from '@/lib/types';
// import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
// import { cn } from '@/lib/utils';

// interface QuestionCardProps {
//   question: Question;
//   selectedOptionId?: number;
//   showFeedback?: boolean;
//   correctOptionId?: number;
//   onSelectOption: (optionId: number) => void;
//   disabled?: boolean;
// }

// export function QuestionCard({
//   question,
//   selectedOptionId,
//   showFeedback,
//   correctOptionId,
//   onSelectOption,
//   disabled = false,
// }: QuestionCardProps) {
//   const getOptionStatus = (option: QuestionOption) => {
//     if (!showFeedback) return 'default';
//     if (option.id === correctOptionId) return 'correct';
//     if (option.id === selectedOptionId && option.id !== correctOptionId) return 'incorrect';
//     return 'default';
//   };

//   return (
//     <div className="space-y-6">
//       <div className="rounded-lg border bg-card p-6">
//         <div className="prose prose-sm dark:prose-invert max-w-none">
//           <p className="text-lg font-medium leading-relaxed">{question.text}</p>
//         </div>

//         {question.imageUrl && (
//           <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden bg-accent">
//             <Image
//               src={question.imageUrl}
//               alt="Question illustration"
//               fill
//               className="object-contain"
//             />
//           </div>
//         )}
//       </div>

//       <div className="space-y-3">
//         {question.options?.map((option) => {
//           const status = getOptionStatus(option);
//           const isSelected = option.id === selectedOptionId;

//           return (
//             <button
//               key={option.id}
//               onClick={() => !disabled && onSelectOption(option.id)}
//               disabled={disabled}
//               className={cn(
//                 "w-full text-left p-4 rounded-lg border-2 transition-all bg-background",
//                 "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
//                 status === 'default' && !isSelected && "border-border hover:border-primary",
//                 status === 'default' && isSelected && "border-primary",
//                 status === 'correct' && "border-success",
//                 status === 'incorrect' && "border-destructive",
//                 disabled && "cursor-not-allowed opacity-75"
//               )}
//             >
//               <div className="flex items-start gap-3">
//                 <div className={cn(
//                   "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
//                   status === 'default' && !isSelected && "border-border",
//                   status === 'default' && isSelected && "border-primary bg-primary",
//                   status === 'correct' && "border-success",
//                   status === 'incorrect' && "border-destructive "
//                 )}>
//                   {status === 'correct' && <CheckCircle className="h-4 w-4 text-white" />}
//                   {status === 'incorrect' && <XCircle className="h-4 w-4 text-white" />}
//                   {status === 'default' && isSelected && (
//                     <div className="w-2 h-2 rounded-full bg-white" />
//                   )}
//                 </div>
//                 <span className="flex-1 font-medium">{option.text}</span>
//               </div>
//             </button>
//           );
//         })}
//       </div>

//       {showFeedback && question.explanation && (
//         <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
//             <div>
//               <h4 className="font-semibold mb-1">Explanation</h4>
//               <p className="text-sm text-muted-foreground">{question.explanation.text}</p>
//             </div>
//           </div>
//         </div>
//       )}

//       {showFeedback && question.tip && (
//         <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
//           <div className="flex items-start gap-3">
//             <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
//             <div>
//               <h4 className="font-semibold mb-1">Tip</h4>
//               <p className="text-sm text-muted-foreground">{question.tip.text}</p>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



"use client"

import Image from "next/image"
import { Question, QuestionOption } from "@/lib/types"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface QuestionCardProps {
  question: Question
  selectedOptionIds?: number[]
  showFeedback?: boolean
  correctOptionIds?: number[]
  onSelectOption: (optionId: number) => void
  disabled?: boolean
}

export function QuestionCard({
  question,
  selectedOptionIds,
  showFeedback = false,
  correctOptionIds,
  onSelectOption,
  disabled = false,
}: QuestionCardProps) {
  const selectedIds = selectedOptionIds ?? []
  const correctIds = correctOptionIds ?? []

  const getOptionStatus = (option: QuestionOption) => {
    if (!showFeedback) return "default"
    if (correctIds.includes(option.id)) return "correct"
    if (selectedIds.includes(option.id)) return "incorrect"
    return "default"
  }

  return (
    <div className="space-y-6">
      {/* Question Card */}
      <div className="rounded-lg border bg-card p-6">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <p className="text-lg font-medium leading-relaxed">
            {question.text}
          </p>
        </div>

        {question.imageUrl && (
          <div className="mt-4 relative w-full h-64 rounded-lg overflow-hidden bg-accent">
            <Image
              src={question.imageUrl}
              alt="Question illustration"
              fill
              className="object-contain"
            />
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options?.map((option) => {
          const status = getOptionStatus(option)
          const isSelected = selectedIds.includes(option.id)

          return (
            <button
              key={option.id}
              onClick={() => !disabled && onSelectOption(option.id)}
              disabled={disabled}
              className={cn(
                "w-full text-left p-4 rounded-lg border-2 transition-all bg-background",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "hover:border-primary",
                !showFeedback && isSelected && "border-primary",
                showFeedback && status === "correct" && "border-green-500",
                showFeedback && status === "incorrect" && "border-red-500",
                disabled && "cursor-not-allowed opacity-75"
              )}
            >
              <div className="flex items-start gap-3">
                {/* Circle Indicator */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    !showFeedback && isSelected && "border-primary",
                    showFeedback && status === "correct" && "border-green-500",
                    showFeedback && status === "incorrect" && "border-red-500",
                    !isSelected && !showFeedback && "border-border"
                  )}
                >
                  {showFeedback && status === "correct" && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {showFeedback && status === "incorrect" && (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                </div>

                <span className="flex-1 font-medium">
                  {option.text}
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {showFeedback && question.explanation && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Explanation</h4>
              <p className="text-sm text-muted-foreground">
                {question.explanation.text}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tip */}
      {showFeedback && question.tip && (
        <div className="rounded-lg border border-warning/20 bg-warning/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-1">Tip</h4>
              <p className="text-sm text-muted-foreground">
                {question.tip.text}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}