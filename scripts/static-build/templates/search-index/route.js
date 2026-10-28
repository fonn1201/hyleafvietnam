import { prisma } from '@/lib/prisma';

// Xuất ra file /search-index.json lúc build tĩnh (xem lib/searchClient.js bản tĩnh)
export const dynamic = 'force-static';

export async function GET() {
  const products = await prisma.product.findMany({ where: { isVisible: true } });
  return Response.json(
    products.map((p) => ({
      id: p.id,
      slug: p.slug,
      code: p.code,
      name: p.name,
      price: p.price,
      image: p.image,
    }))
  );
}
