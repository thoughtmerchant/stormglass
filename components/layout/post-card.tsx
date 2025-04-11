"use client"

import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import type { PostMeta } from "@/lib/markdown"

interface PostCardProps {
  post: PostMeta
}

export function PostCard({ post }: PostCardProps) {
  // Format the date to be human-readable
  const formattedDate = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card className="overflow-hidden border border-slate-200 dark:border-slate-700 h-full flex flex-col">
      {post.thumbnail && (
        <div className="relative w-full h-48">
          <Image
            src={post.thumbnail || "/placeholder.svg"}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      )}
      <CardContent className="p-6 flex-grow">
        <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          {formattedDate} • {post.author}
        </div>
        <Link href={`/output/${post.slug}`}>
          <h3 className="text-xl font-bold mb-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            {post.title}
          </h3>
        </Link>
        <p className="text-gray-600 dark:text-gray-300 line-clamp-3">
          {post.summary}
        </p>
      </CardContent>
      <CardFooter className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800">
        <div className="flex flex-wrap gap-2">
          {Array.isArray(post.tags) ? (
            post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                {tag}
              </span>
            ))
          ) : (
            <span className="inline-block px-2 py-1 text-xs rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {post.tags}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
