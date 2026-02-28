import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const questions = await prisma.policyQuestion.findMany({
      include: { category: true, election: true, _count: { select: { options: true } } },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(questions)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const question = await prisma.policyQuestion.create({
      data: {
        questionText: body.questionText,
        description: body.description || null,
        sortOrder: body.sortOrder ?? 0,
        categoryId: body.categoryId,
        electionId: body.electionId,
      },
    })
    return NextResponse.json(question, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
