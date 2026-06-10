"use client";

import { QuestionAsset } from '@/lib/types';
import { sortAssets } from './content-utils';
import { getAssetUrl } from '@/lib/utils/asset-url';

interface AssetRendererProps {
  assets?: QuestionAsset[];
}

export function AssetRenderer({ assets }: AssetRendererProps) {
  const sortedAssets = sortAssets(assets);

  if (sortedAssets.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {sortedAssets.map((asset) => {
        const type = asset.type?.toLowerCase() ?? '';
        const key = `${asset.url}-${asset.order ?? 0}`;
        const fullUrl = getAssetUrl(asset.url);

        if (type.includes('video')) {
          return (
            <video key={key} controls className="w-full rounded-lg border border-border bg-black">
              <source src={fullUrl} />
            </video>
          );
        }

        return (
          <div key={key} className="space-y-1 flex justify-center items-center">
            <img src={fullUrl} alt={asset.alt ?? 'Asset'} className="rounded-lg border border-border object-contain" width={200} height={200} />
            {asset.caption ? <p className="text-xs text-muted-foreground">{asset.caption}</p> : null}
          </div>
        );
      })}
    </div>
  );
}
