import { prisma } from "@/lib/db"
import { BrandingClient } from "./branding-client"

export default async function BrandingPage() {
  // Upsert singleton settings row
  const settings = await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: {},
    update: {},
  })
  const serialized = JSON.parse(JSON.stringify(settings))
  if (serialized.socialLinks && typeof serialized.socialLinks === 'string') {
    try { serialized.socialLinks = JSON.parse(serialized.socialLinks) } catch { serialized.socialLinks = null }
  }
  return <BrandingClient settings={serialized} />
}
