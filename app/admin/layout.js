import { cookies } from 'next/headers';
import AdminSidebar from '@/components/AdminSidebar';

export default async function AdminLayout({ children }) {
  // Thêm await vì cookies() trong Next.js mới là async
  const cookieStore = await cookies();
  const permissionsCookie = cookieStore.get('admin_permissions')?.value || '';

  // Chuyển chuỗi 'categories, products, users, news' thành mảng ['categories', 'products', ...]
  const permissions = permissionsCookie 
    ? permissionsCookie.split(',').map((p) => p.trim())
    : ['products', 'categories', 'users', 'news'];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar permissions={permissions} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}