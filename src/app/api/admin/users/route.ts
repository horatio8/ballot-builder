import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const users = await prisma.user.findMany({
      where: { isAdmin: true },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        isAdmin: true,
        password: false,
        emailVerified: true,
        accounts: {
          select: { provider: true },
        },
      },
      orderBy: { name: "asc" },
    })

    const formatted = users.map((u) => ({
      ...u,
      hasPassword: false, // We don't expose password info from GET list
      providers: u.accounts.map((a) => a.provider),
      accounts: undefined,
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Check for existing user
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
    if (existing) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name || null,
        email: email.toLowerCase(),
        password: hashedPassword,
        isAdmin: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}
