/**
 * useLookupResolver Hook
 * Resolves individual lookup records by ID instead of fetching all records
 *
 * This hook fetches specific related records on-demand using their GUIDs.
 * This approach is more efficient than loading all possible lookup values upfront.
 *
 * PATTERN: On-Demand Lookup Resolution
 * ======================================
 * Instead of loading ALL possible related records upfront (expensive):
 * - Load only the specific records referenced by the current contact
 * - Fetch individual records by GUID using service.get()
 * - Much more efficient for large datasets
 *
 * LOOKUP FIELD STRUCTURE:
 * - Read: _<fieldname>_value contains the related record's GUID
 * - Write: <fieldname>@odata.bind to set the relationship
 *
 * Example:
 * - Reading: contact._createdby_value = "abc-123-guid"
 * - Writing: { "createdby@odata.bind": "/systemusers(abc-123-guid)" }
 */

import { useState, useEffect } from 'react';
import { SystemusersService } from '../generated/services/SystemusersService';
import { TransactioncurrenciesService } from '../generated/services/TransactioncurrenciesService';
import { TeamsService } from '../generated/services/TeamsService';
import { AccountsService } from '../generated/services/AccountsService';
import { ContactsService } from '../generated/services/ContactsService';
import type { Contacts } from '../generated/models/ContactsModel';
import type { IOperationResult } from '@microsoft/power-apps/data';

/**
 * Resolved lookup names for a contact
 * These are fetched individually from Dataverse as needed
 */
export interface ResolvedLookups {
  createdBy: string;
  currency: string;
  parentContact: string;
  managingPartner: string;
  owningTeam: string;
}

/**
 * Helper function to fetch a single lookup record
 * Reduces code duplication for lookup resolution
 *
 * @param id - GUID of the related record
 * @param service - Service object with get() method
 * @param selectFields - Fields to retrieve from the related record
 * @param nameExtractor - Function to extract display name from the record
 * @param errorMessage - Error message for console logging
 * @returns Display name or empty string if not found
 */
async function fetchLookup<T>(
  id: string | undefined,
  service: { get: (id: string, opts: any) => Promise<IOperationResult<T>> },
  selectFields: string[],
  nameExtractor: (data: T) => string,
  errorMessage: string
): Promise<string> {
  if (!id) return '';

  try {
    const result = await service.get(id, { select: selectFields });
    return result.data ? nameExtractor(result.data) : 'Unknown';
  } catch (err) {
    console.error(errorMessage, err);
    return 'Error loading';
  }
}

/**
 * Custom hook to resolve lookup field values to display names
 * Fetches individual records by ID using the generated service's get() method
 *
 * @param contact - The contact with lookup field GUIDs
 * @returns Resolved lookup display names and loading state
 */
export function useLookupResolver(contact: Contacts | null) {
  const [resolvedLookups, setResolvedLookups] = useState<ResolvedLookups>({
    createdBy: '',
    currency: '',
    parentContact: '',
    managingPartner: '',
    owningTeam: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!contact) {
      // Reset when no contact selected
      setResolvedLookups({
        createdBy: '',
        currency: '',
        parentContact: '',
        managingPartner: '',
        owningTeam: '',
      });
      return;
    }

    // Capture contact in a const to satisfy TypeScript's strict null checks
    const currentContact = contact;

    /**
     * Fetch individual lookup records using the GUID values
     * PATTERN: Uses helper function to reduce code duplication
     */
    async function fetchLookupNames() {
      setLoading(true);

      try {
        // Fetch all lookups in parallel for better performance
        // Using Promise.all allows concurrent requests instead of sequential
        const [createdBy, currency, parentContact, managingPartner, owningTeam] = await Promise.all([
          // Fetch Created By user
          // _createdby_value contains the systemuser GUID
          fetchLookup(
            currentContact._createdby_value,
            SystemusersService,
            ['systemuserid', 'fullname'],
            (data) => data.fullname ?? 'Unknown User',
            'Error fetching created by user:'
          ),

          // Fetch Currency
          // _transactioncurrencyid_value contains the transactioncurrency GUID
          fetchLookup(
            currentContact._transactioncurrencyid_value,
            TransactioncurrenciesService,
            ['transactioncurrencyid', 'currencyname'],
            (data) => data.currencyname ?? 'Unknown Currency',
            'Error fetching currency:'
          ),

          // Fetch Parent Contact
          // Note: Read from _parentcontactid_value, write using parentcustomerid_contact@odata.bind
          fetchLookup(
            currentContact._parentcontactid_value,
            ContactsService,
            ['contactid', 'fullname', 'firstname', 'lastname'],
            (data) =>
              data.fullname ||
              `${data.firstname ?? ''} ${data.lastname ?? ''}`.trim() ||
              'Unknown Contact',
            'Error fetching parent contact:'
          ),

          // Fetch Managing Partner (Account)
          // _msa_managingpartnerid_value contains the account GUID (msa_ is publisher prefix)
          fetchLookup(
            currentContact._msa_managingpartnerid_value,
            AccountsService,
            ['accountid', 'name'],
            (data) => data.name ?? 'Unknown Account',
            'Error fetching managing partner:'
          ),

          // Fetch Owning Team
          // _owningteam_value contains the team GUID
          fetchLookup(
            currentContact._owningteam_value,
            TeamsService,
            ['teamid', 'name'],
            (data) => data.name ?? 'Unknown Team',
            'Error fetching owning team:'
          ),
        ]);

        setResolvedLookups({
          createdBy,
          currency,
          parentContact,
          managingPartner,
          owningTeam,
        });
      } catch (err) {
        console.error('Error fetching lookup names:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchLookupNames();
  }, [contact]);

  return {
    resolvedLookups,
    loading,
  };
}
