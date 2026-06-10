"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCategoryStore, useAuthStore } from '@/lib/store';
import api from '@/lib/api/client';
import { useTranslations } from 'next-intl';
import { BookOpen, ChevronRight, Loader2, TrendingUp } from 'lucide-react';
import { LicenceCategory } from '@/lib/types';

export default function CategoriesPage() {
  const t = useTranslations('categoriesPage');
  const router = useRouter();
  const { isAuthenticated, user, selectedLicenceCategoryId, setSelectedLicenceCategoryId } = useAuthStore();
  const { categories, isLoading, error, fetchCategories } = useCategoryStore();
  const [mounted, setMounted] = useState(false);
  const [isResolvingLicenceCategory, setIsResolvingLicenceCategory] = useState(false);
  const [licenceCategoryError, setLicenceCategoryError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    console.log('📄 Categories page - mounted:', mounted);
    console.log('📄 Categories page - isAuthenticated:', isAuthenticated);
    console.log('📄 Categories page - user:', user);
    console.log('📄 Categories page - user?.activeJurisdictionId:', user?.activeJurisdictionId);

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    let isMounted = true;

    const resolveAndFetchCategories = async () => {
      setIsResolvingLicenceCategory(true);
      setLicenceCategoryError(null);

      try {
        let resolvedId = selectedLicenceCategoryId;

        if (!resolvedId) {
          const jurisdictionId = user?.activeJurisdictionId;

          console.log('📄 Checking jurisdictionId:', jurisdictionId);
          console.log('📄 Full user object:', JSON.stringify(user, null, 2));

          if (!jurisdictionId) {
            if (isMounted) {
              console.error('❌ Missing activeJurisdictionId. User object:', user);
              setLicenceCategoryError('Missing active jurisdiction for category lookup.');
            }
            return;
          }

          const response = await api.get(`/api/v1/content/jurisdictions/${jurisdictionId}/licence-categories`);
          const responseData = response?.data?.data;
          const licenceCategories: LicenceCategory[] = Array.isArray(responseData)
            ? responseData
            : Array.isArray(responseData?.items)
              ? responseData.items
              : [];

          const defaultCategory = licenceCategories.find((category) => category.isDefault) ?? licenceCategories[0];
          resolvedId = defaultCategory?.id ?? null;

          if (resolvedId && isMounted) {
            setSelectedLicenceCategoryId(resolvedId);
          }
        }

        if (!resolvedId) {
          if (isMounted) {
            setLicenceCategoryError('No licence category is available for this jurisdiction.');
          }
          return;
        }

        await fetchCategories(undefined, true, resolvedId);
      } catch (loadError: any) {
        if (isMounted) {
          setLicenceCategoryError(loadError?.response?.data?.message || 'Failed to load licence categories.');
        }
      } finally {
        if (isMounted) {
          setIsResolvingLicenceCategory(false);
        }
      }
    };

    void resolveAndFetchCategories();

    return () => {
      isMounted = false;
    };
  }, [mounted, isAuthenticated, fetchCategories, router, selectedLicenceCategoryId, setSelectedLicenceCategoryId, user?.activeJurisdictionId]);

  if (!isAuthenticated) {
    return null;
  }

  const parentCategories = categories.filter(cat => !cat.parentId && !cat.parentCategoryId);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
      </div>

      {isResolvingLicenceCategory || isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : licenceCategoryError || error ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-6">
          <p className="text-destructive">{licenceCategoryError || error}</p>
        </div>
      ) : parentCategories.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-12 text-center">
          <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('noCategoriesTitle')}</h3>
          <p className="text-muted-foreground">
            {t('noCategoriesDescription')}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((category) => {
            const childCategories = categories.filter(
              cat => cat.parentId === category.id || cat.parentCategoryId === category.id
            );

            const totalQuestions =
              category.userProgress?.totalQuestions ??
              category.userStats?.totalQuestions ??
              category.totalQuestions ??
              category.questionCount ??
              0;

            const attemptedQuestions =
              category.userProgress?.attemptedQuestions ??
              category.userStats?.attemptedQuestions ??
              category.completedQuestions ??
              0;

            const progress = totalQuestions > 0 ? (attemptedQuestions / totalQuestions) * 100 : 0;
            const progressPercent = Math.max(0, Math.min(100, Math.round(progress)));

            const accuracyPercent =
              category.userProgress?.accuracyRate !== undefined
                ? Math.round(category.userProgress.accuracyRate * 100)
                : category.userStats?.accuracyRate !== undefined
                  ? Math.round(category.userStats.accuracyRate * 100)
                  : category.accuracy !== undefined
                    ? Math.round(category.accuracy)
                    : undefined;

            return (
              <Link
                key={category.id}
                href={`/practice/${category.id}`}
                className="group rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <BookOpen className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {childCategories.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          {t('subcategoriesCount', { count: childCategories.length })}
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>

                {category.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {category.description}
                  </p>
                )}

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('progress')}</span>
                    <span className="font-medium">
                      {t('questionsCount', { attempted: attemptedQuestions, total: totalQuestions })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t('attemptedPercentageLabel')}</span>
                    <span className="font-semibold text-foreground">{t('attemptedPercentageValue', { value: progressPercent })}</span>
                  </div>
                  
                  <div className="w-full h-2 bg-accent rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  {accuracyPercent !== undefined && accuracyPercent > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-success" />
                      <span className="text-muted-foreground">
                        {t('accuracy', { value: accuracyPercent })}
                      </span>
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <Link
          href="/practice/mock-test"
          className="rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-lg mb-2">{t('takeMockTest')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('mockTestDescription')}
          </p>
          <div className="flex items-center gap-2 text-primary font-medium">
            {t('startTest')}
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>

        <Link
          href="/leaderboard"
          className="rounded-lg border border-border bg-card p-6 hover:border-primary hover:shadow-md transition-all"
        >
          <h3 className="font-semibold text-lg mb-2">{t('viewLeaderboard')}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {t('leaderboardDescription')}
          </p>
          <div className="flex items-center gap-2 text-primary font-medium">
            {t('viewRankings')}
            <ChevronRight className="h-4 w-4" />
          </div>
        </Link>
      </div>
    </div>
  );
}
