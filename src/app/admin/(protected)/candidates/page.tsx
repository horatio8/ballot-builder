import { prisma } from "@/lib/db"
import { CandidatesClient } from "./candidates-client"

export default async function CandidatesPage() {
  const [elections, electorates, parties, candidates] = await Promise.all([
    prisma.election.findMany({ orderBy: { date: "desc" } }),
    prisma.electorate.findMany({ orderBy: { name: "asc" }, include: { election: { select: { name: true } } } }),
    prisma.party.findMany({ orderBy: { name: "asc" }, include: { election: { select: { name: true } } } }),
    prisma.candidate.findMany({
      orderBy: { name: "asc" },
      include: {
        party: { select: { name: true, color: true } },
        electorate: { select: { name: true } },
        election: { select: { name: true } },
      },
    }),
  ])

  return (
    <CandidatesClient
      elections={JSON.parse(JSON.stringify(elections))}
      electorates={JSON.parse(JSON.stringify(electorates))}
      parties={JSON.parse(JSON.stringify(parties))}
      candidates={JSON.parse(JSON.stringify(candidates))}
    />
  )
}
