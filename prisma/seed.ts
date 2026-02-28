import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🗳️  Seeding database...")

  // Clean existing data
  await prisma.userResponse.deleteMany()
  await prisma.userSession.deleteMany()
  await prisma.candidateAssessment.deleteMany()
  await prisma.policyOption.deleteMany()
  await prisma.policyQuestion.deleteMany()
  await prisma.policyCategory.deleteMany()
  await prisma.candidate.deleteMany()
  await prisma.party.deleteMany()
  await prisma.electorate.deleteMany()
  await prisma.election.deleteMany()
  await prisma.fAQ.deleteMany()
  await prisma.article.deleteMany()
  await prisma.page.deleteMany()
  await prisma.testimonial.deleteMany()
  await prisma.navItem.deleteMany()
  await prisma.siteSettings.deleteMany()

  // ==================== SITE SETTINGS ====================
  const settings = await prisma.siteSettings.create({
    data: {
      id: "singleton",
      siteName: "Build a Ballot",
      tagline: "A simple tool to help you build your ballot before election day",
      primaryColor: "#1a1a2e",
      secondaryColor: "#16213e",
      accentColor: "#e94560",
      matchGreenColor: "#22c55e",
      matchOrangeColor: "#f97316",
      matchRedColor: "#ef4444",
      matchGreyColor: "#9ca3af",
      greenThreshold: 70,
      orangeThreshold: 40,
      fontHeading: "Libre Baskerville",
      fontBody: "Libre Franklin",
      footerText: "Build a Ballot is a non-partisan voter information tool. We do not endorse or oppose any candidate or party.",
      socialLinks: JSON.stringify({
        twitter: "https://twitter.com/buildaballot",
        facebook: "https://facebook.com/buildaballot",
        instagram: "https://instagram.com/buildaballot",
      }),
    },
  })

  // ==================== ELECTION ====================
  const election = await prisma.election.create({
    data: {
      name: "2026 South Australia State Election",
      state: "SA",
      date: new Date("2026-03-21"),
      enrollmentDeadline: new Date("2026-02-28"),
      description: "The South Australian state election for the 55th Parliament.",
      isActive: true,
    },
  })

  // ==================== PARTIES ====================
  const partyData = [
    { name: "Australian Labor Party", abbreviation: "ALP", color: "#E53935", website: "https://www.salabor.org.au" },
    { name: "Liberal Party of Australia", abbreviation: "LIB", color: "#1565C0", website: "https://www.saliberal.org.au" },
    { name: "The Greens (SA)", abbreviation: "GRN", color: "#4CAF50", website: "https://greens.org.au/sa" },
    { name: "SA-BEST", abbreviation: "SAB", color: "#FF9800", website: "https://www.sabest.org.au" },
    { name: "One Nation", abbreviation: "ONP", color: "#FF5722", website: "https://www.onenation.org.au" },
    { name: "Family First", abbreviation: "FFP", color: "#7B1FA2", website: "https://www.familyfirst.org.au" },
    { name: "Animal Justice Party", abbreviation: "AJP", color: "#66BB6A", website: "https://animaljusticeparty.org" },
    { name: "Independent", abbreviation: "IND", color: "#78909C", website: null },
  ]

  const parties: Record<string, Awaited<ReturnType<typeof prisma.party.create>>> = {}
  for (const p of partyData) {
    parties[p.abbreviation] = await prisma.party.create({
      data: { ...p, electionId: election.id },
    })
  }

  // ==================== ELECTORATES ====================
  const electorateNames = [
    "Adelaide", "Badcoe", "Black", "Bragg", "Cheltenham",
    "Colton", "Croydon", "Davenport", "Dunstan", "Elder",
    "Enfield", "Frome", "Gibson", "Hartley", "Heysen",
    "Hurtle Vale", "Kavel", "King", "Lee", "Light",
    "MacKillop", "Mawson", "Morphett", "Mount Gambier", "Newland",
    "Norwood", "Playford", "Port Adelaide", "Ramsay", "Reynell",
    "Schubert", "Stuart", "Taylor", "Torrens", "Unley",
    "Waite", "West Torrens", "Wright",
  ]

  const electorates: Record<string, Awaited<ReturnType<typeof prisma.electorate.create>>> = {}
  for (const name of electorateNames) {
    electorates[name] = await prisma.electorate.create({
      data: {
        name,
        state: "SA",
        type: "lower",
        electionId: election.id,
      },
    })
  }

  // Add upper house electorate
  electorates["SA Upper House"] = await prisma.electorate.create({
    data: {
      name: "SA Upper House",
      state: "SA",
      type: "upper",
      electionId: election.id,
    },
  })

  // ==================== CANDIDATES ====================
  const candidateData = [
    // Adelaide
    { name: "Lucy Hood", party: "ALP", electorate: "Adelaide", isIncumbent: true },
    { name: "Michael Chen", party: "LIB", electorate: "Adelaide", isIncumbent: false },
    { name: "Sarah Green", party: "GRN", electorate: "Adelaide", isIncumbent: false },
    { name: "Tom Watson", party: "SAB", electorate: "Adelaide", isIncumbent: false },
    // Badcoe
    { name: "Jayne Stinson", party: "ALP", electorate: "Badcoe", isIncumbent: true },
    { name: "Daniel Harris", party: "LIB", electorate: "Badcoe", isIncumbent: false },
    { name: "Emma Patel", party: "GRN", electorate: "Badcoe", isIncumbent: false },
    // Black
    { name: "David Speirs", party: "LIB", electorate: "Black", isIncumbent: true },
    { name: "Rebecca Santos", party: "ALP", electorate: "Black", isIncumbent: false },
    { name: "Mark Johnston", party: "GRN", electorate: "Black", isIncumbent: false },
    // Bragg
    { name: "Jack Batty", party: "LIB", electorate: "Bragg", isIncumbent: true },
    { name: "Priya Sharma", party: "ALP", electorate: "Bragg", isIncumbent: false },
    { name: "Alex Kim", party: "GRN", electorate: "Bragg", isIncumbent: false },
    { name: "Olivia Moore", party: "IND", electorate: "Bragg", isIncumbent: false },
    // Cheltenham
    { name: "Joe Szakacs", party: "ALP", electorate: "Cheltenham", isIncumbent: true },
    { name: "William Parker", party: "LIB", electorate: "Cheltenham", isIncumbent: false },
    // Colton
    { name: "Matt Cowdrey", party: "LIB", electorate: "Colton", isIncumbent: true },
    { name: "Sophie Williams", party: "ALP", electorate: "Colton", isIncumbent: false },
    { name: "Jane Thompson", party: "GRN", electorate: "Colton", isIncumbent: false },
    // Dunstan
    { name: "Steven Marshall", party: "LIB", electorate: "Dunstan", isIncumbent: true },
    { name: "Cressida O'Hanlon", party: "ALP", electorate: "Dunstan", isIncumbent: false },
    { name: "Robert Simms", party: "GRN", electorate: "Dunstan", isIncumbent: false },
    // Elder
    { name: "Nadia Clancy", party: "ALP", electorate: "Elder", isIncumbent: true },
    { name: "James Wright", party: "LIB", electorate: "Elder", isIncumbent: false },
    // Enfield
    { name: "Andrea Michaels", party: "ALP", electorate: "Enfield", isIncumbent: true },
    { name: "Peter Nguyen", party: "LIB", electorate: "Enfield", isIncumbent: false },
    // Frome
    { name: "Geoff Brock", party: "IND", electorate: "Frome", isIncumbent: true },
    { name: "Helen Davies", party: "ALP", electorate: "Frome", isIncumbent: false },
    { name: "Robert Clarke", party: "LIB", electorate: "Frome", isIncumbent: false },
    // Port Adelaide
    { name: "Susan Close", party: "ALP", electorate: "Port Adelaide", isIncumbent: true },
    { name: "Chris Anderson", party: "LIB", electorate: "Port Adelaide", isIncumbent: false },
    { name: "Maya Singh", party: "GRN", electorate: "Port Adelaide", isIncumbent: false },
    // Torrens
    { name: "Dana Wortley", party: "ALP", electorate: "Torrens", isIncumbent: true },
    { name: "Patrick O'Brien", party: "LIB", electorate: "Torrens", isIncumbent: false },
    // Unley
    { name: "David Pisoni", party: "LIB", electorate: "Unley", isIncumbent: true },
    { name: "Rachel Lee", party: "ALP", electorate: "Unley", isIncumbent: false },
    { name: "Sam Taylor", party: "GRN", electorate: "Unley", isIncumbent: false },
  ]

  const candidates: Array<Awaited<ReturnType<typeof prisma.candidate.create>>> = []
  for (const c of candidateData) {
    const candidate = await prisma.candidate.create({
      data: {
        name: c.name,
        isIncumbent: c.isIncumbent,
        partyId: parties[c.party]?.id || null,
        electorateId: electorates[c.electorate].id,
        electionId: election.id,
      },
    })
    candidates.push(candidate)
  }

  // ==================== POLICY CATEGORIES & QUESTIONS ====================
  const categoryData = [
    {
      name: "Housing",
      description: "Policies related to housing affordability, rental market, and homelessness.",
      icon: "🏠",
      questions: [
        {
          questionText: "What approach should the government take on housing affordability?",
          options: [
            { text: "Increase public housing stock significantly", score: "left" },
            { text: "Provide tax incentives for first home buyers", score: "center" },
            { text: "Reduce regulations to encourage private development", score: "right" },
            { text: "Implement rent caps and stronger tenant protections", score: "left" },
          ],
        },
        {
          questionText: "How should the government address homelessness?",
          options: [
            { text: "Invest heavily in emergency and transitional housing", score: "left" },
            { text: "Focus on mental health and addiction services", score: "center" },
            { text: "Support community and faith-based organisations", score: "right" },
          ],
        },
      ],
    },
    {
      name: "Climate & Environment",
      description: "Policies on climate change, renewable energy, and environmental protection.",
      icon: "🌿",
      questions: [
        {
          questionText: "What should SA's approach to renewable energy be?",
          options: [
            { text: "100% renewable energy target by 2030", score: "left" },
            { text: "Gradual transition with a mix of energy sources", score: "center" },
            { text: "Maintain existing energy mix and reduce energy costs", score: "right" },
          ],
        },
        {
          questionText: "How should the government protect the environment?",
          options: [
            { text: "Ban native vegetation clearing and strengthen protections", score: "left" },
            { text: "Balance environmental protection with economic development", score: "center" },
            { text: "Streamline environmental regulations for businesses", score: "right" },
          ],
        },
      ],
    },
    {
      name: "Health",
      description: "Policies related to the public health system, hospitals, and wellbeing.",
      icon: "🏥",
      questions: [
        {
          questionText: "What is the priority for health spending?",
          options: [
            { text: "Increase funding for public hospitals and reduce wait times", score: "left" },
            { text: "Invest in preventive health and mental health services", score: "center" },
            { text: "Encourage private health insurance and reduce public costs", score: "right" },
          ],
        },
        {
          questionText: "How should mental health be addressed?",
          options: [
            { text: "Create a dedicated mental health ministry with significant funding", score: "left" },
            { text: "Expand existing mental health programs in schools and communities", score: "center" },
            { text: "Rely on GPs and private practitioners with Medicare support", score: "right" },
          ],
        },
      ],
    },
    {
      name: "Education",
      description: "Policies on schools, universities, TAFE, and training.",
      icon: "📚",
      questions: [
        {
          questionText: "Where should education funding be directed?",
          options: [
            { text: "Increase funding for public schools and reduce class sizes", score: "left" },
            { text: "Fund both public and private schools equally per student", score: "center" },
            { text: "Give families more choice through school vouchers", score: "right" },
          ],
        },
      ],
    },
    {
      name: "Economy & Jobs",
      description: "Policies related to economic growth, employment, and cost of living.",
      icon: "💼",
      questions: [
        {
          questionText: "How should the government stimulate the economy?",
          options: [
            { text: "Invest in public infrastructure and green jobs", score: "left" },
            { text: "Provide tax cuts and reduce business regulations", score: "right" },
            { text: "Support small business through grants and mentorship", score: "center" },
          ],
        },
        {
          questionText: "How should cost of living pressures be addressed?",
          options: [
            { text: "Increase minimum wage and welfare payments", score: "left" },
            { text: "Reduce taxes and government charges", score: "right" },
            { text: "Cap essential service prices (water, electricity)", score: "center" },
          ],
        },
      ],
    },
    {
      name: "Transport",
      description: "Policies on public transport, roads, cycling, and infrastructure.",
      icon: "🚌",
      questions: [
        {
          questionText: "What is the priority for transport investment?",
          options: [
            { text: "Expand public transport with more bus and train routes", score: "left" },
            { text: "Build new roads and highways to reduce congestion", score: "right" },
            { text: "Invest in cycling infrastructure and walkable communities", score: "left" },
            { text: "Maintain existing infrastructure before building new", score: "center" },
          ],
        },
      ],
    },
  ]

  const allOptions: Array<{ id: string; score: string }> = []

  for (let ci = 0; ci < categoryData.length; ci++) {
    const catData = categoryData[ci]
    const category = await prisma.policyCategory.create({
      data: {
        name: catData.name,
        description: catData.description,
        icon: catData.icon,
        sortOrder: ci,
      },
    })

    for (let qi = 0; qi < catData.questions.length; qi++) {
      const qData = catData.questions[qi]
      const question = await prisma.policyQuestion.create({
        data: {
          questionText: qData.questionText,
          sortOrder: qi,
          categoryId: category.id,
          electionId: election.id,
        },
      })

      for (let oi = 0; oi < qData.options.length; oi++) {
        const opt = qData.options[oi]
        const option = await prisma.policyOption.create({
          data: {
            optionText: opt.text,
            sortOrder: oi,
            questionId: question.id,
          },
        })
        allOptions.push({ id: option.id, score: opt.score })
      }
    }
  }

  // ==================== CANDIDATE ASSESSMENTS ====================
  // Score based on party alignment tendencies
  const partyScoreMap: Record<string, Record<string, number>> = {
    ALP: { left: 2, center: 1.5, right: 0 },
    LIB: { left: 0, center: 1, right: 2 },
    GRN: { left: 2, center: 1, right: 0 },
    SAB: { left: 1, center: 2, right: 1 },
    ONP: { left: 0, center: 0.5, right: 2 },
    FFP: { left: 0, center: 1, right: 2 },
    AJP: { left: 2, center: 1.5, right: 0 },
    IND: { left: 1, center: 1.5, right: 1 },
  }

  // Create candidate assessments
  for (const candidate of candidates) {
    const partyAbbr = candidateData.find((c) => c.name === candidate.name)?.party || "IND"
    const scoreMap = partyScoreMap[partyAbbr] || partyScoreMap.IND

    for (const option of allOptions) {
      // Add some randomness (+/- 0.5)
      const baseScore = scoreMap[option.score] ?? 1
      const variation = (Math.random() - 0.5) * 1
      const finalScore = Math.max(0, Math.min(2, Math.round((baseScore + variation) * 2) / 2))

      await prisma.candidateAssessment.create({
        data: {
          candidateId: candidate.id,
          policyOptionId: option.id,
          agreementScore: finalScore,
          evidence: `Based on ${candidate.name}'s public statements and voting record.`,
          sourceType: "public_statement",
        },
      })
    }
  }

  // Create party assessments (for upper house)
  for (const [abbr, party] of Object.entries(parties)) {
    if (abbr === "IND") continue
    const scoreMap = partyScoreMap[abbr] || partyScoreMap.IND

    for (const option of allOptions) {
      const baseScore = scoreMap[option.score] ?? 1
      await prisma.candidateAssessment.create({
        data: {
          partyId: party.id,
          policyOptionId: option.id,
          agreementScore: baseScore,
          evidence: `Based on ${party.name}'s published platform and policy documents.`,
          sourceType: "party_platform",
        },
      })
    }
  }

  // ==================== CMS CONTENT ====================

  // Pages
  await prisma.page.createMany({
    data: [
      {
        slug: "about",
        title: "About Build a Ballot",
        content: `<p>Build a Ballot is a non-partisan voter information tool created to help South Australians make informed decisions at the ballot box.</p>
<p>Our team of researchers assesses every candidate and party against key policy positions, using publicly available information including parliamentary voting records, policy platforms, media statements, and questionnaire responses.</p>
<h2>Our Mission</h2>
<p>We believe that every voter deserves access to clear, unbiased information about their choices. Democracy works best when citizens can easily compare candidates on the issues that matter most to them.</p>
<h2>How We're Different</h2>
<ul>
<li><strong>Non-partisan:</strong> We don't endorse or oppose any candidate or party.</li>
<li><strong>Evidence-based:</strong> Every assessment includes sources you can verify.</li>
<li><strong>Transparent:</strong> Our methodology and all assessments are publicly available.</li>
<li><strong>Privacy-first:</strong> No login required. Your data stays on your device.</li>
</ul>`,
        isPublished: true,
      },
      {
        slug: "methodology",
        title: "Our Methodology",
        content: `<h2>How We Score Candidates and Parties</h2>
<p>Each policy option is assessed against each candidate and party on a scale of 0 to 2:</p>
<ul>
<li><strong>0 — Strongly disagrees:</strong> The candidate/party has actively opposed this position.</li>
<li><strong>1 — Partially agrees:</strong> Some alignment, but with caveats or inconsistency.</li>
<li><strong>1.5 — Mostly agrees:</strong> Generally supportive with minor reservations.</li>
<li><strong>2 — Strongly agrees:</strong> Clear, consistent support for this position.</li>
</ul>
<h2>Sources We Use</h2>
<ul>
<li>Parliamentary voting records</li>
<li>Published party platforms and policy documents</li>
<li>Media interviews and press releases</li>
<li>Responses to our direct questionnaire</li>
<li>Social media statements</li>
</ul>
<h2>Match Score Calculation</h2>
<p>Your match score is calculated by comparing your selected policy options against each candidate's assessments. For each policy option you selected, if the candidate's score is 1.5 or higher, you earn a match point. Similarly, for options you didn't select, if the candidate scores 0.5 or lower, you also earn a match point.</p>
<p>Your final match percentage = (match points earned / total possible match points) × 100</p>`,
        isPublished: true,
      },
      {
        slug: "assessment-process",
        title: "Assessment Process",
        content: `<h2>Our Assessment Process</h2>
<p>Every assessment undergoes a rigorous process:</p>
<ol>
<li><strong>Research:</strong> Our team gathers publicly available information on each candidate and party's position.</li>
<li><strong>Scoring:</strong> Two independent researchers score each position.</li>
<li><strong>Review:</strong> Discrepancies are reviewed by a senior researcher.</li>
<li><strong>Publication:</strong> All scores and evidence are published for transparency.</li>
<li><strong>Updates:</strong> Scores are updated as new information becomes available.</li>
</ol>
<p>If you believe an assessment is inaccurate, please contact us with supporting evidence and we'll review it promptly.</p>`,
        isPublished: true,
      },
    ],
  })

  // FAQs
  await prisma.fAQ.createMany({
    data: [
      {
        question: "Is Build a Ballot affiliated with any political party?",
        answer: "<p>No. Build a Ballot is a completely non-partisan, independent project. We do not endorse or oppose any candidate, party, or political position.</p>",
        sortOrder: 0,
        isPublished: true,
      },
      {
        question: "How are candidates and parties scored?",
        answer: "<p>Each candidate and party is assessed against each policy option on a scale of 0 (strongly disagrees) to 2 (strongly agrees). Assessments are based on publicly available information including voting records, policy platforms, and public statements. See our <a href='/transparency'>Transparency Centre</a> for full details.</p>",
        sortOrder: 1,
        isPublished: true,
      },
      {
        question: "Do I need to create an account?",
        answer: "<p>No! We believe in voter privacy. You don't need to create an account or provide any personal information to use Build a Ballot. Your questionnaire responses are stored anonymously in your browser session.</p>",
        sortOrder: 2,
        isPublished: true,
      },
      {
        question: "Can I change my answers after completing the questionnaire?",
        answer: "<p>Yes — simply click 'Retake Questionnaire' on the results page to start fresh with new answers.</p>",
        sortOrder: 3,
        isPublished: true,
      },
      {
        question: "What is a ballot plan?",
        answer: "<p>A ballot plan is a personalised guide showing the order in which you plan to preference candidates and parties. You can save it as an image, print it, or email it to yourself to take to the polling booth on election day. Note: this is a planning tool only — you must still fill out the official ballot paper at the polling station.</p>",
        sortOrder: 4,
        isPublished: true,
      },
      {
        question: "Is my data stored?",
        answer: "<p>Your questionnaire responses are stored in an anonymous session — we do not collect your name, email, or any identifying information. We use aggregate, anonymised data to improve the tool. We do not share individual data with any third party.</p>",
        sortOrder: 5,
        isPublished: true,
      },
    ],
  })

  // Articles
  await prisma.article.createMany({
    data: [
      {
        slug: "how-preferential-voting-works",
        title: "How Preferential Voting Works in South Australia",
        content: `<p>South Australia uses a preferential voting system (also known as instant-runoff voting) for the House of Assembly and a proportional representation system for the Legislative Council.</p>
<h2>House of Assembly (Lower House)</h2>
<p>In your local electorate, you'll receive a green ballot paper listing all candidates. You must number every box, starting from 1 (your most preferred candidate) down to the last number.</p>
<h2>Legislative Council (Upper House)</h2>
<p>You'll also receive a white ballot paper for the Legislative Council. You can vote either above the line (by numbering at least 1 box above the thick line) or below the line (by numbering every box below the thick line).</p>
<h2>How Preferences Are Counted</h2>
<p>If no candidate receives more than 50% of first preferences, the candidate with the fewest votes is eliminated, and their preferences are distributed to remaining candidates. This process continues until one candidate has a majority.</p>`,
        category: "Voting Basics",
        readTimeMinutes: 4,
        isPublished: true,
      },
      {
        slug: "how-to-enrol-to-vote",
        title: "How to Enrol to Vote in SA",
        content: `<p>To vote in South Australian elections, you must be enrolled. Here's how to get enrolled or update your details.</p>
<h2>Eligibility</h2>
<ul>
<li>You must be an Australian citizen</li>
<li>You must be 18 years or older (you can enrol at 16 but can't vote until 18)</li>
<li>You must have lived at your current address for at least one month</li>
</ul>
<h2>How to Enrol</h2>
<p>Visit the Australian Electoral Commission (AEC) website at aec.gov.au and complete the online enrolment form. You'll need your driver's licence or passport number.</p>
<h2>Deadline</h2>
<p>The electoral roll closes shortly after an election is called. Make sure your details are up to date well before election day.</p>`,
        category: "Voting Basics",
        readTimeMinutes: 3,
        isPublished: true,
      },
      {
        slug: "understanding-upper-house-voting",
        title: "Understanding Upper House Voting",
        content: `<p>The South Australian Legislative Council (upper house) uses a different voting system than the House of Assembly. Here's what you need to know.</p>
<h2>Above the Line vs Below the Line</h2>
<p><strong>Above the line:</strong> Number at least 1 box above the thick line. Each box represents a party or group. Your vote will follow the party's preference allocation.</p>
<p><strong>Below the line:</strong> Number every box below the thick line. This gives you complete control over your preferences but takes longer.</p>
<h2>Tips</h2>
<ul>
<li>If voting above the line, numbering more boxes gives you more control over where your preferences flow</li>
<li>You can use Build a Ballot's ballot builder to plan your upper house vote in advance</li>
</ul>`,
        category: "Voting Basics",
        readTimeMinutes: 3,
        isPublished: true,
      },
      {
        slug: "what-does-state-government-do",
        title: "What Does State Government Actually Do?",
        content: `<p>The SA state government has responsibility for many services that affect your daily life. Understanding what state government does helps you make a more informed vote.</p>
<h2>Key Responsibilities</h2>
<ul>
<li><strong>Health:</strong> Public hospitals, ambulance services, mental health</li>
<li><strong>Education:</strong> Public schools, TAFE, preschools</li>
<li><strong>Transport:</strong> Public transport, state roads, cycling infrastructure</li>
<li><strong>Police & Emergency:</strong> SA Police, CFS, SES, MFS</li>
<li><strong>Environment:</strong> National parks, water management, EPA</li>
<li><strong>Housing:</strong> Public housing, homelessness services, planning</li>
<li><strong>Justice:</strong> Courts, prisons, legal aid</li>
</ul>`,
        category: "Understanding Government",
        readTimeMinutes: 3,
        isPublished: true,
      },
    ],
  })

  // Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        quote: "This tool made it so much easier to understand where candidates stand on the issues I care about. I felt much more confident heading to the polls.",
        author: "Sarah M.",
        role: "First-time voter",
        sortOrder: 0,
        isPublished: true,
      },
      {
        quote: "As someone who doesn't follow politics closely, Build a Ballot helped me see through the noise and focus on actual policy positions.",
        author: "James K.",
        role: "Adelaide resident",
        sortOrder: 1,
        isPublished: true,
      },
      {
        quote: "The transparency centre is brilliant. I could verify every single assessment and see the evidence for myself. That's how democracy should work.",
        author: "Dr. Lisa Chen",
        role: "Political science researcher",
        sortOrder: 2,
        isPublished: true,
      },
      {
        quote: "I used the ballot builder with my family over dinner. It sparked some great conversations about what matters to each of us.",
        author: "Robert T.",
        role: "Parent of three",
        sortOrder: 3,
        isPublished: true,
      },
      {
        quote: "Finally, a non-partisan tool that doesn't try to push you in any direction. Just the facts and your own preferences.",
        author: "Michelle W.",
        role: "Community organiser",
        sortOrder: 4,
        isPublished: true,
      },
    ],
  })

  // Navigation Items
  await prisma.navItem.createMany({
    data: [
      { label: "How It Works", url: "/#how-it-works", location: "header", sortOrder: 0 },
      { label: "Elections 101", url: "/elections-101", location: "header", sortOrder: 1 },
      { label: "Research Hub", url: "/research", location: "header", sortOrder: 2 },
      { label: "Transparency", url: "/transparency", location: "header", sortOrder: 3 },
      { label: "FAQ", url: "/faq", location: "header", sortOrder: 4 },
      { label: "About", url: "/about", location: "footer", sortOrder: 0 },
      { label: "Methodology", url: "/transparency", location: "footer", sortOrder: 1 },
      { label: "FAQ", url: "/faq", location: "footer", sortOrder: 2 },
      { label: "Elections 101", url: "/elections-101", location: "footer", sortOrder: 3 },
    ],
  })

  console.log("✅ Database seeded successfully!")
  console.log(`   - ${Object.keys(parties).length} parties`)
  console.log(`   - ${Object.keys(electorates).length} electorates`)
  console.log(`   - ${candidates.length} candidates`)
  console.log(`   - ${categoryData.length} policy categories`)
  console.log(`   - ${allOptions.length} policy options`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
