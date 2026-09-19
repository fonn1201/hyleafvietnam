import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/auth';

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

    // Chuẩn hóa danh sách quyền thành mảng
    let permissionsArray = [];
    if (typeof adminUser.permissions === 'string' && adminUser.permissions.trim() !== '') {
      permissionsArray = adminUser.permissions.split(',').map((p) => p.trim()).filter(Boolean);
    } else if (Array.isArray(adminUser.permissions)) {
      permissionsArray = adminUser.permissions;
    }

    // Ký phiên đăng nhập thành JWT có chữ ký, chống giả mạo cookie.
    // Toàn bộ thông tin xác thực (id, email, quyền) nằm trong token này,
    // không còn cookie "admin_permissions" rời rạc mà client có thể tự sửa.
    const token = signAdminToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      permissions: permissionsArray,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    // Xóa cookie cũ (nếu còn từ phiên bản trước) để tránh dữ liệu rác
    response.cookies.delete('admin_permissions');

    return response;
  } catch (err) {
    console.error('CRITICAL LOGIN ERROR:', err);
    return NextResponse.json({ error: `Lỗi Server: ${err.message}` }, { status: 500 });
  }
}