'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react'

interface Testimonial {
  id: string
  quote: string
  author: string
  role?: string | null
}

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [current, setCurrent] = useState(0)
  const pageSize = 3
  const totalPages = Math.ceil(testimonials.length / pageSize)

  const next = () => setCurrent((c) => (c + 1) % totalPages)
  const prev = () => setCurrent((c) => (c - 1 + totalPages) % totalPages)

  const visible = testimonials.slice(current * pageSize, (current + 1) * pageSize)

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {visible.map((t) => (
          <div
            key={t.id}
            className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative"
          >
            <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/10" />
            <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="text-sm">
              <span className="font-semibold text-gray-900">{t.author}</span>
              {t.role && <span className="text-gray-500 ml-1">· {t.role}</span>}
            </div>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button onClick={prev} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Previous">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex gap-1.5">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-primary' : 'bg-gray-300'}`}
                aria-label={`Page ${i + 1}`}
              />
            ))}
          </div>
          <button onClick={next} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Next">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  )
}
