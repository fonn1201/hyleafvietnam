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