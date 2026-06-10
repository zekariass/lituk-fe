"use client"

import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts"
import { useContentLanguageStore } from "@/lib/store/content-language-store"

interface ProgressBarProps {
  ratio: string
  progress: number // 0-100
  accuracy?: number // 0-100
  height?: number
}

const progressBarTranslations: Record<string, { progress: string; accuracy: string }> = {
  en: { progress: "Progress", accuracy: "Accuracy" },
  am: { progress: "የሰሯቸው ጥያቄዎች", accuracy: "ትክክለኛ መልስ በመቶኛ"},
  ti: { progress: "ዝተሰርሑ ሕቶታት",  accuracy: "ትኽክለኛ ብሚእታዊ" },
  ar: { progress: "التقدم", accuracy: "الدقة" },
  so: { progress: "Horumarka", accuracy: "Saxnaanta" },
}

export function ProgressBar({
  ratio,
  progress,
  accuracy,
  height = 20,
}: ProgressBarProps) {
  // Determine color based on progress
  const getProgressColor = (value: number) => {
    if (value >= 90) return "#10b981"
    if (value >= 70) return "#3b82f6"
    if (value >= 50) return "#f59e0b"
    if (value >= 30) return "#f97316"
    return "#ef4444"
  }

  const getAccuracyColor = (value: number) => {
    if (value >= 90) return "#10b981"
    if (value >= 75) return "#3b82f6"
    if (value >= 60) return "#f59e0b"
    return "#ef4444"
  }

  const { language: contentLang } = useContentLanguageStore()
  const labels = progressBarTranslations[contentLang] || progressBarTranslations.en

  const progressColor = getProgressColor(progress)
  const accuracyColor =
    accuracy !== undefined ? getAccuracyColor(accuracy) : undefined

  const data = [
    {
      name: labels.progress,
      value: Math.max(progress, 1),
    },
  ]

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground font-medium">
            {labels.progress}
          </span>
          <span className="font-bold" style={{ color: progressColor }}>
            {ratio}
          </span>
        </div>
        <div className="relative" style={{ height }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
            >
              <XAxis type="number" domain={[0, 100]} hide />
              <YAxis type="category" dataKey="name" hide />

              <Bar
                dataKey="value"
                fill={progressColor}
                radius={[6, 6, 6, 6]}
                background={{
                  fill: "hsl(var(--accent))",
                  radius: 6,
                }}
                isAnimationActive
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accuracy Bar */}
      {accuracy !== undefined && (
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-muted-foreground font-medium">
              {labels.accuracy}
            </span>
            <span className="font-bold" style={{ color: accuracyColor }}>
              {accuracy}%
            </span>
          </div>
          <div className="relative" style={{ height }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[{ name: labels.accuracy, value: Math.max(accuracy, 1) }]}
                layout="vertical"
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
              >
                <XAxis type="number" domain={[0, 100]} hide />
                <YAxis type="category" dataKey="name" hide />

                <Bar
                  dataKey="value"
                  fill={accuracyColor}
                  radius={[6, 6, 6, 6]}
                  background={{
                    fill: "hsl(var(--accent))",
                    radius: 6,
                  }}
                  isAnimationActive
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}