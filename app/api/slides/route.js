import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách slides (có thể lọc active=true nếu query yêu cầu)
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active');

    const where = activeOnly === 'true' ? { active: true } : {};

    const slides = await prisma.slide.findMany({
      where,
      orderBy: { order: 'asc' },
    });
    return NextResponse.json(slides);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tạo slide mới
export async function POST(request) {
  try {
    const body = await request.json();

    const newSlide = await prisma.slide.create({
      data: {
        image: body.image,
        title: body.title || null,
        link: body.link || '/products',
        order: Number(body.order) || 0,
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    });

    return NextResponse.json(newSlide, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật slide
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Thiếu ID slide' }, { status: 400 });
    }

    const updatedSlide = await prisma.slide.update({
      where: { id: Number(body.id) },
      data: {
        image: body.image,
        title: body.title || null,
        link: body.link || '/products',
        order: Number(body.order) || 0,
        active: body.active !== undefined ? Boolean(body.active) : true,
      },
    });

    return NextResponse.json(updatedSlide);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa slide
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 });
    }

    await prisma.slide.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}