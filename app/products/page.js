import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import Pagination from "@/components/Pagination";
import AddToCartButton from "@/components/AddToCartButton";

const PAGE_SIZE = 12;

const FILTER_CONFIG = {
  bestseller: { where: { isBestSeller: true }, title: "SẢN PHẨM BÁN CHẠY" },
  gift: { where: { isGift: true }, title: "GIẢI PHÁP & QUÀ TẶNG" },
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";
  const filter = FILTER_CONFIG[params?.filter] ? params.filter : "";
  const currentPage = Math.max(1, parseInt(params?.page, 10) || 1);

  // Hàm hỗ trợ bỏ dấu tiếng Việt
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  // Lọc theo "Bán chạy" / "Quà tặng" (tick từ trang admin) ngay ở tầng DB
  // khi có, ví dụ khi khách bấm "Xem tất cả" từ khối tương ứng ở trang chủ
  const where = {
    isVisible: true,
    ...(filter ? FILTER_CONFIG[filter].where : {}),
  };

  // Fetch song song danh sách sản phẩm hiển thị và cài đặt
  const [allProducts, setting] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
    }),
    prisma.setting.findUnique({ where: { id: 1 } })
  ]);

  // Lọc sản phẩm hỗ trợ tìm kiếm không dấu và theo mã sản phẩm
  const term = search.trim();
  const normalizedQuery = removeAccents(term).toLowerCase();

  const filteredProducts = allProducts.filter((p) => {
    if (!term) return true;
    const matchName = p.name && removeAccents(p.name).toLowerCase().includes(normalizedQuery);
    const matchCode = p.code && p.code.toLowerCase().includes(term.toLowerCase());
    return matchName || matchCode;
  });

  const isOnlineSales = setting?.isOnlineSales ?? false;

  // Phân trang: mỗi trang PAGE_SIZE sản phẩm, tránh render hàng trăm thẻ
  // sản phẩm cùng lúc khi catalog lớn dần
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const products = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const buildHref = (page) => {
    const qs = new URLSearchParams();
    if (search) qs.set("search", search);
    if (filter) qs.set("filter", filter);
    if (page > 1) qs.set("page", String(page));
    const queryString = qs.toString();
    return queryString ? `/products?${queryString}` : "/products";
  };

  const pageTitle = search
    ? `KẾT QUẢ TÌM KIẾM: "${search}"`
    : filter
    ? FILTER_CONFIG[filter].title
    : "DANH SÁCH TẤT CẢ SẢN PHẨM";

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#FAF8F5] min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b border-[#12412C]/10 pb-4">
        <div>
          {/* Breadcrumb nhỏ khi đang lọc, để khách biết cách quay lại xem tất cả */}
          {filter && !search && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
              <Link href="/" className="hover:underline">Trang chủ</Link>
              <span>/</span>
              <Link href="/products" className="hover:underline">Tất cả sản phẩm</Link>
              <span>/</span>
              <span className="text-[#12412C] font-bold">{FILTER_CONFIG[filter].title}</span>
            </div>
          )}
          <h1 className="text-2xl font-black text-[#12412C] uppercase">
            {pageTitle}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Tìm thấy {filteredProducts.length} sản phẩm phù hợp
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#12412C]/10 shadow-sm">
          <p className="text-gray-500 text-base mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
          <Link href="/products" className="bg-[#12412C] text-[#FFFBF3] text-sm font-bold px-5 py-2.5 rounded-full inline-block">
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-[#12412C]/10 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="relative w-full h-44 rounded-xl overflow-hidden mb-3 bg-gray-100">
                    <Image
                      src={product.image || "/placeholder.jpg"}
                      alt={product.name}
                      fill
                      sizes="(min-width: 768px) 25vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1">
                    {product.isBestSeller && (
                      <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                        Bán Chạy
                      </span>
                    )}
                    {product.isGift && (
                      <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        Quà Biếu
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-base text-gray-800 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 space-y-2">
                  <span className="text-base font-black text-[#12412C] block">
                    {formatPrice(product.price, isOnlineSales)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <AddToCartButton product={product} className="flex-1 text-sm font-bold px-3 py-1.5 rounded-full bg-white text-[#12412C] border border-[#12412C]/20 hover:bg-[#12412C]/5 transition text-center" />
                    <Link
                      href={`/products/${product.slug}`}
                      className="flex-1 bg-[#12412C] text-[#FFFBF3] text-sm font-bold px-3 py-1.5 rounded-full hover:bg-emerald-900 transition text-center"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination currentPage={safePage} totalPages={totalPages} buildHref={buildHref} />
        </>
      )}
    </div>
  );
}
