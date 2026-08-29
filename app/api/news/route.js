import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách hoặc lấy chi tiết theo slug/id
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id) {
      const news = await prisma.news.findUnique({ where: { id: Number(id) } });
      return NextResponse.json(news);
    }

    if (slug) {
      const news = await prisma.news.findUnique({ where: { slug } });
      if (!news) return NextResponse.json({ error: 'Không tìm thấy tin tức' }, { status: 404 });
      return NextResponse.json(news);
    }

    const newsList = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(newsList);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Tạo mới tin tức (có tự động tạo slug nếu chưa có)
export async function POST(request) {
  try {
    const body = await request.json();
    let slug = body.slug;
    
    if (!slug && body.title) {
      slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-');
    }

    const newNews = await prisma.news.create({
      data: {
        title: body.title,
        slug: slug,
        summary: body.summary,
        content: body.content,
        image: body.image,
        source: body.source,
        published: body.published ?? true,
      },
    });
    return NextResponse.json(newNews, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Cập nhật tin tức
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'Thiếu ID tin tức' }, { status: 400 });

    const updatedNews = await prisma.news.update({
      where: { id: Number(body.id) },
      data: {
        title: body.title,
        slug: body.slug,
        summary: body.summary,
        content: body.content,
        image: body.image,
        source: body.source,
        published: body.published,
      },
    });
    return NextResponse.json(updatedNews);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa tin tức
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 });

    await prisma.news.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Xóa thành công' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}