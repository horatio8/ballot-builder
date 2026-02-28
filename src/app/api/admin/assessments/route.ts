import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const assessments = await prisma.candidateAssessment.findMany({
      include: { candidate: true, party: true, policyOption: { include: { question: true } } },
    })
    return NextResponse.json(assessments)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const entries = body.assessments as Array<{
      policyOptionId: string
      agreementScore: number
      evidence?: string
      sourceUrl?: string
      candidateId?: string
      partyId?: string
    }>

    // Bulk upsert: delete existing assessments for this entity, then create new ones
    const firstEntry = entries[0]
    if (!firstEntry) return NextResponse.json({ error: "No assessments provided" }, { status: 400 })

    const isParty = !!firstEntry.partyId
    const entityId = isParty ? firstEntry.partyId! : firstEntry.candidateId!

    await prisma.$transaction(async (tx) => {
      // Delete existing assessments for this entity
      if (isParty) {
        await tx.candidateAssessment.deleteMany({ where: { partyId: entityId } })
      } else {
        await tx.candidateAssessment.deleteMany({ where: { candidateId: entityId } })
      }

      // Create all new assessments (skip entries with score 0 and no evidence)
      const toCreate = entries.filter((e) => e.agreementScore > 0 || e.evidence || e.sourceUrl)
      if (toCreate.length > 0) {
        await tx.candidateAssessment.createMany({
          data: toCreate.map((e) => ({
            policyOptionId: e.policyOptionId,
            agreementScore: e.agreementScore,
            evidence: e.evidence || null,
            sourceUrl: e.sourceUrl || null,
            candidateId: isParty ? null : entityId,
            partyId: isParty ? entityId : null,
          })),
        })
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save assessments" }, { status: 500 })
  }
}
