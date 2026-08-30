import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/mail';

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

    const emailSubject = 'Cấp lại mật khẩu quản trị hệ thống';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0B192C; border-bottom: 2px solid #0B192C; padding-bottom: 10px;">Xin chào ${user.name},</h2>
        <p>Mật khẩu quản trị của bạn đã được reset thành công.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${user.email}</p>
          <p style="margin: 5px 0;"><strong>Mật khẩu mới:</strong> <span style="color: #e11d48; font-weight: bold; font-size: 16px;">${newPassword}</span></p>
        </div>
        <p>Vui lòng sử dụng mật khẩu mới này để đăng nhập vào hệ thống.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Quản Trị Hệ Thống</strong></p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({ success: true, message: 'Đã reset mật khẩu thành công và gửi qua email.' });
  } catch (err) {
    console.error('Reset password error:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống khi reset mật khẩu!' }, { status: 500 });
  }
}