import * as React from "react"
import {
  ArrowRightIcon,
  Building2Icon,
  GlobeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router"

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

import { CompanyFormSheet } from "./components/company-form"
import {
  dealsByCompany,
  formatCurrency,
  isOpen,
  type Company,
} from "./data"
import { companyStatusStyles } from "./status"
import { useCompanies, useContactsFor } from "./store"

const statusFilters = ["All", "Customer", "Prospect", "Churned"] as const
const pageSize = 6

export default function CrmCompaniesPage() {
  const companies = useCompanies()
  const contactsByCompany = useContactsFor()
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] =
    React.useState<(typeof statusFilters)[number]>("All")
  const [page, setPage] = React.useState(1)
  const [editing, setEditing] = React.useState<Company | undefined>(undefined)
  const [formOpen, setFormOpen] = React.useState(false)

  function openCreate() {
    setEditing(undefined)
    setFormOpen(true)
  }

  function openEdit(company: Company) {
    setEditing(company)
    setFormOpen(true)
  }

  function resetFilters() {
    setQuery("")
    setStatus("All")
    setPage(1)
  }

  const filtered = companies.filter((company) => {
    const matchesStatus = status === "All" || company.status === status
    const haystack = `${company.name} ${company.industry} ${company.location} ${company.owner}`
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
          <h2 className="text-xl font-semibold">Companies</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {companies.length} accounts
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
            placeholder="Search companies"
            className="w-56"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as (typeof statusFilters)[number])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-36">
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
            New Company
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={Building2Icon}
              title="No companies found"
              description="Try a different search term, or widen the status filter."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="stagger grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {paged.map((company, index) => {
              const openDeals = dealsByCompany(company.id).filter(isOpen)
              const openValue = openDeals.reduce((sum, d) => sum + d.value, 0)

              return (
                <Card
                  key={company.id}
                  className="flex flex-col"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <CardHeader>
                    <CardTitle>
                      <Link
                        to={`/crm/companies/${company.id}`}
                        className="hover:underline"
                      >
                        {company.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{company.industry}</CardDescription>
                    <CardAction>
                      <Badge
                        variant="secondary"
                        className={companyStatusStyles[company.status]}
                      >
                        {company.status}
                      </Badge>
                    </CardAction>                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {company.description}
                    </p>
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <MapPinIcon className="size-3.5" />
                        {company.location}
                      </span>
                      <span className="flex items-center gap-2">
                        <UsersIcon className="size-3.5" />
                        {company.employees} employees ·{" "}
                        {contactsByCompany(company.id).length} contacts
                      </span>
                      <span className="flex items-center gap-2">
                        <GlobeIcon className="size-3.5" />
                        {company.website}
                      </span>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-2 border-t pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Annual value
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {company.annualValue
                            ? formatCurrency(company.annualValue, true)
                            : "—"}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Open pipeline
                        </span>
                        <span className="text-sm font-semibold tabular-nums">
                          {openValue ? formatCurrency(openValue, true) : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="gap-2">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Link to={`/crm/companies/${company.id}`}>
                        View account
                        <ArrowRightIcon />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Edit ${company.name}`}
                      onClick={() => openEdit(company)}
                    >
                      <PencilIcon />
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {start + 1}–{start + paged.length} of {filtered.length}
            </p>
            <DataPagination
              page={currentPage}
              pageCount={pageCount}
              onPageChange={setPage}
            />
          </div>
        </>
      )}

      <CompanyFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        company={editing}
      />
    </div>
  )
}
