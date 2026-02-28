import { prisma } from "@/lib/db"
import { ArticlesClient } from "./articles-client"

export default async function ArticlesPage() {
  const articles = await prisma.article.findMany({ orderBy: { updatedAt: "desc" } })
  return <ArticlesClient articles={JSON.parse(JSON.stringify(articles))} />
}
