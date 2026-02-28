import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const party = await prisma.party.findUnique({
      where: { id: params.id },
      include: { election: true, candidates: true },
    })
    if (!party) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(party)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch party" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const party = await prisma.party.update({
      where: { id: params.id },
      data: {
        name: body.name,
        abbreviation: body.abbreviation || null,
        color: body.color || null,
        logo: body.logo || null,
        website: body.website || null,
        electionId: body.electionId,
      },
    })
    return NextResponse.json(party)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update party" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.party.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete party" }, { status: 500 })
  }
}
