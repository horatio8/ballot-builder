import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('sessionId')
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = await prisma.userSession.findUnique({
      where: { id: sessionId },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const election = await prisma.election.findFirst({ where: { isActive: true } })
    if (!election) {
      return NextResponse.json({ error: 'No active election' }, { status: 404 })
    }

    // Get candidates in user's electorate (lower house)
    const candidates = await prisma.candidate.findMany({
      where: { electorateId: session.electorateId || undefined },
      include: { party: true },
      orderBy: { name: 'asc' },
    })

    // Get electorate info
    const electorate = session.electorateId
      ? await prisma.electorate.findUnique({ where: { id: session.electorateId } })
      : null

    // Get all parties for upper house
    const parties = await prisma.party.findMany({
      where: { electionId: election.id },
      orderBy: { name: 'asc' },
    })

    // Get match scores from results API for reference
    const settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })

    return NextResponse.json({
      election: {
        id: election.id,
        name: election.name,
        state: election.state,
        date: election.date,
      },
      electorate: electorate
        ? { id: electorate.id, name: electorate.name, type: electorate.type }
        : null,
      candidates: candidates.map((c) => ({
        id: c.id,
        name: c.name,
        photo: c.photo,
        isIncumbent: c.isIncumbent,
        party: c.party
          ? { id: c.party.id, name: c.party.name, abbreviation: c.party.abbreviation, color: c.party.color }
          : null,
      })),
      parties: parties.map((p) => ({
        id: p.id,
        name: p.name,
        abbreviation: p.abbreviation,
        color: p.color,
      })),
      settings: {
        siteName: settings?.siteName || 'Build a Ballot',
      },
    })
  } catch (error) {
    console.error('Ballot data error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
