"use client";

import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Explanation } from '@/lib/types';
import { sortAssets } from './content-utils';
import { getAssetUrl } from '@/lib/utils/asset-url';
import { X } from 'lucide-react';

interface ExplanationPanelProps {
  explanation?: Explanation;
  text: ReactNode;
  title: string;
}

export function ExplanationPanel({ explanation, text, title }: ExplanationPanelProps) {
  const [modalImage, setModalImage] = useState<string | null>(null);

  useEffect(() => {
    if (modalImage) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [modalImage]);

  if (!explanation) {
    return null;
  }

  const sorted = sortAssets(explanation.assets);
  const videoAssets = sorted.filter(a => a.contentType?.startsWith('video') || a.type?.toLowerCase().includes('video'));
  const imageAssets = sorted.filter(a => !a.contentType?.startsWith('video') && !a.type?.toLowerCase().includes('video'));
  const imageGridClass = imageAssets.length === 1
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
    : 'grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3';

  return (
    <>
    <div className="space-y-3">
      {text ? (
        typeof text === 'string' ? (
          <div
            className="text-sm leading-relaxed text-primary quill-content
                       [&_p]:text-[hsl(var(--explanation-foreground))] [&_li]:text-[hsl(var(--explanation-foreground))]
                       [&_strong]:text-[hsl(var(--explanation-foreground))] [&_strong]:font-semibold
                       [&_a]:text-[hsl(var(--explanation-foreground))] [&_a]:underline text-justify"
            dangerouslySetInnerHTML={{ __html: text }}
          />
        ) : (
          <div className="text-sm leading-relaxed text-primary">{text}</div>
        )
      ) : null}

      {sorted.length > 0 && (
        <div className="space-y-3">
          {videoAssets.map((asset) => {
            const fullUrl = getAssetUrl(asset.url);
            return (
              <div key={`${asset.url}-${asset.order ?? 0}`} className="w-full md:w-3/4">
                <video controls className="w-full rounded-xl border border-[hsl(var(--explanation-border))] bg-black">
                  <source src={fullUrl} type={asset.contentType ?? 'video/mp4'} />
                </video>
              </div>
            );
          })}
          {imageAssets.length > 0 && (
            <div className={imageGridClass}>
              {imageAssets.map((asset) => {
                const fullUrl = getAssetUrl(asset.url);
                return (
                  <div
                    key={`${asset.url}-${asset.order ?? 0}`}
                    className="flex flex-col items-center md:items-start space-y-1"
                  >
                    <img
                      src={fullUrl}
                      alt={asset.alt ?? 'Asset'}
                      className="rounded-xl border border-[hsl(var(--explanation-border))] object-contain cursor-pointer hover:opacity-80 transition-opacity"
                      width={300}
                      height={300}
                      onClick={() => setModalImage(fullUrl)}
                    />
                    {asset.caption && <p className="text-xs text-[hsl(var(--explanation-foreground))]/70">{asset.caption}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>

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
          src={modalImage!}
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
