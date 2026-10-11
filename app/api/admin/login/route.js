import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signAdminToken, ADMIN_COOKIE_NAME, ADMIN_COOKIE_MAX_AGE } from '@/lib/auth';
import { getClientIp, isRateLimited, recordRateLimitHit, clearRateLimit } from '@/lib/rateLimit';

// Tối đa 5 lần đăng nhập SAI trong 15 phút cho mỗi địa chỉ IP (chỉ đếm
// lần sai, đăng nhập đúng không bị tính và sẽ xóa bộ đếm).
const LOGIN_MAX_FAILURES = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Hash giả để vẫn chạy bcrypt.compare khi email không tồn tại - nhờ đó thời
// gian phản hồi giữa "email không có" và "sai mật khẩu" gần như bằng nhau,
// kẻ tấn công không dò được email nào tồn tại qua độ trễ.
const DUMMY_HASH = bcrypt.hashSync('khong-phai-mat-khau-that', 10);

const GENERIC_AUTH_ERROR = 'Email hoặc mật khẩu không chính xác!';

export async function POST(request) {
  try {
    const rateKey = `admin-login:${getClientIp(request)}`;
    if (isRateLimited(rateKey, LOGIN_MAX_FAILURES, LOGIN_WINDOW_MS)) {
      return NextResponse.json(
        { error: 'Bạn đã nhập sai quá nhiều lần. Vui lòng thử lại sau 15 phút.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ email và mật khẩu!' }, { status: 400 });
    }

    // Chặn kiểu dữ liệu lạ (vd object/mảng gửi lên thay vì chuỗi) và mật
    // khẩu dài bất thường trước khi đụng tới database/bcrypt
    if (typeof email !== 'string' || typeof password !== 'string' || password.length > 128) {
      recordRateLimitHit(rateKey, LOGIN_WINDOW_MS);
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // Tìm user trong database
    const adminUser = await prisma.user.findUnique({
      where: { email },
    });

    // Luôn chạy bcrypt.compare dù user có tồn tại hay không (xem DUMMY_HASH)
    const isPasswordValid = await bcrypt.compare(password, adminUser ? adminUser.password : DUMMY_HASH);

    if (!adminUser || !isPasswordValid) {
      recordRateLimitHit(rateKey, LOGIN_WINDOW_MS);
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    clearRateLimit(rateKey);

    // Chuẩn hóa danh sách quyền thành mảng
    let permissionsArray = [];
    if (typeof adminUser.permissions === 'string' && adminUser.permissions.trim() !== '') {
      permissionsArray = adminUser.permissions.split(',').map((p) => p.trim()).filter(Boolean);
    } else if (Array.isArray(adminUser.permissions)) {
      permissionsArray = adminUser.permissions;
    }

    // Ký phiên đăng nhập thành JWT có chữ ký, chống giả mạo cookie.
    // Toàn bộ thông tin xác thực (id, email, quyền) nằm trong token này,
    // không còn cookie "admin_permissions" rời rạc mà client có thể tự sửa.
    const token = signAdminToken({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      permissions: permissionsArray,
    });

    const response = NextResponse.json({ success: true });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    // Xóa cookie cũ (nếu còn từ phiên bản trước) để tránh dữ liệu rác
    response.cookies.delete('admin_permissions');

    return response;
  } catch (err) {
    // Chỉ ghi log phía server, KHÔNG trả chi tiết lỗi nội bộ (vd lỗi
    // database/cấu hình) về cho người gọi API.
    console.error('CRITICAL LOGIN ERROR:', err);
    return NextResponse.json({ error: 'Lỗi hệ thống, vui lòng thử lại sau.' }, { status: 500 });
  }
}
