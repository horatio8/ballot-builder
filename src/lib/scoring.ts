export interface MatchResult {
  candidateId?: string
  partyId?: string
  name: string
  matchPercentage: number
  matchPoints: number
  totalPoints: number
  color: 'green' | 'orange' | 'red' | 'grey'
  breakdown: {
    policyOptionId: string
    optionText: string
    categoryName: string
    userSelected: boolean
    agreementScore: number | null
    matched: boolean
    points: number
    maxPoints: number
  }[]
}

interface UserSelection {
  policyOptionId: string
  selected: boolean
}

interface Assessment {
  policyOptionId: string
  agreementScore: number
  candidateId?: string | null
  partyId?: string | null
}

interface PolicyOptionInfo {
  id: string
  optionText: string
  question: {
    category: {
      name: string
    }
  }
}

export function calculateMatchScores(
  userSelections: UserSelection[],
  assessments: Assessment[],
  policyOptions: PolicyOptionInfo[],
  greenThreshold: number = 70,
  orangeThreshold: number = 40
): Map<string, MatchResult> {
  const results = new Map<string, MatchResult>()

  // Group assessments by candidate/party
  const groupedAssessments = new Map<string, Assessment[]>()
  for (const a of assessments) {
    const key = a.candidateId || a.partyId || ''
    if (!groupedAssessments.has(key)) groupedAssessments.set(key, [])
    groupedAssessments.get(key)!.push(a)
  }

  // For each candidate/party, calculate match
  for (const [entityId, entityAssessments] of Array.from(groupedAssessments.entries())) {
    let matchPoints = 0
    let totalPoints = 0
    const breakdown: MatchResult['breakdown'] = []

    for (const userSel of userSelections) {
      const assessment = entityAssessments.find(a => a.policyOptionId === userSel.policyOptionId)
      const optionInfo = policyOptions.find(o => o.id === userSel.policyOptionId)

      if (!assessment || assessment.agreementScore < 0) {
        // No assessment for this option — show as unscored
        breakdown.push({
          policyOptionId: userSel.policyOptionId,
          optionText: optionInfo?.optionText || '',
          categoryName: optionInfo?.question?.category?.name || '',
          userSelected: userSel.selected,
          agreementScore: null,
          matched: false,
          points: 0,
          maxPoints: 0,
        })
        continue
      }

      totalPoints++

      // Match logic: if user selected and candidate agrees (score >= 1.5), or user didn't select and candidate disagrees (score <= 0.5)
      const userSupports = userSel.selected
      const candidateSupports = assessment.agreementScore >= 1.5
      const matched = userSupports === candidateSupports

      if (matched) matchPoints++

      breakdown.push({
        policyOptionId: userSel.policyOptionId,
        optionText: optionInfo?.optionText || '',
        categoryName: optionInfo?.question?.category?.name || '',
        userSelected: userSel.selected,
        agreementScore: assessment.agreementScore,
        matched,
        points: matched ? 1 : 0,
        maxPoints: 1,
      })
    }

    const matchPercentage = totalPoints > 0 ? Math.round((matchPoints / totalPoints) * 100) : -1
    let color: MatchResult['color'] = 'grey'
    if (matchPercentage >= 0) {
      if (matchPercentage >= greenThreshold) color = 'green'
      else if (matchPercentage >= orangeThreshold) color = 'orange'
      else color = 'red'
    }

    results.set(entityId, {
      candidateId: entityAssessments[0]?.candidateId || undefined,
      partyId: entityAssessments[0]?.partyId || undefined,
      name: '',
      matchPercentage,
      matchPoints,
      totalPoints,
      color,
      breakdown,
    })
  }

  return results
}
