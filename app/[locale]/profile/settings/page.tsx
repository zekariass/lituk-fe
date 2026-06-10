// "use client"

// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import Link from 'next/link';
// import { useAuthStore, useUserStore } from '@/lib/store';
// import { ChevronLeft, Settings, Bell, Globe, Moon, Sun, Loader2 } from 'lucide-react';
// import { useTheme } from 'next-themes';
// import { SubscriptionCancelSection } from '@/components/subscription/subscription-cancel-section';

// export default function SettingsPage() {
//   const router = useRouter();
//   const { isAuthenticated } = useAuthStore();
//   const { settings, fetchSettings, updateSetting, isLoading } = useUserStore();
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => {
//     setMounted(true);
//   }, []);

//   useEffect(() => {
//     if (!isAuthenticated) {
//       router.push('/login');
//       return;
//     }

//     fetchSettings();
//   }, [isAuthenticated, router]);

//   if (!isAuthenticated) {
//     return null;
//   }

//   const handleThemeChange = (newTheme: string) => {
//     setTheme(newTheme);
//   };

//   const handleSettingToggle = async (name: string, currentValue: string) => {
//     const newValue = currentValue === 'true' ? 'false' : 'true';
//     await updateSetting(name, newValue);
//   };

//   return (
//     <div className="max-w-2xl mx-auto space-y-6">
//       <div>
//         <Link
//           href="/profile"
//           className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
//         >
//           <ChevronLeft className="h-4 w-4" />
//           Back to Profile
//         </Link>

//         <h1 className="text-3xl font-bold">Settings</h1>
//         <p className="text-muted-foreground mt-2">
//           Customize your learning experience
//         </p>
//       </div>

//       {isLoading ? (
//         <div className="flex items-center justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       ) : (
//         <>
//           <div className="rounded-lg border bg-card p-6">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <Settings className="h-5 w-5 text-primary" />
//               Appearance
//             </h3>

//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium">Theme</p>
//                   <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
//                 </div>
//                 {mounted && (
//                   <div className="flex gap-2">
//                     <button
//                       onClick={() => handleThemeChange('light')}
//                       className={`p-2 rounded-lg border transition-colors ${
//                         theme === 'light'
//                           ? 'border-primary bg-primary/10'
//                           : 'border-border hover:bg-accent'
//                       }`}
//                       title="Light mode"
//                     >
//                       <Sun className="h-5 w-5" />
//                     </button>
//                     <button
//                       onClick={() => handleThemeChange('dark')}
//                       className={`p-2 rounded-lg border transition-colors ${
//                         theme === 'dark'
//                           ? 'border-primary bg-primary/10'
//                           : 'border-border hover:bg-accent'
//                       }`}
//                       title="Dark mode"
//                     >
//                       <Moon className="h-5 w-5" />
//                     </button>
//                     <button
//                       onClick={() => handleThemeChange('system')}
//                       className={`p-2 rounded-lg border transition-colors ${
//                         theme === 'system'
//                           ? 'border-primary bg-primary/10'
//                           : 'border-border hover:bg-accent'
//                       }`}
//                       title="System"
//                     >
//                       <Settings className="h-5 w-5" />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="rounded-lg border bg-card p-6">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <Bell className="h-5 w-5 text-primary" />
//               Notifications
//             </h3>

//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium">Email Notifications</p>
//                   <p className="text-sm text-muted-foreground">Receive updates via email</p>
//                 </div>
//                 <button
//                   onClick={() => handleSettingToggle('emailNotifications', settings.emailNotifications || 'false')}
//                   className={`relative w-11 h-6 rounded-full transition-colors ${
//                     settings.emailNotifications === 'true' ? 'bg-primary' : 'bg-accent'
//                   }`}
//                 >
//                   <div
//                     className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                       settings.emailNotifications === 'true' ? 'translate-x-5' : ''
//                     }`}
//                   />
//                 </button>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium">Daily Reminders</p>
//                   <p className="text-sm text-muted-foreground">Get reminded to practice daily</p>
//                 </div>
//                 <button
//                   onClick={() => handleSettingToggle('dailyReminders', settings.dailyReminders || 'false')}
//                   className={`relative w-11 h-6 rounded-full transition-colors ${
//                     settings.dailyReminders === 'true' ? 'bg-primary' : 'bg-accent'
//                   }`}
//                 >
//                   <div
//                     className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                       settings.dailyReminders === 'true' ? 'translate-x-5' : ''
//                     }`}
//                   />
//                 </button>
//               </div>
//             </div>
//           </div>

//           <div className="rounded-lg border bg-card p-6">
//             <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
//               <Globe className="h-5 w-5 text-primary" />
//               Learning Preferences
//             </h3>

//             <div className="space-y-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium">Show Explanations</p>
//                   <p className="text-sm text-muted-foreground">Display explanations after answering</p>
//                 </div>
//                 <button
//                   onClick={() => handleSettingToggle('showExplanations', settings.showExplanations || 'true')}
//                   className={`relative w-11 h-6 rounded-full transition-colors ${
//                     settings.showExplanations !== 'false' ? 'bg-primary' : 'bg-accent'
//                   }`}
//                 >
//                   <div
//                     className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                       settings.showExplanations !== 'false' ? 'translate-x-5' : ''
//                     }`}
//                   />
//                 </button>
//               </div>

//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="font-medium">Show Tips</p>
//                   <p className="text-sm text-muted-foreground">Display helpful tips with questions</p>
//                 </div>
//                 <button
//                   onClick={() => handleSettingToggle('showTips', settings.showTips || 'true')}
//                   className={`relative w-11 h-6 rounded-full transition-colors ${
//                     settings.showTips !== 'false' ? 'bg-primary' : 'bg-accent'
//                   }`}
//                 >
//                   <div
//                     className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
//                       settings.showTips !== 'false' ? 'translate-x-5' : ''
//                     }`}
//                   />
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* Subscription Management */}
//           <SubscriptionCancelSection />
//         </>
//       )}
//     </div>
//   );
// }



"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore, useUserStore } from '@/lib/store'
import { ChevronLeft, Settings, Bell, Globe, Moon, Sun, Loader2, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { SubscriptionCancelSection } from '@/components/subscription/subscription-cancel-section'

// ── Reusable toggle ─────────────────────────────────────────────────────────
function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={onToggle}
      className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 shrink-0
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                  ${enabled ? 'bg-primary' : 'bg-foreground/[0.10]'}`}
    >
      <span
        className={`absolute top-[3px] left-[3px] w-4 h-4 rounded-full
                    bg-background transition-transform duration-200 shadow-sm
                    ${enabled ? 'translate-x-[18px]' : 'translate-x-0'}`}
      />
    </button>
  )
}

// ── Reusable setting row ────────────────────────────────────────────────────
function SettingRow({
  label,
  description,
  children,
}: {
  label: string
  description: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4
                    border-b border-border/50 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground font-light mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { settings, fetchSettings, updateSetting, isLoading } = useUserStore()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return }
    fetchSettings()
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  const handleSettingToggle = async (name: string, currentValue: string) => {
    await updateSetting(name, currentValue === 'true' ? 'false' : 'true')
  }

  const themeOptions = [
    { value: 'light',  icon: Sun,     label: 'Light'  },
    { value: 'dark',   icon: Moon,    label: 'Dark'   },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  const sections = [
    {
      icon: Bell,
      title: 'Notifications',
      rows: [
        {
          label: 'Email Notifications',
          description: 'Receive updates via email',
          key: 'emailNotifications',
          enabled: settings.emailNotifications === 'true',
        },
        {
          label: 'Daily Reminders',
          description: 'Get reminded to practice daily',
          key: 'dailyReminders',
          enabled: settings.dailyReminders === 'true',
        },
      ],
    },
    {
      icon: Globe,
      title: 'Learning Preferences',
      rows: [
        {
          label: 'Show Explanations',
          description: 'Display explanations after answering',
          key: 'showExplanations',
          enabled: settings.showExplanations !== 'false',
        },
        {
          label: 'Show Tips',
          description: 'Display helpful tips with questions',
          key: 'showTips',
          enabled: settings.showTips !== 'false',
        },
      ],
    },
  ]

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
        .delay-1 { animation-delay: 0.06s; }
        .delay-2 { animation-delay: 0.12s; }
        .delay-3 { animation-delay: 0.18s; }
        .delay-4 { animation-delay: 0.24s; }
      `}</style>

      <div className="font-dm max-w-2xl mx-auto space-y-5 text-foreground">

        {/* ── Header ── */}
        <div className="animate-fade-up">
          <Link
            href="/profile"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground
                       hover:text-primary transition-colors duration-200 no-underline mb-4"
          >
            <ChevronLeft size={13} />
            Back to Profile
          </Link>
          <h1 className="font-syne font-bold text-2xl sm:text-3xl tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground font-light mt-1">Customize your learning experience</p>
        </div>

        {/* ── Loading ── */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-primary/50" />
          </div>
        ) : (
          <>
            {/* ── Appearance ── */}
            <div className="animate-fade-up delay-1
                            bg-card border border-border rounded-2xl p-6">
              <h3 className="font-syne font-semibold text-base flex items-center gap-2 mb-5">
                <Settings size={15} className="text-muted-foreground" />
                Appearance
              </h3>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-foreground">Theme</p>
                  <p className="text-xs text-muted-foreground font-light mt-0.5">Choose your preferred color scheme</p>
                </div>

                {mounted && (
                  <div className="flex items-center gap-1.5 p-1
                                  border border-border rounded-xl bg-muted/10">
                    {themeOptions.map(({ value, icon: Icon, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setTheme(value)}
                        title={label}
                        className={`p-2 rounded-lg transition-all duration-200
                                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40
                                    ${theme === value
                                      ? 'bg-primary/15 text-primary border border-primary/25'
                                      : 'text-foreground/30 hover:text-foreground/70 hover:bg-muted/20 border border-transparent'
                                    }`}
                      >
                        <Icon size={15} />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Toggle sections ── */}
            {sections.map(({ icon: Icon, title, rows }, sIdx) => (
              <div
                key={title}
                className={`bg-card border border-border rounded-2xl p-6
                            animate-fade-up delay-${sIdx + 2}`}
              >
                <h3 className="font-syne font-semibold text-base flex items-center gap-2 mb-1">
                  <Icon size={15} className="text-muted-foreground" />
                  {title}
                </h3>

                <div className="-mx-0">
                  {rows.map((row) => (
                    <SettingRow key={row.key} label={row.label} description={row.description}>
                      <Toggle
                        enabled={row.enabled}
                        onToggle={() => handleSettingToggle(row.key, row.enabled ? 'true' : 'false')}
                      />
                    </SettingRow>
                  ))}
                </div>
              </div>
            ))}

            {/* ── Subscription cancel ── */}
            <div className="animate-fade-up delay-4">
              <SubscriptionCancelSection />
            </div>
          </>
        )}
      </div>
    </>
  )
}