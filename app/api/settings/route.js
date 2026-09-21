import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Tìm record setting mặc định (id = 1)
    let setting = await prisma.setting.findUnique({
      where: { id: 1 },
    });

    // Nếu chưa có, tự động tạo giá trị mặc định
    if (!setting) {
      setting = await prisma.setting.create({
        data: { id: 1 }
      });
    }

    return NextResponse.json(setting);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();

    const data = {
      siteName: body.siteName || '',
      hotline: body.hotline || '',
      zaloUrl: body.zaloUrl || '',
      fanpage: body.fanpage || '',
      address: body.address || '',
      aboutUs: body.aboutUs || '',
      isOnlineSales: Boolean(body.isOnlineSales),
      bankName: body.bankName || null,
      bankBin: body.bankBin || null,
      bankAccountNumber: body.bankAccountNumber || null,
      bankAccountHolder: body.bankAccountHolder || null,
      emailNotifyStatuses: body.emailNotifyStatuses || 'pending,confirmed,shipping,completed,cancelled',
    };

    // Dùng upsert: Cập nhật nếu đã có id=1, nếu chưa có thì tạo mới
    const updatedSetting = await prisma.setting.upsert({
      where: { id: 1 },
      update: data,
      create: { id: 1, ...data },
    });

    return NextResponse.json(updatedSetting);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}