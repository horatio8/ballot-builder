import { prisma } from "@/lib/db"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const metadata = {
  title: "FAQ - Build a Ballot",
  description: "Frequently asked questions about Build a Ballot.",
}

export default async function FAQPage() {
  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: "asc" },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-2 text-muted-foreground">
          Got questions? We&apos;ve got answers. If you can&apos;t find what you&apos;re
          looking for, get in touch.
        </p>
      </div>

      {faqs.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">
          No FAQs available yet. Check back later.
        </p>
      ) : (
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id}>
              <AccordionTrigger className="text-left">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent>
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
