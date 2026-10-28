// DATABASE GIẢ - chỉ dùng để thử quy trình build tĩnh khi không có database
// thật (npm run build:static -- --stub-db). Không dùng cho website thật.
const now = new Date('2026-10-01T00:00:00Z');
const empty = process.env.STUB_EMPTY === '1';

const categories = empty ? [] : [
  { id: 1, name: 'Thưởng thức', slug: 'thuong-thuc', description: 'Trà uống hằng ngày' },
  { id: 2, name: 'Pha chế', slug: 'pha-che', description: '' },
];

const products = empty ? [] : [
  { id: 1, code: '001', slug: 'tu-quy', name: 'Tứ Quý', price: '250000', description: '<p>Trà &amp; hương <strong>thơm</strong></p><p>Đoạn hai</p>', isVisible: true, image: null, isBestSeller: true, isGift: false, stock: 10, createdAt: now, categories: [categories[0]] },
  { id: 2, code: '002', slug: 'kim-tuyen', name: 'Kim Tuyên', price: '300000', description: '<h2>Giới thiệu</h2><ul><li>Ngọt hậu</li></ul>', isVisible: true, image: null, isBestSeller: false, isGift: true, stock: 5, createdAt: now, categories: [categories[0], categories[1]] },
  { id: 3, code: '003', slug: 'san-pham-an', name: 'Sản phẩm ẩn', price: '100000', description: '', isVisible: false, image: null, isBestSeller: true, isGift: true, stock: 1, createdAt: now, categories: [categories[1]] },
];

const news = empty ? [] : [
  { id: 1, slug: 'tin-1', title: 'Tin tức 1', summary: 'Tóm tắt 1', content: '<p>Nội dung <em>tin</em> 1</p>', image: null, source: '', published: true, createdAt: now },
  { id: 2, slug: 'tin-nhap', title: 'Tin nháp', summary: '', content: '<p>nháp</p>', image: null, source: '', published: false, createdAt: now },
];

const posts = empty ? [] : [
  { id: 1, slug: 'bai-1', title: 'Bài viết 1', excerpt: 'Tóm tắt bài 1', content: '<p>Nội dung bài 1</p>', image: null, published: true, createdAt: now },
];

const slides = empty ? [] : [
  { id: 1, title: 'Banner thử', image: '/placeholder.jpg', link: '/products', order: 0, active: true },
];

const setting = {
  id: 1, siteName: 'HYLEAF (dữ liệu thử)', hotline: '0900 000 000', zaloUrl: 'https://zalo.me/0900000000',
  fanpage: 'https://facebook.com/hyleaf', address: '', aboutUs: 'Giới thiệu thử nghiệm', isOnlineSales: true,
};

function matches(row, where = {}) {
  return Object.entries(where).every(([key, cond]) => {
    if (key === 'categories') {
      const slug = cond?.some?.slug;
      return (row.categories || []).some((c) => c.slug === slug);
    }
    return row[key] === cond;
  });
}

function model(rows) {
  const filter = (args = {}) => rows.filter((r) => matches(r, args.where));
  return {
    findMany: async (args) => filter(args),
    findFirst: async (args) => filter(args)[0] ?? null,
    findUnique: async (args) => filter(args)[0] ?? null,
    count: async (args) => filter(args).length,
  };
}

export const prisma = {
  category: model(categories),
  product: model(products),
  news: model(news),
  post: model(posts),
  slide: model(slides),
  // Giống bản thật: luôn ép "Mở bán online" = tắt cho bản tĩnh
  setting: { findUnique: async () => ({ ...setting, isOnlineSales: false }) },
};

export default prisma;
