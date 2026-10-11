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

    if (typeof oldPassword !== 'string' || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ!' }, { status: 400 });
    }

    // Mật khẩu mới tối thiểu 8 ký tự; tối đa 72 vì bcrypt chỉ xét 72 byte
    // đầu, quá dài sẽ bị cắt ngầm mà người dùng không biết.
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Mật khẩu mới phải có ít nhất 8 ký tự!' }, { status: 400 });
    }
    if (newPassword.length > 72) {
      return NextResponse.json({ error: 'Mật khẩu mới tối đa 72 ký tự!' }, { status: 400 });
    }
    if (newPassword === oldPassword) {
      return NextResponse.json({ error: 'Mật khẩu mới phải khác mật khẩu cũ!' }, { status: 400 });
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