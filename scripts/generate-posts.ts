import fs from "fs"
import path from "path"
import { parse } from "csv-parse/sync"

// Define the posts directory path
const postsDirectory = path.join(process.cwd(), "content/posts")

// Ensure the posts directory exists
function ensureDirectoryExists() {
  if (!fs.existsSync(postsDirectory)) {
    fs.mkdirSync(postsDirectory, { recursive: true })
  }
}

async function generatePosts() {
  try {
    ensureDirectoryExists()

    // Fetch the CSV file
    const response = await fetch(
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thought%20Merchants%20Outputs%20%282%29-yIKrDAOiTophlcCeAebaQYPcaWwiOj.csv",
    )
    const csvText = await response.text()

    // Parse the CSV
    const records = parse(csvText, {
      columns: true,
      skip_empty_lines: true,
    })

    // Process each record
    for (const record of records) {
      const {
        Name: title,
        Slug: slug,
        "Post Summary": summary,
        Author: author,
        "Date of Publication": date,
        Tags: tags,
        "Post Body": content,
        "Main Image": mainImage,
        "Thumbnail image": thumbnail,
      } = record

      // Process tags to ensure they're in a consistent format
      const tagArray = tags ? tags.split(",").map((tag: string) => tag.trim()) : []

      // Create frontmatter
      const frontmatter = `---
title: "${title || ""}"
date: "${date || new Date().toISOString()}"
slug: "${slug || ""}"
author: "${author || ""}"
summary: "${summary?.replace(/"/g, '\\"') || ""}"
tags: ${JSON.stringify(tagArray)}
mainImage: "${mainImage || ""}"
thumbnail: "${thumbnail || ""}"
---

${content || ""}
`

      // Write the file
      if (slug) {
        const filePath = path.join(postsDirectory, `${slug}.md`)
        fs.writeFileSync(filePath, frontmatter)
        console.log(`Generated post: ${filePath}`)
      } else {
        console.warn("Skipping record with no slug")
      }
    }

    console.log("All posts generated successfully!")
  } catch (error) {
    console.error("Error generating posts:", error)
  }
}

// Run the function
generatePosts()
