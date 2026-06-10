/**
 * Constructs the full URL for an asset stored in Cloudflare R2
 * @param relativePath - The relative path of the asset (e.g., "options/41/ac92a0b5-8709-4818-8c0d-0b223d86dadd.png")
 * @returns The full URL to the asset
 */

const baseUrl = process.env.NEXT_PUBLIC_FILES_BASE_URL || "https://pub-43ad180d56534021a128961bc3812097.r2.dev";

export function getAssetUrl(relativePath: string | undefined | null): string {
  if (!relativePath) return '';
  
  // If the path is already a full URL, return it as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  return `${baseUrl}/${cleanPath}`;
}

/**
 * Determines if an asset is an image based on content type
 */
export function isImageAsset(contentType?: string | null, type?: string | null): boolean {
  if (contentType?.startsWith('image/')) return true;
  if (type?.toLowerCase().includes('image')) return true;
  return false;
}

/**
 * Determines if an asset is a video based on content type
 */
export function isVideoAsset(contentType?: string | null, type?: string | null): boolean {
  if (contentType?.startsWith('video/')) return true;
  if (type?.toLowerCase().includes('video')) return true;
  return false;
}
