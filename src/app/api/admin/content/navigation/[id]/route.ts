import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const navItem = await prisma.navItem.update({
      where: { id: params.id },
      data: {
        label: body.label,
        url: body.url,
        location: body.location || "header",
        sortOrder: body.sortOrder ?? 0,
        parentId: body.parentId || null,
      },
    })
    return NextResponse.json(navItem)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update navigation item" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    await prisma.navItem.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete navigation item" }, { status: 500 })
  }
}
