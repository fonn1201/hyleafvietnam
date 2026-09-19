import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    const session = verifyAdminToken(token);

    if (!session) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn!' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ mật khẩu cũ và mới!' }, { status: 400 });
    }

    // Chỉ tìm đúng tài khoản đang đăng nhập theo id đã xác thực trong JWT
    const user = await prisma.user.findUnique({ where: { id: session.id } });

    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản quản trị trong cơ sở dữ liệu!' }, { status: 404 });
    }

    // Kiểm tra mật khẩu cũ
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Mật khẩu cũ không chính xác!' }, { status: 400 });
    }

    // Mã hóa và cập nhật mật khẩu mới
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword },
    });

    return NextResponse.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống khi đổi mật khẩu!' }, { status: 500 });
  }
}