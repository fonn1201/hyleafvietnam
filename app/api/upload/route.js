import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Chỉ cho phép các định dạng ảnh phổ biến, map sang đúng phần mở rộng —
// không dùng tên file gốc người dùng gửi lên (tránh rủi ro phần mở rộng
// giả mạo, ví dụ ảnh.php.png hoặc tên file chứa ký tự lạ).
const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'Chưa chọn tệp ảnh nào' }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận ảnh định dạng JPG, PNG, WEBP hoặc GIF' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'Kích thước ảnh vượt quá giới hạn cho phép (tối đa 5MB)' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Tạo tên tệp độc nhất, đuôi tệp lấy từ MIME type đã kiểm tra ở trên
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `${uniqueSuffix}${extension}`;

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