/**
 * useContacts Hook — Contact CRUD via the Dataverse *connector*.
 *
 * ARCHITECTURE:
 * This hook is the business-logic layer between the UI and the connector. It manages state and
 * orchestrates calls to the connector wrapper in `../dataverse/client`, which is built directly on
 * the auto-generated `MicrosoftDataverseService` (the Dataverse connector's generated service).
 *
 * The return shape matches the native Dataverse sample so the UI components are identical — only
 * the data layer underneath differs (connector instead of native Dataverse).
 */

import { useState, useEffect } from 'react'
import { createRow, deleteRow, listRows, updateRow, type DataverseRow } from '../dataverse/client'
import type { Contacts } from '../types'
import type { ContactFormData } from '../components/ContactForm'

const ENTITY = 'contacts'
const MAX_CONTACTS_TO_LOAD = 50
const DEFAULT_SORT_ORDER = 'createdon desc'

const CONTACT_SELECT = [
  'contactid',
  'firstname',
  'lastname',
  'fullname',
  'emailaddress1',
  'telephone1',
  'mobilephone',
  'jobtitle',
  '_createdby_value',
  '_transactioncurrencyid_value',
  '_parentcustomerid_value',
  '_owningteam_value',
  'createdon',
  'modifiedon',
]

export function useContacts() {
  const [contacts, setContacts] = useState<Contacts[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedContact, setSelectedContact] = useState<Contacts | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    loadContacts()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /**
   * READ: list contacts via the connector (ListRecords).
   * BEST PRACTICE: request only needed columns with `select`.
   */
  const loadContacts = async () => {
    try {
      setLoading(true)
      setError(null)

      const rows = await listRows(ENTITY, {
        select: CONTACT_SELECT,
        orderBy: [DEFAULT_SORT_ORDER],
        top: MAX_CONTACTS_TO_LOAD,
      })

      const data = rows as Contacts[]
      setContacts(data)
      if (data.length > 0 && !selectedContact) {
        setSelectedContact(data[0])
      }
    } catch (err) {
      setError(`Error loading contacts: ${(err as Error).message}`)
      console.error('Error loading contacts:', err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * CREATE: add a contact via the connector (CreateRecord).
   * LOOKUP: bind the parent account with OData bind syntax.
   */
  const createContact = async (formData: ContactFormData): Promise<boolean> => {
    try {
      setError(null)
      if (!formData.firstname || !formData.lastname) {
        setError('First name and last name are required')
        return false
      }

      const newContact: DataverseRow = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        emailaddress1: formData.emailaddress1 || null,
        telephone1: formData.telephone1 || null,
        mobilephone: formData.mobilephone || null,
        jobtitle: formData.jobtitle || null,
      }
      if (formData.managingpartnerid?.trim()) {
        newContact['parentcustomerid_account@odata.bind'] = `/accounts(${formData.managingpartnerid})`
      }

      await createRow(ENTITY, newContact)
      setIsCreating(false)
      setSelectedContact(null)
      await loadContacts()
      return true
    } catch (err) {
      setError(`Error creating contact: ${(err as Error).message}`)
      console.error('Error creating contact:', err)
      return false
    }
  }

  /**
   * UPDATE: modify a contact via the connector (UpdateRecord).
   */
  const updateContact = async (formData: ContactFormData): Promise<boolean> => {
    try {
      if (!selectedContact?.contactid) {
        setError('No contact selected')
        return false
      }
      setError(null)

      const updates: DataverseRow = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        emailaddress1: formData.emailaddress1 || null,
        telephone1: formData.telephone1 || null,
        mobilephone: formData.mobilephone || null,
        jobtitle: formData.jobtitle || null,
      }

      const currentParentId = selectedContact._parentcustomerid_value || ''
      if (formData.managingpartnerid !== currentParentId) {
        updates['parentcustomerid_account@odata.bind'] = formData.managingpartnerid?.trim()
          ? `/accounts(${formData.managingpartnerid})`
          : null
      }

      await updateRow(ENTITY, selectedContact.contactid, updates)
      setSelectedContact(null)
      await loadContacts()
      return true
    } catch (err) {
      setError(`Error updating contact: ${(err as Error).message}`)
      console.error('Error updating contact:', err)
      return false
    }
  }

  /**
   * DELETE: remove a contact via the connector (DeleteRecord).
   */
  const deleteContact = async (contactId: string): Promise<boolean> => {
    try {
      if (!confirm('Are you sure you want to delete this contact?')) {
        return false
      }
      setError(null)

      await deleteRow(ENTITY, contactId)
      if (selectedContact?.contactid === contactId) {
        setSelectedContact(null)
        setIsCreating(false)
      }
      await loadContacts()
      return true
    } catch (err) {
      setError(`Error deleting contact: ${(err as Error).message}`)
      console.error('Error deleting contact:', err)
      return false
    }
  }

  const startCreate = () => {
    setSelectedContact(null)
    setIsCreating(true)
    setError(null)
  }

  const selectContact = (contact: Contacts) => {
    setSelectedContact(contact)
    setIsCreating(false)
    setError(null)
  }

  const cancelForm = () => {
    setSelectedContact(null)
    setIsCreating(false)
    setError(null)
  }

  const handleFormSubmit = async (formData: ContactFormData): Promise<boolean> => {
    return isCreating ? createContact(formData) : updateContact(formData)
  }

  return {
    contacts,
    loading,
    error,
    selectedContact,
    isCreating,
    loadContacts,
    createContact,
    updateContact,
    deleteContact,
    startCreate,
    selectContact,
    cancelForm,
    handleFormSubmit,
  }
}
