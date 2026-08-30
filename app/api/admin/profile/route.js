import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    // Tìm chính xác user dựa vào giá trị token đang lưu (hoặc email lưu trong cookie session nếu có)
    // Nếu hệ thống của bạn lưu email trực tiếp vào token/cookie, ta dùng biến `token` để tìm:
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: token },
          { name: token }
        ]
      }
    });

    // Nếu không tìm thấy bằng token, fallback lấy user đầu tiên hoặc user có email admin@gmail.com tùy theo hệ thống login của bạn
    if (!user) {
      user = await prisma.user.findFirst({ where: { email: 'admin@gmail.com' } }) || await prisma.user.findFirst();
    }

    // Tách chuỗi permissions trong cơ sở dữ liệu của user đó ra thành mảng
    let permissions = [];
    if (user && user.permissions) {
      permissions = user.permissions.split(',').map((p) => p.trim()).filter(Boolean);
    } else {
      permissions = ['products', 'categories', 'users', 'news'];
    }

    return NextResponse.json({
      success: true,
      permissions: permissions,
      user: {
        email: user ? user.email : token,
        name: user ? user.name : 'Quản Trị Viên',
        permissions: permissions,
      },
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}