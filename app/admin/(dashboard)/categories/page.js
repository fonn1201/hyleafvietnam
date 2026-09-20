import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import CategoriesManager from "@/components/admin/CategoriesManager";

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany();
  const session = await getAdminSession();

  return (
    <CategoriesManager
      initialCategories={categories}
      userPermissions={session?.permissions ?? []}
    />
  );
}
