import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;
    const permissionsCookie = cookieStore.get('admin_permissions')?.value || 'products, categories, users, news';

    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập' }, { status: 401 });
    }

    const permissions = permissionsCookie.split(',').map((p) => p.trim());

    // Nếu token đang lưu chính là email của admin (hoặc bạn có thể tối ưu theo cách lưu trữ của hệ thống login)
    // Ở đây ta ưu tiên tìm user đầu tiên có quyền admin hoặc lấy user khớp với token/session nếu có, 
    // Hoặc linh hoạt lấy user đầu tiên trong bảng User nếu hệ thống chạy đơn tài khoản/đa tài khoản quản trị.
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: token }, // Trường hợp token lưu email
          { email: 'nqhao1201@gmail.com' } // Hoặc fallback về tài khoản hiện tại của bạn
        ]
      }
    });

    // Nếu vẫn chưa thấy, lấy đại diện user đầu tiên trong cơ sở dữ liệu
    if (!user) {
      user = await prisma.user.findFirst();
    }

    return NextResponse.json({
      success: true,
      permissions: permissions,
      user: {
        email: user ? user.email : 'nqhao1201@gmail.com',
        name: user ? user.name : 'Quản Trị Viên',
        permissions: permissions,
      },
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}