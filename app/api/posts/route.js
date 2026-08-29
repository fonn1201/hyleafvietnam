import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Lấy danh sách hoặc lấy chi tiết theo id/slug
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const slug = searchParams.get('slug');

    if (id) {
      const post = await prisma.post.findUnique({ where: { id: Number(id) } });
      return NextResponse.json(post);
    }

    if (slug) {
      const post = await prisma.post.findUnique({ where: { slug } });
      if (!post) return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
      return NextResponse.json(post);
    }

    const posts = await prisma.post.findMany({ orderBy: { id: 'desc' } });
    return NextResponse.json(posts);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Lỗi lấy danh sách bài viết' }, { status: 500 });
  }
}

// POST: Tạo mới bài viết (tự động tạo slug chuẩn tiếng Việt nếu chưa có)
export async function POST(request) {
  try {
    const body = await request.json();
    const { title, excerpt, content, image, published } = body;

    if (!title) return NextResponse.json({ error: 'Tiêu đề bài viết là bắt buộc' }, { status: 400 });

    let slug = body.slug;
    if (!slug && title) {
      slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-');
    }

    const post = await prisma.post.create({
      data: {
        title,
        slug: slug || '',
        excerpt: excerpt || '',
        content: content || '',
        image: image || '',
        published: Boolean(published ?? true),
      },
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Lỗi server' }, { status: 500 });
  }
}

// PUT: Cập nhật bài viết
export async function PUT(request) {
  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'Thiếu ID bài viết' }, { status: 400 });

    const updatedPost = await prisma.post.update({
      where: { id: Number(body.id) },
      data: {
        title: body.title,
        slug: body.slug,
        excerpt: body.excerpt,
        content: body.content,
        image: body.image,
        published: body.published,
      },
    });
    return NextResponse.json(updatedPost);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Xóa bài viết
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Thiếu ID' }, { status: 400 });

    await prisma.post.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Xóa thành công' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}