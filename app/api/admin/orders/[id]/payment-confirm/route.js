import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { confirmed } = await request.json();

    const existing = await prisma.order.findUnique({ where: { id: Number(id) } });
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    if (existing.paymentMethod !== 'bank_transfer') {
      return NextResponse.json(
        { error: 'Chỉ áp dụng xác nhận thanh toán cho đơn hàng thanh toán bằng chuyển khoản' },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id: Number(id) },
      data: {
        paymentConfirmed: !!confirmed,
        paymentConfirmedAt: confirmed ? new Date() : null,
      },
      include: { items: true },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error('Lỗi xác nhận thanh toán:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
