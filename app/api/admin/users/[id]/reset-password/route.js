import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function sendEmail(to, subject, html) {
  console.log(`[Mock Email] To: ${to} | Subject: ${subject} | Body: ${html}`);
}

export async function POST(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'Không tìm thấy tài khoản!' }, { status: 404 });
    }

    const newPassword = Math.random().toString(36).slice(-8) + Math.floor(1000 + Math.random() * 9000);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    await sendEmail(
      user.email,
      'Cấp lại mật khẩu quản trị hệ thống',
      `<p>Xin chào ${user.name},</p><p>Mật khẩu quản trị của bạn đã được reset. Mật khẩu mới là: <b>${newPassword}</b></p>`
    );

    return NextResponse.json({ success: true, message: 'Đã reset mật khẩu thành công và gửi qua email.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống khi reset mật khẩu!' }, { status: 500 });
  }
}