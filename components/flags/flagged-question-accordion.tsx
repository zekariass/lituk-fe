"use client"

import { useState, useEffect, useMemo, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FlaggedQuestionResponse, QuestionOption, Tip, UserLanguageInfo } from '@/lib/types';
import { useFlaggedQuestionsStore, useContentLanguageStore, useAuthStore, useLocalSettingsStore } from '@/lib/store';
import { OptionList } from '@/components/revision/option-list';
import { TipsPanel } from '@/components/revision/tips-panel';
import { sortAssets } from '@/components/revision/content-utils';
import { getAssetUrl } from '@/lib/utils/asset-url';
import { ChevronDown, BookOpenText, Lightbulb, FlagOff, X, CheckCircle2, XCircle } from 'lucide-react';

type ContentLanguage = string;

interface FlaggedQuestionAccordionProps {
  flaggedQuestion: FlaggedQuestionResponse;
  isExpanded: boolean;
  onToggle: () => void;
}

export function FlaggedQuestionAccordion({
  flaggedQuestion,
  isExpanded,
  onToggle,
}: FlaggedQuestionAccordionProps) {
  // Get global language from content language store
  const { language: globalLanguage, direction, setLanguage: setGlobalLanguage } = useContentLanguageStore();
  const { showOriginalAndTranslation } = useLocalSettingsStore();
  const user = useAuthStore(state => state.user);
  const languageFlags = user?.subscription?.withTranslation !== false ? (user?.userLanguages || []) : [];
  
  // Local language state for this question - defaults to empty string (no language selected)
  const [language, setLanguage] = useState<ContentLanguage>('');
  
  // Get store state and actions
  const showAnswer = useFlaggedQuestionsStore((state) => state.showAnswer);
  const showExplanation = useFlaggedQuestionsStore((state) => state.showExplanation);
  const showTips = useFlaggedQuestionsStore((state) => state.showTips);
  const explanations = useFlaggedQuestionsStore((state) => state.explanations);
  const tips = useFlaggedQuestionsStore((state) => state.tips);
  const toggleShowAnswer = useFlaggedQuestionsStore((state) => state.toggleShowAnswer);
  const toggleShowExplanation = useFlaggedQuestionsStore((state) => state.toggleShowExplanation);
  const toggleShowTips = useFlaggedQuestionsStore((state) => state.toggleShowTips);
  const removeFlag = useFlaggedQuestionsStore((state) => state.removeFlag);
  const fetchExplanation = useFlaggedQuestionsStore((state) => state.fetchExplanation);
  const fetchTips = useFlaggedQuestionsStore((state) => state.fetchTips);

  const [isRemoving, setIsRemoving] = useState(false);
  const [selectedOptionIds, setSelectedOptionIds] = useState<number[]>([]);
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [modalImage]);

  const { question, userAttempt } = flaggedQuestion;
  const questionId = question.id;

  // Prefill with the last attempt if available
  useEffect(() => {
    const initial = Array.from(new Set(userAttempt?.selectedOptionIds ?? [])).sort((a, b) => a - b)
    setSelectedOptionIds(initial)
  }, [userAttempt?.selectedOptionIds, questionId])

  // Initialize language from global store on mount, but don't auto-select if empty
  useEffect(() => {
    // Only set language if globalLanguage has a value
    if (globalLanguage && globalLanguage !== '') {
      setLanguage(globalLanguage);
    } else {
      // Ensure local state is empty if global is empty
      setLanguage('');
    }
  }, [globalLanguage]);

  // Auto-show explanation and tips when option is selected (fire only once per selection)
  const hasAutoShownRef = useRef(false);
  useEffect(() => {
    if (selectedOptionIds.length > 0 && !hasAutoShownRef.current) {
      hasAutoShownRef.current = true;
      if (!showExplanation[questionId]) {
        toggleShowExplanation(questionId);
      }
      if (!showTips[questionId]) {
        toggleShowTips(questionId);
      }
    }
  }, [selectedOptionIds, questionId, showExplanation, showTips, toggleShowExplanation, toggleShowTips]);

  // Prefetch explanation and tips when accordion is expanded
  useEffect(() => {
    if (isExpanded) {
      // Prefetch both explanation and tips in parallel
      fetchExplanation(questionId);
      fetchTips(questionId);
    }
  }, [isExpanded, questionId, fetchExplanation, fetchTips]);

  // Ensure data is fetched if panel is shown but data is missing
  useEffect(() => {
    if (showTips[questionId] && !tips[questionId]) {
      fetchTips(questionId);
    }
    if (showExplanation[questionId] && !explanations[questionId]) {
      fetchExplanation(questionId);
    }
  }, [showTips, showExplanation, tips, explanations, questionId, fetchTips, fetchExplanation]);

  const resolveDualText = (
    original: string | undefined,
    translated: string | undefined
  ): ReactNode => {
    if (!showOriginalAndTranslation || language === 'en' || !original) {
      return translated ?? original ?? '';
    }
    if (!translated || translated === original) {
      return original;
    }
    return (
      <>
        <span>{original}</span>
        <span className="block mt-1.5 opacity-60 text-sm">{translated}</span>
      </>
    );
  };

  // Get translated question text - memoized to re-compute when language changes
  const questionText = useMemo((): ReactNode => {
    const originalText = question.question || question.text || '';

    // If no translations available, return original text
    if (!question.translations) return resolveDualText(originalText, undefined);

    // Try to get translation for current language
    const translation = question.translations[language as keyof typeof question.translations];
    let translatedText: string | undefined;
    if (translation && typeof translation === 'object') {
      translatedText = (translation as any).question || (translation as any).text;
    }

    return resolveDualText(originalText, translatedText);
  }, [language, question, showOriginalAndTranslation]);

  // Get translated option label (string for alt text)
  const getOptionLabel = (option: QuestionOption): string => {
    const originalText = option.text;

    // If no translations available, return original text
    if (!option.translations) return originalText;

    // Try to get translation for current language
    const translation = option.translations[language as keyof typeof option.translations];
    if (translation && typeof translation === 'object' && 'text' in translation) {
      return (translation as any).text || originalText;
    }

    // Fallback to original text
    return originalText;
  };

  // Get translated option display label (ReactNode for rendering)
  const getOptionDisplayLabel = (option: QuestionOption): ReactNode => {
    const originalText = option.text;

    if (!option.translations) return resolveDualText(originalText, undefined);

    const translation = option.translations[language as keyof typeof option.translations];
    let translatedText: string | undefined;
    if (translation && typeof translation === 'object' && 'text' in translation) {
      translatedText = (translation as any).text;
    }

    return resolveDualText(originalText, translatedText);
  };

  // Get translated explanation text - memoized to re-compute when language or explanations change
  const explanationText = useMemo((): string => {
    const explanation = explanations[questionId];
    if (!explanation) return '';

    const originalText = explanation.text;

    // If no translations available, return original text
    if (!explanation.translations) return originalText;

    // Try to get translation for current language
    const translation = explanation.translations[language as keyof typeof explanation.translations];
    if (translation && typeof translation === 'object' && 'text' in translation) {
      return (translation as any).text || originalText;
    }

    // Fallback to original text
    return originalText;
  }, [language, explanations, questionId]);

  // Get original explanation text for dual display
  const originalExplanationText = useMemo((): string => {
    const explanation = explanations[questionId];
    if (!explanation) return '';
    return explanation.text || '';
  }, [explanations, questionId]);

  // Get translated tip text
  const getTipText = (tip: Tip): string => {
    if (!tip) return '';
    
    const originalText = tip.text ?? tip.body ?? tip.title ?? '';
    
    // If no translations available, return original text
    if (!tip.translations) return originalText;
    
    // Try to get translation for current language
    const translation = tip.translations[language as keyof typeof tip.translations];
    if (translation && typeof translation === 'object') {
      const t = translation as Record<string, unknown>;
      const translated = (t.tip ?? t.text ?? t.body ?? t.title) as string | undefined;
      if (translated) return translated;
    }
    
    // Fallback to original text
    return originalText;
  };

  const handleUnflag = async () => {
    if (isRemoving) return;
    
    setIsRemoving(true);
    try {
      await removeFlag(questionId);
    } catch (error) {
      console.error('Failed to unflag question:', error);
      setIsRemoving(false);
    }
  };

  const isExplanationShown = showExplanation[questionId];
  const isTipsShown = showTips[questionId];
  const correctOption = question.options.find((opt) => opt.isCorrect);

  return (
    <>
    <div
      className={`
        rounded-2xl border transition-all duration-200 overflow-hidden
        ${isExpanded 
          ? 'bg-emerald-500/10 border-emerald-500/30' 
          : 'bg-card border-border hover:border-border/80'}
      `}
    >
      {/* Collapsed header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Status indicator */}
        <div className="shrink-0">
          {userAttempt ? (
            userAttempt.isCorrect ? (
              <div className="w-7 h-7 rounded-full bg-emerald-400/15 flex items-center justify-center">
                <CheckCircle2 size={15} className="text-emerald-400" />
              </div>
            ) : (
              <div className="w-7 h-7 rounded-full bg-rose-400/15 flex items-center justify-center">
                <XCircle size={15} className="text-rose-400" />
              </div>
            )
          ) : (
            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
              <span className="text-xs text-muted-foreground">?</span>
            </div>
          )}
        </div>

        {/* Question text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug line-clamp-2 text-foreground">
            {question.id}. {questionText}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {question.categoryName}
          </p>
        </div>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`shrink-0 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border/50 px-2 py-2 space-y-4">
          {/* Language Switcher - positioned to the right */}
          {/* {languageFlags.length > 0 && (
            <div className="flex flex-wrap justify-end gap-1.5">
                {languageFlags.map((languageInfo: UserLanguageInfo) => {
                  const isActive = language === languageInfo.language.code;

                  return (
                    <button
                      key={languageInfo.language.code}
                      type="button"
                      onClick={() => {
                        setLanguage(languageInfo.language.code);
                        setGlobalLanguage(languageInfo.language.code, languageInfo.language.direction as 'ltr' | 'rtl');
                      }}
                      className={`inline-flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg border
                                  text-xs font-medium transition-all duration-200 whitespace-nowrap cursor-pointer
                                  ${isActive
                                    ? 'bg-emerald-300/50 border-emerald-300 text-primary shadow-sm'
                                    : 'bg-card border-border text-foreground/60 hover:text-foreground hover:bg-emerald-300/5 hover:border-emerald-300/30'}`}
                    >
                      <Image
                        src={languageInfo.language.flagUrl}
                        alt={languageInfo.language.name}
                        width={18}
                        height={13}
                        className="rounded-sm flex-shrink-0"
                      />
                      <span className="leading-none">{languageInfo.language.shortDisplayName}</span>
                    </button>
                  );
                })}
            </div>
          )} */}

          {/* Assets */}
          {question.assets && question.assets.length > 0 && (() => {
            const sorted = sortAssets(question.assets);
            const videoAssets = sorted.filter(a => a.contentType?.startsWith('video') || a.type?.toLowerCase().includes('video'));
            const imageAssets = sorted.filter(a => !a.contentType?.startsWith('video') && !a.type?.toLowerCase().includes('video'));
            const imageGridClass = imageAssets.length === 1
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
              : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3';
            return (
              <div className="space-y-3">
                {videoAssets.map((asset) => {
                  const fullUrl = getAssetUrl(asset.url);
                  return (
                    <div key={`${asset.url}-${asset.order ?? 0}`} className="w-full md:w-3/4">
                      <video controls autoPlay muted playsInline className="w-full rounded-xl border border-border bg-black">
                        <source src={fullUrl} type={asset.contentType ?? 'video/mp4'} />
                      </video>
                    </div>
                  );
                })}
                {imageAssets.length > 0 && (
                  <div className={imageGridClass}>
                    {imageAssets.map((asset) => {
                      const fullUrl = getAssetUrl(asset.url);
                      return (
                        <div
                          key={`${asset.url}-${asset.order ?? 0}`}
                          className="flex flex-col items-center md:items-start space-y-1"
                        >
                          <img
                            src={fullUrl}
                            alt={asset.alt ?? 'Asset'}
                            className="rounded-xl border border-border object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            width={300}
                            height={300}
                            onClick={() => setModalImage(fullUrl)}
                          />
                          {asset.caption && <p className="text-xs text-muted-foreground">{asset.caption}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Question text (full) */}
          <p className="text-base font-medium leading-relaxed text-foreground">
            {question.id}. {questionText}
          </p>

          {/* Options */}
          <OptionList
            options={question.options}
            selectedOptionIds={selectedOptionIds}
            answerLocked={selectedOptionIds.length > 0}
            correctOptionIds={correctOption ? [correctOption.id] : []}
            onSelectOption={(optionId) => {
              setSelectedOptionIds((prev) => {
                const toggled = prev.includes(optionId)
                  ? prev.filter((id) => id !== optionId)
                  : [...prev, optionId]
                return Array.from(new Set(toggled)).sort((a, b) => a - b)
              })
            }}
            getOptionLabel={getOptionDisplayLabel}
            getOptionAltText={getOptionLabel}
          />

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => toggleShowExplanation(questionId)}
              className={`
                inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                ${isExplanationShown
                  ? 'bg-blue-500/50 border-blue-500 text-primary'
                  : 'bg-card border-border text-foreground hover:border-border/80'}
              `}
            >
              <BookOpenText size={14} />
              {isExplanationShown ? 'Hide Explanation' : 'Explanation'}
            </button>

            <button
              type="button"
              onClick={() => toggleShowTips(questionId)}
              className={`
                inline-flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                ${isTipsShown
                  ? 'bg-amber-500/50 border-amber-500 text-primary'
                  : 'bg-card border-border text-foreground hover:border-border/80'}
              `}
            >
              <Lightbulb size={14} />
              {isTipsShown ? 'Hide Tips' : 'Tips'}
            </button>

            <button
              type="button"
              onClick={handleUnflag}
              disabled={isRemoving}
              className="
                inline-flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                bg-rose-500/50 border-rose-500 text-white
                hover:bg-rose-500/30 disabled:opacity-50 disabled:cursor-not-allowed
              "
            >
              <FlagOff size={14} />
              {isRemoving ? 'Removing...' : 'Unflag'}
            </button>

            <button
              type="button"
              onClick={onToggle}
              className="
                inline-flex items-center gap-2 px-2 py-2 rounded-xl text-xs font-medium
                border transition-all duration-200 cursor-pointer
                bg-card border-border text-foreground hover:border-border/80
              "
            >
              <X size={14} />
              Close
            </button>
          </div>

          {/* Explanation Card - Shown when toggled */}
          {isExplanationShown && explanations[questionId] && (
            <div className="mt-4 rounded-xl border border-border bg-blue-500/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <BookOpenText size={16} className="text-blue-400" />
                <h3 className="text-sm font-semibold text-foreground">Explanation</h3>
              </div>
              {showOriginalAndTranslation && language !== 'en' && originalExplanationText ? (
                <>
                  <div
                    className="text-sm leading-relaxed text-[hsl(var(--explanation-foreground))] quill-content
                               [&_p]:text-[hsl(var(--explanation-foreground))] [&_li]:text-[hsl(var(--explanation-foreground))]
                               [&_strong]:text-[hsl(var(--explanation-foreground))] [&_strong]:font-semibold
                               [&_a]:text-[hsl(var(--explanation-foreground))] [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: originalExplanationText }}
                  />
                  <div
                    className="mt-3 text-sm leading-relaxed opacity-60 quill-content
                               [&_p]:text-[hsl(var(--explanation-foreground))] [&_li]:text-[hsl(var(--explanation-foreground))]
                               [&_strong]:text-[hsl(var(--explanation-foreground))] [&_strong]:font-semibold
                               [&_a]:text-[hsl(var(--explanation-foreground))] [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: explanationText }}
                  />
                </>
              ) : (
                <div
                  className="text-sm leading-relaxed text-[hsl(var(--explanation-foreground))] quill-content
                             [&_p]:text-[hsl(var(--explanation-foreground))] [&_li]:text-[hsl(var(--explanation-foreground))]
                             [&_strong]:text-[hsl(var(--explanation-foreground))] [&_strong]:font-semibold
                             [&_a]:text-[hsl(var(--explanation-foreground))] [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: explanationText }}
                />
              )}
            </div>
          )}

          {/* Tips panel */}
          {isTipsShown && (
            tips[questionId] && tips[questionId].length > 0 ? (
              <div className="mt-4">
                <TipsPanel
                  tips={tips[questionId]}
                  title="Tips"
                  tipLabel={(index) => `Tip ${index}`}
                  getTipText={getTipText}
                />
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4">
                <p className="text-xs text-amber-300/80 font-light">
                  {tips[questionId] === undefined ? 'Loading tips...' : 'No tips available for this question.'}
                </p>
              </div>
            )
          )}

          {/* Bottom Close Button - Shown when explanation or tips are visible */}
          {(isExplanationShown || isTipsShown) && (
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={onToggle}
                className="
                  inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium
                  border transition-all duration-200 cursor-pointer
                  bg-card border-border text-foreground hover:border-border/80
                "
              >
                <X size={14} />
                Close
              </button>
            </div>
          )}
        </div>
      )}
    </div>

    {/* Image Modal — portaled to body */}
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
  );
}
