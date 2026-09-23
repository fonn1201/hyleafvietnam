import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import OrdersManager from "@/components/admin/OrdersManager";

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });
  const session = await getAdminSession();

  return (
    <OrdersManager
      initialOrders={JSON.parse(JSON.stringify(orders))}
      userPermissions={session?.permissions ?? []}
    />
  );
}
