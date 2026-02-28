"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MatchScoreCard } from "@/components/public/MatchScoreCard"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, RotateCcw, Loader2 } from "lucide-react"

interface CandidateResult {
  id: string
  name: string
  photo: string | null
  website: string | null
  votingRecordUrl: string | null
  isIncumbent: boolean
  party: { id: string; name: string; abbreviation: string | null; color: string | null } | null
  matchPercentage: number
  matchPoints: number
  totalPoints: number
  color: string
  breakdown: Array<{
    policyOptionId: string
    optionText: string
    categoryName: string
    userSelected: boolean
    agreementScore: number | null
    matched: boolean
    points: number
    maxPoints: number
  }>
}

interface PartyResult {
  id: string
  name: string
  abbreviation: string | null
  color: string | null
  website: string | null
  matchPercentage: number
  matchPoints: number
  totalPoints: number
  matchColor: string
  breakdown: Array<{
    policyOptionId: string
    optionText: string
    categoryName: string
    userSelected: boolean
    agreementScore: number | null
    matched: boolean
    points: number
    maxPoints: number
  }>
}

interface ResultsData {
  candidates: CandidateResult[]
  parties: PartyResult[]
  settings: {
    greenThreshold: number
    orangeThreshold: number
    matchGreenColor?: string | null
    matchOrangeColor?: string | null
    matchRedColor?: string | null
    matchGreyColor?: string | null
  }
}

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<ResultsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = localStorage.getItem("ballotSessionId")
    if (!sessionId) {
      router.push("/questionnaire")
      return
    }

    fetch(`/api/public/results?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load results")
        return res.json()
      })
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Calculating your matches...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Unable to load results</h2>
          <p className="text-muted-foreground">{error || "Something went wrong."}</p>
          <Button onClick={() => router.push("/questionnaire")}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Start over
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">Your Match Results</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
          Based on your policy preferences, here&apos;s how candidates and parties align with your
          views. The higher the percentage, the closer the match.
        </p>
      </div>

      {/* Legend */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.settings.matchGreenColor || "#22c55e" }}
          />
          <span>Strong match ({data.settings.greenThreshold}%+)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.settings.matchOrangeColor || "#f97316" }}
          />
          <span>
            Partial match ({data.settings.orangeThreshold}–{data.settings.greenThreshold - 1}%)
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.settings.matchRedColor || "#ef4444" }}
          />
          <span>Low match (&lt;{data.settings.orangeThreshold}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: data.settings.matchGreyColor || "#9ca3af" }}
          />
          <span>Not assessed</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="candidates" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="candidates">
            Lower House ({data.candidates.length})
          </TabsTrigger>
          <TabsTrigger value="parties">
            Upper House ({data.parties.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="candidates" className="space-y-4">
          {data.candidates.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No candidates found for your electorate.</p>
            </div>
          ) : (
            data.candidates.map((candidate) => (
              <MatchScoreCard
                key={candidate.id}
                name={candidate.name}
                photo={candidate.photo}
                party={candidate.party}
                matchPercentage={candidate.matchPercentage}
                matchPoints={candidate.matchPoints}
                totalPoints={candidate.totalPoints}
                color={candidate.color}
                breakdown={candidate.breakdown}
                website={candidate.website}
                votingRecordUrl={candidate.votingRecordUrl}
                isIncumbent={candidate.isIncumbent}
                settings={data.settings}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="parties" className="space-y-4">
          {data.parties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No party assessments available yet.</p>
            </div>
          ) : (
            data.parties.map((party) => (
              <MatchScoreCard
                key={party.id}
                name={party.name}
                party={{
                  name: party.name,
                  abbreviation: party.abbreviation,
                  color: party.color,
                }}
                matchPercentage={party.matchPercentage}
                matchPoints={party.matchPoints}
                totalPoints={party.totalPoints}
                color={party.matchColor}
                breakdown={party.breakdown}
                website={party.website}
                isParty
                settings={data.settings}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
        <Link href="/ballot">
          <Button size="lg">
            Build Your Ballot
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
        <Link href="/questionnaire">
          <Button variant="outline" size="lg">
            <RotateCcw className="mr-2 h-4 w-4" />
            Retake Questionnaire
          </Button>
        </Link>
      </div>
    </div>
  )
}
