import BlogView from "@/features/blog/components/BlogView";
import { fetchBlogPosts } from "@/lib/fetchers";

export const metadata = {
  title: "News & Updates | UIUPC",
  description: "Stories, tutorials, and behind-the-scenes updates from the UIU Photography Club community.",
};

export default async function BlogPage() {
  const posts = await fetchBlogPosts();

  return <BlogView initialPosts={posts} />;
}
