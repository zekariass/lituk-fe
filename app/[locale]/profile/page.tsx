"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useAuthStore, useUserStore, useCategoryStore, useRevisionStore } from '@/lib/store'
import {
  Mail, Calendar, Shield, MapPin, Settings,
  ChevronRight, Trophy, Target, TrendingUp,
  Loader2, LogOut, ShieldCheck, Languages, Trash2, X,
} from 'lucide-react'
import { SubscriptionManagement } from '@/components/profile/subscription-management'
import { useUserLanguageStore } from '@/lib/store/user-language-store'
import { useJurisdictionLanguageStore } from '@/lib/store/jurisdiction-language-store'
import userLanguagesApi from '@/lib/api/user-languages'

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, logout, refreshUser } = useAuthStore()
  const { jurisdictions, fetchJurisdictions, isLoading: jurisdictionsLoading } = useUserStore()
  const { categories, fetchCategories } = useCategoryStore()
  // const { progress, fetchProgress } = useRevisionStore()
  const { languages: jurisdictionLanguages, fetchJurisdictionLanguages } = useJurisdictionLanguageStore()
  const { userLanguages, setUserLanguages, isLoading: languagesLoading, setLoading, setError } = useUserLanguageStore()

  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showAddLanguageDialog, setShowAddLanguageDialog] = useState(false)
  const [isAddingLanguage, setIsAddingLanguage] = useState(false)
  const [selectedLanguageIds, setSelectedLanguageIds] = useState<number[]>([])

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchJurisdictions()
    fetchCategories(undefined, true)
    // fetchProgress()
    if (user?.activeJurisdictionId) fetchJurisdictionLanguages(user.activeJurisdictionId)
  }, [isAuthenticated, router, user?.activeJurisdictionId, fetchJurisdictionLanguages, fetchJurisdictions, fetchCategories])

  useEffect(() => {
    if (isAuthenticated && user) useAuthStore.getState().refreshUser().catch(() => undefined)
  }, [])

  useEffect(() => {
    if (showAddLanguageDialog && user?.activeJurisdictionId)
      fetchJurisdictionLanguages(user.activeJurisdictionId)
  }, [showAddLanguageDialog, user?.activeJurisdictionId, fetchJurisdictionLanguages])

  if (!isAuthenticated || !user) return null

  const handleLogout = async () => { await logout(); router.push('/') }
  const getInitials = (name?: string) =>
    name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  const totalQuestions     = categories.reduce((s, c) => s + (c.totalQuestions || 0), 0)
  const completedQuestions = categories.reduce((s, c) => s + (c.completedQuestions || 0), 0)
  const overallProgress    = totalQuestions > 0 ? Math.round((completedQuestions / totalQuestions) * 100) : 0

  // const stats = [
  //   { icon: TrendingUp, label: 'Progress', value: `${overallProgress}%`,        sub: `${completedQuestions}/${totalQuestions}` },
  //   { icon: Trophy,     label: 'Points',   value: progress?.totalPoints || 0,   sub: 'Total earned' },
  //   { icon: Target,     label: 'Accuracy', value: `${progress?.accuracy || 0}%`, sub: 'Overall' },
  // ]

  const handleAddLanguage = async () => {
    if (selectedLanguageIds.length === 0 || !user?.activeJurisdictionId) return
    setIsAddingLanguage(true); setLoading(true)
    try {
      await userLanguagesApi.bulkCreate({ jurisdictionId: user.activeJurisdictionId, languageIds: selectedLanguageIds })
      await refreshUser()
      setError(null); setShowAddLanguageDialog(false); setSelectedLanguageIds([])
    } catch (err: any) { setError(err.message || 'Failed to add languages') }
    finally { setLoading(false); setIsAddingLanguage(false) }
  }

  const toggleLanguageSelection = (languageId: number) => {
    setSelectedLanguageIds(prev => 
      prev.includes(languageId) 
        ? prev.filter(id => id !== languageId)
        : [...prev, languageId]
    )
  }

  const handleDeleteLanguage = async (languageId: number) => {
    setLoading(true)
    try { await userLanguagesApi.delete(languageId); await refreshUser(); setError(null) }
    catch (err: any) { setError(err.message || 'Failed to delete language') }
    finally { setLoading(false) }
  }

  const availableLanguages = jurisdictionLanguages.filter(
    jLang => !user?.userLanguages?.some(uLang => uLang.language.id === jLang.id)
  )

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .font-syne { font-family: 'Syne', sans-serif; }
        .font-dm   { font-family: 'DM Sans', sans-serif; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: var(--target-width); }
        }
        @keyframes pulse-ring {
          0%   { box-shadow: 0 0 0 0 hsl(var(--primary) / 0.25); }
          70%  { box-shadow: 0 0 0 8px hsl(var(--primary) / 0); }
          100% { box-shadow: 0 0 0 0 hsl(var(--primary) / 0); }
        }

        .animate-fade-up  { animation: fadeUp  0.45s cubic-bezier(0.22,1,0.36,1) both; }
        .animate-scale-in { animation: scaleIn 0.35s cubic-bezier(0.22,1,0.36,1) both; }
        .delay-1 { animation-delay: 0.08s; }
        .delay-2 { animation-delay: 0.16s; }
        .delay-3 { animation-delay: 0.24s; }
        .delay-4 { animation-delay: 0.32s; }

        /* Card hover lift */
        .card-lift {
          transition: transform 0.25s cubic-bezier(0.22,1,0.36,1),
                      box-shadow 0.25s cubic-bezier(0.22,1,0.36,1);
        }
        .card-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 48px hsl(var(--primary) / 0.08),
                      0 4px 12px rgba(0,0,0,0.15);
        }

        /* Stat card individual hover */
        .stat-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px) scale(1.02);
          box-shadow: 0 8px 24px hsl(var(--primary) / 0.12);
        }

        /* Row hover */
        .row-hover {
          transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
        }
        .row-hover:hover { transform: translateX(2px); }

        /* Avatar pulse on load */
        .avatar-pulse { animation: pulse-ring 2s ease 0.8s; }

        /* Scrollbar for language list */
        .lang-scroll::-webkit-scrollbar { width: 4px; }
        .lang-scroll::-webkit-scrollbar-track { background: transparent; }
        .lang-scroll::-webkit-scrollbar-thumb {
          background: hsl(var(--border));
          border-radius: 99px;
        }

        /* Progress bar */
        .progress-bar {
          height: 3px;
          border-radius: 99px;
          background: hsl(var(--primary) / 0.12);
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 99px;
          background: linear-gradient(90deg,
            hsl(var(--primary) / 0.6),
            hsl(var(--primary)),
            hsl(var(--primary) / 0.6));
          background-size: 200% auto;
          animation: shimmer 2.5s linear infinite,
                     progressFill 1s cubic-bezier(0.22,1,0.36,1) both 0.4s;
        }

        /* Section divider */
        .section-gutter {
          border-left: 2px solid hsl(var(--primary) / 0.15);
          padding-left: 1rem;
          margin-left: 0.25rem;
        }

        /* Dialog backdrop */
        .dialog-backdrop {
          animation: fadeUp 0.2s ease both;
        }
      `}</style>

      <div className="font-dm max-w-4xl mx-auto space-y-4 text-foreground pb-10">
        {/* ── Identity card ── */}
        <div className="animate-fade-up delay-1
                        bg-card border border-border rounded-2xl overflow-hidden
                        shadow-[0_2px_20px_rgba(0,0,0,0.12)]">

          {/* Subtle top accent bar */}
          <div className="h-[2px] w-full bg-gradient-to-r
                          from-transparent via-primary/40 to-transparent" />

          <div className="p-6">
            {/* Avatar + info */}
            <div className="flex items-start gap-5 mb-7">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="avatar-pulse w-[68px] h-[68px] sm:w-20 sm:h-20
                                rounded-2xl bg-primary/10 border border-primary/20
                                flex items-center justify-center">
                  <span className="font-syne font-bold text-xl sm:text-2xl text-primary">
                    {getInitials(user.fullName)}
                  </span>
                </div>
                {/* Online dot */}
                <span className="absolute -bottom-0.5 -right-0.5
                                 w-3.5 h-3.5 rounded-full bg-emerald-500
                                 border-2 border-card" />
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="font-syne font-bold text-xl sm:text-2xl tracking-tight
                               truncate leading-tight">
                  {user.fullName || 'User'}
                </h2>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1.5">
                  <Mail size={12} className="shrink-0 text-primary/40" />
                  <span className="truncate">{user.email}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  {user.emailVerified && (
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                                     text-emerald-500/90 bg-emerald-500/[0.09]
                                     border border-emerald-500/[0.2]
                                     px-2.5 py-1 rounded-full tracking-wide">
                      <ShieldCheck size={11} />
                      Verified
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[11px]
                                   text-muted-foreground/50
                                   px-2.5 py-1 rounded-full
                                   border border-border/60 bg-muted/10">
                    <Calendar size={11} />
                    Since {new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
            </div>            
          </div>
        </div>

        {/* ── Subscription ── */}
        <div className="animate-fade-up delay-2">
          <SubscriptionManagement />
        </div>

        {/* ── Jurisdictions ── */}
        <div className="animate-fade-up delay-2
                        bg-card border border-border rounded-2xl overflow-hidden
                        shadow-[0_2px_12px_rgba(0,0,0,0.08)]">

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-syne font-semibold text-[15px] flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7
                                 rounded-lg bg-primary/[0.08] border border-primary/[0.12]">
                  <MapPin size={13} className="text-primary/70" />
                </span>
                Jurisdictions
              </h3>
              {!jurisdictionsLoading && jurisdictions.length > 0 && (
                <span className="text-[11px] text-muted-foreground/50 font-medium
                                 bg-muted/20 border border-border/50
                                 px-2.5 py-1 rounded-full">
                  {jurisdictions.length} added
                </span>
              )}
            </div>

            {jurisdictionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={20} className="animate-spin text-primary/40" />
              </div>
            ) : jurisdictions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <MapPin size={24} className="text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/40 font-light">
                  No jurisdictions added yet
                </p>
              </div>
            ) : (
              <div className="space-y-2 mb-4">
                {jurisdictions.map((jurisdiction) => (
                  <div
                    key={jurisdiction.id}
                    className={`row-hover flex items-center justify-between px-4 py-3
                                rounded-xl transition-colors
                                ${jurisdiction.isActive
                                  ? 'bg-primary/[0.06] border border-primary/[0.15]'
                                  : 'bg-muted/10 border border-border/70 hover:bg-muted/20'}`}
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground leading-tight">
                        {jurisdiction.jurisdictionName}
                      </p>
                      <p className="text-xs text-muted-foreground/60 mt-0.5">
                        {jurisdiction.countryName}
                      </p>
                    </div>
                    {jurisdiction.isActive && (
                      <span className="text-[10px] font-bold tracking-[0.16em] uppercase
                                       text-amber-500 bg-primary/10 border border-primary/20
                                       px-2.5 py-1 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/profile/jurisdictions"
              className="row-hover flex items-center justify-center gap-2 w-full mt-2 px-4 py-2.5
                         border border-dashed border-emerald-500/70 rounded-xl
                         text-sm text-muted-foreground/50
                         hover:text-foreground/70 hover:border-emerald-500/[0.3] bg-emerald-500/[0.1] hover:bg-emerald-500/[0.2] 
                         transition-all no-underline"
            >
              <Settings size={13} />
              Manage Jurisdictions
              <ChevronRight size={13} className="ml-auto opacity-40" />
            </Link>
          </div>
        </div>

        {/* ── Languages ── */}
        <div className="animate-fade-up delay-3
                        bg-card border border-border rounded-2xl overflow-hidden
                        shadow-[0_2px_12px_rgba(0,0,0,0.08)]">

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-syne font-semibold text-[15px] flex items-center gap-2.5">
                <span className="flex items-center justify-center w-7 h-7
                                 rounded-lg bg-primary/[0.08] border border-primary/[0.12]">
                  <Languages size={13} className="text-primary/70" />
                </span>
                Languages
              </h3>
              <button
                onClick={() => setShowAddLanguageDialog(true)}
                disabled={!user?.activeJurisdictionId}
                className="flex items-center gap-1.5 px-3 py-1.5
                           text-[11px] font-semibold tracking-wide
                           bg-emerald-500 text-white rounded-lg
                           hover:bg-emerald-600 active:scale-95
                           disabled:opacity-35 disabled:cursor-not-allowed
                           transition-all duration-150"
              >
                <Languages size={11} />
                Add Language
              </button>
            </div>

            {user.userLanguages && user.userLanguages.length > 0 ? (
              <div className="space-y-2">
                {user.userLanguages.map((langInfo) => (
                  <div
                    key={langInfo.id}
                    className={`row-hover group flex items-center justify-between px-4 py-3
                               rounded-xl border border-border/70
                               hover:bg-muted/50`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-md overflow-hidden
                                      ring-1 ring-border/50 shrink-0">
                        <Image
                          src={langInfo.language.flagUrl}
                          alt={langInfo.language.name}
                          width={26}
                          height={19}
                          className="object-cover block"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground leading-tight">
                          {langInfo.language.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5">
                          {langInfo.language.name}
                          <span className="ml-1 font-mono text-[10px]
                                           bg-muted/30 px-1 py-0.5 rounded">
                            {langInfo.language.code}
                          </span>
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteLanguage(langInfo.id)}
                      disabled={languagesLoading}
                      className="p-2 rounded-lg text-red-500 hover:text-red-300
                                 hover:bg-destructive/10 active:scale-95
                                 transition-all duration-150
                                 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      title="Remove language"
                    >
                      {/* <Trash2 size={13} /> */}
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Languages size={24} className="text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/40 font-light text-center">
                  No languages configured yet
                </p>
                <p className="text-xs text-muted-foreground/30">
                  Add a language to get started
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Settings ── */}
        {/* <div className="animate-fade-up delay-4
                        bg-card border border-border rounded-2xl overflow-hidden
                        shadow-[0_2px_12px_rgba(0,0,0,0.08)]">

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="p-6">
            <h3 className="font-syne font-semibold text-[15px] flex items-center gap-2.5 mb-4">
              <span className="flex items-center justify-center w-7 h-7
                               rounded-lg bg-muted/20 border border-border/60">
                <Settings size={13} className="text-muted-foreground/60" />
              </span>
              Settings
            </h3>

            <div className="space-y-0.5">
              <Link
                href="/profile/settings"
                className="row-hover group flex items-center justify-between px-4 py-3
                           rounded-xl text-foreground/55 hover:text-foreground/85
                           hover:bg-muted/15 transition-all no-underline"
              >
                <div className="flex items-center gap-3 text-sm">
                  <Settings size={14} className="text-foreground/25
                                                  group-hover:text-foreground/55
                                                  transition-colors" />
                  Preferences
                </div>
                <ChevronRight size={14} className="text-foreground/15
                                                    group-hover:text-foreground/40
                                                    transition-transform
                                                    group-hover:translate-x-0.5" />
              </Link>

              {user.role === 'admin' && (
                <Link
                  href="/backoffice"
                  className="row-hover group flex items-center justify-between px-4 py-3
                             rounded-xl text-foreground/55 hover:text-foreground/85
                             hover:bg-muted/15 transition-all no-underline"
                >
                  <div className="flex items-center gap-3 text-sm">
                    <Shield size={14} className="text-foreground/25
                                                  group-hover:text-foreground/55
                                                  transition-colors" />
                    Back Office
                  </div>
                  <ChevronRight size={14} className="text-foreground/15
                                                      group-hover:text-foreground/40
                                                      transition-transform
                                                      group-hover:translate-x-0.5" />
                </Link>
              )}

              <div className="h-px bg-border/50 mx-2 my-1.5" />

              <button
                onClick={() => setShowLogoutDialog(true)}
                className="row-hover group w-full flex items-center justify-between px-4 py-3
                           rounded-xl text-foreground/45
                           hover:text-destructive hover:bg-destructive/[0.07]
                           transition-all"
              >
                <div className="flex items-center gap-3 text-sm">
                  <LogOut size={14} className="transition-colors" />
                  Sign Out
                </div>
                <ChevronRight size={14} className="text-foreground/15
                                                    group-hover:text-destructive/40
                                                    transition-transform
                                                    group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div> */}

      </div>

      {/* ── Logout dialog ── */}
      {showLogoutDialog && (
        <div className="dialog-backdrop fixed inset-0 bg-black/65 backdrop-blur-md
                        flex items-center justify-center z-50 p-4">
          <div className="animate-scale-in bg-card border border-border rounded-2xl
                          max-w-sm w-full p-6
                          shadow-[0_32px_80px_rgba(0,0,0,0.35)]">

            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20
                            flex items-center justify-center mb-4">
              <LogOut size={16} className="text-destructive/70" />
            </div>

            <h3 className="font-syne font-bold text-lg tracking-tight leading-tight">
              Sign out?
            </h3>
            <p className="text-sm text-muted-foreground/70 font-light mt-2 leading-relaxed">
              Your progress is saved. You can sign back in anytime.
            </p>

            <div className="flex gap-2.5 mt-6">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-foreground/60 border border-border/80 bg-muted/10
                           hover:bg-muted/25 hover:text-foreground/80
                           active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                           text-destructive-foreground bg-destructive
                           hover:opacity-90 active:scale-[0.98] transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Language dialog ── */}
      {showAddLanguageDialog && (
        <div className="dialog-backdrop fixed inset-0 bg-black/65 backdrop-blur-md
                        flex items-center justify-center z-50 p-4">
          <div className="animate-scale-in bg-card border border-border rounded-2xl
                          max-w-md w-full p-6
                          shadow-[0_32px_80px_rgba(0,0,0,0.35)]">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-syne font-bold text-lg tracking-tight">Add Languages</h3>
                <p className="text-xs text-muted-foreground/50 mt-0.5 font-light">
                  {selectedLanguageIds.length > 0 
                    ? `${selectedLanguageIds.length} selected · Click to toggle`
                    : 'Select one or more languages to add'}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowAddLanguageDialog(false)
                  setSelectedLanguageIds([])
                }}
                className="p-1.5 rounded-lg text-muted-foreground/50
                           hover:text-foreground/80 hover:bg-muted/20
                           active:scale-95 transition-all"
              >
                <X size={16} />
              </button>
            </div>

            {availableLanguages.length > 0 ? (
              <div className="lang-scroll space-y-1.5 max-h-60 overflow-y-auto -mx-1 px-1">
                {availableLanguages.map((lang) => {
                  const isSelected = selectedLanguageIds.includes(lang.id)
                  return (
                    <button
                      key={lang.id}
                      onClick={() => toggleLanguageSelection(lang.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl
                                 border text-left transition-all duration-150 active:scale-[0.99]
                                 ${isSelected
                                   ? 'border-emerald-500 border-2 shadow-[0_0_0_1px_rgba(16,185,129,0.15)]'
                                   : 'bg-muted/10 border-border/70 hover:bg-muted/20 hover:border-border'}`}
                    >
                      <div className="rounded-md overflow-hidden ring-1 ring-border/50 shrink-0">
                        <Image
                          src={lang.flagUrl}
                          alt={lang.name}
                          width={26}
                          height={19}
                          className="object-cover block"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-tight">{lang.displayName}</p>
                        <p className="text-xs text-muted-foreground/50 mt-0.5">
                          {lang.name}
                          <span className="ml-1 font-mono text-[10px]
                                           bg-muted/30 px-1 py-0.5 rounded">
                            {lang.code}
                          </span>
                        </p>
                      </div>
                      <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center
                                      transition-all duration-150
                                      ${isSelected
                                        ? 'bg-emerald-500 border-emerald-500'
                                        : 'border-border/60 bg-transparent'}`}>
                        {isSelected && (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5"
                                  strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Languages size={24} className="text-muted-foreground/20" />
                <p className="text-sm text-muted-foreground/50 text-center">
                  All available languages have been added
                </p>
              </div>
            )}

            <div className="flex gap-2.5 mt-5">
              <button
                onClick={() => {
                  setShowAddLanguageDialog(false)
                  setSelectedLanguageIds([])
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium
                           text-foreground/60 border border-border/80 bg-muted/10
                           hover:bg-muted/25 hover:text-foreground/80
                           active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLanguage}
                disabled={selectedLanguageIds.length === 0 || isAddingLanguage}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold
                           bg-emerald-500 border border-emerald-500
                           hover:opacity-90 active:scale-[0.98] transition-all
                           disabled:opacity-35 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
              >
                {isAddingLanguage ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Adding…
                  </>
                ) : selectedLanguageIds.length > 0 
                  ? `Add ${selectedLanguageIds.length} Language${selectedLanguageIds.length > 1 ? 's' : ''}`
                  : 'Select Languages'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}