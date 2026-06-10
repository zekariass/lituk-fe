"use client"

import { useState } from 'react'
import { useAdminTrafficSignStore } from '@/lib/store/admin-traffic-sign-store'
import { CheckCircle2, Image as ImageIcon, Video } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getAssetUrl } from '@/lib/utils/asset-url'

interface LangInfo { code: string; label: string; native: string; isPrimary: boolean }

// ── Section label ─────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-widest text-white/30 font-medium mb-2">
      {children}
    </p>
  )
}

// ── Description block ─────────────────────────────────────────────────────────
function DescriptionBlock({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
        <p className="text-sm text-white/70 font-light leading-relaxed whitespace-pre-wrap">
          {text}
        </p>
      </div>
    </div>
  )
}

export function SignDetailModal({ languages, primaryCode }: {
  languages: LangInfo[]; primaryCode: string;
}) {
  const { selectedSign, isDetailOpen, setDetailOpen, setSelectedSign } = useAdminTrafficSignStore()
  const [descLang, setDescLang] = useState<string>(primaryCode || 'en')

  if (!selectedSign) return null

  const handleClose = () => {
    setDetailOpen(false)
    setSelectedSign(null)
    setDescLang(primaryCode || 'en')
  }

  const getDescription = (code: string): string => {
    if (code === primaryCode) return selectedSign.description || ''
    return (selectedSign.translations as Record<string, any>)?.[code]?.description || ''
  }

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <Dialog open={isDetailOpen} onOpenChange={handleClose}>
      <DialogContent className="font-dm max-h-[90vh] max-w-2xl overflow-y-auto
                                 bg-[#181920] border border-white/[0.09]
                                 shadow-[0_24px_64px_rgba(0,0,0,0.55)] rounded-2xl p-0">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
          .font-syne { font-family: 'Syne', sans-serif; }
          .font-dm   { font-family: 'DM Sans', sans-serif; }
        `}</style>

        {/* ── Header ── */}
        <DialogHeader className="px-6 pt-6 pb-5 border-b border-white/[0.07]">
          <DialogTitle className="font-syne font-bold text-lg tracking-tight text-[#f0f0f5]">
            Traffic Sign Details
          </DialogTitle>
          <p className="text-xs text-white/30 font-light mt-0.5">
            Full sign information and media assets
          </p>
        </DialogHeader>

        <div className="px-6 py-5 space-y-6">

          {/* ── Language switcher ── */}
          {languages.length > 1 && (
            <div className="w-full overflow-x-auto overflow-y-hidden [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
              <div className="flex gap-1 min-w-max bg-[#181920] border border-white/[0.08] rounded-xl p-1">
                {languages.map(({ code, native }) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setDescLang(code)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 whitespace-nowrap
                      ${descLang === code
                        ? 'bg-emerald-300/20 text-emerald-300 [box-shadow:0_0_8px_rgba(110,231,183,0.15)]'
                        : 'text-white/30 hover:text-white/60'}`}
                  >
                    {native}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Main asset ── */}
          {selectedSign.signAsset && (
            <div>
              <SectionLabel>Main Sign</SectionLabel>
              <div className="flex items-center justify-center bg-white/[0.02] border border-white/[0.07]
                              rounded-xl overflow-hidden p-6">
                {selectedSign.signAsset.type === 'video' ? (
                  <video
                    src={getAssetUrl(selectedSign.signAsset.url)}
                    controls
                    className="max-h-72 rounded-lg w-full"
                  />
                ) : (
                  <Image
                    src={getAssetUrl(selectedSign.signAsset.url)}
                    alt="Traffic sign"
                    width={280}
                    height={280}
                    className="object-contain rounded-lg max-h-72"
                  />
                )}
              </div>
            </div>
          )}

          {/* ── Metadata row ── */}
          <div className="grid grid-cols-3 gap-3">
            {/* Status */}
            <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
              <SectionLabel>Status</SectionLabel>
              {selectedSign.isActive ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium
                                 tracking-widest uppercase text-emerald-300">
                  <CheckCircle2 size={10} /> Active
                </span>
              ) : (
                <span className="text-[11px] font-medium tracking-widest uppercase text-white/30">
                  Inactive
                </span>
              )}
            </div>

            {/* Created */}
            <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
              <SectionLabel>Created</SectionLabel>
              <p className="text-xs text-white/60 tabular-nums">{formatDate(selectedSign.createdAt)}</p>
            </div>

            {/* Updated */}
            <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
              <SectionLabel>Updated</SectionLabel>
              <p className="text-xs text-white/60 tabular-nums">{formatDate(selectedSign.updatedAt)}</p>
            </div>
          </div>

          {/* ── Description ── */}
          <div>
            <div className="mb-2">
              <SectionLabel>Description</SectionLabel>
            </div>
            {getDescription(descLang) ? (
              <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
                <p className="text-sm text-white/70 font-light leading-relaxed whitespace-pre-wrap"
                   dangerouslySetInnerHTML={{ __html: getDescription(descLang) }} />
              </div>
            ) : (
              <div className="bg-white/[0.025] border border-white/[0.07] rounded-xl px-4 py-3">
                <p className="text-sm text-white/25 font-light italic">
                  No description in {languages.find(l => l.code === descLang)?.label ?? descLang}
                </p>
              </div>
            )}
          </div>

          {/* ── Additional assets ── */}
          {selectedSign.additionalAssets?.length > 0 && (
            <div>
              <SectionLabel>
                Additional Assets ({selectedSign.additionalAssets.length})
              </SectionLabel>
              <div className="grid grid-cols-2 gap-3">
                {selectedSign.additionalAssets.map((asset: any, index: number) => (
                  <div key={index}
                    className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                    {asset.type === 'video' ? (
                      <div className="relative">
                        <video src={getAssetUrl(asset.url)} controls className="w-full" />
                      </div>
                    ) : (
                      <div className="aspect-square overflow-hidden">
                        <Image
                          src={getAssetUrl(asset.url)}
                          alt={asset.caption || `Asset ${index + 1}`}
                          width={200}
                          height={200}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {asset.caption && (
                      <p className="px-3 py-2 text-[11px] text-white/35 font-light border-t border-white/[0.06]">
                        {asset.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Real life photos ── */}
          {selectedSign.realLifeAssets?.length > 0 && (
            <div>
              <SectionLabel>
                Real Life Photos ({selectedSign.realLifeAssets.length})
              </SectionLabel>
              <div className="grid grid-cols-3 gap-3">
                {selectedSign.realLifeAssets.map((asset: any, index: number) => (
                  <div key={index}
                    className="bg-white/[0.02] border border-white/[0.07] rounded-xl overflow-hidden">
                    <div className="aspect-square overflow-hidden">
                      <Image
                        src={getAssetUrl(asset.url)}
                        alt={asset.caption || `Photo ${index + 1}`}
                        width={150}
                        height={150}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {asset.caption && (
                      <p className="px-3 py-2 text-[11px] text-white/35 font-light border-t border-white/[0.06]">
                        {asset.caption}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ── Footer ── */}
        <div className="px-6 pb-6 pt-4 border-t border-white/[0.07]">
          <button
            onClick={handleClose}
            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium
                       text-white/55 border border-white/[0.09] bg-white/[0.03]
                       hover:text-white/85 hover:border-white/20
                       transition-all duration-200"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}