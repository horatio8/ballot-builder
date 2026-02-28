import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const navItems = await prisma.navItem.findMany({
      include: { parent: true, children: true },
      orderBy: { sortOrder: "asc" },
    })
    return NextResponse.json(navItems)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch navigation items" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const navItem = await prisma.navItem.create({
      data: {
        label: body.label,
        url: body.url,
        location: body.location || "header",
        sortOrder: body.sortOrder ?? 0,
        parentId: body.parentId || null,
      },
    })
    return NextResponse.json(navItem, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create navigation item" }, { status: 500 })
  }
}
