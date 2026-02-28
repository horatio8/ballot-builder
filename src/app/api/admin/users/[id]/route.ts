import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        password: true,
        accounts: { select: { provider: true } },
      },
    })

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    return NextResponse.json({
      ...user,
      hasPassword: !!user.password,
      password: undefined,
      providers: user.accounts.map((a) => a.provider),
      accounts: undefined,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { name, email, password, isAdmin } = body

    const existing = await prisma.user.findUnique({ where: { id: params.id } })
    if (!existing) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Prevent removing your own admin access
    if (existing.email === session.user?.email && isAdmin === false) {
      return NextResponse.json({ error: "You cannot remove your own admin access" }, { status: 400 })
    }

    // Check email uniqueness if changing email
    if (email && email.toLowerCase() !== existing.email?.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
      if (emailTaken) {
        return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
      }
    }

    const updateData: any = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email.toLowerCase()
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin
    if (password) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const user = await prisma.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

    // Prevent self-deletion
    if (user.email === session.user?.email) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 })
    }

    // Delete related accounts and sessions first, then user
    await prisma.account.deleteMany({ where: { userId: params.id } })
    await prisma.session.deleteMany({ where: { userId: params.id } })
    await prisma.user.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
