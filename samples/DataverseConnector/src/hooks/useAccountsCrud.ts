/**
 * useAccountsCrud Hook — Account CRUD via the Dataverse *connector*.
 *
 * Full CRUD for the Accounts (File Attachments) page. A separate lightweight `useAccounts` hook
 * provides read-only accounts for the Managing Partner dropdown on contacts.
 *
 * All data access goes through `../dataverse/client`, which wraps the connector's generated
 * `MicrosoftDataverseService`.
 */

import { useState, useEffect, useRef } from 'react'
import { createRow, deleteRow, listRows, updateRow, type DataverseRow } from '../dataverse/client'
import { ACCOUNT_FILE_COLUMN, ACCOUNT_IMAGE_COLUMN, type Accounts } from '../types'
import type { AccountFormData } from '../components/AccountForm'

const ENTITY = 'accounts'
const MAX_ACCOUNTS_TO_LOAD = 50
const DEFAULT_SORT_ORDER = 'createdon desc'

const ACCOUNT_SELECT = [
  'accountid',
  'name',
  'emailaddress1',
  'telephone1',
  'websiteurl',
  'description',
  'address1_city',
  'address1_country',
  'createdon',
  'modifiedon',
  '_createdby_value',
  ACCOUNT_FILE_COLUMN,
  `${ACCOUNT_FILE_COLUMN}_name`,
  ACCOUNT_IMAGE_COLUMN,
]

export function useAccountsCrud() {
  const [accounts, setAccounts] = useState<Accounts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedAccount, setSelectedAccount] = useState<Accounts | null>(null)
  const selectedAccountRef = useRef<Accounts | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    selectedAccountRef.current = selectedAccount
  }, [selectedAccount])

  useEffect(() => {
    loadAccounts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * READ: list accounts via the connector (ListRecords).
   */
  const loadAccounts = async () => {
    try {
      setLoading(true)
      setError(null)

      const rows = (await listRows(ENTITY, {
        select: ACCOUNT_SELECT,
        orderBy: [DEFAULT_SORT_ORDER],
        top: MAX_ACCOUNTS_TO_LOAD,
      })) as Accounts[]

      setAccounts(rows)
      const currentId = selectedAccountRef.current?.accountid
      if (currentId) {
        const refreshed = rows.find((a) => a.accountid === currentId)
        if (refreshed) setSelectedAccount(refreshed)
      } else if (rows.length > 0) {
        setSelectedAccount(rows[0])
      }
    } catch (err) {
      setError(`Error loading accounts: ${(err as Error).message}`)
      console.error('Error loading accounts:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * CREATE: add an account via the connector (CreateRecord).
   */
  const createAccount = async (formData: AccountFormData): Promise<boolean> => {
    try {
      setError(null)
      if (!formData.name) {
        setError('Account name is required')
        return false
      }

      const newAccount: DataverseRow = {
        name: formData.name,
        emailaddress1: formData.emailaddress1 || null,
        telephone1: formData.telephone1 || null,
        websiteurl: formData.websiteurl || null,
        description: formData.description || null,
        address1_city: formData.address1_city || null,
        address1_country: formData.address1_country || null,
      }

      await createRow(ENTITY, newAccount)
      setIsCreating(false)
      setSelectedAccount(null)
      await loadAccounts()
      return true
    } catch (err) {
      setError(`Error creating account: ${(err as Error).message}`)
      console.error('Error creating account:', err)
      return false
    }
  }

  /**
   * UPDATE: modify an account via the connector (UpdateRecord).
   */
  const updateAccount = async (formData: AccountFormData): Promise<boolean> => {
    try {
      if (!selectedAccount?.accountid) {
        setError('No account selected')
        return false
      }
      setError(null)

      const updates: DataverseRow = {
        name: formData.name,
        emailaddress1: formData.emailaddress1 || null,
        telephone1: formData.telephone1 || null,
        websiteurl: formData.websiteurl || null,
        description: formData.description || null,
        address1_city: formData.address1_city || null,
        address1_country: formData.address1_country || null,
      }

      await updateRow(ENTITY, selectedAccount.accountid, updates)
      setSelectedAccount(null)
      await loadAccounts()
      return true
    } catch (err) {
      setError(`Error updating account: ${(err as Error).message}`)
      console.error('Error updating account:', err)
      return false
    }
  }

  /**
   * DELETE: remove an account via the connector (DeleteRecord).
   */
  const deleteAccount = async (accountId: string): Promise<boolean> => {
    try {
      if (!confirm('Are you sure you want to delete this account?')) {
        return false
      }
      setError(null)

      await deleteRow(ENTITY, accountId)
      if (selectedAccount?.accountid === accountId) {
        setSelectedAccount(null)
        setIsCreating(false)
      }
      await loadAccounts()
      return true
    } catch (err) {
      setError(`Error deleting account: ${(err as Error).message}`)
      console.error('Error deleting account:', err)
      return false
    }
  }

  const startCreate = () => {
    setSelectedAccount(null)
    setIsCreating(true)
    setError(null)
  }

  const selectAccount = (account: Accounts) => {
    setSelectedAccount(account)
    setIsCreating(false)
    setError(null)
  }

  const cancelForm = () => {
    setSelectedAccount(null)
    setIsCreating(false)
    setError(null)
  }

  const handleFormSubmit = async (formData: AccountFormData): Promise<boolean> => {
    return isCreating ? createAccount(formData) : updateAccount(formData)
  }

  return {
    accounts,
    loading,
    error,
    selectedAccount,
    isCreating,
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    startCreate,
    selectAccount,
    cancelForm,
    handleFormSubmit,
  }
}
