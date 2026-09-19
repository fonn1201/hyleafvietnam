import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import SlidesManager from "@/components/admin/SlidesManager";

export default async function AdminSlidesPage() {
  const slides = await prisma.slide.findMany({
    orderBy: { order: "asc" },
  });
  const session = await getAdminSession();

  return (
    <SlidesManager
      initialSlides={slides}
      userPermissions={session?.permissions ?? []}
    />
  );
}
