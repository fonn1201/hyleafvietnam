import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import ProductsManager from "@/components/admin/ProductsManager";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { categories: true },
      orderBy: { id: "desc" },
    }),
    prisma.category.findMany(),
  ]);

  const cookieStore = await cookies();
  const session = verifyAdminToken(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  const userPermissions = session?.permissions ?? [];

  return (
    <ProductsManager
      initialProducts={products}
      initialCategories={categories}
      userPermissions={userPermissions}
    />
  );
}
