import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id: Number(id) },
      include: { items: true, customer: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Sửa thông tin đơn hàng: tên/SĐT/địa chỉ khách nhận, và đổi phương thức
// thanh toán (chỉ 1 chiều: chuyển khoản -> COD). KHÔNG dùng để đổi trạng
// thái vận đơn hay xác nhận thanh toán - xem 2 route riêng:
// /status và /payment-confirm.
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const orderId = Number(id);
    const body = await request.json();

    const existing = await prisma.order.findUnique({ where: { id: orderId } });
    if (!existing) {
      return NextResponse.json({ error: 'Không tìm thấy đơn hàng' }, { status: 404 });
    }

    const data = {};

    // Tính trước giá trị tên/địa chỉ CUỐI CÙNG (sau khi áp dụng chỉnh sửa
    // nếu có) - dùng để tạo hồ sơ khách hàng mới bên dưới nếu cần, tránh
    // tạo hồ sơ mới với dữ liệu cũ khi admin sửa cả tên lẫn SĐT cùng lúc
    const finalName = body.customerName !== undefined ? body.customerName.trim() : existing.customerName;
    const finalAddress = body.customerAddress !== undefined ? body.customerAddress.trim() : existing.customerAddress;

    if (body.customerName !== undefined) {
      if (!finalName) {
        return NextResponse.json({ error: 'Tên khách hàng không được để trống' }, { status: 400 });
      }
      data.customerName = finalName;
    }

    if (body.customerAddress !== undefined) {
      if (!finalAddress) {
        return NextResponse.json({ error: 'Địa chỉ không được để trống' }, { status: 400 });
      }
      data.customerAddress = finalAddress;
    }

    // Đổi SĐT -> liên kết lại đơn hàng với đúng hồ sơ Khách Hàng tương
    // ứng: SĐT đã có hồ sơ thì gắn vào (GIỮ NGUYÊN tên/địa chỉ hồ sơ đó,
    // không ghi đè theo đơn), SĐT chưa có thì tạo hồ sơ mới từ thông tin
    // đơn hàng hiện tại.
    if (body.customerPhone !== undefined) {
      const phoneDigits = body.customerPhone.replace(/\D/g, '');
      if (phoneDigits.length < 9 || phoneDigits.length > 11) {
        return NextResponse.json({ error: 'Số điện thoại không hợp lệ' }, { status: 400 });
      }
      data.customerPhone = phoneDigits;

      if (phoneDigits !== existing.customerPhone) {
        let customer = await prisma.customer.findUnique({ where: { phone: phoneDigits } });
        if (!customer) {
          customer = await prisma.customer.create({
            data: { name: finalName, phone: phoneDigits, address: finalAddress },
          });
        }
        data.customerId = customer.id;
      }
    }

    // Chỉ cho phép đổi thanh toán 1 chiều: chuyển khoản -> COD (không cho
    // đổi ngược lại COD -> chuyển khoản, vì đơn COD không có luồng xác
    // nhận thanh toán/QR)
    if (body.paymentMethod !== undefined && body.paymentMethod !== existing.paymentMethod) {
      if (existing.paymentMethod === 'bank_transfer' && body.paymentMethod === 'cod') {
        data.paymentMethod = 'cod';
      } else {
        return NextResponse.json(
          { error: 'Chỉ được đổi phương thức thanh toán từ Chuyển khoản sang COD' },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data,
      include: { items: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Lỗi cập nhật thông tin đơn hàng:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
