import * as React from "react"
import { PencilIcon, PlusIcon, UsersIcon } from "lucide-react"
import { Link } from "react-router"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { DataPagination } from "@/components/common/data-pagination"
import { EmptyState } from "@/components/common/empty-state"
import { SearchInput } from "@/components/common/search-input"
import { useDebouncedValue } from "@/hooks/use-debounced-value"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ContactFormSheet } from "./components/contact-form"
import { type Contact, type ContactStatus } from "./data"
import { contactStatusStyles, initials } from "./status"
import { useCompanyName, useContacts } from "./store"

const statusFilters = ["All", "Active", "New", "Cold"] as const
const pageSize = 8

export default function CrmContactsPage() {
  const contacts = useContacts()
  const companyName = useCompanyName()
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] =
    React.useState<(typeof statusFilters)[number]>("All")
  const [page, setPage] = React.useState(1)
  const [editing, setEditing] = React.useState<Contact | undefined>(undefined)
  const [formOpen, setFormOpen] = React.useState(false)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(contact: Contact) {
    setEditing(contact)
    setFormOpen(true)
  }

  function resetFilters() {
    setQuery("")
    setStatus("All")
    setPage(1)
  }

  const filtered = contacts.filter((contact) => {
    const matchesStatus = status === "All" || contact.status === status
    const haystack = `${contact.name} ${contact.title} ${companyName(
      contact.companyId
    )} ${contact.email} ${contact.owner}`
    return matchesStatus && haystack.toLowerCase().includes(search.toLowerCase())
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Contacts</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {contacts.length} contacts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <SearchInput
            value={query}
            onValueChange={(value) => {
              setQuery(value)
              setPage(1)
            }}
            busy={searching}
            placeholder="Search contacts"
            className="w-56"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as (typeof statusFilters)[number])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusFilters.map((item) => (
                <SelectItem key={item} value={item}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={openCreate}>
            <PlusIcon />
            New Contact
          </Button>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={UsersIcon}
              title="No contacts found"
              description="Try a different search term, or widen the status filter."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        ) : (
          <>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last contact</TableHead>
                    <TableHead className="pr-6 text-right">Edit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((contact) => (
                    <TableRow key={contact.id} className="group">
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback className="text-xs">
                              {initials(contact.name)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            to={`/crm/contacts/${contact.id}`}
                            className="font-medium whitespace-nowrap hover:underline"
                          >
                            {contact.name}
                          </Link>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.title}
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/crm/companies/${contact.companyId}`}
                          className="whitespace-nowrap hover:underline"
                        >
                          {companyName(contact.companyId)}
                        </Link>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {contact.email}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {contact.owner}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={contactStatusStyles[contact.status]}
                        >
                          {contact.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {contact.lastContact}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                          aria-label={`Edit ${contact.name}`}
                          onClick={() => openEdit(contact)}
                        >
                          <PencilIcon />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex-col gap-3 border-t pt-4 sm:flex-row sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {start + 1}–{start + paged.length} of {filtered.length}
              </p>
              <DataPagination
                page={currentPage}
                pageCount={pageCount}
                onPageChange={setPage}
              />
            </CardFooter>
          </>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        {(["Active", "New", "Cold"] as ContactStatus[]).map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className={contactStatusStyles[item]}
          >
            {item}: {contacts.filter((c) => c.status === item).length}
          </Badge>
        ))}
      </div>

      <ContactFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        contact={editing}
      />
    </div>
  )
}
