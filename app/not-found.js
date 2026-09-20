import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5] px-4">
      <div className="max-w-md w-full text-center">
        <div className="text-7xl mb-4">🍃</div>
        <h1 className="text-4xl font-black text-[#12412C] mb-2">404</h1>
        <h2 className="text-xl font-bold text-[#12412C] mb-3">
          Trang bạn tìm không tồn tại
        </h2>
        <p className="text-sm text-gray-500 mb-8">
          Có thể đường dẫn đã bị thay đổi, sản phẩm không còn nữa, hoặc bạn đã gõ nhầm địa chỉ.
          Đừng lo, cùng quay lại thưởng trà nhé!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="bg-[#12412C] text-[#FFFBF3] font-bold text-sm px-6 py-3 rounded-full hover:bg-emerald-900 transition"
          >
            Về Trang Chủ
          </Link>
          <Link
            href="/products"
            className="bg-white text-[#12412C] font-bold text-sm px-6 py-3 rounded-full border border-[#12412C]/20 hover:bg-[#12412C]/5 transition"
          >
            Xem Sản Phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
