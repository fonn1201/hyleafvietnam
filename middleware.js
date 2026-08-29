import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authCookie = request.cookies.get('admin_token');

  // Chuyển hướng về trang login nếu truy cập /admin mà chưa đăng nhập
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!authCookie || authCookie.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  // Chuyển về trang /admin nếu đã đăng nhập mà vẫn cố vào /admin/login
  if (pathname === '/admin/login' && authCookie?.value === 'authenticated') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};