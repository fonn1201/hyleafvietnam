import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim();

    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { orderCode: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Lỗi lấy danh sách đơn hàng:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
