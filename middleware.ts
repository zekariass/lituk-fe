import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { NextRequest } from 'next/server';

export default function middleware(request: NextRequest) {
  const response = createMiddleware(routing)(request);

  // Fix redirect URLs when behind a reverse proxy (e.g. Railway)
  // The internal port (e.g. 8080) can leak into Location headers
  // Only apply in production — localhost needs its port
  const location = response.headers.get('location');
  const isLocalhost = request.headers.get('host')?.startsWith('localhost');

  if (location && !isLocalhost) {
    const url = new URL(location, request.url);

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const forwardedHost = request.headers.get('x-forwarded-host');
    const forwardedProto = request.headers.get('x-forwarded-proto');

    if (appUrl) {
      const appUrlObj = new URL(appUrl);
      url.hostname = appUrlObj.hostname;
      url.protocol = appUrlObj.protocol;
      url.port = '';
    } else if (forwardedHost) {
      url.hostname = forwardedHost.split(':')[0];
      url.protocol = (forwardedProto || 'https') + ':';
      url.port = '';
    }

    response.headers.set('location', url.toString());
  }

  return response;
}

export const config = {
  matcher: [
    '/',
    '/(am|ar|bg|bn|cs|el|en|es|fa|fr|gu|hi|hu|it|ku|lt|lv|ne|pa|pl|prs|ps|pt|ro|ru|sk|so|sq|ta|ti|tl|tr|uk|ur|zh)/:path*',
    '/((?!_next|_vercel|.*\\..*).*)'
  ]
};
