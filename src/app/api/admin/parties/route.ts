import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const parties = await prisma.party.findMany({
      include: { election: true, _count: { select: { candidates: true } } },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(parties)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch parties" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const party = await prisma.party.create({
      data: {
        name: body.name,
        abbreviation: body.abbreviation || null,
        color: body.color || null,
        logo: body.logo || null,
        website: body.website || null,
        electionId: body.electionId,
      },
    })
    return NextResponse.json(party, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create party" }, { status: 500 })
  }
}
