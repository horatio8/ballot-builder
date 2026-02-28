import Link from 'next/link'
import { prisma } from '@/lib/db'
import { TestimonialCarousel } from '@/components/public/TestimonialCarousel'
import { formatDate } from '@/lib/utils'

export default async function HomePage() {
  const settings = await prisma.siteSettings.findFirst({ where: { id: 'singleton' } })
  const election = await prisma.election.findFirst({ where: { isActive: true } })
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary to-secondary text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight mb-6">
              Everything you need to get election day ready
            </h1>
            {election && (
              <p className="text-xl md:text-2xl text-white/80 mb-4">
                {election.state}, your election is on{' '}
                <span className="text-white font-semibold">{formatDate(election.date)}</span>!
              </p>
            )}
            <p className="text-lg text-white/70 mb-8">
              {settings?.tagline || 'A simple tool to help you build your ballot before election day.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/questionnaire"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-primary rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Build Your Ballot
              </Link>
              <Link
                href="/research"
                className="inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-full text-lg font-semibold hover:bg-white/10 transition-colors"
              >
                Research Candidates
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to build your personalised voting plan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: '1',
                title: 'Discover',
                description:
                  "Answer a short questionnaire about the issues that matter to you. Tell us what you'd do if you were in charge.",
                icon: '🔍',
              },
              {
                step: '2',
                title: 'Build',
                description:
                  'See how candidates and parties match your priorities. Drag and drop to create your personalised ballot.',
                icon: '🏗️',
              },
              {
                step: '3',
                title: 'Save',
                description:
                  'Screenshot or email your ballot plan to yourself. Take it to the polling booth on election day.',
                icon: '💾',
              },
            ].map((item) => (
              <div key={item.step} className="text-center group">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary/5 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform">
                  {item.icon}
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/questionnaire"
              className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white rounded-full text-base font-semibold hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">🎓</div>
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">Elections 101</h3>
              <p className="text-gray-600 text-sm mb-4">
                New to voting? We break down the basics — no jargon, no gatekeeping. Just clear answers.
              </p>
              <Link href="/elections-101" className="text-primary text-sm font-medium hover:underline">
                Learn more →
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">🔬</div>
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">Research Hub</h3>
              <p className="text-gray-600 text-sm mb-4">
                Find your local candidates, explore their positions, and access voting resources and scorecards.
              </p>
              <Link href="/research" className="text-primary text-sm font-medium hover:underline">
                Explore →
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <div className="text-3xl mb-4">🔍</div>
              <h3 className="text-lg font-heading font-bold text-gray-900 mb-2">Transparency</h3>
              <p className="text-gray-600 text-sm mb-4">
                See our methodology, assessment process, and every candidate score — fully transparent.
              </p>
              <Link href="/transparency" className="text-primary text-sm font-medium hover:underline">
                View centre →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">
                Trusted by Australians
              </h2>
            </div>
            <TestimonialCarousel testimonials={testimonials} />
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
            Ready to build your ballot?
          </h2>
          <p className="text-lg text-white/70 mb-8">
            It only takes a few minutes. No personal information required.
          </p>
          <Link
            href="/questionnaire"
            className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary rounded-full text-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Start Now
          </Link>
        </div>
      </section>
    </div>
  )
}
