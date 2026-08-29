import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn tệp ảnh nào' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên tệp độc nhất tránh trùng lặp tệp cũ
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.png';
    const filename = `${uniqueSuffix}-${originalName}`;

    // Tạo thư mục public/uploads nếu chưa tồn tại
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Lưu tệp vào thư mục public/uploads
    const filePath = path.join(uploadDir, filename);
    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${filename}`;
    return NextResponse.json({ url: fileUrl });
  } catch (error) {
    console.error('Lỗi khi tải ảnh lên:', error);
    return NextResponse.json({ error: 'Lỗi server khi lưu tệp ảnh' }, { status: 500 });
  }
}