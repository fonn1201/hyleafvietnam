import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminSession";
import PostsManager from "@/components/admin/PostsManager";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { id: "desc" } });
  const session = await getAdminSession();

  return (
    <PostsManager
      initialPosts={posts}
      userPermissions={session?.permissions ?? []}
    />
  );
}
