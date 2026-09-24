import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ORDER_STATUSES, isStatusChangeAllowed } from '@/lib/orderStatus';
import { sendEmail } from '@/lib/mail';
import { buildOrderStatusUpdateEmail } from '@/lib/orderEmails';

export async function PATCH(request) {
  try {
    const { orderIds, status } = await request.json();
    const validStatuses = ORDER_STATUSES.map((s) => s.value);

    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: 'Chưa chọn đơn hàng nào' }, { status: 400 });
    }
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    const ids = orderIds.map(Number);
    const orders = await prisma.order.findMany({ where: { id: { in: ids } } });

    if (orders.length !== ids.length) {
      return NextResponse.json({ error: 'Một số đơn hàng không còn tồn tại, vui lòng tải lại trang' }, { status: 400 });
    }

    // Bắt buộc tất cả đơn được chọn phải CÙNG 1 trạng thái hiện tại mới
    // cho cập nhật hàng loạt (tránh đổi nhầm hàng loạt đơn đang ở các
    // bước khác nhau)
    const distinctStatuses = new Set(orders.map((o) => o.status));
    if (distinctStatuses.size > 1) {
      return NextResponse.json(
        { error: 'Các đơn hàng đã chọn đang không cùng trạng thái, không thể cập nhật hàng loạt' },
        { status: 400 }
      );
    }

    const blocked = orders.find((o) => !isStatusChangeAllowed(o, status));
    if (blocked) {
      return NextResponse.json(
        {
          error: `Đơn ${blocked.orderCode} thanh toán chuyển khoản chưa được xác nhận, không thể chuyển sang trạng thái này. Vui lòng xác nhận thanh toán từng đơn trước.`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.$transaction(
      orders.map((o) =>
        prisma.order.update({ where: { id: o.id }, data: { status }, include: { items: true } })
      )
    );

    // Gửi email cho từng đơn theo cấu hình trạng thái được thông báo
    const setting = await prisma.setting.findUnique({ where: { id: 1 } });
    const notifyStatuses = (setting?.emailNotifyStatuses || '').split(',').map((s) => s.trim());

    if (notifyStatuses.includes(status)) {
      for (const order of updated) {
        if (order.customerEmail) {
          const { subject, html } = buildOrderStatusUpdateEmail(order);
          sendEmail({ to: order.customerEmail, subject, html }).catch((err) =>
            console.error('Gửi email cập nhật trạng thái thất bại:', err)
          );
        }
      }
    }

    return NextResponse.json({ success: true, updatedCount: updated.length });
  } catch (error) {
    console.error('Lỗi cập nhật hàng loạt:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
