import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import CustomersManager from "@/components/admin/CustomersManager";

export default async function AdminCustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      orders: { select: { id: true, totalAmount: true, status: true } },
    },
  });

  const initialCustomers = customers.map((c) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    address: c.address,
    createdAt: c.createdAt.toISOString(),
    orderCount: c.orders.length,
    totalSpent: c.orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + o.totalAmount, 0),
  }));

  const session = await getAdminSession();

  return (
    <CustomersManager
      initialCustomers={initialCustomers}
      userPermissions={session?.permissions ?? []}
    />
  );
}
