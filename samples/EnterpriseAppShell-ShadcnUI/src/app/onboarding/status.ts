import type { ComponentType } from "react"
import {
  BookOpenIcon,
  CalendarClockIcon,
  CircleCheckIcon,
  ListChecksIcon,
  PlayCircleIcon,
  ScaleIcon,
  SettingsIcon,
} from "lucide-react"

import type {
  ContentType,
  HireStatus,
  LearningModule,
  ProvisionStepState,
  StageId,
} from "./data"

export const contentTypeStyles: Record<ContentType, string> = {
  Video: "bg-chart-1/15 text-chart-1",
  Reading: "bg-chart-2/15 text-chart-2",
  Policy: "bg-chart-3/15 text-chart-3",
  Quiz: "bg-chart-4/15 text-chart-4",
  Meeting: "bg-chart-5/15 text-chart-5",
  Task: "bg-primary/10 text-primary",
  Setup: "bg-muted text-muted-foreground",
}

export const contentTypeIcons: Record<
  ContentType,
  ComponentType<{ className?: string }>
> = {
  Video: PlayCircleIcon,
  Reading: BookOpenIcon,
  Policy: ScaleIcon,
  Quiz: ListChecksIcon,
  Meeting: CalendarClockIcon,
  Task: CircleCheckIcon,
  Setup: SettingsIcon,
}

export const hireStatusStyles: Record<HireStatus, string> = {
  "Pre-boarding": "bg-chart-1/15 text-chart-1",
  "In progress": "bg-chart-2/15 text-chart-2",
  "At risk": "bg-destructive/10 text-destructive",
  Complete: "bg-success/10 text-success",
}

export const hireStatusDots: Record<HireStatus, string> = {
  "Pre-boarding": "bg-chart-1",
  "In progress": "bg-chart-2",
  "At risk": "bg-destructive",
  Complete: "bg-success",
}

export const provisionStateStyles: Record<ProvisionStepState, string> = {
  done: "bg-success/10 text-success",
  failed: "bg-destructive/10 text-destructive",
  skipped: "bg-warning/10 text-warning",
  pending: "bg-muted text-muted-foreground",
}

export const provisionStateLabels: Record<ProvisionStepState, string> = {
  done: "Done",
  failed: "Failed",
  skipped: "Skipped",
  pending: "Waiting",
}

export const levelStyles: Record<LearningModule["level"], string> = {
  Foundation: "bg-chart-2/15 text-chart-2",
  Intermediate: "bg-chart-4/15 text-chart-4",
  Advanced: "bg-chart-5/15 text-chart-5",
}

export const accentGradients: Record<LearningModule["accent"], string> = {
  1: "from-chart-1/30 via-chart-1/10 to-transparent",
  2: "from-chart-2/30 via-chart-2/10 to-transparent",
  3: "from-chart-3/30 via-chart-3/10 to-transparent",
  4: "from-chart-4/30 via-chart-4/10 to-transparent",
  5: "from-chart-5/30 via-chart-5/10 to-transparent",
}

export const stageAccents: Record<StageId, string> = {
  pre: "bg-chart-1",
  day1: "bg-chart-2",
  week1: "bg-chart-3",
  month1: "bg-chart-4",
  quarter: "bg-chart-5",
}
