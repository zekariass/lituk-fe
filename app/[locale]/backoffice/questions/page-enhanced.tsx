"use client"

import { useEffect, useState } from 'react';
import { useAuthStore, useAdminStore } from '@/lib/store';
import { AdminQuestion, CreateQuestionRequest, CreateOptionRequest } from '@/lib/types/admin';
import {
  Plus, Edit, Trash2, CheckCircle2, XCircle, Search,
  SlidersHorizontal, Loader2, Info, Sparkles, BookOpen,
  ChevronLeft, ChevronRight, Check, AlertCircle, MessageSquare,
  Lightbulb, ImageIcon, Upload, Globe2,
} from 'lucide-react';

// ── Shared style tokens ────────────────────────────────────────────────────────
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
const textareaClass = `
  w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
  bg-white/[0.04] border border-white/[0.09]
  focus:outline-none focus:border-emerald-300/40
  transition-colors duration-200 resize-none placeholder:text-white/20
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

function ActionBtn({ onClick, title, variant = 'ghost', children }: {
  onClick: () => void; title?: string; variant?: 'ghost' | 'danger' | 'outline'; children: React.ReactNode
}) {
  const cls = {
    ghost:   'text-white/30 hover:text-white/70 hover:bg-white/[0.07]',
    danger:  'text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]',
    outline: 'text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20',
  }[variant]
  return (
    <button type="button" onClick={onClick} title={title}
      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-150 ${cls}`}>
      {children}
    </button>
  )
}

// ── Modal shell ───────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, maxWidth = 'max-w-2xl' }: {
  open: boolean; onClose: () => void; children: React.ReactNode; maxWidth?: string
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 bg-black/70 backdrop-blur-sm">
      <div className={`relative my-8 w-full ${maxWidth} bg-[#181920] border border-white/[0.09] rounded-2xl text-[#f0f0f5] font-dm shadow-2xl`}>
        {children}
      </div>
    </div>
  )
}

function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.07]">
      <h3 className="font-syne font-bold text-lg tracking-tight">{title}</h3>
      <button onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/70 hover:bg-white/[0.07] transition-all">
        <XCircle size={16} />
      </button>
    </div>
  )
}

function ModalFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-end gap-2 px-6 py-5 border-t border-white/[0.07]">{children}</div>
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function QuestionsPageEnhanced() {
  const {
    questions, isLoading,
    fetchQuestions, createQuestion, updateQuestion, deleteQuestion,
    fetchCategories, fetchJurisdictions, categories, jurisdictions,
    uploadQuestionImage, addOption, updateOption, deleteOption,
    addExplanation, addTip, deleteTip,
  } = useAdminStore();

  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const [showCreateDialog,  setShowCreateDialog]  = useState(false);
  const [showEditDialog,    setShowEditDialog]    = useState(false);
  const [showDeleteDialog,  setShowDeleteDialog]  = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedQuestion,  setSelectedQuestion]  = useState<AdminQuestion | null>(null);

  const [searchQuery,        setSearchQuery]        = useState('');
  const [filterJurisdiction, setFilterJurisdiction] = useState<number | ''>('');
  const [filterCategory,     setFilterCategory]     = useState<number | ''>('');
  const [filterActive,       setFilterActive]       = useState<boolean | ''>('');
  const [currentPage,        setCurrentPage]        = useState(0);
  const pageSize = 20;

  const [formData, setFormData] = useState<CreateQuestionRequest>({
    jurisdictionId: 0, question: '', active: true, options: [],
  });
  const [newOption,      setNewOption]      = useState<CreateOptionRequest>({ text: '', isCorrect: false, position: 1 });
  const [newExplanation, setNewExplanation] = useState('');
  const [newTip,         setNewTip]         = useState('');
  const [imageFile,      setImageFile]      = useState<File | null>(null);
  const [feedback,       setFeedback]       = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => { void Promise.all([fetchCategories(), fetchJurisdictions()]) }, []);
  useEffect(() => { void loadQuestions() }, [currentPage, filterJurisdiction, filterCategory, filterActive]);

  const loadQuestions = async () => {
    const params: Record<string, unknown> = { page: currentPage, size: pageSize };
    if (filterJurisdiction) params.jurisdictionId = filterJurisdiction;
    if (filterCategory)     params.categoryId     = filterCategory;
    if (filterActive !== '') params.active         = filterActive;
    await fetchQuestions(params);
  };

  const filteredQuestions = questions?.content?.filter(q =>
    searchQuery === '' ||
    q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.id.toString().includes(searchQuery)
  ) ?? [];

  const resetForm = () => { setFormData({ jurisdictionId: 0, question: '', active: true, options: [] }); setImageFile(null) }

  const handleCreate = async () => {
    try {
      const created = await createQuestion(formData);
      if (imageFile && created.id) await uploadQuestionImage(created.id, imageFile);
      setShowCreateDialog(false); resetForm(); void loadQuestions();
      setFeedback({ type: 'success', message: 'Question created successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to create question.' }) }
  };

  const handleUpdate = async () => {
    if (!selectedQuestion) return;
    try {
      await updateQuestion(selectedQuestion.id, { question: formData.question, active: formData.active });
      setShowEditDialog(false); setSelectedQuestion(null); resetForm(); void loadQuestions();
      setFeedback({ type: 'success', message: 'Question updated successfully.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to update question.' }) }
  };

  const handleDelete = async () => {
    if (!isAdmin || !selectedQuestion) return;
    try {
      await deleteQuestion(selectedQuestion.id);
      setShowDeleteDialog(false); setSelectedQuestion(null); void loadQuestions();
      setFeedback({ type: 'success', message: 'Question deleted.' });
    } catch { setFeedback({ type: 'error', message: 'Failed to delete question.' }) }
  };

  const handleAddOption = async () => {
    if (!selectedQuestion || !newOption.text) return;
    try {
      await addOption(selectedQuestion.id, newOption);
      setNewOption({ text: '', isCorrect: false, position: selectedQuestion.options.length + 1 });
      void loadQuestions();
    } catch { setFeedback({ type: 'error', message: 'Failed to add option.' }) }
  };

  const handleAddExplanation = async () => {
    if (!selectedQuestion || !newExplanation) return;
    try {
      await addExplanation(selectedQuestion.id, { explanation: newExplanation });
      setNewExplanation(''); void loadQuestions();
    } catch { setFeedback({ type: 'error', message: 'Failed to add explanation.' }) }
  };

  const handleAddTip = async () => {
    if (!selectedQuestion || !newTip) return;
    try {
      await addTip(selectedQuestion.id, { tip: newTip });
      setNewTip(''); void loadQuestions();
    } catch { setFeedback({ type: 'error', message: 'Failed to add tip.' }) }
  };

  const addOptionToForm = () =>
    setFormData(p => ({ ...p, options: [...(p.options ?? []), { text: '', isCorrect: false, position: (p.options?.length ?? 0) + 1 }] }));

  const updateFormOption = (index: number, field: string, value: unknown) => {
    const opts = [...(formData.options ?? [])];
    opts[index] = { ...opts[index], [field]: value };
    setFormData(p => ({ ...p, options: opts }));
  };

  const removeFormOption = (index: number) =>
    setFormData(p => ({ ...p, options: (p.options ?? []).filter((_, i) => i !== index) }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .animate-fade-up  { animation: fadeUp 0.4s ease both; }
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
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                              bg-emerald-300/10 border border-emerald-300/20 mb-3">
                <Sparkles size={11} className="text-emerald-300" />
                <span className="text-[10px] font-medium text-emerald-300/80 uppercase tracking-widest">
                  Admin Question Studio
                </span>
              </div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Questions</h1>
              <p className="text-sm text-white/40 font-light mt-1">
                Manage all questions with options, explanations, and tips.
              </p>
            </div>
            <button onClick={() => setShowCreateDialog(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shrink-0
                         text-[#12131a] bg-emerald-300 hover:opacity-85 transition-all duration-200
                         [box-shadow:0_0_20px_rgba(110,231,183,0.25)]">
              <Plus size={15} /> Create Question
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
            <button onClick={() => setFeedback(null)} className="text-xs text-white/25 underline hover:text-white/50 shrink-0">
              Dismiss
            </button>
          </div>
        )}

        {/* ── Filters ── */}
        <div className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                        shadow-[0_4px_24px_rgba(0,0,0,0.25)] animate-fade-up delay-1">
          <div className="flex items-center gap-2 mb-4">
            <SlidersHorizontal size={13} className="text-white/30" />
            <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Filters</span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative md:col-span-2 xl:col-span-1">
              <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
              <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by ID or question text"
                className={`${inputClass} pl-9`} />
            </div>
            <select value={filterJurisdiction}
              onChange={e => setFilterJurisdiction(e.target.value ? Number(e.target.value) : '')}
              className={selectClass}>
              <option value="">All Jurisdictions</option>
              {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
            </select>
            <select value={filterCategory}
              onChange={e => setFilterCategory(e.target.value ? Number(e.target.value) : '')}
              className={selectClass}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <select value={filterActive === '' ? '' : filterActive ? 'true' : 'false'}
              onChange={e => setFilterActive(e.target.value === '' ? '' : e.target.value === 'true')}
              className={selectClass}>
              <option value="">All Statuses</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button onClick={() => { setCurrentPage(0); void loadQuestions() }} disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
              Fetch Questions
            </button>
          </div>
        </div>

        {/* ── Question list ── */}
        <div className="space-y-3 animate-fade-up delay-2">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-white/[0.06] bg-white/[0.03]" />
            ))
          ) : filteredQuestions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 rounded-2xl
                            border border-dashed border-white/[0.08] text-center">
              <BookOpen size={28} className="text-white/15 mb-3" />
              <p className="text-sm text-white/30 font-light">No questions found for the current filters.</p>
            </div>
          ) : filteredQuestions.map(question => (
            <article key={question.id}
              className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                         hover:border-white/[0.14] transition-all duration-200
                         shadow-[0_2px_16px_rgba(0,0,0,0.2)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-medium text-[#f0f0f5] leading-snug">{question.question}</h3>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium
                                      uppercase tracking-widest border
                                      ${question.active
                                        ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20'
                                        : 'text-white/30 bg-white/[0.04] border-white/[0.09]'}`}>
                      {question.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/30 font-light">
                    <span>ID #{question.id}</span>
                    {question.categoryName    && <span>· {question.categoryName}</span>}
                    {question.jurisdictionName && <span>· {question.jurisdictionName}</span>}
                    <span>· {question.options.length} options</span>
                    {question.explanation && <span className="text-sky-400/70">· Has explanation</span>}
                    {question.tips && question.tips.length > 0 && <span className="text-violet-400/70">· {question.tips.length} tips</span>}
                  </div>
                  {/* Preview first 2 options */}
                  <div className="space-y-1 pt-1">
                    {question.options.slice(0, 2).map((opt, idx) => (
                      <div key={opt.id}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-light
                          ${opt.isCorrect
                            ? 'bg-emerald-300/[0.07] border border-emerald-300/15 text-emerald-300/80'
                            : 'bg-white/[0.03] border border-white/[0.06] text-white/40'}`}>
                        <span className="w-4 h-4 rounded-full bg-white/[0.06] flex items-center justify-center text-[10px] text-white/40 shrink-0">
                          {idx + 1}
                        </span>
                        {opt.text}
                        {opt.isCorrect && <CheckCircle2 size={11} className="ml-auto shrink-0 text-emerald-300" />}
                      </div>
                    ))}
                    {question.options.length > 2 && (
                      <p className="text-[11px] text-white/20 pl-1">+{question.options.length - 2} more options</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => { setSelectedQuestion(question); setShowDetailsDialog(true) }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                               transition-all duration-200">
                    <Info size={12} /> Details
                  </button>
                  <button onClick={() => {
                    setSelectedQuestion(question);
                    setFormData({ jurisdictionId: question.jurisdictionId, question: question.question, active: question.active, categoryId: question.categoryId });
                    setShowEditDialog(true);
                  }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                               text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                               transition-all duration-200">
                    <Edit size={12} /> Edit
                  </button>
                  {isAdmin && (
                    <button onClick={() => { setSelectedQuestion(question); setShowDeleteDialog(true) }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-red-400/60 border border-red-400/20 hover:text-red-400 hover:border-red-400/40
                                 hover:bg-red-400/[0.07] transition-all duration-200">
                      <Trash2 size={12} /> Delete
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* ── Pagination ── */}
        {questions && questions.totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-white/30 tabular-nums">
              {questions.numberOfElements} of {questions.totalElements} questions
            </p>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                <ChevronLeft size={13} /> Previous
              </button>
              <span className="text-xs text-white/30 tabular-nums px-2">
                {currentPage + 1} / {questions.totalPages}
              </span>
              <button onClick={() => setCurrentPage(p => p + 1)}
                disabled={currentPage >= questions.totalPages - 1 || isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                           text-white/50 border border-white/[0.09] hover:text-white/80 hover:border-white/20
                           disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200">
                Next <ChevronRight size={13} />
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════
            Create Dialog
        ══════════════════════════════════════ */}
        <Modal open={showCreateDialog} onClose={() => { setShowCreateDialog(false); resetForm() }} maxWidth="max-w-4xl">
          <ModalHeader title="Create Question" onClose={() => { setShowCreateDialog(false); resetForm() }} />
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <SectionBlock title="Basic Info">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 mb-3">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                    Jurisdiction <span className="text-red-400">*</span>
                  </label>
                  <select value={formData.jurisdictionId}
                    onChange={e => setFormData(p => ({ ...p, jurisdictionId: Number(e.target.value) }))}
                    className={selectClass}>
                    <option value={0}>Select jurisdiction…</option>
                    {jurisdictions.map(j => <option key={j.id} value={j.id}>{j.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">Category</label>
                  <select value={formData.categoryId ?? ''}
                    onChange={e => setFormData(p => ({ ...p, categoryId: e.target.value ? Number(e.target.value) : undefined }))}
                    className={selectClass}>
                    <option value="">No category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-1.5 mb-3">
                <label className="text-[10px] uppercase tracking-widest text-white/30 font-medium">
                  Question text <span className="text-red-400">*</span>
                </label>
                <textarea rows={3} value={formData.question}
                  onChange={e => setFormData(p => ({ ...p, question: e.target.value }))}
                  placeholder="Enter the question text"
                  className={textareaClass} />
              </div>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative shrink-0">
                  <input type="checkbox" checked={formData.active}
                    onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                  peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                  peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
                </div>
                <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Active</span>
              </label>
            </SectionBlock>

            <SectionBlock title="Options" icon={CheckCircle2}
              action={
                <button onClick={addOptionToForm}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium
                             text-emerald-300/70 border border-emerald-300/20 hover:text-emerald-300
                             hover:border-emerald-300/40 transition-all duration-200">
                  <Plus size={11} /> Add Option
                </button>
              }>
              {(formData.options ?? []).length === 0
                ? <p className="text-sm text-white/25 font-light">No options added yet. At least 2 required.</p>
                : <div className="space-y-2">
                  {(formData.options ?? []).map((opt, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white/[0.06] border border-white/[0.09] flex items-center justify-center text-[11px] text-white/40 shrink-0">
                        {index + 1}
                      </span>
                      <input value={opt.text}
                        onChange={e => updateFormOption(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className={`${inputClass} flex-1`} />
                      <label className="flex items-center gap-2 px-3 py-2 rounded-xl border border-white/[0.09] bg-white/[0.04] cursor-pointer shrink-0">
                        <input type="checkbox" checked={opt.isCorrect}
                          onChange={e => updateFormOption(index, 'isCorrect', e.target.checked)}
                          className="sr-only peer" />
                        <div className="w-4 h-4 rounded border border-white/20 bg-white/[0.04]
                                        peer-checked:bg-emerald-300 peer-checked:border-emerald-300
                                        flex items-center justify-center transition-all">
                          {opt.isCorrect && <Check size={10} className="text-[#12131a]" />}
                        </div>
                        <span className="text-xs text-white/50">Correct</span>
                      </label>
                      <ActionBtn variant="danger" onClick={() => removeFormOption(index)}><Trash2 size={13} /></ActionBtn>
                    </div>
                  ))}
                </div>}
            </SectionBlock>

            <SectionBlock title="Image" icon={ImageIcon}>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] cursor-pointer hover:border-white/20 transition-colors group">
                <Upload size={14} className="text-white/25 group-hover:text-white/50 transition-colors" />
                <span className="text-sm text-white/30 font-light group-hover:text-white/50 transition-colors">
                  {imageFile ? imageFile.name : 'Click to upload an image (optional)'}
                </span>
                <input hidden type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] ?? null)} />
              </label>
            </SectionBlock>
          </div>
          <ModalFooter>
            <button onClick={() => { setShowCreateDialog(false); resetForm() }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                         hover:text-white/85 hover:border-white/20 transition-all duration-200">
              Cancel
            </button>
            <button onClick={() => void handleCreate()} disabled={isLoading || !formData.jurisdictionId || !formData.question || (formData.options?.length ?? 0) < 2}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Create Question
            </button>
          </ModalFooter>
        </Modal>

        {/* ══════════════════════════════════════
            Edit Dialog
        ══════════════════════════════════════ */}
        <Modal open={showEditDialog} onClose={() => { setShowEditDialog(false); setSelectedQuestion(null); resetForm() }}>
          <ModalHeader title="Edit Question" onClose={() => { setShowEditDialog(false); setSelectedQuestion(null); resetForm() }} />
          <div className="px-6 py-5 space-y-4">
            <SectionBlock title="Question Text">
              <textarea rows={3} value={formData.question}
                onChange={e => setFormData(p => ({ ...p, question: e.target.value }))}
                className={textareaClass} />
            </SectionBlock>
            <SectionBlock title="Status">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative shrink-0">
                  <input type="checkbox" checked={formData.active}
                    onChange={e => setFormData(p => ({ ...p, active: e.target.checked }))}
                    className="sr-only peer" />
                  <div className="w-10 h-5 rounded-full border border-white/[0.12] bg-white/[0.06]
                                  peer-checked:bg-emerald-300/80 peer-checked:border-emerald-300/40 transition-all duration-200" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white/40
                                  peer-checked:translate-x-[18px] peer-checked:bg-[#12131a] transition-all duration-200" />
                </div>
                <span className="text-sm font-light text-white/60 group-hover:text-white/80 transition-colors">Active</span>
              </label>
            </SectionBlock>
          </div>
          <ModalFooter>
            <button onClick={() => { setShowEditDialog(false); setSelectedQuestion(null); resetForm() }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                         hover:text-white/85 hover:border-white/20 transition-all duration-200">
              Cancel
            </button>
            <button onClick={() => void handleUpdate()} disabled={isLoading || !formData.question}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                         text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-50
                         transition-all duration-200 [box-shadow:0_0_16px_rgba(110,231,183,0.20)]">
              {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Save Changes
            </button>
          </ModalFooter>
        </Modal>

        {/* ══════════════════════════════════════
            Delete Dialog
        ══════════════════════════════════════ */}
        {isAdmin && (
          <Modal open={showDeleteDialog} onClose={() => { setShowDeleteDialog(false); setSelectedQuestion(null) }} maxWidth="max-w-md">
            <div className="px-6 pt-6 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20 flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <h3 className="font-syne font-bold text-base tracking-tight text-red-400">Delete Question</h3>
              </div>
              <p className="text-sm text-white/45 font-light mt-3">
                This performs a soft delete and removes the question from active workflows.
              </p>
              {selectedQuestion && (
                <div className="mt-4 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                  <p className="text-sm text-white/60 font-light leading-relaxed">{selectedQuestion.question}</p>
                </div>
              )}
            </div>
            <ModalFooter>
              <button onClick={() => { setShowDeleteDialog(false); setSelectedQuestion(null) }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-white/55
                           border border-white/[0.09] hover:text-white/85 hover:border-white/20 transition-all duration-200">
                Cancel
              </button>
              <button onClick={() => void handleDelete()} disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-[#12131a] bg-red-400 hover:opacity-85 disabled:opacity-50 transition-all duration-200
                           [box-shadow:0_0_20px_rgba(248,113,113,0.25)]">
                {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete
              </button>
            </ModalFooter>
          </Modal>
        )}

        {/* ══════════════════════════════════════
            Details Dialog
        ══════════════════════════════════════ */}
        <Modal open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="max-w-5xl">
          <ModalHeader title="Question Details & Management" onClose={() => setShowDetailsDialog(false)} />
          {selectedQuestion && (
            <div className="px-6 py-5 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Question summary */}
              <SectionBlock title="Question">
                <p className="text-sm font-medium leading-relaxed text-[#f0f0f5] mb-2">{selectedQuestion.question}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30 font-light">
                  <span>ID #{selectedQuestion.id}</span>
                  <span>· {selectedQuestion.jurisdictionName ?? 'Unknown jurisdiction'}</span>
                  {selectedQuestion.categoryName && <span>· {selectedQuestion.categoryName}</span>}
                </div>
              </SectionBlock>

              {/* Options */}
              <SectionBlock title="Options" icon={CheckCircle2}
                action={
                  <span className="text-[10px] text-white/25 font-light">
                    {selectedQuestion.options.length} total
                  </span>
                }>
                <div className="space-y-2 mb-4">
                  {selectedQuestion.options.length === 0
                    ? <p className="text-sm text-white/25 font-light">No options added yet.</p>
                    : selectedQuestion.options.map((opt, idx) => (
                      <div key={opt.id}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border text-sm
                          ${opt.isCorrect
                            ? 'bg-emerald-300/[0.06] border-emerald-300/15 text-emerald-300/90'
                            : 'bg-white/[0.02] border-white/[0.07] text-white/60'}`}>
                        <span className="w-5 h-5 rounded-full bg-white/[0.07] flex items-center justify-center text-[11px] text-white/40 shrink-0">
                          {idx + 1}
                        </span>
                        <span className="flex-1 font-light">{opt.text}</span>
                        {opt.isCorrect && <CheckCircle2 size={13} className="shrink-0 text-emerald-300" />}
                        {isAdmin && (
                          <ActionBtn variant="danger"
                            onClick={async () => { await deleteOption(opt.id); void loadQuestions() }}>
                            <Trash2 size={12} />
                          </ActionBtn>
                        )}
                      </div>
                    ))}
                </div>

                {/* Add option inline */}
                <div className="rounded-xl border border-dashed border-white/[0.10] bg-white/[0.01] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-white/25 font-medium mb-2">Add New Option</p>
                  <div className="flex items-center gap-2">
                    <input value={newOption.text}
                      onChange={e => setNewOption(p => ({ ...p, text: e.target.value }))}
                      placeholder="Option text…"
                      className={`${inputClass} flex-1`} />
                    <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-white/[0.09] bg-white/[0.04] cursor-pointer shrink-0">
                      <input type="checkbox" checked={newOption.isCorrect}
                        onChange={e => setNewOption(p => ({ ...p, isCorrect: e.target.checked }))}
                        className="sr-only peer" />
                      <div className="w-4 h-4 rounded border border-white/20 bg-white/[0.04] flex items-center justify-center transition-all peer-checked:bg-emerald-300 peer-checked:border-emerald-300">
                        {newOption.isCorrect && <Check size={10} className="text-[#12131a]" />}
                      </div>
                      <span className="text-xs text-white/50">Correct</span>
                    </label>
                    <button onClick={() => void handleAddOption()} disabled={!newOption.text}
                      className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium shrink-0
                                 text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-40 transition-all">
                      <Plus size={12} /> Add
                    </button>
                  </div>
                </div>
              </SectionBlock>

              {/* Explanation */}
              <SectionBlock title="Explanation" icon={MessageSquare}>
                {selectedQuestion.explanation ? (
                  <p className="text-sm text-white/70 font-light leading-relaxed">
                    {selectedQuestion.explanation.explanation}
                  </p>
                ) : (
                  <div className="space-y-2">
                    <textarea rows={3} value={newExplanation}
                      onChange={e => setNewExplanation(e.target.value)}
                      placeholder="Add an explanation for this question…"
                      className={textareaClass} />
                    <div className="flex justify-end">
                      <button onClick={() => void handleAddExplanation()} disabled={!newExplanation}
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                   text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-40 transition-all">
                        <Plus size={12} /> Add Explanation
                      </button>
                    </div>
                  </div>
                )}
              </SectionBlock>

              {/* Tips */}
              <SectionBlock title="Tips" icon={Lightbulb}>
                {selectedQuestion.tips && selectedQuestion.tips.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {selectedQuestion.tips.map(tip => (
                      <div key={tip.id}
                        className="flex items-start justify-between gap-3 px-4 py-3 rounded-xl
                                   border border-violet-300/15 bg-violet-300/[0.04]">
                        <div className="flex-1 min-w-0">
                          {tip.title && <p className="text-xs font-medium text-white/50 mb-1">{tip.title}</p>}
                          <p className="text-sm text-white/70 font-light">{tip.body}</p>
                        </div>
                        {isAdmin && (
                          <ActionBtn variant="danger"
                            onClick={async () => { await deleteTip(tip.id); void loadQuestions() }}>
                            <Trash2 size={12} />
                          </ActionBtn>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-2">
                  <textarea rows={2} value={newTip}
                    onChange={e => setNewTip(e.target.value)}
                    placeholder="Add a helpful tip for this question…"
                    className={textareaClass} />
                  <div className="flex justify-end">
                    <button onClick={() => void handleAddTip()} disabled={!newTip}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium
                                 text-[#12131a] bg-emerald-300 hover:opacity-85 disabled:opacity-40 transition-all">
                      <Plus size={12} /> Add Tip
                    </button>
                  </div>
                </div>
              </SectionBlock>

              {/* Image */}
              <SectionBlock title="Question Image" icon={ImageIcon}>
                {selectedQuestion.assets && selectedQuestion.assets.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {selectedQuestion.assets.map((asset, idx) => (
                      <img key={idx} src={asset.url} alt="Question asset"
                        className="w-full rounded-xl border border-white/[0.07] object-cover" />
                    ))}
                  </div>
                ) : (
                  <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/[0.10] bg-white/[0.02] cursor-pointer hover:border-white/20 transition-colors group">
                    <Upload size={14} className="text-white/25 group-hover:text-white/50 transition-colors" />
                    <span className="text-sm text-white/30 font-light">Click to upload an image</span>
                    <input hidden type="file" accept="image/*"
                      onChange={e => { const f = e.target.files?.[0]; if (f) void uploadQuestionImage(selectedQuestion.id, f).then(() => loadQuestions()) }} />
                  </label>
                )}
              </SectionBlock>
            </div>
          )}
          <ModalFooter>
            <button onClick={() => setShowDetailsDialog(false)}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white/55 border border-white/[0.09]
                         hover:text-white/85 hover:border-white/20 transition-all duration-200">
              Close
            </button>
          </ModalFooter>
        </Modal>

      </div>
    </>
  );
}