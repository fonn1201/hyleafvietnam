import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { sanitizeHtml } from "@/lib/sanitize";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return { title: "Không tìm thấy bài viết | Hyleaf" };
  return { title: `${post.title} | Hyleaf` };
}

export default async function PostDetailPage({ params }) {
  const resolvedParams = await params;

  // Sửa từ .id thành .slug vì thư mục của bạn tên là [slug]
  const slug = resolvedParams.slug;

  const post = await prisma.post.findUnique({
    where: { slug: slug },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-black text-[#12412C] mb-4">{post.title}</h1>
      <p className="text-sm text-gray-400 mb-6">Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>

      {post.image && (
        <div className="relative w-full h-72 md:h-96 rounded-xl mb-6 overflow-hidden bg-gray-100">
          <Image src={post.image} alt={post.title} fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" />
        </div>
      )}

      {/* Nội dung được làm sạch (sanitize) trước khi render để chống XSS lưu trữ */}
      <div
        className="prose max-w-none text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeHtml(post.content) }}
      />
    </div>
  );
}
