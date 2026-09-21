/**
 * Tạo URL ảnh QR chuyển khoản theo chuẩn VietQR, dùng dịch vụ ảnh công
 * khai của VietQR (img.vietqr.io) - không cần đăng ký API key, không cần
 * tích hợp cổng thanh toán. Khách quét QR bằng app ngân hàng bất kỳ có hỗ
 * trợ VietQR là tự điền sẵn số tài khoản, số tiền và nội dung chuyển khoản.
 */
export function buildVietQrUrl({ bin, accountNumber, accountName, amount, addInfo, template = 'compact2' }) {
  if (!bin || !accountNumber) return null;

  const params = new URLSearchParams();
  if (amount) params.set('amount', String(Math.round(amount)));
  if (addInfo) params.set('addInfo', addInfo);
  if (accountName) params.set('accountName', accountName);

  return `https://img.vietqr.io/image/${bin}-${accountNumber}-${template}.png?${params.toString()}`;
}
