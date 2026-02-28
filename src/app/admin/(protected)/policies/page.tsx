import { prisma } from "@/lib/db"
import { PoliciesClient } from "./policies-client"

export default async function PoliciesPage() {
  const [elections, categories, questions, options] = await Promise.all([
    prisma.election.findMany({ orderBy: { date: "desc" } }),
    prisma.policyCategory.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.policyQuestion.findMany({
      orderBy: { sortOrder: "asc" },
      include: { category: { select: { name: true } }, election: { select: { name: true } } },
    }),
    prisma.policyOption.findMany({
      orderBy: { sortOrder: "asc" },
      include: { question: { select: { questionText: true } } },
    }),
  ])

  return (
    <PoliciesClient
      elections={JSON.parse(JSON.stringify(elections))}
      categories={JSON.parse(JSON.stringify(categories))}
      questions={JSON.parse(JSON.stringify(questions))}
      options={JSON.parse(JSON.stringify(options))}
    />
  )
}
