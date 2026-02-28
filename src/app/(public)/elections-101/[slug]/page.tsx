import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  })
  if (!article) return { title: "Article Not Found" }
  return {
    title: `${article.title} - Elections 101`,
    description: article.title,
  }
}

export default async function ArticlePage({ params }: Props) {
  const article = await prisma.article.findUnique({
    where: { slug: params.slug, isPublished: true },
  })

  if (!article) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href="/elections-101"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to Elections 101
      </Link>

      <article>
        {article.thumbnail && (
          <div className="aspect-video overflow-hidden rounded-lg mb-6">
            <img
              src={article.thumbnail}
              alt={article.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            {article.category && (
              <Badge variant="secondary">{article.category}</Badge>
            )}
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              {article.readTimeMinutes} min read
            </span>
            <span className="text-sm text-muted-foreground">
              {formatDate(article.createdAt)}
            </span>
          </div>
          <h1 className="text-3xl font-bold font-heading md:text-4xl">
            {article.title}
          </h1>
        </header>

        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>
    </div>
  )
}
