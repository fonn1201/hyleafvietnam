import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateSlug } from '@/lib/slugify';

export async function GET() {
  try {
    const categories = await prisma.category.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { id, name, ...rest } = body; // Lọc bỏ id ra khỏi body

    const slug = body.slug ? generateSlug(body.slug) : generateSlug(name);

    const newCategory = await prisma.category.create({
      data: {
        ...rest,
        name,
        slug,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const updatedCategory = await prisma.category.update({
      where: { id: Number(body.id) },
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
      },
    });
    return NextResponse.json(updatedCategory);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await prisma.category.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}