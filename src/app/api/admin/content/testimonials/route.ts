import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } })
    return NextResponse.json(testimonials)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch testimonials" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const testimonial = await prisma.testimonial.create({
      data: {
        quote: body.quote,
        author: body.author,
        role: body.role || null,
        sortOrder: body.sortOrder ?? 0,
        isPublished: body.isPublished ?? true,
      },
    })
    return NextResponse.json(testimonial, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create testimonial" }, { status: 500 })
  }
}
