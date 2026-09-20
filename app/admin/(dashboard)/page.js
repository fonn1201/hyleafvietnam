import { prisma } from "@/lib/prisma";

// Trang tổng quan chỉ cần vài con số thống kê -> dùng count() nhẹ, lấy
// trực tiếp ở server thay vì client tự fetch nguyên danh sách sản phẩm/
// danh mục (kèm cả quan hệ) chỉ để đếm .length, vừa chậm vừa lãng phí.
export default async function AdminDashboard() {
  const [productCount, categoryCount, newsCount, postCount] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.news.count(),
    prisma.post.count(),
  ]);

  const stats = [
    { label: "Tổng số sản phẩm", value: productCount, icon: "📦", color: "blue" },
    { label: "Tổng số danh mục", value: categoryCount, icon: "📁", color: "emerald" },
    { label: "Tin tức đã đăng", value: newsCount, icon: "📰", color: "amber" },
    { label: "Bài viết đã đăng", value: postCount, icon: "✍️", color: "purple" },
  ];

  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-[#003B46] uppercase mb-2">Trang Tổng Quan Quản Trị</h1>
        <p className="text-sm text-gray-600">
          Chào mừng bạn quay trở lại hệ thống quản lý. Vui lòng chọn các chức năng ở thanh menu bên trái để bắt đầu làm việc.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((item) => (
          <div key={item.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-gray-400 uppercase">{item.label}</p>
              <h2 className="text-3xl font-extrabold text-[#003B46] mt-1">{item.value}</h2>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${colorClasses[item.color]}`}>
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-400 uppercase">Trạng thái hệ thống</p>
          <h2 className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Hoạt động ổn định
          </h2>
        </div>
        <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center text-xl font-bold">
          ⚡
        </div>
      </div>
    </div>
  );
}
