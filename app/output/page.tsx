import { SiteLayout } from "@/components/layout/site-layout"
import { PostCard } from "@/components/layout/post-card"
import { getAllPosts, type PostMeta } from "@/lib/markdown"

export const metadata = {
  title: "Output - Thought Merchants",
  description: "Design essays, case studies, and thoughts on the industry.",
}

export default function OutputPage() {
  // Fetch all blog posts
  const posts = getAllPosts(['title', 'date', 'slug', 'author', 'summary', 'tags', 'thumbnail']) as PostMeta[]

  return (
    <SiteLayout>
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-4">Output</h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          Design is never the finished product. It's thousands of little decisions
          made consciously and subconsciously, cued by the world around us. Here
          we share our design, identify our approach, comment on the industry, and
          highlight thought-provoking ephemeral that requires our opinion.
        </p>
      </div>

      {posts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No posts found.</p>
        </div>
      )}
    </SiteLayout>
  )
}
