"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Tip } from '@/lib/types';
import { sortAssets } from './content-utils';
import { getAssetUrl } from '@/lib/utils/asset-url';
import { X } from 'lucide-react';

interface TipsPanelProps {
  tips: Tip[];
  title: string;
  tipLabel: (index: number) => string;
  getTipText: (tip: Tip) => string;
}

export function TipsPanel({ tips, title, tipLabel, getTipText }: TipsPanelProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [modalImage]);

  if (tips.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <div className="space-y-3">
          {[...tips].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)).map((tip, index) => {
            const sorted = sortAssets(tip.assets);
            const imageAssets = sorted.filter(a => !a.type?.toLowerCase().includes('video'));
            const videoAssets = sorted.filter(a => a.type?.toLowerCase().includes('video'));
            
            // Determine grid classes based on image count
            const gridClass = imageAssets.length === 1
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1'
              : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1';

            return (
              <div key={tip.id} className="space-y-2 rounded-xl bg-[hsl(var(--tip-border))]/50 border border-[hsl(var(--tip-border))] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[hsl(var(--tip-foreground))]/70">
                  {tipLabel(index + 1)}
                </p>
                <div 
                  className="text-sm leading-relaxed text-[hsl(var(--tip-foreground))] quill-content
                             [&_p]:text-[hsl(var(--tip-foreground))] [&_li]:text-[hsl(var(--tip-foreground))]
                             [&_strong]:text-[hsl(var(--tip-foreground))] [&_strong]:font-semibold
                             [&_a]:text-[hsl(var(--tip-foreground))] [&_a]:underline text-justify"
                  dangerouslySetInnerHTML={{ __html: getTipText(tip) }}
                />
                
                {/* Videos */}
                {videoAssets.length > 0 && videoAssets.map((asset) => {
                  const key = `${asset.url}-${asset.order ?? 0}`;
                  const fullUrl = getAssetUrl(asset.url);
                  return (
                    <div key={key} className="w-full md:w-3/4 pt-1">
                      <video controls className="w-full rounded-xl border border-[hsl(var(--tip-border))] bg-black">
                        <source src={fullUrl} type={asset.contentType ?? 'video/mp4'} />
                      </video>
                    </div>
                  );
                })}

                {/* Images */}
                {imageAssets.length > 0 && (
                  <div className={gridClass}>
                    {imageAssets.map((asset) => {
                      const key = `${asset.url}-${asset.order ?? 0}`;
                      const fullUrl = getAssetUrl(asset.url);
                      return (
                        <div key={key} className="space-y-1 flex flex-col items-center md:items-start">
                          <img
                            src={fullUrl}
                            alt={asset.alt ?? 'Asset'}
                            className="rounded-xl border border-[hsl(var(--tip-border))] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                            width={300}
                            height={300}
                            onClick={() => setModalImage(fullUrl)}
                          />
                          {asset.caption ? (
                            <p className="text-xs text-[hsl(var(--tip-foreground))]/70">{asset.caption}</p>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Image Modal — portaled to body so it's always viewport-centered */}
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
            src={modalImage}
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
