import { cookies } from 'next/headers';
import AdminSidebar from '@/components/AdminSidebar';
import { verifyAdminToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export default async function AdminLayout({ children }) {
  // Thêm await vì cookies() trong Next.js mới là async
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const session = verifyAdminToken(token);

  // Quyền lấy trực tiếp từ JWT đã xác thực chữ ký — không còn tin theo cookie
  // rời rạc mà client có thể tự chỉnh sửa. Middleware đã chặn truy cập trái phép
  // từ trước, nên tới đây session luôn hợp lệ; mảng rỗng chỉ là phòng hờ.
  const permissions = session?.permissions ?? [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar permissions={permissions} />
      
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}