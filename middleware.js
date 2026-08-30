import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Cho phép đi qua hoàn toàn với trang đăng nhập và các API hệ thống liên quan
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/admin/login') ||
    pathname.startsWith('/api/admin/products') ||
    pathname.startsWith('/api/admin/categories') ||
    pathname.startsWith('/api/admin/settings') ||
    pathname.startsWith('/api/admin/users') ||
    pathname.startsWith('/api/admin/news') ||
    pathname.startsWith('/admin/posts')
  ) {
    return NextResponse.next();
  }

  // Kiểm tra bảo mật cho các đường dẫn quản trị khác thuộc /admin
  if (pathname.startsWith('/admin')) {
    const token = request.cookies.get('admin_token')?.value;
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // Bản đồ ánh xạ giữa đường dẫn URL và quyền (permission) tương ứng trong database
    const permissionMap = {
      '/admin/products': 'products',
      '/admin/categories': 'categories',
      '/admin/users': 'users',
      '/admin/news': 'news',
      '/admin/posts': 'posts',
      '/admin/settings': 'settings',
    };

    // Tìm xem URL hiện tại có khớp với module nào cần check quyền không
    const matchedModule = Object.keys(permissionMap).find((route) => pathname.startsWith(route));

    if (matchedModule) {
      const requiredPermission = permissionMap[matchedModule];
      const permissions = request.cookies.get('admin_permissions')?.value || '';

      // Nếu không có quyền đó và cũng không có quyền 'all' thì đá về trang tổng quan admin
      if (!permissions.includes(requiredPermission) && !permissions.includes('all')) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/admin/:path*',
};