"use client"

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCategoryStore, useAuthStore } from '@/lib/store';
import { useTranslations } from 'next-intl';
import { BookOpen, ChevronLeft, ChevronRight, Play, Loader2, TrendingUp } from 'lucide-react';

export default function CategoryDetailPage() {
  const t = useTranslations('categoryDetailPage');
  const router = useRouter();
  const params = useParams();
  const categoryId = Number(params.id);
  
  const { isAuthenticated } = useAuthStore();
  const { categories, fetchCategories, getCategoryById, isLoading } = useCategoryStore();
  const [questionCount, setQuestionCount] = useState(20);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (categories.length === 0) {
      fetchCategories(undefined, true);
    }
  }, [isAuthenticated, router, categories.length]);

  if (!isAuthenticated) {
    return null;
  }

  const category = getCategoryById(categoryId);
  const subcategories = categories.filter(cat => cat.parentId === categoryId || cat.parentCategoryId === categoryId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6 text-center">
          <p className="text-destructive">{t('notFound')}</p>
        </div>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('backToCategories')}
        </Link>
      </div>
    );
  }

  const totalQuestions = category.totalQuestions || 0;
  const completedQuestions = category.completedQuestions || 0;
  const progress = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0;

  const handleStartRevision = (targetCategoryId: number) => {
    router.push(`/revision/start?categoryId=${targetCategoryId}&count=${questionCount}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/practice"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('backToCategories')}
        </Link>

        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <BookOpen className="h-8 w-8 text-primary" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description && (
              <p className="text-muted-foreground mt-2">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">{t('questions')}</h3>
          </div>
          <p className="text-3xl font-bold">{totalQuestions}</p>
          <p className="text-sm text-muted-foreground mt-1">{t('totalAvailable')}</p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-success" />
            </div>
            <h3 className="font-semibold">{t('progress')}</h3>
          </div>
          <p className="text-3xl font-bold">{progress}%</p>
          <p className="text-sm text-muted-foreground mt-1">
            {t('completedCount', { completed: completedQuestions, total: totalQuestions })}
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-warning" />
            </div>
            <h3 className="font-semibold">{t('accuracy')}</h3>
          </div>
          <p className="text-3xl font-bold">{category.accuracy || 0}%</p>
          <p className="text-sm text-muted-foreground mt-1">{t('overallPerformance')}</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <h3 className="font-semibold text-lg mb-4">{t('startPracticeSession')}</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t('numberOfQuestions')}
            </label>
            <div className="flex gap-2">
              {[10, 20, 30, 50].map((count) => (
                <button
                  key={count}
                  onClick={() => setQuestionCount(count)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    questionCount === count
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border hover:border-primary hover:bg-accent'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => handleStartRevision(categoryId)}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
          >
            <Play className="h-5 w-5" />
            {t('startRevisionSession')}
          </button>
        </div>
      </div>

      {subcategories.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg mb-4">{t('subcategories')}</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {subcategories.map((subcat) => {
              const subProgress = subcat.totalQuestions
                ? Math.round(((subcat.completedQuestions || 0) / subcat.totalQuestions) * 100)
                : 0;

              return (
                <div
                  key={subcat.id}
                  className="rounded-lg border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">{subcat.name}</h4>
                      {subcat.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {subcat.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{t('progress')}</span>
                      <span className="font-medium">
                        {subcat.completedQuestions || 0}/{subcat.totalQuestions || 0}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${subProgress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleStartRevision(subcat.id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-primary text-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    {t('practice')}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
