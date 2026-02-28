import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } })
    return NextResponse.json(pages)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const page = await prisma.page.create({
      data: {
        slug: body.slug,
        title: body.title,
        content: body.content,
        metaTitle: body.metaTitle || null,
        metaDescription: body.metaDescription || null,
        isPublished: body.isPublished ?? true,
      },
    })
    return NextResponse.json(page, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create page" }, { status: 500 })
  }
}
