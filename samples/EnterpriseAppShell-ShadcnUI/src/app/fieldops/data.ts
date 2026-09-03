import { format } from "date-fns"

export type Priority = "High" | "Medium" | "Low"

export type Trade =
  | "HVAC"
  | "Network"
  | "Electrical"
  | "Escalator"
  | "Medical Gas"
  | "Generator"
  | "Lighting"
  | "Plumbing"
  | "Conveyor"
  | "BMS"
  | "Refrigeration"
  | "Security"
  | "UPS"
  | "Elevator"
  | "Fire Safety"

export type Assignment = {
  id: string
  site: string
  priority: Priority
  /** SLA deadline, ISO local time. */
  slaDue: string
  description: string
  trade: Trade
  /** Longer system label shown in the map callout. */
  system: string
  location: string
  lng: number
  lat: number
}

export type Technician = {
  id: string
  name: string
  trades: Trade[]
  base: string
  lng: number
  lat: number
}

/** Mock "now" shared with the rest of the app. */
export const TODAY = "2026-09-02"

export const assignments: Assignment[] = [
  {
    id: "DUB-A-1001",
    site: "Grand Canal Dock Tower A",
    priority: "High",
    slaDue: "2026-09-02T16:19:00",
    description: "Cooling not reaching target setpoint on 14th floor AHU cluster.",
    trade: "HVAC",
    system: "HVAC, Air Handling",
    location: "Grand Canal Dock, Dublin 2",
    lng: -6.2385,
    lat: 53.34,
  },
  {
    id: "DUB-A-1002",
    site: "Sandyford Data Hub",
    priority: "Medium",
    slaDue: "2026-09-02T19:19:00",
    description: "Edge switch uplink flapping in pod C rack lane.",
    trade: "Network",
    system: "Network, Switching",
    location: "Sandyford Business District, Dublin 18",
    lng: -6.205,
    lat: 53.278,
  },
  {
    id: "DUB-A-1003",
    site: "Dundrum Town Centre Service Wing",
    priority: "High",
    slaDue: "2026-09-02T17:19:00",
    description: "Main LT panel intermittent trip alarms during peak load.",
    trade: "Electrical",
    system: "Electrical, LT Distribution",
    location: "Dundrum, Dublin 14",
    lng: -6.242,
    lat: 53.289,
  },
  {
    id: "DUB-A-1004",
    site: "Heuston Station Concourse",
    priority: "Low",
    slaDue: "2026-09-03T01:19:00",
    description: "Escalator vibration at landing point, periodic noise.",
    trade: "Escalator",
    system: "Escalator, Vertical Transport",
    location: "Heuston, Dublin 8",
    lng: -6.295,
    lat: 53.3465,
  },
  {
    id: "DUB-A-1005",
    site: "St. James's Hospital Annex",
    priority: "High",
    slaDue: "2026-09-02T18:19:00",
    description: "Low pressure alarm in oxygen manifold backup line.",
    trade: "Medical Gas",
    system: "Medical Gas, Manifold",
    location: "James's Street, Dublin 8",
    lng: -6.2955,
    lat: 53.341,
  },
  {
    id: "DUB-A-1006",
    site: "Dublin Port Logistics Yard",
    priority: "Medium",
    slaDue: "2026-09-02T21:19:00",
    description: "Auto-start failure on backup DG set in bay 3.",
    trade: "Generator",
    system: "Generator, DG Sets",
    location: "North Wall Quay, Dublin 1",
    lng: -6.21,
    lat: 53.348,
  },
  {
    id: "DUB-A-1007",
    site: "Aviva Stadium",
    priority: "Low",
    slaDue: "2026-09-03T02:19:00",
    description: "Floodlight cluster 4 not responding to scene control.",
    trade: "Lighting",
    system: "Lighting, Scene Control",
    location: "Lansdowne Road, Dublin 4",
    lng: -6.228,
    lat: 53.335,
  },
  {
    id: "DUB-A-1008",
    site: "Ranelagh Residential Tower",
    priority: "Medium",
    slaDue: "2026-09-02T20:19:00",
    description: "Booster pump room leak and pressure drop complaints.",
    trade: "Plumbing",
    system: "Plumbing, Pump Systems",
    location: "Ranelagh, Dublin 6",
    lng: -6.247,
    lat: 53.323,
  },
  {
    id: "DUB-A-1009",
    site: "Ballymount Manufacturing Unit",
    priority: "High",
    slaDue: "2026-09-02T16:19:00",
    description: "Conveyor lane 2 jam alarms and motor overcurrent events.",
    trade: "Conveyor",
    system: "Conveyor, Drive Motors",
    location: "Ballymount Industrial Estate, Dublin 12",
    lng: -6.34,
    lat: 53.313,
  },
  {
    id: "DUB-A-1010",
    site: "Blanchardstown Corporate Plaza",
    priority: "Medium",
    slaDue: "2026-09-02T22:19:00",
    description: "Building management alarms not syncing to NOC dashboard.",
    trade: "BMS",
    system: "BMS, Integration",
    location: "Blanchardstown Corporate Park, Dublin 15",
    lng: -6.382,
    lat: 53.39,
  },
  {
    id: "DUB-A-1011",
    site: "Blackrock Retail Mega Store",
    priority: "High",
    slaDue: "2026-09-02T17:19:00",
    description: "Walk-in chiller temperature drifting beyond compliance limits.",
    trade: "Refrigeration",
    system: "Refrigeration, Cold Rooms",
    location: "Blackrock, Co. Dublin",
    lng: -6.178,
    lat: 53.301,
  },
  {
    id: "DUB-A-1012",
    site: "Dublin Airport Cargo Terminal",
    priority: "Medium",
    slaDue: "2026-09-03T05:19:00",
    description: "Perimeter camera ring dropping frames on the east fence.",
    trade: "Security",
    system: "Security, CCTV",
    location: "Dublin Airport, Co. Dublin",
    lng: -6.25,
    lat: 53.426,
  },
  {
    id: "DUB-A-1013",
    site: "Donnybrook Media House",
    priority: "Medium",
    slaDue: "2026-09-02T23:19:00",
    description: "UPS bank B failing self-test with elevated cell temperature.",
    trade: "UPS",
    system: "UPS, Battery Systems",
    location: "Donnybrook, Dublin 4",
    lng: -6.238,
    lat: 53.32,
  },
  {
    id: "DUB-A-1014",
    site: "Broombridge Transit Depot",
    priority: "Low",
    slaDue: "2026-09-03T03:19:00",
    description: "Service lift door interlock nuisance-tripping between levels.",
    trade: "Elevator",
    system: "Elevator, Door Interlocks",
    location: "Broombridge, Dublin 7",
    lng: -6.296,
    lat: 53.372,
  },
  {
    id: "DUB-A-1015",
    site: "Tallaght Civic Centre",
    priority: "High",
    slaDue: "2026-09-02T19:49:00",
    description: "Sprinkler zone 2 pressure switch stuck in fault state.",
    trade: "Fire Safety",
    system: "Fire Safety, Sprinklers",
    location: "Tallaght, Dublin 24",
    lng: -6.373,
    lat: 53.287,
  },
]

export const technicians: Technician[] = [
  {
    id: "TECH-01",
    name: "Ryan Mitchell",
    trades: ["HVAC", "Refrigeration"],
    base: "Ringsend",
    lng: -6.234,
    lat: 53.343,
  },
  {
    id: "TECH-02",
    name: "Ashley Bennett",
    trades: ["Network", "BMS"],
    base: "Sandyford",
    lng: -6.2085,
    lat: 53.281,
  },
  {
    id: "TECH-03",
    name: "Megan Fowler",
    trades: ["Electrical", "UPS"],
    base: "Rathmines",
    lng: -6.266,
    lat: 53.323,
  },
  {
    id: "TECH-04",
    name: "Tyler Brooks",
    trades: ["Escalator", "Elevator"],
    base: "Inchicore",
    lng: -6.316,
    lat: 53.34,
  },
  {
    id: "TECH-05",
    name: "Danielle Carter",
    trades: ["Medical Gas", "Fire Safety"],
    base: "Kilmainham",
    lng: -6.302,
    lat: 53.343,
  },
  {
    id: "TECH-06",
    name: "Marcus Reed",
    trades: ["Generator", "Electrical"],
    base: "East Wall",
    lng: -6.226,
    lat: 53.354,
  },
  {
    id: "TECH-07",
    name: "Chloe Sanders",
    trades: ["Lighting", "BMS"],
    base: "Ballsbridge",
    lng: -6.229,
    lat: 53.329,
  },
  {
    id: "TECH-08",
    name: "Derek Malone",
    trades: ["Plumbing", "Fire Safety"],
    base: "Clonskeagh",
    lng: -6.242,
    lat: 53.313,
  },
  {
    id: "TECH-09",
    name: "Natalie Pierce",
    trades: ["Conveyor", "Elevator"],
    base: "Ballymount",
    lng: -6.3355,
    lat: 53.3165,
  },
  {
    id: "TECH-10",
    name: "Jordan Ellis",
    trades: ["Network", "Security"],
    base: "Blanchardstown",
    lng: -6.3765,
    lat: 53.3865,
  },
  {
    id: "TECH-11",
    name: "Kevin Harper",
    trades: ["Refrigeration", "HVAC"],
    base: "Blackrock",
    lng: -6.183,
    lat: 53.3045,
  },
  {
    id: "TECH-12",
    name: "Brianna Cole",
    trades: ["Security", "Network"],
    base: "Santry",
    lng: -6.253,
    lat: 53.402,
  },
  {
    id: "TECH-13",
    name: "Aaron Whitfield",
    trades: ["UPS", "Generator"],
    base: "Donnybrook",
    lng: -6.242,
    lat: 53.3235,
  },
]

/** Recommended technician plus the dispatcher-facing reason, per assignment. */
export const recommendations: Record<
  string,
  { technicianId: string; rationale: string }
> = {
  "DUB-A-1001": {
    technicianId: "TECH-01",
    rationale:
      "Closest HVAC-qualified technician in Ringsend with full AHU experience; high SLA risk requires fastest response.",
  },
  "DUB-A-1002": {
    technicianId: "TECH-02",
    rationale:
      "Strong network and switch configuration skills; already based in Sandyford.",
  },
  "DUB-A-1003": {
    technicianId: "TECH-03",
    rationale:
      "Senior electrical technician with LT panel and safety expertise; short run south from Rathmines.",
  },
  "DUB-A-1004": {
    technicianId: "TECH-04",
    rationale:
      "Specialist in escalator and vertical transport systems; stationed at Inchicore, one stop from Heuston.",
  },
  "DUB-A-1005": {
    technicianId: "TECH-05",
    rationale:
      "Medical gas certified technician based in Kilmainham, minutes from the annex; critical healthcare SLA.",
  },
  "DUB-A-1006": {
    technicianId: "TECH-06",
    rationale:
      "DG set commissioning background and the only technician already inside the port estate at East Wall.",
  },
  "DUB-A-1007": {
    technicianId: "TECH-07",
    rationale:
      "Lighting control programmer for the stadium's last retrofit; low priority fits an evening slot.",
  },
  "DUB-A-1008": {
    technicianId: "TECH-08",
    rationale:
      "Pump room and booster set specialist working out of Clonskeagh, four minutes from site.",
  },
  "DUB-A-1009": {
    technicianId: "TECH-09",
    rationale:
      "Conveyor drive and overcurrent diagnostics experience; already on the Ballymount industrial round.",
  },
  "DUB-A-1010": {
    technicianId: "TECH-10",
    rationale:
      "Handled the NOC integration for this plaza; Blanchardstown base keeps travel under ten minutes.",
  },
  "DUB-A-1011": {
    technicianId: "TECH-11",
    rationale:
      "Refrigeration lead for the south Dublin retail sites; compliance drift needs a certified sign-off.",
  },
  "DUB-A-1012": {
    technicianId: "TECH-12",
    rationale:
      "CCTV and perimeter security specialist; only technician cleared for airside cargo access.",
  },
  "DUB-A-1013": {
    technicianId: "TECH-13",
    rationale:
      "Battery bank and UPS load-test certified, and lives a few streets away in Donnybrook.",
  },
  "DUB-A-1014": {
    technicianId: "TECH-04",
    rationale:
      "Door interlock faults match his last two depot callouts; low priority allows the longer drive.",
  },
  "DUB-A-1015": {
    technicianId: "TECH-05",
    rationale:
      "Fire safety certified and the closest available responder to the Tallaght civic campus.",
  },
}

export function getAssignment(id: string | undefined) {
  return assignments.find((assignment) => assignment.id === id)
}

export function getTechnician(id: string | undefined) {
  return technicians.find((technician) => technician.id === id)
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

/** "02 Sep 4:19 PM" */
export function formatSla(iso: string) {
  return format(new Date(iso), "dd MMM h:mm a")
}

/** "Sep 2, 7:19 PM" — the compact form used on the map carousel. */
export function formatSlaShort(iso: string) {
  return format(new Date(iso), "MMM d, h:mm a")
}
