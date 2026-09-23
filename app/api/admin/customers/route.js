import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.trim();

    const where = search
      ? {
          OR: [
            { name: { contains: search } },
            { phone: { contains: search } },
          ],
        }
      : {};

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: { id: true, totalAmount: true, status: true },
        },
      },
    });

    const result = customers.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone,
      email: c.email,
      address: c.address,
      createdAt: c.createdAt,
      orderCount: c.orders.length,
      totalSpent: c.orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error('Lỗi lấy danh sách khách hàng:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
