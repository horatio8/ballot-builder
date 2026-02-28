import { prisma } from "@/lib/db"
import { ContentPagesClient } from "./content-client"

export default async function ContentPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { updatedAt: "desc" } })
  return <ContentPagesClient pages={JSON.parse(JSON.stringify(pages))} />
}
