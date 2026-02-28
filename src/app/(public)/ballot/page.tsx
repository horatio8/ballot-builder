"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BallotBuilder } from "@/components/public/BallotBuilder"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2 } from "lucide-react"

interface BallotData {
  election: { id: string; name: string; state: string; date: string }
  electorate: { id: string; name: string; type: string } | null
  candidates: Array<{
    id: string
    name: string
    photo: string | null
    isIncumbent: boolean
    party: { id: string; name: string; abbreviation: string | null; color: string | null } | null
  }>
  parties: Array<{
    id: string
    name: string
    abbreviation: string | null
    color: string | null
  }>
  settings: { siteName: string }
}

export default function BallotPage() {
  const router = useRouter()
  const [data, setData] = useState<BallotData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const sessionId = localStorage.getItem("ballotSessionId")
    if (!sessionId) {
      router.push("/questionnaire")
      return
    }

    fetch(`/api/public/ballot-data?sessionId=${sessionId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load ballot data")
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
          <p className="text-muted-foreground">Loading your ballot...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Unable to load ballot</h2>
          <p className="text-muted-foreground">{error || "Something went wrong."}</p>
          <Button onClick={() => router.push("/questionnaire")}>Start over</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back link */}
      <Link href="/results" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="mr-1 h-4 w-4" />
        Back to results
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">Build Your Ballot</h1>
        <p className="mt-2 text-muted-foreground">
          Drag and drop candidates and parties to create your personalised ballot plan
          for the {data.election.name}.
        </p>
      </div>

      <BallotBuilder
        candidates={data.candidates}
        parties={data.parties}
        electorate={data.electorate}
        election={data.election}
        siteName={data.settings.siteName}
      />
    </div>
  )
}
