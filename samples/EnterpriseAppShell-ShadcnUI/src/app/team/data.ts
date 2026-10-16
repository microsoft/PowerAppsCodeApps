export type MemberStatus = "Active" | "Away" | "Offline"
export type DealStatus = "Ongoing" | "Closed" | "On Hold" | "Cancelled"

export type TeamMember = {
  id: string
  name: string
  role: string
  department: string
  email: string
  phone: string
  location: string
  company: string
  status: MemberStatus
  employmentType: string
  joinedAt: string
  lastActive: string
  bio: string
  skills: string[]
  stats: { projects: number; tasks: number; hours: string }
  attributes: { label: string; value: string }[]
  deals: { name: string; amount: string; status: DealStatus; duration: string }[]
  projects: { name: string; progress: number; dueDate: string }[]
  activity: { title: string; detail: string; timestamp: string }[]
}

export const teamMembers: TeamMember[] = [
  {
    id: "jenny-klabber",
    name: "Jenny Klabber",
    role: "Head of Product Design",
    department: "Design",
    email: "jenny@kteam.com",
    phone: "+31 6 12345678",
    location: "SF, Bay Area",
    company: "KeenThemes",
    status: "Active",
    employmentType: "Full-time",
    joinedAt: "Mar 2, 2023",
    lastActive: "Today at 13:06",
    bio: "Leads the design system practice and partners with engineering on the enterprise shell.",
    skills: ["Design Systems", "Figma", "Prototyping", "Accessibility"],
    stats: { projects: 18, tasks: 42, hours: "168h 40m" },
    attributes: [
      { label: "customer_id", value: "CUST567" },
      { label: "c_name", value: "jenny" },
      { label: "license_id", value: "LIC123" },
      { label: "log_id", value: "CUST567" },
      { label: "resv_code", value: "CS345" },
      { label: "orders_in", value: "JENNYTIME" },
    ],
    deals: [
      { name: "Acme Software License", amount: "$5,000", status: "Ongoing", duration: "30 days" },
      { name: "Strategic Partnership Deal", amount: "$12,500", status: "Closed", duration: "45 days" },
      { name: "Client Onboarding", amount: "$18,000", status: "On Hold", duration: "60 days" },
      { name: "Widget Supply Agreement", amount: "$3,500", status: "Cancelled", duration: "10 days" },
      { name: "Project X Redesign", amount: "$8,200", status: "Closed", duration: "15 days" },
    ],
    projects: [
      { name: "Brand Logo Design", progress: 53, dueDate: "Feb 14, 2026" },
      { name: "Redesign - Landing Page", progress: 12, dueDate: "Mar 03, 2026" },
      { name: "Design System v3", progress: 78, dueDate: "Apr 21, 2026" },
    ],
    activity: [
      { title: "Sent an inquiry about a new product", detail: "Routed to the partnerships team", timestamp: "Today, 9:00 AM" },
      { title: "Attended a webinar on new product features", detail: "Leadership Development Series: Part 1", timestamp: "3 days ago, 11:45 AM" },
      { title: "Signed in to the Customer Portal", detail: "Session from San Francisco, CA", timestamp: "5 days ago, 4:07 PM" },
      { title: "Received a promotional email campaign", detail: "Spring release announcement", timestamp: "1 week ago, 11:15 AM" },
    ],
  },
  {
    id: "donald-risher",
    name: "Donald Risher",
    role: "Engineering Manager",
    department: "Engineering",
    email: "donald@kteam.com",
    phone: "+1 415 555 0132",
    location: "Austin, TX",
    company: "KeenThemes",
    status: "Active",
    employmentType: "Full-time",
    joinedAt: "Jan 18, 2022",
    lastActive: "Today at 11:22",
    bio: "Runs the platform team and owns the delivery roadmap for internal tooling.",
    skills: ["TypeScript", "React", "Azure", "CI/CD"],
    stats: { projects: 24, tasks: 61, hours: "192h 10m" },
    attributes: [
      { label: "customer_id", value: "CUST912" },
      { label: "c_name", value: "donald" },
      { label: "license_id", value: "LIC884" },
      { label: "log_id", value: "CUST912" },
      { label: "resv_code", value: "DR221" },
      { label: "orders_in", value: "DONALDOPS" },
    ],
    deals: [
      { name: "Platform Modernization", amount: "$46,000", status: "Ongoing", duration: "90 days" },
      { name: "Observability Rollout", amount: "$9,750", status: "Closed", duration: "28 days" },
      { name: "Vendor Consolidation", amount: "$21,300", status: "On Hold", duration: "75 days" },
    ],
    projects: [
      { name: "Enterprise App Shell", progress: 64, dueDate: "May 09, 2026" },
      { name: "Auth Migration", progress: 31, dueDate: "Jun 30, 2026" },
    ],
    activity: [
      { title: "Merged 4 pull requests", detail: "enterprise-app-shell repository", timestamp: "Today, 10:41 AM" },
      { title: "Approved a quarterly budget request", detail: "Platform tooling renewal", timestamp: "Yesterday, 3:12 PM" },
      { title: "Opened an incident review", detail: "Sev-3, resolved in 42 minutes", timestamp: "4 days ago, 8:05 AM" },
    ],
  },
  {
    id: "maria-santos",
    name: "Maria Santos",
    role: "Senior Product Manager",
    department: "Product",
    email: "maria@kteam.com",
    phone: "+34 611 22 33 44",
    location: "Barcelona, ES",
    company: "KeenThemes",
    status: "Away",
    employmentType: "Full-time",
    joinedAt: "Sep 5, 2023",
    lastActive: "Yesterday at 18:40",
    bio: "Owns the customer analytics roadmap and works closely with enterprise accounts.",
    skills: ["Roadmapping", "Analytics", "Discovery", "SQL"],
    stats: { projects: 12, tasks: 37, hours: "141h 05m" },
    attributes: [
      { label: "customer_id", value: "CUST341" },
      { label: "c_name", value: "maria" },
      { label: "license_id", value: "LIC410" },
      { label: "log_id", value: "CUST341" },
      { label: "resv_code", value: "MS118" },
      { label: "orders_in", value: "MARIAPM" },
    ],
    deals: [
      { name: "Analytics Suite Upgrade", amount: "$15,400", status: "Ongoing", duration: "40 days" },
      { name: "Retail Pilot Program", amount: "$6,900", status: "Closed", duration: "22 days" },
    ],
    projects: [
      { name: "Client Insights Portal", progress: 47, dueDate: "Apr 02, 2026" },
      { name: "Usage Reporting", progress: 88, dueDate: "Feb 27, 2026" },
    ],
    activity: [
      { title: "Published the Q3 product brief", detail: "Shared with 18 stakeholders", timestamp: "Yesterday, 6:20 PM" },
      { title: "Ran 5 customer discovery calls", detail: "Enterprise segment", timestamp: "2 days ago, 2:00 PM" },
    ],
  },
  {
    id: "amir-haddad",
    name: "Amir Haddad",
    role: "Data Analyst",
    department: "Data",
    email: "amir@kteam.com",
    phone: "+971 50 123 4567",
    location: "Dubai, AE",
    company: "KeenThemes",
    status: "Active",
    employmentType: "Contract",
    joinedAt: "Nov 12, 2024",
    lastActive: "Today at 08:15",
    bio: "Builds reporting pipelines and keeps the executive dashboards honest.",
    skills: ["Power BI", "Python", "Dataverse", "Forecasting"],
    stats: { projects: 8, tasks: 25, hours: "96h 30m" },
    attributes: [
      { label: "customer_id", value: "CUST778" },
      { label: "c_name", value: "amir" },
      { label: "license_id", value: "LIC205" },
      { label: "log_id", value: "CUST778" },
      { label: "resv_code", value: "AH903" },
      { label: "orders_in", value: "AMIRDATA" },
    ],
    deals: [
      { name: "Reporting Retainer", amount: "$4,200", status: "Ongoing", duration: "180 days" },
      { name: "Forecast Model Review", amount: "$2,800", status: "Closed", duration: "12 days" },
    ],
    projects: [{ name: "Revenue Forecast Model", progress: 72, dueDate: "Mar 19, 2026" }],
    activity: [
      { title: "Refreshed the executive dataset", detail: "12 tables, 4.2M rows", timestamp: "Today, 8:15 AM" },
      { title: "Flagged an anomaly in churn metrics", detail: "Escalated to the product team", timestamp: "3 days ago, 1:30 PM" },
    ],
  },
  {
    id: "sofia-lindqvist",
    name: "Sofia Lindqvist",
    role: "UX Researcher",
    department: "Design",
    email: "sofia@kteam.com",
    phone: "+46 70 123 45 67",
    location: "Stockholm, SE",
    company: "KeenThemes",
    status: "Offline",
    employmentType: "Full-time",
    joinedAt: "Jun 1, 2023",
    lastActive: "5 days ago",
    bio: "Runs the research programme and maintains the insight repository.",
    skills: ["User Research", "Interviews", "Usability", "Synthesis"],
    stats: { projects: 10, tasks: 19, hours: "88h 55m" },
    attributes: [
      { label: "customer_id", value: "CUST620" },
      { label: "c_name", value: "sofia" },
      { label: "license_id", value: "LIC332" },
      { label: "log_id", value: "CUST620" },
      { label: "resv_code", value: "SL447" },
      { label: "orders_in", value: "SOFIAUX" },
    ],
    deals: [
      { name: "Research Panel Renewal", amount: "$3,100", status: "On Hold", duration: "35 days" },
    ],
    projects: [{ name: "Onboarding Study", progress: 25, dueDate: "May 22, 2026" }],
    activity: [
      { title: "Closed the onboarding study round", detail: "14 participants, 9 findings", timestamp: "5 days ago, 4:45 PM" },
    ],
  },
  {
    id: "kenji-watanabe",
    name: "Kenji Watanabe",
    role: "Solutions Architect",
    department: "Engineering",
    email: "kenji@kteam.com",
    phone: "+81 90 1234 5678",
    location: "Tokyo, JP",
    company: "KeenThemes",
    status: "Active",
    employmentType: "Full-time",
    joinedAt: "Feb 20, 2021",
    lastActive: "Today at 06:02",
    bio: "Designs integration patterns for regulated customers across APAC.",
    skills: ["Architecture", "Security", "Integrations", "Bicep"],
    stats: { projects: 21, tasks: 48, hours: "176h 20m" },
    attributes: [
      { label: "customer_id", value: "CUST155" },
      { label: "c_name", value: "kenji" },
      { label: "license_id", value: "LIC998" },
      { label: "log_id", value: "CUST155" },
      { label: "resv_code", value: "KW512" },
      { label: "orders_in", value: "KENJIARCH" },
    ],
    deals: [
      { name: "APAC Rollout Phase 2", amount: "$62,000", status: "Ongoing", duration: "120 days" },
      { name: "Compliance Assessment", amount: "$11,800", status: "Closed", duration: "30 days" },
      { name: "Legacy Connector Retirement", amount: "$7,400", status: "Cancelled", duration: "20 days" },
    ],
    projects: [
      { name: "Integration Gateway", progress: 58, dueDate: "Jul 11, 2026" },
      { name: "Regional Compliance Pack", progress: 94, dueDate: "Feb 09, 2026" },
    ],
    activity: [
      { title: "Signed off the gateway architecture", detail: "Reviewed with the security board", timestamp: "Today, 6:02 AM" },
      { title: "Delivered an integration workshop", detail: "3 partner engineering teams", timestamp: "6 days ago, 10:00 AM" },
    ],
  },
]

export function getTeamMember(id: string | undefined) {
  return teamMembers.find((member) => member.id === id)
}
