import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const candidates = await prisma.candidate.findMany({
      include: { election: true, electorate: true, party: true },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(candidates)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch candidates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const candidate = await prisma.candidate.create({
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
    return NextResponse.json(candidate, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create candidate" }, { status: 500 })
  }
}
