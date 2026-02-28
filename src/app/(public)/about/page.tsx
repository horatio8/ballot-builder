import { prisma } from "@/lib/db"

export const metadata = {
  title: "About - Build a Ballot",
  description: "Learn about Build a Ballot and our mission.",
}

export default async function AboutPage() {
  const page = await prisma.page.findUnique({
    where: { slug: "about" },
  })

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold font-heading md:text-4xl">
          {page?.title || "About Us"}
        </h1>
      </div>

      {page ? (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <div className="prose prose-lg max-w-none">
          <p>
            Build a Ballot is a non-partisan voter information tool designed to help
            Australians make informed decisions at the ballot box.
          </p>
          <p>
            Our tool matches your policy preferences with candidates and parties,
            helping you understand where they stand on the issues that matter most to you.
          </p>
          <h2>How it works</h2>
          <ol>
            <li>
              <strong>Discover</strong> — Answer a series of policy questions to tell us
              what matters to you.
            </li>
            <li>
              <strong>Build</strong> — See which candidates and parties match your views,
              then build your personalised ballot plan.
            </li>
            <li>
              <strong>Save</strong> — Download, print, or email your ballot plan to take
              with you on election day.
            </li>
          </ol>
          <h2>Our principles</h2>
          <ul>
            <li>Non-partisan and independent</li>
            <li>Evidence-based assessments</li>
            <li>Full transparency in our methodology</li>
            <li>Respect for voter privacy — no login required</li>
          </ul>
        </div>
      )}
    </div>
  )
}
