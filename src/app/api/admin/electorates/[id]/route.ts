import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const electorate = await prisma.electorate.findUnique({
      where: { id: params.id },
      include: { election: true, candidates: true },
    })
    if (!electorate) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(electorate)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch electorate" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const electorate = await prisma.electorate.update({
      where: { id: params.id },
      data: {
        name: body.name,
        state: body.state,
        type: body.type || "lower",
        electionId: body.electionId,
      },
    })
    return NextResponse.json(electorate)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update electorate" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.electorate.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete electorate" }, { status: 500 })
  }
}
