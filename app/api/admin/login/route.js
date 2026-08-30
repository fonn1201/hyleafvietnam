import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu!' }, { status: 400 });
    }

    // Tìm user trong database
    const adminUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!adminUser) {
      return NextResponse.json({ error: 'Email quản trị không tồn tại trong hệ thống!' }, { status: 401 });
    }

    // Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, adminUser.password);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Mật khẩu quản trị không chính xác!' }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    
    // Lưu email vào cookie
    response.cookies.set('admin_token', adminUser.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    // Lưu quyền vào cookie
    let userPermissions = adminUser.permissions || '';
    if (Array.isArray(userPermissions)) {
      userPermissions = userPermissions.join(',');
    }

    response.cookies.set('admin_permissions', userPermissions, {
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    return response;
  } catch (err) {
    console.error('CRITICAL LOGIN ERROR:', err);
    return NextResponse.json({ error: `Lỗi Server: ${err.message}` }, { status: 500 });
  }
}