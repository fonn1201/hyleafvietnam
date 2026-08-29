import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const search = params?.search || "";

  // Hàm hỗ trợ bỏ dấu tiếng Việt
  const removeAccents = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  // Fetch song song danh sách sản phẩm hiển thị và cài đặt
  const [allProducts, setting] = await Promise.all([
    prisma.product.findMany({
      where: { isVisible: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.setting.findUnique({ where: { id: 1 } })
  ]);

  // Lọc sản phẩm hỗ trợ tìm kiếm không dấu và theo mã sản phẩm
  const term = search.trim();
  const normalizedQuery = removeAccents(term).toLowerCase();

  const products = allProducts.filter((p) => {
    if (!term) return true;
    const matchName = p.name && removeAccents(p.name).toLowerCase().includes(normalizedQuery);
    const matchCode = p.code && p.code.toLowerCase().includes(term.toLowerCase());
    return matchName || matchCode;
  });

  const isOnlineSales = setting?.isOnlineSales ?? false;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 bg-[#FAF8F5] min-h-screen">
      <div className="flex justify-between items-center mb-6 border-b border-[#12412C]/10 pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#12412C] uppercase">
            {search ? `KẾT QUẢ TÌM KIẾM: "${search}"` : "DANH SÁCH TẤT CẢ SẢN PHẨM"}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Tìm thấy {products.length} sản phẩm phù hợp
          </p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#12412C]/10 shadow-sm">
          <p className="text-gray-500 text-sm mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
          <Link href="/products" className="bg-[#12412C] text-[#FFFBF3] text-xs font-bold px-5 py-2.5 rounded-full inline-block">
            Xem Tất Cả Sản Phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {products.map((product) => (
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