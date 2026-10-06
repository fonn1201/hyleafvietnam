import './globals.css';
import NavbarFooterLayout from '@/components/NavbarFooterLayout';
import { CartProvider } from '@/components/CartProvider';
import { prisma } from '@/lib/prisma';

export const metadata = {
  title: 'Cửa hàng trực tuyến',
  description: 'Danh mục sản phẩm & Bài viết',
};

export default async function RootLayout({ children }) {
  // Lấy thông tin shop (tên, hotline, địa chỉ, Zalo, Fanpage, mở bán
  // online...) và danh mục ngay tại server, truyền xuống Header/Footer
  // qua props -> không còn phải fetch phía client, không còn hiện tạm
  // dữ liệu giả (vd "MY BRAND", "0900000000") trong lúc chờ tải.
  const [settings, categories] = await Promise.all([
    prisma.setting.findUnique({ where: { id: 1 } }),
    prisma.category.findMany(),
  ]);

  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-800 antialiased">
        <CartProvider>
          <NavbarFooterLayout settings={settings} categories={categories}>
            {children}
          </NavbarFooterLayout>
        </CartProvider>
      </body>
    </html>
  );
}