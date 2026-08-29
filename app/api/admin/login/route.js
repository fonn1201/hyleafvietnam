import { NextResponse } from 'next/server';

export async function POST(request) {
  const { password } = await request.json();

  // Mật khẩu mặc định: admin123 (Anh/chị có thể đổi mật khẩu này)
  if (password === 'admin123') {
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin_token', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // Hạn dùng 1 ngày
    });
    return response;
  }

  return NextResponse.json({ error: 'Mật khẩu không đúng!' }, { status: 401 });
}