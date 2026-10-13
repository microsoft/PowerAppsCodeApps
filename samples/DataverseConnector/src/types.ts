/**
 * Domain types for the Dataverse tables this app uses.
 *
 * The Dataverse *connector* returns untyped OData rows (Record<string, unknown>), so unlike the
 * native Power Apps CLI-generated models, these interfaces are hand-authored to describe exactly the columns
 * this UI reads and writes. Field names match the Dataverse Web API (OData) column logical names.
 *
 * Lookup fields follow the OData convention:
 *  - Read:  `_<fieldname>_value` holds the related record's GUID
 *  - Read:  `_<fieldname>_value@OData.Community.Display.V1.FormattedValue` holds its display name
 *  - Write: `<navigationproperty>@odata.bind` = `/<entityset>(<guid>)`
 */

/** Microsoft Dataverse `account` row. */
export interface Accounts {
  accountid?: string
  name?: string
  emailaddress1?: string
  telephone1?: string
  websiteurl?: string
  description?: string
  address1_city?: string
  address1_country?: string
  createdon?: string
  modifiedon?: string
  _createdby_value?: string
  // File/image column values are read via bracket access using ACCOUNT_FILE_COLUMN /
  // ACCOUNT_IMAGE_COLUMN (below), since their logical names are environment-specific.
  // Allow OData annotations (formatted values, etags) and dynamic columns to pass through.
  [key: string]: unknown
}

/** Microsoft Dataverse `contact` row. */
export interface Contacts {
  contactid?: string
  firstname?: string
  lastname?: string
  fullname?: string
  emailaddress1?: string
  telephone1?: string
  mobilephone?: string
  jobtitle?: string
  createdon?: string
  modifiedon?: string
  _createdby_value?: string
  _transactioncurrencyid_value?: string
  /** Parent account (Company Name) lookup — used here as the "Managing Partner" relationship. */
  _parentcustomerid_value?: string
  _owningteam_value?: string
  [key: string]: unknown
}

/**
 * File/image columns on the Account table that support upload/download.
 *
 * ⚠️ Set these to the logical names of the File and Image columns in YOUR environment. Add a File
 * column and a full-size-enabled Image column to the Account table in the maker portal, then paste
 * each column's logical name here. The values below are examples from the environment this sample
 * was built in.
 */
export const ACCOUNT_FILE_COLUMN = 'crdac_filecol' as const
export const ACCOUNT_IMAGE_COLUMN = 'crdac_imagecol' as const

export type AccountsFileColumnName = typeof ACCOUNT_FILE_COLUMN
export type AccountsImageColumnName = typeof ACCOUNT_IMAGE_COLUMN
export type AccountsUploadColumnName = AccountsFileColumnName | AccountsImageColumnName
