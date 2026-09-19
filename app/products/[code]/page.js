import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

// Tìm sản phẩm theo slug trước, sau đó theo mã, cuối cùng theo id số
// (giữ đúng logic tra cứu đang dùng ở API /api/products/[id])
async function getProduct(identifier) {
  let product = await prisma.product.findFirst({
    where: { slug: identifier },
    include: { categories: true },
  });

  if (!product) {
    product = await prisma.product.findFirst({
      where: { code: identifier },
      include: { categories: true },
    });
  }

  if (!product) {
    const numericId = Number(identifier);
    if (!Number.isNaN(numericId)) {
      product = await prisma.product.findUnique({
        where: { id: numericId },
        include: { categories: true },
      });
    }
  }

  return product;
}

// Tiêu đề & mô tả trang tự động theo từng sản phẩm, tốt hơn cho SEO
export async function generateMetadata({ params }) {
  const { code } = await params;
  const product = await getProduct(code);

  if (!product) {
    return { title: "Không tìm thấy sản phẩm | Hyleaf" };
  }

  return {
    title: `${product.name} | Hyleaf Trà Oolong`,
    description: product.description || `Mua ${product.name} chính hãng tại Hyleaf.`,
  };
}

export default async function ProductDetailPage({ params }) {
  const { code } = await params;
  const product = await getProduct(code);

  if (!product) {
    notFound();
  }

  const settings = await prisma.setting.findUnique({ where: { id: 1 } });
  const hotline = settings?.hotline || "0900000000";
  const isOnlineSales = settings?.isOnlineSales ?? false;

  const cleanPhone = hotline.replace(/\D/g, "");
  const zaloMessage = encodeURIComponent(
    `Chào shop, tôi muốn hỏi mua sản phẩm: ${product.name} (Mã: ${product.code})`
  );
  const zaloLink = `https://zalo.me/${cleanPhone}?text=${zaloMessage}`;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-12">
      {/* Header đơn giản */}
      <header className="bg-white border-b py-4 px-6 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-sm font-bold text-blue-600">← Quay lại trang chủ</Link>
          <span className="text-sm font-mono font-bold bg-gray-100 px-3 py-1 rounded-full">Mã SP: {product.code}</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Ảnh SP */}
          <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden border">
            <Image
              src={product.image || "/placeholder.jpg"}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>

          {/* Thông tin SP */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {product.categories?.map((c) => (
                  <span key={c.id} className="bg-blue-50 text-blue-700 text-sm font-bold px-2.5 py-1 rounded-full">
                    {c.name}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">{product.name}</h1>

              <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6">
                <span className="text-sm text-red-500 block font-semibold mb-1">Giá bán:</span>
                <span className="text-2xl font-black text-red-600">
                  {formatPrice(product.price, isOnlineSales)}
                </span>
              </div>

              {/* Mô tả chi tiết sản phẩm */}
              <div className="mb-6">
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wider mb-2 border-b pb-1">Mô tả sản phẩm</h3>
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                  {product.description || "Chưa có thông tin mô tả chi tiết cho sản phẩm này."}
                </p>
              </div>
            </div>

            {/* Các nút tương tác */}
            <div className="space-y-3 pt-4 border-t">
              <a
                href={zaloLink}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-center block shadow-md transition"
              >
                💬 Nhắn Zalo Đặt Hàng Ngay
              </a>
              <a
                href={`tel:${hotline}`}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 rounded-xl text-center block transition text-sm"
              >
                📞 Gọi Hotline: {hotline}
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
