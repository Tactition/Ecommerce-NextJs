import { getAllBlogPosts } from "@/lib/actions/blog";
import BlogManager from "@/components/dashboard/BlogManager";

export const dynamic = "force-dynamic";

export default async function BlogDashboardPage() {
  const posts = await getAllBlogPosts();

  return <BlogManager initialPosts={posts} />;
}

