/**
 * Thin wrapper around the auto-generated MicrosoftDataverseService.
 *
 * The Dataverse *connector* (shared_commondataserviceforapps) differs from native
 * Dataverse: it generates a single untyped service whose operations require an
 * `organization` (the Dataverse org URL) plus explicit prefer/accept headers.
 *
 * This module centralizes that boilerplate so hooks/components can call simple
 * list/get/create/update/delete methods and work with plain row objects.
 */
import { getContext } from '@microsoft/power-apps/app'
import { MicrosoftDataverseService } from '../generated'

const PREFER = 'return=representation'
// Reads ask Dataverse to include annotations so lookup display names come back as
// `_<field>_value@OData.Community.Display.V1.FormattedValue`.
const READ_PREFER = 'odata.include-annotations="*"'
const ACCEPT = 'application/json'

/** A Dataverse row is a flat object of column name -> value (plus @odata.* annotations). */
export type DataverseRow = Record<string, unknown>

export interface ListOptions {
  select?: string[]
  filter?: string
  orderBy?: string[]
  top?: number
  expand?: string
  /** A FetchXML query string (advanced querying). When set, other options are ignored by Dataverse. */
  fetchXml?: string
}

let cachedOrgUrl: string | undefined

/** Resolves and caches the Dataverse org URL from the Power SDK context. */
async function getOrgUrl(): Promise<string> {
  if (cachedOrgUrl) return cachedOrgUrl
  const ctx = await getContext()
  const orgUrl = ctx.app.dataverseOrgUrl
  if (!orgUrl) {
    throw new Error(
      'Dataverse org URL is not available from the Power Platform context (context.app.dataverseOrgUrl is undefined).',
    )
  }
  cachedOrgUrl = orgUrl
  return orgUrl
}

/** Unwraps the connector result envelope, throwing a readable error on failure. */
function unwrap<T>(result: { success?: boolean; data?: T; error?: { message?: string } }): T {
  if (result.success === false) {
    let message = result.error?.message ?? 'Unknown Dataverse connector error'
    // The connector often returns a JSON string in error.message; surface the inner message.
    try {
      const parsed = JSON.parse(message) as { Message?: string }
      if (parsed.Message) message = parsed.Message
    } catch {
      // not JSON — use as-is
    }
    throw new Error(message)
  }
  return result.data as T
}

/**
 * List rows from a Dataverse table via the connector.
 * @param entityName plural entity set name, e.g. "accounts" or "contacts"
 */
export async function listRows(entityName: string, options: ListOptions = {}): Promise<DataverseRow[]> {
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.ListRecordsWithOrganization(
    org,
    entityName,
    READ_PREFER,
    ACCEPT,
    undefined, // x-ms-odata-metadata-full
    undefined, // MSCRM.IncludeMipSensitivityLabel
    options.select?.join(','),
    options.filter,
    options.orderBy?.join(','),
    options.expand,
    options.fetchXml,
    options.top,
  )
  const data = unwrap<{ value?: DataverseRow[] }>(result)
  return data.value ?? []
}

/** Get a single row by its primary-key GUID. */
export async function getRow(
  entityName: string,
  recordId: string,
  select?: string[],
): Promise<DataverseRow> {
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.GetItemWithOrganization(
    READ_PREFER,
    ACCEPT,
    org,
    entityName,
    recordId,
    undefined,
    undefined,
    select?.join(','),
  )
  return unwrap<DataverseRow>(result)
}

/** Create a new row. Returns after the connector confirms creation. */
export async function createRow(entityName: string, item: DataverseRow): Promise<void> {
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.CreateRecordWithOrganization(
    PREFER,
    ACCEPT,
    org,
    entityName,
    item,
  )
  unwrap<void>(result)
}

/** Update an existing row (upsert semantics). */
export async function updateRow(
  entityName: string,
  recordId: string,
  item: DataverseRow,
): Promise<DataverseRow> {
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.UpdateRecordWithOrganization(
    PREFER,
    ACCEPT,
    org,
    entityName,
    recordId,
    item,
  )
  return unwrap<DataverseRow>(result)
}

/** Delete a row by its primary-key GUID. */
export async function deleteRow(entityName: string, recordId: string): Promise<void> {
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.DeleteRecordWithOrganization(org, entityName, recordId)
  unwrap<void>(result)
}

/**
 * Invoke an unbound (global) Dataverse action via the connector, e.g. a custom action.
 * Maps to PerformUnboundActionWithOrganization (POST). Note: this endpoint invokes Dataverse
 * *actions*, not *functions* (functions like WhoAmI are GET-only and aren't exposed by the
 * connector's unbound-action operation).
 */
export async function performUnboundAction(
  actionName: string,
  item?: DataverseRow,
): Promise<DataverseRow> {
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.PerformUnboundActionWithOrganization(
    org,
    actionName,
    item,
  )
  return unwrap<DataverseRow>(result)
}

/** A Dataverse table (entity) as returned by the connector's metadata operation. */
export interface EntityInfo {
  metadataId: string
  logicalName: string
  entitySetName: string
  displayName: string
}

type GetEntitiesResult = {
  success?: boolean;
  data?: unknown;
  error?: { message?: string };
};

type DataverseServiceWithEntityMetadata = typeof MicrosoftDataverseService & {
  GetEntitiesWithOrganization?: (organization: string) => Promise<GetEntitiesResult>;
};

/**
 * List all tables (entities) in the environment via the connector's `GetEntities` metadata
 * operation when it is exposed by the current connector metadata.
 */
export async function listEntities(): Promise<EntityInfo[]> {
  const org = await getOrgUrl()
  const getEntities = (MicrosoftDataverseService as DataverseServiceWithEntityMetadata)
    .GetEntitiesWithOrganization
  if (!getEntities) {
    throw new Error(
      'The current Microsoft Dataverse connector metadata does not expose GetEntities.',
    )
  }
  const result = await getEntities(org)
  // The generated model types these fields in PascalCase, but the connector returns camelCase
  // at runtime, so we read the payload as an untyped record.
  const data = unwrap<unknown>(result) as {
    value?: Array<{
      metadataId?: string
      logicalName?: string
      entitySetName?: string
      displayCollectionName?: { userLocalizedLabel?: { label?: string } }
    }>
  }
  return (data.value ?? []).map((e) => ({
    metadataId: e.metadataId ?? '',
    logicalName: e.logicalName ?? '',
    entitySetName: e.entitySetName ?? '',
    displayName: e.displayCollectionName?.userLocalizedLabel?.label ?? e.logicalName ?? '',
  }))
}

// ---------------------------------------------------------------------------
// File / image column operations
// ---------------------------------------------------------------------------

/** Strips the "data:<mime>;base64," prefix from a data URL, returning raw base64. */
function stripDataUrlPrefix(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
}

/** Reads a File/Blob as a base64 string (no data-URL prefix). */
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(stripDataUrlPrefix(String(reader.result)))
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/** Converts raw bytes (Uint8Array/ArrayBuffer) to a base64 string. */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

/**
 * Upload a file or image to a Dataverse file/image column.
 * @param columnName e.g. "entityimage" (image) or a custom file column logical name
 */
export async function uploadFileImage(
  entityName: string,
  recordId: string,
  columnName: string,
  file: File,
  fileName?: string,
): Promise<void> {
  const org = await getOrgUrl()
  const base64 = await fileToBase64(file)
  // NOTE: The SDK forces `Content-Type: application/octet-stream` for binary bodies. If we also
  // pass our own `content-type` header, the gateway merges both (e.g. "image/png,
  // application/octet-stream") and Dataverse rejects it ("more than one media type"). The executor
  // skips header params whose value is `undefined`, so we intentionally omit content-type here.
  const result = await MicrosoftDataverseService.UpdateEntityFileImageFieldContentWithOrganization(
    undefined as unknown as string, // content-type — omitted on purpose (see note above)
    org,
    entityName,
    recordId,
    columnName,
    base64,
    fileName ?? file.name,
  )
  unwrap<void>(result)
}

/**
 * Download an image from a Dataverse image column (e.g. `entityimage`).
 * Returns the image content as a base64 string (empty string if none).
 *
 * @param fullSize true = full-size image (served as bytes by the file-content endpoint when
 *   full-image storage is enabled), false = the small inline thumbnail read from the record.
 */
export async function downloadFileImage(
  entityName: string,
  recordId: string,
  columnName: string,
  fullSize = true,
): Promise<string> {
  // Thumbnail: read the inline base64 directly off the record (always ~144px).
  if (!fullSize) {
    const row = await getRow(entityName, recordId, [columnName])
    const inline = row[columnName]
    return typeof inline === 'string' ? inline : ''
  }

  // Full size: the full image lives in blob storage, served by the file-content endpoint.
  const org = await getOrgUrl()
  const result = await MicrosoftDataverseService.GetEntityFileImageFieldContentWithOrganization(
    '', // Range — empty = full content
    org,
    entityName,
    recordId,
    columnName,
    'full',
  )
  const data = unwrap<unknown>(result)
  if (data instanceof Uint8Array && data.length > 0) {
    return bytesToBase64(data)
  }
  if (data instanceof ArrayBuffer && data.byteLength > 0) {
    return bytesToBase64(new Uint8Array(data))
  }
  if (typeof data === 'string' && data.length > 0) {
    return data
  }
  // Fall back to the inline thumbnail if the full image isn't available through the connector
  // (full-size image storage may be disabled on the column).
  const row = await getRow(entityName, recordId, [columnName])
  const inline = row[columnName]
  return typeof inline === 'string' ? inline : ''
}

/**
 * Clears a file/image column.
 *
 * IMAGE columns (e.g. `entityimage`) clear when PATCHed to null. FILE columns do NOT: Dataverse
 * ignores `null` in a PATCH for file columns and the Dataverse connector does not expose a DELETE
 * operation for file fields (only PUT upload and GET download). So for file columns this attempts
 * the null-PATCH and then reports whether the content was actually removed.
 *
 * @returns `true` if the column is now empty, `false` if the connector could not clear it.
 */
export async function deleteFileImage(
  entityName: string,
  recordId: string,
  columnName: string,
): Promise<boolean> {
  await updateRow(entityName, recordId, { [columnName]: null })
  // Verify server-side: file columns may ignore the null-PATCH.
  try {
    const row = await getRow(entityName, recordId, [columnName])
    return !row[columnName]
  } catch {
    // If we can't verify, assume it worked (image columns clear reliably).
    return true
  }
}

export interface DownloadedFile {
  /** File content as a Blob, ready to save (empty Blob if the column has no content). */
  blob: Blob
  /** The stored file name reported by the connector. */
  fileName: string
  /** Size of the file content in bytes. */
  size: number
}

/**
 * Download a true file column's content via the connector's file-content endpoint.
 * The connector returns the content as raw bytes (Uint8Array) with the stored file name
 * on the result envelope (result.fileName).
 */
export async function downloadFile(
  entityName: string,
  recordId: string,
  columnName: string,
): Promise<DownloadedFile> {
  const org = await getOrgUrl()
  const result = (await MicrosoftDataverseService.GetEntityFileImageFieldContentWithOrganization(
    '', // Range — empty = full content
    org,
    entityName,
    recordId,
    columnName,
  )) as { success?: boolean; data?: unknown; fileName?: string; error?: { message?: string } }

  const data = unwrap<unknown>(result)

  // The connector returns file bytes as a Uint8Array (or ArrayBuffer). Normalize to a Blob.
  let blob: Blob
  if (data instanceof Uint8Array) {
    // Copy into a fresh ArrayBuffer-backed array to satisfy BlobPart typing.
    const bytes = new Uint8Array(data.length)
    bytes.set(data)
    blob = new Blob([bytes])
  } else if (data instanceof ArrayBuffer) {
    blob = new Blob([new Uint8Array(data)])
  } else if (typeof data === 'string' && data.length > 0) {
    // Fallback: some columns return base64 text.
    blob = base64ToBlob(data)
  } else {
    blob = new Blob([])
  }

  return {
    blob,
    fileName: result.fileName ?? 'download',
    size: blob.size,
  }
}

/** Converts a base64 string to a Blob for saving/downloading in the browser. */
export function base64ToBlob(base64: string, contentType = 'application/octet-stream'): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type: contentType })
}