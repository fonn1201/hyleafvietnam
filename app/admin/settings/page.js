import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import SettingsManager from "@/components/admin/SettingsManager";

export default async function AdminSettingsPage() {
  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  const session = await getAdminSession();

  return (
    <SettingsManager
      initialSettings={{
        siteName: setting?.siteName || '',
        hotline: setting?.hotline || '',
        zaloUrl: setting?.zaloUrl || '',
        fanpage: setting?.fanpage || '',
        address: setting?.address || '',
        aboutUs: setting?.aboutUs || '',
        isOnlineSales: !!setting?.isOnlineSales,
      }}
      userPermissions={session?.permissions ?? []}
    />
  );
}
