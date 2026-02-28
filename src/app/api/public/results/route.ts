import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { calculateMatchScores } from '@/lib/scoring'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
      include: {
        responses: {
          include: {
            policyOption: {
              include: {
                question: {
                  include: { category: true },
                },
              },
            },
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
    const greenThreshold = settings?.greenThreshold || 70
    const orangeThreshold = settings?.orangeThreshold || 40

    // Get all policy option IDs from user responses
    const optionIds = session.responses.map((r) => r.policyOptionId)

    // Get candidates in user's electorate
    const candidates = await prisma.candidate.findMany({
      where: { electorateId: session.electorateId || undefined },
      include: {
        party: true,
        assessments: {
          where: { policyOptionId: { in: optionIds } },
        },
      },
    })

    // Get party assessments (for upper house)
    const election = await prisma.election.findFirst({ where: { isActive: true } })
    const parties = await prisma.party.findMany({
      where: { electionId: election?.id },
      include: {
        assessments: {
          where: { policyOptionId: { in: optionIds } },
        },
      },
    })

    const userSelections = session.responses.map((r) => ({
      policyOptionId: r.policyOptionId,
      selected: r.selected,
    }))

    const policyOptions = session.responses.map((r) => ({
      id: r.policyOption.id,
      optionText: r.policyOption.optionText,
      question: {
        category: {
          name: r.policyOption.question.category.name,
        },
      },
    }))

    // Calculate candidate matches
    const candidateAssessments = candidates.flatMap((c) =>
      c.assessments.map((a) => ({
        policyOptionId: a.policyOptionId,
        agreementScore: a.agreementScore,
        candidateId: c.id,
        partyId: null,
      }))
    )

    const candidateScores = calculateMatchScores(
      userSelections,
      candidateAssessments,
      policyOptions,
      greenThreshold,
      orangeThreshold
    )

    // Calculate party matches
    const partyAssessments = parties.flatMap((p) =>
      p.assessments.map((a) => ({
        policyOptionId: a.policyOptionId,
        agreementScore: a.agreementScore,
        candidateId: null,
        partyId: p.id,
      }))
    )

    const partyScores = calculateMatchScores(
      userSelections,
      partyAssessments,
      policyOptions,
      greenThreshold,
      orangeThreshold
    )

    // Build results
    const candidateResults = candidates.map((c) => {
      const score = candidateScores.get(c.id)
      return {
        id: c.id,
        name: c.name,
        photo: c.photo,
        website: c.website,
        votingRecordUrl: c.votingRecordUrl,
        isIncumbent: c.isIncumbent,
        party: c.party ? { id: c.party.id, name: c.party.name, abbreviation: c.party.abbreviation, color: c.party.color } : null,
        matchPercentage: score?.matchPercentage ?? -1,
        matchPoints: score?.matchPoints ?? 0,
        totalPoints: score?.totalPoints ?? 0,
        color: score?.color ?? 'grey',
        breakdown: score?.breakdown ?? [],
      }
    }).sort((a, b) => b.matchPercentage - a.matchPercentage)

    const partyResults = parties.map((p) => {
      const score = partyScores.get(p.id)
      return {
        id: p.id,
        name: p.name,
        abbreviation: p.abbreviation,
        color: p.color,
        website: p.website,
        matchPercentage: score?.matchPercentage ?? -1,
        matchPoints: score?.matchPoints ?? 0,
        totalPoints: score?.totalPoints ?? 0,
        matchColor: score?.color ?? 'grey',
        breakdown: score?.breakdown ?? [],
      }
    }).sort((a, b) => b.matchPercentage - a.matchPercentage)

    return NextResponse.json({
      candidates: candidateResults,
      parties: partyResults,
      settings: {
        greenThreshold,
        orangeThreshold,
        matchGreenColor: settings?.matchGreenColor,
        matchOrangeColor: settings?.matchOrangeColor,
        matchRedColor: settings?.matchRedColor,
        matchGreyColor: settings?.matchGreyColor,
      },
    })
  } catch (error) {
    console.error('Results error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
