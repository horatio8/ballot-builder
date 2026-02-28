import { prisma } from "@/lib/db"
import { notFound } from "next/navigation"

interface Props {
  params: { slug: string }
}

// Prevent dynamic page from matching known routes
const RESERVED_SLUGS = [
  "questionnaire",
  "results",
  "ballot",
  "research",
  "transparency",
  "faq",
  "about",
  "elections-101",
]

export async function generateMetadata({ params }: Props) {
  if (RESERVED_SLUGS.includes(params.slug)) return {}
  const page = await prisma.page.findUnique({
    where: { slug: params.slug },
  })
  if (!page) return { title: "Page Not Found" }
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  }
}

export default async function DynamicPage({ params }: Props) {
  if (RESERVED_SLUGS.includes(params.slug)) notFound()

  const page = await prisma.page.findUnique({
    where: { slug: params.slug, isPublished: true },
  })

  if (!page) notFound()

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold font-heading md:text-4xl mb-8 text-center">
        {page.title}
      </h1>
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  )
}
