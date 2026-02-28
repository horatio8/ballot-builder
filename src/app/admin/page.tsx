import { prisma } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"
import {
  Vote,
  MapPin,
  Flag,
  Users,
  ClipboardList,
  Activity,
} from "lucide-react"

export default async function AdminDashboard() {
  const [
    electionCount,
    electorateCount,
    partyCount,
    candidateCount,
    questionCount,
    sessionCount,
    activeElection,
  ] = await Promise.all([
    prisma.election.count(),
    prisma.electorate.count(),
    prisma.party.count(),
    prisma.candidate.count(),
    prisma.policyQuestion.count(),
    prisma.userSession.count(),
    prisma.election.findFirst({
      where: { isActive: true },
      orderBy: { date: "desc" },
    }),
  ])

  const stats = [
    { label: "Elections", value: electionCount, icon: Vote },
    { label: "Electorates", value: electorateCount, icon: MapPin },
    { label: "Parties", value: partyCount, icon: Flag },
    { label: "Candidates", value: candidateCount, icon: Users },
    { label: "Policy Questions", value: questionCount, icon: ClipboardList },
    { label: "User Sessions", value: sessionCount, icon: Activity },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your Ballot Builder instance.
        </p>
      </div>

      {activeElection && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Vote className="h-5 w-5 text-primary" />
              Active Election
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xl font-semibold">{activeElection.name}</p>
                <p className="text-sm text-muted-foreground">
                  {activeElection.state} &mdash; {formatDate(activeElection.date)}
                </p>
              </div>
              <Badge variant="default">Active</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
