import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Chưa đăng nhập hoặc phiên làm việc hết hạn!' }, { status: 401 });
    }

    const { oldPassword, newPassword } = await request.json();

    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ mật khẩu cũ và mới!' }, { status: 400 });
    }

    // Tìm đúng tài khoản đang thao tác dựa trên token hoặc email thực tế
    let user = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: token },
          { email: 'nqhao1201@gmail.com' }
        ]
      }
    });

    if (!user) {
      user = await prisma.user.findFirst(); // Lấy user đầu tiên nếu không khớp
    }

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