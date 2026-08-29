import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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
      <div className="flex items-center justify-between text-xs text-gray-400 mb-6 border-b pb-4">
        <span>Ngày đăng: {new Date(newsItem.createdAt).toLocaleDateString('vi-VN')}</span>
        {newsItem.source && <span>Nguồn: {newsItem.source}</span>}
      </div>
      
      {newsItem.image && (
        <img src={newsItem.image} alt={newsItem.title} className="w-full h-auto rounded-xl mb-6 object-cover shadow-sm" />
      )}

      {newsItem.summary && (
        <div className="text-base font-semibold text-gray-700 bg-gray-50 p-4 rounded-xl mb-6 border-l-4 border-[#003B46]">
          {newsItem.summary}
        </div>
      )}

      <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: newsItem.content }} />
    </div>
  );
}