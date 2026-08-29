import './globals.css';
import NavbarFooterLayout from '@/components/NavbarFooterLayout';

export const metadata = {
  title: 'Cửa hàng trực tuyến',
  description: 'Danh mục sản phẩm & Bài viết',
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body className="bg-gray-50 text-gray-800 antialiased">
        <NavbarFooterLayout>{children}</NavbarFooterLayout>
      </body>
    </html>
  );
}