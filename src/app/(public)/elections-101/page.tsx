import { prisma } from "@/lib/db"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, ArrowRight } from "lucide-react"

export const metadata = {
  title: "Elections 101 - Build a Ballot",
  description: "Learn about how elections work in Australia.",
}

export default async function Elections101Page() {
  const articles = await prisma.article.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">Elections 101</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          New to voting or need a refresher? Browse our collection of articles
          to learn everything you need to know about elections in Australia.
        </p>
      </div>

      {articles.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No articles available yet. Check back closer to election day.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <Link key={article.id} href={`/elections-101/${article.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow group">
                {article.thumbnail && (
                  <div className="aspect-video overflow-hidden rounded-t-lg">
                    <img
                      src={article.thumbnail}
                      alt={article.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    {article.category && (
                      <Badge variant="secondary" className="text-xs">
                        {article.category}
                      </Badge>
                    )}
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {article.readTimeMinutes} min read
                    </span>
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {article.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <span className="inline-flex items-center text-sm text-primary font-medium">
                    Read article
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
