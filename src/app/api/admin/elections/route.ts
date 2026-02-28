import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const elections = await prisma.election.findMany({
      include: { _count: { select: { electorates: true, parties: true, candidates: true } } },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(elections)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch elections" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const election = await prisma.election.create({
      data: {
        name: body.name,
        state: body.state,
        date: new Date(body.date),
        enrollmentDeadline: body.enrollmentDeadline ? new Date(body.enrollmentDeadline) : null,
        description: body.description || null,
        isActive: body.isActive ?? false,
      },
    })
    return NextResponse.json(election, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create election" }, { status: 500 })
  }
}
