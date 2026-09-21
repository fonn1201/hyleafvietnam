import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateOrderCode } from '@/lib/orderCode';
import { checkRateLimit, getClientIp } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/mail';
import { buildOrderConfirmationEmail } from '@/lib/orderEmails';

export async function POST(request) {
  try {
    const body = await request.json();

    // Honeypot: trường ẩn mà người dùng thật không bao giờ điền, bot thì
    // thường tự động điền hết mọi input tìm thấy được. Nếu có giá trị ->
    // coi như spam, trả về thành công giả để không "dạy" bot biết bị chặn.
    if (body.website) {
      return NextResponse.json({ success: true, orderCode: 'HL00000000-000' });
    }

    // Giới hạn tần suất theo IP, chống spam đặt hàng ảo hàng loạt
    const ip = getClientIp(request);
    if (!checkRateLimit(`orders:${ip}`, 5, 10 * 60 * 1000)) {
      return NextResponse.json(
        { error: 'Bạn đã đặt hàng quá nhiều lần trong thời gian ngắn. Vui lòng thử lại sau ít phút.' },
        { status: 429 }
      );
    }

    const setting = await prisma.setting.findUnique({ where: { id: 1 } });
    if (!setting?.isOnlineSales) {
      return NextResponse.json(
        { error: 'Website hiện chưa mở bán online, vui lòng liên hệ trực tiếp để đặt hàng.' },
        { status: 403 }
      );
    }

    const { customerName, customerPhone, customerEmail, customerAddress, note, paymentMethod, items } = body;

    if (!customerName?.trim() || !customerPhone?.trim() || !customerAddress?.trim()) {
      return NextResponse.json({ error: 'Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ nhận hàng.' }, { status: 400 });
    }

    const phoneDigits = customerPhone.replace(/\D/g, '');
    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      return NextResponse.json({ error: 'Số điện thoại không hợp lệ.' }, { status: 400 });
    }

    if (!['cod', 'bank_transfer'].includes(paymentMethod)) {
      return NextResponse.json({ error: 'Phương thức thanh toán không hợp lệ.' }, { status: 400 });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Giỏ hàng đang trống.' }, { status: 400 });
    }

    // Tra lại đúng giá & tồn kho THẬT từ database tại thời điểm đặt hàng -
    // KHÔNG tin theo giá/tên client tự gửi lên, tránh khách sửa giá qua
    // devtools. Đồng thời đây là dữ liệu sẽ được snapshot vào OrderItem.
    const productIds = items.map((it) => Number(it.productId)).filter(Boolean);
    const products = await prisma.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const orderItemsData = [];
    for (const it of items) {
      const product = productMap.get(Number(it.productId));
      const quantity = Math.max(1, Math.min(99, parseInt(it.quantity, 10) || 1));

      if (!product || !product.isVisible) {
        return NextResponse.json({ error: `Sản phẩm "${it.name || ''}" không còn tồn tại hoặc đã ngừng bán.` }, { status: 400 });
      }
      if ((product.stock ?? 0) < quantity) {
        return NextResponse.json({ error: `Sản phẩm "${product.name}" chỉ còn ${product.stock ?? 0} trong kho.` }, { status: 400 });
      }

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        productImage: product.image || null,
        price: Math.round(Number(product.price)) || 0,
        quantity,
      });
    }

    const totalAmount = orderItemsData.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const orderCode = await generateOrderCode();

    // Tạo đơn hàng + trừ tồn kho trong cùng 1 transaction, tránh trường
    // hợp 2 khách đặt gần như đồng thời làm tồn kho bị âm
    const order = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.upsert({
        where: { phone: phoneDigits },
        update: {
          name: customerName.trim(),
          email: customerEmail?.trim() || undefined,
          address: customerAddress.trim(),
        },
        create: {
          name: customerName.trim(),
          phone: phoneDigits,
          email: customerEmail?.trim() || null,
          address: customerAddress.trim(),
        },
      });

      const created = await tx.order.create({
        data: {
          orderCode,
          customerId: customer.id,
          customerName: customerName.trim(),
          customerPhone: phoneDigits,
          customerEmail: customerEmail?.trim() || null,
          customerAddress: customerAddress.trim(),
          note: note?.trim() || null,
          paymentMethod,
          status: 'pending',
          totalAmount,
          items: { create: orderItemsData },
        },
        include: { items: true },
      });

      for (const it of orderItemsData) {
        await tx.product.update({
          where: { id: it.productId },
          data: { stock: { decrement: it.quantity } },
        });
      }

      return created;
    });

    // Gửi email xác nhận nếu khách có để lại email và trạng thái "pending"
    // nằm trong danh sách trạng thái được cấu hình gửi email (admin có thể
    // tắt/bật ở trang cài đặt)
    const notifyStatuses = (setting.emailNotifyStatuses || '').split(',').map((s) => s.trim());
    if (order.customerEmail && notifyStatuses.includes('pending')) {
      const { subject, html } = buildOrderConfirmationEmail(order);
      sendEmail({ to: order.customerEmail, subject, html }).catch((err) =>
        console.error('Gửi email xác nhận đơn hàng thất bại:', err)
      );
    }

    return NextResponse.json({ success: true, orderCode: order.orderCode, order }, { status: 201 });
  } catch (error) {
    console.error('Lỗi tạo đơn hàng:', error);
    return NextResponse.json({ error: 'Có lỗi xảy ra khi tạo đơn hàng, vui lòng thử lại.' }, { status: 500 });
  }
}
