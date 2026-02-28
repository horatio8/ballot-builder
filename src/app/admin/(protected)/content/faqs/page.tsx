import { prisma } from "@/lib/db"
import { FAQsClient } from "./faqs-client"

export default async function FAQsPage() {
  const faqs = await prisma.fAQ.findMany({ orderBy: { sortOrder: "asc" } })
  return <FAQsClient faqs={JSON.parse(JSON.stringify(faqs))} />
}
