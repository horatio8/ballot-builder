import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const election = await prisma.election.findUnique({
      where: { id: params.id },
      include: { _count: { select: { electorates: true, parties: true, candidates: true } } },
    })
    if (!election) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(election)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch election" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const election = await prisma.election.update({
      where: { id: params.id },
      data: {
        name: body.name,
        state: body.state,
        date: new Date(body.date),
        enrollmentDeadline: body.enrollmentDeadline ? new Date(body.enrollmentDeadline) : null,
        description: body.description || null,
        isActive: body.isActive ?? false,
      },
    })
    return NextResponse.json(election)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update election" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.election.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete election" }, { status: 500 })
  }
}
