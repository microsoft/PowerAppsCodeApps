export type TaskColumn = "Backlog" | "In Progress" | "In Review" | "Done"
export type TaskPriority = "Low" | "Medium" | "High" | "Urgent"

export type Task = {
  id: string
  title: string
  description: string
  column: TaskColumn
  priority: TaskPriority
  project: string
  assignee: string
  reporter: string
  dueDate: string
  createdAt: string
  labels: string[]
  estimate: string
  logged: string
  progress: number
  checklist: { label: string; done: boolean }[]
  comments: { author: string; body: string; timestamp: string }[]
}

export const taskColumns: TaskColumn[] = [
  "Backlog",
  "In Progress",
  "In Review",
  "Done",
]

export const taskPriorities: TaskPriority[] = ["Low", "Medium", "High", "Urgent"]

export const tasks: Task[] = [
  {
    id: "TSK-1024",
    title: "Create new Admin Template",
    description:
      "Assemble the admin shell using the shared design tokens and validate it against the responsive breakpoints.",
    column: "In Progress",
    priority: "High",
    project: "Brand Logo Design",
    assignee: "Jenny Klabber",
    reporter: "Donald Risher",
    dueDate: "14 Feb 2026",
    createdAt: "02 Feb 2026",
    labels: ["design-system", "frontend"],
    estimate: "16h",
    logged: "9h 30m",
    progress: 60,
    checklist: [
      { label: "Audit existing layouts", done: true },
      { label: "Define token mapping", done: true },
      { label: "Build responsive shell", done: false },
      { label: "Accessibility pass", done: false },
    ],
    comments: [
      {
        author: "Donald Risher",
        body: "Please keep the sidebar collapsed state in sync with the header.",
        timestamp: "Today, 9:12 AM",
      },
      {
        author: "Jenny Klabber",
        body: "Done — it now persists in local storage.",
        timestamp: "Today, 11:40 AM",
      },
    ],
  },
  {
    id: "TSK-1025",
    title: "Refresh the marketing landing page",
    description:
      "Update hero copy, swap in the new illustration set, and improve the mobile layout.",
    column: "Backlog",
    priority: "Medium",
    project: "Redesign - Landing Page",
    assignee: "Sofia Lindqvist",
    reporter: "Maria Santos",
    dueDate: "03 Mar 2026",
    createdAt: "10 Feb 2026",
    labels: ["marketing"],
    estimate: "12h",
    logged: "0h",
    progress: 0,
    checklist: [
      { label: "Collect copy from marketing", done: false },
      { label: "Update hero section", done: false },
    ],
    comments: [],
  },
  {
    id: "TSK-1026",
    title: "Migrate authentication to managed identity",
    description:
      "Replace the client secret flow with managed identity across all environments.",
    column: "In Progress",
    priority: "Urgent",
    project: "Enterprise App Shell",
    assignee: "Kenji Watanabe",
    reporter: "Donald Risher",
    dueDate: "20 Feb 2026",
    createdAt: "28 Jan 2026",
    labels: ["security", "platform"],
    estimate: "24h",
    logged: "18h",
    progress: 75,
    checklist: [
      { label: "Provision identities", done: true },
      { label: "Update dev environment", done: true },
      { label: "Update production", done: false },
    ],
    comments: [
      {
        author: "Kenji Watanabe",
        body: "Dev and staging are migrated. Production is scheduled for Friday.",
        timestamp: "Yesterday, 4:02 PM",
      },
    ],
  },
  {
    id: "TSK-1027",
    title: "Build the revenue forecast model",
    description: "Model the next four quarters using the updated pipeline data.",
    column: "In Review",
    priority: "Medium",
    project: "Revenue Forecast Model",
    assignee: "Amir Haddad",
    reporter: "Maria Santos",
    dueDate: "19 Mar 2026",
    createdAt: "05 Feb 2026",
    labels: ["data", "analytics"],
    estimate: "20h",
    logged: "19h",
    progress: 90,
    checklist: [
      { label: "Clean pipeline data", done: true },
      { label: "Fit the model", done: true },
      { label: "Peer review", done: false },
    ],
    comments: [
      {
        author: "Maria Santos",
        body: "Looks solid. Add a sensitivity table before we ship it.",
        timestamp: "2 days ago, 1:15 PM",
      },
    ],
  },
  {
    id: "TSK-1028",
    title: "Run the onboarding usability study",
    description: "Recruit 12 participants and script the moderated sessions.",
    column: "Done",
    priority: "Low",
    project: "Onboarding Study",
    assignee: "Sofia Lindqvist",
    reporter: "Jenny Klabber",
    dueDate: "22 Jan 2026",
    createdAt: "04 Jan 2026",
    labels: ["research"],
    estimate: "18h",
    logged: "18h",
    progress: 100,
    checklist: [
      { label: "Recruit participants", done: true },
      { label: "Run sessions", done: true },
      { label: "Publish findings", done: true },
    ],
    comments: [],
  },
  {
    id: "TSK-1029",
    title: "Set up the integration gateway",
    description:
      "Stand up the gateway with private endpoints and document the partner onboarding flow.",
    column: "In Progress",
    priority: "High",
    project: "Integration Gateway",
    assignee: "Kenji Watanabe",
    reporter: "Donald Risher",
    dueDate: "11 Jul 2026",
    createdAt: "18 Feb 2026",
    labels: ["platform", "integrations"],
    estimate: "40h",
    logged: "22h",
    progress: 55,
    checklist: [
      { label: "Provision the gateway", done: true },
      { label: "Wire private endpoints", done: true },
      { label: "Partner onboarding docs", done: false },
    ],
    comments: [],
  },
  {
    id: "TSK-1030",
    title: "Localize the marketing site",
    description: "Add German, Spanish, and Japanese locales to the marketing site.",
    column: "Backlog",
    priority: "Low",
    project: "Marketing Site Localization",
    assignee: "Sofia Lindqvist",
    reporter: "Maria Santos",
    dueDate: "27 Feb 2026",
    createdAt: "20 Feb 2026",
    labels: ["marketing", "i18n"],
    estimate: "30h",
    logged: "0h",
    progress: 0,
    checklist: [{ label: "Extract copy strings", done: false }],
    comments: [],
  },
  {
    id: "TSK-1031",
    title: "Ship the usage reporting dashboard",
    description: "Publish the reporting dashboard to the customer portal.",
    column: "In Review",
    priority: "High",
    project: "Usage Reporting",
    assignee: "Maria Santos",
    reporter: "Jenny Klabber",
    dueDate: "27 Feb 2026",
    createdAt: "08 Feb 2026",
    labels: ["analytics"],
    estimate: "14h",
    logged: "13h",
    progress: 88,
    checklist: [
      { label: "Finalize the metric set", done: true },
      { label: "Sign-off from support", done: false },
    ],
    comments: [],
  },
  {
    id: "TSK-1032",
    title: "Retire the legacy connector",
    description: "Remove the deprecated connector and migrate the two remaining tenants.",
    column: "Done",
    priority: "Medium",
    project: "Regional Compliance Pack",
    assignee: "Amir Haddad",
    reporter: "Kenji Watanabe",
    dueDate: "09 Feb 2026",
    createdAt: "12 Jan 2026",
    labels: ["platform"],
    estimate: "10h",
    logged: "11h",
    progress: 100,
    checklist: [
      { label: "Migrate tenants", done: true },
      { label: "Delete the connector", done: true },
    ],
    comments: [],
  },
  {
    id: "TSK-1033",
    title: "Harden the audit log pipeline",
    description:
      "Batch the audit writes, add retry with backoff, and alert when the queue depth stays high for more than ten minutes.",
    column: "In Review",
    priority: "Urgent",
    project: "Enterprise App Shell",
    assignee: "Kenji Watanabe",
    reporter: "Donald Risher",
    dueDate: "06 Mar 2026",
    createdAt: "16 Feb 2026",
    labels: ["platform", "security"],
    estimate: "22h",
    logged: "20h",
    progress: 85,
    checklist: [
      { label: "Batch the writes", done: true },
      { label: "Add retry with backoff", done: true },
      { label: "Queue depth alert", done: false },
    ],
    comments: [
      {
        author: "Donald Risher",
        body: "Hold the merge until the alert threshold is agreed with ops.",
        timestamp: "Yesterday, 2:28 PM",
      },
    ],
  },
  {
    id: "TSK-1034",
    title: "Add scheduled export to the reporting API",
    description:
      "Let customers schedule a nightly CSV export of their usage data and drop it into their own storage account.",
    column: "Backlog",
    priority: "High",
    project: "Usage Reporting",
    assignee: "Maria Santos",
    reporter: "Jenny Klabber",
    dueDate: "13 Mar 2026",
    createdAt: "24 Feb 2026",
    labels: ["analytics", "api"],
    estimate: "26h",
    logged: "0h",
    progress: 0,
    checklist: [
      { label: "Agree the export schema", done: false },
      { label: "Design the scheduler", done: false },
      { label: "Storage account handshake", done: false },
    ],
    comments: [],
  },
  {
    id: "TSK-1035",
    title: "Write up the onboarding study findings",
    description:
      "Turn the twelve session recordings into a readable summary with the five changes we want to make first.",
    column: "Done",
    priority: "Low",
    project: "Onboarding Study",
    assignee: "Sofia Lindqvist",
    reporter: "Maria Santos",
    dueDate: "30 Jan 2026",
    createdAt: "19 Jan 2026",
    labels: ["research", "documentation"],
    estimate: "8h",
    logged: "9h",
    progress: 100,
    checklist: [
      { label: "Tag the session notes", done: true },
      { label: "Draft the summary", done: true },
      { label: "Share with product", done: true },
    ],
    comments: [],
  },
  {
    id: "TSK-1036",
    title: "Rate limit the partner webhooks",
    description:
      "Apply per-tenant rate limits to the outbound webhooks so one noisy partner cannot starve the rest of the queue.",
    column: "In Progress",
    priority: "Medium",
    project: "Integration Gateway",
    assignee: "Amir Haddad",
    reporter: "Kenji Watanabe",
    dueDate: "20 Mar 2026",
    createdAt: "23 Feb 2026",
    labels: ["integrations", "platform"],
    estimate: "18h",
    logged: "7h",
    progress: 40,
    checklist: [
      { label: "Pick the limiter strategy", done: true },
      { label: "Implement per-tenant buckets", done: false },
      { label: "Load test at 5x volume", done: false },
    ],
    comments: [],
  },
  {
    id: "TSK-1037",
    title: "Close the regional data residency gaps",
    description:
      "Map every store that holds customer records to its region and move the three that still land outside the tenant boundary.",
    column: "In Progress",
    priority: "Urgent",
    project: "Regional Compliance Pack",
    assignee: "Jenny Klabber",
    reporter: "Donald Risher",
    dueDate: "27 Feb 2026",
    createdAt: "30 Jan 2026",
    labels: ["compliance", "security"],
    estimate: "32h",
    logged: "21h",
    progress: 65,
    checklist: [
      { label: "Inventory the data stores", done: true },
      { label: "Move the EU records", done: true },
      { label: "Move the APAC records", done: false },
      { label: "Sign-off from legal", done: false },
    ],
    comments: [
      {
        author: "Jenny Klabber",
        body: "EU is done. APAC needs a maintenance window, asking for the 3rd.",
        timestamp: "3 days ago, 10:05 AM",
      },
    ],
  },
  {
    id: "TSK-1038",
    title: "Produce the secondary logo lockups",
    description:
      "Deliver the stacked, horizontal, and monochrome lockups plus the clear-space rules for the brand guidelines.",
    column: "Backlog",
    priority: "Medium",
    project: "Brand Logo Design",
    assignee: "Sofia Lindqvist",
    reporter: "Jenny Klabber",
    dueDate: "17 Mar 2026",
    createdAt: "26 Feb 2026",
    labels: ["design-system", "brand"],
    estimate: "14h",
    logged: "0h",
    progress: 0,
    checklist: [
      { label: "Draft the lockup variants", done: false },
      { label: "Define clear-space rules", done: false },
    ],
    comments: [],
  },
]

export function getTask(id: string | undefined) {
  return tasks.find((task) => task.id === id)
}
