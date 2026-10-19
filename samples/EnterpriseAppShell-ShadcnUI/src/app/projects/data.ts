export type ProjectStatus = "Completed" | "In Progress" | "Pending"

export type Project = {
  id: number
  name: string
  lead: string
  progress: number
  assignees: string[]
  status: ProjectStatus
  dueDate: string
  client?: string
  budget?: string
  description?: string
  startDate?: string
}

export type Milestone = { title: string; date: string; done: boolean }

export const monthlyPerformance = [
  { month: "Jan", projects: 34, revenue: 78, active: 12 },
  { month: "Feb", projects: 66, revenue: 92, active: 14 },
  { month: "Mar", projects: 47, revenue: 71, active: 10 },
  { month: "Apr", projects: 69, revenue: 108, active: 22 },
  { month: "May", projects: 52, revenue: 82, active: 28 },
  { month: "Jun", projects: 61, revenue: 74, active: 19 },
  { month: "Jul", projects: 38, revenue: 96, active: 15 },
  { month: "Aug", projects: 43, revenue: 62, active: 13 },
  { month: "Sep", projects: 84, revenue: 88, active: 11 },
  { month: "Oct", projects: 51, revenue: 70, active: 24 },
  { month: "Nov", projects: 62, revenue: 90, active: 17 },
  { month: "Dec", projects: 68, revenue: 64, active: 31 },
]

export const activeProjects: Project[] = [
  {
    id: 1,
    name: "Brand Logo Design",
    lead: "Donald Risher",
    progress: 53,
    assignees: ["Ava Cole", "Milo Reed", "Nina Park"],
    status: "In Progress",
    dueDate: "06 Sep 2021",
    client: "Fabrikam",
    budget: "$8,400",
    startDate: "12 Jul 2021",
    description:
      "Refresh the corporate identity with a new logo system, colour palette and usage guidelines.",
  },
  {
    id: 2,
    name: "Redesign - Landing Page",
    lead: "Prezy William",
    progress: 0,
    assignees: ["Owen Diaz", "Ruth Kane"],
    status: "Pending",
    dueDate: "13 Nov 2021",
    client: "Northwind",
    budget: "$15,600",
    startDate: "18 Oct 2021",
    description:
      "Rebuild the marketing landing page around the new positioning and conversion funnel.",
  },
  {
    id: 3,
    name: "Multipurpose Landing Template",
    lead: "Boonie Hoynas",
    progress: 100,
    assignees: ["Iris Lloyd", "Sam Ortiz"],
    status: "Completed",
    dueDate: "26 Nov 2021",
    client: "Tailwind Traders",
    budget: "$22,000",
    startDate: "02 Sep 2021",
    description:
      "A reusable template kit covering ten industry layouts with shared design tokens.",
  },
  {
    id: 4,
    name: "Chat Application",
    lead: "Pauline Moll",
    progress: 64,
    assignees: ["Leo Frank"],
    status: "In Progress",
    dueDate: "15 Dec 2021",
    client: "Adventure Works",
    budget: "$36,900",
    startDate: "01 Oct 2021",
    description:
      "Real-time messaging with presence, threads and moderation tooling for support teams.",
  },
  {
    id: 5,
    name: "Create Wireframe",
    lead: "James Bangs",
    progress: 77,
    assignees: ["Cleo Vance", "Hugo Marsh", "Tara Bell"],
    status: "In Progress",
    dueDate: "21 Dec 2021",
    client: "Contoso",
    budget: "$11,750",
    startDate: "08 Nov 2021",
    description:
      "Low-fidelity wireframes for the next release, validated with five customer interviews.",
  },
]

export const allProjects: Project[] = [
  ...activeProjects,
  {
    id: 6,
    name: "Mobile App Onboarding",
    lead: "Maria Santos",
    progress: 41,
    assignees: ["Ava Cole", "Leo Frank"],
    status: "In Progress",
    dueDate: "08 Jan 2022",
    client: "Northwind",
    budget: "$24,000",
    startDate: "15 Nov 2021",
    description:
      "A guided first-run experience that cuts time to first value on mobile from days to minutes.",
  },
  {
    id: 7,
    name: "Data Warehouse Migration",
    lead: "Kenji Watanabe",
    progress: 100,
    assignees: ["Amir Haddad", "Sam Ortiz", "Nina Park"],
    status: "Completed",
    dueDate: "19 Jan 2022",
    client: "Contoso",
    budget: "$62,000",
    startDate: "04 Oct 2021",
    description:
      "Move the legacy on-premises warehouse to a managed cloud platform with zero downtime.",
  },
  {
    id: 8,
    name: "Customer Portal Refresh",
    lead: "Jenny Klabber",
    progress: 22,
    assignees: ["Ruth Kane", "Hugo Marsh"],
    status: "In Progress",
    dueDate: "02 Feb 2022",
    client: "Fabrikam",
    budget: "$18,500",
    startDate: "10 Dec 2021",
    description:
      "Modernise the self-service portal with a new information architecture and design system.",
  },
  {
    id: 9,
    name: "Marketing Site Localization",
    lead: "Sofia Lindqvist",
    progress: 0,
    assignees: ["Iris Lloyd"],
    status: "Pending",
    dueDate: "27 Feb 2022",
    client: "Tailwind Traders",
    budget: "$9,800",
    startDate: "17 Jan 2022",
    description:
      "Translate and localise the public site for six new markets, including RTL support.",
  },
  {
    id: 10,
    name: "Support Chatbot",
    lead: "Donald Risher",
    progress: 68,
    assignees: ["Milo Reed", "Tara Bell", "Owen Diaz"],
    status: "In Progress",
    dueDate: "14 Mar 2022",
    client: "Adventure Works",
    budget: "$31,200",
    startDate: "20 Dec 2021",
    description:
      "Deflect tier-one support volume with a grounded assistant wired into the knowledge base.",
  },
  {
    id: 11,
    name: "Billing Engine Rewrite",
    lead: "Amir Haddad",
    progress: 100,
    assignees: ["Cleo Vance", "Sam Ortiz"],
    status: "Completed",
    dueDate: "30 Mar 2022",
    client: "Contoso",
    budget: "$54,700",
    startDate: "08 Nov 2021",
    description:
      "Replace the batch billing engine with an event-driven service and full audit history.",
  },
  {
    id: 12,
    name: "Partner API Sandbox",
    lead: "Pauline Moll",
    progress: 0,
    assignees: ["Leo Frank", "Ava Cole"],
    status: "Pending",
    dueDate: "11 Apr 2022",
    client: "Northwind",
    budget: "$12,400",
    startDate: "28 Feb 2022",
    description:
      "A sandbox environment where partners can self-serve API keys and replay sample payloads.",
  },
]

export const tasks: {
  id: number
  name: string
  deadline: string
  status: ProjectStatus
  assignee: string
  done: boolean
}[] = [
  {
    id: 1,
    name: "Create new Admin Template",
    deadline: "03 Nov 2021",
    status: "Completed",
    assignee: "Ava Cole",
    done: true,
  },
  {
    id: 2,
    name: "Marketing Coordinator",
    deadline: "17 Nov 2021",
    status: "In Progress",
    assignee: "Milo Reed",
    done: false,
  },
  {
    id: 3,
    name: "Administrative Analyst",
    deadline: "26 Nov 2021",
    status: "Completed",
    assignee: "Nina Park",
    done: true,
  },
  {
    id: 4,
    name: "E-commerce Landing Page",
    deadline: "10 Dec 2021",
    status: "Pending",
    assignee: "Owen Diaz",
    done: false,
  },
  {
    id: 5,
    name: "UI/UX Design",
    deadline: "22 Dec 2021",
    status: "In Progress",
    assignee: "Ruth Kane",
    done: false,
  },
  {
    id: 6,
    name: "Projects Design",
    deadline: "31 Dec 2021",
    status: "Pending",
    assignee: "Leo Frank",
    done: false,
  },
]

export const events = [
  {
    day: "09",
    title: "Development planning",
    company: "iTest Factory",
    time: "9:20 AM",
  },
  {
    day: "12",
    title: "Design new UI and check sales",
    company: "Meta4Systems",
    time: "11:30 AM",
  },
  {
    day: "25",
    title: "Weekly catch-up",
    company: "Nesta Technologies",
    time: "02:00 PM",
  },
  {
    day: "27",
    title: "James Bangs (Client) Meeting",
    company: "Nesta Technologies",
    time: "03:45 PM",
  },
]

export function projectSlug(project: Project) {
  return project.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

export function getProject(slug: string | undefined) {
  return allProjects.find((project) => projectSlug(project) === slug)
}

const milestoneStages = [
  "Kickoff",
  "Discovery",
  "Design sign-off",
  "Build complete",
  "Launch",
]

/** Milestones are derived from progress: each stage covers an even slice of the project. */
export function projectMilestones(project: Project): Milestone[] {
  return milestoneStages.map((title, index) => {
    const threshold = ((index + 1) / milestoneStages.length) * 100
    const isFirst = index === 0
    const isLast = index === milestoneStages.length - 1
    return {
      title,
      date: isFirst
        ? (project.startDate ?? "")
        : isLast
          ? project.dueDate
          : "",
      done: project.progress >= threshold,
    }
  })
}

export function projectSpend(project: Project) {
  const budget = Number(project.budget?.replace(/[^0-9.]/g, "") ?? 0)
  const spent = Math.round((budget * project.progress) / 100)
  return {
    budget,
    spent,
    remaining: budget - spent,
    format: (value: number) => `$${value.toLocaleString("en-US")}`,
  }
}
