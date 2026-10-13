/**
 * useLookupResolver Hook — resolves a contact's lookup GUIDs to display names via the connector.
 *
 * On-demand resolution: instead of loading every related record up front, it fetches only the
 * specific rows referenced by the current contact, using the connector's GetItem (wrapped by
 * `getRow` in ../dataverse/client).
 *
 * Lookup fields:
 *  - Read:  `_<field>_value` holds the related record's GUID
 *  - Write: `<navigationproperty>@odata.bind` sets the relationship
 */

import { useState, useEffect } from 'react'
import { getRow } from '../dataverse/client'
import type { Contacts } from '../types'

export interface ResolvedLookups {
  createdBy: string
  currency: string
  parentContact: string
  managingPartner: string
  owningTeam: string
}

const EMPTY: ResolvedLookups = {
  createdBy: '',
  currency: '',
  parentContact: '',
  managingPartner: '',
  owningTeam: '',
}

/** Fetch a single related row and extract its display name. */
async function resolve(
  entityName: string,
  id: string | undefined,
  select: string[],
  pick: (row: Record<string, unknown>) => string,
): Promise<string> {
  if (!id) return ''
  try {
    const row = await getRow(entityName, id, select)
    return pick(row) || 'Unknown'
  } catch (err) {
    console.error(`Error resolving lookup from ${entityName}:`, err)
    return 'Error loading'
  }
}

export function useLookupResolver(contact: Contacts | null) {
  const [resolvedLookups, setResolvedLookups] = useState<ResolvedLookups>(EMPTY)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!contact) {
      setResolvedLookups(EMPTY)
      return
    }

    const current = contact
    // Guard against stale updates: if `contact` changes or the component unmounts before the
    // async resolution finishes, don't call setState from the outdated run.
    let isActive = true

    async function fetchLookupNames() {
      setLoading(true)
      try {
        const [createdBy, currency, managingPartner, owningTeam] = await Promise.all([
          resolve('systemusers', current._createdby_value, ['systemuserid', 'fullname'], (r) =>
            String(r.fullname ?? 'Unknown User'),
          ),
          resolve(
            'transactioncurrencies',
            current._transactioncurrencyid_value,
            ['transactioncurrencyid', 'currencyname'],
            (r) => String(r.currencyname ?? 'Unknown Currency'),
          ),
          resolve('accounts', current._parentcustomerid_value, ['accountid', 'name'], (r) =>
            String(r.name ?? 'Unknown Account'),
          ),
          resolve('teams', current._owningteam_value, ['teamid', 'name'], (r) =>
            String(r.name ?? 'Unknown Team'),
          ),
        ])

        if (isActive) {
          setResolvedLookups({ createdBy, currency, parentContact: '', managingPartner, owningTeam })
        }
      } catch (err) {
        console.error('Error fetching lookup names:', err)
      } finally {
        if (isActive) setLoading(false)
      }
    }

    fetchLookupNames()

    return () => {
      isActive = false
    }
  }, [contact])

  return { resolvedLookups, loading }
}
