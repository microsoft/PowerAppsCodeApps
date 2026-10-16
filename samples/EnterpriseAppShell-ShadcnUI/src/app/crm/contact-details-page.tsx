import * as React from "react"
import {
  ArrowLeftIcon,
  BuildingIcon,
  CalendarIcon,
  MailIcon,
  PencilIcon,
  PhoneIcon,
} from "lucide-react"
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

import { dealsByContact, formatCurrency } from "./data"
import { ContactFormSheet } from "./components/contact-form"
import {
  activityTypeStyles,
  contactStatusStyles,
  dealStageStyles,
  initials,
} from "./status"
import { useActivitiesFor, useCompanyName, useContactById } from "./store"

export default function CrmContactDetailsPage() {
  const { contactId } = useParams()
  const contact = useContactById(contactId)
  const companyName = useCompanyName()
  const timeline = useActivitiesFor({ contactId })
  const [formOpen, setFormOpen] = React.useState(false)

  if (!contact) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
        <p className="text-muted-foreground">
          We couldn&apos;t find a contact called “{contactId}”.
        </p>
        <Button asChild variant="outline">
          <Link to="/crm/contacts">Back to contacts</Link>
        </Button>
      </div>
    )
  }

  const contactDeals = dealsByContact(contact.id)
  const openValue = contactDeals.reduce((sum, deal) => sum + deal.value, 0)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <Button asChild variant="ghost" size="sm" className="w-fit -ml-2">
        <Link to="/crm/contacts">
          <ArrowLeftIcon />
          Back to contacts
        </Link>
      </Button>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="text-lg">
                    {initials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <CardTitle className="text-2xl">{contact.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    {contact.title} ·
                    <Link
                      to={`/crm/companies/${contact.companyId}`}
                      className="hover:underline"
                    >
                      {companyName(contact.companyId)}
                    </Link>
                  </CardDescription>
                  <div className="mt-1 flex flex-wrap gap-2">
                    <Badge
                      variant="secondary"
                      className={contactStatusStyles[contact.status]}
                    >
                      {contact.status}
                    </Badge>
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <CardAction className="row-span-2 self-center">
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
            <CardContent className="grid gap-3 sm:grid-cols-3">
              <a
                href={`mailto:${contact.email}`}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-primary/40"
              >
                <MailIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{contact.email}</span>
              </a>
              <a
                href={`tel:${contact.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 rounded-lg border p-3 text-sm hover:border-primary/40"
              >
                <PhoneIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">{contact.phone}</span>
              </a>
              <div className="flex items-center gap-2 rounded-lg border p-3 text-sm">
                <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Last: {contact.lastContact}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deals</CardTitle>
              <CardDescription>
                {contactDeals.length} deals · {formatCurrency(openValue)} total
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {contactDeals.map((deal) => (
                <div
                  key={deal.id}
                  className="flex flex-col gap-2 rounded-lg border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">{deal.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {deal.id} · closes {deal.closeDate}
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
              {contactDeals.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No deals linked to this contact yet.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Most recent touchpoints first</CardDescription>
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
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <DetailRow label="Owner" value={contact.owner} />
              <Separator />
              <DetailRow label="Title" value={contact.title} />
              <Separator />
              <DetailRow label="Status" value={contact.status} />
              <Separator />
              <DetailRow label="Last contact" value={contact.lastContact} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Company</CardTitle>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full justify-start">
                <Link to={`/crm/companies/${contact.companyId}`}>
                  <BuildingIcon />
                  {companyName(contact.companyId)}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ContactFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={contact}
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
