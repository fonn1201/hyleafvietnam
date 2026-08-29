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