import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const electorates = await prisma.electorate.findMany({
      include: { election: true, _count: { select: { candidates: true } } },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(electorates)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch electorates" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()

    // Support bulk import (array of electorates)
    if (Array.isArray(body)) {
      const created = await prisma.$transaction(
        body.map((item: { name: string; state: string; type?: string; electionId: string }) =>
          prisma.electorate.create({
            data: {
              name: item.name,
              state: item.state,
              type: item.type || "lower",
              electionId: item.electionId,
            },
          })
        )
      )
      return NextResponse.json(created, { status: 201 })
    }

    const electorate = await prisma.electorate.create({
      data: {
        name: body.name,
        state: body.state,
        type: body.type || "lower",
        electionId: body.electionId,
      },
    })
    return NextResponse.json(electorate, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create electorate" }, { status: 500 })
  }
}
