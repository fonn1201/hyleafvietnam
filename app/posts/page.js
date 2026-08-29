// app/posts/page.js
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function BlogPage() {
  // Lấy danh sách từ model Post, lọc theo published nếu muốn
  const blogList = await prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-black text-[#12412C] mb-6">GÓC THƯỞNG TRÀ & BLOG</h1>
      
      {blogList.length === 0 ? (
        <p className="text-gray-500">Chưa có bài viết nào.</p>
      ) : (
        <div className="space-y-4">
          {blogList.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-xl border shadow-sm">
              <h2 className="font-bold text-lg text-gray-800">{item.title}</h2>
              <p className="text-xs text-gray-500 mt-1">{item.excerpt}</p>
              <Link href={`/posts/${item.slug}`} className="text-xs font-bold text-blue-600 mt-3 inline-block">
                Xem chi tiết →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}