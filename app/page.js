import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";

export default async function HomePage() {
  // 1. Lấy tất cả danh mục trà từ Database
  const categories = await prisma.category.findMany();

  // 2. Lấy danh sách sản phẩm đang bật trạng thái Hiển Thị
  const products = await prisma.product.findMany({
    where: { isVisible: true },
    orderBy: { createdAt: "desc" },
  });

  // 3. Lấy cấu hình website (để kiểm tra trạng thái Mở bán online)
  const setting = await prisma.setting.findUnique({
    where: { id: 1 },
  });
  const isOnlineSales = setting?.isOnlineSales ?? false;

  // 4. Lấy banner slide ngay tại server, tránh phải fetch lại phía client
  //    (giúp banner hiện ngay lần tải đầu, không bị "nháy" trắng)
  const slides = await prisma.slide.findMany({
    where: { active: true },
    orderBy: { order: "asc" },
  });

  // 5. LỌC SẢN PHẨM THEO CỜ TÍCH TỪ ADMIN:
  const bestSellers = products.filter((p) => p.isBestSeller);
  const giftProducts = products.filter((p) => p.isGift);

  return (
    <main className="min-h-screen bg-[#FAF8F5]">
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* KHỐI HERO BANNER */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Cột 1: Danh Mục Trà */}
          <div className="md:col-span-1 hidden md:block bg-white rounded-2xl p-5 border border-[#12412C]/10 shadow-sm h-full">
            <h2 className="font-black text-[#12412C] uppercase text-sm tracking-wider mb-4 pb-2 border-b border-[#12412C]/10 flex items-center gap-2">
              📋 DANH MỤC TRÀ
            </h2>
            <ul className="space-y-3 font-semibold text-sm">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link 
                    href={`/categories/${cat.slug}`}
                    className="block text-gray-700 hover:text-[#12412C] hover:font-bold transition"
                  >
                    • {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 2-4: Banner Slider */}
          <div className="md:col-span-3">
            <HeroSlider slides={slides} />
          </div>
        </div>

        {/* KHỐI 4 GIÁ TRỊ CAM KẾT */}
        <div className="bg-white rounded-2xl p-5 border border-[#12412C]/10 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-2 border-r border-[#12412C]/5 last:border-0">
            <div className="text-2xl mb-1">🌱</div>
            <h3 className="font-bold text-sm text-[#12412C]">100% Nguyên Chất</h3>
            <p className="text-xs text-gray-500">Trà Oolong Bảo Lộc chính gốc</p>
          </div>
          <div className="p-2 border-r border-[#12412C]/5 last:border-0">
            <div className="text-2xl mb-1">🚀</div>
            <h3 className="font-bold text-sm text-[#12412C]">Giao Hàng Nhanh</h3>
            <p className="text-xs text-gray-500">Đóng gói chuẩn bảo quản hương vị</p>
          </div>
          <div className="p-2 border-r border-[#12412C]/5 last:border-0">
            <div className="text-2xl mb-1">🎁</div>
            <h3 className="font-bold text-sm text-[#12412C]">Quà Tặng Sang Trọng</h3>
            <p className="text-xs text-gray-500">Thiết kế hộp quà biếu cao cấp</p>
          </div>
          <div className="p-2">
            <div className="text-2xl mb-1">💬</div>
            <h3 className="font-bold text-sm text-[#12412C]">Tư Vấn Thưởng Trà</h3>
            <p className="text-xs text-gray-500">Hỗ trợ công thức pha chế tận tình</p>
          </div>
        </div>

        {/* KHỐI 1: SẢN PHẨM BÁN CHẠY */}
        {bestSellers.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-end border-b border-[#12412C]/10 pb-2">
              <div>
                <h2 className="text-xl font-black text-[#12412C] uppercase tracking-wide">SẢN PHẨM BÁN CHẠY</h2>
                <p className="text-sm text-gray-500">Những dòng trà được yêu thích và lựa chọn nhiều nhất</p>
              </div>
              <Link href="/products" className="text-sm font-bold text-[#12412C] hover:underline">
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {bestSellers.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-[#12412C]/10 p-3 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-gray-100">
                      <Image
                        src={product.image || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-full mb-1 inline-block">Bán Chạy</span>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-[#12412C]">
                      {formatPrice(product.price, isOnlineSales)}
                    </span>
                    <Link href={`/products/${product.slug}`} className="bg-[#12412C] text-[#FFFBF3] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-emerald-900 transition">
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* KHỐI 2: GIẢI PHÁP & QUÀ TẶNG */}
        {giftProducts.length > 0 && (
          <section className="space-y-4">
            <div className="flex justify-between items-end border-b border-[#12412C]/10 pb-2">
              <div>
                <h2 className="text-xl font-black text-[#12412C] uppercase tracking-wide">GIẢI PHÁP & QUÀ TẶNG</h2>
                <p className="text-sm text-gray-500">Hộp quà biếu sang trọng và giải pháp trà chuyên biệt</p>
              </div>
              <Link href="/products" className="text-sm font-bold text-[#12412C] hover:underline">
                Xem tất cả →
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {giftProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl border border-[#12412C]/10 p-3 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                  <div>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-gray-100">
                      <Image
                        src={product.image || "/placeholder.jpg"}
                        alt={product.name}
                        fill
                        sizes="(min-width: 768px) 25vw, 50vw"
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full mb-1 inline-block">Quà Biếu</span>
                    <h3 className="font-bold text-sm text-gray-800 line-clamp-2">{product.name}</h3>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm font-black text-[#12412C]">
                      {formatPrice(product.price, isOnlineSales)}
                    </span>
                    <Link href={`/products/${product.slug}`} className="bg-[#12412C] text-[#FFFBF3] text-xs font-bold px-3 py-1.5 rounded-full hover:bg-emerald-900 transition">
                      Chi tiết
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </main>
  );
}
