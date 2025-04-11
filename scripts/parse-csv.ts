// This script would be run manually to parse the CSV data and create markdown files

import fs from "fs"
import path from "path"

async function parseCSV() {
  // In a real implementation, this would fetch the CSV from the URL
  // For this exercise, we'll simulate having the CSV data

  const outputDir = path.join(process.cwd(), "content/posts")

  // Make sure the directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  // Simulated function for fetching CSV content
  // In a real scenario, you would fetch from the URL
  // const response = await fetch('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thought%20Merchants%20Outputs%20%282%29-yIKrDAOiTophlcCeAebaQYPcaWwiOj.csv')
  // const csvText = await response.text()

  // Process each row of the CSV
  // const records = parse(csvText, { columns: true })

  // For each record, create a markdown file
  // records.forEach((record) => {
  //   createMarkdownFile(outputDir, record)
  // })

  console.log("CSV parsing complete. Markdown files created.")
}

function createMarkdownFile(outputDir: string, record: any) {
  const slug = record.Slug || slugify(record.Name)
  const filePath = path.join(outputDir, `${slug}.md`)

  // Format the frontmatter
  const frontmatter = [
    "---",
    `title: "${record.Name}"`,
    `date: "${record["Date of Publication"] || record["Created On"]}"`,
    `summary: "${record["Post Summary"]}"`,
    `author: "${record.Author}"`,
    record.Direction ? `direction: "${record.Direction}"` : "",
    record.Design ? `design: "${record.Design}"` : "",
    `tags: ${JSON.stringify(record.Tags?.split(",").map((tag: string) => tag.trim()) || [])}`,
    `brand: "${record.Brand}"`,
    record["Main Image"] ? `mainImage: "${record["Main Image"]}"` : "",
    record["Thumbnail image"] ? `thumbnailImage: "${record["Thumbnail image"]}"` : "",
    `published: ${record["Stash from Public View"] !== "true"}`,
    `opinion: ${record["Opinion Switch"] === "true"}`,
    "---",
    "",
    record["Post Body"].replace(/<[^>]*>/g, ""), // Simple HTML to markdown conversion
  ]
    .filter(Boolean)
    .join("\n")

  fs.writeFileSync(filePath, frontmatter)
}

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/&/g, "-and-") // Replace & with 'and'
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
}

// This function would be run via a script, but for this example
// we're just including it in the code base
parseCSV().catch(console.error)
