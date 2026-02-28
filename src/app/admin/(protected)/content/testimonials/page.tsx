import { prisma } from "@/lib/db"
import { TestimonialsClient } from "./testimonials-client"

export default async function TestimonialsPage() {
  const testimonials = await prisma.testimonial.findMany({ orderBy: { sortOrder: "asc" } })
  return <TestimonialsClient testimonials={JSON.parse(JSON.stringify(testimonials))} />
}
