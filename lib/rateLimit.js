// Giới hạn tần suất request đơn giản theo IP, lưu tạm trong bộ nhớ (Map).
// Đủ dùng cho quy mô 1 server duy nhất; không cần Redis. Dữ liệu sẽ mất
// khi restart server - chấp nhận được vì mục đích chỉ là chặn spam/bot
// cơ bản, không phải giới hạn nghiêm ngặt tuyệt đối.
const requestLog = new Map();

/**
 * Trả về true nếu request được phép đi tiếp, false nếu vượt giới hạn.
 * @param {string} key - định danh (thường là IP), vd 'orders:1.2.3.4'
 * @param {number} maxRequests - số request tối đa trong khoảng thời gian
 * @param {number} windowMs - khoảng thời gian tính bằng mili giây
 */
export function checkRateLimit(key, maxRequests = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const timestamps = (requestLog.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    requestLog.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);

  // Dọn bớt bộ nhớ định kỳ, tránh Map phình to vô hạn theo thời gian
  if (requestLog.size > 5000) {
    for (const [k, v] of requestLog) {
      if (v.every((t) => now - t > windowMs)) requestLog.delete(k);
    }
  }

  return true;
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
