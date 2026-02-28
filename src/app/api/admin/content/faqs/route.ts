import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } })
    return NextResponse.json(faqs)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch FAQs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const faq = await prisma.fAQ.create({
      data: {
        question: body.question,
        answer: body.answer,
        sortOrder: body.sortOrder ?? 0,
        isPublished: body.isPublished ?? true,
      },
    })
    return NextResponse.json(faq, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create FAQ" }, { status: 500 })
  }
}
