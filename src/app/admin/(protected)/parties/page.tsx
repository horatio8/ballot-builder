import { prisma } from "@/lib/db"
import { PartiesClient } from "./parties-client"

export default async function PartiesPage() {
  const [elections, parties] = await Promise.all([
    prisma.election.findMany({ orderBy: { date: "desc" } }),
    prisma.party.findMany({
      orderBy: { name: "asc" },
      include: {
        election: { select: { name: true } },
        _count: { select: { candidates: true } },
      },
    }),
  ])

  return (
    <PartiesClient
      elections={JSON.parse(JSON.stringify(elections))}
      parties={JSON.parse(JSON.stringify(parties))}
    />
  )
}
