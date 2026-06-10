"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useLeaderboardStore, useAuthStore } from '@/lib/store'
import { Trophy, TrendingUp, Clock, Target, Crown, Medal, Award, Loader2 } from 'lucide-react'

type Period = 'DAILY' | 'WEEKLY' | 'MONTHLY'

const PERIOD_LABELS: Record<Period, string> = {
  DAILY:   'Daily',
  WEEKLY:  'Weekly',
  MONTHLY: 'Monthly',
}

const RANK_META: Record<number, { icon: React.ReactNode; ring: string; bg: string }> = {
  1: {
    icon: <Crown  size={16} className="text-primary" />,
    ring: 'border-primary/40 bg-primary/[0.07]',
    bg:   'bg-primary/[0.04]',
  },
  2: {
    icon: <Medal  size={16} className="text-foreground/50" />,
    ring: 'border-foreground/20 bg-foreground/[0.04]',
    bg:   'bg-foreground/[0.02]',
  },
  3: {
    icon: <Award  size={16} className="text-primary/70" />,
    ring: 'border-primary/30 bg-primary/[0.06]',
    bg:   'bg-primary/[0.02]',
  },
}

export default function LeaderboardPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { entries, currentUserRank, period, isLoading, fetchLeaderboard, setPeriod } =
    useLeaderboardStore()

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchLeaderboard(period)
  }, [isAuthenticated, period, router])

  if (!isAuthenticated) return null

  const handlePeriodChange = (p: Period) => {
    setPeriod(p)
    fetchLeaderboard(p)
  }

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
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>

      <div className="font-dm space-y-6 text-foreground">

        {/* ── Header ── */}
        <div className="animate-fade-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20
                            flex items-center justify-center">
              <Trophy size={16} className="text-primary" />
            </div>
            <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground font-light mt-1 ml-12">
            Compete with other learners and climb the ranks
          </p>
        </div>

        {/* ── Period switcher ── */}
        <div className="flex items-center gap-2 animate-fade-up delay-1">
          <div className="flex items-center gap-1.5 p-1 bg-muted/20 border border-border rounded-xl">
            {(['DAILY', 'WEEKLY', 'MONTHLY'] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => handlePeriodChange(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                            ${period === p
                              ? 'bg-primary text-primary-foreground [box-shadow:0_0_16px_hsl(var(--primary)/0.25)]'
                              : 'text-foreground/40 hover:text-foreground/70'}`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* ── Your rank banner ── */}
        {currentUserRank && (
          <div className="rounded-2xl border border-primary/25 bg-primary/[0.05]
                          p-5 animate-fade-up delay-1
                          shadow-[0_0_32px_hsl(var(--primary)/0.07)]">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0
                                ${RANK_META[currentUserRank.rank]?.ring ?? 'border-primary/20 bg-primary/[0.07]'}`}>
                  {currentUserRank.rank <= 3
                    ? RANK_META[currentUserRank.rank].icon
                    : <span className="font-syne font-bold text-sm text-foreground/50">
                        #{currentUserRank.rank}
                      </span>}
                </div>
                <div>
                  <p className="font-syne font-bold text-base tracking-tight">Your Rank</p>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">
                    {currentUserRank.accuracy}% accuracy · {currentUserRank.averageTime}s avg
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="font-syne font-extrabold text-2xl text-primary">
                  {currentUserRank.points}
                </p>
                <p className="text-[11px] text-muted-foreground uppercase tracking-widest">points</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>

        ) : entries.length === 0 ? (
          /* ── Empty state ── */
          <div className="flex flex-col items-center justify-center py-20 text-center
                          border border-border rounded-2xl bg-card">
            <div className="w-14 h-14 rounded-2xl bg-primary/[0.07] border border-primary/[0.12]
                            flex items-center justify-center mb-5">
              <Trophy size={22} className="text-primary/50" />
            </div>
            <h3 className="font-syne font-bold text-base tracking-tight mb-1.5">No Rankings Yet</h3>
            <p className="text-sm text-muted-foreground font-light">
              Start practicing to appear on the leaderboard!
            </p>
          </div>

        ) : (
          /* ── Table ── */
          <div className="bg-card border border-border rounded-2xl overflow-hidden
                          shadow-[0_4px_24px_rgba(0,0,0,0.12)] animate-fade-up delay-2">

            {/* Table header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-4
                            px-5 py-3 border-b border-border bg-muted/10">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium w-10">
                Rank
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">
                User
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium text-right w-16">
                Points
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium text-right w-16 hidden sm:block">
                Accuracy
              </p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium text-right w-16 hidden sm:block">
                Avg Time
              </p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-border/50">
              {entries.map((entry, idx) => {
                const meta      = RANK_META[entry.rank]
                const isTop3    = entry.rank <= 3
                const isMe      = entry.isCurrentUser

                return (
                  <div
                    key={entry.userId}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-x-4
                                px-5 py-3.5 transition-colors duration-150
                                ${isMe
                                  ? 'bg-primary/[0.04] hover:bg-primary/[0.06]'
                                  : isTop3
                                  ? `${meta?.bg} hover:bg-muted/20`
                                  : 'hover:bg-muted/10'}`}
                    style={{ animationDelay: `${0.14 + idx * 0.03}s` }}
                  >
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0
                                    ${isTop3 ? meta.ring : 'border-transparent bg-transparent'}`}>
                      {isTop3
                        ? meta.icon
                        : <span className="text-xs font-medium text-foreground/30 tabular-nums">
                            #{entry.rank}
                          </span>}
                    </div>

                    {/* Username */}
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-sm font-medium truncate
                                        ${isMe ? 'text-primary' : 'text-foreground'}`}>
                        {entry.userName}
                      </span>
                      {isMe && (
                        <span className="text-[10px] font-medium tracking-widest uppercase
                                         text-primary bg-primary/10 border border-primary/20
                                         px-2 py-0.5 rounded-full shrink-0">
                          You
                        </span>
                      )}
                    </div>

                    {/* Points */}
                    <div className="flex items-center justify-end gap-1.5 w-16">
                      <Trophy size={12} className="text-primary/70 shrink-0" />
                      <span className="font-syne font-bold text-sm tabular-nums text-primary/70">
                        {entry.points}
                      </span>
                    </div>

                    {/* Accuracy */}
                    <div className="hidden sm:flex items-center justify-end gap-1.5 w-16">
                      <Target size={12} className="text-primary/60 shrink-0" />
                      <span className="text-sm tabular-nums text-foreground/60">{entry.accuracy}%</span>
                    </div>

                    {/* Avg time */}
                    <div className="hidden sm:flex items-center justify-end gap-1.5 w-16">
                      <Clock size={12} className="text-foreground/25 shrink-0" />
                      <span className="text-sm tabular-nums text-foreground/40">{entry.averageTime}s</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ── Info cards ── */}
        <div className="grid sm:grid-cols-3 gap-3 animate-fade-up delay-3">
          {[
            {
              icon: Trophy,
              iconColor: 'text-primary',
              iconBg: 'bg-primary/[0.07] border-primary/[0.12]',
              title: 'How It Works',
              body: 'Earn points by answering questions correctly. Speed and accuracy both matter!',
            },
            {
              icon: TrendingUp,
              iconColor: 'text-primary',
              iconBg: 'bg-primary/[0.07] border-primary/[0.12]',
              title: 'Climb the Ranks',
              body: 'Practice regularly to improve your ranking and compete with others.',
            },
            {
              icon: Crown,
              iconColor: 'text-amber-300',
              iconBg: 'bg-amber-300/[0.08] border-amber-300/[0.14]',
              title: 'Top 3 Rewards',
              body: 'Top 3 performers get special badges and recognition!',
            },
          ].map(({ icon: Icon, iconColor, iconBg, title, body }) => (
            <div key={title}
                 className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center mb-4 ${iconBg}`}>
                <Icon size={15} className={iconColor} />
              </div>
              <h3 className="font-syne font-bold text-sm tracking-tight mb-1.5">{title}</h3>
              <p className="text-xs text-muted-foreground font-light leading-relaxed">{body}</p>
            </div>
          ))}
        </div>

      </div>
    </>
  )
}