'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  { id: 'products', href: '/admin/products', label: '📦 Quản Lý Sản Phẩm' },
  { id: 'slides', href: '/admin/slides', label: '🖼️ Quản Lý Slide Banner' },
  { id: 'categories', href: '/admin/categories', label: '🏷️ Quản Lý Danh Mục' },
  { id: 'posts', href: '/admin/posts', label: '✍️ Quản Lý Bài Viết (Blog)' },
  { id: 'news', href: '/admin/news', label: '📰 Quản Lý Tin Tức' },
  { id: 'settings', href: '/admin/settings', label: '⚙️ Cấu Hình Thông Tin' },
  { id: 'users', href: '/admin/users', label: '👥 Quản Lý Admins' },
];

export default function AdminSidebar({ permissions = [] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [userProfile, setUserProfile] = useState({ name: 'Admin', email: '' });

  useEffect(() => {
    // Lấy thông tin profile hiện tại để hiển thị tên và avatar chữ cái đầu
    fetch('/api/admin/profile')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUserProfile(data.user);
        }
      })
      .catch(err => console.error('Lỗi tải profile:', err));
  }, []);

  const filteredMenu = menuItems.filter((item) => {
    if (!permissions || permissions.length === 0) return false;
    if (permissions.includes('all')) return true;
    return permissions.includes(item.id);
  });

  const handleLogout = async () => {
    if (!confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?')) return;
    try {
      const res = await fetch('/api/admin/logout', { method: 'POST' });
      if (res.ok) {
        router.push('/admin/login');
        router.refresh();
      } else {
        alert('Đăng xuất thất bại, vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối mạng!');
    }
  };

  const getInitial = (name) => {
    if (!name) return 'A';
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className="w-64 bg-[#0B192C] text-white p-4 flex flex-col justify-between flex-shrink-0 min-h-screen">
      <div>
        <Link href="/admin" className="block mb-6">
          <h2 className="text-lg font-black text-blue-400 px-3 hover:text-blue-300 transition-colors cursor-pointer">
            Admin Dashboard
          </h2>
        </Link>
        <nav className="space-y-1">
          {filteredMenu.map((item) => {
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
      </div>

      <div className="space-y-3 pt-4 border-t border-gray-800">
        {/* Profile Card & Link to Profile Page */}
        <Link 
          href="/admin/profile" 
          className={`flex items-center gap-3 p-2.5 rounded-xl transition bg-white/5 hover:bg-white/10 border ${
            pathname === '/admin/profile' ? 'border-blue-500' : 'border-transparent'
          }`}
        >
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm flex-shrink-0 shadow-inner">
            {getInitial(userProfile.name)}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">{userProfile.name || 'Quản Trị Viên'}</p>
            <p className="text-[10px] text-gray-400 truncate">{userProfile.email || 'admin@gmail.com'}</p>
          </div>
        </Link>

        <Link href="/" className="flex items-center gap-2 px-3 py-2 text-xs text-gray-400 hover:text-white transition rounded-xl hover:bg-white/5">
          ← Xem Trang Chủ
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition rounded-xl text-left"
        >
          🚪 Đăng Xuất Hệ Thống
        </button>
      </div>
    </aside>
  );
}