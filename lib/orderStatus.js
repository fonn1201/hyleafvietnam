// Dùng chung ở cả trang khách (tra cứu đơn hàng) và trang admin (quản lý
// đơn hàng), tránh lặp danh sách trạng thái ở nhiều nơi.
export const ORDER_STATUSES = [
  { value: 'pending', label: 'Chờ xác nhận', color: 'amber' },
  { value: 'confirmed', label: 'Đã xác nhận', color: 'blue' },
  { value: 'shipping', label: 'Đang giao', color: 'purple' },
  { value: 'completed', label: 'Hoàn tất', color: 'emerald' },
  { value: 'cancelled', label: 'Đã hủy', color: 'red' },
];

export function getStatusInfo(value) {
  return ORDER_STATUSES.find((s) => s.value === value) || { value, label: value, color: 'gray' };
}

export const PAYMENT_METHODS = [
  { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
  { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng (quét mã QR)' },
];

export function getPaymentMethodLabel(value) {
  return PAYMENT_METHODS.find((p) => p.value === value)?.label || value;
}

/**
 * Đơn chuyển khoản (bank_transfer) CHƯA được xác nhận đã nhận tiền thì
 * KHÔNG được chuyển trạng thái vận đơn sang bất kỳ mức nào khác ngoài
 * 'pending' (giữ nguyên) hoặc 'cancelled' (hủy đơn) — bắt buộc phải xác
 * nhận thanh toán trước mới cho đi tiếp các bước sau. Đơn COD không bị
 * ràng buộc này (paymentConfirmed không áp dụng cho COD).
 */
export function isStatusChangeAllowed(order, newStatus) {
  const isUnconfirmedBankTransfer = order.paymentMethod === 'bank_transfer' && !order.paymentConfirmed;
  if (!isUnconfirmedBankTransfer) return true;
  return newStatus === 'pending' || newStatus === 'cancelled';
}
