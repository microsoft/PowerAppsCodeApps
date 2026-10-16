import * as React from "react"
import { PackageIcon, PencilIcon, PlusIcon } from "lucide-react"
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

import {
  formatCurrency,
  orderTotal,
  supplierName,
  type OrderStatus,
  type PurchaseOrder,
} from "./data"
import { OrderFormSheet } from "./components/order-form"
import { initials, orderStatusStyles } from "./status"
import { useOrders } from "./store"

const statusFilters = [
  "All",
  "Draft",
  "Pending approval",
  "Approved",
  "Shipped",
  "Received",
  "Cancelled",
] as const
const summaryStatuses: OrderStatus[] = [
  "Draft",
  "Pending approval",
  "Approved",
  "Shipped",
  "Received",
  "Cancelled",
]
const pageSize = 8

export default function ProcurementOrdersPage() {
  const orders = useOrders()
  const [query, setQuery] = React.useState("")
  const { value: search, pending: searching } = useDebouncedValue(query)
  const [status, setStatus] =
    React.useState<(typeof statusFilters)[number]>("All")
  const [page, setPage] = React.useState(1)
  const [formOpen, setFormOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<PurchaseOrder | undefined>()

  const filtered = orders.filter((order) => {
    const matchesStatus = status === "All" || order.status === status
    const haystack = `${order.id} ${order.title} ${supplierName(
      order.supplierId
    )} ${order.category} ${order.requester}`
    return matchesStatus && haystack.toLowerCase().includes(search.toLowerCase())
  })

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const start = (currentPage - 1) * pageSize
  const paged = filtered.slice(start, start + pageSize)
  const filteredValue = filtered.reduce(
    (sum, order) => sum + orderTotal(order),
    0
  )

  function resetFilters() {
    setQuery("")
    setStatus("All")
    setPage(1)
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Purchase Orders</h2>
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            {filtered.length} of {orders.length} orders ·{" "}
            {formatCurrency(filteredValue, true)}
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
            placeholder="Search orders"
            className="w-56"
          />
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as (typeof statusFilters)[number])
              setPage(1)
            }}
          >
            <SelectTrigger className="w-40">
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
            New Order
          </Button>
        </div>
      </div>

      <Card>
        {filtered.length === 0 ? (
          <CardContent>
            <EmptyState
              icon={PackageIcon}
              title="No orders found"
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
                    <TableHead className="pl-6">Order</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Requester</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expected</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="pr-6">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paged.map((order) => (
                    <TableRow key={order.id} className="group">
                      <TableCell className="pl-6">
                        <div className="flex flex-col">
                          <Link
                            to={`/procurement/orders/${order.id}`}
                            className="font-medium whitespace-nowrap hover:underline"
                          >
                            {order.title}
                          </Link>
                          <span className="text-xs text-muted-foreground">
                            {order.id}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Link
                          to={`/procurement/suppliers/${order.supplierId}`}
                          className="whitespace-nowrap hover:underline"
                        >
                          {supplierName(order.supplierId)}
                        </Link>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {order.category}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-6">
                            <AvatarFallback className="text-xs">
                              {initials(order.requester)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="whitespace-nowrap">
                            {order.requester}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={orderStatusStyles[order.status]}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {order.expectedDate}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatCurrency(orderTotal(order))}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
                          aria-label={`Edit ${order.title}`}
                          onClick={() => {
                            setEditing(order)
                            setFormOpen(true)
                          }}
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
        {summaryStatuses.map((item) => (
          <Badge
            key={item}
            variant="secondary"
            className={orderStatusStyles[item]}
          >
            {item}: {orders.filter((o) => o.status === item).length}
          </Badge>
        ))}
      </div>

      <OrderFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        order={editing}
      />
    </div>
  )
}
