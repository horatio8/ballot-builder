"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User,
  CheckCircle2,
  XCircle,
  MinusCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BreakdownItem {
  policyOptionId: string
  optionText: string
  categoryName: string
  userSelected: boolean
  agreementScore: number | null
  matched: boolean
  points: number
  maxPoints: number
}

interface MatchScoreCardProps {
  name: string
  photo?: string | null
  party?: { name: string; abbreviation?: string | null; color?: string | null } | null
  matchPercentage: number
  matchPoints: number
  totalPoints: number
  color: string
  breakdown: BreakdownItem[]
  website?: string | null
  votingRecordUrl?: string | null
  isIncumbent?: boolean
  isParty?: boolean
  settings: {
    matchGreenColor?: string | null
    matchOrangeColor?: string | null
    matchRedColor?: string | null
    matchGreyColor?: string | null
  }
}

export function MatchScoreCard({
  name,
  photo,
  party,
  matchPercentage,
  matchPoints,
  totalPoints,
  color,
  breakdown,
  website,
  votingRecordUrl,
  isIncumbent,
  isParty,
  settings,
}: MatchScoreCardProps) {
  const [expanded, setExpanded] = useState(false)

  const colorMap: Record<string, string> = {
    green: settings.matchGreenColor || "#22c55e",
    orange: settings.matchOrangeColor || "#f97316",
    red: settings.matchRedColor || "#ef4444",
    grey: settings.matchGreyColor || "#9ca3af",
  }

  const matchColor = colorMap[color] || colorMap.grey
  const displayPercentage = matchPercentage >= 0 ? `${Math.round(matchPercentage)}%` : "N/A"

  // Group breakdown by category
  const categories = breakdown.reduce<Record<string, BreakdownItem[]>>((acc, item) => {
    if (!acc[item.categoryName]) acc[item.categoryName] = []
    acc[item.categoryName].push(item)
    return acc
  }, {})

  return (
    <Card className="overflow-hidden transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-4">
          {/* Photo / Avatar */}
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-white text-lg font-bold"
            style={{ backgroundColor: party?.color || "#6b7280" }}
          >
            {photo ? (
              <img
                src={photo}
                alt={name}
                className="h-14 w-14 rounded-full object-cover"
              />
            ) : (
              <User className="h-7 w-7" />
            )}
          </div>

          {/* Name & Party */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-semibold">{name}</h3>
              {isIncumbent && (
                <Badge variant="outline" className="text-xs">
                  Incumbent
                </Badge>
              )}
            </div>
            {party && !isParty && (
              <p className="text-sm text-muted-foreground">
                {party.name}
                {party.abbreviation && ` (${party.abbreviation})`}
              </p>
            )}
            {isParty && party?.abbreviation && (
              <p className="text-sm text-muted-foreground">{party.abbreviation}</p>
            )}
          </div>

          {/* Match Score Circle */}
          <div className="flex flex-col items-center shrink-0">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-4 font-bold text-lg"
              style={{ borderColor: matchColor, color: matchColor }}
            >
              {displayPercentage}
            </div>
            <span className="mt-1 text-xs text-muted-foreground">
              {matchPoints}/{totalPoints} pts
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Website
            </a>
          )}
          {votingRecordUrl && (
            <a
              href={votingRecordUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" />
              Voting Record
            </a>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Progress Bar */}
        <div className="mb-3">
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full transition-all duration-500"
              style={{
                width: matchPercentage >= 0 ? `${matchPercentage}%` : "0%",
                backgroundColor: matchColor,
              }}
            />
          </div>
        </div>

        {/* Expand Button */}
        {breakdown.length > 0 && (
          <>
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="mr-2 h-4 w-4" />
                  Hide breakdown
                </>
              ) : (
                <>
                  <ChevronDown className="mr-2 h-4 w-4" />
                  View breakdown
                </>
              )}
            </Button>

            {expanded && (
              <div className="mt-4 space-y-4">
                {Object.entries(categories).map(([categoryName, items]) => (
                  <div key={categoryName}>
                    <h4 className="mb-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                      {categoryName}
                    </h4>
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div
                          key={item.policyOptionId}
                          className={cn(
                            "flex items-start gap-2 rounded-md border p-2 text-sm",
                            item.matched
                              ? "border-green-200 bg-green-50"
                              : item.agreementScore === null
                                ? "border-gray-200 bg-gray-50"
                                : "border-red-200 bg-red-50"
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            {item.matched ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : item.agreementScore === null ? (
                              <MinusCircle className="h-4 w-4 text-gray-400" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium">{item.optionText}</p>
                            <p className="text-xs text-muted-foreground">
                              You: {item.userSelected ? "Selected" : "Not selected"}
                              {item.agreementScore !== null && (
                                <> &middot; Score: {item.agreementScore}/2</>
                              )}
                            </p>
                          </div>
                          <span className="text-xs font-medium shrink-0">
                            {item.points}/{item.maxPoints}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
