"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Save } from "lucide-react"

interface Election { id: string; name: string }
interface Party { id: string; name: string; electionId: string; election: { name: string } }
interface Candidate {
  id: string; name: string; electionId: string
  party: { name: string } | null; electorate: { name: string }; election: { name: string }
}
interface PolicyOptionItem {
  id: string; optionText: string; questionId: string; sortOrder: number
  question: { questionText: string; category: { name: string } }
}
interface Assessment {
  id: string; agreementScore: number; evidence: string | null; sourceUrl: string | null
  candidateId: string | null; partyId: string | null; policyOptionId: string
}

interface ScoreEntry {
  policyOptionId: string; agreementScore: number; evidence: string; sourceUrl: string
}

export function AssessmentsClient({ elections, parties, candidates, options, assessments }: {
  elections: Election[]; parties: Party[]; candidates: Candidate[]
  options: PolicyOptionItem[]; assessments: Assessment[]
}) {
  const router = useRouter()
  const [mode, setMode] = useState<"party" | "candidate">("party")
  const [selectedId, setSelectedId] = useState("")
  const [filterElection, setFilterElection] = useState(elections[0]?.id || "")
  const [scores, setScores] = useState<Record<string, ScoreEntry>>({})
  const [loading, setLoading] = useState(false)

  const filteredParties = parties.filter((p) => p.electionId === filterElection)
  const filteredCandidates = candidates.filter((c) => c.electionId === filterElection)

  // Group options by category
  const groupedOptions = useMemo(() => {
    const groups: Record<string, { category: string; items: PolicyOptionItem[] }> = {}
    for (const opt of options) {
      const cat = opt.question.category.name
      if (!groups[cat]) groups[cat] = { category: cat, items: [] }
      groups[cat].items.push(opt)
    }
    return Object.values(groups)
  }, [options])

  // Load existing assessments when selection changes
  function loadAssessments(id: string) {
    setSelectedId(id)
    const existing: Record<string, ScoreEntry> = {}
    const key = mode === "party" ? "partyId" : "candidateId"
    for (const a of assessments) {
      if (a[key] === id) {
        existing[a.policyOptionId] = {
          policyOptionId: a.policyOptionId,
          agreementScore: a.agreementScore,
          evidence: a.evidence || "",
          sourceUrl: a.sourceUrl || "",
        }
      }
    }
    // Initialize empty entries for options not yet assessed
    for (const opt of options) {
      if (!existing[opt.id]) {
        existing[opt.id] = { policyOptionId: opt.id, agreementScore: 0, evidence: "", sourceUrl: "" }
      }
    }
    setScores(existing)
  }

  function updateScore(optionId: string, field: keyof ScoreEntry, value: string | number) {
    setScores((prev) => ({
      ...prev,
      [optionId]: { ...prev[optionId], [field]: value },
    }))
  }

  async function handleSave() {
    setLoading(true)
    try {
      const entries = Object.values(scores).map((s) => ({
        ...s,
        ...(mode === "party" ? { partyId: selectedId } : { candidateId: selectedId }),
      }))
      await fetch("/api/admin/assessments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assessments: entries }),
      })
      router.refresh()
    } finally { setLoading(false) }
  }

  const scoreColors: Record<string, string> = {
    "0": "bg-gray-200 text-gray-700",
    "1": "bg-orange-100 text-orange-700",
    "1.5": "bg-yellow-100 text-yellow-700",
    "2": "bg-green-100 text-green-700",
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessments</h1>
        <p className="text-muted-foreground">Score how parties and candidates align with each policy option.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        <Select value={filterElection} onValueChange={setFilterElection}>
          <SelectTrigger className="w-56"><SelectValue placeholder="Election" /></SelectTrigger>
          <SelectContent>{elections.map((el) => <SelectItem key={el.id} value={el.id}>{el.name}</SelectItem>)}</SelectContent>
        </Select>

        <Select value={mode} onValueChange={(v: "party" | "candidate") => { setMode(v); setSelectedId(""); setScores({}) }}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="party">Party</SelectItem>
            <SelectItem value="candidate">Candidate</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedId || "none"} onValueChange={(v) => v !== "none" && loadAssessments(v)}>
          <SelectTrigger className="w-64"><SelectValue placeholder={`Select ${mode}`} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">-- Select --</SelectItem>
            {mode === "party"
              ? filteredParties.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)
              : filteredCandidates.map((c) => <SelectItem key={c.id} value={c.id}>{c.name} ({c.electorate.name})</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {selectedId && Object.keys(scores).length > 0 && (
        <>
          {groupedOptions.map((group) => (
            <Card key={group.category}>
              <CardHeader><CardTitle>{group.category}</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {group.items.map((opt) => {
                  const entry = scores[opt.id]
                  if (!entry) return null
                  return (
                    <div key={opt.id} className="space-y-3 rounded-lg border p-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">{opt.question.questionText}</p>
                        <p className="font-medium">{opt.optionText}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[0, 1, 1.5, 2].map((score) => (
                          <button
                            key={score}
                            className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                              entry.agreementScore === score
                                ? scoreColors[String(score)]
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                            onClick={() => updateScore(opt.id, "agreementScore", score)}
                          >
                            {score}
                          </button>
                        ))}
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div className="space-y-1">
                          <Label className="text-xs">Evidence</Label>
                          <Input
                            value={entry.evidence}
                            onChange={(e) => updateScore(opt.id, "evidence", e.target.value)}
                            placeholder="Brief evidence or explanation"
                            className="text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Source URL</Label>
                          <Input
                            value={entry.sourceUrl}
                            onChange={(e) => updateScore(opt.id, "sourceUrl", e.target.value)}
                            placeholder="https://..."
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))}

          <div className="sticky bottom-4 flex justify-end">
            <Button size="lg" onClick={handleSave} disabled={loading}>
              <Save className="mr-2 h-4 w-4" />
              {loading ? "Saving..." : "Save All Assessments"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
