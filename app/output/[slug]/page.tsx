import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { getPostBySlug, getPostContent, getPostSlugs } from "@/lib/markdown"

// Generate static params for all posts
export async function generateStaticParams() {
  const slugs = getPostSlugs()
  return slugs.map((slug) => ({ slug }))
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug, ["title", "date", "author", "summary", "tags"])

  // If no matching post is found, return 404
  if (!post) {
    notFound()
  }

  const content = await getPostContent(params.slug)

  // Process tags - handle both string and array formats
  const tags = processTags(post.tags)

  return (
    <div className="max-w-3xl mx-auto p-8 md:p-12">
      <Link
        href="/output"
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to all posts
      </Link>

      <article>
        <header className="mb-10">
          <div className="text-sm text-slate-500 mb-3">
            {new Date(post.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <h1 className="text-3xl md:text-4xl font-normal text-slate-800 mb-4">{post.title}</h1>
          <p className="text-xl text-slate-600">{post.summary}</p>
          {post.author && <div className="mt-4 text-sm text-slate-500">By {post.author}</div>}
          {tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag: string) => (
                <span key={tag} className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {content ? (
          <div
            className="prose prose-slate max-w-none prose-headings:font-normal prose-headings:text-slate-800 prose-p:text-slate-600 prose-a:text-blue-600"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <div className="text-slate-600">Content not available.</div>
        )}
      </article>
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
