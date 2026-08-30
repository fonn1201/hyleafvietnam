import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/mail';

// 1. Lấy danh sách users (Chuyển đổi string permissions trong DB thành Array cho phía client)
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        permissions: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedUsers = users.map((user) => {
      let permissionsArray = [];
      if (typeof user.permissions === 'string' && user.permissions.trim() !== '') {
        permissionsArray = user.permissions.split(',').map((p) => p.trim()).filter(Boolean);
      } else if (Array.isArray(user.permissions)) {
        permissionsArray = user.permissions;
      }

      return {
        ...user,
        permissions: permissionsArray,
      };
    });

    return NextResponse.json(formattedUsers, { status: 200 });
  } catch (error) {
    console.error('Lỗi lấy danh sách user:', error);
    return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
  }
}

// 2. Tạo mới user (Join mảng permissions thành chuỗi String trước khi lưu vào DB)
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, name, permissions } = body;

    if (!email || !name) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ tên và email!' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email này đã tồn tại trong hệ thống!' }, { status: 400 });
    }

    const randomPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // Chuyển mảng quyền nhận từ giao diện thành chuỗi phân tách bằng dấu phẩy để khớp với kiểu String của Prisma
    const permissionsString = Array.isArray(permissions) 
      ? permissions.join(', ') 
      : (permissions || '');

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        permissions: permissionsString, 
      },
    });

    // Gửi email
    const emailSubject = 'Thông tin tài khoản & quyền quản trị hệ thống của bạn';
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #0B192C; border-bottom: 2px solid #0B192C; padding-bottom: 10px;">Xin chào ${name},</h2>
        <p>Tài khoản quản trị của bạn đã được tạo thành công.</p>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
          <p style="margin: 5px 0;"><strong>Mật khẩu tạm thời:</strong> <span style="color: #e11d48; font-weight: bold; font-size: 16px;">${randomPassword}</span></p>
        </div>
        <p>Vui lòng đăng nhập để bắt đầu công việc quản trị hệ thống.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">Trân trọng,<br/><strong>Ban Quản Trị Hệ Thống</strong></p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: emailSubject,
      html: emailHtml,
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Tạo tài khoản và phân quyền thành công!' 
    }, { status: 201 });

  } catch (error) {
    console.error('Lỗi API tạo user:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi từ server.' }, { status: 500 });
  }
}