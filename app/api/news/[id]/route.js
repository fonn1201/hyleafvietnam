import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await request.json();

    const news = await prisma.news.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        summary: body.summary || '',
        content: body.content || '',
        image: body.image || '',
        source: body.source || '',
        published: Boolean(body.published),
      },
    });

    return NextResponse.json(news);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ message: 'Đã xóa tin tức' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}