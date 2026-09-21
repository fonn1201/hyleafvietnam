import { getStatusInfo, getPaymentMethodLabel } from './orderStatus';

function itemsTableHtml(items) {
  const rows = items
    .map(
      (it) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #eee;">${it.productName}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center;">${it.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${it.price.toLocaleString('vi-VN')} đ</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${(it.price * it.quantity).toLocaleString('vi-VN')} đ</td>
    </tr>`
    )
    .join('');

  return `
  <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
    <thead>
      <tr style="background:#F0EDE6;">
        <th style="padding:8px;text-align:left;">Sản phẩm</th>
        <th style="padding:8px;text-align:center;">SL</th>
        <th style="padding:8px;text-align:right;">Đơn giá</th>
        <th style="padding:8px;text-align:right;">Thành tiền</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

function wrapEmail(title, bodyHtml) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#12412C;">
    <div style="background:#12412C;color:#FFFBF3;padding:20px;text-align:center;border-radius:12px 12px 0 0;">
      <h1 style="margin:0;font-size:20px;">HYLEAF</h1>
      <p style="margin:4px 0 0;font-size:13px;opacity:0.85;">${title}</p>
    </div>
    <div style="border:1px solid #eee;border-top:none;padding:20px;border-radius:0 0 12px 12px;">
      ${bodyHtml}
    </div>
  </div>`;
}

export function buildOrderConfirmationEmail(order) {
  const html = wrapEmail(
    'Xác nhận đặt hàng thành công',
    `
    <p>Chào <strong>${order.customerName}</strong>,</p>
    <p>Cảm ơn bạn đã đặt hàng tại Hyleaf. Đơn hàng của bạn đã được ghi nhận với thông tin sau:</p>
    <p style="font-size:15px;"><strong>Mã đơn hàng: ${order.orderCode}</strong></p>
    <p>Trạng thái hiện tại: <strong>${getStatusInfo(order.status).label}</strong></p>
    <p>Phương thức thanh toán: ${getPaymentMethodLabel(order.paymentMethod)}</p>
    <p>Địa chỉ nhận hàng: ${order.customerAddress}</p>
    ${itemsTableHtml(order.items)}
    <p style="text-align:right;font-size:16px;"><strong>Tổng cộng: ${order.totalAmount.toLocaleString('vi-VN')} đ</strong></p>
    <p style="margin-top:20px;font-size:13px;color:#666;">
      Bạn có thể tra cứu tình trạng đơn hàng bất cứ lúc nào bằng mã đơn hàng và số điện thoại đã đặt.
    </p>
  `
  );
  return { subject: `Xác nhận đơn hàng ${order.orderCode} - Hyleaf`, html };
}

export function buildOrderStatusUpdateEmail(order) {
  const statusInfo = getStatusInfo(order.status);
  const html = wrapEmail(
    'Cập nhật trạng thái đơn hàng',
    `
    <p>Chào <strong>${order.customerName}</strong>,</p>
    <p>Đơn hàng <strong>${order.orderCode}</strong> của bạn vừa được cập nhật trạng thái:</p>
    <p style="font-size:18px;text-align:center;margin:20px 0;">
      <strong style="background:#F0EDE6;padding:8px 16px;border-radius:999px;">${statusInfo.label}</strong>
    </p>
    ${itemsTableHtml(order.items)}
    <p style="text-align:right;font-size:16px;"><strong>Tổng cộng: ${order.totalAmount.toLocaleString('vi-VN')} đ</strong></p>
  `
  );
  return { subject: `Đơn hàng ${order.orderCode} - ${statusInfo.label} - Hyleaf`, html };
}
