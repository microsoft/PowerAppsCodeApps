export type CompanyStatus = "Customer" | "Prospect" | "Churned"
export type ContactStatus = "Active" | "New" | "Cold"
export type DealStage =
  | "Qualified"
  | "Proposal"
  | "Negotiation"
  | "Closed Won"
  | "Closed Lost"
export type LeadStatus = "New" | "Contacted" | "Qualified" | "Unqualified"
export type LeadSource = "Website" | "Referral" | "Event" | "Outbound" | "Webinar"
export type ActivityType = "Call" | "Meeting" | "Email" | "Task"

export type Company = {
  id: string
  name: string
  industry: string
  employees: string
  location: string
  website: string
  owner: string
  status: CompanyStatus
  annualValue: number
  customerSince: string
  description: string
}

export type Contact = {
  id: string
  name: string
  title: string
  companyId: string
  email: string
  phone: string
  owner: string
  status: ContactStatus
  lastContact: string
  tags: string[]
}

export type Deal = {
  id: string
  name: string
  companyId: string
  contactId: string
  value: number
  stage: DealStage
  probability: number
  owner: string
  closeDate: string
}

export type Lead = {
  id: string
  name: string
  company: string
  email: string
  source: LeadSource
  score: number
  status: LeadStatus
  owner: string
  createdAt: string
}

export type Activity = {
  id: string
  type: ActivityType
  subject: string
  contactId?: string
  companyId?: string
  dealId?: string
  owner: string
  date: string
  time: string
  done: boolean
}

export const dealStages: DealStage[] = [
  "Qualified",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
]

export const companies: Company[] = [
  {
    id: "northwind-traders",
    name: "Northwind Traders",
    industry: "Logistics",
    employees: "1,200",
    location: "Chicago, IL",
    website: "northwind.example.com",
    owner: "Priya Raman",
    status: "Customer",
    annualValue: 480000,
    customerSince: "Mar 2022",
    description:
      "Freight brokerage running a nationwide carrier network; expanding into cross-border shipping.",
  },
  {
    id: "contoso-health",
    name: "Contoso Health",
    industry: "Healthcare",
    employees: "5,400",
    location: "Boston, MA",
    website: "contosohealth.example.com",
    owner: "Marcus Hale",
    status: "Customer",
    annualValue: 960000,
    customerSince: "Jan 2021",
    description:
      "Regional hospital group standardising patient intake across 14 facilities.",
  },
  {
    id: "fabrikam-retail",
    name: "Fabrikam Retail",
    industry: "Retail",
    employees: "800",
    location: "Austin, TX",
    website: "fabrikam.example.com",
    owner: "Elena Fischer",
    status: "Prospect",
    annualValue: 0,
    customerSince: "—",
    description:
      "Speciality retailer replacing a legacy point-of-sale stack ahead of the holiday season.",
  },
  {
    id: "tailspin-toys",
    name: "Tailspin Toys",
    industry: "Manufacturing",
    employees: "350",
    location: "Portland, OR",
    website: "tailspintoys.example.com",
    owner: "Tom Okafor",
    status: "Customer",
    annualValue: 210000,
    customerSince: "Aug 2023",
    description:
      "Consumer goods manufacturer with a growing direct-to-consumer channel.",
  },
  {
    id: "adventure-works",
    name: "Adventure Works",
    industry: "Travel",
    employees: "2,100",
    location: "Denver, CO",
    website: "adventureworks.example.com",
    owner: "Sofia Duarte",
    status: "Prospect",
    annualValue: 0,
    customerSince: "—",
    description:
      "Tour operator consolidating booking and support tooling into a single platform.",
  },
  {
    id: "wide-world-importers",
    name: "Wide World Importers",
    industry: "Wholesale",
    employees: "640",
    location: "Miami, FL",
    website: "wideworld.example.com",
    owner: "Priya Raman",
    status: "Customer",
    annualValue: 315000,
    customerSince: "Nov 2022",
    description:
      "Import and distribution business modernising inventory forecasting.",
  },
  {
    id: "lucerne-publishing",
    name: "Lucerne Publishing",
    industry: "Media",
    employees: "180",
    location: "New York, NY",
    website: "lucerne.example.com",
    owner: "Marcus Hale",
    status: "Churned",
    annualValue: 0,
    customerSince: "Feb 2020",
    description:
      "Trade publisher that moved to an in-house solution after a leadership change.",
  },
  {
    id: "proseware-labs",
    name: "Proseware Labs",
    industry: "Software",
    employees: "95",
    location: "Seattle, WA",
    website: "proseware.example.com",
    owner: "Elena Fischer",
    status: "Prospect",
    annualValue: 0,
    customerSince: "—",
    description:
      "Developer tooling startup evaluating an enterprise plan after a funding round.",
  },
]

export const contacts: Contact[] = [
  {
    id: "dana-whitfield",
    name: "Dana Whitfield",
    title: "VP Operations",
    companyId: "northwind-traders",
    email: "dana.whitfield@northwind.example.com",
    phone: "+1 312 555 0117",
    owner: "Priya Raman",
    status: "Active",
    lastContact: "28 Aug 2026",
    tags: ["decision maker", "renewal"],
  },
  {
    id: "arjun-mehta",
    name: "Arjun Mehta",
    title: "Head of Logistics IT",
    companyId: "northwind-traders",
    email: "arjun.mehta@northwind.example.com",
    phone: "+1 312 555 0192",
    owner: "Priya Raman",
    status: "Active",
    lastContact: "25 Aug 2026",
    tags: ["technical"],
  },
  {
    id: "helen-park",
    name: "Helen Park",
    title: "Chief Information Officer",
    companyId: "contoso-health",
    email: "helen.park@contosohealth.example.com",
    phone: "+1 617 555 0143",
    owner: "Marcus Hale",
    status: "Active",
    lastContact: "01 Sep 2026",
    tags: ["executive", "expansion"],
  },
  {
    id: "raymond-boyle",
    name: "Raymond Boyle",
    title: "Director of Clinical Systems",
    companyId: "contoso-health",
    email: "raymond.boyle@contosohealth.example.com",
    phone: "+1 617 555 0166",
    owner: "Marcus Hale",
    status: "Active",
    lastContact: "22 Aug 2026",
    tags: ["champion"],
  },
  {
    id: "nadia-osei",
    name: "Nadia Osei",
    title: "Retail Technology Lead",
    companyId: "fabrikam-retail",
    email: "nadia.osei@fabrikam.example.com",
    phone: "+1 512 555 0104",
    owner: "Elena Fischer",
    status: "New",
    lastContact: "30 Aug 2026",
    tags: ["evaluation"],
  },
  {
    id: "colin-drake",
    name: "Colin Drake",
    title: "Chief Financial Officer",
    companyId: "fabrikam-retail",
    email: "colin.drake@fabrikam.example.com",
    phone: "+1 512 555 0188",
    owner: "Elena Fischer",
    status: "Cold",
    lastContact: "12 Jul 2026",
    tags: ["budget holder"],
  },
  {
    id: "marta-silva",
    name: "Marta Silva",
    title: "Operations Manager",
    companyId: "tailspin-toys",
    email: "marta.silva@tailspintoys.example.com",
    phone: "+1 503 555 0121",
    owner: "Tom Okafor",
    status: "Active",
    lastContact: "27 Aug 2026",
    tags: ["renewal"],
  },
  {
    id: "ben-cortez",
    name: "Ben Cortez",
    title: "Supply Chain Analyst",
    companyId: "tailspin-toys",
    email: "ben.cortez@tailspintoys.example.com",
    phone: "+1 503 555 0139",
    owner: "Tom Okafor",
    status: "Cold",
    lastContact: "04 Jun 2026",
    tags: ["end user"],
  },
  {
    id: "yasmin-haddad",
    name: "Yasmin Haddad",
    title: "Director of Digital",
    companyId: "adventure-works",
    email: "yasmin.haddad@adventureworks.example.com",
    phone: "+1 720 555 0155",
    owner: "Sofia Duarte",
    status: "New",
    lastContact: "31 Aug 2026",
    tags: ["decision maker"],
  },
  {
    id: "peter-lund",
    name: "Peter Lund",
    title: "Head of Customer Care",
    companyId: "adventure-works",
    email: "peter.lund@adventureworks.example.com",
    phone: "+1 720 555 0173",
    owner: "Sofia Duarte",
    status: "Active",
    lastContact: "26 Aug 2026",
    tags: ["champion"],
  },
  {
    id: "grace-oduya",
    name: "Grace Oduya",
    title: "Inventory Director",
    companyId: "wide-world-importers",
    email: "grace.oduya@wideworld.example.com",
    phone: "+1 305 555 0148",
    owner: "Priya Raman",
    status: "Active",
    lastContact: "29 Aug 2026",
    tags: ["expansion"],
  },
  {
    id: "victor-ramos",
    name: "Victor Ramos",
    title: "IT Manager",
    companyId: "wide-world-importers",
    email: "victor.ramos@wideworld.example.com",
    phone: "+1 305 555 0162",
    owner: "Priya Raman",
    status: "Cold",
    lastContact: "18 Jul 2026",
    tags: ["technical"],
  },
  {
    id: "irene-castellan",
    name: "Irene Castellan",
    title: "Publisher",
    companyId: "lucerne-publishing",
    email: "irene.castellan@lucerne.example.com",
    phone: "+1 212 555 0130",
    owner: "Marcus Hale",
    status: "Cold",
    lastContact: "09 Mar 2026",
    tags: ["win-back"],
  },
  {
    id: "sam-oyelaran",
    name: "Sam Oyelaran",
    title: "Co-founder & CTO",
    companyId: "proseware-labs",
    email: "sam@proseware.example.com",
    phone: "+1 206 555 0119",
    owner: "Elena Fischer",
    status: "New",
    lastContact: "01 Sep 2026",
    tags: ["technical", "evaluation"],
  },
]

export const deals: Deal[] = [
  {
    id: "DEAL-2041",
    name: "Cross-border freight rollout",
    companyId: "northwind-traders",
    contactId: "dana-whitfield",
    value: 240000,
    stage: "Negotiation",
    probability: 70,
    owner: "Priya Raman",
    closeDate: "30 Sep 2026",
  },
  {
    id: "DEAL-2042",
    name: "Patient intake expansion",
    companyId: "contoso-health",
    contactId: "helen-park",
    value: 420000,
    stage: "Proposal",
    probability: 50,
    owner: "Marcus Hale",
    closeDate: "31 Oct 2026",
  },
  {
    id: "DEAL-2043",
    name: "Point-of-sale replacement",
    companyId: "fabrikam-retail",
    contactId: "nadia-osei",
    value: 185000,
    stage: "Qualified",
    probability: 25,
    owner: "Elena Fischer",
    closeDate: "15 Nov 2026",
  },
  {
    id: "DEAL-2044",
    name: "Direct-to-consumer portal",
    companyId: "tailspin-toys",
    contactId: "marta-silva",
    value: 96000,
    stage: "Closed Won",
    probability: 100,
    owner: "Tom Okafor",
    closeDate: "14 Aug 2026",
  },
  {
    id: "DEAL-2045",
    name: "Booking platform consolidation",
    companyId: "adventure-works",
    contactId: "yasmin-haddad",
    value: 310000,
    stage: "Qualified",
    probability: 20,
    owner: "Sofia Duarte",
    closeDate: "18 Dec 2026",
  },
  {
    id: "DEAL-2046",
    name: "Inventory forecasting add-on",
    companyId: "wide-world-importers",
    contactId: "grace-oduya",
    value: 128000,
    stage: "Negotiation",
    probability: 65,
    owner: "Priya Raman",
    closeDate: "09 Oct 2026",
  },
  {
    id: "DEAL-2047",
    name: "Enterprise plan upgrade",
    companyId: "proseware-labs",
    contactId: "sam-oyelaran",
    value: 74000,
    stage: "Proposal",
    probability: 45,
    owner: "Elena Fischer",
    closeDate: "23 Oct 2026",
  },
  {
    id: "DEAL-2048",
    name: "Support desk modernisation",
    companyId: "adventure-works",
    contactId: "peter-lund",
    value: 88000,
    stage: "Proposal",
    probability: 40,
    owner: "Sofia Duarte",
    closeDate: "06 Nov 2026",
  },
  {
    id: "DEAL-2049",
    name: "Carrier analytics module",
    companyId: "northwind-traders",
    contactId: "arjun-mehta",
    value: 62000,
    stage: "Qualified",
    probability: 30,
    owner: "Priya Raman",
    closeDate: "27 Nov 2026",
  },
  {
    id: "DEAL-2050",
    name: "Clinical reporting pilot",
    companyId: "contoso-health",
    contactId: "raymond-boyle",
    value: 145000,
    stage: "Closed Won",
    probability: 100,
    owner: "Marcus Hale",
    closeDate: "21 Jul 2026",
  },
  {
    id: "DEAL-2051",
    name: "Warehouse mobile rollout",
    companyId: "tailspin-toys",
    contactId: "ben-cortez",
    value: 54000,
    stage: "Closed Won",
    probability: 100,
    owner: "Tom Okafor",
    closeDate: "05 Aug 2026",
  },
  {
    id: "DEAL-2052",
    name: "Editorial workflow suite",
    companyId: "lucerne-publishing",
    contactId: "irene-castellan",
    value: 132000,
    stage: "Closed Lost",
    probability: 0,
    owner: "Marcus Hale",
    closeDate: "19 Jun 2026",
  },
]

export const leads: Lead[] = [
  {
    id: "LEAD-3110",
    name: "Owen Bradshaw",
    company: "Blue Yonder Airlines",
    email: "o.bradshaw@blueyonder.example.com",
    source: "Website",
    score: 82,
    status: "New",
    owner: "Sofia Duarte",
    createdAt: "01 Sep 2026",
  },
  {
    id: "LEAD-3111",
    name: "Amara Nwosu",
    company: "Relecloud",
    email: "amara.nwosu@relecloud.example.com",
    source: "Referral",
    score: 91,
    status: "New",
    owner: "Priya Raman",
    createdAt: "01 Sep 2026",
  },
  {
    id: "LEAD-3112",
    name: "Felix Sorensen",
    company: "Trey Research",
    email: "f.sorensen@treyresearch.example.com",
    source: "Webinar",
    score: 64,
    status: "Contacted",
    owner: "Elena Fischer",
    createdAt: "31 Aug 2026",
  },
  {
    id: "LEAD-3113",
    name: "Priscilla Mbeki",
    company: "Woodgrove Bank",
    email: "p.mbeki@woodgrove.example.com",
    source: "Event",
    score: 77,
    status: "Contacted",
    owner: "Marcus Hale",
    createdAt: "30 Aug 2026",
  },
  {
    id: "LEAD-3114",
    name: "Jonas Weber",
    company: "Alpine Ski House",
    email: "jonas.weber@alpineski.example.com",
    source: "Outbound",
    score: 38,
    status: "Unqualified",
    owner: "Tom Okafor",
    createdAt: "29 Aug 2026",
  },
  {
    id: "LEAD-3115",
    name: "Layla Haddad",
    company: "Litware Inc",
    email: "layla.haddad@litware.example.com",
    source: "Website",
    score: 88,
    status: "Qualified",
    owner: "Elena Fischer",
    createdAt: "28 Aug 2026",
  },
  {
    id: "LEAD-3116",
    name: "Diego Santoro",
    company: "Coho Vineyard",
    email: "d.santoro@coho.example.com",
    source: "Referral",
    score: 55,
    status: "New",
    owner: "Sofia Duarte",
    createdAt: "28 Aug 2026",
  },
  {
    id: "LEAD-3117",
    name: "Keiko Tanaka",
    company: "Fourth Coffee",
    email: "k.tanaka@fourthcoffee.example.com",
    source: "Event",
    score: 73,
    status: "Contacted",
    owner: "Priya Raman",
    createdAt: "26 Aug 2026",
  },
  {
    id: "LEAD-3118",
    name: "Martin Ilyich",
    company: "Graphic Design Institute",
    email: "m.ilyich@gdi.example.com",
    source: "Outbound",
    score: 29,
    status: "Unqualified",
    owner: "Marcus Hale",
    createdAt: "24 Aug 2026",
  },
  {
    id: "LEAD-3119",
    name: "Sofia Bianchi",
    company: "VanArsdel Ltd",
    email: "s.bianchi@vanarsdel.example.com",
    source: "Webinar",
    score: 69,
    status: "Qualified",
    owner: "Tom Okafor",
    createdAt: "22 Aug 2026",
  },
]

export const activities: Activity[] = [
  {
    id: "ACT-5001",
    type: "Call",
    subject: "Renewal pricing walkthrough",
    contactId: "dana-whitfield",
    companyId: "northwind-traders",
    dealId: "DEAL-2041",
    owner: "Priya Raman",
    date: "2026-09-02",
    time: "09:30",
    done: true,
  },
  {
    id: "ACT-5002",
    type: "Meeting",
    subject: "Security review with clinical IT",
    contactId: "helen-park",
    companyId: "contoso-health",
    dealId: "DEAL-2042",
    owner: "Marcus Hale",
    date: "2026-09-02",
    time: "13:00",
    done: false,
  },
  {
    id: "ACT-5003",
    type: "Email",
    subject: "Send point-of-sale migration plan",
    contactId: "nadia-osei",
    companyId: "fabrikam-retail",
    dealId: "DEAL-2043",
    owner: "Elena Fischer",
    date: "2026-09-02",
    time: "16:15",
    done: false,
  },
  {
    id: "ACT-5004",
    type: "Task",
    subject: "Prepare mutual action plan",
    companyId: "adventure-works",
    dealId: "DEAL-2045",
    owner: "Sofia Duarte",
    date: "2026-09-03",
    time: "10:00",
    done: false,
  },
  {
    id: "ACT-5005",
    type: "Meeting",
    subject: "Quarterly business review",
    contactId: "grace-oduya",
    companyId: "wide-world-importers",
    dealId: "DEAL-2046",
    owner: "Priya Raman",
    date: "2026-09-03",
    time: "14:30",
    done: false,
  },
  {
    id: "ACT-5006",
    type: "Call",
    subject: "Technical deep dive on API limits",
    contactId: "sam-oyelaran",
    companyId: "proseware-labs",
    dealId: "DEAL-2047",
    owner: "Elena Fischer",
    date: "2026-09-04",
    time: "11:00",
    done: false,
  },
  {
    id: "ACT-5007",
    type: "Email",
    subject: "Follow up on support desk scope",
    contactId: "peter-lund",
    companyId: "adventure-works",
    dealId: "DEAL-2048",
    owner: "Sofia Duarte",
    date: "2026-09-04",
    time: "15:45",
    done: false,
  },
  {
    id: "ACT-5008",
    type: "Task",
    subject: "Draft carrier analytics proposal",
    contactId: "arjun-mehta",
    companyId: "northwind-traders",
    dealId: "DEAL-2049",
    owner: "Priya Raman",
    date: "2026-09-07",
    time: "09:00",
    done: false,
  },
  {
    id: "ACT-5009",
    type: "Meeting",
    subject: "Win-back conversation",
    contactId: "irene-castellan",
    companyId: "lucerne-publishing",
    owner: "Marcus Hale",
    date: "2026-09-08",
    time: "10:30",
    done: false,
  },
  {
    id: "ACT-5010",
    type: "Call",
    subject: "Warehouse rollout retrospective",
    contactId: "marta-silva",
    companyId: "tailspin-toys",
    dealId: "DEAL-2051",
    owner: "Tom Okafor",
    date: "2026-08-31",
    time: "12:00",
    done: true,
  },
]

export const monthlyRevenue = [
  { month: "Oct", revenue: 182000, won: 4 },
  { month: "Nov", revenue: 215000, won: 5 },
  { month: "Dec", revenue: 168000, won: 3 },
  { month: "Jan", revenue: 241000, won: 6 },
  { month: "Feb", revenue: 198000, won: 4 },
  { month: "Mar", revenue: 276000, won: 7 },
  { month: "Apr", revenue: 254000, won: 6 },
  { month: "May", revenue: 302000, won: 8 },
  { month: "Jun", revenue: 288000, won: 7 },
  { month: "Jul", revenue: 331000, won: 9 },
  { month: "Aug", revenue: 295000, won: 7 },
  { month: "Sep", revenue: 118000, won: 3 },
]

export function getCompany(id: string | undefined) {
  return companies.find((company) => company.id === id)
}

export function getContact(id: string | undefined) {
  return contacts.find((contact) => contact.id === id)
}

export function companyName(id: string) {
  return getCompany(id)?.name ?? "—"
}

export function contactsByCompany(companyId: string) {
  return contacts.filter((contact) => contact.companyId === companyId)
}

export function dealsByCompany(companyId: string) {
  return deals.filter((deal) => deal.companyId === companyId)
}

export function dealsByContact(contactId: string) {
  return deals.filter((deal) => deal.contactId === contactId)
}

export function activitiesFor(ref: { contactId?: string; companyId?: string }) {
  return activities
    .filter((activity) =>
      ref.contactId
        ? activity.contactId === ref.contactId
        : activity.companyId === ref.companyId
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

export const openStages: DealStage[] = ["Qualified", "Proposal", "Negotiation"]

export function isOpen(deal: Deal) {
  return openStages.includes(deal.stage)
}

export function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value)
}
