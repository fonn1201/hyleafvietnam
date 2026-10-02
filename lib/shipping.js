/**
 * Tính phí vận chuyển dựa trên tạm tính đơn hàng và cấu hình ở Cài đặt.
 * Tách thành hàm riêng (thay vì rải rác ở nhiều nơi) để sau này nếu nâng
 * cấp lên tính phí theo khu vực/tỉnh thành, chỉ cần sửa đúng hàm này
 * (thêm tham số địa chỉ/khu vực), không phải sửa lại toàn bộ luồng
 * giỏ hàng/checkout/API đặt hàng đang gọi tới nó.
 *
 * @param {number} subtotal - Tổng tiền hàng (chưa gồm phí ship), đơn vị đồng
 * @param {{shippingEnabled: boolean, freeShippingThreshold: number, shippingFee: number}} setting
 * @returns {{fee: number, isFree: boolean, amountToFreeShipping: number}}
 */
export function calculateShippingFee(subtotal, setting) {
  if (!setting?.shippingEnabled) {
    return { fee: 0, isFree: true, amountToFreeShipping: 0 };
  }

  const threshold = setting.freeShippingThreshold ?? 0;
  const isFree = subtotal >= threshold;

  return {
    fee: isFree ? 0 : (setting.shippingFee ?? 0),
    isFree,
    // Còn thiếu bao nhiêu để được miễn phí ship - dùng hiện gợi ý ở giỏ hàng
    amountToFreeShipping: isFree ? 0 : threshold - subtotal,
  };
}
