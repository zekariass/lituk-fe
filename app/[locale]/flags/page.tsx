"use client"

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore, useFlaggedQuestionsStore } from '@/lib/store';
import { LanguageSwitcher } from '@/components/flags/language-switcher';
import { FlaggedQuestions } from '@/components/flags/flagged-questions';
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react';

export default function FlagsPage() {
  const t = useTranslations('flagsPage');
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { page, hasMore, fetchFlaggedQuestions, reset } = useFlaggedQuestionsStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isAuthenticated) return null;

  const handlePreviousPage = () => {
    if (page > 0) {
      fetchFlaggedQuestions(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      fetchFlaggedQuestions(page + 1);
    }
  };

  return (
    <div className="w-full mx-1 md:mx-auto space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Flag size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {t('title')}
              </h1>
              {/* <p className="text-sm text-muted-foreground mt-0.5">
                {t('subtitle')}
              </p> */}
            </div>
          </div>

          {/* Global Language Switcher - Desktop only */}
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
        </div>

        {/* Global Language Switcher - Mobile only */}
        <div className="sm:hidden">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Flagged Questions List */}
      <FlaggedQuestions />

      {/* Pagination */}
      <div className="flex items-center justify-center gap-3 pt-4">
        <button
          type="button"
          onClick={handlePreviousPage}
          disabled={page === 0}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            border transition-all duration-200 cursor-pointer
            bg-card border-border text-foreground
            hover:border-border/80 disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          <ChevronLeft size={16} />
          {t('previous')}
        </button>

        <span className="text-sm text-muted-foreground">
          {t('page')} {page + 1}
        </span>
        <button
          type="button"
          onClick={handleNextPage}
          disabled={!hasMore}
          className="
            inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            border transition-all duration-200 cursor-pointer
            bg-card border-border text-foreground
            hover:border-border/80 disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {t('next')}
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
