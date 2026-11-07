import * as React from "react"
import {
  BookOpenIcon,
  CheckCircle2Icon,
  CommandIcon,
  ExternalLinkIcon,
  KeyboardIcon,
  LifeBuoyIcon,
  MailIcon,
  MessageCircleIcon,
  PlayCircleIcon,
} from "lucide-react"
import { Link } from "react-router"
import { toast } from "sonner"

import { FieldMessage, FormErrorSummary } from "@/components/common/form-validation"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import { useFormValidation } from "@/hooks/use-form-validation"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
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
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"

const quickLinks = [
  {
    title: "Getting started",
    description: "A 10 minute tour of the shell, navigation and apps.",
    icon: <PlayCircleIcon className="size-5" />,
    to: "/",
    action: "Open dashboard",
  },
  {
    title: "Report an incident",
    description: "Log an injury, near miss or hazard with photo evidence.",
    icon: <LifeBuoyIcon className="size-5" />,
    to: "/safety/incidents/new",
    action: "Start a report",
  },
  {
    title: "Risk analysis",
    description: "Score hazards on the 5×5 likelihood and impact matrix.",
    icon: <BookOpenIcon className="size-5" />,
    to: "/safety/risks",
    action: "Open matrix",
  },
  {
    title: "Corrective actions",
    description: "Track remediation work across the Kanban board.",
    icon: <CheckCircle2Icon className="size-5" />,
    to: "/safety/actions",
    action: "Open board",
  },
]

const faqs = [
  {
    id: "f1",
    topic: "Getting started",
    question: "How do I switch between apps?",
    answer:
      "Every app lives under its own group in the left sidebar — Projects, Tasks, CRM, Procurement and Health & Safety. Expand a group to see its pages. The breadcrumb at the top always shows which app and page you are on.",
  },
  {
    id: "f2",
    topic: "Appearance",
    question: "Can I change the colors or use dark mode?",
    answer:
      "Yes. Open Settings › Appearance to pick light, dark or system mode and choose from ten accent colors. The palette buttons in the header do the same thing and your choice is saved to this browser.",
  },
  {
    id: "f3",
    topic: "Health & Safety",
    question: "How do I attach photos to an incident?",
    answer:
      "On the incident details page, scroll to the Evidence card and drag images onto the drop zone, or use Choose files. On a phone, Take photo opens the camera directly. JPEG, PNG, WebP and HEIC up to 10 MB each are accepted.",
  },
  {
    id: "f4",
    topic: "Health & Safety",
    question: "What is the difference between inherent and residual risk?",
    answer:
      "Inherent risk is the score before any controls are applied. Residual risk is the score once the listed controls are in place. Use the toggle above the matrix to switch views — the register and the drawer follow whichever view is selected.",
  },
  {
    id: "f5",
    topic: "Health & Safety",
    question: "How is safety walk compliance calculated?",
    answer:
      "Compliance is the share of checklist items marked Pass out of every item that was actually scored. Items marked N/A are excluded, so skipping an irrelevant check will not penalise the walk.",
  },
  {
    id: "f6",
    topic: "Tasks",
    question: "Why will a card not move on the Kanban board?",
    answer:
      "Drag has an 8 pixel threshold so that a short click still opens the record. Press and move a little further, or use the keyboard: focus the card with Tab, press Space to lift it, arrow keys to move, and Space again to drop.",
  },
  {
    id: "f7",
    topic: "Data",
    question: "Is this working with real data?",
    answer:
      "Not yet. Every app currently reads from local sample data so the flows can be reviewed end to end. Connecting a live data source replaces the mock modules without changing the pages.",
  },
  {
    id: "f8",
    topic: "Account",
    question: "How do I turn off email digests?",
    answer:
      "Settings › Notifications has a Digests group. Turn off Daily summary and Weekly report there — alerts for mentions, approvals and incidents stay on unless you switch them off too.",
  },
]

const shortcuts = [
  { keys: ["Ctrl", "B"], label: "Toggle the sidebar" },
  { keys: ["Ctrl", "K"], label: "Open search" },
  { keys: ["G", "then", "D"], label: "Go to dashboard" },
  { keys: ["G", "then", "S"], label: "Go to Health & Safety" },
  { keys: ["Space"], label: "Lift or drop a Kanban card" },
  { keys: ["Esc"], label: "Close a drawer or dialog" },
]

const categories = [
  "Something is broken",
  "Question about a feature",
  "Data looks wrong",
  "Access or permissions",
  "Feature request",
]

export default function HelpPage() {
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [subject, setSubject] = React.useState("")
  const [category, setCategory] = React.useState(categories[0])
  const [message, setMessage] = React.useState("")

  const term = search.trim().toLowerCase()
  const results = term
    ? faqs.filter((faq) =>
        `${faq.question} ${faq.answer} ${faq.topic}`.toLowerCase().includes(term)
      )
    : faqs

  const { errorFor, fieldProps, handleSubmit, visibleErrors } =
    useFormValidation(
      { subject, message },
      {
        subject: (values) =>
          values.subject.trim().length < 3
            ? "Add a subject so we can route this quickly."
            : undefined,
        message: (values) =>
          values.message.trim().length < 11
            ? "Tell us what happened in at least a sentence."
            : undefined,
      },
    )

  const submit = handleSubmit(() => {
    toast.success("Support request sent", {
      description: `${category} · we usually reply within one business day.`,
    })
    setSubject("")
    setMessage("")
  })

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Get Help</h2>
          <p className="text-sm text-muted-foreground">
            Guides, answers and a direct line to the team.
          </p>
        </div>
        <SearchInput
          value={query}
          onValueChange={setQuery}
          busy={searching}
          placeholder="Search help articles"
          className="w-full sm:w-72"
          aria-label="Search help articles"
        />
      </div>

      <div className="grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {quickLinks.map((link) => (
          <Card key={link.title} className="gap-3">
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {link.icon}
              </span>
            </CardHeader>
            <CardContent className="flex flex-col gap-1">
              <p className="text-sm font-medium">{link.title}</p>
              <p className="text-xs text-muted-foreground">{link.description}</p>
            </CardContent>
            <CardFooter>
              <Button asChild size="sm" variant="outline" className="w-full">
                <Link to={link.to}>{link.action}</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_340px] @4xl/main:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Frequently asked questions</CardTitle>
            <CardDescription>
              {term
                ? `${results.length} result(s) for "${search.trim()}"`
                : `${faqs.length} answers across every app`}
            </CardDescription>
            {term && (
              <CardAction>
                <Button size="sm" variant="ghost" onClick={() => setQuery("")}>
                  Clear
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CardContent>
            {results.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {results.map((faq) => (
                  <AccordionItem key={faq.id} value={faq.id}>
                    <AccordionTrigger className="text-left">
                      <span className="flex flex-1 items-center gap-3 pr-2">
                        <span className="flex-1">{faq.question}</span>
                        <Badge variant="outline" className="shrink-0 font-normal">
                          {faq.topic}
                        </Badge>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">
                Nothing matched "{search.trim()}". Try a different word, or send us
                a message below.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <KeyboardIcon className="size-4" />
                Keyboard shortcuts
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {shortcuts.map((shortcut) => (
                <div
                  key={shortcut.label}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="text-muted-foreground">{shortcut.label}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {shortcut.keys.map((key) =>
                      key === "then" ? (
                        <span key={key} className="text-xs text-muted-foreground">
                          then
                        </span>
                      ) : (
                        <kbd
                          key={key}
                          className="rounded border bg-muted px-1.5 py-0.5 font-mono text-[11px]"
                        >
                          {key}
                        </kbd>
                      )
                    )}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Still stuck?</CardTitle>
              <CardDescription>
                Reach the team directly. Average first reply is under a day.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <a
                className="flex items-center gap-2 rounded-lg border p-2 transition-colors hover:bg-muted/50"
                href="mailto:support@example.com"
              >
                <MailIcon className="size-4 text-muted-foreground" />
                support@example.com
              </a>
              <span className="flex items-center gap-2 rounded-lg border p-2">
                <MessageCircleIcon className="size-4 text-muted-foreground" />
                Teams channel · Enterprise App Shell
              </span>
              <span className="flex items-center gap-2 rounded-lg border p-2">
                <CommandIcon className="size-4 text-muted-foreground" />
                Acme Inc. · Workspace admin
              </span>
              <Separator className="my-1" />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>All systems operational</span>
                <Badge variant="secondary" className="bg-success/10 text-success">
                  Healthy
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>App version</span>
                <span className="tabular-nums">1.4.0 · 2026-09-02</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <form noValidate onSubmit={submit}>
          <CardHeader>
            <CardTitle>Contact support</CardTitle>
            <CardDescription>
              Tell us what happened and we will pick it up from here.
            </CardDescription>
            <CardAction>
              <Button asChild size="sm" variant="ghost">
                <a
                  href="https://ui.shadcn.com/docs"
                  target="_blank"
                  rel="noreferrer"
                >
                  Documentation
                  <ExternalLinkIcon />
                </a>
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-4 @2xl/main:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="support-subject">Subject</Label>
                <Input
                  id="support-subject"
                  value={subject}
                  onChange={(event) => setSubject(event.target.value)}
                  placeholder="Photos are not uploading on the incident page"
                  {...fieldProps("subject")}
                />
                <FieldMessage error={errorFor("subject")} />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="support-category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="support-category" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="support-message">What happened?</Label>
              <Textarea
                id="support-message"
                rows={5}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Include the page you were on and what you expected to happen."
                {...fieldProps("message")}
              />
              <FieldMessage
                error={errorFor("message")}
                hint="Your browser, app version and current page are attached automatically."
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-3 border-t">
            <FormErrorSummary errors={visibleErrors} />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setMessage("")}
              >
                Clear
              </Button>
              <Button type="submit">Send request</Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
