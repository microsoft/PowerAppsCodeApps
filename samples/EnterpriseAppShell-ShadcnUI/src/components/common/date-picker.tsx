import * as React from "react"
import { format, isValid, parse } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Pick a date",
  /** How the value is stored. Defaults to ISO so it drops into existing state. */
  valueFormat = "yyyy-MM-dd",
  displayFormat = "dd MMM yyyy",
  invalid,
  disabled,
  clearable = true,
  className,
}: {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  valueFormat?: string
  displayFormat?: string
  invalid?: boolean
  disabled?: boolean
  clearable?: boolean
  className?: string
}) {
  const [open, setOpen] = React.useState(false)

  const parsed = value ? parse(value, valueFormat, new Date()) : undefined
  const selected = parsed && isValid(parsed) ? parsed : undefined

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          aria-invalid={invalid}
          data-empty={!selected}
          className={cn(
            "w-full justify-start px-3 font-normal data-[empty=true]:text-muted-foreground",
            className,
          )}
        >
          <CalendarIcon className="text-muted-foreground" />
          {selected ? format(selected, displayFormat) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          autoFocus
          selected={selected}
          defaultMonth={selected}
          onSelect={(date) => {
            onChange(date ? format(date, valueFormat) : "")
            setOpen(false)
          }}
        />
        {clearable && (
          <div className="flex justify-end border-t p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("")
                setOpen(false)
              }}
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
