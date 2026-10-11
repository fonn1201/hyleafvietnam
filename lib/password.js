import { randomInt } from 'crypto';

// Bỏ các ký tự dễ nhầm (0/O, 1/l/I) vì mật khẩu tạm được gửi qua email
// để người dùng tự gõ lại.
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

/**
 * Sinh mật khẩu tạm bằng bộ sinh số ngẫu nhiên an toàn về mặt mật mã
 * (crypto.randomInt) - thay cho Math.random() trước đây vốn có thể bị đoán
 * ngược. 14 ký tự từ bảng 54 ký tự ≈ 80 bit entropy.
 */
export function generateTempPassword(length = 14) {
  let result = '';
  for (let i = 0; i < length; i += 1) {
    result += ALPHABET[randomInt(ALPHABET.length)];
  }
  return result;
}
