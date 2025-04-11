import fs from "fs"
import path from "path"
import matter from "gray-matter"
import { remark } from "remark"
import html from "remark-html"

// Define the posts directory path
const postsDirectory = path.join(process.cwd(), "content/posts")

// Ensure the posts directory exists
export function ensureDirectoryExists() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

export function getPostSlugs() {
  ensureDirectoryExists()
  return fs
    .readdirSync(postsDirectory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => file.replace(/\.md$/, ""))
}

export function getPostBySlug(slug: string, fields: string[] = []) {
  ensureDirectoryExists()
  const fullPath = path.join(postsDirectory, `${slug}.md`)

  // Check if the file exists
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    return null
  }

  const fileContents = fs.readFileSync(fullPath, "utf8")
  const { data, content } = matter(fileContents)

  type Items = {
    [key: string]: any
  }

  const items: Items = {}

  // Ensure only the minimal needed data is exposed
  fields.forEach((field) => {
    if (field === "slug") {
      items[field] = slug
    }
    if (field === "content") {
      items[field] = content
    }

    if (typeof data[field] !== "undefined") {
      items[field] = data[field]
    }
  })

  return items
}

export async function getPostContent(slug: string) {
  const post = getPostBySlug(slug, ["content"])

  if (!post) {
    return null
  }

  const content = await remark()
    .use(html)
    .process(post.content || "")

  return content.toString()
}

export function getAllPosts(fields: string[] = []) {
  ensureDirectoryExists()
  const slugs = getPostSlugs()
  const posts = slugs
    .map((slug) => getPostBySlug(slug, fields))
    .filter((post) => post !== null) // Filter out null posts
    // sort posts by date in descending order
    .sort((post1, post2) => (post1?.date > post2?.date ? -1 : 1))
  return posts
}

export type PostMeta = {
  title: string
  date: string
  slug: string
  author: string
  summary: string
  tags: string[] | string
  thumbnail?: string
}
