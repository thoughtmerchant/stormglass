import Link from "next/link"
import { getAllPosts } from "@/lib/markdown"

export default function OutputIndexPage() {
  // Get all posts with the necessary fields
  const posts = getAllPosts(["title", "date", "slug", "author", "summary", "tags", "thumbnail"]) || []

  return (
    <div className="max-w-4xl mx-auto p-8 md:p-12">
      <div className="mb-12">
        <h1 className="text-3xl font-normal text-slate-800 mb-4">Ocean. Data. Analysis.</h1>
        <p className="text-slate-600">Research findings and insights about Santa Monica Bay conditions.</p>
      </div>

      {posts.length > 0 ? (
        <div className="space-y-12">
          {posts.map((post) => {
            // Process tags to handle different formats
            const tags = processTags(post.tags)

            return (
              <article key={post.slug} className="border-b border-slate-200 pb-12 last:border-0">
                <Link href={`/output/${post.slug}`} className="group">
                  <div className="mb-2 text-sm text-slate-500">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <h2 className="text-xl md:text-2xl font-medium text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-slate-600 mb-4">{post.summary}</p>

                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="text-sm text-blue-600 group-hover:underline">Read more</div>
                </Link>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-slate-500">No posts available at the moment.</p>
        </div>
      )}
    </div>
  )
}

// Helper function to process tags in different formats
function processTags(tags: any): string[] {
  if (!tags) {
    return []
  }

  // If tags is already an array
  if (Array.isArray(tags)) {
    return tags.map((tag) => tag.trim())
  }

  // If tags is a string
  if (typeof tags === "string") {
    return tags.split(",").map((tag) => tag.trim())
  }

  // If tags is in some other format, return empty array
  console.warn("Unexpected tags format:", tags)
  return []
}
