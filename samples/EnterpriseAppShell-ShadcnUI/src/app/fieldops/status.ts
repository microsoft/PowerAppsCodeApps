import {
  ArrowUpDownIcon,
  BatteryChargingIcon,
  BuildingIcon,
  CctvIcon,
  ContainerIcon,
  FlameIcon,
  FuelIcon,
  LightbulbIcon,
  MoveVerticalIcon,
  NetworkIcon,
  SnowflakeIcon,
  StethoscopeIcon,
  WavesIcon,
  WindIcon,
  ZapIcon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"

import type { Priority, Trade } from "./data"

export const priorityStyles: Record<Priority, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning",
  Low: "bg-success/10 text-success",
}

/** Marker fill used on the map, keyed by urgency. */
export const priorityMarker: Record<Priority, string> = {
  High: "bg-destructive",
  Medium: "bg-warning",
  Low: "bg-success",
}

export const tradeIcons: Record<Trade, LucideIcon> = {
  HVAC: WindIcon,
  Network: NetworkIcon,
  Electrical: ZapIcon,
  Escalator: ArrowUpDownIcon,
  "Medical Gas": StethoscopeIcon,
  Generator: FuelIcon,
  Lighting: LightbulbIcon,
  Plumbing: WavesIcon,
  Conveyor: ContainerIcon,
  BMS: BuildingIcon,
  Refrigeration: SnowflakeIcon,
  Security: CctvIcon,
  UPS: BatteryChargingIcon,
  Elevator: MoveVerticalIcon,
  "Fire Safety": FlameIcon,
}

/** Route line colours, cycled so neighbouring routes stay distinguishable. */
export const routeColors = [
  "#0d9488",
  "#7c3aed",
  "#2563eb",
  "#e11d48",
  "#ea580c",
  "#0891b2",
]

export function routeColor(index: number) {
  return routeColors[index % routeColors.length]
}
