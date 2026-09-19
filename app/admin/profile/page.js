import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import ProfileManager from "@/components/admin/ProfileManager";

export default async function AdminProfilePage() {
  const session = await getAdminSession();
  const user = session
    ? await prisma.user.findUnique({ where: { id: session.id } })
    : null;

  return (
    <ProfileManager
      initialProfile={{
        name: user?.name || '',
        email: user?.email || '',
      }}
    />
  );
}
