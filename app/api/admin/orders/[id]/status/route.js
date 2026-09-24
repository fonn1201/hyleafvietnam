import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ORDER_STATUSES, isStatusChangeAllowed } from '@/lib/orderStatus';
import { sendEmail } from '@/lib/mail';
import { buildOrderStatusUpdateEmail } from '@/lib/orderEmails';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const validStatuses = ORDER_STATUSES.map((s) => s.value);

    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const existing = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (!isStatusChangeAllowed(existing, status)) {
      return NextResponse.json(
        {
          error:
            'Đơn thanh toán chuyển khoản chưa được xác nhận đã nhận tiền, chỉ có thể giữ "Chờ xác nhận" hoặc chuyển "Đã hủy". Vui lòng xác nhận thanh toán trước.',
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: { status },
      include: { items: true },
    });

    // Gửi email cập nhật trạng thái nếu khách có email và trạng thái này
    // nằm trong danh sách được admin cấu hình gửi email (trang Cài đặt)
    const setting = await prisma.setting.findUnique({ where: { id: 1 } });
    const notifyStatuses = (setting?.emailNotifyStatuses || '').split(',').map((s) => s.trim());

    if (order.customerEmail && notifyStatuses.includes(order.status)) {
      const { subject, html } = buildOrderStatusUpdateEmail(order);
      sendEmail({ to: order.customerEmail, subject, html }).catch((err) =>
        console.error('Gửi email cập nhật trạng thái thất bại:', err)
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái đơn hàng:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
