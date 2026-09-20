import { prisma } from '@/lib/prisma';

// Đặt biến môi trường NEXT_PUBLIC_SITE_URL = domain thật khi deploy
// (VD: https://hyleaf.vn), thiếu biến này sitemap vẫn chạy nhưng URL sẽ
// trỏ về localhost, không dùng được cho Google Search Console thật.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default async function sitemap() {
  const [products, categories, news, posts] = await Promise.all([
    prisma.product.findMany({
      where: { isVisible: true },
      select: { slug: true, createdAt: true },
    }),
    prisma.category.findMany({ select: { slug: true } }),
    prisma.news.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true },
    }),
    prisma.post.findMany({
      where: { published: true },
      select: { slug: true, createdAt: true },
    }),
  ]);

  const staticRoutes = [
    { url: `${SITE_URL}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/news`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${SITE_URL}/posts`, changeFrequency: 'weekly', priority: 0.6 },
  ];

  const productRoutes = products.map((p) => ({
    url: `${SITE_URL}/products/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryRoutes = categories.map((c) => ({
    url: `${SITE_URL}/categories/${c.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const newsRoutes = news.map((n) => ({
    url: `${SITE_URL}/news/${n.slug}`,
    lastModified: n.createdAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  const postRoutes = posts.map((p) => ({
    url: `${SITE_URL}/posts/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...productRoutes, ...categoryRoutes, ...newsRoutes, ...postRoutes];
}
