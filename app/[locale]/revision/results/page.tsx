"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRevisionStore, useAuthStore } from '@/lib/store';
import { Trophy, Target, Clock, TrendingUp, ChevronRight } from 'lucide-react';

export default function RevisionResultsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { currentSession, questions, resetSession } = useRevisionStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (!currentSession) {
      router.push('/practice');
      return;
    }
  }, [isAuthenticated, currentSession, router]);

  if (!isAuthenticated || !currentSession) {
    return null;
  }

  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(q => q.userAnswerCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const totalPoints = questions.reduce((sum, q) => sum + (q.pointsEarned || 0), 0);

  const handleNewSession = () => {
    resetSession();
    router.push('/practice');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-4">
          <Trophy className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-3xl font-bold">Session Complete! 🎉</h1>
        <p className="text-muted-foreground">
          Great job! Here's how you performed
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <Target className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold">Accuracy</h3>
          </div>
          <p className="text-3xl font-bold">{accuracy}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {correctAnswers}/{totalQuestions} correct
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <Trophy className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold">Points Earned</h3>
          </div>
          <p className="text-3xl font-bold">{totalPoints}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Total points
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">Question Breakdown</h3>
        <div className="space-y-2">
          {questions.map((question, index) => (
            <div
              key={question.id}
              className="flex items-center justify-between p-3 rounded-lg bg-accent/50"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-muted-foreground">
                  Q{index + 1}
                </span>
                <span className="text-sm truncate max-w-md">
                  {question.text.substring(0, 60)}...
                </span>
              </div>
              <div className="flex items-center gap-2">
                {question.userAnswerCorrect ? (
                  <span className="text-success font-medium">✓</span>
                ) : (
                  <span className="text-destructive font-medium">✗</span>
                )}
                <span className="text-sm text-muted-foreground">
                  +{question.pointsEarned || 0}pts
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleNewSession}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          Start New Session
          <ChevronRight className="h-4 w-4" />
        </button>

        <Link
          href="/practice"
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors font-medium"
        >
          Back to Categories
        </Link>
      </div>

      <div className="text-center">
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <TrendingUp className="h-4 w-4" />
          View Leaderboard
        </Link>
      </div>
    </div>
  );
}
