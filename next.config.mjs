const isProd = process.env.NODE_ENV === 'production';

// Các header bảo mật cơ bản, áp dụng cho mọi trang.
// Lưu ý: CHƯA bật Content-Security-Policy kiểu giới hạn script/ảnh (script-src,
// img-src...) vì cấu hình đó dễ làm vỡ trang nếu sai và cần thử trên trình
// duyệt thật mới chắc chắn. Dưới đây chỉ dùng các directive CSP an toàn,
// không ảnh hưởng tới cách trang tải script/ảnh.
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  {
    key: 'Content-Security-Policy',
    value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
  },
  // HSTS: bắt trình duyệt luôn dùng HTTPS với tên miền này (180 ngày).
  // Chỉ gửi ở production; trình duyệt tự bỏ qua nếu truy cập qua HTTP.
  ...(isProd ? [{ key: 'Strict-Transport-Security', value: 'max-age=15552000' }] : []),
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Ẩn header "X-Powered-By: Next.js" (không để lộ công nghệ đang dùng)
  poweredByHeader: false,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
