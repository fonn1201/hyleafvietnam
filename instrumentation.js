// Next.js gọi hàm register() 1 lần khi server khởi động. Dùng để kiểm tra
// cấu hình bắt buộc: thiếu/yếu JWT_SECRET ở production thì server từ chối
// khởi động thay vì chạy với cấu hình không an toàn.
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  if (process.env.NODE_ENV !== 'production') return;
  // Bỏ qua khi đang chạy `next build` (lúc build không nhất thiết có đủ biến môi trường)
  if (process.env.NEXT_PHASE === 'phase-production-build') return;

  const { assertJwtSecretConfigured } = await import('./lib/auth');
  assertJwtSecretConfigured();

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn(
      'CẢNH BÁO: chưa đặt NEXT_PUBLIC_SITE_URL - sitemap.xml/robots.txt sẽ trỏ về localhost thay vì tên miền thật.'
    );
  }
}
