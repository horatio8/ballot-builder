"use client"

import { useState, useCallback, useRef } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  GripVertical,
  Download,
  Mail,
  User,
  Camera,
  Printer,
  RotateCcw,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CandidateItem {
  id: string
  name: string
  photo: string | null
  isIncumbent: boolean
  party: {
    id: string
    name: string
    abbreviation: string | null
    color: string | null
  } | null
}

interface PartyItem {
  id: string
  name: string
  abbreviation: string | null
  color: string | null
}

interface BallotBuilderProps {
  candidates: CandidateItem[]
  parties: PartyItem[]
  electorate: { id: string; name: string; type: string } | null
  election: { name: string; state: string; date: string }
  siteName: string
}

function SortableCandidate({
  candidate,
  index,
}: {
  candidate: CandidateItem
  index: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: candidate.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background p-3 transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/50 z-10"
      )}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      {/* Preference Number */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
        {index + 1}
      </div>

      {/* Candidate Photo / Avatar */}
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white"
        style={{ backgroundColor: candidate.party?.color || "#6b7280" }}
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

      {/* Candidate Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{candidate.name}</p>
        {candidate.party && (
          <p className="text-xs text-muted-foreground truncate">
            {candidate.party.name}
          </p>
        )}
      </div>

      {candidate.isIncumbent && (
        <Badge variant="outline" className="text-xs shrink-0">
          Inc.
        </Badge>
      )}
    </div>
  )
}

function SortableParty({
  party,
  index,
}: {
  party: PartyItem
  index: number
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: party.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-background p-3 transition-shadow",
        isDragging && "shadow-lg ring-2 ring-primary/50 z-10"
      )}
    >
      <button
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-5 w-5" />
      </button>

      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
        {index + 1}
      </div>

      <div
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: party.color || "#6b7280" }}
      />

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{party.name}</p>
        {party.abbreviation && (
          <p className="text-xs text-muted-foreground">{party.abbreviation}</p>
        )}
      </div>
    </div>
  )
}

export function BallotBuilder({
  candidates: initialCandidates,
  parties: initialParties,
  electorate,
  election,
  siteName,
}: BallotBuilderProps) {
  const [candidateOrder, setCandidateOrder] = useState(initialCandidates)
  const [partyOrder, setPartyOrder] = useState(initialParties)
  const [email, setEmail] = useState("")
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const ballotRef = useRef<HTMLDivElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleCandidateDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        setCandidateOrder((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id)
          const newIndex = items.findIndex((i) => i.id === over.id)
          return arrayMove(items, oldIndex, newIndex)
        })
      }
    },
    []
  )

  const handlePartyDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (over && active.id !== over.id) {
        setPartyOrder((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id)
          const newIndex = items.findIndex((i) => i.id === over.id)
          return arrayMove(items, oldIndex, newIndex)
        })
      }
    },
    []
  )

  const resetOrder = () => {
    setCandidateOrder(initialCandidates)
    setPartyOrder(initialParties)
  }

  const handleScreenshot = async () => {
    if (!ballotRef.current) return
    try {
      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(ballotRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      })
      const link = document.createElement("a")
      link.download = `my-ballot-${election.state.toLowerCase()}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()
    } catch (err) {
      console.error("Screenshot failed:", err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleEmail = async () => {
    if (!email) return
    setSending(true)
    try {
      // In a full app, this would send via the server
      // For now, create a mailto link with ballot summary
      const candidateList = candidateOrder
        .map((c, i) => `${i + 1}. ${c.name} (${c.party?.name || "Independent"})`)
        .join("\n")
      const partyList = partyOrder
        .map((p, i) => `${i + 1}. ${p.name}`)
        .join("\n")

      const body = encodeURIComponent(
        `My Ballot Plan - ${election.name}\n\n` +
          `Electorate: ${electorate?.name || "Not selected"}\n\n` +
          `Lower House:\n${candidateList}\n\n` +
          `Upper House:\n${partyList}\n\n` +
          `Generated by ${siteName}`
      )
      const subject = encodeURIComponent(`My Ballot Plan - ${election.name}`)
      window.open(`mailto:${email}?subject=${subject}&body=${body}`)
      setSent(true)
    } catch (err) {
      console.error("Email failed:", err)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Instructions */}
      <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-center">
        <p className="text-sm text-muted-foreground">
          Drag and drop to order your preferences. Number 1 is your top preference.
          When you&apos;re happy with your ballot, save it as an image or email it to yourself.
        </p>
      </div>

      <div ref={ballotRef} className="space-y-8 print:space-y-4">
        {/* Header for screenshot/print */}
        <div className="hidden print:block text-center mb-4">
          <h2 className="text-xl font-bold">{siteName} - Ballot Plan</h2>
          <p className="text-sm">{election.name} | {electorate?.name}</p>
        </div>

        {/* Lower House */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Lower House{electorate ? ` — ${electorate.name}` : ""}</span>
              <Badge variant="secondary">{candidateOrder.length} candidates</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {candidateOrder.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No candidates found for your electorate.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleCandidateDragEnd}
              >
                <SortableContext
                  items={candidateOrder.map((c) => c.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {candidateOrder.map((candidate, index) => (
                      <SortableCandidate
                        key={candidate.id}
                        candidate={candidate}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>

        {/* Upper House */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Upper House — Parties</span>
              <Badge variant="secondary">{partyOrder.length} parties</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {partyOrder.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No parties available.
              </p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePartyDragEnd}
              >
                <SortableContext
                  items={partyOrder.map((p) => p.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {partyOrder.map((party, index) => (
                      <SortableParty key={party.id} party={party} index={index} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Save Your Ballot</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleScreenshot} variant="outline">
              <Camera className="mr-2 h-4 w-4" />
              Save as Image
            </Button>
            <Button onClick={handlePrint} variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <Button onClick={resetOrder} variant="ghost">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Order
            </Button>
          </div>

          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleEmail} disabled={!email || sending}>
              <Mail className="mr-2 h-4 w-4" />
              {sent ? "Sent!" : "Email"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
