// lib/utils.js

export function formatPrice(priceString, isOnlineSales) {
  // 1. Nếu Admin tắt tính năng "Mở bán online" -> Ép hiển thị "Liên hệ"
  if (!isOnlineSales) {
    return "Liên hệ";
  }

  // 2. Chuyển giá trị về dạng số
  const numericPrice = Number(priceString);

  // 3. Nếu không có giá, giá không phải là số, hoặc nhỏ hơn/bằng 0 -> Hiển thị "Liên hệ"
  if (priceString === null || priceString === undefined || isNaN(numericPrice) || numericPrice <= 0) {
    return "Liên hệ";
  }
  
  // 4. Nếu Admin bật Mở bán online và giá hợp lệ -> Format thành tiền VNĐ
  return numericPrice.toLocaleString('vi-VN') + ' đ';
}

/**
 * Chuyển chuỗi quyền lưu trong DB (vd: "products, news") thành mảng.
 * Dùng chung để tránh lặp logic parse ở nhiều route/trang khác nhau.
 */
export function parsePermissions(permissions) {
  if (Array.isArray(permissions)) return permissions;
  if (typeof permissions === 'string' && permissions.trim() !== '') {
    return permissions.split(',').map((p) => p.trim()).filter(Boolean);
  }
  return [];
}
/**
 * Chuyển nội dung rich text (HTML) thành chữ thuần để hiển thị tóm tắt
 * (thẻ sản phẩm ở trang danh sách, meta description cho SEO). Ngắt dòng
 * giữa các đoạn thành khoảng trắng và giải mã vài ký tự đặc biệt thường
 * gặp (&amp; &nbsp; ...), để không hiện thẻ <p> hay "&amp;" ra cho khách.
 */
export function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<\/(p|div|li|h[1-6]|blockquote)>|<br\s*\/?>/gi, ' ')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&') // giải mã &amp; sau cùng để không giải mã 2 lần
    .replace(/\s+/g, ' ')
    .trim();
}
