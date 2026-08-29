import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function CategoryPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // Truy vấn danh mục theo slug và lấy các sản phẩm hiển thị
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isVisible: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const setting = await prisma.setting.findUnique({ where: { id: 1 } });
  const isOnlineSales = setting?.isOnlineSales ?? false;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#FAF8F5] min-h-screen">
      {/* Breadcrumb & Tiêu đề */}
      <div className="mb-6 border-b border-[#12412C]/10 pb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
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
          <p className="text-xs text-gray-600 mt-1 max-w-2xl">
            {category.description}
          </p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          Hiển thị {category.products.length} sản phẩm trong danh mục này
        </p>
      </div>

      {/* Danh sách sản phẩm */}
      {category.products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#12412C]/10 shadow-sm">
          <p className="text-gray-500 text-sm mb-4">Danh mục này hiện chưa có sản phẩm nào.</p>
          <Link href="/products" className="bg-[#12412C] text-[#FFFBF3] text-xs font-bold px-5 py-2.5 rounded-full inline-block">
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {category.products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-[#12412C]/10 p-4 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <img
                  src={product.image || "/placeholder.jpg"}
                  alt={product.name}
                  className="w-full h-44 object-cover rounded-xl mb-3"
                />
                <div className="flex flex-wrap gap-1 mb-1">
                  {product.isBestSeller && (
                    <span className="text-[9px] text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      Bán Chạy
                    </span>
                  )}
                  {product.isGift && (
                    <span className="text-[9px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                      Quà Biếu
                    </span>
                  )}
                </div>
                <h3 className="font-bold text-sm text-gray-800 line-clamp-2 mb-1">
                  {product.name}
                </h3>
                {product.description && (
                  <p className="text-[11px] text-gray-500 line-clamp-2">
                    {product.description}
                  </p>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-black text-[#12412C]">
                  {formatPrice(product.price, isOnlineSales)}
                </span>
                <Link
                  href={`/products/${product.slug}`}
                  className="bg-[#12412C] text-[#FFFBF3] text-xs font-bold px-3.5 py-1.5 rounded-full hover:bg-emerald-900 transition"
                >
                  Chi tiết
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}