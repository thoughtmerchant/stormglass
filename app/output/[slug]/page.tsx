import { notFound } from "next/navigation"
import Image from "next/image"
import { SiteLayout } from "@/components/layout/site-layout"
import { getPostBySlug, getPostContent, getAllPosts, type PostMeta } from "@/lib/markdown"

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug, ['title', 'summary', 'author', 'date']) as any

  if (!post) {
    return {
      title: 'Post Not Found - Thought Merchants',
      description: 'The requested blog post could not be found.',
    }
  }

  return {
    title: `${post.title} - Thought Merchants`,
    description: post.summary,
    authors: [{ name: post.author }],
    publishedTime: post.date,
  }
}

// Generate static params for all possible slugs
export function generateStaticParams() {
  const posts = getAllPosts(['slug'])
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  // Get the post data
  const post = getPostBySlug(params.slug, [
    'title', 
    'date', 
    'author', 
    'content', 
    'summary', 
    'tags',
    'mainImage',
    'brand',
  ]) as any

  // If the post doesn't exist, show a 404 page
  if (!post) {
    notFound()
  }

  // Convert the content from markdown to HTML
  const content = await getPostContent(params.slug)

  // Format the date
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <SiteLayout>
      <article className="max-w-4xl mx-auto">
        {/* Post Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="text-gray-600 dark:text-gray-400 mb-6">
            <p>
              Published: {formattedDate}
              {post.brand && <span> • {post.brand}</span>}
            </p>
            <p>Author: {post.author}</p>
          </div>

          {post.mainImage && (
            <div className="relative w-full h-[400px] mb-8">
              <Image
                src={post.mainImage}
                alt={post.title}
                fill
                className="object-cover rounded-lg"
                priority
              />
            </div>
          )}

          {post.summary && (
            <div className="text-lg text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 pl-4 py-2 mb-8 bg-gray-50 dark:bg-gray-800 rounded">
              {post.summary}
            </div>
          )}
        </div>

        {/* Post Content */}
        <div 
          className="prose dark:prose-invert max-w-none prose-lg prose-headings:text-black dark:prose-headings:text-white prose-a:text-blue-600 dark:prose-a:text-blue-400"
          dangerouslySetInnerHTML={{ __html: content || '' }}
        />

        {/* Post Footer */}
        <div className="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {Array.isArray(post.tags) ? (
              post.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-block px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  {tag}
                </span>
              ))
            ) : (
              post.tags && (
                <span className="inline-block px-3 py-1 text-sm rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {post.tags}
                </span>
              )
            )}
          </div>
        </div>
      </article>
    </SiteLayout>
  )
}
