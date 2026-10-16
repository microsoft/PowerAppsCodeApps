import { cn } from "@/lib/utils"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

/** Page numbers around the current page, with `null` marking an ellipsis gap. */
function pageWindow(page: number, pageCount: number): (number | null)[] {
  if (pageCount <= 7) {
    return Array.from({ length: pageCount }, (_, index) => index + 1)
  }

  const pages = new Set([1, pageCount, page, page - 1, page + 1])
  const visible = [...pages]
    .filter((value) => value >= 1 && value <= pageCount)
    .sort((a, b) => a - b)

  return visible.flatMap((value, index) =>
    index > 0 && value - visible[index - 1] > 1 ? [null, value] : [value]
  )
}

export function DataPagination({
  page,
  pageCount,
  onPageChange,
  className,
}: {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}) {
  if (pageCount <= 1) return null

  const go = (target: number) => (event: React.MouseEvent) => {
    event.preventDefault()
    onPageChange(Math.min(Math.max(target, 1), pageCount))
  }

  return (
    // Overrides the primitive's `mx-auto w-full justify-center`: a full-width
    // nav also squeezes the "Showing x of y" label next to it in the footer.
    <Pagination className={cn("mx-0 ml-auto w-auto justify-end", className)}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={page === 1}
            className={page === 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={go(page - 1)}
          />
        </PaginationItem>

        {pageWindow(page, pageCount).map((value, index) => (
          <PaginationItem key={value ?? `gap-${index}`}>
            {value === null ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink
                href="#"
                isActive={value === page}
                onClick={go(value)}
              >
                {value}
              </PaginationLink>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={page === pageCount}
            className={
              page === pageCount ? "pointer-events-none opacity-50" : undefined
            }
            onClick={go(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}
