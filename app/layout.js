import './globals.css';
import NavbarFooterLayout from '@/components/NavbarFooterLayout';
import { CartProvider } from '@/components/CartProvider';

export const metadata = {
  title: 'Cửa hàng trực tuyến',
  description: 'Danh mục sản phẩm & Bài viết',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-800 antialiased">
        <CartProvider>
          <NavbarFooterLayout>{children}</NavbarFooterLayout>
        </CartProvider>
      </body>
    </html>
  );
}