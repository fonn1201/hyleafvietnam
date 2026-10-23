import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { stripHtml } from '@/lib/utils';
import StaticProductGrid from '@/components/StaticProductGrid';

// BẢN DÙNG CHO BUILD TĨNH (chép đè lên app/products/page.js). Lấy toàn bộ
// sản phẩm đang hiển thị lúc build, việc tìm kiếm/lọc/phân trang làm ở
// trình duyệt (xem components/StaticProductGrid.js).
export default async function ProductsPage() {
  const rows = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: 'desc' },
  });

  const products = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    code: p.code,
    name: p.name,
    price: p.price,
    image: p.image,
    description: stripHtml(p.description),
    isBestSeller: !!p.isBestSeller,
    isGift: !!p.isGift,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#FAF8F5] min-h-screen">
      <Suspense fallback={<p className="text-gray-400">Đang tải...</p>}>
        <StaticProductGrid products={products} mode="products" />
      </Suspense>
    </div>
  );
}
