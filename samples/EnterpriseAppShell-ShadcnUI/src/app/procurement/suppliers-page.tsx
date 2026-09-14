import * as React from "react"
import {
  ArrowRightIcon,
  GlobeIcon,
  MapPinIcon,
  PencilIcon,
  PlusIcon,
  TruckIcon,
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
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { formatCurrency, isOpenOrder, orderTotal, type Supplier } from "./data"
import { ratingStyle, supplierStatusStyles } from "./status"
import { useOrders, useSuppliers } from "./store"
import { SupplierFormSheet } from "./components/supplier-form"

const statusFilters = [
  "All",
  "Preferred",
  "Approved",
  "Under review",
  "Suspended",
] as const
const pageSize = 6

export default function ProcurementSuppliersPage() {
  const suppliers = useSuppliers()
  const orders = useOrders()
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] =
    React.useState<(typeof statusFilters)[number]>("All")
  const [page, setPage] = React.useState(1)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<Supplier | undefined>()

  const filtered = suppliers.filter((supplier) => {
    const matchesStatus = status === "All" || supplier.status === status
    const haystack = `${supplier.name} ${supplier.category} ${supplier.location} ${supplier.contactName} ${supplier.buyer}`
    return matchesStatus && haystack.toLowerCase().includes(search.toLowerCase())
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)

  function resetFilters() {
    setQuery("")
    setStatus("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Suppliers</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {suppliers.length} suppliers
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
            placeholder="Search suppliers"
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
          <Button
            size="sm"
            onClick={() => {
              setEditing(undefined)
              setFormOpen(true)
            }}
          >
            <PlusIcon />
            New Supplier
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={TruckIcon}
              title="No suppliers found"
              description="Try a different search term, or widen the status filter."
              action={{ label: "Clear filters", onClick: resetFilters }}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="stagger grid gap-4 @2xl/main:grid-cols-2 @5xl/main:grid-cols-3">
            {paged.map((supplier, index) => {
              const supplierOrders = orders.filter(
                (order) => order.supplierId === supplier.id
              )
              const openValue = supplierOrders
                .filter(isOpenOrder)
                .reduce((sum, order) => sum + orderTotal(order), 0)

              return (
                <Card
                  key={supplier.id}
                  className="flex flex-col"
                  style={{ "--i": index } as React.CSSProperties}
                >
                  <CardHeader>
                    <CardTitle>
                      <Link
                        to={`/procurement/suppliers/${supplier.id}`}
                        className="hover:underline"
                      >
                        {supplier.name}
                      </Link>
                    </CardTitle>
                    <CardDescription>{supplier.category}</CardDescription>
                    <CardAction>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="secondary"
                          className={supplierStatusStyles[supplier.status]}
                        >
                          {supplier.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Edit ${supplier.name}`}
                          onClick={() => {
                            setEditing(supplier)
                            setFormOpen(true)
                          }}
                        >
                          <PencilIcon />
                        </Button>
                      </div>
                    </CardAction>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {supplier.description}
                    </p>

                    <div className="flex flex-col gap-2 text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <MapPinIcon className="size-4" />
                        {supplier.location}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <TruckIcon className="size-4" />
                        {supplierOrders.length} orders · {supplier.paymentTerms}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <GlobeIcon className="size-4" />
                        {supplier.website}
                      </span>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">
                          On-time delivery
                        </span>
                        <span className="font-medium tabular-nums">
                          {supplier.onTimeRate}%
                        </span>
                      </div>
                      <Progress value={supplier.onTimeRate} />
                    </div>

                    <div className="grid grid-cols-2 gap-3 border-t pt-3">
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Annual spend
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {formatCurrency(supplier.annualSpend, true)}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          Open orders
                        </span>
                        <span className="text-sm font-medium tabular-nums">
                          {openValue ? formatCurrency(openValue, true) : "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-between border-t pt-4">
                    <Badge
                      variant="secondary"
                      className={ratingStyle(supplier.rating)}
                    >
                      Score {supplier.rating}
                    </Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/procurement/suppliers/${supplier.id}`}>
                        View supplier
                        <ArrowRightIcon />
                      </Link>
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

      <SupplierFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        supplier={editing}
      />
    </div>
  )
}
