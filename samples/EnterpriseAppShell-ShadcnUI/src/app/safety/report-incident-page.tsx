import * as React from "react"
import { format, parseISO } from "date-fns"
import { ArrowLeftIcon, SendIcon } from "lucide-react"
import { Link, useNavigate } from "react-router"
import { toast } from "sonner"

import { DatePicker } from "@/components/common/date-picker"
import { FieldMessage, FormErrorSummary } from "@/components/common/form-validation"
import { useFormValidation } from "@/hooks/use-form-validation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import {
  incidentTypes,
  severities,
  sites,
  type IncidentType,
  type Photo,
  type Severity,
  type Site,
} from "./data"
import { PhotoUpload } from "./components/photo-upload"
import { severityStyles } from "./status"

/** The app's mock "today". */
const TODAY = "2026-09-02"

export default function SafetyReportIncidentPage() {
  const navigate = useNavigate()
  const [title, setTitle] = React.useState("")
  const [type, setType] = React.useState<IncidentType>("Near miss")
  const [severity, setSeverity] = React.useState<Severity>("Medium")
  const [site, setSite] = React.useState<Site>("Cleveland Plant")
  const [area, setArea] = React.useState("")
  const [occurredOn, setOccurredOn] = React.useState("2026-09-02")
  const [description, setDescription] = React.useState("")
  const [immediateAction, setImmediateAction] = React.useState("")
  const [anonymous, setAnonymous] = React.useState(false)
  const [photos, setPhotos] = React.useState<Photo[]>([])

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
    { title, description, occurredOn },
    {
      title: (values) =>
        values.title.trim().length < 3
          ? "Add a short headline so the incident is easy to find."
          : undefined,
      description: (values) =>
        values.description.trim().length < 11
          ? "Describe what happened in at least a sentence."
          : undefined,
      occurredOn: (values) => {
        if (!values.occurredOn) return "Set the date the incident occurred."
        if (values.occurredOn > TODAY)
          return "The incident cannot have occurred in the future."
        return undefined
      },
    },
  )

  const submit = handleSubmit(() => {
    toast.success(`${title} reported`, {
      description: `${type} at ${site}${
        photos.length ? ` \u00b7 ${photos.length} photo(s) attached` : ""
      }`,
    })
    navigate("/safety/incidents")
  })

  return (
    <form
      noValidate
      onSubmit={submit}
      className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6"
    >
      <Button asChild variant="ghost" size="sm" className="-ml-2 w-fit">
        <Link to="/safety/incidents">
          <ArrowLeftIcon />
          Incidents
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report an incident</CardTitle>
              <CardDescription>
                Report anything that caused harm, could have caused harm, or
                left an unsafe condition behind.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">Headline</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Forklift clipped racking in aisle 12"
                  {...fieldProps("title")}
                />
                <FieldMessage error={errorFor("title")} />
              </div>

              <div className="grid gap-4 @xl/main:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="site">Site</Label>
                  <Select
                    value={site}
                    onValueChange={(value) => setSite(value as Site)}
                  >
                    <SelectTrigger id="site" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {sites.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="area">Exact location</Label>
                  <Input
                    id="area"
                    value={area}
                    onChange={(event) => setArea(event.target.value)}
                    placeholder="e.g. Aisle 12 — bulk storage"
                  />
                </div>
              </div>

              <div className="grid gap-4 @xl/main:grid-cols-3">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="type">Category</Label>
                  <Select
                    value={type}
                    onValueChange={(value) => setType(value as IncidentType)}
                  >
                    <SelectTrigger id="type" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {incidentTypes.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="severity">Severity</Label>
                  <Select
                    value={severity}
                    onValueChange={(value) => setSeverity(value as Severity)}
                  >
                    <SelectTrigger id="severity" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {severities.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="occurred">Date occurred</Label>
                  <DatePicker
                    id="occurred"
                    value={occurredOn}
                    onChange={setOccurredOn}
                    placeholder="Select a date"
                    clearable={false}
                    invalid={fieldProps("occurredOn")["aria-invalid"]}
                  />
                  <FieldMessage error={errorFor("occurredOn")} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">What happened</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={5}
                  placeholder="Describe the sequence of events, who was involved, and what conditions were present."
                  {...fieldProps("description")}
                />
                <FieldMessage error={errorFor("description")} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="immediate">Immediate action taken</Label>
                <Textarea
                  id="immediate"
                  value={immediateAction}
                  onChange={(event) => setImmediateAction(event.target.value)}
                  rows={3}
                  placeholder="What was done straight away to make the area safe?"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Photos</CardTitle>
              <CardDescription>
                Photographs taken at the time are the single most useful piece
                of evidence in an investigation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PhotoUpload
                photos={photos}
                onChange={setPhotos}
                label="Attach photos of the scene"
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card className="h-fit lg:sticky lg:top-4">
            <CardHeader>
              <CardTitle>Summary</CardTitle>
              <CardDescription>Review before submitting</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Category</span>
                <Badge variant="outline">{type}</Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Severity</span>
                <Badge variant="secondary" className={severityStyles[severity]}>
                  {severity}
                </Badge>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Site</span>
                <span className="font-medium">{site}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Occurred</span>
                <span className="font-medium tabular-nums">
                  {occurredOn ? format(parseISO(occurredOn), "dd MMM yyyy") : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Photos</span>
                <span className="font-medium tabular-nums">{photos.length}</span>
              </div>

              <div className="flex items-start justify-between gap-4 rounded-xl border p-3">
                <div>
                  <Label htmlFor="anonymous" className="text-sm">
                    Report anonymously
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Your name is withheld from the investigation record.
                  </p>
                </div>
                <Switch
                  id="anonymous"
                  checked={anonymous}
                  onCheckedChange={setAnonymous}
                />
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-2">
              <FormErrorSummary className="w-full" errors={visibleErrors} />
              <Button type="submit" className="w-full">
                <SendIcon />
                Submit report
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => navigate("/safety/incidents")}
              >
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  )
}
