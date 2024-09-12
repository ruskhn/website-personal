import fs from "fs"
import matter from "gray-matter"
import path from "path"
import { remark } from "remark"
import html from "remark-html"

const articlesDirectory = path.join(process.cwd(), "articles")

export const getMdFile = async () => {
  const fileNames = fs.readdirSync(articlesDirectory)

  const allArticlesData = await Promise.all(
    fileNames.map(async (fileName) => {
      const id = fileName.replace(/\.md$/, "")

      const fullPath = path.join(articlesDirectory, fileName)
      const fileContents = fs.readFileSync(fullPath, "utf-8")

      const matterResult = matter(fileContents)

      const processedContent = await remark().use(html).process(matterResult.content)

      const contentHtml = processedContent.toString()

      console.log("contentHtml", contentHtml)
      return {
        id,
        title: matterResult.data.title,
        date: matterResult.data.date,
        category: matterResult.data.category,
        contentHtml: contentHtml,
      }
    })
  )

  return allArticlesData
}
