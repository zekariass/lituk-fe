"use client"

import { useEffect, useState } from 'react'
import { useAdminStore } from '@/lib/store/admin-store'
import { MockTest } from '@/lib/types/admin'
import {
  Search, Trash2, CheckCircle2, XCircle, Clock,
  Loader2, ClipboardList, ChevronLeft, ChevronRight, SlidersHorizontal,
} from 'lucide-react'

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ test }: { test: MockTest }) {
  if (test.status === 'in_progress') return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                     tracking-widest uppercase px-2.5 py-1 rounded-full border
                     text-amber-300 bg-amber-300/10 border-amber-300/20">
      <Clock size={10} /> In Progress
    </span>
  )
  if (test.status === 'completed') return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium
                      tracking-widest uppercase px-2.5 py-1 rounded-full border
                      ${test.passed
                        ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20'
                        : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
      {test.passed
        ? <><CheckCircle2 size={10} /> Passed</>
        : <><XCircle      size={10} /> Failed</>}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                     tracking-widest uppercase px-2.5 py-1 rounded-full border
                     text-white/30 bg-white/[0.04] border-white/[0.09]">
      <XCircle size={10} /> Abandoned
    </span>
  )
}

const inputClass = `
  text-sm text-[#f0f0f5] font-light bg-[#181920] border border-white/[0.09] rounded-xl
  px-4 py-2.5 focus:outline-none focus:border-emerald-300/40 transition-colors duration-200
  placeholder:text-white/20
`

export default function MockTestsPage() {
  const { mockTests, isLoading, fetchMockTests, deleteMockTest, updateMockTestStatus } = useAdminStore()

  const [searchTerm, setSearchTerm]         = useState('')
  const [statusFilter, setStatusFilter]     = useState('')
  const [currentPage, setCurrentPage]       = useState(0)
  const [selectedTest, setSelectedTest]     = useState<MockTest | null>(null)
  const [showDeleteDialog, setShowDeleteDialog]   = useState(false)
  const [showStatusDialog, setShowStatusDialog]   = useState(false)
  const [newStatus, setNewStatus]           = useState('')
  const [isActing, setIsActing]             = useState(false)

  useEffect(() => { loadMockTests() }, [currentPage, statusFilter])

  const loadMockTests = async () => {
    const params: Record<string, any> = {
      page: currentPage, size: 20, sortBy: 'createdAt', sortDir: 'desc',
    }
    if (statusFilter) params.status = statusFilter
    await fetchMockTests(params)
  }

  const handleDelete = async () => {
    if (!selectedTest) return
    setIsActing(true)
    try {
      await deleteMockTest(selectedTest.id)
      setShowDeleteDialog(false); setSelectedTest(null)
      loadMockTests()
    } catch (err) { console.error(err) }
    finally { setIsActing(false) }
  }

  const handleStatusChange = async () => {
    if (!selectedTest || !newStatus) return
    setIsActing(true)
    try {
      await updateMockTestStatus(selectedTest.id, newStatus)
      setShowStatusDialog(false); setSelectedTest(null); setNewStatus('')
      loadMockTests()
    } catch (err) { console.error(err) }
    finally { setIsActing(false) }
  }

  const filteredTests = mockTests?.content.filter((test) => {
    const q = searchTerm.toLowerCase()
    return (
      test.userName?.toLowerCase().includes(q) ||
      test.userEmail.toLowerCase().includes(q) ||
      test.jurisdiction.name.toLowerCase().includes(q) ||
      test.licenceCategory.name.toLowerCase().includes(q)
    )
  }) ?? []

  const COL_HEADERS = ['User', 'Jurisdiction', 'Category', 'Progress', 'Score', 'Status', 'Date', '']

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fadeUp 0.4s ease both; }
        .delay-1 { animation-delay: 0.07s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4 animate-fade-up">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                            flex items-center justify-center shrink-0">
              <ClipboardList size={14} className="text-emerald-300" />
            </div>
            <div>
              <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Mock Tests</h1>
              <p className="text-xs text-white/35 font-light">Manage and monitor all mock tests</p>
            </div>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="flex gap-3 animate-fade-up">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <input
              type="text"
              placeholder="Search user, email, jurisdiction…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`${inputClass} pl-9 w-full`}
            />
          </div>
          <div className="relative">
            <SlidersHorizontal size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25 pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(0) }}
              className={`${inputClass} pl-9 pr-4 appearance-none cursor-pointer
                          [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]`}
            >
              <option value="">All Statuses</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="abandoned">Abandoned</option>
            </select>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="bg-[#181920] border border-white/[0.07] rounded-2xl overflow-hidden
                        shadow-[0_4px_24px_rgba(0,0,0,0.25)] animate-fade-up delay-1">

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={24} className="animate-spin text-emerald-300/50" />
            </div>

          ) : filteredTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.07]
                              flex items-center justify-center mb-4">
                <ClipboardList size={20} className="text-white/20" />
              </div>
              <p className="text-sm font-medium text-white/40 mb-1">No mock tests found</p>
              <p className="text-xs text-white/25 font-light">Try adjusting your search or filters</p>
            </div>

          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">

                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {COL_HEADERS.map((h, i) => (
                      <th
                        key={i}
                        className={`px-5 py-3.5 text-[10px] uppercase tracking-widest
                                   text-white/25 font-medium whitespace-nowrap
                                   ${i === COL_HEADERS.length - 1 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.04]">
                  {filteredTests.map((test) => {
                    const progress = Math.round((test.questionsAnswered / test.totalQuestions) * 100)
                    return (
                      <tr key={test.id} className="hover:bg-white/[0.03] transition-colors duration-150">

                        {/* User */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-[#f0f0f5]">
                            {test.userName || 'N/A'}
                          </p>
                          <p className="text-[11px] text-white/30 font-light">{test.userEmail}</p>
                        </td>

                        {/* Jurisdiction */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-white/70">{test.jurisdiction.name}</p>
                          <p className="text-[11px] text-white/25 font-light">{test.jurisdiction.code}</p>
                        </td>

                        {/* Category */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-white/70">{test.licenceCategory.name}</p>
                          <p className="text-[11px] text-white/25 font-light">{test.licenceCategory.code}</p>
                        </td>

                        {/* Progress */}
                        <td className="px-5 py-4">
                          <p className="text-[11px] tabular-nums text-white/40 mb-1.5">
                            {test.questionsAnswered}/{test.totalQuestions}
                          </p>
                          <div className="w-24 h-1.5 rounded-full bg-white/[0.08] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-emerald-300/70"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </td>

                        {/* Score */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-medium tabular-nums text-[#f0f0f5]">
                            {test.totalScore}/{test.totalQuestions}
                          </p>
                          <p className="text-[11px] text-white/30 tabular-nums font-light">
                            {test.correctAnswers} correct
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <StatusBadge test={test} />
                        </td>

                        {/* Date */}
                        <td className="px-5 py-4">
                          <p className="text-sm text-white/50 tabular-nums">
                            {new Date(test.createdAt).toLocaleDateString()}
                          </p>
                          <p className="text-[11px] text-white/25 tabular-nums font-light">
                            {new Date(test.createdAt).toLocaleTimeString()}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedTest(test)
                                setNewStatus(test.status)
                                setShowStatusDialog(true)
                              }}
                              title="Change Status"
                              className="w-8 h-8 flex items-center justify-center rounded-lg
                                         text-white/30 hover:text-white/70 hover:bg-white/[0.07]
                                         transition-all duration-150"
                            >
                              <SlidersHorizontal size={13} />
                            </button>
                            <button
                              onClick={() => { setSelectedTest(test); setShowDeleteDialog(true) }}
                              title="Delete"
                              className="w-8 h-8 flex items-center justify-center rounded-lg
                                         text-white/30 hover:text-red-400 hover:bg-red-400/[0.08]
                                         transition-all duration-150"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Pagination ── */}
        {mockTests && mockTests.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30 tabular-nums">
              {mockTests.numberOfElements} of {mockTests.totalElements} results
            </p>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
                className="w-9 h-9 flex items-center justify-center rounded-xl
                           text-white/40 border border-white/[0.07]
                           hover:text-white/70 hover:border-white/15
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                <ChevronLeft size={14} />
              </button>

              {Array.from({ length: mockTests.totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i)}
                  className={`w-9 h-9 rounded-xl text-sm tabular-nums font-medium
                               transition-all duration-200
                               ${currentPage === i
                                 ? 'bg-emerald-300 text-[#12131a] [box-shadow:0_0_12px_rgba(110,231,183,0.25)]'
                                 : 'text-white/35 border border-white/[0.07] hover:text-white/70 hover:border-white/15'}`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= mockTests.totalPages - 1}
                className="w-9 h-9 flex items-center justify-center rounded-xl
                           text-white/40 border border-white/[0.07]
                           hover:text-white/70 hover:border-white/15
                           disabled:opacity-30 disabled:cursor-not-allowed
                           transition-all duration-200"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {/* ── Delete dialog ── */}
        {showDeleteDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                          bg-black/65 backdrop-blur-sm">
            <div className="bg-[#181920] border border-white/[0.09] rounded-2xl w-full max-w-sm
                            overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-white/[0.07]">
                <div className="w-9 h-9 rounded-xl bg-red-400/10 border border-red-400/20
                                flex items-center justify-center shrink-0">
                  <Trash2 size={15} className="text-red-400" />
                </div>
                <h3 className="font-syne font-bold text-base tracking-tight text-red-400">
                  Delete Mock Test
                </h3>
              </div>
              <div className="px-6 py-5">
                <p className="text-sm text-white/50 font-light leading-relaxed">
                  Are you sure you want to delete this test for{' '}
                  <span className="text-[#f0f0f5] font-medium">
                    {selectedTest?.userName || selectedTest?.userEmail}
                  </span>?
                  This action cannot be undone.
                </p>
              </div>
              <div className="px-6 pb-6 pt-2 flex gap-2.5 border-t border-white/[0.07]">
                <button
                  onClick={() => { setShowDeleteDialog(false); setSelectedTest(null) }}
                  disabled={isActing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-white/55 border border-white/[0.09] bg-white/[0.03]
                             hover:text-white/85 hover:border-white/20
                             disabled:opacity-40 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isActing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             flex items-center justify-center gap-2
                             text-[#12131a] bg-red-400
                             hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200
                             [box-shadow:0_0_20px_rgba(248,113,113,0.25)]"
                >
                  {isActing
                    ? <><Loader2 size={14} className="animate-spin" />Deleting…</>
                    : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Status dialog ── */}
        {showStatusDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4
                          bg-black/65 backdrop-blur-sm">
            <div className="bg-[#181920] border border-white/[0.09] rounded-2xl w-full max-w-sm
                            overflow-hidden shadow-[0_24px_64px_rgba(0,0,0,0.55)]">
              <div className="flex items-center gap-3 px-6 pt-6 pb-5 border-b border-white/[0.07]">
                <div className="w-9 h-9 rounded-xl bg-emerald-300/10 border border-emerald-300/20
                                flex items-center justify-center shrink-0">
                  <SlidersHorizontal size={15} className="text-emerald-300" />
                </div>
                <h3 className="font-syne font-bold text-base tracking-tight text-emerald-300">
                  Change Test Status
                </h3>
              </div>
              <div className="px-6 py-5 space-y-1.5">
                <label className="block text-[10px] uppercase tracking-widest text-white/30 font-medium">
                  New Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm text-[#f0f0f5] font-light
                             bg-white/[0.04] border border-white/[0.09]
                             focus:outline-none focus:border-emerald-300/40
                             transition-colors duration-200
                             [&>option]:bg-[#181920] [&>option]:text-[#f0f0f5]"
                >
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="abandoned">Abandoned</option>
                </select>
              </div>
              <div className="px-6 pb-6 pt-2 flex gap-2.5 border-t border-white/[0.07]">
                <button
                  onClick={() => { setShowStatusDialog(false); setSelectedTest(null); setNewStatus('') }}
                  disabled={isActing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             text-white/55 border border-white/[0.09] bg-white/[0.03]
                             hover:text-white/85 hover:border-white/20
                             disabled:opacity-40 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusChange}
                  disabled={isActing}
                  className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                             flex items-center justify-center gap-2
                             text-[#12131a] bg-emerald-300
                             hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200
                             [box-shadow:0_0_20px_rgba(110,231,183,0.25)]"
                >
                  {isActing
                    ? <><Loader2 size={14} className="animate-spin" />Updating…</>
                    : 'Update Status'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  )
}