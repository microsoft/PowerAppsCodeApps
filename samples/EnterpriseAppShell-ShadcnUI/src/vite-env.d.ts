/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional Mapbox public token. When absent the map falls back to keyless tiles. */
  readonly VITE_MAPBOX_TOKEN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
