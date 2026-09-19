import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifyAdminToken(token);

    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên đã hết hạn' }, { status: 401 });
    }

    // Tra đúng user theo id đã xác thực trong JWT — KHÔNG fallback sang user khác,
    // tránh lộ thông tin tài khoản admin bất kỳ khi token không khớp.
    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user) {
      return NextResponse.json({ error: 'Tài khoản không còn tồn tại' }, { status: 401 });
    }

    let permissions = [];
    if (user.permissions) {
      permissions = user.permissions.split(',').map((p) => p.trim()).filter(Boolean);
    }

    return NextResponse.json({
      success: true,
      permissions,
      user: {
        email: user.email,
        name: user.name,
        permissions,
      },
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}