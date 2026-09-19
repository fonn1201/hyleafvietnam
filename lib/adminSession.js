import { cookies } from 'next/headers';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

/**
 * Đọc & xác thực JWT từ cookie ngay tại server, dùng ở đầu mỗi trang admin
 * (server component) để lấy quyền hạn (permissions) và thông tin người
 * đăng nhập hiện tại, truyền xuống client component qua props.
 * Middleware (proxy.js) đã đảm bảo tới được đây là đã có phiên hợp lệ,
 * nên session ở đây gần như luôn tồn tại; vẫn phòng hờ trả về rỗng.
 */
export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminToken(token);
  return session; // { id, email, name, permissions } hoặc null
}
