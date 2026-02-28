import { prisma } from "@/lib/db"
import { ElectoratesClient } from "./electorates-client"

export default async function ElectoratesPage() {
  const [elections, electorates] = await Promise.all([
    prisma.election.findMany({ orderBy: { date: "desc" } }),
    prisma.electorate.findMany({
      orderBy: { name: "asc" },
      include: {
        election: { select: { name: true } },
        _count: { select: { candidates: true } },
      },
    }),
  ])

  return (
    <ElectoratesClient
      elections={JSON.parse(JSON.stringify(elections))}
      electorates={JSON.parse(JSON.stringify(electorates))}
    />
  )
}
