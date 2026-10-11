// Giới hạn tần suất request đơn giản theo IP, lưu tạm trong bộ nhớ (Map).
// Đủ dùng cho quy mô 1 server duy nhất (chạy 1 tiến trình Node, không chạy
// nhiều instance song song); không cần Redis. Dữ liệu sẽ mất khi restart
// server - chấp nhận được vì mục đích chỉ là chặn spam/bot cơ bản, không
// phải giới hạn nghiêm ngặt tuyệt đối.
const requestLog = new Map();

// Cửa sổ thời gian dài nhất đang dùng ở bất kỳ nơi nào (1 giờ). Chỉ dùng
// để dọn bộ nhớ: bỏ các key mà lần ghi nhận gần nhất đã quá cũ.
const MAX_WINDOW_MS = 60 * 60 * 1000;

function getRecent(key, windowMs, now = Date.now()) {
  return (requestLog.get(key) || []).filter((t) => now - t < windowMs);
}

function pruneIfLarge(now) {
  // Dọn bớt bộ nhớ định kỳ, tránh Map phình to vô hạn theo thời gian
  if (requestLog.size > 5000) {
    for (const [k, v] of requestLog) {
      if (v.every((t) => now - t > MAX_WINDOW_MS)) requestLog.delete(k);
    }
  }
}

/**
 * Trả về true nếu request được phép đi tiếp, false nếu vượt giới hạn.
 * Mỗi lần gọi (khi còn được phép) sẽ tự ghi nhận thêm 1 lượt.
 * @param {string} key - định danh (thường là IP), vd 'orders:1.2.3.4'
 * @param {number} maxRequests - số request tối đa trong khoảng thời gian
 * @param {number} windowMs - khoảng thời gian tính bằng mili giây
 */
export function checkRateLimit(key, maxRequests = 5, windowMs = 10 * 60 * 1000) {
  const now = Date.now();
  const timestamps = getRecent(key, windowMs, now);

  if (timestamps.length >= maxRequests) {
    requestLog.set(key, timestamps);
    return false;
  }

  timestamps.push(now);
  requestLog.set(key, timestamps);
  pruneIfLarge(now);

  return true;
}

/**
 * Chỉ KIỂM TRA đã vượt giới hạn chưa, KHÔNG ghi nhận thêm lượt nào.
 * Dùng cùng recordRateLimitHit/clearRateLimit cho trường hợp chỉ muốn đếm
 * các lần THẤT BẠI (vd đăng nhập sai), không đếm lần thành công.
 */
export function isRateLimited(key, maxRequests, windowMs) {
  return getRecent(key, windowMs).length >= maxRequests;
}

/** Ghi nhận 1 lượt (vd 1 lần đăng nhập sai). */
export function recordRateLimitHit(key, windowMs) {
  const now = Date.now();
  const timestamps = getRecent(key, windowMs, now);
  timestamps.push(now);
  requestLog.set(key, timestamps);
  pruneIfLarge(now);
}

/** Xóa bộ đếm của 1 key (vd sau khi đăng nhập thành công). */
export function clearRateLimit(key) {
  requestLog.delete(key);
}

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}
