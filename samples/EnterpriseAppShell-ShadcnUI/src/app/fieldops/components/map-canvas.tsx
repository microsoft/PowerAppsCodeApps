import * as React from "react"
import { createPortal } from "react-dom"
import * as maplibregl from "maplibre-gl"
import type {
  GeoJSONSource,
  LngLatBoundsLike,
  Map as MapLibreMap,
  PositionAnchor,
  StyleSpecification,
} from "maplibre-gl"
import type { FeatureCollection } from "geojson"

import "maplibre-gl/dist/maplibre-gl.css"

import { useDarkMode } from "./use-dark-mode"
import { MapContext, useMapInstance } from "./map-context"
import { cn } from "@/lib/utils"

export type LngLat = [number, number]

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

function rasterStyle(
  tiles: string[],
  tileSize: number,
  attribution: string,
  dark: boolean,
): StyleSpecification {
  return {
    version: 8,
    sources: {
      basemap: { type: "raster", tiles, tileSize, maxzoom: 19, attribution },
    },
    layers: [
      {
        id: "basemap",
        type: "raster",
        source: "basemap",
        // Dark basemaps sit almost at pure black, which reads as an empty
        // canvas next to the app chrome; lift the shadows so streets show.
        paint: dark
          ? {
              "raster-brightness-min": 0.16,
              "raster-contrast": -0.08,
              "raster-saturation": -0.2,
            }
          : {},
      },
    ],
  }
}

/**
 * Raster basemaps only: they need no web worker, so they render in locked-down
 * webviews where vector tiles silently stall. Keyless CARTO tiles by default;
 * drop a public `pk.*` token into `VITE_MAPBOX_TOKEN` to serve Mapbox instead.
 */
function styleFor(dark: boolean): StyleSpecification {
  if (!MAPBOX_TOKEN) {
    const theme = dark ? "dark_matter" : "voyager"
    return rasterStyle(
      ["a", "b", "c", "d"].map(
        (sub) =>
          `https://${sub}.basemaps.cartocdn.com/rastertiles/${theme}/{z}/{x}/{y}@2x.png`,
      ),
      256,
      '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors \u00a9 <a href="https://carto.com/attributions">CARTO</a>',
      dark,
    )
  }

  const theme = dark ? "dark-v11" : "streets-v12"
  return rasterStyle(
    [
      `https://api.mapbox.com/styles/v1/mapbox/${theme}/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
    ],
    512,
    '\u00a9 <a href="https://www.mapbox.com/about/maps/">Mapbox</a> \u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    dark,
  )
}

export function MapCanvas({
  center,
  zoom = 10.5,
  className,
  children,
}: {
  center: LngLat
  zoom?: number
  className?: string
  children?: React.ReactNode
}) {
  const container = React.useRef<HTMLDivElement>(null)
  const [map, setMap] = React.useState<MapLibreMap | null>(null)
  const dark = useDarkMode()

  // Initial view and theme are only read once, at construction time.
  const initial = React.useRef({ center, zoom, dark })
  React.useEffect(() => {
    initial.current = { center, zoom, dark }
  })

  React.useEffect(() => {
    const node = container.current
    if (!node) return

    const instance = new maplibregl.Map({
      container: node,
      style: styleFor(initial.current.dark),
      center: initial.current.center,
      zoom: initial.current.zoom,
      attributionControl: { compact: true },
    })
    instance.addControl(new maplibregl.NavigationControl(), "top-left")
    instance.on("error", (event) => {
      console.error("[map]", event.error?.message ?? event)
    })

    // Publish as soon as the style is parsed rather than waiting for `load`,
    // which never fires if a tile request stalls. Markers and layers only need
    // a parsed style.
    const publish = () => {
      if (instance.isStyleLoaded()) setMap((current) => current ?? instance)
    }
    instance.on("styledata", publish)
    instance.on("load", publish)

    const observer = new ResizeObserver(() => instance.resize())
    observer.observe(node)

    return () => {
      observer.disconnect()
      setMap(null)
      instance.remove()
    }
  }, [])

  React.useEffect(() => {
    if (!map) return
    map.setStyle(styleFor(dark))
  }, [map, dark])

  return (
    <div className={cn("relative isolate overflow-hidden bg-muted", className)}>
      {/* maplibre-gl.css forces position:relative on .maplibregl-map, so size
          the container with height rather than absolute insets. */}
      <div ref={container} className="size-full" />
      {map && <MapContext.Provider value={map}>{children}</MapContext.Provider>}
    </div>
  )
}

export function MapMarker({
  lng,
  lat,
  anchor = "center",
  offsetY = 0,
  className,
  children,
  onClick,
}: {
  lng: number
  lat: number
  anchor?: PositionAnchor
  offsetY?: number
  className?: string
  children: React.ReactNode
  onClick?: () => void
}) {
  const map = useMapInstance()
  const [element] = React.useState(() => document.createElement("div"))

  React.useEffect(() => {
    if (!map) return
    const marker = new maplibregl.Marker({
      element,
      anchor,
      offset: [0, offsetY],
    })
      .setLngLat([lng, lat])
      .addTo(map)
    return () => {
      marker.remove()
    }
  }, [map, element, lng, lat, anchor, offsetY])

  return createPortal(
    <div className={className} onClick={onClick}>
      {children}
    </div>,
    element
  )
}

export type MapRoute = {
  id: string
  color: string
  from: LngLat
  to: LngLat
}

/** Gentle bezier arc so overlapping technician routes stay tellable apart. */
function arc(from: LngLat, to: LngLat, steps = 48): LngLat[] {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const control: LngLat = [
    (from[0] + to[0]) / 2 - dy * 0.14,
    (from[1] + to[1]) / 2 + dx * 0.14,
  ]

  return Array.from({ length: steps + 1 }, (_, index) => {
    const t = index / steps
    const inv = 1 - t
    return [
      inv * inv * from[0] + 2 * inv * t * control[0] + t * t * to[0],
      inv * inv * from[1] + 2 * inv * t * control[1] + t * t * to[1],
    ] as LngLat
  })
}

const ROUTES_ID = "map-canvas-routes"

export function MapRoutes({ routes }: { routes: MapRoute[] }) {
  const map = useMapInstance()

  React.useEffect(() => {
    if (!map) return

    const data: FeatureCollection = {
      type: "FeatureCollection",
      features: routes.map((route) => ({
        type: "Feature",
        properties: { color: route.color },
        geometry: { type: "LineString", coordinates: arc(route.from, route.to) },
      })),
    }

    function apply() {
      if (!map) return
      const source = map.getSource(ROUTES_ID) as GeoJSONSource | undefined
      if (source) {
        source.setData(data)
        return
      }
      map.addSource(ROUTES_ID, { type: "geojson", data })
      map.addLayer({
        id: ROUTES_ID,
        type: "line",
        source: ROUTES_ID,
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": ["get", "color"],
          "line-width": 3,
          "line-opacity": 0.9,
        },
      })
    }

    apply()
    // setStyle() wipes custom layers, so re-add them whenever the theme flips.
    map.on("styledata", apply)

    return () => {
      map.off("styledata", apply)
    }
  }, [map, routes])

  return null
}

export function FitBounds({
  points,
  padding = 64,
  maxZoom = 14,
}: {
  points: LngLat[]
  padding?: number
  maxZoom?: number
}) {
  const map = useMapInstance()

  React.useEffect(() => {
    if (!map || points.length === 0) return
    const instance = map
    const bounds = points.reduce(
      (acc, point) => acc.extend(point),
      new maplibregl.LngLatBounds(points[0], points[0])
    ) as LngLatBoundsLike

    // Fitting against a container that has not been measured yet — or one
    // smaller than its own padding — lands on a viewport that no longer holds
    // the points, so refit whenever the box changes until the user takes over.
    // `resize` rather than a ResizeObserver: it fires once the map has already
    // taken the new dimensions, so the fit is computed against them.
    const node = instance.getContainer()
    let owned = true
    let fitted = false

    function fit() {
      if (
        !owned ||
        node.clientWidth < 2 * padding + 32 ||
        node.clientHeight < 2 * padding + 32
      ) {
        return
      }
      instance.fitBounds(bounds, { padding, maxZoom, duration: fitted ? 0 : 700 })
      fitted = true
    }

    // A pan or zoom by hand means the view is no longer ours to reset.
    function release(event: { originalEvent?: unknown }) {
      if (event.originalEvent) owned = false
    }

    instance.on("movestart", release)
    instance.on("resize", fit)
    fit()

    return () => {
      instance.off("movestart", release)
      instance.off("resize", fit)
    }
  }, [map, points, padding, maxZoom])

  return null
}

export function FlyTo({ center, zoom }: { center: LngLat; zoom?: number }) {
  const map = useMapInstance()
  const [lng, lat] = center

  React.useEffect(() => {
    if (!map) return
    map.flyTo({ center: [lng, lat], zoom, duration: 900, essential: true })
  }, [map, lng, lat, zoom])

  return null
}
