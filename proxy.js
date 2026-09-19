import { NextResponse } from 'next/server';
import { verifyAdminToken, hasPermission, ADMIN_COOKIE_NAME } from '@/lib/auth';

// Chạy trên Node.js runtime (thay vì Edge) để dùng được thư viện
// jsonwebtoken một cách ổn định.
export const runtime = 'nodejs';

// Ánh xạ từ tiền tố đường dẫn (cả trang /admin và API tương ứng) sang quyền cần có.
// 'null' nghĩa là chỉ cần đăng nhập hợp lệ, không yêu cầu quyền module cụ thể.
const PERMISSION_RULES = [
  { prefix: '/admin/products', permission: 'products' },
  { prefix: '/admin/slides', permission: 'slides' },
  { prefix: '/admin/categories', permission: 'categories' },
  { prefix: '/admin/posts', permission: 'posts' },
  { prefix: '/admin/news', permission: 'news' },
  { prefix: '/admin/users', permission: 'users' },
  { prefix: '/admin/settings', permission: 'settings' },
  { prefix: '/api/admin/users', permission: 'users' },
  { prefix: '/api/products', permission: 'products' },
  { prefix: '/api/categories', permission: 'categories' },
  { prefix: '/api/news', permission: 'news' },
  { prefix: '/api/posts', permission: 'posts' },
  { prefix: '/api/settings', permission: 'settings' },
  { prefix: '/api/slides', permission: 'slides' },
  { prefix: '/api/upload', permission: null },
];

// Các đường dẫn API công khai cho khách xem website (GET là dữ liệu đọc, không sửa)
const PUBLIC_GET_PREFIXES = [
  '/api/products',
  '/api/categories',
  '/api/news',
  '/api/posts',
  '/api/settings',
  '/api/slides',
];

function matchRule(pathname) {
  return PERMISSION_RULES.find((rule) => pathname.startsWith(rule.prefix));
}

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const method = request.method.toUpperCase();

  // Luôn cho qua trang đăng nhập và API đăng nhập/đăng xuất
  if (
    pathname.startsWith('/admin/login') ||
    pathname.startsWith('/api/admin/login') ||
    pathname.startsWith('/api/admin/logout')
  ) {
    return NextResponse.next();
  }

  // Cho phép khách vãng lai GET dữ liệu công khai (sản phẩm, danh mục, tin tức...)
  // Việc SỬA/XÓA (POST/PUT/DELETE) trên các đường dẫn này vẫn bị chặn bên dưới.
  if (method === 'GET' && PUBLIC_GET_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isAdminPage = pathname.startsWith('/admin');
  const rule = matchRule(pathname);

  // Đường dẫn không thuộc khu vực cần bảo vệ -> cho qua
  if (!isAdminPage && !rule) {
    return NextResponse.next();
  }

  // Xác thực token bằng chữ ký JWT thật sự (không còn tin theo giá trị cookie thô)
  const token = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminToken(token);

  if (!session) {
    if (isAdminPage) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401 });
  }

  const requiredPermission = rule?.permission ?? null;

  if (requiredPermission && !hasPermission(session.permissions, requiredPermission)) {
    if (isAdminPage) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.json({ error: 'Bạn không có quyền thực hiện thao tác này' }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/products/:path*',
    '/api/categories/:path*',
    '/api/news/:path*',
    '/api/posts/:path*',
    '/api/settings/:path*',
    '/api/slides/:path*',
    '/api/upload/:path*',
  ],
};
