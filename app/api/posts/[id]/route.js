import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    const body = await request.json();

    const post = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        excerpt: body.excerpt || '',
        content: body.content || '',
        image: body.image || '',
        published: Boolean(body.published),
      },
    });

    return NextResponse.json(post);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = Number(resolvedParams.id);
    await prisma.post.delete({ where: { id } });
    return NextResponse.json({ message: 'Đã xóa bài viết' });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}