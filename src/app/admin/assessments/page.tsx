import { prisma } from "@/lib/db"
import { AssessmentsClient } from "./assessments-client"

export default async function AssessmentsPage() {
  const [elections, parties, candidates, options, assessments] = await Promise.all([
    prisma.election.findMany({ orderBy: { date: "desc" } }),
    prisma.party.findMany({ orderBy: { name: "asc" }, include: { election: { select: { name: true } } } }),
    prisma.candidate.findMany({
      orderBy: { name: "asc" },
      include: { party: { select: { name: true } }, electorate: { select: { name: true } }, election: { select: { name: true } } },
    }),
    prisma.policyOption.findMany({
      orderBy: { sortOrder: "asc" },
      include: { question: { select: { questionText: true, category: { select: { name: true } } } } },
    }),
    prisma.candidateAssessment.findMany(),
  ])

  return (
    <AssessmentsClient
      elections={JSON.parse(JSON.stringify(elections))}
      parties={JSON.parse(JSON.stringify(parties))}
      candidates={JSON.parse(JSON.stringify(candidates))}
      options={JSON.parse(JSON.stringify(options))}
      assessments={JSON.parse(JSON.stringify(assessments))}
    />
  )
}
