const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Không cho công cụ tìm kiếm index khu vực quản trị và API nội bộ
      disallow: ['/admin', '/api'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
