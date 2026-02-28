import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, MapPin, User, Search } from "lucide-react"
import Link from "next/link"

export const metadata = {
  title: "Research Hub - Build a Ballot",
  description: "Research candidates, parties, and electorates to make an informed vote.",
}

export default async function ResearchPage() {
  const election = await prisma.election.findFirst({
    where: { isActive: true },
    include: {
      electorates: { orderBy: { name: "asc" } },
      parties: { orderBy: { name: "asc" } },
    },
  })

  if (!election) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold font-heading">Research Hub</h1>
        <p className="mt-4 text-muted-foreground">No active election found.</p>
      </div>
    )
  }

  const candidates = await prisma.candidate.findMany({
    where: { electionId: election.id },
    include: { party: true, electorate: true },
    orderBy: { name: "asc" },
  })

  // Group candidates by electorate
  const candidatesByElectorate = candidates.reduce<
    Record<string, typeof candidates>
  >((acc, c) => {
    const key = c.electorate.name
    if (!acc[key]) acc[key] = []
    acc[key].push(c)
    return acc
  }, {})

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">Research Hub</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Explore candidates, parties, and electorates for the {election.name}.
          Use this page to do your own research before heading to the polls.
        </p>
      </div>

      {/* Parties Overview */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold font-heading mb-4">Parties</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {election.parties.map((party) => (
            <Card key={party.id} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-3 p-4">
                <div
                  className="h-8 w-8 shrink-0 rounded-full"
                  style={{ backgroundColor: party.color || "#6b7280" }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{party.name}</p>
                  {party.abbreviation && (
                    <p className="text-xs text-muted-foreground">{party.abbreviation}</p>
                  )}
                </div>
                {party.website && (
                  <a
                    href={party.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      {/* Candidates by Electorate */}
      <section>
        <h2 className="text-2xl font-bold font-heading mb-4">
          Candidates by Electorate
        </h2>
        <p className="text-muted-foreground mb-6">
          {election.electorates.length} electorates &middot;{" "}
          {candidates.length} candidates
        </p>

        <div className="space-y-8">
          {election.electorates.map((electorate) => {
            const electorateCandidates = candidatesByElectorate[electorate.name] || []
            return (
              <Card key={electorate.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    {electorate.name}
                    <Badge variant="outline" className="ml-auto">
                      {electorate.type}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {electorateCandidates.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No candidates listed yet.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {electorateCandidates.map((candidate) => (
                        <div
                          key={candidate.id}
                          className="flex items-center gap-3 rounded-md border p-3"
                        >
                          <div
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
                            style={{
                              backgroundColor: candidate.party?.color || "#6b7280",
                            }}
                          >
                            {candidate.photo ? (
                              <img
                                src={candidate.photo}
                                alt={candidate.name}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-5 w-5" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {candidate.name}
                              {candidate.isIncumbent && (
                                <span className="ml-1 text-xs text-muted-foreground">
                                  (Inc.)
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {candidate.party?.name || "Independent"}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {candidate.website && (
                              <a
                                href={candidate.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:text-primary/80"
                                title="Website"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>
    </div>
  )
}
