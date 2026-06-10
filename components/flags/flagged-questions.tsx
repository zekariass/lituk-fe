"use client"

import { useEffect } from 'react';
import { useFlaggedQuestionsStore } from '@/lib/store';
import { FlaggedQuestionAccordion } from './flagged-question-accordion';
import { Loader2, Flag } from 'lucide-react';

export function FlaggedQuestions() {
  const {
    flaggedQuestions,
    loading,
    expandedQuestionId,
    setExpandedQuestion,
    fetchFlaggedQuestions,
  } = useFlaggedQuestionsStore();

  useEffect(() => {
    fetchFlaggedQuestions(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading && flaggedQuestions.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-card p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-1/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!loading && flaggedQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-5">
          <Flag size={28} className="text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          No Flagged Questions
        </h3>
        <p className="text-sm text-muted-foreground max-w-md">
          You haven't flagged any questions yet. Flag questions during practice to review them later.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {flaggedQuestions.map((flaggedQuestion) => (
        <FlaggedQuestionAccordion
          key={flaggedQuestion.id}
          flaggedQuestion={flaggedQuestion}
          isExpanded={expandedQuestionId === flaggedQuestion.question.id}
          onToggle={() => {
            if (expandedQuestionId === flaggedQuestion.question.id) {
              setExpandedQuestion(null);
            } else {
              setExpandedQuestion(flaggedQuestion.question.id);
            }
          }}
        />
      ))}

      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 size={20} className="animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
