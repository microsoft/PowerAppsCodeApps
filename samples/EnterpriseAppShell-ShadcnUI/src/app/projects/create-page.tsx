import * as React from "react"
import { useNavigate } from "react-router"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import { FieldMessage, FormErrorSummary } from "@/components/common/form-validation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { allProjects } from "./data"

const leads = [...new Set(allProjects.map((project) => project.lead))]
const clients = [
  "Northwind",
  "Contoso",
  "Fabrikam",
  "Tailwind Traders",
  "Adventure Works",
]
const teamMembers = [
  "Ava Cole",
  "Milo Reed",
  "Nina Park",
  "Owen Diaz",
  "Ruth Kane",
  "Leo Frank",
]

type Draft = {
  name: string
  description: string
  client: string
  lead: string
  start: string
  due: string
  budget: string
  priority: string
}

export default function CreateProjectPage() {
  const navigate = useNavigate()
  const [draft, setDraft] = React.useState<Draft>({
    name: "",
    description: "",
    client: "",
    lead: "",
    start: "",
    due: "",
    budget: "",
    priority: "medium",
  })

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(draft, {
    name: (values) =>
      values.name.trim().length < 3
        ? "Give the project a name of at least 3 characters."
        : undefined,
    client: (values) => (values.client ? undefined : "Pick the client."),
    lead: (values) => (values.lead ? undefined : "Pick a project lead."),
    start: (values) => (values.start ? undefined : "Set a start date."),
    due: (values) => {
      if (!values.due) return "Set a due date."
      if (values.start && values.due < values.start)
        return "The due date cannot fall before the start date."
      return undefined
    },
    budget: (values) =>
      values.budget && Number(values.budget) < 0
        ? "Budget cannot be negative."
        : undefined,
  })

  const submit = handleSubmit(() => {
    toast.success("Project created", {
      description: `${draft.name} was added to the portfolio.`,
    })
    navigate("/projects/list")
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-xl font-semibold">Create Project</h2>
        <p className="text-sm text-muted-foreground">
          Set up a new project and assign the delivery team.
        </p>
      </div>

      <form
        noValidate
        onSubmit={submit}
        className="grid items-start gap-4 md:gap-6 lg:grid-cols-3"
      >
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Basic information shown across dashboards and reports.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                value={draft.name}
                onChange={(event) => set("name", event.target.value)}
                placeholder="Brand Logo Design"
                {...fieldProps("name")}
              />
              <FieldMessage error={errorFor("name")} />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="project-description">Description</Label>
              <Textarea
                id="project-description"
                value={draft.description}
                onChange={(event) => set("description", event.target.value)}
                placeholder="What is this project delivering?"
                rows={4}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-client">Client</Label>
                <Select
                  value={draft.client}
                  onValueChange={(value) => set("client", value)}
                >
                  <SelectTrigger id="project-client" {...fieldProps("client")}>
                    <SelectValue placeholder="Select a client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client} value={client}>
                        {client}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldMessage error={errorFor("client")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-lead">Project lead</Label>
                <Select
                  value={draft.lead}
                  onValueChange={(value) => set("lead", value)}
                >
                  <SelectTrigger id="project-lead" {...fieldProps("lead")}>
                    <SelectValue placeholder="Select a lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {leads.map((lead) => (
                      <SelectItem key={lead} value={lead}>
                        {lead}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldMessage error={errorFor("lead")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-start">Start date</Label>
                <DatePicker
                  id="project-start"
                  value={draft.start}
                  onChange={(value) => set("start", value)}
                  placeholder="Select a start date"
                  invalid={fieldProps("start")["aria-invalid"]}
                />
                <FieldMessage error={errorFor("start")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-due">Due date</Label>
                <DatePicker
                  id="project-due"
                  value={draft.due}
                  onChange={(value) => set("due", value)}
                  placeholder="Select a due date"
                  invalid={fieldProps("due")["aria-invalid"]}
                />
                <FieldMessage error={errorFor("due")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-budget">Budget</Label>
                <Input
                  id="project-budget"
                  type="number"
                  min={0}
                  value={draft.budget}
                  onChange={(event) => set("budget", event.target.value)}
                  placeholder="25000"
                  {...fieldProps("budget")}
                />
                <FieldMessage error={errorFor("budget")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="project-priority">Priority</Label>
                <Select
                  value={draft.priority}
                  onValueChange={(value) => set("priority", value)}
                >
                  <SelectTrigger id="project-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4 md:gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Team</CardTitle>
              <CardDescription>Who is working on this project.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {teamMembers.map((member) => (
                <div key={member} className="flex items-center gap-3">
                  <Checkbox id={`member-${member}`} />
                  <Label htmlFor={`member-${member}`} className="font-normal">
                    {member}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Options</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="notify" className="font-normal">
                  Notify the team on creation
                </Label>
                <Switch id="notify" defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="billable" className="font-normal">
                  Track as billable work
                </Label>
                <Switch id="billable" />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <FormErrorSummary className="w-full" errors={visibleErrors} />
              <Button type="submit" className="w-full">
                Create Project
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => navigate("/projects/list")}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  )
}
