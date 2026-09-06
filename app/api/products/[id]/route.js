import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. GET: Lấy chi tiết sản phẩm theo slug, code hoặc id
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.id;

    let product = null;

    // Ưu tiên tìm theo slug trước
    product = await prisma.product.findFirst({
      where: { slug: identifier },
      include: { categories: true },
    });

    // Nếu không có slug, thử tìm theo code
    if (!product) {
      product = await prisma.product.findFirst({
        where: { code: identifier },
        include: { categories: true },
      });
    }

    // Nếu vẫn không có, thử tìm theo ID dạng số
    if (!product) {
      const numericId = Number(identifier);
      if (!isNaN(numericId)) {
        product = await prisma.product.findUnique({
          where: { id: numericId },
          include: { categories: true },
        });
      }
    }

    if (!product) {
      return NextResponse.json({ error: 'Không tìm thấy sản phẩm' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết sản phẩm:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 2. PUT: Cập nhật sản phẩm theo ID trên URL
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
    }

    const body = await request.json();
    const {
      code,
      name,
      price,
      stock, // Nhận thêm trường stock
      description,
      image,
      isVisible,
      isBestSeller,
      isGift,
      categoryIds,
    } = body;

    const stockVal = stock !== undefined && stock !== null ? Number(stock) : 0;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        code,
        name,
        price: String(price),
        stock: isNaN(stockVal) ? 0 : stockVal, // Lưu tồn kho khi cập nhật qua route động ID
        description: description || '',
        image: image || '',
        isVisible: Boolean(isVisible),
        isBestSeller: Boolean(isBestSeller),
        isGift: Boolean(isGift),
        categories: {
          set: (categoryIds || []).map((catId) => ({ id: Number(catId) })),
        },
      },
      include: {
        categories: true,
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// 3. DELETE: Xóa sản phẩm theo ID trên URL
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID sản phẩm không hợp lệ' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Đã xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa sản phẩm:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}