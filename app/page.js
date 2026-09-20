import { prisma } from "@/lib/prisma";
import HeroSlider from "@/components/HeroSlider";
import ProductBlock from "@/components/ProductBlock";
import Link from "next/link";

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

        {/* KHỐI SẢN PHẨM: dùng chung component ProductBlock để tránh lặp code
            và giữ đồng bộ nếu sau này cần chỉnh giao diện chung */}
        <ProductBlock
          title="Sản Phẩm Bán Chạy"
          subtitle="Những dòng trà được yêu thích và lựa chọn nhiều nhất"
          products={bestSellers}
          isOnlineSales={isOnlineSales}
          viewAllLink="/products?filter=bestseller"
        />

        <ProductBlock
          title="Giải Pháp & Quà Tặng"
          subtitle="Hộp quà biếu sang trọng và giải pháp trà chuyên biệt"
          products={giftProducts}
          isDarkBg
          isOnlineSales={isOnlineSales}
          viewAllLink="/products?filter=gift"
        />

      </div>
    </main>
  );
}
