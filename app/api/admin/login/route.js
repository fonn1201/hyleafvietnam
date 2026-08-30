import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu!' }, { status: 400 });
    }

    const adminUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!adminUser || !(await bcrypt.compare(password, adminUser.password))) {
      return NextResponse.json({ error: 'Email hoặc mật khẩu quản trị không chính xác!' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    
    // 1. Cookie xác thực chính
    response.cookies.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    // 2. Xử lý quyền: Nếu user có quyền trong DB thì dùng, nếu trống thì cấp mặc định full quyền ('products, categories, users, news') để tránh bị chặn
    let cleanPermissions = 'products, categories, users, news';
    
    if (adminUser.permissions) {
      cleanPermissions = typeof adminUser.permissions === 'string' 
        ? adminUser.permissions 
        : Array.isArray(adminUser.permissions) ? adminUser.permissions.join(',') : 'products, categories, users, news';
    }

    response.cookies.set('admin_permissions', cleanPermissions, {
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại sau!' }, { status: 500 });
  }
}