import { prisma } from '@/lib/db'
import { redirect } from 'next/navigation'
import { QuestionnaireFlow } from '@/components/public/QuestionnaireFlow'

export default async function QuestionnairePage() {
  const election = await prisma.election.findFirst({ where: { isActive: true } })
  if (!election) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-heading font-bold mb-4">No Active Election</h1>
        <p className="text-gray-600">There is currently no active election configured. Please check back later.</p>
      </div>
    )
  }

  const categories = await prisma.policyCategory.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      questions: {
        where: { electionId: election.id },
        orderBy: { sortOrder: 'asc' },
        include: {
          options: { orderBy: { sortOrder: 'asc' } },
        },
      },
    },
  })

  // Filter out categories with no questions
  const activeCategories = categories.filter((c) => c.questions.length > 0)

  const electorates = await prisma.electorate.findMany({
    where: { electionId: election.id, type: 'lower' },
    orderBy: { name: 'asc' },
  })

  return (
    <QuestionnaireFlow
      electionId={election.id}
      electionName={election.name}
      categories={activeCategories}
      electorates={electorates}
    />
  )
}
