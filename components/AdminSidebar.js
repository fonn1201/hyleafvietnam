'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { href: '/admin', label: '📦 Quản Lý Sản Phẩm' },
    { href: '/admin/slides', label: '🖼️ Quản Lý Slide Banner' },
    { href: '/admin/categories', label: '🏷️ Quản Lý Danh Mục' },
    { href: '/admin/posts', label: '✍️ Quản Lý Bài Viết (Blog)' },
    { href: '/admin/news', label: '📰 Quản Lý Tin Tức' },
    { href: '/admin/settings', label: '⚙️ Cấu Hình Thông Tin' },
  ];

  return (
    <aside className="w-64 bg-[#0B192C] text-white p-4 space-y-2 flex-shrink-0 min-h-screen">
      <h2 className="text-lg font-black text-blue-400 mb-6 px-3">Admin Dashboard</h2>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 p-3 text-xs font-bold rounded-xl transition ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="pt-10">
        <Link href="/" className="flex items-center gap-2 p-3 text-xs text-gray-400 hover:text-white transition">
          ← Xem Trang Chủ
        </Link>
      </div>
    </aside>
  );
}