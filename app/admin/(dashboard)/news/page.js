import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import NewsManager from "@/components/admin/NewsManager";

export default async function AdminNewsPage() {
  const newsList = await prisma.news.findMany({
    orderBy: { createdAt: "desc" },
  });
  const session = await getAdminSession();

  return (
    <NewsManager
      initialNews={newsList}
      userPermissions={session?.permissions ?? []}
    />
  );
}
