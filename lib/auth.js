import jwt from 'jsonwebtoken';

// QUAN TRỌNG: Đặt biến môi trường JWT_SECRET trong file .env (không commit lên Git).
// Ở môi trường production, thiếu hoặc quá ngắn (< 32 ký tự) thì TỪ CHỐI hoạt động
// (không còn lặng lẽ dùng secret mặc định công khai - vì repo này public nên ai
// cũng biết chuỗi mặc định đó và có thể tự tạo token admin giả).
// Ở môi trường dev vẫn dùng secret tạm để khỏi phải cấu hình khi code thử.
const DEV_FALLBACK_SECRET = 'dev-only-insecure-secret-change-me';
const MIN_SECRET_LENGTH = 32;
const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24; // 1 ngày

function getSecret() {
  const secret = process.env.JWT_SECRET;

  if (process.env.NODE_ENV === 'production') {
    if (!secret) {
      throw new Error(
        'Thiếu biến môi trường JWT_SECRET ở môi trường production - từ chối ký/xác thực phiên đăng nhập.'
      );
    }
    if (secret.length < MIN_SECRET_LENGTH) {
      throw new Error(
        `JWT_SECRET quá ngắn (cần tối thiểu ${MIN_SECRET_LENGTH} ký tự) - từ chối ký/xác thực phiên đăng nhập. ` +
          `Tạo chuỗi mới bằng: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`
      );
    }
    return secret;
  }

  return secret || DEV_FALLBACK_SECRET;
}

/**
 * Kiểm tra cấu hình JWT_SECRET hợp lệ, ném lỗi nếu không. Dùng ở
 * instrumentation.js để server từ chối khởi động khi cấu hình sai.
 */
export function assertJwtSecretConfigured() {
  getSecret();
}

/**
 * Ký phiên đăng nhập admin thành JWT.
 * Payload chỉ nên chứa id, email, name, permissions — không chứa mật khẩu.
 */
export function signAdminToken(payload) {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_MAX_AGE_SECONDS, algorithm: 'HS256' });
}

/**
 * Xác thực JWT. Trả về payload đã giải mã nếu hợp lệ, hoặc null nếu token
 * thiếu, sai chữ ký, hết hạn, hoặc server cấu hình JWT_SECRET sai (từ chối
 * truy cập thay vì cho qua).
 */
export function verifyAdminToken(token) {
  if (!token) return null;

  let secret;
  try {
    secret = getSecret();
  } catch (err) {
    console.error(err.message);
    return null;
  }

  try {
    return jwt.verify(token, secret, { algorithms: ['HS256'] });
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
