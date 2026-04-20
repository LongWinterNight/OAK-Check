import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Публичные пути — пропускаем без проверки
  const isPublic =
    pathname.startsWith('/login') ||
    pathname.startsWith('/invite') ||
    pathname.startsWith('/reset') ||
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/uploads') ||
    pathname === '/favicon.ico';

  if (isPublic) return NextResponse.next();

  if (!isLoggedIn) {
    // API запросы без сессии → 401 JSON
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }
    // Страницы без сессии → редирект на /login
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|uploads).*)'],
};
