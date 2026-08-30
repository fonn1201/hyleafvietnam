import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 1. CẬP NHẬT THÔNG TIN / QUYỀN USER (PUT)
export async function PUT(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);
    const { name, permissions } = await request.json();

    if (!name) {
      return NextResponse.json({ error: 'Tên không được để trống!' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        permissions: Array.isArray(permissions) ? permissions.join(',') : (permissions || ''),
      },
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (err) {
    console.error('Update user error:', err);
    return NextResponse.json({ error: 'Lỗi khi cập nhật tài khoản!' }, { status: 500 });
  }
}

// 2. XÓA USER (DELETE)
export async function DELETE(request, { params }) {
  try {
    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id, 10);

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete user error:', err);
    return NextResponse.json({ error: 'Lỗi khi xóa tài khoản!' }, { status: 500 });
  }
}