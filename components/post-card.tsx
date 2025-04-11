import Link from "next/link"
import Image from "next/image"
import { formatDate } from "@/lib/format-date"
import type { PostMeta } from "@/lib/markdown"

interface PostCardProps {
  post: PostMeta
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-slate-200 pb-12 last:border-0">
      <Link href={`/output/${post.slug}`} className="group">
        {post.thumbnailImage && (
          <div className="mb-6">
            <Image
              src={post.thumbnailImage || "/placeholder.svg"}
              alt={post.title}
              width={800}
              height={450}
              className="rounded-lg object-cover w-full"
            />
          </div>
        )}
        <div className="mb-2 text-sm text-slate-500">{formatDate(post.date)}</div>
        <h2 className="text-xl md:text-2xl font-medium text-slate-800 mb-3 group-hover:text-blue-600 transition-colors">
          {post.title}
        </h2>
        <p className="text-slate-600 mb-4">{post.summary}</p>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span key={tag} className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 text-xs rounded">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="text-sm text-blue-600 group-hover:underline">Read more</div>
      </Link>
    </article>
  )
}
