import jwt from 'jsonwebtoken';

// QUAN TRỌNG: Đặt biến môi trường JWT_SECRET trong file .env (không commit lên Git).
// Nếu thiếu, dùng tạm secret ngẫu nhiên cho môi trường dev để tránh crash,
// nhưng KHÔNG được để trống khi deploy production (mọi token sẽ mất hiệu lực khi restart server).
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error(
    'CẢNH BÁO BẢO MẬT: Chưa cấu hình biến môi trường JWT_SECRET trong môi trường production!'
  );
}

const SECRET = JWT_SECRET || 'dev-only-insecure-secret-change-me';
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 ngày

/**
 * Ký phiên đăng nhập admin thành JWT.
 * Payload chỉ nên chứa id, email, name, permissions — không chứa mật khẩu.
 */
export function signAdminToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: TOKEN_MAX_AGE_SECONDS });
}

/**
 * Xác thực JWT. Trả về payload đã giải mã nếu hợp lệ, hoặc null nếu token
 * thiếu, sai chữ ký, hoặc đã hết hạn.
 */
export function verifyAdminToken(token) {
  if (!token) return null;
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

export const ADMIN_COOKIE_NAME = 'admin_token';
export const ADMIN_COOKIE_MAX_AGE = TOKEN_MAX_AGE_SECONDS;

/**
 * Kiểm tra một tập quyền (mảng string) có đủ quyền yêu cầu không.
 * 'all' luôn được coi là có mọi quyền.
 */
export function hasPermission(permissions, required) {
  if (!required) return true;
  const list = Array.isArray(permissions) ? permissions : [];
  return list.includes('all') || list.includes(required);
}
