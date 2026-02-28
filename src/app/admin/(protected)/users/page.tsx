import { prisma } from "@/lib/db"
import { UsersClient } from "./users-client"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { isAdmin: true },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isAdmin: true,
      password: true,
      accounts: { select: { provider: true } },
    },
    orderBy: { name: "asc" },
  })

  const formatted = users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    image: u.image,
    isAdmin: u.isAdmin,
    hasPassword: !!u.password,
    providers: u.accounts.map((a) => a.provider),
  }))

  return <UsersClient users={JSON.parse(JSON.stringify(formatted))} />
}
