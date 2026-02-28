import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const articles = await prisma.article.findMany({ orderBy: { updatedAt: "desc" } })
    return NextResponse.json(articles)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch articles" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const article = await prisma.article.create({
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content,
        category: body.category || null,
        readTimeMinutes: body.readTimeMinutes ?? 3,
        thumbnail: body.thumbnail || null,
        isPublished: body.isPublished ?? true,
      },
    })
    return NextResponse.json(article, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
  }
}
