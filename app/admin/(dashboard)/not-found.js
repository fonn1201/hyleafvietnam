import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
      <div className="text-5xl mb-4">🔍</div>
      <h1 className="text-2xl font-bold text-[#003B46] mb-2">Không tìm thấy trang quản trị này</h1>
      <p className="text-sm text-gray-500 mb-6">
        Đường dẫn không tồn tại hoặc chức năng này chưa được xây dựng.
      </p>
      <Link
        href="/admin"
        className="bg-[#003B46] text-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-opacity-90 transition inline-block"
      >
        Về Trang Tổng Quan
      </Link>
    </div>
  );
}
