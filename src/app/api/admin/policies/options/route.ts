import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const options = await prisma.policyOption.findMany({
      include: { question: { include: { category: true } } },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(options)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch options" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const option = await prisma.policyOption.create({
      data: {
        optionText: body.optionText,
        description: body.description || null,
        policyStatement: body.policyStatement || null,
        sortOrder: body.sortOrder ?? 0,
        questionId: body.questionId,
      },
    })
    return NextResponse.json(option, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create option" }, { status: 500 })
  }
}
