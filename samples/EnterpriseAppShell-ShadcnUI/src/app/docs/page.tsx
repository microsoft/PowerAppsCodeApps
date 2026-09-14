import * as React from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import {
  BookOpenIcon,
  BotIcon,
  CheckIcon,
  CopyIcon,
  DatabaseIcon,
  ExternalLinkIcon,
  FolderTreeIcon,
  RocketIcon,
  ShieldAlertIcon,
  SparklesIcon,
  TerminalIcon,
  TriangleAlertIcon,
  WorkflowIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const DOCS = {
  overview: "https://learn.microsoft.com/power-apps/developer/code-apps/overview",
  quickstart:
    "https://learn.microsoft.com/power-apps/developer/code-apps/how-to/create-an-app-from-scratch",
  cli: "https://learn.microsoft.com/power-apps/developer/code-apps/reference/cli",
  data: "https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-data",
  dataverse:
    "https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-dataverse",
  connection:
    "https://learn.microsoft.com/power-apps/developer/code-apps/how-to/create-connection",
  flows: "https://learn.microsoft.com/power-apps/developer/code-apps/how-to/add-flows",
  copilotStudio:
    "https://learn.microsoft.com/power-apps/developer/code-apps/how-to/connect-to-copilot-studio",
  connectors: "https://learn.microsoft.com/connectors/connector-reference/",
  samples: "https://github.com/microsoft/PowerAppsCodeApps",
  clientLibrary: "https://www.npmjs.com/package/@microsoft/power-apps",
  copilotAgentMode: "https://code.visualstudio.com/docs/copilot/chat/chat-agent-mode",
  copilotCustomization:
    "https://code.visualstudio.com/docs/copilot/customization/overview",
} as const

const stack = [
  "React 19",
  "TypeScript",
  "Vite",
  "Tailwind CSS v4",
  "shadcn/ui",
  "react-router",
  "@microsoft/power-apps",
]

const repoMap = [
  { path: "src/app/<module>/", note: "One folder per app: pages, mock data, agent stubs." },
  { path: "src/app/<module>/module.tsx", note: "The app's manifest: its routes, titles and sidebar entry." },
  { path: "src/app/<module>/components/", note: "Components used by that app only. Deleted with it." },
  { path: "src/app/modules.ts", note: "The registry. One line per app; remove a line to remove an app." },
  { path: "src/components/ui/", note: "shadcn primitives. Treat as vendor code." },
  { path: "src/components/common/", note: "Shared building blocks any app can reuse." },
  { path: "src/components/layout/", note: "Shell: sidebar, header, layout, error boundary." },
  { path: "src/lib/", note: "Module types, routes, theme, error handling, helpers." },
  { path: "src/generated/", note: "CLI output for data sources. Never hand-edit." },
  { path: "power.config.json", note: "Environment, connections and flow references. Gitignored — `pa app init` writes it." },
]

const references = [
  { label: "Code apps overview", href: DOCS.overview },
  { label: "Quickstart with the CLI", href: DOCS.quickstart },
  { label: "Power Apps CLI reference", href: DOCS.cli },
  { label: "Add data sources", href: DOCS.data },
  { label: "Connect to Dataverse", href: DOCS.dataverse },
  { label: "Add Power Automate flows", href: DOCS.flows },
  { label: "Connect to Copilot Studio", href: DOCS.copilotStudio },
  { label: "Create a connection from the CLI", href: DOCS.connection },
  { label: "Connector reference (1,500+)", href: DOCS.connectors },
  { label: "Samples on GitHub", href: DOCS.samples },
]

const prompts = [
  {
    title: "Add a screen",
    body: "Add a Contracts page under src/app/procurement following the same page shell, filters and pagination as the purchase orders page. Register the route in src/app/procurement/module.tsx.",
  },
  {
    title: "Remove an app you do not need",
    body: "Delete the src/app/recruiting folder and remove its line from src/app/modules.ts. Nothing else references it, so the routes, sidebar entry and breadcrumbs all disappear with it.",
  },
  {
    title: "Swap mock data for Dataverse",
    body: "src/app/crm/data.ts is mock data. I have added the accounts table with the CLI. Replace the reads with AccountsService, keep the same exported function signatures, and handle failures with notifyError.",
  },
  {
    title: "Wire up a flow",
    body: "Call ApprovalWorkflowService.Run when the Approve button is pressed on the comms details page. Show a pending state, a success toast, and route the failure through notifyError with a retry.",
  },
  {
    title: "Review before you ship",
    body: "Run npx tsc -b --noEmit and npm run lint, then fix anything you introduced. Do not touch the pre-existing warnings in src/components/ui.",
  },
]

function CodeBlock({
  code,
  language = "bash",
  className,
}: {
  code: string
  language?: string
  className?: string
}) {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success("Copied to clipboard")
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      toast.error("Your browser blocked the clipboard", {
        description: "Select the text and copy it manually.",
      })
    }
  }

  return (
    <div className={cn("group relative", className)}>
      <pre className="overflow-x-auto rounded-lg border bg-muted/50 py-3 pr-12 pl-4 font-mono text-[13px] leading-relaxed">
        <code>{code}</code>
      </pre>
      <Button
        size="icon"
        variant="ghost"
        onClick={copy}
        aria-label={`Copy ${language} snippet`}
        className="absolute top-2 right-2 size-7 opacity-60 transition-opacity hover:opacity-100"
      >
        {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      </Button>
    </div>
  )
}

function Step({
  number,
  title,
  last,
  children,
}: {
  number: number
  title: string
  last?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center gap-2">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground tabular-nums">
          {number}
        </span>
        {!last && <span className="w-px flex-1 bg-border" />}
      </div>
      <div className={cn("flex-1 space-y-3", last ? "pb-2" : "pb-6")}>
        <p className="text-sm font-medium">{title}</p>
        {children}
      </div>
    </div>
  )
}

function Note({
  tone = "info",
  children,
}: {
  tone?: "info" | "warning"
  children: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex gap-3 rounded-lg border p-3 text-sm",
        tone === "warning"
          ? "border-warning/40 bg-warning/10 text-foreground"
          : "bg-muted/40 text-muted-foreground"
      )}
    >
      {tone === "warning" && (
        <TriangleAlertIcon className="mt-0.5 size-4 shrink-0 text-warning" />
      )}
      <div className="[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:font-mono [&_code]:text-[12px]">
        {children}
      </div>
    </div>
  )
}

function ExternalLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-medium text-primary underline-offset-4 hover:underline"
    >
      {children}
    </a>
  )
}

export default function DocsPage() {
  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Documentation</h2>
          <p className="max-w-2xl text-sm text-muted-foreground">
            How to build on this app with a coding agent, and how to connect it to
            Dataverse tables, Power Automate flows and Copilot Studio agents.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button size="sm" variant="outline" asChild>
            <a href={DOCS.overview} target="_blank" rel="noreferrer">
              <ExternalLinkIcon />
              Code apps docs
            </a>
          </Button>
          <Button size="sm" asChild>
            <a href={DOCS.samples} target="_blank" rel="noreferrer">
              <ExternalLinkIcon />
              Samples
            </a>
          </Button>
        </div>
      </div>

      <Card className="gap-4 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpenIcon className="size-4" />
            This is a Power Apps code app
          </CardTitle>
          <CardDescription className="max-w-3xl">
            It is a normal web app you run with <code className="font-mono">npm run dev</code>,
            hosted and governed by Power Platform. That means Microsoft Entra sign-in,
            Data Loss Prevention policies and Conditional Access come with the platform,
            while the UI and the logic stay entirely yours.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {stack.map((item) => (
            <Badge key={item} variant="secondary" className="font-normal">
              {item}
            </Badge>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px] @4xl/main:items-start">
        <Tabs defaultValue="start" className="gap-4">
          <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden">
            <TabsTrigger value="start">Start here</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="copilot">Coding agents</TabsTrigger>
            <TabsTrigger value="dataverse">Dataverse</TabsTrigger>
            <TabsTrigger value="flows">Flows</TabsTrigger>
            <TabsTrigger value="agents">Agents</TabsTrigger>
            <TabsTrigger value="errors">Errors</TabsTrigger>
          </TabsList>

          <TabsContent value="start">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <RocketIcon className="size-4" />
                  From clone to published app
                </CardTitle>
                <CardDescription>
                  Four steps. The whole loop is the Power Apps CLI plus the npm scripts
                  you already know.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Step number={1} title="Install the tools">
                  <p className="text-sm text-muted-foreground">
                    Visual Studio Code, Node.js LTS, Git and the Power Apps CLI. An
                    administrator has to switch on <strong>Power Apps code apps</strong> for
                    the environment in the Power Platform admin center, and everyone who
                    runs the app needs a Power Apps Premium licence.
                  </p>
                  <CodeBlock code={"npm install -g @microsoft/power-apps-cli\npa --version"} />
                </Step>

                <Step number={2} title="Run it locally">
                  <p className="text-sm text-muted-foreground">
                    Nothing Power Platform specific here — install the dependencies and
                    start Vite.
                  </p>
                  <CodeBlock code={"npm install\nnpm run dev"} />
                </Step>

                <Step number={3} title="Point it at your environment">
                  <p className="text-sm text-muted-foreground">
                    The environment ID is the GUID in the maker portal URL:{" "}
                    <code className="font-mono text-xs">
                      make.powerapps.com/environments/&lt;environment-id&gt;/home
                    </code>
                    . The command writes it into{" "}
                    <code className="font-mono text-xs">power.config.json</code>.
                  </p>
                  <CodeBlock code={'pa app init -n "Enterprise App Shell" -e <environment-id>'} />
                </Step>

                <Step number={4} title="Build and publish" last>
                  <p className="text-sm text-muted-foreground">
                    <code className="font-mono text-xs">pa app push</code> uploads the
                    contents of <code className="font-mono text-xs">dist</code> and makes
                    the app available in Power Apps.
                  </p>
                  <CodeBlock code={"npm run build\npa app push"} />
                </Step>

                <div className="mt-4 pl-11">
                  <Note>
                    Starting a new app instead? Scaffold one with{" "}
                    <ExternalLink href={DOCS.quickstart}>the CLI quickstart</ExternalLink>{" "}
                    and read the full command list in the{" "}
                    <ExternalLink href={DOCS.cli}>CLI reference</ExternalLink>.
                  </Note>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderTreeIcon className="size-4" />
                  One folder per app, one registry
                </CardTitle>
                <CardDescription>
                  Everything an app owns lives under its own folder. Routes, the sidebar
                  and breadcrumbs are all derived from{" "}
                  <code className="font-mono text-xs">src/app/modules.ts</code> — there is
                  no second list to keep in sync.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <CodeBlock
                  language="text"
                  code={`src/
  app/
    modules.ts              the registry — one line per app
    <module>/
      module.tsx            routes, titles, sidebar entry
      components/           components used by this app only
      data.ts store.ts      mock data and state
      *-page.tsx            screens
  components/
    ui/                     shadcn primitives — vendor code, do not edit
    common/                 shared building blocks any app can reuse
    layout/                 the shell: sidebar, header, layout, error boundary
  lib/                      AppModule types, breadcrumbs, errors, utils
  generated/                CLI output — never edit by hand`}
                />
                <Note>
                  This shell ships fourteen example apps on purpose. Keep the two or three
                  that match your problem and delete the rest — the structure is built so
                  that deleting is cheap.
                </Note>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderTreeIcon className="size-4" />
                  Remove an app you do not need
                </CardTitle>
                <CardDescription>
                  Two actions. Its routes, sidebar group and breadcrumbs go with it.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Step number={1} title="Delete the folder">
                  <CodeBlock language="text" code={"src/app/<module>/"} />
                </Step>
                <Step number={2} title="Delete its import and its line in the registry">
                  <CodeBlock language="text" code={"src/app/modules.ts"} />
                  <p className="text-sm text-muted-foreground">
                    Then run <code className="font-mono text-xs">npx tsc -b --noEmit</code>
                    . It tells you immediately if you missed something.
                  </p>
                </Step>
                <Step number={3} title="Drop anything only that app used" last>
                  <p className="text-sm text-muted-foreground">
                    Third-party packages used by a single app can go too. For example{" "}
                    <code className="font-mono text-xs">maplibre-gl</code> is only imported
                    by{" "}
                    <code className="font-mono text-xs">
                      src/app/fieldops/components/map-canvas.tsx
                    </code>
                    , so deleting FieldOps lets you uninstall it and drop roughly a
                    megabyte from the bundle.
                  </p>
                </Step>

                <div className="mt-4 pl-11">
                  <Note tone="warning">
                    The one deliberate cross-app link is{" "}
                    <code className="font-mono text-xs">
                      src/app/projects/related-tasks.ts
                    </code>
                    , which lets the Projects detail page list related Tasks. If you delete
                    the Tasks app, make that function return an empty array — nothing else
                    in Projects changes.
                  </Note>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderTreeIcon className="size-4" />
                  Add an app
                </CardTitle>
                <CardDescription>
                  A module declares its own routes, titles and sidebar entry, so the shell
                  picks it up from one import.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Step number={1} title="Create the folder and its pages">
                  <CodeBlock
                    language="text"
                    code={"src/app/inventory/\n  page.tsx\n  details-page.tsx"}
                  />
                </Step>
                <Step number={2} title="Add module.tsx">
                  <CodeBlock
                    language="tsx"
                    code={`import * as React from "react"
import { PackageIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const inventoryModule: AppModule = {
  id: "inventory",
  title: "Inventory",
  group: "apps",            // "main" | "apps" | "secondary"
  icon: <PackageIcon />,
  routes: [
    {
      path: "inventory",
      title: "Stock Levels",
      nav: "Stock Levels",  // omit nav to keep a route out of the sidebar
      nested: true,         // stay highlighted on child routes
      element: React.lazy(() => import("./page")),
    },
    {
      path: "inventory/:sku",
      title: "Item Details",
      element: React.lazy(() => import("./details-page")),
    },
  ],
}`}
                  />
                </Step>
                <Step number={3} title="Register it" last>
                  <p className="text-sm text-muted-foreground">
                    Add it to <code className="font-mono text-xs">MODULES</code> in{" "}
                    <code className="font-mono text-xs">src/app/modules.ts</code>. The order
                    there is the order in the sidebar.
                  </p>
                </Step>

                <div className="mt-4 pl-11">
                  <Note>
                    Compose from <code className="font-mono text-xs">components/ui</code>{" "}
                    and reuse{" "}
                    <code className="font-mono text-xs">components/common</code> —{" "}
                    <code className="font-mono text-xs">FormShell</code>,{" "}
                    <code className="font-mono text-xs">DataPagination</code>,{" "}
                    <code className="font-mono text-xs">EmptyState</code>,{" "}
                    <code className="font-mono text-xs">SearchInput</code> — so a new app
                    looks like the rest without extra work.
                  </Note>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="copilot" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <SparklesIcon className="size-4" />
                  Building with GitHub Copilot
                </CardTitle>
                <CardDescription>
                  This app was built to be extended by a coding agent. Open the folder in
                  VS Code, switch Copilot Chat to{" "}
                  <ExternalLink href={DOCS.copilotAgentMode}>agent mode</ExternalLink>, and
                  describe the outcome rather than the edit.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-3">
                  <p className="text-sm font-medium">Give it the house rules once</p>
                  <p className="text-sm text-muted-foreground">
                    Put conventions in{" "}
                    <code className="font-mono text-xs">.github/copilot-instructions.md</code>{" "}
                    or <code className="font-mono text-xs">AGENTS.md</code> so every request
                    inherits them —{" "}
                    <ExternalLink href={DOCS.copilotCustomization}>
                      customisation options
                    </ExternalLink>
                    . Worth stating: use shadcn primitives only, keep the page shell and
                    pagination pattern, Tailwind v4 container queries, and never edit{" "}
                    <code className="font-mono text-xs">src/generated</code>.
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Prompts that work well here</p>
                  <div className="grid gap-3 @2xl/main:grid-cols-2">
                    {prompts.map((prompt) => (
                      <div
                        key={prompt.title}
                        className="rounded-lg border bg-muted/30 p-3 text-sm"
                      >
                        <p className="mb-1 font-medium">{prompt.title}</p>
                        <p className="text-muted-foreground italic">"{prompt.body}"</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <p className="text-sm font-medium">Let it check its own work</p>
                  <CodeBlock code={"npx tsc -b --noEmit\nnpm run lint\nnpm run build"} />
                  <Note tone="warning">
                    Read the diff before you accept it. An agent that cannot run the CLI
                    will happily invent a connector name or a table schema — the commands
                    on the Dataverse and Flows tabs are the source of truth.
                  </Note>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dataverse" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DatabaseIcon className="size-4" />
                  Connect a Dataverse table
                </CardTitle>
                <CardDescription>
                  One command per table. The CLI generates a typed model and a service
                  with full CRUD, and registers the table in{" "}
                  <code className="font-mono text-xs">power.config.json</code>.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Add the table</p>
                  <CodeBlock code={"pa app add data-source --connector dataverse --table <table-logical-name>"} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">2. Look at what it generated</p>
                  <CodeBlock
                    code={
                      "src/generated/\n  models/AccountsModel.ts     # the row shape\n  services/AccountsService.ts # create, get, getAll, update, delete"
                    }
                    language="text"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">3. Read and write</p>
                  <CodeBlock
                    language="typescript"
                    code={`import { AccountsService } from "@/generated/services/AccountsService"

const result = await AccountsService.getAll({
  select: ["name", "accountnumber"], // always limit the columns
  filter: "statecode eq 0",
  orderBy: ["name asc"],
  top: 50,
})

const accounts = result.data ?? []`}
                  />
                </div>

                <Note tone="warning">
                  On update, send only the fields that actually changed. Replaying a whole
                  record you read earlier marks every column as modified, which fires
                  business logic and pollutes the audit history.
                </Note>

                <div className="grid gap-3 @2xl/main:grid-cols-2">
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-medium">Supported</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>CRUD and paging</li>
                      <li>Delegated filter, sort and top</li>
                      <li>Formatted option-set labels</li>
                      <li>Table metadata</li>
                      <li>File and image columns (preview)</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-3">
                    <p className="mb-2 text-sm font-medium">Not supported yet</p>
                    <ul className="space-y-1 text-sm text-muted-foreground">
                      <li>Polymorphic lookups</li>
                      <li>Metadata (schema) CRUD</li>
                      <li>FetchXML</li>
                      <li>Alternate keys</li>
                    </ul>
                  </div>
                </div>

                <Note>
                  For anything other than Dataverse, find the connector with{" "}
                  <code>pa connector list --search teams</code>, create a connection with{" "}
                  <code>pa connection create --connector &lt;connector-id&gt;</code>, then add
                  it with <code>pa app add data-source</code>. Full walkthrough:{" "}
                  <ExternalLink href={DOCS.data}>add data sources</ExternalLink> and{" "}
                  <ExternalLink href={DOCS.connection}>create a connection</ExternalLink>.
                </Note>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flows" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <WorkflowIcon className="size-4" />
                  Call a Power Automate flow
                </CardTitle>
                <CardDescription>
                  Use a flow when the work belongs outside the browser — approvals,
                  provisioning, sending mail, talking to a system the app cannot reach.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Note tone="warning">
                  Only <strong>solution-aware instant flows using the Power Apps trigger</strong>{" "}
                  can be added. Scheduled and automated flows cannot. Add the flow to a
                  solution first if it is not already in one.
                </Note>

                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Find the flow and copy its ID</p>
                  <CodeBlock code={"pa app list-flows --search approval"} />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">2. Add it</p>
                  <CodeBlock code={"pa app add flow --flow-id <flow-id>"} />
                  <p className="text-sm text-muted-foreground">
                    This downloads the flow's OpenAPI definition and generates a typed
                    service. Run the same command again after you change the flow to
                    refresh it, and <code className="font-mono text-xs">pa app remove flow</code>{" "}
                    to take it out.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">3. Run it</p>
                  <CodeBlock
                    language="typescript"
                    code={`import { ApprovalWorkflowService } from "@/services/ApprovalWorkflowService"

const result = await ApprovalWorkflowService.Run({
  requester: "Alex",
  amount: 1500,
})

if (result.success) {
  toast.success("Sent for approval")
} else {
  notifyError(result.error, { title: "The approval flow did not start" })
}`}
                  />
                </div>

                <Note>
                  Whoever runs <code>pa app add flow</code> needs access to the flow and all
                  of its connections, and end users need enough Dataverse permission to
                  invoke it — the App Opener role or equivalent. Details in{" "}
                  <ExternalLink href={DOCS.flows}>add flows to a code app</ExternalLink>.
                </Note>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BotIcon className="size-4" />
                  Call a Copilot Studio agent
                </CardTitle>
                <CardDescription>
                  The agent runs in Copilot Studio with its own topics, knowledge and
                  guardrails. Your app sends a message and renders the response.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">1. Publish the agent and copy its name</p>
                  <p className="text-sm text-muted-foreground">
                    In Copilot Studio open <strong>Channels › Web app</strong> and read the
                    agent name out of the connection string — something like{" "}
                    <code className="font-mono text-xs">cr3e1_customerSupportAgent</code>. It
                    is case sensitive and includes the publisher prefix.
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">2. Add the connector</p>
                  <CodeBlock
                    code={
                      'pa connection list\npa app add data-source --connector "shared_microsoftcopilotstudio" --connection-id <connectionId>'
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    If no connection exists yet, create one with{" "}
                    <code className="font-mono text-xs">
                      pa connection create --connector shared_microsoftcopilotstudio
                    </code>
                    .
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">3. Send a message</p>
                  <CodeBlock
                    language="typescript"
                    code={`import { CopilotStudioService } from "@/generated/services/CopilotStudioService"

const response = await CopilotStudioService.ExecuteCopilotAsyncV2({
  message: "Summarise the latest product trends",
  notificationUrl: "https://notificationurlplaceholder",
  agentName: "cr3e1_trendAnalyzer",
})

if (response.data.completed) {
  console.log(response.data.lastResponse)
}`}
                  />
                </div>

                <Note tone="warning">
                  Use <code>ExecuteCopilotAsyncV2</code>. <code>ExecuteCopilot</code> returns
                  only a conversation ID, and <code>ExecuteCopilotAsync</code> can fail with
                  a 502. Response property casing varies, so read{" "}
                  <code>conversationId</code> defensively.
                </Note>

                <Separator />

                <div className="space-y-2">
                  <p className="text-sm font-medium">Where the agents live in this app</p>
                  <p className="text-sm text-muted-foreground">
                    The agent runs you see in{" "}
                    <Link
                      to="/comms/compose"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Communications
                    </Link>
                    ,{" "}
                    <Link
                      to="/recruiting/transcripts"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Recruiting
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/onboarding/hires"
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      Onboarding
                    </Link>{" "}
                    are stand-ins. Each module has an{" "}
                    <code className="font-mono text-xs">agent.ts</code> that resolves after a
                    delay. Replace the body with a real service call and the screens,
                    progress states and error handling stay exactly as they are.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="errors" className="flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldAlertIcon className="size-4" />
                  Handling failure
                </CardTitle>
                <CardDescription>
                  Every failure goes through{" "}
                  <code className="font-mono text-xs">src/lib/errors.ts</code>, so it is
                  logged once, shown once, and always says what the person should do next.
                  The file has no app-specific imports — copy it into any project.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Show a failure to the user</p>
                  <CodeBlock
                    language="typescript"
                    code={`import { notifyError } from "@/lib/error-toast"

try {
  await runProvisioning(steps)
} catch (error) {
  notifyError(error, {
    code: "onboarding.provisioning",
    title: "The retry could not be completed",
    hint: "Nothing was saved. Try again in a moment.",
    onRetry: () => void retryFailed(),
  })
}`}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Skip the try/catch</p>
                  <CodeBlock
                    language="typescript"
                    code={`import { attempt, fromServiceResult, withRetry } from "@/lib/errors"

// Anything that throws
const accounts = await attempt(() => AccountsService.getAll({ top: 50 }))
if (!accounts.ok) return <ErrorState error={accounts.error} />

// Generated services resolve with { success, data, error }
const started = fromServiceResult(await ApprovalWorkflowService.Run(input))

// Exponential backoff, but only for 408, 429 and 5xx
const rows = await withRetry(() => AccountsService.getAll(), { attempts: 3 })`}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Contain a crash</p>
                  <p className="text-sm text-muted-foreground">
                    Every routed page is already wrapped in an{" "}
                    <code className="font-mono text-xs">ErrorBoundary</code> that keeps the
                    sidebar and header alive and clears itself on navigation. Wrap a widget
                    the same way when it should fail on its own.
                  </p>
                  <CodeBlock
                    language="tsx"
                    code={`<ErrorBoundary resetKeys={[recordId]}>
  <RiskMatrix recordId={recordId} />
</ErrorBoundary>`}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium">Send it somewhere real</p>
                  <p className="text-sm text-muted-foreground">
                    Errors log to the console by default. Register a reporter once at
                    startup to forward them to Application Insights or any other sink.
                  </p>
                  <CodeBlock
                    language="typescript"
                    code={`import { setErrorReporter } from "@/lib/errors"

setErrorReporter((error) => {
  appInsights.trackException({ exception: error }, {
    code: error.code,
    ...error.context,
  })
})`}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TerminalIcon className="size-4" />
                Commands you will use daily
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              {[
                { cmd: "npm run dev", note: "Run locally" },
                { cmd: "npm run build", note: "Type-check and bundle" },
                { cmd: "pa app push", note: "Publish to the environment" },
                { cmd: "pa app list-flows", note: "Find a flow to add" },
                { cmd: "pa connector list", note: "Browse connectors" },
                { cmd: "pa connection list", note: "Find a connection ID" },
              ].map((item) => (
                <div key={item.cmd} className="flex items-baseline justify-between gap-3">
                  <code className="font-mono text-[13px]">{item.cmd}</code>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {item.note}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FolderTreeIcon className="size-4" />
                Where things live
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {repoMap.map((entry) => (
                <div key={entry.path} className="space-y-0.5">
                  <code className="font-mono text-[13px]">{entry.path}</code>
                  <p className="text-xs text-muted-foreground">{entry.note}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <BookOpenIcon className="size-4" />
                Reference
              </CardTitle>
              <CardDescription>Official Microsoft documentation.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col">
              {references.map((reference) => (
                <a
                  key={reference.href}
                  href={reference.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-between gap-3 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted"
                >
                  <span>{reference.label}</span>
                  <ExternalLinkIcon className="size-3.5 shrink-0 text-muted-foreground" />
                </a>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Still stuck?</CardTitle>
              <CardDescription>
                The client library is on npm, and the team publishes end-to-end samples.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href={DOCS.clientLibrary} target="_blank" rel="noreferrer">
                  @microsoft/power-apps
                </a>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/help">Contact the team</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
