import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { electionId, electorateId, selections } = body

    if (!electionId || !electorateId || !selections) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create a session
    const session = await prisma.userSession.create({
      data: { electorateId },
    })

    // Save all responses
    const responseData = Object.entries(selections).map(([policyOptionId, selected]) => ({
      sessionId: session.id,
      policyOptionId,
      selected: selected as boolean,
    }))

    if (responseData.length > 0) {
      await prisma.userResponse.createMany({ data: responseData })
    }

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    console.error('Submit questionnaire error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
