import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

/**
 * Skeletons mirror the layout they stand in for — same paddings, same column
 * count — so the swap to real content shifts nothing.
 */

export function TableSkeleton({
  rows = 6,
  columns = 5,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn("animate-fade divide-y", className)} aria-hidden>
      <div className="flex items-center gap-4 px-6 py-3">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} className="flex items-center gap-4 px-6 py-4">
          {Array.from({ length: columns }).map((_, column) => (
            <Skeleton
              key={column}
              className={cn(
                "h-4 flex-1 animate-shimmer",
                column === 0 && "flex-[1.6]"
              )}
              style={{ animationDelay: `${row * 60}ms` }}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

export function CardGridSkeleton({
  count = 6,
  className,
}: {
  count?: number
  className?: string
}) {
  return (
    <div
      className={cn(
        "grid gap-4 @xl/main:grid-cols-2 @4xl/main:grid-cols-3",
        className
      )}
      aria-hidden
    >
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-fade gap-4">
          <CardHeader className="gap-2">
            <Skeleton className="h-4 w-2/3 animate-shimmer" />
            <Skeleton className="h-3 w-1/3 animate-shimmer" />
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Skeleton className="h-3 w-full animate-shimmer" />
            <Skeleton className="h-3 w-5/6 animate-shimmer" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-7 w-24 animate-shimmer rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

export function StatCardsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4" aria-hidden>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="animate-fade gap-3">
          <CardHeader className="gap-2">
            <Skeleton className="h-3 w-24 animate-shimmer" />
            <Skeleton className="h-7 w-20 animate-shimmer" />
          </CardHeader>
          <CardFooter>
            <Skeleton className="h-3 w-32 animate-shimmer" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

/**
 * Route-level fallback. Matches the standard page shell so a lazily loaded
 * screen lands in the space its skeleton was already holding.
 */
export function PageSkeleton() {
  return (
    <div
      className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6"
      role="status"
      aria-label="Loading page"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-6 w-48 animate-shimmer" />
        <Skeleton className="h-4 w-72 animate-shimmer" />
      </div>
      <StatCardsSkeleton />
      <Card className="overflow-hidden">
        <CardContent className="px-0">
          <TableSkeleton />
        </CardContent>
      </Card>
    </div>
  )
}
