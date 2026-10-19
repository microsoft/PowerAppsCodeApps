export type StageId = "pre" | "day1" | "week1" | "month1" | "quarter"

export type ContentType =
  | "Video"
  | "Reading"
  | "Policy"
  | "Quiz"
  | "Meeting"
  | "Task"
  | "Setup"

export type Track = "Everyone" | "Design" | "Engineering" | "Commercial"

export type HireStatus = "Pre-boarding" | "In progress" | "At risk" | "Complete"

export type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  answer: number
  because: string
}

export type ContentItem = {
  id: string
  stage: StageId
  type: ContentType
  title: string
  summary: string
  minutes: number
  owner: string
  required: boolean
  track: Track
  /** Reading and video items show these paragraphs in the player. */
  body?: string[]
  bullets?: string[]
  /** Policies require a typed-consent style acknowledgement before completing. */
  ack?: string
  quiz?: QuizQuestion[]
  meetingWith?: string
  moduleId?: string
}

export type Stage = {
  id: StageId
  name: string
  window: string
  blurb: string
}

export type LearningModule = {
  id: string
  title: string
  category: string
  level: "Foundation" | "Intermediate" | "Advanced"
  minutes: number
  lessons: number
  rating: number
  learners: number
  owner: string
  summary: string
  tags: string[]
  accent: 1 | 2 | 3 | 4 | 5
  required: boolean
}

export type Hire = {
  id: string
  name: string
  role: string
  department: string
  location: string
  email: string
  employmentType: string
  startDate: string
  manager: string
  buddy: string
  track: Track
  status: HireStatus
  /** Content item ids this hire has finished. */
  completed: string[]
  note: string
}

export type ProvisionStepState = "done" | "failed" | "skipped" | "pending"

export type ProvisionStep = {
  id: string
  label: string
  system: string
  detail: string
}

export type ProvisionRun = {
  id: string
  hireId: string
  flow: string
  triggeredBy: string
  startedAt: string
  durationMs: number
  status: "Completed" | "Needs attention" | "Running"
  steps: { id: string; state: ProvisionStepState; message: string }[]
}

export const TODAY = "2026-09-02"

export const stages: Stage[] = [
  {
    id: "pre",
    name: "Before you start",
    window: "Sent two weeks ahead",
    blurb: "Paperwork, kit and a first look at who we are.",
  },
  {
    id: "day1",
    name: "Day one",
    window: "Your first day",
    blurb: "Get set up, meet your people, and read the things that matter.",
  },
  {
    id: "week1",
    name: "First week",
    window: "Days 2 to 5",
    blurb: "Learn the product, the rhythm, and ship something small.",
  },
  {
    id: "month1",
    name: "First month",
    window: "Weeks 2 to 4",
    blurb: "Go deeper on customers, craft and how money moves.",
  },
  {
    id: "quarter",
    name: "First 90 days",
    window: "Months 2 and 3",
    blurb: "Set your objectives and take full ownership of your patch.",
  },
]

export const contentItems: ContentItem[] = [
  {
    id: "ON-101",
    stage: "pre",
    type: "Setup",
    title: "Sign your contract and starter forms",
    summary:
      "Contract, right-to-work check, bank details and emergency contact.",
    minutes: 15,
    owner: "People Operations",
    required: true,
    track: "Everyone",
    bullets: [
      "Employment contract and offer schedule",
      "Right-to-work documents",
      "Bank details and tax declaration",
      "Emergency contact and dietary requirements",
    ],
  },
  {
    id: "ON-102",
    stage: "pre",
    type: "Reading",
    title: "Welcome to Acme",
    summary: "Who we are, what we sell, and the shape of the company.",
    minutes: 8,
    owner: "People Operations",
    required: true,
    track: "Everyone",
    body: [
      "Acme builds the operational software that keeps mid-sized manufacturers running. We started in 2014 with a single scheduling tool and now cover procurement, safety, communications and field operations for 1,900 customers across fourteen countries.",
      "There are 640 of us. Roughly half sit in product and engineering, a quarter in commercial, and the rest across operations, finance and people. We are deliberately flat: most decisions are made by the team closest to the customer, and escalation is a tool rather than a habit.",
      "You will hear three phrases constantly. Ship the smallest useful thing. Write it down. Ask the customer. They are not slogans on a wall, they are how work actually gets prioritised here.",
    ],
  },
  {
    id: "ON-103",
    stage: "pre",
    type: "Task",
    title: "Choose your equipment",
    summary: "Pick your laptop, monitor setup and accessories.",
    minutes: 5,
    owner: "IT Services",
    required: true,
    track: "Everyone",
    bullets: [
      "Laptop: 14\" or 16\", Windows or macOS",
      "One 27\" display or two 24\" displays",
      "Keyboard, mouse and headset of your choosing",
      "Delivered to your home address two days before you start",
    ],
  },
  {
    id: "ON-104",
    stage: "pre",
    type: "Video",
    title: "A message from our CEO",
    summary: "Six minutes on where the company is heading and why.",
    minutes: 6,
    owner: "Communications",
    required: false,
    track: "Everyone",
    body: [
      "Marta Vieira recorded this for every new joiner in the 2026 cohort. She covers the three-year plan, why we moved upmarket, and the one thing she wants everyone to feel free to do: say when something is broken.",
    ],
  },
  {
    id: "ON-201",
    stage: "day1",
    type: "Meeting",
    title: "Welcome coffee with your buddy",
    summary: "Thirty unstructured minutes with someone who is not your manager.",
    minutes: 30,
    owner: "Your buddy",
    required: true,
    track: "Everyone",
    meetingWith: "buddy",
    bullets: [
      "No agenda, no notes, nothing to prepare",
      "Ask the questions you would not ask your manager",
      "Your buddy stays with you for the full 90 days",
    ],
  },
  {
    id: "ON-202",
    stage: "day1",
    type: "Setup",
    title: "Set up your accounts and MFA",
    summary: "Sign in, enrol your phone, and install the tools you need.",
    minutes: 20,
    owner: "IT Services",
    required: true,
    track: "Everyone",
    bullets: [
      "Sign in to your work account and change the temporary password",
      "Enrol a second factor on your phone",
      "Install the workspace apps from the company portal",
      "Confirm you can reach the internal network",
    ],
  },
  {
    id: "ON-203",
    stage: "day1",
    type: "Policy",
    title: "Code of conduct",
    summary: "How we treat each other, and what happens when we do not.",
    minutes: 12,
    owner: "Legal",
    required: true,
    track: "Everyone",
    ack: "I have read the code of conduct and understand that it applies to me from my first day.",
    body: [
      "We expect everyone to act with honesty, respect and reasonable care. That covers how you speak to colleagues, how you represent Acme to customers, and how you handle information that is not yours.",
      "Harassment, discrimination and retaliation are grounds for dismissal. So is knowingly misrepresenting product capability to a customer. There is no seniority exemption to either.",
      "If something feels wrong, you can raise it with your manager, with People Operations, or anonymously through the speak-up line. Reports are handled by an independent panel and retaliation against a reporter is itself a disciplinary matter.",
    ],
  },
  {
    id: "ON-204",
    stage: "day1",
    type: "Reading",
    title: "How we work: the operating rhythm",
    summary: "The meetings that exist, the ones that do not, and why.",
    minutes: 10,
    owner: "Operations",
    required: true,
    track: "Everyone",
    body: [
      "We run on a six-week cycle. Five weeks of build, one week of cool-down. Cool-down is real: no planned feature work, and it is when most of our tooling and documentation gets fixed.",
      "There are exactly three recurring meetings you are required to attend: your weekly one-to-one, your team's Monday planning, and the monthly all-hands. Everything else is optional and should have an agenda in the invite.",
      "Written updates beat status meetings. Every team posts a short written update on Friday. Read your neighbours' updates; it is the cheapest way to know what is going on.",
    ],
  },
  {
    id: "ON-205",
    stage: "day1",
    type: "Quiz",
    title: "Security essentials check",
    summary: "Five questions. You need four right to pass.",
    minutes: 10,
    owner: "Security",
    required: true,
    track: "Everyone",
    quiz: [
      {
        id: "q1",
        prompt:
          "A supplier emails asking you to update their bank details before Friday's payment run. What do you do?",
        options: [
          "Update the details and reply to confirm",
          "Forward it to finance so they can action it",
          "Verify by calling the supplier on a number you already hold",
        ],
        answer: 2,
        because:
          "Bank detail changes are the most common invoice fraud route. Always verify out-of-band using a number you already have on file.",
      },
      {
        id: "q2",
        prompt: "Where should a customer's exported data live?",
        options: [
          "In the approved workspace, in the customer's own folder",
          "On your desktop while you are working on it",
          "In a personal cloud drive if it is easier to share",
        ],
        answer: 0,
        because:
          "Customer data stays inside the approved workspace so retention and access rules keep applying to it.",
      },
      {
        id: "q3",
        prompt: "You lose your phone, which holds your second factor. First move?",
        options: [
          "Wait until you get home and reset it yourself",
          "Report it to IT Services immediately so the factor is revoked",
          "Ask a colleague to approve your sign-ins for a few days",
        ],
        answer: 1,
        because:
          "Revoking the enrolled factor is the only action that actually closes the hole. Everything else leaves it open.",
      },
      {
        id: "q4",
        prompt: "Which of these can you safely paste into a public AI tool?",
        options: [
          "A customer's incident report with names removed",
          "A snippet of our own source code",
          "None of the above",
        ],
        answer: 2,
        because:
          "Neither customer content nor our source may leave approved tooling, even redacted. Use the internal agent instead.",
      },
      {
        id: "q5",
        prompt: "A colleague you do not recognise asks you to hold the door open.",
        options: [
          "Hold it, it would be rude not to",
          "Ask them to badge in themselves",
          "Hold it but mention it to reception later",
        ],
        answer: 1,
        because:
          "Every person badges individually. It is not rude here, it is the expected behaviour and nobody takes offence.",
      },
    ],
  },
  {
    id: "ON-301",
    stage: "week1",
    type: "Video",
    title: "Our products in twenty minutes",
    summary: "A guided tour of every module we sell and who buys it.",
    minutes: 20,
    owner: "Product Marketing",
    required: true,
    track: "Everyone",
    moduleId: "LX-01",
    body: [
      "Recorded by Priya Raman with a live environment. She walks the six modules in the order a customer usually adopts them, and calls out the two places customers most often get stuck.",
    ],
  },
  {
    id: "ON-302",
    stage: "week1",
    type: "Policy",
    title: "Information security and data handling",
    summary: "Classification levels, retention, and what leaves the building.",
    minutes: 15,
    owner: "Security",
    required: true,
    track: "Everyone",
    ack: "I understand how to classify and handle Acme and customer data, and where I may not take it.",
    body: [
      "We use four classifications: Public, Internal, Confidential and Restricted. Almost everything you touch daily is Internal. Customer production data is Restricted and never leaves the approved workspace.",
      "Retention is automatic. Do not build private archives of customer exports, because they escape the deletion schedule and become our liability during an audit.",
      "If you are unsure of a classification, treat it as Confidential and ask. Nobody has ever been criticised here for over-protecting something.",
    ],
  },
  {
    id: "ON-303",
    stage: "week1",
    type: "Meeting",
    title: "First one-to-one with your manager",
    summary: "Expectations, working style, and what good looks like at 90 days.",
    minutes: 45,
    owner: "Your manager",
    required: true,
    track: "Everyone",
    meetingWith: "manager",
    bullets: [
      "How you each like to work and be given feedback",
      "What success looks like at 30, 60 and 90 days",
      "Which decisions are yours and which are not",
    ],
  },
  {
    id: "ON-304",
    stage: "week1",
    type: "Task",
    title: "Ship your first small change",
    summary:
      "Something real, in production, in week one. Your buddy will pair with you.",
    minutes: 90,
    owner: "Your buddy",
    required: true,
    track: "Everyone",
    bullets: [
      "Pick anything from the starter backlog",
      "Pair with your buddy through the whole path to production",
      "The point is the pipeline, not the change",
    ],
  },
  {
    id: "ON-305",
    stage: "week1",
    type: "Reading",
    title: "Who does what",
    summary: "The org, the on-call rota, and who to ask for what.",
    minutes: 12,
    owner: "Operations",
    required: false,
    track: "Everyone",
    body: [
      "Six departments, twenty-two teams. The teams you will interact with most are Platform, Customer Engineering and Product Marketing, regardless of where you sit.",
      "For anything urgent and technical, the on-call rota is the answer and not a person's direct message. For anything urgent and commercial, it is the duty account director.",
    ],
  },
  {
    id: "ON-306",
    stage: "week1",
    type: "Quiz",
    title: "Product knowledge check",
    summary: "Four questions on what we sell and to whom.",
    minutes: 12,
    owner: "Product Marketing",
    required: true,
    track: "Everyone",
    quiz: [
      {
        id: "q1",
        prompt: "Which module do customers almost always adopt first?",
        options: ["Procurement", "Safety", "Communications"],
        answer: 1,
        because:
          "Safety is the wedge. It is the fastest to show value and it is usually already a regulatory obligation.",
      },
      {
        id: "q2",
        prompt: "Who is our primary buyer?",
        options: [
          "The Chief Information Officer",
          "The Operations Director at a single site",
          "The Head of Procurement at group level",
        ],
        answer: 1,
        because:
          "We land with a single site's Operations Director and expand across sites afterwards. Group deals come later.",
      },
      {
        id: "q3",
        prompt: "What is the most common reason a pilot stalls?",
        options: [
          "Price",
          "Missing integration with their existing ERP",
          "Lack of mobile support",
        ],
        answer: 1,
        because:
          "ERP integration is the number one stall. Flag it in the first call, never in week six.",
      },
      {
        id: "q4",
        prompt: "How long is a standard pilot?",
        options: ["Six weeks", "Twelve weeks", "Six months"],
        answer: 0,
        because:
          "Six weeks, one site, one module. Anything longer tends to lose its executive sponsor.",
      },
    ],
  },
  {
    id: "ON-401",
    stage: "month1",
    type: "Video",
    title: "Customer stories: why they buy",
    summary: "Three recorded customer interviews, unedited.",
    minutes: 25,
    owner: "Product Marketing",
    required: true,
    track: "Everyone",
    moduleId: "LX-02",
    body: [
      "These are raw interviews, not case studies. Two of the three are candid about what we got wrong during their rollout, which is precisely why they are on the required list.",
    ],
  },
  {
    id: "ON-402",
    stage: "month1",
    type: "Policy",
    title: "Expenses and travel",
    summary: "What you can spend without asking, and how to claim it.",
    minutes: 10,
    owner: "Finance",
    required: true,
    track: "Everyone",
    ack: "I have read the expenses policy and understand the limits that apply to my role.",
    body: [
      "You do not need pre-approval below £250. Above that, your manager approves in the tool before you spend, not after.",
      "Travel is booked through the company platform so duty-of-care tracking works. Book economy on anything under six hours.",
      "Claims go in within thirty days. After sixty days they need a director's sign-off, which is tedious for everyone involved.",
    ],
  },
  {
    id: "ON-403",
    stage: "month1",
    type: "Meeting",
    title: "Skip-level with your department lead",
    summary: "Thirty minutes with your manager's manager. No agenda required.",
    minutes: 30,
    owner: "Department lead",
    required: false,
    track: "Everyone",
    meetingWith: "lead",
  },
  {
    id: "ON-404",
    stage: "month1",
    type: "Task",
    title: "Write your 30-day reflection",
    summary:
      "What surprised you, what is confusing, and what you would change.",
    minutes: 30,
    owner: "People Operations",
    required: true,
    track: "Everyone",
    bullets: [
      "Three things that surprised you",
      "Three things still confusing after a month",
      "One thing you would change about onboarding itself",
    ],
  },
  {
    id: "ON-405",
    stage: "month1",
    type: "Reading",
    title: "Design system 101",
    summary: "Tokens, primitives and the review path for new patterns.",
    minutes: 18,
    owner: "Design",
    required: true,
    track: "Design",
    moduleId: "LX-05",
    body: [
      "The system is token-first. Colour, spacing and type are never hard-coded in a product surface; if you need a value that does not exist, that is a system conversation rather than a local override.",
      "New patterns go through a fortnightly review. Bring a real screen, not an abstract component, and be ready to name the two existing patterns you considered first.",
    ],
  },
  {
    id: "ON-501",
    stage: "quarter",
    type: "Meeting",
    title: "90-day review with your manager",
    summary: "Two-way. You review us as much as we review you.",
    minutes: 60,
    owner: "Your manager",
    required: true,
    track: "Everyone",
    meetingWith: "manager",
  },
  {
    id: "ON-502",
    stage: "quarter",
    type: "Task",
    title: "Set your first objectives",
    summary: "Three objectives for the coming cycle, agreed with your manager.",
    minutes: 45,
    owner: "Your manager",
    required: true,
    track: "Everyone",
  },
  {
    id: "ON-503",
    stage: "quarter",
    type: "Quiz",
    title: "Compliance refresher",
    summary: "Three questions, repeated annually from here on.",
    minutes: 10,
    owner: "Legal",
    required: true,
    track: "Everyone",
    quiz: [
      {
        id: "q1",
        prompt: "A customer asks for a feature we have not built. You may say:",
        options: [
          "That it is on the roadmap, to keep the deal moving",
          "That it does not exist today, and offer to log the request",
          "Nothing, and route the whole conversation to product",
        ],
        answer: 1,
        because:
          "Committing to unbuilt functionality is a misrepresentation risk and it is explicitly a disciplinary matter here.",
      },
      {
        id: "q2",
        prompt: "You spot a colleague's expense claim that looks inflated.",
        options: [
          "Raise it with finance or the speak-up line",
          "Ask them about it directly and leave it there",
          "Ignore it, it is not your budget",
        ],
        answer: 0,
        because:
          "Reporting through a formal channel protects both of you, and retaliation against a reporter is itself a disciplinary matter.",
      },
      {
        id: "q3",
        prompt: "How long must customer contract records be retained?",
        options: ["Two years", "Seven years", "Indefinitely"],
        answer: 1,
        because:
          "Seven years from the end of the contract term. The retention schedule enforces this automatically if records stay in the approved systems.",
      },
    ],
  },
]

export const learningModules: LearningModule[] = [
  {
    id: "LX-01",
    title: "Our products in twenty minutes",
    category: "Product",
    level: "Foundation",
    minutes: 20,
    lessons: 6,
    rating: 4.7,
    learners: 612,
    owner: "Priya Raman",
    summary:
      "A guided tour of all six modules in the order customers adopt them, with the two places rollouts usually stall.",
    tags: ["Product", "Customers", "Required"],
    accent: 1,
    required: true,
  },
  {
    id: "LX-02",
    title: "Customer stories: why they buy",
    category: "Product",
    level: "Foundation",
    minutes: 25,
    lessons: 3,
    rating: 4.9,
    learners: 588,
    owner: "Grace Liu",
    summary:
      "Three unedited customer interviews, including two that are candid about what we got wrong.",
    tags: ["Customers", "Research", "Required"],
    accent: 2,
    required: true,
  },
  {
    id: "LX-03",
    title: "Security essentials",
    category: "Security",
    level: "Foundation",
    minutes: 35,
    lessons: 8,
    rating: 4.3,
    learners: 640,
    owner: "Tom Nakamura",
    summary:
      "Phishing, classification, second factors and the handful of habits that prevent most incidents.",
    tags: ["Security", "Mandatory", "Annual"],
    accent: 3,
    required: true,
  },
  {
    id: "LX-04",
    title: "Writing that people actually read",
    category: "Craft",
    level: "Intermediate",
    minutes: 45,
    lessons: 7,
    rating: 4.8,
    learners: 214,
    owner: "Marcus Webb",
    summary:
      "Written updates are how decisions travel here. This is how to make yours worth the reader's time.",
    tags: ["Communication", "Craft"],
    accent: 4,
    required: false,
  },
  {
    id: "LX-05",
    title: "Design system 101",
    category: "Craft",
    level: "Foundation",
    minutes: 40,
    lessons: 9,
    rating: 4.6,
    learners: 96,
    owner: "Jenny Klabber",
    summary:
      "Tokens, primitives and the review path for proposing a new pattern without getting sent back.",
    tags: ["Design", "Craft"],
    accent: 5,
    required: false,
  },
  {
    id: "LX-06",
    title: "Reading a manufacturing shop floor",
    category: "Product",
    level: "Intermediate",
    minutes: 55,
    lessons: 10,
    rating: 4.5,
    learners: 178,
    owner: "Elena Rossi",
    summary:
      "Our customers' world, explained by someone who ran a plant for eleven years before joining.",
    tags: ["Domain", "Customers"],
    accent: 1,
    required: false,
  },
  {
    id: "LX-07",
    title: "Giving feedback that lands",
    category: "Leadership",
    level: "Intermediate",
    minutes: 50,
    lessons: 6,
    rating: 4.4,
    learners: 143,
    owner: "Sofia Marino",
    summary:
      "Practical structures for the conversations most people put off for a quarter.",
    tags: ["Leadership", "People"],
    accent: 2,
    required: false,
  },
  {
    id: "LX-08",
    title: "Data protection in practice",
    category: "Compliance",
    level: "Foundation",
    minutes: 30,
    lessons: 5,
    rating: 4.1,
    learners: 640,
    owner: "Legal",
    summary:
      "Classification, retention and subject access requests, with the specific cases that come up here.",
    tags: ["Compliance", "Mandatory", "Annual"],
    accent: 3,
    required: true,
  },
  {
    id: "LX-09",
    title: "How Acme makes money",
    category: "Culture",
    level: "Foundation",
    minutes: 25,
    lessons: 4,
    rating: 4.7,
    learners: 401,
    owner: "Finance",
    summary:
      "Pricing, margin, renewal mechanics and where a single discount decision actually lands.",
    tags: ["Business", "Culture"],
    accent: 4,
    required: false,
  },
]

export const hires: Hire[] = [
  {
    id: "aisha-bello",
    name: "Aisha Bello",
    role: "Senior Product Designer",
    department: "Design",
    location: "London",
    email: "aisha.bello@acme.com",
    employmentType: "Full-time",
    startDate: "2026-08-31",
    manager: "Jenny Klabber",
    buddy: "Marcus Webb",
    track: "Design",
    status: "In progress",
    completed: [
      "ON-101",
      "ON-102",
      "ON-103",
      "ON-104",
      "ON-201",
      "ON-202",
      "ON-203",
      "ON-204",
      "ON-205",
      "ON-301",
      "ON-302",
    ],
    note: "Joined from a competitor. Already fluent in the domain, so week one is deliberately light on product basics.",
  },
  {
    id: "daniel-okafor",
    name: "Daniel Okafor",
    role: "Platform Engineer",
    department: "Engineering",
    location: "Manchester",
    email: "daniel.okafor@acme.com",
    employmentType: "Full-time",
    startDate: "2026-08-31",
    manager: "Tom Nakamura",
    buddy: "Ravi Shah",
    track: "Engineering",
    status: "In progress",
    completed: [
      "ON-101",
      "ON-102",
      "ON-103",
      "ON-201",
      "ON-202",
      "ON-203",
      "ON-204",
      "ON-205",
      "ON-301",
      "ON-302",
      "ON-303",
      "ON-304",
    ],
    note: "Ahead of plan. Shipped his first change on day three.",
  },
  {
    id: "clara-jensen",
    name: "Clara Jensen",
    role: "Account Director",
    department: "Commercial",
    location: "Copenhagen",
    email: "clara.jensen@acme.com",
    employmentType: "Full-time",
    startDate: "2026-08-24",
    manager: "Sofia Marino",
    buddy: "Grace Liu",
    track: "Commercial",
    status: "At risk",
    completed: ["ON-101", "ON-102", "ON-201", "ON-202"],
    note: "Two required policies unread after nine days and no first one-to-one booked. Manager has been nudged twice.",
  },
  {
    id: "ben-arnold",
    name: "Ben Arnold",
    role: "Customer Engineer",
    department: "Engineering",
    location: "Bristol",
    email: "ben.arnold@acme.com",
    employmentType: "Full-time",
    startDate: "2026-08-17",
    manager: "Tom Nakamura",
    buddy: "Elena Rossi",
    track: "Engineering",
    status: "In progress",
    completed: [
      "ON-101",
      "ON-102",
      "ON-103",
      "ON-104",
      "ON-201",
      "ON-202",
      "ON-203",
      "ON-204",
      "ON-205",
      "ON-301",
      "ON-302",
      "ON-303",
      "ON-304",
      "ON-305",
      "ON-306",
      "ON-401",
    ],
    note: "Steady. Skip-level still to book.",
  },
  {
    id: "hana-suzuki",
    name: "Hana Suzuki",
    role: "Product Manager",
    department: "Product",
    location: "London",
    email: "hana.suzuki@acme.com",
    employmentType: "Full-time",
    startDate: "2026-09-14",
    manager: "Priya Raman",
    buddy: "Jenny Klabber",
    track: "Everyone",
    status: "Pre-boarding",
    completed: ["ON-101"],
    note: "Starts in twelve days. Equipment order not yet placed.",
  },
  {
    id: "luis-moreno",
    name: "Luis Moreno",
    role: "Data Analyst",
    department: "Operations",
    location: "Madrid",
    email: "luis.moreno@acme.com",
    employmentType: "Fixed-term",
    startDate: "2026-09-14",
    manager: "Elena Rossi",
    buddy: "Ravi Shah",
    track: "Everyone",
    status: "Pre-boarding",
    completed: [],
    note: "Twelve-month contract covering parental leave.",
  },
  {
    id: "nadia-haddad",
    name: "Nadia Haddad",
    role: "Solutions Consultant",
    department: "Commercial",
    location: "Dubai",
    email: "nadia.haddad@acme.com",
    employmentType: "Full-time",
    startDate: "2026-06-15",
    manager: "Sofia Marino",
    buddy: "Clara Jensen",
    track: "Commercial",
    status: "Complete",
    completed: contentItems
      .filter((item) => item.track === "Everyone" || item.track === "Commercial")
      .map((item) => item.id),
    note: "Finished the full 90 days. Now buddying for Clara.",
  },
  {
    id: "otto-lindqvist",
    name: "Otto Lindqvist",
    role: "Site Reliability Engineer",
    department: "Engineering",
    location: "Stockholm",
    email: "otto.lindqvist@acme.com",
    employmentType: "Full-time",
    startDate: "2026-07-06",
    manager: "Tom Nakamura",
    buddy: "Daniel Okafor",
    track: "Engineering",
    status: "In progress",
    completed: [
      "ON-101",
      "ON-102",
      "ON-103",
      "ON-104",
      "ON-201",
      "ON-202",
      "ON-203",
      "ON-204",
      "ON-205",
      "ON-301",
      "ON-302",
      "ON-303",
      "ON-304",
      "ON-305",
      "ON-306",
      "ON-401",
      "ON-402",
      "ON-403",
      "ON-404",
    ],
    note: "In the final stretch. 90-day review booked for 5 October.",
  },
  {
    id: "priya-desai",
    name: "Priya Desai",
    role: "Technical Writer",
    department: "Product",
    location: "Pune",
    email: "priya.desai@acme.com",
    employmentType: "Full-time",
    startDate: "2026-08-10",
    manager: "Priya Raman",
    buddy: "Marcus Webb",
    track: "Everyone",
    status: "In progress",
    completed: [
      "ON-101",
      "ON-102",
      "ON-103",
      "ON-201",
      "ON-202",
      "ON-203",
      "ON-204",
      "ON-205",
      "ON-301",
      "ON-302",
      "ON-303",
    ],
    note: "Documentation backlog owner from week two, earlier than usual.",
  },
  {
    id: "marc-dubois",
    name: "Marc Dubois",
    role: "Field Operations Lead",
    department: "Operations",
    location: "Lyon",
    email: "marc.dubois@acme.com",
    employmentType: "Full-time",
    startDate: "2026-08-24",
    manager: "Elena Rossi",
    buddy: "Ben Arnold",
    track: "Everyone",
    status: "At risk",
    completed: ["ON-101", "ON-102", "ON-103", "ON-201", "ON-202", "ON-203"],
    note: "Laptop arrived four days late, which pushed the whole first week.",
  },
]

/** The signed-in new starter for the employee-facing journey. */
export const currentHireId = "aisha-bello"

export const provisionSteps: ProvisionStep[] = [
  {
    id: "identity",
    label: "Create identity and mailbox",
    system: "Entra ID",
    detail: "Account, licence assignment and primary mailbox",
  },
  {
    id: "groups",
    label: "Assign role-based access groups",
    system: "Entra ID",
    detail: "Derived from department, track and location",
  },
  {
    id: "device",
    label: "Enrol and ship device",
    system: "Intune",
    detail: "Build profile, encryption policy and courier booking",
  },
  {
    id: "payroll",
    label: "Register with payroll",
    system: "Workday",
    detail: "Contract, tax record and first pay period",
  },
  {
    id: "workspace",
    label: "Provision workspace apps",
    system: "Microsoft 365",
    detail: "Teams, SharePoint site membership and calendar delegation",
  },
  {
    id: "facilities",
    label: "Issue building pass",
    system: "Facilities",
    detail: "Photo capture, access zones and desk allocation",
  },
  {
    id: "journey",
    label: "Assign onboarding journey",
    system: "Onboarding",
    detail: "Track-specific content, buddy pairing and calendar holds",
  },
]

export const provisionRuns: ProvisionRun[] = [
  {
    id: "RUN-2418",
    hireId: "aisha-bello",
    flow: "Provision-New-Starter",
    triggeredBy: "People Operations",
    startedAt: "2026-08-28 09:12",
    durationMs: 41200,
    status: "Completed",
    steps: [
      { id: "identity", state: "done", message: "aisha.bello@acme.com created" },
      { id: "groups", state: "done", message: "6 groups assigned" },
      { id: "device", state: "done", message: "MacBook Pro 14 shipped, arrives 29 Aug" },
      { id: "payroll", state: "done", message: "Registered, first pay 25 Sep" },
      { id: "workspace", state: "done", message: "9 apps provisioned" },
      { id: "facilities", state: "done", message: "Pass ready for collection" },
      { id: "journey", state: "done", message: "Design track, 23 items assigned" },
    ],
  },
  {
    id: "RUN-2419",
    hireId: "daniel-okafor",
    flow: "Provision-New-Starter",
    triggeredBy: "People Operations",
    startedAt: "2026-08-28 09:12",
    durationMs: 38900,
    status: "Completed",
    steps: [
      { id: "identity", state: "done", message: "daniel.okafor@acme.com created" },
      { id: "groups", state: "done", message: "8 groups assigned" },
      { id: "device", state: "done", message: "ThinkPad X1 shipped, arrives 29 Aug" },
      { id: "payroll", state: "done", message: "Registered, first pay 25 Sep" },
      { id: "workspace", state: "done", message: "11 apps provisioned" },
      { id: "facilities", state: "done", message: "Pass ready for collection" },
      { id: "journey", state: "done", message: "Engineering track, 23 items assigned" },
    ],
  },
  {
    id: "RUN-2431",
    hireId: "marc-dubois",
    flow: "Provision-New-Starter",
    triggeredBy: "People Operations",
    startedAt: "2026-08-21 14:40",
    durationMs: 52600,
    status: "Needs attention",
    steps: [
      { id: "identity", state: "done", message: "marc.dubois@acme.com created" },
      { id: "groups", state: "done", message: "5 groups assigned" },
      {
        id: "device",
        state: "failed",
        message: "Courier rejected the Lyon address: no delivery contact on file",
      },
      { id: "payroll", state: "done", message: "Registered, first pay 25 Sep" },
      { id: "workspace", state: "done", message: "9 apps provisioned" },
      { id: "facilities", state: "skipped", message: "Blocked: device enrolment must complete first" },
      { id: "journey", state: "done", message: "Standard track, 21 items assigned" },
    ],
  },
  {
    id: "RUN-2444",
    hireId: "hana-suzuki",
    flow: "Provision-New-Starter",
    triggeredBy: "Scheduled · 14 days before start",
    startedAt: "2026-08-31 06:00",
    durationMs: 29400,
    status: "Needs attention",
    steps: [
      { id: "identity", state: "done", message: "hana.suzuki@acme.com created" },
      { id: "groups", state: "done", message: "6 groups assigned" },
      {
        id: "device",
        state: "failed",
        message: "No equipment choice submitted, order not placed",
      },
      { id: "payroll", state: "done", message: "Registered, first pay 25 Oct" },
      { id: "workspace", state: "done", message: "9 apps provisioned" },
      { id: "facilities", state: "pending", message: "Waiting for start date" },
      { id: "journey", state: "done", message: "Standard track, 21 items assigned" },
    ],
  },
  {
    id: "RUN-2445",
    hireId: "luis-moreno",
    flow: "Provision-New-Starter",
    triggeredBy: "Scheduled · 14 days before start",
    startedAt: "2026-08-31 06:00",
    durationMs: 31100,
    status: "Completed",
    steps: [
      { id: "identity", state: "done", message: "luis.moreno@acme.com created" },
      { id: "groups", state: "done", message: "4 groups assigned" },
      { id: "device", state: "done", message: "ThinkPad T14 shipped, arrives 11 Sep" },
      { id: "payroll", state: "done", message: "Fixed-term contract registered" },
      { id: "workspace", state: "done", message: "8 apps provisioned" },
      { id: "facilities", state: "pending", message: "Waiting for start date" },
      { id: "journey", state: "done", message: "Standard track, 21 items assigned" },
    ],
  },
]

export const contentTypes: ContentType[] = [
  "Video",
  "Reading",
  "Policy",
  "Quiz",
  "Meeting",
  "Task",
  "Setup",
]

export const hireStatuses: HireStatus[] = [
  "Pre-boarding",
  "In progress",
  "At risk",
  "Complete",
]

export const learningCategories = [
  "Product",
  "Security",
  "Craft",
  "Leadership",
  "Compliance",
  "Culture",
]

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function itemsForTrack(track: Track) {
  return contentItems.filter(
    (item) => item.track === "Everyone" || item.track === track
  )
}

export function progressFor(hire: Hire) {
  const items = itemsForTrack(hire.track)
  const done = items.filter((item) => hire.completed.includes(item.id)).length
  return {
    done,
    total: items.length,
    percent: items.length === 0 ? 0 : Math.round((done / items.length) * 100),
  }
}

export function requiredOutstanding(hire: Hire) {
  return itemsForTrack(hire.track).filter(
    (item) => item.required && !hire.completed.includes(item.id)
  )
}

/** Whole days between the hire's start date and today. Negative before they start. */
export function dayNumber(startDate: string, today = TODAY) {
  const ms =
    new Date(`${today}T00:00:00`).getTime() -
    new Date(`${startDate}T00:00:00`).getTime()
  return Math.round(ms / 86_400_000)
}

export function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function stageOf(id: StageId) {
  return stages.find((stage) => stage.id === id) ?? stages[0]
}

export function hireById(id?: string) {
  return hires.find((hire) => hire.id === id)
}

export function moduleById(id?: string) {
  return learningModules.find((module) => module.id === id)
}

/** Weekly completion trend for the overview chart. */
export const completionTrend = [
  { week: "W27", started: 3, completed: 1 },
  { week: "W29", started: 2, completed: 2 },
  { week: "W31", started: 4, completed: 3 },
  { week: "W33", started: 2, completed: 2 },
  { week: "W35", started: 5, completed: 3 },
  { week: "W37", started: 2, completed: 1 },
]

/** Average days to reach each stage, cohort over cohort. */
export const stageVelocity = [
  { stage: "Day one", target: 1, actual: 1 },
  { stage: "First week", target: 5, actual: 6 },
  { stage: "First month", target: 30, actual: 34 },
  { stage: "90 days", target: 90, actual: 88 },
]
