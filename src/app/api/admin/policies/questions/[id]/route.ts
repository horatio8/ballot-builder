import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const question = await prisma.policyQuestion.update({
      where: { id: params.id },
      data: {
        questionText: body.questionText,
        description: body.description || null,
        sortOrder: body.sortOrder ?? 0,
        categoryId: body.categoryId,
        electionId: body.electionId,
      },
    })
    return NextResponse.json(question)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.policyQuestion.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 })
  }
}
