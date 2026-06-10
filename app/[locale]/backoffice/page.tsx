"use client"

import { useEffect, useState } from 'react'
import { useAdminStore } from '@/lib/store/admin-store'
import {
  Users, FileQuestion, ClipboardList, TrendingUp,
  Activity, CheckCircle2, XCircle, Clock,
  ArrowRight,
} from 'lucide-react'

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status, passed }: { status: string; passed?: boolean }) {
  if (status === 'in_progress') return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                     tracking-widest uppercase px-2.5 py-1 rounded-full border
                     text-amber-300 bg-amber-300/10 border-amber-300/20">
      <Clock size={10} /> In Progress
    </span>
  )
  if (status === 'completed') return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium
                      tracking-widest uppercase px-2.5 py-1 rounded-full border
                      ${passed
                        ? 'text-emerald-300 bg-emerald-300/10 border-emerald-300/20'
                        : 'text-red-400 bg-red-400/10 border-red-400/20'}`}>
      {passed
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

export default function BackofficeDashboard() {
  const { fetchUsers, fetchQuestions, fetchMockTests, users, questions, mockTests } = useAdminStore()

  const [stats, setStats] = useState({
    totalUsers: 0, totalQuestions: 0, totalMockTests: 0,
    activeMockTests: 0, completedMockTests: 0, abandonedMockTests: 0,
  })

  useEffect(() => {
    const load = async () => {
      try {
        await Promise.all([
          fetchUsers({ page: 0, size: 1 }),
          fetchQuestions({ page: 0, size: 1 }),
          fetchMockTests({ page: 0, size: 100 }),
        ])
      } catch (e) { console.error('Failed to load dashboard data:', e) }
    }
    load()
  }, [fetchUsers, fetchQuestions, fetchMockTests])

  useEffect(() => {
    if (!users || !questions || !mockTests) return
    setStats({
      totalUsers:          users.totalElements      ?? 0,
      totalQuestions:      questions.totalElements  ?? 0,
      totalMockTests:      mockTests.totalElements  ?? 0,
      activeMockTests:     mockTests.content?.filter(mt => mt.status === 'in_progress').length  ?? 0,
      completedMockTests:  mockTests.content?.filter(mt => mt.status === 'completed').length    ?? 0,
      abandonedMockTests:  mockTests.content?.filter(mt => mt.status === 'abandoned').length    ?? 0,
    })
  }, [users, questions, mockTests])

  const statCards = [
    {
      label: 'Total Users',     value: stats.totalUsers,
      icon: Users,
      color: 'text-sky-300',    bg: 'bg-sky-300/[0.08]',   border: 'border-sky-300/[0.14]',
    },
    {
      label: 'Total Questions', value: stats.totalQuestions,
      icon: FileQuestion,
      color: 'text-violet-300', bg: 'bg-violet-300/[0.08]', border: 'border-violet-300/[0.14]',
    },
    {
      label: 'Total Tests',     value: stats.totalMockTests,
      icon: ClipboardList,
      color: 'text-emerald-300', bg: 'bg-emerald-300/[0.08]', border: 'border-emerald-300/[0.14]',
    },
    {
      label: 'Active Tests',    value: stats.activeMockTests,
      icon: Activity,
      color: 'text-amber-300',  bg: 'bg-amber-300/[0.08]',  border: 'border-amber-300/[0.14]',
    },
    {
      label: 'Completed',       value: stats.completedMockTests,
      icon: CheckCircle2,
      color: 'text-emerald-300', bg: 'bg-emerald-300/[0.08]', border: 'border-emerald-300/[0.14]',
    },
    {
      label: 'Abandoned',       value: stats.abandonedMockTests,
      icon: XCircle,
      color: 'text-red-400',    bg: 'bg-red-400/[0.08]',   border: 'border-red-400/[0.14]',
    },
  ]

  const quickActions = [
    {
      href: '/backoffice/questions',  icon: FileQuestion,  label: 'Questions',        desc: 'Create and edit questions' },
    {
      href: '/backoffice/mock-tests', icon: ClipboardList, label: 'Mock Tests',       desc: 'View and manage tests' },
    {
      href: '/backoffice/users',      icon: Users,         label: 'User Management',  desc: 'Manage user accounts' },
    {
      href: '/backoffice/categories', icon: TrendingUp,    label: 'Categories',       desc: 'Organize questions' },
  ]

  const recentMockTests = mockTests?.content.slice(0, 5) ?? []

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
        .delay-2 { animation-delay: 0.14s; }
        .delay-3 { animation-delay: 0.21s; }
      `}</style>

      <div className="font-dm text-[#f0f0f5] space-y-7">

        {/* ── Header ── */}
        <div className="animate-fade-up">
          <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Dashboard</h1>
          <p className="text-sm text-white/40 font-light mt-1">
            Welcome to the admin back office. Manage your system from here.
          </p>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 animate-fade-up delay-1">
          {statCards.map(({ label, value, icon: Icon, color, bg, border }) => (
            <div key={label}
                 className="bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                             shadow-[0_2px_16px_rgba(0,0,0,0.25)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-widest text-white/30 font-medium mb-2">
                    {label}
                  </p>
                  <p className="font-syne font-bold text-2xl sm:text-3xl text-[#f0f0f5]">
                    {value.toLocaleString()}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${bg} ${border}`}>
                  <Icon size={17} className={color} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Recent mock tests ── */}
        <div className="bg-[#181920] border border-white/[0.07] rounded-2xl
                        shadow-[0_4px_24px_rgba(0,0,0,0.25)] overflow-hidden animate-fade-up delay-2">

          <div className="px-6 py-5 border-b border-white/[0.07]">
            <h2 className="font-syne font-bold text-lg tracking-tight">Recent Mock Tests</h2>
            <p className="text-xs text-white/35 font-light mt-0.5">Latest mock test activities</p>
          </div>

          {recentMockTests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] flex items-center
                              justify-center mb-4">
                <ClipboardList size={20} className="text-white/20" />
              </div>
              <p className="text-sm text-white/30 font-light">No mock tests found</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {recentMockTests.map((test) => (
                <div
                  key={test.id}
                  className="flex items-center justify-between gap-4 px-6 py-4
                             hover:bg-white/[0.03] transition-colors duration-150"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    {/* Name + meta */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-[#f0f0f5] truncate">
                        {test.userName || test.userEmail}
                      </span>
                      <span className="text-xs text-white/25 font-light shrink-0">
                        {test.jurisdiction.name} · {test.licenceCategory.name}
                      </span>
                    </div>
                    {/* Stats row */}
                    <div className="flex items-center gap-3 text-xs text-white/30 font-light">
                      <span className="tabular-nums">
                        {test.questionsAnswered}/{test.totalQuestions} questions
                      </span>
                      <span className="w-px h-3 bg-white/10" />
                      <span className="tabular-nums">
                        Score {test.totalScore}/{test.passingScore}
                      </span>
                      <span className="w-px h-3 bg-white/10" />
                      <span>{new Date(test.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <StatusBadge status={test.status} passed={test.passed} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-up delay-3">
          {quickActions.map(({ href, icon: Icon, label, desc }) => (
            <a
              key={href}
              href={href}
              className="group flex flex-col bg-[#181920] border border-white/[0.07] rounded-2xl p-5
                         hover:border-white/[0.14] hover:bg-[#1e1f2b]
                         shadow-[0_2px_16px_rgba(0,0,0,0.20)]
                         hover:shadow-[0_4px_24px_rgba(0,0,0,0.35)]
                         transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-300/[0.08] border border-emerald-300/[0.14]
                              flex items-center justify-center mb-4
                              group-hover:bg-emerald-300/[0.13] transition-colors duration-200">
                <Icon size={16} className="text-emerald-300/80" />
              </div>
              <p className="font-syne font-bold text-sm tracking-tight text-[#f0f0f5] mb-1">
                {label}
              </p>
              <p className="text-xs text-white/35 font-light leading-relaxed flex-1">{desc}</p>
              <div className="mt-4 flex items-center gap-1 text-[11px] font-medium text-emerald-300/50
                              group-hover:text-emerald-300/80 transition-colors duration-200">
                Open
                <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform duration-200" />
              </div>
            </a>
          ))}
        </div>

      </div>
    </>
  )
}