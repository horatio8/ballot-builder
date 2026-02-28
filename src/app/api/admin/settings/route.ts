import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {},
      update: {},
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await request.json()
    const settings = await prisma.siteSettings.upsert({
      where: { id: "singleton" },
      create: {
        siteName: body.siteName,
        tagline: body.tagline,
        logo: body.logo,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        matchGreenColor: body.matchGreenColor,
        matchOrangeColor: body.matchOrangeColor,
        matchRedColor: body.matchRedColor,
        matchGreyColor: body.matchGreyColor,
        greenThreshold: body.greenThreshold,
        orangeThreshold: body.orangeThreshold,
        fontHeading: body.fontHeading,
        fontBody: body.fontBody,
        footerText: body.footerText,
        socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
        analyticsId: body.analyticsId,
      },
      update: {
        siteName: body.siteName,
        tagline: body.tagline,
        logo: body.logo,
        primaryColor: body.primaryColor,
        secondaryColor: body.secondaryColor,
        accentColor: body.accentColor,
        matchGreenColor: body.matchGreenColor,
        matchOrangeColor: body.matchOrangeColor,
        matchRedColor: body.matchRedColor,
        matchGreyColor: body.matchGreyColor,
        greenThreshold: body.greenThreshold,
        orangeThreshold: body.orangeThreshold,
        fontHeading: body.fontHeading,
        fontBody: body.fontBody,
        footerText: body.footerText,
        socialLinks: body.socialLinks ? JSON.stringify(body.socialLinks) : null,
        analyticsId: body.analyticsId,
      },
    })
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 })
  }
}
