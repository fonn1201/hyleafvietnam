import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { notFound } from "next/navigation";
import Pagination from "@/components/Pagination";
import AddToCartButton from "@/components/AddToCartButton";

const PAGE_SIZE = 12;

export default async function CategoryPage({ params, searchParams }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(1, parseInt(resolvedSearchParams?.page, 10) || 1);

  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) {
    notFound();
  }

  const productWhere = {
    isVisible: true,
    categories: { some: { slug } },
  };

  // Phân trang ngay ở tầng database (skip/take) thay vì tải hết sản phẩm
  // trong danh mục rồi mới cắt ở JS — nhẹ hơn khi danh mục có nhiều sản phẩm
  const [totalCount, setting] = await Promise.all([
    prisma.product.count({ where: productWhere }),
    prisma.setting.findUnique({ where: { id: 1 } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);

  const products = await prisma.product.findMany({
    where: productWhere,
    orderBy: { createdAt: "desc" },
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const isOnlineSales = setting?.isOnlineSales ?? false;

  const buildHref = (page) => {
    return page > 1 ? `/categories/${slug}?page=${page}` : `/categories/${slug}`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#FAF8F5] min-h-screen">
      {/* Breadcrumb & Tiêu đề */}
      <div className="mb-6 border-b border-[#12412C]/10 pb-4">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
          <Link href="/" className="hover:underline">Trang chủ</Link>
          <span>/</span>
          <Link href="/products" className="hover:underline">Sản phẩm</Link>
          <span>/</span>
          <span className="text-[#12412C] font-bold">{category.name}</span>
        </div>
        <h1 className="text-2xl font-black text-[#12412C] uppercase">
          {category.name}
        </h1>
        {category.description && (
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            {category.description}
          </p>
        )}
        <p className="text-sm text-gray-400 mt-2">
          Hiển thị {totalCount} sản phẩm trong danh mục này
        </p>
      </div>

      {/* Danh sách sản phẩm */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#12412C]/10 shadow-sm">
          <p className="text-gray-500 text-base mb-4">Danh mục này hiện chưa có sản phẩm nào.</p>
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
                    {isOnlineSales && (
                      <AddToCartButton product={product} className="flex-1 text-sm font-bold px-3 py-1.5 rounded-full bg-white text-[#12412C] border border-[#12412C]/20 hover:bg-[#12412C]/5 transition text-center" />
                    )}
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
