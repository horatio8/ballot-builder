import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const option = await prisma.policyOption.update({
      where: { id: params.id },
      data: {
        optionText: body.optionText,
        description: body.description || null,
        policyStatement: body.policyStatement || null,
        sortOrder: body.sortOrder ?? 0,
        questionId: body.questionId,
      },
    })
    return NextResponse.json(option)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update option" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.policyOption.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete option" }, { status: 500 })
  }
}
