import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy chi tiết danh mục kèm theo danh sách sản phẩm thuộc danh mục đó
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const identifier = resolvedParams.id; // Ở đây [id] folder nhưng có thể truyền vào slug hoặc id

    // Kiểm tra xem identifier là số (id) hay chuỗi (slug)
    const isNumeric = !isNaN(Number(identifier));

    const category = await prisma.category.findUnique({
      where: isNumeric ? { id: Number(identifier) } : { slug: identifier },
      include: {
        products: {
          where: { isVisible: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: 'Không tìm thấy danh mục' }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error('Lỗi khi lấy chi tiết danh mục:', error);
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// PUT: Cập nhật danh mục
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await request.json();

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/ /g, '-'),
        description: body.description || '',
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa danh mục
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);

    await prisma.category.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}