import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';

export async function GET(request) {
  try {
    const ip = getClientIp(request);
    // Giới hạn nhẹ để tránh dò mã đơn hàng hàng loạt (brute-force)
    if (!checkRateLimit(`orders-lookup:${ip}`, 20, 10 * 60 * 1000)) {
      return NextResponse.json({ error: 'Bạn đã tra cứu quá nhiều lần. Vui lòng thử lại sau ít phút.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code')?.trim();
    const phone = searchParams.get('phone')?.replace(/\D/g, '');

    if (!code || !phone) {
      return NextResponse.json({ error: 'Vui lòng nhập đầy đủ mã đơn hàng và số điện thoại.' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderCode: code },
      include: { items: true },
    });

    // Trả cùng 1 thông báo cho cả 2 trường hợp (không tìm thấy mã / mã có
    // nhưng SĐT không khớp) - tránh lộ thông tin "mã này có tồn tại" cho
    // người dò ngẫu nhiên
    if (!order || order.customerPhone !== phone) {
      return NextResponse.json(
        { error: 'Không tìm thấy đơn hàng phù hợp với mã và số điện thoại đã nhập.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Lỗi tra cứu đơn hàng:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra, vui lòng thử lại.' }, { status: 500 });
  }
}
