import * as React from "react"
import type { Map as MapLibreMap } from "maplibre-gl"

export const MapContext = React.createContext<MapLibreMap | null>(null)

export function useMapInstance() {
  return React.useContext(MapContext)
}
