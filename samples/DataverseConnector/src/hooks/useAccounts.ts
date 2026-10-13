/**
 * useAccounts Hook — read-only accounts for the Managing Partner dropdown.
 * Loads accounts (sorted by name) via the Dataverse connector.
 */

import { useState, useEffect } from 'react'
import { listRows } from '../dataverse/client'
import type { Accounts } from '../types'

const MAX_ACCOUNTS_TO_LOAD = 100
const DEFAULT_SORT_ORDER = 'name asc'

export function useAccounts() {
  const [accounts, setAccounts] = useState<Accounts[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadAccounts = async () => {
    try {
      setLoading(true)
      const rows = (await listRows('accounts', {
        select: ['accountid', 'name'],
        orderBy: [DEFAULT_SORT_ORDER],
        top: MAX_ACCOUNTS_TO_LOAD,
      })) as Accounts[]
      setAccounts(rows)
    } catch (err) {
      console.error('Error loading accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  return { accounts, loading, loadAccounts }
}
