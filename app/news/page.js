import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

export default async function NewsPage() {
  // Sửa từ prisma.post thành prisma.news
  const newsList = await prisma.news.findMany({
    where: { published: true }, // Lọc các bài đã được phép hiển thị
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#003B46] mb-6 uppercase">Tin Tức & Sự Kiện</h1>
      
      <div className="grid gap-6">
        {newsList.length === 0 ? (
          <p className="text-gray-400">Chưa có tin tức nào.</p>
        ) : (
          newsList.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
              {item.image && (
                <div className="relative w-32 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                  <Image src={item.image} alt={item.title} fill sizes="128px" className="object-cover" />
                </div>
              )}
              <div className="flex-1">
                <span className="text-sm text-gray-400">Ngày đăng: {new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                <h2 className="text-lg font-bold text-gray-800 hover:text-[#003B46] mb-1">
                  <Link href={`/news/${item.slug}`}>{item.title}</Link>
                </h2>
                <p className="text-sm text-gray-600 line-clamp-2">{item.summary}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}