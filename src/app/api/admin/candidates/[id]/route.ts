import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: params.id },
      include: { election: true, electorate: true, party: true },
    })
    if (!candidate) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(candidate)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch candidate" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const candidate = await prisma.candidate.update({
      where: { id: params.id },
      data: {
        name: body.name,
        photo: body.photo || null,
        website: body.website || null,
        votingRecordUrl: body.votingRecordUrl || null,
        isIncumbent: body.isIncumbent ?? false,
        partyId: body.partyId || null,
        electorateId: body.electorateId,
        electionId: body.electionId,
      },
    })
    return NextResponse.json(candidate)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update candidate" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.candidate.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete candidate" }, { status: 500 })
  }
}
