import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, CheckCircle2, XCircle, MinusCircle } from "lucide-react"

export const metadata = {
  title: "Transparency Centre - Build a Ballot",
  description: "See how we assess candidates and parties against policy positions.",
}

export default async function TransparencyPage() {
  const election = await prisma.election.findFirst({
    where: { isActive: true },
  })

  const methodologyPage = await prisma.page.findUnique({
    where: { slug: "methodology" },
  })

  const assessmentPage = await prisma.page.findUnique({
    where: { slug: "assessment-process" },
  })

  // Get categories with questions and options, including assessment counts
  const categories = await prisma.policyCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      questions: {
        orderBy: { sortOrder: "asc" },
        include: {
          options: {
            orderBy: { sortOrder: "asc" },
            include: {
              assessments: {
                select: {
                  id: true,
                  agreementScore: true,
                  evidence: true,
                  sourceUrl: true,
                  sourceType: true,
                  candidate: { select: { id: true, name: true } },
                  party: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  const scoreLabels: Record<number, { label: string; color: string }> = {
    0: { label: "Strongly disagrees", color: "text-red-600" },
    1: { label: "Partially agrees", color: "text-orange-600" },
    1.5: { label: "Mostly agrees", color: "text-yellow-600" },
    2: { label: "Strongly agrees", color: "text-green-600" },
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">Transparency Centre</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          We believe in full transparency. Here you can see every assessment we&apos;ve made,
          the evidence behind it, and our methodology.
        </p>
      </div>

      {/* Methodology Section */}
      {methodologyPage && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Our Methodology</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: methodologyPage.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Assessment Process Section */}
      {assessmentPage && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Assessment Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: assessmentPage.content }}
            />
          </CardContent>
        </Card>
      )}

      {/* Scoring Guide */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Scoring Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(scoreLabels).map(([score, { label, color }]) => (
              <div key={score} className="flex items-center gap-2 rounded-md border p-3">
                <span className="font-bold text-lg">{score}</span>
                <span className={`text-sm ${color}`}>{label}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Each policy option is scored from 0 (strongly disagrees) to 2 (strongly agrees)
            based on the candidate or party&apos;s public statements, voting record, and
            published policies.
          </p>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* All Assessments by Category */}
      <h2 className="text-2xl font-bold font-heading mb-6">All Assessments</h2>

      <div className="space-y-8">
        {categories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon && <span>{category.icon}</span>}
                {category.name}
              </CardTitle>
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {category.questions.map((question) => (
                <div key={question.id}>
                  <h4 className="font-semibold mb-3">{question.questionText}</h4>
                  {question.options.map((option) => (
                    <div key={option.id} className="mb-4 ml-4">
                      <p className="text-sm font-medium mb-2">
                        &ldquo;{option.optionText}&rdquo;
                      </p>
                      {option.assessments.length === 0 ? (
                        <p className="text-xs text-muted-foreground ml-4">
                          No assessments yet.
                        </p>
                      ) : (
                        <div className="space-y-1 ml-4">
                          {option.assessments.map((assessment) => {
                            const entity = assessment.candidate || assessment.party
                            const scoreInfo = scoreLabels[assessment.agreementScore] || {
                              label: "Unknown",
                              color: "text-gray-500",
                            }
                            return (
                              <div
                                key={assessment.id}
                                className="flex items-start gap-2 text-xs rounded border p-2"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="font-medium">
                                    {entity?.name || "Unknown"}
                                  </span>
                                  <span className={`ml-2 ${scoreInfo.color}`}>
                                    ({assessment.agreementScore}/2 - {scoreInfo.label})
                                  </span>
                                  {assessment.evidence && (
                                    <p className="mt-1 text-muted-foreground">
                                      {assessment.evidence}
                                    </p>
                                  )}
                                </div>
                                {assessment.sourceUrl && (
                                  <a
                                    href={assessment.sourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="shrink-0 text-primary hover:text-primary/80"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </a>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
