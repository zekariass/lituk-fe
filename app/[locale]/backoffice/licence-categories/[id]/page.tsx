"use client"

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAdminStore } from '@/lib/store/admin-store';
import { QuestionBasicResponse, PaginatedResponse } from '@/lib/types/admin';
import {
  ArrowLeft, Award, BookOpen, Check, CheckCircle2,
  ChevronLeft, ChevronRight, Loader2, Plus, Search,
  SlidersHorizontal, Trash2, AlertCircle, Filter,
} from 'lucide-react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ── Style tokens ───────────────────────────────────────────────────────────────
const selectClass = `
  w-full h-10 px-3 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200
  [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]
`
const inputClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 placeholder:text-white/20
`

function SectionBlock({ title, icon: Icon, children, action }: {
  title: string; icon?: React.ElementType; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          {Icon && <Icon size={13} className="text-white/30" />}
          <h4 className="text-[10px] uppercase tracking-widest text-white/35 font-medium">{title}</h4>
        </div>
        {action}
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function LicenceCategoryQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const licenceCategoryId = Number(params.id);

  const {
    currentLicenceCategory,
    fetchLicenceCategory,
    fetchLicenceCategoryQuestionsPage,
    searchQuestionsForAssignment,
    assignQuestions, removeQuestions,
    categories, fetchCategories,
  } = useAdminStore();

  // ── Assigned questions (paginated) ─────────────────────────────────────────
  const [assignedPage, setAssignedPage] = useState<PaginatedResponse<QuestionBasicResponse> | null>(null);
  const [assignedCurrentPage, setAssignedCurrentPage] = useState(0);
  const [assignedLoading, setAssignedLoading] = useState(false);
  const assignedPageSize = 20;

  // ── Search dialog state ────────────────────────────────────────────────────
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<PaginatedResponse<QuestionBasicResponse> | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryId, setSearchCategoryId] = useState<number | ''>('');
  const [assignmentStatus, setAssignmentStatus] = useState<'NOT_ASSIGNED' | 'ASSIGNED' | 'ALL'>('NOT_ASSIGNED');
  const [searchPage, setSearchPage] = useState(0);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const searchPageSize = 20;

  // ── General state ──────────────────────────────────────────────────────────
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);

  // ── Load category details ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setCategoryLoading(true);
      try { await fetchLicenceCategory(licenceCategoryId) }
      catch { setFeedback({ type: 'error', message: 'Failed to load licence category.' }) }
      finally { setCategoryLoading(false) }
    };
    void load();
    void fetchCategories();
  }, [licenceCategoryId, fetchLicenceCategory, fetchCategories]);

  // ── Load assigned questions ────────────────────────────────────────────────
  const loadAssigned = useCallback(async (page = 0) => {
    setAssignedLoading(true);
    try {
      const data = await fetchLicenceCategoryQuestionsPage(licenceCategoryId, { page, size: assignedPageSize });
      setAssignedPage(data);
    } catch { setFeedback({ type: 'error', message: 'Failed to load assigned questions.' }) }
    finally { setAssignedLoading(false) }
  }, [licenceCategoryId, fetchLicenceCategoryQuestionsPage]);

  useEffect(() => { void loadAssigned(assignedCurrentPage) }, [assignedCurrentPage, loadAssigned]);

  // ── Search questions ───────────────────────────────────────────────────────
  const doSearch = useCallback(async (page = 0) => {
    if (!currentLicenceCategory?.jurisdictionId) return;
    setSearchLoading(true);
    try {
      const p: Record<string, any> = {
        jurisdictionId: currentLicenceCategory.jurisdictionId,
        licenceCategoryId,
        assignmentStatus,
        page,
        size: searchPageSize,
      };
      if (searchQuery.trim()) p.searchText = searchQuery.trim();
      if (searchCategoryId !== '') p.categoryId = searchCategoryId;
      const data = await searchQuestionsForAssignment(p);
      setSearchResults(data);
    } catch { setFeedback({ type: 'error', message: 'Failed to search questions.' }) }
    finally { setSearchLoading(false) }
  }, [currentLicenceCategory?.jurisdictionId, licenceCategoryId, assignmentStatus, searchQuery, searchCategoryId, searchQuestionsForAssignment]);

  // ── Open add dialog ────────────────────────────────────────────────────────
  const handleOpenAddDialog = () => {
    setShowAddDialog(true);
    setSearchPage(0);
    setSearchQuery('');
    setSearchCategoryId('');
    setAssignmentStatus('NOT_ASSIGNED');
    setSelectedQuestionIds([]);
    setSearchResults(null);
  };

  // Auto-search when dialog opens and category is loaded
  useEffect(() => {
    if (showAddDialog && currentLicenceCategory?.jurisdictionId) void doSearch(0);
  }, [showAddDialog, currentLicenceCategory?.jurisdictionId]);

  const handleSearchApply = () => { setSearchPage(0); void doSearch(0) };
  const handleSearchPageChange = (page: number) => { setSearchPage(page); void doSearch(page) };

  // ── Assign questions ───────────────────────────────────────────────────────
  const handleAssignQuestions = async () => {
    if (selectedQuestionIds.length === 0) return;
    try {
      await assignQuestions({ licenceCategoryId, questionIds: selectedQuestionIds });
      setShowAddDialog(false); setSelectedQuestionIds([]);
      setAssignedCurrentPage(0);
      await loadAssigned(0);
      await fetchLicenceCategory(licenceCategoryId);
      setFeedback({ type: 'success', message: `${selectedQuestionIds.length} question(s) assigned successfully.` });
    } catch { setFeedback({ type: 'error', message: 'Failed to assign questions.' }) }
  };

  // ── Remove question ────────────────────────────────────────────────────────
  const handleRemoveQuestion = async (questionId: number) => {
    setRemoving(questionId);
    try {
      await removeQuestions(licenceCategoryId, [questionId]);
      await loadAssigned(assignedCurrentPage);
      await fetchLicenceCategory(licenceCategoryId);
      setFeedback({ type: 'success', message: 'Question removed.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to remove question.' }) }
    finally { setRemoving(null) }
  };

  const toggleQuestion = (id: number) =>
    setSelectedQuestionIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const assignedQuestions = assignedPage?.content ?? [];

  // ── Loading state ──────────────────────────────────────────────────────────
  if (categoryLoading) {
    return (
      <div className="font-dm flex items-center justify-center min-h-[60vh]">
        <Loader2 size={22} className="animate-spin text-emerald-300/50" />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .delay-1 { animation-delay: 0.07s; }
        .delay-2 { animation-delay: 0.14s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-6 pb-10">

        {/* ── Header ── */}
        <div className="relative overflow-hidden rounded-2xl border border-emerald-300/[0.12]
                        bg-emerald-300/[0.04] px-6 py-5 animate-fade-up">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-300/[0.08] blur-3xl pointer-events-none" />
          <div className="absolute -bottom-14 left-16 h-48 w-48 rounded-full bg-sky-300/[0.06] blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <button onClick={() => router.back()}
                className="w-9 h-9 flex items-center justify-center rounded-xl border border-white/[0.12]
                           bg-white/[0.05] text-white/50 hover:text-white/80 hover:border-white/20
                           transition-all duration-200 shrink-0 mt-0.5">
                <ArrowLeft size={15} />
              </button>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                                bg-emerald-300/10 border border-emerald-300/20 mb-2">
                  <Award size={11} className="text-emerald-300" />
                  <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
                    Licence Category · Questions
                  </span>
                </div>
                <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
                  {currentLicenceCategory?.name ?? 'Licence Category'}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  {currentLicenceCategory?.code && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                     uppercase tracking-widest border text-emerald-300 bg-emerald-300/10 border-emerald-300/20">
                      {currentLicenceCategory.code}
                    </span>
                  )}
                  {currentLicenceCategory?.jurisdictionName && (
                    <span className="text-xs text-white/35 font-light">{currentLicenceCategory.jurisdictionName}</span>
                  )}
                  {currentLicenceCategory?.isDefault && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                     uppercase tracking-widest border text-sky-300 bg-sky-300/10 border-sky-300/20">
                      Default
                    </span>
                  )}
                </div>
                {currentLicenceCategory?.description && (
                  <p className="text-sm text-white/35 font-light mt-2">{currentLicenceCategory.description}</p>
                )}
              </div>
            </div>

            <button onClick={handleOpenAddDialog}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
              <Plus size={15} /> Add Questions
            </button>
          </div>
        </div>

        {/* ── Feedback ── */}
        {feedback && (
          <div className={`flex items-start gap-2.5 px-4 py-3.5 rounded-xl border animate-fade-up
            ${feedback.type === 'success'
              ? 'bg-emerald-300/[0.07] border-emerald-300/20 text-emerald-300/80'
              : 'bg-red-400/[0.07] border-red-400/20 text-red-400/80'}`}>
            {feedback.type === 'success'
              ? <CheckCircle2 size={14} className="shrink-0 mt-0.5 text-emerald-300" />
              : <AlertCircle  size={14} className="shrink-0 mt-0.5 text-red-400" />}
            <span className="text-sm font-light flex-1">{feedback.message}</span>
            <button onClick={() => setFeedback(null)}
              className="text-xs text-white/25 underline hover:text-white/50 shrink-0 transition-colors">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Assigned Questions ── */}
        <div className="animate-fade-up delay-1">
          <SectionBlock
            title={`Assigned Questions (${currentLicenceCategory?.questionCount ?? assignedPage?.totalElements ?? 0})`}
            icon={BookOpen}
          >
            {assignedLoading && assignedQuestions.length === 0 ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />
                ))}
              </div>
            ) : assignedQuestions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 rounded-xl
                              border border-dashed border-white/[0.08]">
                <BookOpen size={24} className="text-white/15 mb-2" />
                <p className="text-sm text-white/30 font-light">No questions assigned yet.</p>
                <p className="text-xs text-white/20 mt-1">Click &quot;Add Questions&quot; to get started.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {assignedQuestions.map(question => (
                  <div key={question.id}
                    className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl
                               border border-white/[0.07] bg-[#181920] hover:border-white/[0.14]
                               transition-all duration-200">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <span className="text-[10px] font-medium text-white/25 tabular-nums shrink-0 mt-0.5 pt-px">
                        #{question.id}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white/70 font-light leading-snug">
                          {question.question?.substring(0, 140)}
                          {question.question && question.question.length > 140 ? '…' : ''}
                        </p>
                        {question.categoryName && (
                          <span className="inline-flex items-center mt-1.5 px-1.5 py-0.5 rounded text-[10px]
                                           border border-white/[0.08] text-white/30 bg-white/[0.03]">
                            {question.categoryName}
                          </span>
                        )}
                      </div>
                    </div>
                    <button onClick={() => void handleRemoveQuestion(question.id)}
                      disabled={removing === question.id}
                      className="w-7 h-7 flex items-center justify-center rounded-lg shrink-0
                                 text-white/25 hover:text-red-400 hover:bg-red-400/[0.08]
                                 disabled:opacity-30 transition-all duration-150">
                      {removing === question.id
                        ? <Loader2 size={12} className="animate-spin" />
                        : <Trash2 size={13} />}
                    </button>
                  </div>
                ))}

                {/* Assigned pagination */}
                {assignedPage && assignedPage.totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3">
                    <span className="text-xs text-white/30 tabular-nums">
                      Page {assignedCurrentPage + 1} of {assignedPage.totalPages} · {assignedPage.totalElements} total
                    </span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setAssignedCurrentPage(p => Math.max(0, p - 1))}
                        disabled={assignedCurrentPage === 0 || assignedLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                                   text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                   disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                        <ChevronLeft size={12} /> Prev
                      </button>
                      <button onClick={() => setAssignedCurrentPage(p => p + 1)}
                        disabled={assignedCurrentPage >= assignedPage.totalPages - 1 || assignedLoading}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium
                                   text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                                   disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                        Next <ChevronRight size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SectionBlock>
        </div>

        {/* ══════════════════════════════════════
            Add Questions Dialog
        ══════════════════════════════════════ */}
        <Dialog open={showAddDialog} onOpenChange={open => { setShowAddDialog(open); if (!open) setSelectedQuestionIds([]) }}>
          <DialogContent className="max-w-4xl max-h-[88vh] flex flex-col gap-0 p-0
                                    bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm overflow-hidden">

            {/* Header */}
            <DialogHeader className="px-6 pt-6 pb-4 border-b border-white/[0.07] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20 flex items-center justify-center shrink-0">
                  <Plus size={14} className="text-emerald-300" />
                </div>
                <DialogTitle className="font-syne font-bold text-lg tracking-tight">
                  Add Questions to {currentLicenceCategory?.name ?? 'Licence Category'}
                </DialogTitle>
              </div>
            </DialogHeader>

            {/* Filters */}
            <div className="px-6 py-4 border-b border-white/[0.06] shrink-0 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <SlidersHorizontal size={12} className="text-white/30" />
                <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Filters</span>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Question Category</label>
                  <select value={searchCategoryId}
                    onChange={e => setSearchCategoryId(e.target.value ? Number(e.target.value) : '')}
                    className={selectClass}>
                    <option value="">All Categories</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Assignment Status</label>
                  <select value={assignmentStatus}
                    onChange={e => setAssignmentStatus(e.target.value as 'NOT_ASSIGNED' | 'ASSIGNED' | 'ALL')}
                    className={selectClass}>
                    <option value="NOT_ASSIGNED">Not Assigned</option>
                    <option value="ASSIGNED">Already Assigned</option>
                    <option value="ALL">All</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Jurisdiction</label>
                  <div className="h-10 px-3 rounded-xl text-sm text-white/40 font-light
                                  bg-white/[0.02] border border-white/[0.06] flex items-center">
                    {currentLicenceCategory?.jurisdictionName ?? '—'}
                  </div>
                </div>
              </div>

              {/* Search + Apply */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
                  <input value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSearchApply() }}
                    placeholder="Search by question text…"
                    className={`${inputClass} pl-9`} />
                </div>
                <button onClick={handleSearchApply} disabled={searchLoading}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                             text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                             transition-all duration-200 [box-shadow:0_0_12px_rgba(110,231,183,0.20)]">
                  {searchLoading ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />}
                  Search
                </button>
              </div>
            </div>

            {/* Selection banner */}
            {selectedQuestionIds.length > 0 && (
              <div className="mx-6 mt-3 shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-xl
                              bg-emerald-300/[0.08] border border-emerald-300/20">
                <CheckCircle2 size={14} className="text-emerald-300 shrink-0" />
                <span className="text-sm text-emerald-300/80 font-light flex-1">
                  {selectedQuestionIds.length} question{selectedQuestionIds.length !== 1 ? 's' : ''} selected
                </span>
                <button onClick={() => setSelectedQuestionIds([])}
                  className="text-xs text-white/30 underline hover:text-white/60 transition-colors shrink-0">
                  Clear
                </button>
              </div>
            )}

            {/* Questions list */}
            <div className="flex-1 overflow-y-auto px-6 py-3 min-h-0">
              {searchLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.03]" />
                  ))}
                </div>
              ) : !searchResults || searchResults.content.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-xl
                                border border-dashed border-white/[0.08]">
                  <BookOpen size={24} className="text-white/15 mb-2" />
                  <p className="text-sm text-white/30 font-light">
                    {searchResults ? 'No questions match your filters.' : 'Use the filters above to search for questions.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {searchResults.content.map(question => {
                    const isAlreadyAssigned = question.assignedToLicenceCategory === true;
                    const isSelected = selectedQuestionIds.includes(question.id);
                    const canSelect = !isAlreadyAssigned;
                    return (
                      <div key={question.id}
                        onClick={() => canSelect && toggleQuestion(question.id)}
                        className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-all duration-150
                          ${canSelect ? 'cursor-pointer' : 'cursor-default opacity-60'}
                          ${isSelected
                            ? 'bg-emerald-300/[0.06] border-emerald-300/20'
                            : isAlreadyAssigned
                              ? 'bg-white/[0.01] border-white/[0.05]'
                              : 'bg-white/[0.02] border-white/[0.07] hover:border-white/[0.14]'}`}>

                        {/* Checkbox */}
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5
                                         transition-all duration-150
                                         ${isAlreadyAssigned
                                           ? 'bg-emerald-300/30 border-emerald-300/30'
                                           : isSelected
                                             ? 'bg-emerald-300 border-emerald-300'
                                             : 'bg-white/[0.04] border-white/20'}`}>
                          {(isSelected || isAlreadyAssigned) && <Check size={10} className="text-[#12131a]" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] font-medium text-white/25 tabular-nums">#{question.id}</span>
                            {question.categoryName && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]
                                               border border-white/[0.08] text-white/35 bg-white/[0.03]">
                                {question.categoryName}
                              </span>
                            )}
                            {isAlreadyAssigned && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px]
                                               border border-emerald-300/20 text-emerald-300/60 bg-emerald-300/[0.06]">
                                <CheckCircle2 size={8} /> Assigned
                              </span>
                            )}
                            {!question.active && (
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px]
                                               border border-red-400/20 text-red-400/60 bg-red-400/[0.06]">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-white/65 font-light leading-snug">
                            {question.question?.substring(0, 160)}
                            {question.question && question.question.length > 160 ? '…' : ''}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Pagination */}
            {searchResults && searchResults.totalPages > 1 && (
              <div className="px-6 py-3 border-t border-white/[0.06] shrink-0
                              flex items-center justify-between">
                <span className="text-xs text-white/30 tabular-nums">
                  Page {searchPage + 1} of {searchResults.totalPages} · {searchResults.totalElements} results
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSearchPageChange(searchPage - 1)}
                    disabled={searchPage === 0 || searchLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                               disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                    <ChevronLeft size={13} /> Previous
                  </button>
                  <button
                    onClick={() => handleSearchPageChange(searchPage + 1)}
                    disabled={searchPage >= searchResults.totalPages - 1 || searchLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                               disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                    Next <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* Footer */}
            <DialogFooter className="px-6 py-4 border-t border-white/[0.07] gap-2 shrink-0">
              <button onClick={() => { setShowAddDialog(false); setSelectedQuestionIds([]) }}
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                           hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleAssignQuestions()}
                disabled={searchLoading || selectedQuestionIds.length === 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                           transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
                {searchLoading
                  ? <Loader2 size={14} className="animate-spin" />
                  : <Check size={14} />}
                Assign {selectedQuestionIds.length > 0 ? `${selectedQuestionIds.length} ` : ''}Question{selectedQuestionIds.length !== 1 ? 's' : ''}
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </>
  );
}