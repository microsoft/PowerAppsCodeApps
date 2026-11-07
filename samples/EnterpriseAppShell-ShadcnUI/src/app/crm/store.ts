import * as React from "react"

import {
  activities as seedActivities,
  companies as seedCompanies,
  contacts as seedContacts,
  leads as seedLeads,
  type Activity,
  type Company,
  type Contact,
  type Lead,
} from "./data"

// Session store standing in for Dataverse. Pages read through the hooks below so
// edits made in one screen are visible everywhere without a reload.
export type CrmState = {
  leads: Lead[]
  activities: Activity[]
  companies: Company[]
  contacts: Contact[]
}

let state: CrmState = {
  leads: seedLeads.map((lead) => ({ ...lead })),
  activities: seedActivities.map((activity) => ({ ...activity })),
  companies: seedCompanies.map((company) => ({ ...company })),
  contacts: seedContacts.map((contact) => ({ ...contact })),
}

const listeners = new Set<() => void>()

function setState(next: Partial<CrmState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

export function useCrm() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

export function useLeads() {
  return useCrm().leads
}

export function useActivities() {
  return useCrm().activities
}

export function useCompanies() {
  return useCrm().companies
}

export function useContacts() {
  return useCrm().contacts
}

export function useLeadById(leadId?: string) {
  return useLeads().find((lead) => lead.id === leadId)
}

export function useActivityById(activityId?: string) {
  return useActivities().find((activity) => activity.id === activityId)
}

export function useCompanyById(companyId?: string) {
  return useCompanies().find((company) => company.id === companyId)
}

export function useContactById(contactId?: string) {
  return useContacts().find((contact) => contact.id === contactId)
}

/** Lookup helpers, returned as functions so they can be used inside a `map`. */
export function useCompanyName() {
  const companies = useCompanies()
  return (companyId: string | undefined) =>
    companies.find((company) => company.id === companyId)?.name ?? "—"
}

export function useContactsFor() {
  const contacts = useContacts()
  return (companyId: string) =>
    contacts.filter((contact) => contact.companyId === companyId)
}

export function useActivitiesFor(ref: { contactId?: string; companyId?: string }) {
  return useActivities()
    .filter((activity) =>
      ref.contactId
        ? activity.contactId === ref.contactId
        : activity.companyId === ref.companyId
    )
    .sort((a, b) => b.date.localeCompare(a.date))
}

function nextId(prefix: string, existing: string[]) {
  const highest = existing.reduce((max, id) => {
    const value = Number(id.split("-")[1])
    return Number.isFinite(value) && value > max ? value : max
  }, 0)
  return `${prefix}-${highest + 1}`
}

export function newLeadId() {
  return nextId("LEAD", state.leads.map((lead) => lead.id))
}

export function newActivityId() {
  return nextId("ACT", state.activities.map((activity) => activity.id))
}

// Seed companies and contacts use name slugs, so new records start a numbered series.
export function newCompanyId() {
  return nextId("COMP", state.companies.map((company) => company.id))
}

export function newContactId() {
  return nextId("CON", state.contacts.map((contact) => contact.id))
}

export function saveLead(lead: Lead) {
  const exists = state.leads.some((item) => item.id === lead.id)
  setState({
    leads: exists
      ? state.leads.map((item) => (item.id === lead.id ? lead : item))
      : [lead, ...state.leads],
  })
}

export function saveActivity(activity: Activity) {
  const exists = state.activities.some((item) => item.id === activity.id)
  setState({
    activities: exists
      ? state.activities.map((item) =>
          item.id === activity.id ? activity : item
        )
      : [...state.activities, activity],
  })
}

export function saveCompany(company: Company) {
  const exists = state.companies.some((item) => item.id === company.id)
  setState({
    companies: exists
      ? state.companies.map((item) => (item.id === company.id ? company : item))
      : [company, ...state.companies],
  })
}

export function saveContact(contact: Contact) {
  const exists = state.contacts.some((item) => item.id === contact.id)
  setState({
    contacts: exists
      ? state.contacts.map((item) => (item.id === contact.id ? contact : item))
      : [contact, ...state.contacts],
  })
}
