import { prisma } from './prisma';

/**
 * Sinh mã đơn hàng dạng HL20260921-003 (HL + ngày hiện tại + số thứ tự
 * trong ngày, đếm từ 001). Đếm dựa trên số đơn đã tạo trong ngày, phòng
 * hờ trùng mã (hiếm khi 2 đơn tạo cùng lúc) bằng cách hậu tố thêm số nếu
 * trùng thay vì để lỗi unique constraint làm hỏng cả đơn hàng.
 */
export async function generateOrderCode() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  const datePart = `${y}${m}${d}`;

  const startOfDay = new Date(y, now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(y, now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const countToday = await prisma.order.count({
    where: { createdAt: { gte: startOfDay, lte: endOfDay } },
  });

  let seq = countToday + 1;
  let code = `HL${datePart}-${String(seq).padStart(3, '0')}`;

  // Vòng lặp phòng hờ trùng mã (hiếm gặp, do race condition khi 2 đơn
  // được tạo gần như đồng thời)
  let attempts = 0;
  while (attempts < 5) {
    const exists = await prisma.order.findUnique({ where: { orderCode: code } });
    if (!exists) return code;
    seq += 1;
    code = `HL${datePart}-${String(seq).padStart(3, '0')}`;
    attempts += 1;
  }

  // Fallback cuối cùng nếu vẫn trùng liên tục: thêm timestamp cho chắc chắn duy nhất
  return `HL${datePart}-${Date.now().toString().slice(-6)}`;
}
