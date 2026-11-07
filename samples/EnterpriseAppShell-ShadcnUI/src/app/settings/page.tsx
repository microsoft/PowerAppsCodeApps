import * as React from "react"
import {
  BellIcon,
  CheckIcon,
  KeyRoundIcon,
  LaptopIcon,
  LogOutIcon,
  MonitorIcon,
  MoonIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SunIcon,
} from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { COLOR_THEMES, type Theme, useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"

const timezones = [
  "UTC",
  "Europe/London",
  "Europe/Lisbon",
  "America/New_York",
  "America/Chicago",
  "America/Los_Angeles",
  "Asia/Singapore",
]

const languages = ["English (US)", "English (UK)", "Português", "Español", "Deutsch"]

const densities = ["Comfortable", "Compact"] as const

const modes: { value: Theme; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <SunIcon className="size-4" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="size-4" /> },
  { value: "system", label: "System", icon: <MonitorIcon className="size-4" /> },
]

const notificationGroups = [
  {
    title: "Work",
    items: [
      { id: "tasks", label: "Task assignments", hint: "When a task is assigned to you" },
      { id: "mentions", label: "Mentions and comments", hint: "When someone @mentions you" },
      { id: "approvals", label: "Approvals waiting on me", hint: "Requisitions, invoices and purchase orders" },
    ],
  },
  {
    title: "Safety",
    items: [
      { id: "incidents", label: "New incidents", hint: "Any incident reported at your sites" },
      { id: "critical", label: "Critical severity only", hint: "Page me immediately for critical events" },
      { id: "walks", label: "Safety walk reminders", hint: "The morning a walk is scheduled" },
    ],
  },
  {
    title: "Digests",
    items: [
      { id: "daily", label: "Daily summary", hint: "One email at 07:00 local time" },
      { id: "weekly", label: "Weekly report", hint: "Monday morning rollup across all apps" },
    ],
  },
]

const sessions = [
  { id: "s1", device: "MacBook Pro · Chrome", location: "Lisbon, PT", lastSeen: "Active now", current: true },
  { id: "s2", device: "iPhone 15 · Safari", location: "Lisbon, PT", lastSeen: "2 hours ago", current: false },
  { id: "s3", device: "Windows 11 · Edge", location: "Cleveland, US", lastSeen: "2026-08-28", current: false },
]

export default function SettingsPage() {
  const { theme, setTheme, colorTheme, setColorTheme } = useTheme()

  const [name, setName] = React.useState("Marcio Marciano")
  const [email, setEmail] = React.useState("m@example.com")
  const [jobTitle, setJobTitle] = React.useState("Operations Lead")
  const [bio, setBio] = React.useState(
    "Runs the plant operations programme across Cleveland and Memphis."
  )
  const [timezone, setTimezone] = React.useState("Europe/Lisbon")
  const [language, setLanguage] = React.useState("English (US)")
  const [density, setDensity] = React.useState<(typeof densities)[number]>(
    "Comfortable"
  )
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [enabled, setEnabled] = React.useState<Record<string, boolean>>({
    tasks: true,
    mentions: true,
    approvals: true,
    incidents: true,
    critical: true,
    walks: false,
    daily: false,
    weekly: true,
  })
  const [twoFactor, setTwoFactor] = React.useState(true)

  const activeNotifications = Object.values(enabled).filter(Boolean).length

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div>
        <h2 className="text-xl font-semibold">Settings</h2>
        <p className="text-sm text-muted-foreground">
          Manage your profile, appearance, notifications and account security.
        </p>
      </div>

      <Tabs defaultValue="profile" className="gap-4">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is how you appear to everyone else in the workspace.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback>
                    {name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Upload photo
                    </Button>
                    <Button size="sm" variant="ghost">
                      Remove
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG or JPG, up to 2 MB.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 @2xl/main:grid-cols-2">
                <Field label="Full name" htmlFor="name">
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </Field>
                <Field label="Email" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </Field>
                <Field label="Job title" htmlFor="job-title">
                  <Input
                    id="job-title"
                    value={jobTitle}
                    onChange={(event) => setJobTitle(event.target.value)}
                  />
                </Field>
                <Field label="Time zone" htmlFor="timezone">
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map((zone) => (
                        <SelectItem key={zone} value={zone}>
                          {zone}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>

              <Field
                label="About"
                htmlFor="bio"
                hint="Shown on your team profile page."
              >
                <Textarea
                  id="bio"
                  rows={3}
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
              </Field>
            </CardContent>
            <CardFooter className="justify-end gap-2 border-t">
              <Button variant="ghost">Cancel</Button>
              <Button onClick={() => toast.success("Profile updated")}>
                Save changes
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Language and region</CardTitle>
              <CardDescription>
                Affects date, number and currency formatting.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 @2xl/main:grid-cols-2">
              <Field label="Language" htmlFor="language">
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Date format" htmlFor="date-format">
                <Select defaultValue="ISO">
                  <SelectTrigger id="date-format" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ISO">2026-09-02</SelectItem>
                    <SelectItem value="EU">02/09/2026</SelectItem>
                    <SelectItem value="US">09/02/2026</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Interface theme</CardTitle>
              <CardDescription>
                Choose how the app looks. System follows your device setting.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 @xl/main:grid-cols-3">
              {modes.map((mode) => (
                <button
                  key={mode.value}
                  type="button"
                  onClick={() => setTheme(mode.value)}
                  className={cn(
                    "flex flex-col gap-3 rounded-xl border p-3 text-left transition-colors hover:bg-muted/50",
                    theme === mode.value && "border-primary ring-2 ring-primary/20"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-20 flex-col justify-end gap-1 rounded-lg border p-2",
                      mode.value === "dark"
                        ? "bg-neutral-900"
                        : mode.value === "light"
                          ? "bg-neutral-50"
                          : "bg-linear-to-r from-neutral-50 to-neutral-900"
                    )}
                  >
                    <span className="h-2 w-3/4 rounded-full bg-neutral-400/60" />
                    <span className="h-2 w-1/2 rounded-full bg-neutral-400/40" />
                  </div>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    {mode.icon}
                    {mode.label}
                    {theme === mode.value && (
                      <CheckIcon className="ml-auto size-4 text-primary" />
                    )}
                  </span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Accent color</CardTitle>
              <CardDescription>
                Drives primary buttons, links and chart series.
              </CardDescription>
              <CardAction>
                <Badge variant="secondary" className="capitalize">
                  {colorTheme}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2 @xl/main:grid-cols-5">
              {COLOR_THEMES.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setColorTheme(option.value)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border p-2 text-left text-sm transition-colors hover:bg-muted/50",
                    colorTheme === option.value &&
                      "border-primary ring-2 ring-primary/20"
                  )}
                >
                  <span
                    className="size-5 shrink-0 rounded-full border"
                    style={{ backgroundColor: option.swatch }}
                  />
                  <span className="truncate">{option.label}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Layout</CardTitle>
              <CardDescription>
                Tune spacing and the default sidebar state.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <Field label="Density" htmlFor="density">
                <Select
                  value={density}
                  onValueChange={(value) =>
                    setDensity(value as (typeof densities)[number])
                  }
                >
                  <SelectTrigger id="density" className="w-56">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {densities.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Separator />
              <ToggleRow
                label="Start with the sidebar collapsed"
                hint="Gives content the full width when you open the app."
                checked={sidebarCollapsed}
                onCheckedChange={setSidebarCollapsed}
              />
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Appearance saved")}>
                Save preferences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                {activeNotifications} of {Object.keys(enabled).length} alerts are
                on.
              </CardDescription>
              <CardAction>
                <BellIcon className="size-4 text-muted-foreground" />
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {notificationGroups.map((group, index) => (
                <div key={group.title} className="flex flex-col gap-4">
                  {index > 0 && <Separator />}
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {group.title}
                  </p>
                  {group.items.map((item) => (
                    <ToggleRow
                      key={item.id}
                      label={item.label}
                      hint={item.hint}
                      checked={enabled[item.id]}
                      onCheckedChange={(checked) =>
                        setEnabled((prev) => ({ ...prev, [item.id]: checked }))
                      }
                    />
                  ))}
                </div>
              ))}
            </CardContent>
            <CardFooter className="justify-end border-t">
              <Button onClick={() => toast.success("Notification settings saved")}>
                Save changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="flex flex-col gap-4">
          <div className="grid gap-4 @4xl/main:grid-cols-[minmax(0,1fr)_320px] @4xl/main:items-start">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                  Last changed 2026-06-14. Use at least 12 characters.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <Field label="Current password" htmlFor="current-password">
                  <Input id="current-password" type="password" autoComplete="current-password" />
                </Field>
                <div className="grid gap-4 @2xl/main:grid-cols-2">
                  <Field label="New password" htmlFor="new-password">
                    <Input id="new-password" type="password" autoComplete="new-password" />
                  </Field>
                  <Field label="Confirm new password" htmlFor="confirm-password">
                    <Input id="confirm-password" type="password" autoComplete="new-password" />
                  </Field>
                </div>
              </CardContent>
              <CardFooter className="justify-end border-t">
                <Button onClick={() => toast.success("Password updated")}>
                  Update password
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ShieldCheckIcon className="size-4 text-success" />
                  Two-factor authentication
                </CardTitle>
                <CardDescription>
                  Require a one-time code from your authenticator app.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <ToggleRow
                  label="Require 2FA"
                  hint={twoFactor ? "Enabled for this account" : "Not enabled"}
                  checked={twoFactor}
                  onCheckedChange={(checked) => {
                    setTwoFactor(checked)
                    toast.success(checked ? "2FA enabled" : "2FA disabled")
                  }}
                />
                <Separator />
                <Button variant="outline" size="sm" className="w-full">
                  <KeyRoundIcon />
                  View recovery codes
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Active sessions</CardTitle>
              <CardDescription>
                Devices currently signed in to your account.
              </CardDescription>
              <CardAction>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success("Signed out of other devices")}
                >
                  <LogOutIcon />
                  Sign out others
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 rounded-xl border p-3"
                >
                  {session.device.startsWith("iPhone") ? (
                    <SmartphoneIcon className="size-4 text-muted-foreground" />
                  ) : (
                    <LaptopIcon className="size-4 text-muted-foreground" />
                  )}
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {session.device}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {session.location} · {session.lastSeen}
                    </span>
                  </div>
                  {session.current ? (
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      This device
                    </Badge>
                  ) : (
                    <Button size="sm" variant="ghost">
                      Revoke
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

function ToggleRow({
  label,
  hint,
  checked,
  onCheckedChange,
}: {
  label: string
  hint: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}
