import * as React from "react"
import { ArrowLeftIcon, GlobeIcon, MapPinIcon, PencilIcon, UsersIcon } from "lucide-react"
import { Link, useParams } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

import { CompanyFormSheet } from "./components/company-form"
import { dealsByCompany, formatCurrency, isOpen } from "./data"
import {
  activityTypeStyles,
  companyStatusStyles,
  contactStatusStyles,
  dealStageStyles,
  initials,
} from "./status"
import { useActivitiesFor, useCompanyById, useContactsFor } from "./store"

export default function CrmCompanyDetailsPage() {
  const { companyId } = useParams()
  const company = useCompanyById(companyId)
  const contactsByCompany = useContactsFor()
  const timeline = useActivitiesFor({ companyId })
  const [formOpen, setFormOpen] = React.useState(false)

  if (!company) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">
          We couldn&apos;t find a company called “{companyId}”.
        </p>
        <Button asChild variant="outline">
          <Link to="/crm/companies">Back to companies</Link>
        </Button>
      </div>
    )
  }

  const people = contactsByCompany(company.id)
  const companyDeals = dealsByCompany(company.id)
  const openDeals = companyDeals.filter(isOpen)
  const openValue = openDeals.reduce((sum, deal) => sum + deal.value, 0)
  const wonValue = companyDeals
    .filter((deal) => deal.stage === "Closed Won")
    .reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link to="/crm/companies">
          <ArrowLeftIcon />
          Back to companies
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardDescription className="flex flex-wrap items-center gap-2">
                <span>{company.industry}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <MapPinIcon className="size-3.5" />
                  {company.location}
                </span>
              </CardDescription>
              <CardTitle className="text-2xl">{company.name}</CardTitle>
              <div className="mt-1 flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className={companyStatusStyles[company.status]}
                >
                  {company.status}
                </Badge>
                <Badge variant="outline">{company.employees} employees</Badge>
                <Badge variant="outline">{people.length} contacts</Badge>
                <Badge variant="outline">{openDeals.length} open deals</Badge>
              </div>
              <CardAction className="row-span-3 self-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setFormOpen(true)}
                >
                  <PencilIcon />
                  Edit
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <p className="text-sm text-muted-foreground">
                {company.description}
              </p>
              <a
                href={`https://${company.website}`}
                target="_blank"
                rel="noreferrer"
                className="flex w-fit items-center gap-2 text-sm hover:underline"
              >
                <GlobeIcon className="size-4 text-muted-foreground" />
                {company.website}
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
              <CardDescription>
                {formatCurrency(openValue)} open · {formatCurrency(wonValue)} won
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {companyDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col gap-2 rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{deal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {deal.id} · {deal.owner} · closes {deal.closeDate}
                      </span>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-sm tabular-nums">
                        {formatCurrency(deal.value)}
                      </span>
                      <Badge
                        variant="secondary"
                        className={dealStageStyles[deal.stage]}
                      >
                        {deal.stage}
                      </Badge>
                    </div>
                  </div>
                  <Progress value={deal.probability} />
                </div>
              ))}
              {companyDeals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No deals for this account yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Across every contact at {company.name}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              {timeline.map((activity) => (
                <div key={activity.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1.5 size-2 rounded-full bg-primary" />
                    <span className="w-px flex-1 bg-border" />
                  </div>
                  <div className="flex flex-1 flex-col gap-1 pb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="secondary"
                        className={activityTypeStyles[activity.type]}
                      >
                        {activity.type}
                      </Badge>
                      <span className="text-sm font-medium">
                        {activity.subject}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {activity.date} · {activity.time} · {activity.owner}
                    </span>
                  </div>
                </div>
              ))}
              {timeline.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No activity logged yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Account value</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <DetailRow
                label="Annual value"
                value={
                  company.annualValue
                    ? formatCurrency(company.annualValue)
                    : "—"
                }
              />
              <Separator />
              <DetailRow label="Open pipeline" value={formatCurrency(openValue)} />
              <Separator />
              <DetailRow label="Closed won" value={formatCurrency(wonValue)} />
              <Separator />
              <DetailRow label="Customer since" value={company.customerSince} />
              <Separator />
              <DetailRow label="Account owner" value={company.owner} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UsersIcon className="size-4" />
                Contacts
              </CardTitle>
              <CardDescription>{people.length} people</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {people.map((person) => (
                <Link
                  key={person.id}
                  to={`/crm/contacts/${person.id}`}
                  className="flex items-center gap-3 rounded-lg border p-2.5 transition-colors hover:border-primary/40"
                >
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs">
                      {initials(person.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">
                      {person.name}
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      {person.title}
                    </span>
                  </div>
                  <Badge
                    variant="secondary"
                    className={contactStatusStyles[person.status]}
                  >
                    {person.status}
                  </Badge>
                </Link>
              ))}
              {people.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No contacts recorded yet.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <CompanyFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        company={company}
      />
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
