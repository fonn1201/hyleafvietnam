import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { stripHtml } from '@/lib/utils';
import StaticProductGrid from '@/components/StaticProductGrid';

// BẢN DÙNG CHO BUILD TĨNH (chép đè lên app/categories/[slug]/page.js).
export const dynamicParams = false;

export async function generateStaticParams() {
  const rows = await prisma.category.findMany({ select: { slug: true } });
  const params = rows.filter((r) => r.slug).map((r) => ({ slug: r.slug }));
  // Bản xuất tĩnh bắt buộc phải có ít nhất 1 đường dẫn; nếu chưa có danh
  // mục nào thì tạo 1 đường dẫn giữ chỗ (trang này sẽ trả về 404).
  return params.length ? params : [{ slug: '__empty__' }];
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    notFound();
  }

  const rows = await prisma.product.findMany({
    where: { isVisible: true, categories: { some: { slug } } },
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
      <StaticProductGrid
        products={products}
        mode="category"
        category={{ name: category.name, description: category.description || '' }}
      />
    </div>
  );
}
