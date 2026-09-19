import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const newsItem = await prisma.news.findUnique({ where: { slug } });
  if (!newsItem) return { title: "Không tìm thấy tin tức | Hyleaf" };
  return {
    title: `${newsItem.title} | Hyleaf`,
    description: newsItem.summary || undefined,
  };
}

export default async function NewsDetailPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  const newsItem = await prisma.news.findUnique({
    where: { slug: slug },
  });

  if (!newsItem || !newsItem.published) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#003B46] mb-4">{newsItem.title}</h1>
      <div className="flex items-center justify-between text-sm text-gray-400 mb-6 border-b pb-4">
        <span>Ngày đăng: {new Date(newsItem.createdAt).toLocaleDateString('vi-VN')}</span>
        {newsItem.source && <span>Nguồn: {newsItem.source}</span>}
      </div>

      {newsItem.image && (
        <div className="relative w-full h-72 md:h-96 rounded-xl mb-6 overflow-hidden shadow-sm bg-gray-100">
          <Image src={newsItem.image} alt={newsItem.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}

      {newsItem.summary && (
        <div className="text-base font-semibold text-gray-700 bg-gray-50 p-4 rounded-xl mb-6 border-l-4 border-[#003B46]">
          {newsItem.summary}
        </div>
      )}

      {/* Nội dung được làm sạch (sanitize) trước khi render để chống XSS lưu trữ,
          vì đây là HTML do admin nhập qua rich text editor nhưng hiển thị công khai */}
      <div
        className="prose max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(newsItem.content) }}
      />
    </div>
  );
}
