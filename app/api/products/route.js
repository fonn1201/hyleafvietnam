import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/slugify';

// GET: Lấy danh sách sản phẩm
export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { categories: true },
      orderBy: { id: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tạo sản phẩm mới
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Bóc tách và loại bỏ id (vì khi tạo mới id phải để tự động tăng)
    const { id, ...restBody } = body;

    // Tự động sinh slug
    const slug = restBody.slug ? generateSlug(restBody.slug) : generateSlug(restBody.name);

    const newProduct = await prisma.product.create({
      data: {
        code: restBody.code,
        name: restBody.name,
        slug: slug,
        price: restBody.price ? String(restBody.price) : "0",
        description: restBody.description || null,
        isVisible: restBody.isVisible !== undefined ? Boolean(restBody.isVisible) : true,
        image: restBody.image || null,
        isBestSeller: Boolean(restBody.isBestSeller),
        isGift: Boolean(restBody.isGift),
        categories: {
          connect: (restBody.categoryIds || []).map((catId) => ({ id: Number(catId) })),
        },
      },
      include: { categories: true },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error("LỖI API PRODUCTS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật sản phẩm (BẮT BUỘC CÓ ĐỂ SỬA SẢN PHẨM)
export async function PUT(request) {
  try {
    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm cần cập nhật' }, { status: 400 });
    }

    // Tự động sinh lại slug khi cập nhật (hoặc giữ theo tên/slug mới)
    const slug = body.slug ? generateSlug(body.slug) : generateSlug(body.name);

    const updatedProduct = await prisma.product.update({
      where: { id: Number(body.id) },
      data: {
        code: body.code,
        name: body.name,
        slug: slug, // Cập nhật lại trường slug trong database
        price: Number(body.price),
        description: body.description || null,
        isVisible: body.isVisible !== undefined ? Boolean(body.isVisible) : true,
        image: body.image || null,
        isBestSeller: Boolean(body.isBestSeller),
        isGift: Boolean(body.isGift),
        // Dùng 'set' để ghi đè danh mục mới khi cập nhật sản phẩm
        categories: {
          set: (body.categoryIds || []).map((id) => ({ id: Number(id) })),
        },
      },
      include: { categories: true },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa sản phẩm
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID sản phẩm' }, { status: 400 });
    }

    await prisma.product.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}