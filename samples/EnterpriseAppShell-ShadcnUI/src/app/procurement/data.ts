export type SupplierStatus = "Preferred" | "Approved" | "Under review" | "Suspended"
export type OrderStatus =
  | "Draft"
  | "Pending approval"
  | "Approved"
  | "Shipped"
  | "Received"
  | "Cancelled"
export type RequisitionStage =
  | "Submitted"
  | "In Review"
  | "Approved"
  | "Ordered"
  | "Rejected"
export type InvoiceStatus = "Pending" | "Matched" | "Approved" | "Disputed" | "Paid"
export type DeliveryStatus = "Scheduled" | "In transit" | "Delivered" | "Delayed"
export type Priority = "Low" | "Medium" | "High"
export type Category =
  | "IT Hardware"
  | "Software"
  | "Facilities"
  | "Logistics"
  | "Professional Services"
  | "Raw Materials"

export type Supplier = {
  id: string
  name: string
  category: Category
  location: string
  contactName: string
  contactEmail: string
  phone: string
  website: string
  status: SupplierStatus
  rating: number
  onTimeRate: number
  annualSpend: number
  paymentTerms: string
  contractEnds: string
  since: string
  buyer: string
  description: string
}

export type OrderLine = {
  description: string
  quantity: number
  unitPrice: number
}

export type PurchaseOrder = {
  id: string
  title: string
  supplierId: string
  category: Category
  status: OrderStatus
  requester: string
  orderedOn: string
  expectedDate: string
  lines: OrderLine[]
}

export type Requisition = {
  id: string
  title: string
  supplierId?: string
  category: Category
  amount: number
  requester: string
  department: string
  submittedOn: string
  neededBy: string
  stage: RequisitionStage
  priority: Priority
  justification: string
}

export type Invoice = {
  id: string
  supplierId: string
  orderId?: string
  amount: number
  issuedOn: string
  dueOn: string
  status: InvoiceStatus
  approver: string
  matched: boolean
}

export type Delivery = {
  id: string
  subject: string
  orderId?: string
  supplierId: string
  date: string
  time: string
  status: DeliveryStatus
  carrier: string
  items: number
  done: boolean
}

export const requisitionStages: RequisitionStage[] = [
  "Submitted",
  "In Review",
  "Approved",
  "Ordered",
  "Rejected",
]

export const suppliers: Supplier[] = [
  {
    id: "apex-industrial",
    name: "Apex Industrial Supply",
    category: "Raw Materials",
    location: "Cleveland, OH",
    contactName: "Marisol Vega",
    contactEmail: "m.vega@apexindustrial.example.com",
    phone: "+1 (216) 555-0142",
    website: "apexindustrial.example.com",
    status: "Preferred",
    rating: 92,
    onTimeRate: 96,
    annualSpend: 412000,
    paymentTerms: "Net 30",
    contractEnds: "31 Mar 2027",
    since: "Feb 2019",
    buyer: "Owen Cassidy",
    description:
      "Primary source for racking, conveyor spares and warehouse consumables across all three distribution centres.",
  },
  {
    id: "northline-logistics",
    name: "Northline Logistics",
    category: "Logistics",
    location: "Memphis, TN",
    contactName: "Devon Ashby",
    contactEmail: "devon.ashby@northline.example.com",
    phone: "+1 (901) 555-0178",
    website: "northline.example.com",
    status: "Preferred",
    rating: 88,
    onTimeRate: 94,
    annualSpend: 685000,
    paymentTerms: "Net 45",
    contractEnds: "30 Sep 2027",
    since: "Aug 2020",
    buyer: "Aisha Bello",
    description:
      "Contracted carrier for southeast lanes, last-mile parcel and returns handling.",
  },
  {
    id: "vertex-it-systems",
    name: "Vertex IT Systems",
    category: "IT Hardware",
    location: "San Jose, CA",
    contactName: "Kai Tanaka",
    contactEmail: "kai.tanaka@vertexit.example.com",
    phone: "+1 (408) 555-0119",
    website: "vertexit.example.com",
    status: "Approved",
    rating: 81,
    onTimeRate: 87,
    annualSpend: 340000,
    paymentTerms: "Net 30",
    contractEnds: "31 Dec 2026",
    since: "May 2022",
    buyer: "Greta Lindqvist",
    description:
      "Endpoint hardware reseller covering laptop refresh cycles, monitors and docking equipment.",
  },
  {
    id: "brightpath-software",
    name: "Brightpath Software",
    category: "Software",
    location: "Austin, TX",
    contactName: "Renée Okonkwo",
    contactEmail: "renee@brightpathsw.example.com",
    phone: "+1 (512) 555-0164",
    website: "brightpathsw.example.com",
    status: "Approved",
    rating: 85,
    onTimeRate: 99,
    annualSpend: 298000,
    paymentTerms: "Net 30",
    contractEnds: "31 Jul 2027",
    since: "Jan 2021",
    buyer: "Naomi Sharpe",
    description:
      "Licence reseller for the design suite, SIEM platform and endpoint security agents.",
  },
  {
    id: "harborview-facilities",
    name: "Harborview Facilities Group",
    category: "Facilities",
    location: "Baltimore, MD",
    contactName: "Ellis Moreau",
    contactEmail: "e.moreau@harborviewfg.example.com",
    phone: "+1 (410) 555-0193",
    website: "harborviewfg.example.com",
    status: "Approved",
    rating: 76,
    onTimeRate: 83,
    annualSpend: 154000,
    paymentTerms: "Net 30",
    contractEnds: "30 Jun 2027",
    since: "Nov 2021",
    buyer: "Owen Cassidy",
    description:
      "Building services partner handling HVAC maintenance, fit-out projects and office moves.",
  },
  {
    id: "meridian-consulting",
    name: "Meridian Consulting Partners",
    category: "Professional Services",
    location: "Chicago, IL",
    contactName: "Priyanka Roy",
    contactEmail: "p.roy@meridiancp.example.com",
    phone: "+1 (312) 555-0126",
    website: "meridiancp.example.com",
    status: "Preferred",
    rating: 90,
    onTimeRate: 92,
    annualSpend: 476000,
    paymentTerms: "Net 45",
    contractEnds: "31 Jan 2028",
    since: "Mar 2018",
    buyer: "Tomás Reyes",
    description:
      "Advisory retainer covering ERP rollout, supplier risk audits and security testing.",
  },
  {
    id: "crestline-packaging",
    name: "Crestline Packaging Co.",
    category: "Raw Materials",
    location: "Louisville, KY",
    contactName: "Bryan Whitlock",
    contactEmail: "bwhitlock@crestlinepkg.example.com",
    phone: "+1 (502) 555-0157",
    website: "crestlinepkg.example.com",
    status: "Under review",
    rating: 64,
    onTimeRate: 71,
    annualSpend: 122000,
    paymentTerms: "Net 15",
    contractEnds: "31 Oct 2026",
    since: "Jun 2023",
    buyer: "Aisha Bello",
    description:
      "Corrugated cartons, void fill and label stock. Two quality escalations logged this quarter.",
  },
  {
    id: "orbit-components",
    name: "Orbit Components Ltd.",
    category: "IT Hardware",
    location: "Phoenix, AZ",
    contactName: "Sadie Alvarez",
    contactEmail: "s.alvarez@orbitcomp.example.com",
    phone: "+1 (602) 555-0135",
    website: "orbitcomp.example.com",
    status: "Suspended",
    rating: 41,
    onTimeRate: 58,
    annualSpend: 61000,
    paymentTerms: "Net 30",
    contractEnds: "—",
    since: "Sep 2024",
    buyer: "Greta Lindqvist",
    description:
      "Network hardware supplier suspended pending resolution of a disputed shipment and audit findings.",
  },
]

export const purchaseOrders: PurchaseOrder[] = [
  {
    id: "PO-8801",
    title: "Warehouse conveyor spare parts",
    supplierId: "apex-industrial",
    category: "Raw Materials",
    status: "Received",
    requester: "Owen Cassidy",
    orderedOn: "12 Jun 2026",
    expectedDate: "03 Jul 2026",
    lines: [
      { description: "Drive belt assembly", quantity: 12, unitPrice: 480 },
      { description: "Roller bearing set", quantity: 40, unitPrice: 65 },
      { description: "Control panel module", quantity: 4, unitPrice: 1250 },
    ],
  },
  {
    id: "PO-8802",
    title: "Q3 freight contract – southeast lanes",
    supplierId: "northline-logistics",
    category: "Logistics",
    status: "Approved",
    requester: "Aisha Bello",
    orderedOn: "02 Jul 2026",
    expectedDate: "30 Sep 2026",
    lines: [
      { description: "Dedicated lane capacity (weeks)", quantity: 13, unitPrice: 6400 },
      { description: "Fuel surcharge accrual", quantity: 1, unitPrice: 8200 },
    ],
  },
  {
    id: "PO-8803",
    title: "Engineering laptop refresh",
    supplierId: "vertex-it-systems",
    category: "IT Hardware",
    status: "Shipped",
    requester: "Greta Lindqvist",
    orderedOn: "18 Aug 2026",
    expectedDate: "07 Sep 2026",
    lines: [
      { description: "Developer laptop 32GB", quantity: 45, unitPrice: 2150 },
      { description: "Docking station", quantity: 45, unitPrice: 240 },
      { description: '4K monitor 27"', quantity: 60, unitPrice: 410 },
    ],
  },
  {
    id: "PO-8804",
    title: "Design suite licence renewal",
    supplierId: "brightpath-software",
    category: "Software",
    status: "Received",
    requester: "Naomi Sharpe",
    orderedOn: "01 Aug 2026",
    expectedDate: "01 Aug 2026",
    lines: [
      { description: "Annual seat licence", quantity: 120, unitPrice: 890 },
      { description: "Premium support tier", quantity: 1, unitPrice: 14500 },
    ],
  },
  {
    id: "PO-8805",
    title: "HQ HVAC maintenance – annual",
    supplierId: "harborview-facilities",
    category: "Facilities",
    status: "Approved",
    requester: "Owen Cassidy",
    orderedOn: "14 Aug 2026",
    expectedDate: "01 Oct 2026",
    lines: [
      { description: "Quarterly service visit", quantity: 4, unitPrice: 4750 },
      { description: "Filter replacement kit", quantity: 60, unitPrice: 118 },
    ],
  },
  {
    id: "PO-8806",
    title: "ERP rollout advisory – phase 2",
    supplierId: "meridian-consulting",
    category: "Professional Services",
    status: "Pending approval",
    requester: "Tomás Reyes",
    orderedOn: "28 Aug 2026",
    expectedDate: "15 Oct 2026",
    lines: [
      { description: "Senior consultant (days)", quantity: 60, unitPrice: 1850 },
      { description: "Solution architect (days)", quantity: 20, unitPrice: 2400 },
    ],
  },
  {
    id: "PO-8807",
    title: "Corrugated shipping cartons",
    supplierId: "crestline-packaging",
    category: "Raw Materials",
    status: "Received",
    requester: "Aisha Bello",
    orderedOn: "05 Jul 2026",
    expectedDate: "24 Jul 2026",
    lines: [
      { description: "Carton 600x400x300 (pallet)", quantity: 24, unitPrice: 1420 },
      { description: "Void fill rolls", quantity: 80, unitPrice: 46 },
    ],
  },
  {
    id: "PO-8808",
    title: "Network switch upgrade",
    supplierId: "orbit-components",
    category: "IT Hardware",
    status: "Cancelled",
    requester: "Greta Lindqvist",
    orderedOn: "20 Jun 2026",
    expectedDate: "18 Jul 2026",
    lines: [
      { description: "48-port managed switch", quantity: 14, unitPrice: 3600 },
      { description: "SFP+ transceiver", quantity: 56, unitPrice: 185 },
    ],
  },
  {
    id: "PO-8809",
    title: "Pallet racking expansion",
    supplierId: "apex-industrial",
    category: "Raw Materials",
    status: "Draft",
    requester: "Owen Cassidy",
    orderedOn: "29 Aug 2026",
    expectedDate: "20 Oct 2026",
    lines: [
      { description: "Upright frame 6m", quantity: 90, unitPrice: 310 },
      { description: "Beam pair 2.7m", quantity: 240, unitPrice: 88 },
    ],
  },
  {
    id: "PO-8810",
    title: "Last-mile parcel rates – Q4",
    supplierId: "northline-logistics",
    category: "Logistics",
    status: "Pending approval",
    requester: "Aisha Bello",
    orderedOn: "30 Aug 2026",
    expectedDate: "01 Oct 2026",
    lines: [
      { description: "Parcel volume tier A", quantity: 1, unitPrice: 46500 },
      { description: "Returns handling", quantity: 1, unitPrice: 9800 },
    ],
  },
  {
    id: "PO-8811",
    title: "Security operations tooling",
    supplierId: "brightpath-software",
    category: "Software",
    status: "Shipped",
    requester: "Naomi Sharpe",
    orderedOn: "22 Aug 2026",
    expectedDate: "05 Sep 2026",
    lines: [
      { description: "SIEM platform licence", quantity: 1, unitPrice: 74000 },
      { description: "Endpoint agent seats", quantity: 900, unitPrice: 42 },
    ],
  },
  {
    id: "PO-8812",
    title: "Office fit-out – floor 4",
    supplierId: "harborview-facilities",
    category: "Facilities",
    status: "Received",
    requester: "Tomás Reyes",
    orderedOn: "10 May 2026",
    expectedDate: "26 Jun 2026",
    lines: [
      { description: "Workstation pod", quantity: 32, unitPrice: 1650 },
      { description: "Acoustic partition", quantity: 48, unitPrice: 420 },
      { description: "Meeting room booking panel", quantity: 8, unitPrice: 690 },
    ],
  },
  {
    id: "PO-8813",
    title: "Supplier risk audit programme",
    supplierId: "meridian-consulting",
    category: "Professional Services",
    status: "Approved",
    requester: "Tomás Reyes",
    orderedOn: "25 Aug 2026",
    expectedDate: "12 Nov 2026",
    lines: [
      { description: "Audit engagement (per supplier)", quantity: 18, unitPrice: 3200 },
    ],
  },
  {
    id: "PO-8814",
    title: "Thermal label stock",
    supplierId: "crestline-packaging",
    category: "Raw Materials",
    status: "Draft",
    requester: "Aisha Bello",
    orderedOn: "01 Sep 2026",
    expectedDate: "22 Sep 2026",
    lines: [
      { description: "4x6 thermal label roll", quantity: 400, unitPrice: 28 },
      { description: "Ribbon cartridge", quantity: 120, unitPrice: 34 },
    ],
  },
]

export const requisitions: Requisition[] = [
  {
    id: "REQ-4401",
    title: "Additional GPU workstations",
    supplierId: "vertex-it-systems",
    category: "IT Hardware",
    amount: 68000,
    requester: "Greta Lindqvist",
    department: "Engineering",
    submittedOn: "24 Aug 2026",
    neededBy: "30 Sep 2026",
    stage: "In Review",
    priority: "High",
    justification: "Model training queue is backing up; four seats are blocked daily.",
  },
  {
    id: "REQ-4402",
    title: "Warehouse safety signage",
    supplierId: "apex-industrial",
    category: "Facilities",
    amount: 7400,
    requester: "Owen Cassidy",
    department: "Operations",
    submittedOn: "27 Aug 2026",
    neededBy: "18 Sep 2026",
    stage: "Submitted",
    priority: "Low",
    justification: "Required to close out the Q2 site safety inspection findings.",
  },
  {
    id: "REQ-4403",
    title: "Translation services – EMEA launch",
    supplierId: "meridian-consulting",
    category: "Professional Services",
    amount: 24500,
    requester: "Naomi Sharpe",
    department: "Marketing",
    submittedOn: "21 Aug 2026",
    neededBy: "10 Oct 2026",
    stage: "Approved",
    priority: "Medium",
    justification: "Localisation for six markets ahead of the October launch window.",
  },
  {
    id: "REQ-4404",
    title: "Cold chain packaging trial",
    supplierId: "crestline-packaging",
    category: "Raw Materials",
    amount: 15800,
    requester: "Aisha Bello",
    department: "Supply Chain",
    submittedOn: "19 Aug 2026",
    neededBy: "28 Sep 2026",
    stage: "In Review",
    priority: "Medium",
    justification: "Pilot to reduce spoilage on the perishable line before peak season.",
  },
  {
    id: "REQ-4405",
    title: "Data platform licence expansion",
    supplierId: "brightpath-software",
    category: "Software",
    amount: 92000,
    requester: "Tomás Reyes",
    department: "Data",
    submittedOn: "12 Aug 2026",
    neededBy: "01 Oct 2026",
    stage: "Ordered",
    priority: "High",
    justification: "Current tier caps out at 40 concurrent jobs; nightly loads are failing.",
  },
  {
    id: "REQ-4406",
    title: "Contractor badge printers",
    category: "IT Hardware",
    amount: 5600,
    requester: "Owen Cassidy",
    department: "Facilities",
    submittedOn: "29 Aug 2026",
    neededBy: "25 Sep 2026",
    stage: "Submitted",
    priority: "Low",
    justification: "Reception is issuing paper passes since the old printer failed.",
  },
  {
    id: "REQ-4407",
    title: "Overflow warehouse space – Q4",
    supplierId: "northline-logistics",
    category: "Logistics",
    amount: 138000,
    requester: "Aisha Bello",
    department: "Supply Chain",
    submittedOn: "18 Aug 2026",
    neededBy: "01 Nov 2026",
    stage: "In Review",
    priority: "High",
    justification: "Forecast peak volume exceeds DC capacity by roughly 18%.",
  },
  {
    id: "REQ-4408",
    title: "Executive offsite AV hire",
    supplierId: "harborview-facilities",
    category: "Facilities",
    amount: 11200,
    requester: "Naomi Sharpe",
    department: "People",
    submittedOn: "26 Aug 2026",
    neededBy: "02 Oct 2026",
    stage: "Submitted",
    priority: "Medium",
    justification: "Two-day leadership offsite with hybrid attendance from three regions.",
  },
  {
    id: "REQ-4409",
    title: "Penetration test – customer portal",
    supplierId: "meridian-consulting",
    category: "Professional Services",
    amount: 46000,
    requester: "Greta Lindqvist",
    department: "Security",
    submittedOn: "08 Aug 2026",
    neededBy: "20 Sep 2026",
    stage: "Ordered",
    priority: "High",
    justification: "Annual assessment required by the customer security addendum.",
  },
  {
    id: "REQ-4410",
    title: "Replacement pallet jacks",
    supplierId: "apex-industrial",
    category: "Raw Materials",
    amount: 19400,
    requester: "Owen Cassidy",
    department: "Operations",
    submittedOn: "14 Aug 2026",
    neededBy: "05 Oct 2026",
    stage: "Approved",
    priority: "Medium",
    justification: "Six units are past their service life and failing load inspections.",
  },
  {
    id: "REQ-4411",
    title: "Legacy switch spares",
    supplierId: "orbit-components",
    category: "IT Hardware",
    amount: 8900,
    requester: "Greta Lindqvist",
    department: "IT",
    submittedOn: "11 Aug 2026",
    neededBy: "12 Sep 2026",
    stage: "Rejected",
    priority: "Low",
    justification: "Rejected — supplier is suspended and the platform is being retired.",
  },
  {
    id: "REQ-4412",
    title: "Regional carrier onboarding",
    supplierId: "northline-logistics",
    category: "Logistics",
    amount: 32000,
    requester: "Tomás Reyes",
    department: "Supply Chain",
    submittedOn: "05 Aug 2026",
    neededBy: "15 Sep 2026",
    stage: "Ordered",
    priority: "Medium",
    justification: "Second carrier reduces single-source risk on the midwest lanes.",
  },
]

export const invoices: Invoice[] = [
  {
    id: "INV-9001",
    supplierId: "apex-industrial",
    orderId: "PO-8801",
    amount: 13360,
    issuedOn: "05 Jul 2026",
    dueOn: "04 Aug 2026",
    status: "Paid",
    approver: "Owen Cassidy",
    matched: true,
  },
  {
    id: "INV-9002",
    supplierId: "brightpath-software",
    orderId: "PO-8804",
    amount: 121300,
    issuedOn: "02 Aug 2026",
    dueOn: "01 Sep 2026",
    status: "Approved",
    approver: "Naomi Sharpe",
    matched: true,
  },
  {
    id: "INV-9003",
    supplierId: "crestline-packaging",
    orderId: "PO-8807",
    amount: 39240,
    issuedOn: "26 Jul 2026",
    dueOn: "25 Aug 2026",
    status: "Disputed",
    approver: "Aisha Bello",
    matched: false,
  },
  {
    id: "INV-9004",
    supplierId: "harborview-facilities",
    orderId: "PO-8812",
    amount: 78480,
    issuedOn: "28 Jun 2026",
    dueOn: "28 Jul 2026",
    status: "Paid",
    approver: "Tomás Reyes",
    matched: true,
  },
  {
    id: "INV-9005",
    supplierId: "northline-logistics",
    orderId: "PO-8802",
    amount: 30466,
    issuedOn: "01 Sep 2026",
    dueOn: "01 Oct 2026",
    status: "Matched",
    approver: "Aisha Bello",
    matched: true,
  },
  {
    id: "INV-9006",
    supplierId: "vertex-it-systems",
    orderId: "PO-8803",
    amount: 132150,
    issuedOn: "31 Aug 2026",
    dueOn: "30 Sep 2026",
    status: "Pending",
    approver: "Greta Lindqvist",
    matched: false,
  },
  {
    id: "INV-9007",
    supplierId: "meridian-consulting",
    amount: 18500,
    issuedOn: "28 Aug 2026",
    dueOn: "27 Sep 2026",
    status: "Pending",
    approver: "Tomás Reyes",
    matched: false,
  },
  {
    id: "INV-9008",
    supplierId: "orbit-components",
    orderId: "PO-8808",
    amount: 10360,
    issuedOn: "22 Jul 2026",
    dueOn: "21 Aug 2026",
    status: "Disputed",
    approver: "Greta Lindqvist",
    matched: false,
  },
  {
    id: "INV-9009",
    supplierId: "harborview-facilities",
    orderId: "PO-8805",
    amount: 4750,
    issuedOn: "01 Sep 2026",
    dueOn: "01 Oct 2026",
    status: "Matched",
    approver: "Owen Cassidy",
    matched: true,
  },
  {
    id: "INV-9010",
    supplierId: "brightpath-software",
    orderId: "PO-8811",
    amount: 111800,
    issuedOn: "30 Aug 2026",
    dueOn: "29 Sep 2026",
    status: "Approved",
    approver: "Naomi Sharpe",
    matched: true,
  },
]

export const deliveries: Delivery[] = [
  {
    id: "DLV-7001",
    subject: "Laptop refresh – tranche 1",
    orderId: "PO-8803",
    supplierId: "vertex-it-systems",
    date: "2026-09-02",
    time: "09:00",
    status: "In transit",
    carrier: "Northline Express",
    items: 150,
    done: false,
  },
  {
    id: "DLV-7002",
    subject: "SIEM licence activation",
    orderId: "PO-8811",
    supplierId: "brightpath-software",
    date: "2026-09-02",
    time: "13:00",
    status: "Delivered",
    carrier: "Digital fulfilment",
    items: 1,
    done: true,
  },
  {
    id: "DLV-7003",
    subject: "HVAC filter kits",
    orderId: "PO-8805",
    supplierId: "harborview-facilities",
    date: "2026-09-02",
    time: "15:30",
    status: "Scheduled",
    carrier: "Harborview fleet",
    items: 60,
    done: false,
  },
  {
    id: "DLV-7004",
    subject: "Thermal label stock – part 1",
    orderId: "PO-8814",
    supplierId: "crestline-packaging",
    date: "2026-09-03",
    time: "08:30",
    status: "Scheduled",
    carrier: "Crestline direct",
    items: 200,
    done: false,
  },
  {
    id: "DLV-7005",
    subject: "Pallet racking uprights",
    orderId: "PO-8809",
    supplierId: "apex-industrial",
    date: "2026-09-03",
    time: "11:00",
    status: "Delayed",
    carrier: "Apex haulage",
    items: 90,
    done: false,
  },
  {
    id: "DLV-7006",
    subject: "Returns pallet collection",
    orderId: "PO-8802",
    supplierId: "northline-logistics",
    date: "2026-09-04",
    time: "10:00",
    status: "Scheduled",
    carrier: "Northline Express",
    items: 18,
    done: false,
  },
  {
    id: "DLV-7007",
    subject: "Laptop refresh – tranche 2",
    orderId: "PO-8803",
    supplierId: "vertex-it-systems",
    date: "2026-09-04",
    time: "14:00",
    status: "Scheduled",
    carrier: "Northline Express",
    items: 150,
    done: false,
  },
  {
    id: "DLV-7008",
    subject: "Audit kick-off materials",
    orderId: "PO-8813",
    supplierId: "meridian-consulting",
    date: "2026-09-07",
    time: "09:30",
    status: "Scheduled",
    carrier: "Courier",
    items: 3,
    done: false,
  },
  {
    id: "DLV-7009",
    subject: "Docking stations",
    orderId: "PO-8803",
    supplierId: "vertex-it-systems",
    date: "2026-09-08",
    time: "12:00",
    status: "Scheduled",
    carrier: "Northline Express",
    items: 45,
    done: false,
  },
  {
    id: "DLV-7010",
    subject: "Conveyor spare parts",
    orderId: "PO-8801",
    supplierId: "apex-industrial",
    date: "2026-08-31",
    time: "10:00",
    status: "Delivered",
    carrier: "Apex haulage",
    items: 56,
    done: true,
  },
]

export const monthlySpend = [
  { month: "Oct", spend: 218000, orders: 9 },
  { month: "Nov", spend: 264000, orders: 11 },
  { month: "Dec", spend: 341000, orders: 14 },
  { month: "Jan", spend: 196000, orders: 8 },
  { month: "Feb", spend: 232000, orders: 10 },
  { month: "Mar", spend: 287000, orders: 12 },
  { month: "Apr", spend: 254000, orders: 11 },
  { month: "May", spend: 312000, orders: 13 },
  { month: "Jun", spend: 276000, orders: 12 },
  { month: "Jul", spend: 298000, orders: 12 },
  { month: "Aug", spend: 364000, orders: 15 },
  { month: "Sep", spend: 189000, orders: 7 },
]

export const openOrderStatuses: OrderStatus[] = [
  "Draft",
  "Pending approval",
  "Approved",
  "Shipped",
]

export const openRequisitionStages: RequisitionStage[] = [
  "Submitted",
  "In Review",
  "Approved",
]

export function getSupplier(id?: string) {
  return suppliers.find((supplier) => supplier.id === id)
}

export function getOrder(id?: string) {
  return purchaseOrders.find((order) => order.id === id)
}

export function supplierName(id?: string) {
  return getSupplier(id)?.name ?? "Unassigned"
}

export function orderTotal(order: PurchaseOrder) {
  return order.lines.reduce(
    (sum, line) => sum + line.quantity * line.unitPrice,
    0
  )
}

export function ordersBySupplier(supplierId: string) {
  return purchaseOrders.filter((order) => order.supplierId === supplierId)
}

export function invoicesBySupplier(supplierId: string) {
  return invoices.filter((invoice) => invoice.supplierId === supplierId)
}

export function invoicesByOrder(orderId: string) {
  return invoices.filter((invoice) => invoice.orderId === orderId)
}

export function deliveriesBySupplier(supplierId: string) {
  return deliveries
    .filter((delivery) => delivery.supplierId === supplierId)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export function deliveriesByOrder(orderId: string) {
  return deliveries
    .filter((delivery) => delivery.orderId === orderId)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function requisitionsBySupplier(supplierId: string) {
  return requisitions.filter((item) => item.supplierId === supplierId)
}

export function isOpenOrder(order: PurchaseOrder) {
  return openOrderStatuses.includes(order.status)
}

export function formatCurrency(value: number, compact = false) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(value)
}
