export type IncidentType =
  | "Injury"
  | "Near miss"
  | "Property damage"
  | "Environmental"
  | "Hazard"

export type Severity = "Low" | "Medium" | "High" | "Critical"

export type IncidentStatus =
  | "Reported"
  | "Investigating"
  | "Actions pending"
  | "Closed"

export type ActionStage = "Open" | "In Progress" | "Blocked" | "Verify" | "Done"

export type WalkStatus = "Scheduled" | "In progress" | "Completed"

export type CheckResult = "Pass" | "Fail" | "N/A"

export type RiskCategory =
  | "Mechanical"
  | "Chemical"
  | "Ergonomic"
  | "Electrical"
  | "Environmental"
  | "Behavioural"

export type Site =
  | "Cleveland Plant"
  | "Memphis DC"
  | "Austin Lab"
  | "Baltimore Yard"
  | "Phoenix Works"

export type Photo = {
  id: string
  name: string
  caption: string
  /** Object URL for user-uploaded files; mock records render a placeholder. */
  url?: string
}

export type Incident = {
  id: string
  title: string
  type: IncidentType
  severity: Severity
  status: IncidentStatus
  site: Site
  area: string
  reportedBy: string
  owner: string
  occurredOn: string
  reportedOn: string
  lostTimeDays: number
  description: string
  immediateAction: string
  rootCause?: string
  photos: Photo[]
}

export type CheckItem = {
  id: string
  prompt: string
  result: CheckResult
  note?: string
}

export type Finding = {
  id: string
  summary: string
  severity: Severity
  area: string
  photos: Photo[]
}

export type SafetyWalk = {
  id: string
  title: string
  site: Site
  route: string
  leader: string
  observers: string[]
  scheduledFor: string
  status: WalkStatus
  checklist: CheckItem[]
  findings: Finding[]
}

export type Risk = {
  id: string
  hazard: string
  category: RiskCategory
  site: Site
  activity: string
  owner: string
  likelihood: number
  impact: number
  residualLikelihood: number
  residualImpact: number
  controls: string[]
  reviewedOn: string
  nextReview: string
}

export type CorrectiveAction = {
  id: string
  title: string
  stage: ActionStage
  severity: Severity
  site: Site
  owner: string
  dueOn: string
  sourceIncidentId?: string
  sourceRiskId?: string
}

export const sites: Site[] = [
  "Cleveland Plant",
  "Memphis DC",
  "Austin Lab",
  "Baltimore Yard",
  "Phoenix Works",
]

export const incidentTypes: IncidentType[] = [
  "Injury",
  "Near miss",
  "Property damage",
  "Environmental",
  "Hazard",
]

export const severities: Severity[] = ["Low", "Medium", "High", "Critical"]

export const actionStages: ActionStage[] = [
  "Open",
  "In Progress",
  "Blocked",
  "Verify",
  "Done",
]

export const riskCategories: RiskCategory[] = [
  "Mechanical",
  "Chemical",
  "Ergonomic",
  "Electrical",
  "Environmental",
  "Behavioural",
]

export const likelihoodLabels = [
  "Rare",
  "Unlikely",
  "Possible",
  "Likely",
  "Almost certain",
]

export const impactLabels = [
  "Negligible",
  "Minor",
  "Moderate",
  "Major",
  "Severe",
]

export const incidents: Incident[] = [
  {
    id: "INC-2041",
    title: "Forklift clipped racking in aisle 12",
    type: "Property damage",
    severity: "Medium",
    status: "Investigating",
    site: "Memphis DC",
    area: "Aisle 12 — bulk storage",
    reportedBy: "Devon Ashby",
    owner: "Aisha Bello",
    occurredOn: "2026-08-31",
    reportedOn: "2026-08-31",
    lostTimeDays: 0,
    description:
      "A counterbalance forklift reversing out of a pick face contacted the upright of bay 12C. No personnel were in the aisle at the time.",
    immediateAction:
      "Aisle cordoned off, load transferred to bay 12F, racking engineer booked for structural inspection.",
    photos: [
      { id: "PH-1", name: "bay-12c-upright.jpg", caption: "Deformed upright at 400mm" },
      { id: "PH-2", name: "aisle-cordon.jpg", caption: "Exclusion zone in place" },
    ],
  },
  {
    id: "INC-2040",
    title: "Chemical splash during decant",
    type: "Injury",
    severity: "High",
    status: "Actions pending",
    site: "Austin Lab",
    area: "Wet bench 3",
    reportedBy: "Renée Okonkwo",
    owner: "Naomi Sharpe",
    occurredOn: "2026-08-28",
    reportedOn: "2026-08-28",
    lostTimeDays: 2,
    description:
      "Technician decanting solvent from a 20L drum experienced a splash to the forearm when the pump seal released under pressure.",
    immediateAction:
      "Emergency shower used within 10 seconds, first aid administered, decant pump withdrawn from service.",
    rootCause:
      "Pump seal past its replacement interval; no pressure-release step in the decant procedure.",
    photos: [
      { id: "PH-3", name: "pump-seal.jpg", caption: "Failed seal on decant pump" },
    ],
  },
  {
    id: "INC-2039",
    title: "Near miss — pedestrian in vehicle lane",
    type: "Near miss",
    severity: "High",
    status: "Investigating",
    site: "Baltimore Yard",
    area: "Gatehouse approach",
    reportedBy: "Ellis Moreau",
    owner: "Owen Cassidy",
    occurredOn: "2026-08-27",
    reportedOn: "2026-08-27",
    lostTimeDays: 0,
    description:
      "A contractor walked across the HGV turning circle outside the marked walkway. The driver stopped approximately 3 metres short.",
    immediateAction:
      "Contractor re-inducted, temporary barriers placed at the gatehouse crossing point.",
    photos: [
      { id: "PH-4", name: "turning-circle.jpg", caption: "Unmarked desire line" },
      { id: "PH-5", name: "barriers.jpg", caption: "Temporary barrier install" },
    ],
  },
  {
    id: "INC-2038",
    title: "Guard interlock bypassed on press 4",
    type: "Hazard",
    severity: "Critical",
    status: "Actions pending",
    site: "Cleveland Plant",
    area: "Press shop",
    reportedBy: "Marisol Vega",
    owner: "Owen Cassidy",
    occurredOn: "2026-08-24",
    reportedOn: "2026-08-25",
    lostTimeDays: 0,
    description:
      "During a routine audit the interlock on press 4's rear guard was found taped in the closed position, allowing the press to cycle with the guard open.",
    immediateAction:
      "Press locked out immediately, shift supervisor stood down pending investigation.",
    rootCause:
      "Jam clearance takes 8 minutes through the correct procedure; crews under throughput pressure defeated the guard.",
    photos: [
      { id: "PH-6", name: "interlock-tape.jpg", caption: "Tape across the interlock tongue" },
      { id: "PH-7", name: "press-4-loto.jpg", caption: "Lockout applied" },
      { id: "PH-8", name: "guard-open.jpg", caption: "Rear guard in open position" },
    ],
  },
  {
    id: "INC-2037",
    title: "Slip on wet floor at loading dock",
    type: "Injury",
    severity: "Medium",
    status: "Closed",
    site: "Memphis DC",
    area: "Dock 3",
    reportedBy: "Priyanka Roy",
    owner: "Aisha Bello",
    occurredOn: "2026-08-20",
    reportedOn: "2026-08-20",
    lostTimeDays: 1,
    description:
      "Operative slipped on rainwater tracked in from the dock apron, landing on the left hip. No fracture on assessment.",
    immediateAction: "Spill kit deployed, absorbent matting laid at the dock threshold.",
    rootCause: "Dock seal degraded, allowing water ingress in heavy rain.",
    photos: [{ id: "PH-9", name: "dock-3-seal.jpg", caption: "Perished dock seal" }],
  },
  {
    id: "INC-2036",
    title: "Coolant spill to surface drain",
    type: "Environmental",
    severity: "High",
    status: "Investigating",
    site: "Phoenix Works",
    area: "Machine bay 2",
    reportedBy: "Sadie Alvarez",
    owner: "Greta Lindqvist",
    occurredOn: "2026-08-18",
    reportedOn: "2026-08-18",
    lostTimeDays: 0,
    description:
      "Approximately 60 litres of water-miscible coolant escaped a split hose and reached the yard surface drain.",
    immediateAction:
      "Drain blocked with a mat, spill contained and pumped to waste, regulator notified within 4 hours.",
    photos: [
      { id: "PH-10", name: "split-hose.jpg", caption: "Split in the return hose" },
      { id: "PH-11", name: "drain-mat.jpg", caption: "Drain mat deployed" },
    ],
  },
  {
    id: "INC-2035",
    title: "Manual handling strain — carton picking",
    type: "Injury",
    severity: "Low",
    status: "Closed",
    site: "Memphis DC",
    area: "Pick module B",
    reportedBy: "Bryan Whitlock",
    owner: "Aisha Bello",
    occurredOn: "2026-08-14",
    reportedOn: "2026-08-14",
    lostTimeDays: 0,
    description:
      "Picker reported lower back discomfort after repeatedly retrieving cartons from the bottom pick level.",
    immediateAction: "Task rotated, physio assessment arranged through occupational health.",
    rootCause: "Fast-moving SKUs assigned to floor-level locations.",
    photos: [],
  },
  {
    id: "INC-2034",
    title: "Arc flash near miss at panel DB-7",
    type: "Near miss",
    severity: "Critical",
    status: "Actions pending",
    site: "Cleveland Plant",
    area: "Substation corridor",
    reportedBy: "Kai Tanaka",
    owner: "Tomás Reyes",
    occurredOn: "2026-08-11",
    reportedOn: "2026-08-11",
    lostTimeDays: 0,
    description:
      "An electrician opened DB-7 believing it to be isolated. A live 415V busbar was exposed; no contact was made.",
    immediateAction: "Panel secured, permit-to-work suspended plant-wide pending review.",
    rootCause: "Isolation register showed a stale entry from the previous shift.",
    photos: [
      { id: "PH-12", name: "db7-panel.jpg", caption: "DB-7 with cover removed" },
    ],
  },
  {
    id: "INC-2033",
    title: "Ladder used in place of podium steps",
    type: "Hazard",
    severity: "Medium",
    status: "Closed",
    site: "Baltimore Yard",
    area: "Workshop mezzanine",
    reportedBy: "Owen Cassidy",
    owner: "Ellis Moreau",
    occurredOn: "2026-08-07",
    reportedOn: "2026-08-07",
    lostTimeDays: 0,
    description:
      "A leaning ladder was in use for a 25-minute overhead task where podium steps are specified.",
    immediateAction: "Task stopped, podium steps issued and ladder returned to stores.",
    rootCause: "Only one podium unit available across two workshops.",
    photos: [{ id: "PH-13", name: "ladder-mezzanine.jpg", caption: "Leaning ladder in use" }],
  },
  {
    id: "INC-2032",
    title: "Fume cupboard airflow below threshold",
    type: "Hazard",
    severity: "High",
    status: "Investigating",
    site: "Austin Lab",
    area: "Fume cupboard 2",
    reportedBy: "Naomi Sharpe",
    owner: "Naomi Sharpe",
    occurredOn: "2026-08-04",
    reportedOn: "2026-08-05",
    lostTimeDays: 0,
    description:
      "Face velocity measured at 0.28 m/s against a 0.50 m/s minimum during the quarterly LEV check.",
    immediateAction: "Cupboard tagged out of service, work relocated to cupboard 1.",
    photos: [
      { id: "PH-14", name: "lev-reading.jpg", caption: "Anemometer reading 0.28 m/s" },
    ],
  },
  {
    id: "INC-2031",
    title: "Pallet collapse in transit",
    type: "Property damage",
    severity: "Low",
    status: "Closed",
    site: "Memphis DC",
    area: "Outbound staging",
    reportedBy: "Devon Ashby",
    owner: "Aisha Bello",
    occurredOn: "2026-07-30",
    reportedOn: "2026-07-30",
    lostTimeDays: 0,
    description:
      "A double-stacked pallet shifted during transfer to the trailer and toppled in the staging lane.",
    immediateAction: "Lane cleared, stack height limit reissued to the shift.",
    rootCause: "Wrap tension setting on the stretch wrapper had drifted.",
    photos: [],
  },
  {
    id: "INC-2030",
    title: "Hot work permit not displayed",
    type: "Hazard",
    severity: "Medium",
    status: "Closed",
    site: "Phoenix Works",
    area: "Fabrication bay",
    reportedBy: "Greta Lindqvist",
    owner: "Greta Lindqvist",
    occurredOn: "2026-07-24",
    reportedOn: "2026-07-24",
    lostTimeDays: 0,
    description:
      "Welding underway with a valid permit issued but not displayed at the work location, and no fire watch posted.",
    immediateAction: "Work paused, permit displayed and fire watch assigned before restart.",
    rootCause: "Permit briefing did not cover display and fire-watch obligations.",
    photos: [{ id: "PH-15", name: "fab-bay-weld.jpg", caption: "Hot work in progress" }],
  },
  {
    id: "INC-2029",
    title: "Emergency exit obstructed by stillages",
    type: "Hazard",
    severity: "High",
    status: "Closed",
    site: "Cleveland Plant",
    area: "East exit route",
    reportedBy: "Marisol Vega",
    owner: "Owen Cassidy",
    occurredOn: "2026-07-19",
    reportedOn: "2026-07-19",
    lostTimeDays: 0,
    description:
      "Three empty stillages were stored across the final 2 metres of the east escape route.",
    immediateAction: "Route cleared within 15 minutes, hatched floor marking reinstated.",
    rootCause: "No designated empties buffer near the east cell.",
    photos: [
      { id: "PH-16", name: "east-exit.jpg", caption: "Stillages across the route" },
    ],
  },
  {
    id: "INC-2028",
    title: "Noise exposure above action level",
    type: "Hazard",
    severity: "Medium",
    status: "Actions pending",
    site: "Cleveland Plant",
    area: "Press shop",
    reportedBy: "Tomás Reyes",
    owner: "Tomás Reyes",
    occurredOn: "2026-07-15",
    reportedOn: "2026-07-16",
    lostTimeDays: 0,
    description:
      "Dosimetry across a full shift returned 86 dB(A) LEP,d for press shop operators, above the first action level.",
    immediateAction: "Hearing protection zone signage extended, audiometry brought forward.",
    photos: [],
  },
]

export const safetyWalks: SafetyWalk[] = [
  {
    id: "WLK-318",
    title: "Press shop weekly walk",
    site: "Cleveland Plant",
    route: "Press shop → tool store → east exit route",
    leader: "Owen Cassidy",
    observers: ["Marisol Vega", "Tomás Reyes"],
    scheduledFor: "2026-09-02",
    status: "In progress",
    checklist: [
      { id: "C-1", prompt: "Machine guards in place and interlocks functional", result: "Fail", note: "Press 4 rear guard interlock defeated with tape." },
      { id: "C-2", prompt: "Escape routes clear and signage visible", result: "Pass" },
      { id: "C-3", prompt: "Hearing protection worn inside the marked zone", result: "Fail", note: "Two operators without protection at the blanking line." },
      { id: "C-4", prompt: "Housekeeping — no trip hazards or spills", result: "Pass" },
      { id: "C-5", prompt: "Lockout devices available at each isolation point", result: "Pass" },
      { id: "C-6", prompt: "Spill kits stocked and sealed", result: "N/A", note: "No liquid storage on this route." },
    ],
    findings: [
      {
        id: "F-1",
        summary: "Press 4 rear guard interlock bypassed",
        severity: "Critical",
        area: "Press shop",
        photos: [{ id: "PH-20", name: "press4-guard.jpg", caption: "Tape across interlock" }],
      },
      {
        id: "F-2",
        summary: "Hearing protection not worn at blanking line",
        severity: "Medium",
        area: "Blanking line",
        photos: [],
      },
    ],
  },
  {
    id: "WLK-317",
    title: "Yard traffic management walk",
    site: "Baltimore Yard",
    route: "Gatehouse → HGV turning circle → workshop mezzanine",
    leader: "Ellis Moreau",
    observers: ["Owen Cassidy"],
    scheduledFor: "2026-09-02",
    status: "Scheduled",
    checklist: [
      { id: "C-1", prompt: "Pedestrian walkways marked and unobstructed", result: "N/A" },
      { id: "C-2", prompt: "Vehicle/pedestrian segregation maintained", result: "N/A" },
      { id: "C-3", prompt: "Reversing aids and mirrors serviceable", result: "N/A" },
      { id: "C-4", prompt: "Work at height equipment correct for the task", result: "N/A" },
      { id: "C-5", prompt: "Lighting adequate across the route", result: "N/A" },
    ],
    findings: [],
  },
  {
    id: "WLK-316",
    title: "Laboratory LEV and COSHH walk",
    site: "Austin Lab",
    route: "Wet benches → fume cupboards → solvent store",
    leader: "Naomi Sharpe",
    observers: ["Renée Okonkwo"],
    scheduledFor: "2026-08-28",
    status: "Completed",
    checklist: [
      { id: "C-1", prompt: "Fume cupboard face velocity within specification", result: "Fail", note: "Cupboard 2 at 0.28 m/s." },
      { id: "C-2", prompt: "COSHH assessments available at point of use", result: "Pass" },
      { id: "C-3", prompt: "Solvent store bunded and ventilated", result: "Pass" },
      { id: "C-4", prompt: "Emergency shower and eyewash tested this month", result: "Pass" },
      { id: "C-5", prompt: "Decant equipment inspected and in date", result: "Fail", note: "Decant pump seal past its interval." },
    ],
    findings: [
      {
        id: "F-1",
        summary: "Fume cupboard 2 airflow below threshold",
        severity: "High",
        area: "Fume cupboard 2",
        photos: [{ id: "PH-21", name: "lev-2.jpg", caption: "Face velocity reading" }],
      },
      {
        id: "F-2",
        summary: "Decant pump overdue for seal replacement",
        severity: "High",
        area: "Wet bench 3",
        photos: [{ id: "PH-22", name: "decant-pump.jpg", caption: "Service label expired" }],
      },
    ],
  },
  {
    id: "WLK-315",
    title: "Dock and inbound walk",
    site: "Memphis DC",
    route: "Docks 1–6 → inbound staging → pick module B",
    leader: "Aisha Bello",
    observers: ["Devon Ashby", "Bryan Whitlock"],
    scheduledFor: "2026-08-26",
    status: "Completed",
    checklist: [
      { id: "C-1", prompt: "Dock seals intact and water ingress controlled", result: "Fail", note: "Dock 3 seal perished." },
      { id: "C-2", prompt: "Trailer restraints engaged before loading", result: "Pass" },
      { id: "C-3", prompt: "Pedestrian crossings marked at dock face", result: "Pass" },
      { id: "C-4", prompt: "Manual handling aids available at pick faces", result: "Fail", note: "Fast movers on floor level in module B." },
      { id: "C-5", prompt: "Racking free of visible damage", result: "Pass" },
      { id: "C-6", prompt: "Forklift pre-use checks completed", result: "Pass" },
    ],
    findings: [
      {
        id: "F-1",
        summary: "Dock 3 seal allowing water ingress",
        severity: "Medium",
        area: "Dock 3",
        photos: [{ id: "PH-23", name: "dock3.jpg", caption: "Perished seal" }],
      },
    ],
  },
  {
    id: "WLK-314",
    title: "Electrical isolation compliance walk",
    site: "Cleveland Plant",
    route: "Substation corridor → panel room → maintenance workshop",
    leader: "Tomás Reyes",
    observers: ["Kai Tanaka"],
    scheduledFor: "2026-08-21",
    status: "Completed",
    checklist: [
      { id: "C-1", prompt: "Isolation register current and signed off per shift", result: "Fail", note: "Stale entry carried over from night shift." },
      { id: "C-2", prompt: "Permits displayed at the point of work", result: "Pass" },
      { id: "C-3", prompt: "Arc-rated PPE available and in date", result: "Pass" },
      { id: "C-4", prompt: "Panel covers secured and labelled", result: "Pass" },
    ],
    findings: [
      {
        id: "F-1",
        summary: "Isolation register not reconciled at shift handover",
        severity: "Critical",
        area: "Substation corridor",
        photos: [],
      },
    ],
  },
  {
    id: "WLK-313",
    title: "Machine bay environmental walk",
    site: "Phoenix Works",
    route: "Machine bays 1–4 → coolant store → yard drains",
    leader: "Greta Lindqvist",
    observers: ["Sadie Alvarez"],
    scheduledFor: "2026-08-17",
    status: "Completed",
    checklist: [
      { id: "C-1", prompt: "Coolant lines free from visible damage", result: "Fail", note: "Split return hose on bay 2." },
      { id: "C-2", prompt: "Drain mats available near yard gullies", result: "Fail", note: "Only one mat on site." },
      { id: "C-3", prompt: "Waste segregated and containers labelled", result: "Pass" },
      { id: "C-4", prompt: "Bunds free of accumulated liquid", result: "Pass" },
    ],
    findings: [
      {
        id: "F-1",
        summary: "Split coolant return hose on machine bay 2",
        severity: "High",
        area: "Machine bay 2",
        photos: [{ id: "PH-24", name: "hose-split.jpg", caption: "Split along the crimp" }],
      },
    ],
  },
  {
    id: "WLK-312",
    title: "Contractor management walk",
    site: "Baltimore Yard",
    route: "Gatehouse → contractor compound → workshop",
    leader: "Owen Cassidy",
    observers: ["Ellis Moreau"],
    scheduledFor: "2026-09-04",
    status: "Scheduled",
    checklist: [
      { id: "C-1", prompt: "Contractor inductions completed and recorded", result: "N/A" },
      { id: "C-2", prompt: "Risk assessments and method statements on site", result: "N/A" },
      { id: "C-3", prompt: "Compound housekeeping acceptable", result: "N/A" },
      { id: "C-4", prompt: "Work at height equipment tagged and in date", result: "N/A" },
    ],
    findings: [],
  },
  {
    id: "WLK-311",
    title: "Fire safety and means of escape",
    site: "Cleveland Plant",
    route: "All escape routes → assembly points → extinguisher stations",
    leader: "Marisol Vega",
    observers: ["Owen Cassidy", "Tomás Reyes"],
    scheduledFor: "2026-09-08",
    status: "Scheduled",
    checklist: [
      { id: "C-1", prompt: "Escape routes clear for their full width", result: "N/A" },
      { id: "C-2", prompt: "Fire doors close fully and are not wedged", result: "N/A" },
      { id: "C-3", prompt: "Extinguishers in place, sealed and in date", result: "N/A" },
      { id: "C-4", prompt: "Assembly point signage legible", result: "N/A" },
      { id: "C-5", prompt: "Hot work permits reconciled", result: "N/A" },
    ],
    findings: [],
  },
]

export const risks: Risk[] = [
  {
    id: "RSK-101",
    hazard: "Access to press point of operation with guard defeated",
    category: "Mechanical",
    site: "Cleveland Plant",
    activity: "Jam clearance on mechanical presses",
    owner: "Owen Cassidy",
    likelihood: 4,
    impact: 5,
    residualLikelihood: 2,
    residualImpact: 5,
    controls: [
      "Dual-channel interlocks with monitored relays",
      "Quarterly interlock integrity testing",
      "Two-minute quick-release jam clearance procedure",
    ],
    reviewedOn: "2026-08-25",
    nextReview: "2026-11-25",
  },
  {
    id: "RSK-102",
    hazard: "Contact with live conductors during maintenance",
    category: "Electrical",
    site: "Cleveland Plant",
    activity: "Panel maintenance and fault finding",
    owner: "Tomás Reyes",
    likelihood: 3,
    impact: 5,
    residualLikelihood: 1,
    residualImpact: 5,
    controls: [
      "Permit-to-work with lock-off and prove-dead",
      "Digital isolation register reconciled each handover",
      "Arc-rated PPE issued to all authorised persons",
    ],
    reviewedOn: "2026-08-12",
    nextReview: "2026-10-12",
  },
  {
    id: "RSK-103",
    hazard: "Pedestrian struck by HGV in the yard",
    category: "Mechanical",
    site: "Baltimore Yard",
    activity: "Vehicle movements at the gatehouse approach",
    owner: "Ellis Moreau",
    likelihood: 4,
    impact: 4,
    residualLikelihood: 2,
    residualImpact: 4,
    controls: [
      "Physical segregation with barriers and gates",
      "Banksman required for all reversing manoeuvres",
      "High-visibility clothing mandatory beyond the gatehouse",
    ],
    reviewedOn: "2026-08-27",
    nextReview: "2026-09-27",
  },
  {
    id: "RSK-104",
    hazard: "Solvent splash to skin or eyes during decant",
    category: "Chemical",
    site: "Austin Lab",
    activity: "Bulk to bench solvent transfer",
    owner: "Naomi Sharpe",
    likelihood: 3,
    impact: 4,
    residualLikelihood: 2,
    residualImpact: 3,
    controls: [
      "Closed-loop decant with pressure relief",
      "Face shield and chemical apron mandatory",
      "Emergency shower within 10 seconds travel",
    ],
    reviewedOn: "2026-08-29",
    nextReview: "2026-09-29",
  },
  {
    id: "RSK-105",
    hazard: "Inhalation of solvent vapour from degraded LEV",
    category: "Chemical",
    site: "Austin Lab",
    activity: "Open bench work with volatile reagents",
    owner: "Renée Okonkwo",
    likelihood: 3,
    impact: 4,
    residualLikelihood: 2,
    residualImpact: 4,
    controls: [
      "Quarterly LEV thorough examination and test",
      "Continuous face-velocity alarms on each cupboard",
      "Work prohibited when the alarm is active",
    ],
    reviewedOn: "2026-08-05",
    nextReview: "2026-11-05",
  },
  {
    id: "RSK-106",
    hazard: "Musculoskeletal injury from repetitive low-level picking",
    category: "Ergonomic",
    site: "Memphis DC",
    activity: "Carton picking in pick module B",
    owner: "Aisha Bello",
    likelihood: 4,
    impact: 2,
    residualLikelihood: 3,
    residualImpact: 2,
    controls: [
      "Fast-moving SKUs slotted to the golden zone",
      "Task rotation every two hours",
      "Height-adjustable pick trolleys",
    ],
    reviewedOn: "2026-08-15",
    nextReview: "2026-11-15",
  },
  {
    id: "RSK-107",
    hazard: "Slip on water tracked in at the dock face",
    category: "Environmental",
    site: "Memphis DC",
    activity: "Loading and unloading in wet weather",
    owner: "Aisha Bello",
    likelihood: 4,
    impact: 2,
    residualLikelihood: 2,
    residualImpact: 2,
    controls: [
      "Dock seal inspection on the weekly walk",
      "Absorbent matting at every dock threshold",
      "Spill response kits at each dock pair",
    ],
    reviewedOn: "2026-08-21",
    nextReview: "2026-11-21",
  },
  {
    id: "RSK-108",
    hazard: "Racking collapse following undetected impact damage",
    category: "Mechanical",
    site: "Memphis DC",
    activity: "Bulk storage and forklift operations",
    owner: "Devon Ashby",
    likelihood: 2,
    impact: 5,
    residualLikelihood: 1,
    residualImpact: 5,
    controls: [
      "Column guards on all aisle-end uprights",
      "Weekly visual rack inspection with damage tagging",
      "Annual expert rack inspection",
    ],
    reviewedOn: "2026-08-31",
    nextReview: "2026-09-30",
  },
  {
    id: "RSK-109",
    hazard: "Release of coolant to the surface water drainage system",
    category: "Environmental",
    site: "Phoenix Works",
    activity: "Machining with recirculated coolant",
    owner: "Greta Lindqvist",
    likelihood: 3,
    impact: 3,
    residualLikelihood: 2,
    residualImpact: 3,
    controls: [
      "Bunded coolant tanks with high-level alarms",
      "Drain mats staged at every yard gully",
      "Monthly hose and crimp inspection",
    ],
    reviewedOn: "2026-08-18",
    nextReview: "2026-10-18",
  },
  {
    id: "RSK-110",
    hazard: "Noise-induced hearing loss in the press shop",
    category: "Environmental",
    site: "Cleveland Plant",
    activity: "Press operation across a full shift",
    owner: "Tomás Reyes",
    likelihood: 4,
    impact: 3,
    residualLikelihood: 3,
    residualImpact: 3,
    controls: [
      "Hearing protection zone with mandatory PPE",
      "Annual audiometric surveillance",
      "Damping treatment on the blanking line",
    ],
    reviewedOn: "2026-07-16",
    nextReview: "2026-10-16",
  },
  {
    id: "RSK-111",
    hazard: "Fall from height using unsuitable access equipment",
    category: "Mechanical",
    site: "Baltimore Yard",
    activity: "Overhead maintenance on the workshop mezzanine",
    owner: "Ellis Moreau",
    likelihood: 3,
    impact: 4,
    residualLikelihood: 1,
    residualImpact: 4,
    controls: [
      "Podium steps issued to each workshop",
      "Ladders removed from general stores",
      "Work at height permit for tasks over 20 minutes",
    ],
    reviewedOn: "2026-08-08",
    nextReview: "2026-11-08",
  },
  {
    id: "RSK-112",
    hazard: "Procedural shortcuts under throughput pressure",
    category: "Behavioural",
    site: "Cleveland Plant",
    activity: "All production activities",
    owner: "Owen Cassidy",
    likelihood: 4,
    impact: 4,
    residualLikelihood: 3,
    residualImpact: 4,
    controls: [
      "Stop-work authority briefed to every operator",
      "Safety observations logged on each shift",
      "Throughput targets reviewed against safe cycle times",
    ],
    reviewedOn: "2026-08-26",
    nextReview: "2026-09-26",
  },
]

export const correctiveActions: CorrectiveAction[] = [
  { id: "ACT-501", title: "Fit quick-release jam clearance on press 4", stage: "In Progress", severity: "Critical", site: "Cleveland Plant", owner: "Owen Cassidy", dueOn: "2026-09-05", sourceIncidentId: "INC-2038", sourceRiskId: "RSK-101" },
  { id: "ACT-502", title: "Interlock integrity test across all presses", stage: "Verify", severity: "Critical", site: "Cleveland Plant", owner: "Marisol Vega", dueOn: "2026-09-04", sourceIncidentId: "INC-2038" },
  { id: "ACT-503", title: "Digitise the electrical isolation register", stage: "In Progress", severity: "Critical", site: "Cleveland Plant", owner: "Tomás Reyes", dueOn: "2026-09-11", sourceIncidentId: "INC-2034", sourceRiskId: "RSK-102" },
  { id: "ACT-504", title: "Replace all decant pump seals and set an interval", stage: "Open", severity: "High", site: "Austin Lab", owner: "Naomi Sharpe", dueOn: "2026-09-09", sourceIncidentId: "INC-2040", sourceRiskId: "RSK-104" },
  { id: "ACT-505", title: "Rebalance and retest fume cupboard 2", stage: "In Progress", severity: "High", site: "Austin Lab", owner: "Renée Okonkwo", dueOn: "2026-09-07", sourceIncidentId: "INC-2032", sourceRiskId: "RSK-105" },
  { id: "ACT-506", title: "Install permanent barriers at the gatehouse crossing", stage: "Blocked", severity: "High", site: "Baltimore Yard", owner: "Ellis Moreau", dueOn: "2026-09-18", sourceIncidentId: "INC-2039", sourceRiskId: "RSK-103" },
  { id: "ACT-507", title: "Re-induct all contractors on yard segregation", stage: "Verify", severity: "High", site: "Baltimore Yard", owner: "Owen Cassidy", dueOn: "2026-09-03", sourceIncidentId: "INC-2039" },
  { id: "ACT-508", title: "Replace the dock 3 weather seal", stage: "Done", severity: "Medium", site: "Memphis DC", owner: "Aisha Bello", dueOn: "2026-08-28", sourceIncidentId: "INC-2037", sourceRiskId: "RSK-107" },
  { id: "ACT-509", title: "Re-slot fast movers out of floor-level pick faces", stage: "Open", severity: "Medium", site: "Memphis DC", owner: "Bryan Whitlock", dueOn: "2026-09-22", sourceIncidentId: "INC-2035", sourceRiskId: "RSK-106" },
  { id: "ACT-510", title: "Structural inspection of racking bay 12C", stage: "In Progress", severity: "Medium", site: "Memphis DC", owner: "Devon Ashby", dueOn: "2026-09-04", sourceIncidentId: "INC-2041", sourceRiskId: "RSK-108" },
  { id: "ACT-511", title: "Replace coolant return hoses on bays 1–4", stage: "Verify", severity: "High", site: "Phoenix Works", owner: "Greta Lindqvist", dueOn: "2026-09-06", sourceIncidentId: "INC-2036", sourceRiskId: "RSK-109" },
  { id: "ACT-512", title: "Stock drain mats at every yard gully", stage: "Open", severity: "Medium", site: "Phoenix Works", owner: "Sadie Alvarez", dueOn: "2026-09-15", sourceRiskId: "RSK-109" },
  { id: "ACT-513", title: "Bring forward audiometry for press shop operators", stage: "Open", severity: "Medium", site: "Cleveland Plant", owner: "Tomás Reyes", dueOn: "2026-09-25", sourceIncidentId: "INC-2028", sourceRiskId: "RSK-110" },
  { id: "ACT-514", title: "Issue podium steps to both workshops", stage: "Done", severity: "Medium", site: "Baltimore Yard", owner: "Ellis Moreau", dueOn: "2026-08-20", sourceIncidentId: "INC-2033", sourceRiskId: "RSK-111" },
  { id: "ACT-515", title: "Create an empties buffer near the east cell", stage: "Done", severity: "High", site: "Cleveland Plant", owner: "Marisol Vega", dueOn: "2026-08-22", sourceIncidentId: "INC-2029" },
  { id: "ACT-516", title: "Add display and fire-watch checks to the permit briefing", stage: "Blocked", severity: "Medium", site: "Phoenix Works", owner: "Greta Lindqvist", dueOn: "2026-09-12", sourceIncidentId: "INC-2030" },
]

export const monthlyTrend = [
  { month: "Oct", incidents: 11, nearMisses: 18, lostTime: 2 },
  { month: "Nov", incidents: 9, nearMisses: 21, lostTime: 1 },
  { month: "Dec", incidents: 13, nearMisses: 16, lostTime: 3 },
  { month: "Jan", incidents: 8, nearMisses: 24, lostTime: 1 },
  { month: "Feb", incidents: 10, nearMisses: 22, lostTime: 2 },
  { month: "Mar", incidents: 7, nearMisses: 27, lostTime: 0 },
  { month: "Apr", incidents: 9, nearMisses: 25, lostTime: 1 },
  { month: "May", incidents: 6, nearMisses: 31, lostTime: 0 },
  { month: "Jun", incidents: 8, nearMisses: 29, lostTime: 1 },
  { month: "Jul", incidents: 5, nearMisses: 34, lostTime: 0 },
  { month: "Aug", incidents: 7, nearMisses: 33, lostTime: 3 },
  { month: "Sep", incidents: 1, nearMisses: 4, lostTime: 0 },
]

export const openIncidentStatuses: IncidentStatus[] = [
  "Reported",
  "Investigating",
  "Actions pending",
]

export function getIncident(id?: string) {
  return incidents.find((incident) => incident.id === id)
}

export function getWalk(id?: string) {
  return safetyWalks.find((walk) => walk.id === id)
}

export function getRisk(id?: string) {
  return risks.find((risk) => risk.id === id)
}

export function riskScore(likelihood: number, impact: number) {
  return likelihood * impact
}

export function riskBand(score: number): Severity {
  if (score >= 15) return "Critical"
  if (score >= 10) return "High"
  if (score >= 5) return "Medium"
  return "Low"
}

export function inherentScore(risk: Risk) {
  return riskScore(risk.likelihood, risk.impact)
}

export function residualScore(risk: Risk) {
  return riskScore(risk.residualLikelihood, risk.residualImpact)
}

export function actionsForIncident(id: string) {
  return correctiveActions.filter((action) => action.sourceIncidentId === id)
}

export function actionsForRisk(id: string) {
  return correctiveActions.filter((action) => action.sourceRiskId === id)
}

export function isOpenIncident(incident: Incident) {
  return incident.status !== "Closed"
}

export function walkScore(walk: SafetyWalk) {
  const scored = walk.checklist.filter((item) => item.result !== "N/A")
  if (scored.length === 0) return 0
  const passed = scored.filter((item) => item.result === "Pass").length
  return Math.round((passed / scored.length) * 100)
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}
