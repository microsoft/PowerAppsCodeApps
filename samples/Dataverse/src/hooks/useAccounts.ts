/**
 * useAccounts Hook
 * Custom hook for loading accounts for lookup field population
 *
 * PURPOSE:
 * This hook loads Account records to populate the "Managing Partner" dropdown
 * in the contact form. Demonstrates working with related entities.
 *
 * PATTERN:
 * - Loads data once on mount
 * - No error state exposed (silently fails to avoid disrupting main form)
 * - In production, consider adding error handling and retry logic
 */

import { useState, useEffect } from 'react';
import { AccountsService } from '../generated/services/AccountsService';
import type { Accounts } from '../generated/models/AccountsModel';

// Constants for query limits
const MAX_ACCOUNTS_TO_LOAD = 100;
const DEFAULT_SORT_ORDER = 'name asc';

export function useAccounts() {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Load accounts from Dataverse on mount
   */
  useEffect(() => {
    loadAccounts();
  }, []);

  /**
   * READ: Fetch all accounts for lookup dropdown
   * Loads accounts sorted by name for easy selection in dropdown
   */
  const loadAccounts = async () => {
    try {
      setLoading(true);

      const result = await AccountsService.getAll({
        orderBy: [DEFAULT_SORT_ORDER],
        top: MAX_ACCOUNTS_TO_LOAD,
      });

      if (result.data) {
        setAccounts(result.data);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    accounts,
    loading,
    loadAccounts,
  };
}
