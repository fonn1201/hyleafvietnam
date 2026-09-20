import { prisma } from "@/lib/prisma";
import { parsePermissions } from "@/lib/utils";
import UsersManager from "@/components/admin/UsersManager";

// Lấy danh sách tài khoản ngay tại server -> mở trang là thấy dữ liệu luôn,
// không còn phải chờ "Đang tải dữ liệu..." rồi mới fetch phía client.
export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      permissions: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const initialUsers = users.map((user) => ({
    ...user,
    permissions: parsePermissions(user.permissions),
    // Date object không truyền thẳng được qua Server -> Client Component,
    // chuyển sang chuỗi ISO để tránh lỗi serialize.
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
  }));

  return <UsersManager initialUsers={initialUsers} />;
}
