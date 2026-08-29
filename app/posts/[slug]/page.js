import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

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
      <p className="text-xs text-gray-400 mb-6">Ngày đăng: {new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
      
      {post.image && (
        <img src={post.image} alt={post.title} className="w-full h-auto rounded-xl mb-6 object-cover" />
      )}

      <div className="prose max-w-none text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
    </div>
  );
}