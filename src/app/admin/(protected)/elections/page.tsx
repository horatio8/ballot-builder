import { prisma } from "@/lib/db"
import { ElectionsClient } from "./elections-client"

export default async function ElectionsPage() {
  const elections = await prisma.election.findMany({
    orderBy: { date: "desc" },
    include: {
      _count: {
        select: { electorates: true, parties: true, candidates: true },
      },
    },
  })

  return <ElectionsClient elections={JSON.parse(JSON.stringify(elections))} />
}
