/**
 * useAccountsCrud Hook
 * Custom hook for managing account CRUD operations
 *
 * This hook encapsulates all the business logic for:
 * - Loading accounts from Dataverse
 * - Creating new accounts
 * - Updating existing accounts
 * - Deleting accounts
 * - Error handling and loading states
 *
 * ARCHITECTURE PATTERN:
 * This hook acts as the "controller" layer between UI components and services.
 * It manages state, orchestrates service calls, and handles errors.
 * Components remain pure and presentational by delegating all business logic here.
 *
 * NOTE: This hook provides full CRUD for the Accounts page.
 * The separate `useAccounts` hook is a lightweight read-only hook used to
 * populate lookup dropdowns (e.g. the Managing Partner field on contacts).
 */

import { useState, useEffect, useRef } from 'react';
import { AccountsService } from '../generated/services/AccountsService';
import type { Accounts } from '../generated/models/AccountsModel';
import type { AccountFormData } from '../components/AccountForm';

// Constants for query limits
const MAX_ACCOUNTS_TO_LOAD = 50;
const DEFAULT_SORT_ORDER = 'createdon desc';

export function useAccountsCrud() {
  const [accounts, setAccounts] = useState<Accounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Accounts | null>(null);
  const selectedAccountRef = useRef<Accounts | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Keep ref in sync so loadAccounts always reads the current selectedAccount
  useEffect(() => {
    selectedAccountRef.current = selectedAccount;
  }, [selectedAccount]);

  /**
   * Load all accounts from Dataverse on mount
   */
  useEffect(() => {
    loadAccounts();
  }, []);

  /**
   * READ: Fetch all accounts from Dataverse
   *
   * BEST PRACTICE: Always use 'select' to request only needed fields
   * - Improves performance by reducing payload size
   * - Makes code self-documenting (clear which fields are used)
   */
  const loadAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await AccountsService.getAll({
        select: [
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
          'cr3d5_filecol',
          'cr3d5_filecol_name',
        ],
        orderBy: [DEFAULT_SORT_ORDER],
        top: MAX_ACCOUNTS_TO_LOAD,
      });

      if (result.data) {
        setAccounts(result.data);
        const currentId = selectedAccountRef.current?.accountid;
        if (currentId) {
          // Refresh the selected account so fields like cr3d5_filecol_name are up to date
          const refreshed = result.data.find(a => a.accountid === currentId);
          if (refreshed) setSelectedAccount(refreshed);
        } else if (result.data.length > 0) {
          setSelectedAccount(result.data[0]);
        }
      } else {
        setError('Failed to load accounts');
      }
    } catch (err) {
      setError(`Error loading accounts: ${(err as Error).message}`);
      console.error('Error loading accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * CREATE: Add a new account to Dataverse
   */
  const createAccount = async (formData: AccountFormData): Promise<boolean> => {
    try {
      setError(null);

      if (!formData.name) {
        setError('Account name is required');
        return false;
      }

      const newAccount: any = {
        name: formData.name,
        emailaddress1: formData.emailaddress1 || undefined,
        telephone1: formData.telephone1 || undefined,
        websiteurl: formData.websiteurl || undefined,
        description: formData.description || undefined,
        address1_city: formData.address1_city || undefined,
        address1_country: formData.address1_country || undefined,
      };

      const result = await AccountsService.create(newAccount);

      if (result.data) {
        setIsCreating(false);
        setSelectedAccount(null);
        await loadAccounts();
        return true;
      } else {
        setError('Failed to create account');
        return false;
      }
    } catch (err) {
      setError(`Error creating account: ${(err as Error).message}`);
      console.error('Error creating account:', err);
      return false;
    }
  };

  /**
   * UPDATE: Modify an existing account
   */
  const updateAccount = async (formData: AccountFormData): Promise<boolean> => {
    try {
      if (!selectedAccount?.accountid) {
        setError('No account selected');
        return false;
      }

      setError(null);

      const updates: any = {
        name: formData.name,
        emailaddress1: formData.emailaddress1 || undefined,
        telephone1: formData.telephone1 || undefined,
        websiteurl: formData.websiteurl || undefined,
        description: formData.description || undefined,
        address1_city: formData.address1_city || undefined,
        address1_country: formData.address1_country || undefined,
      };

      const result = await AccountsService.update(selectedAccount.accountid, updates);

      if (result.data) {
        setSelectedAccount(null);
        await loadAccounts();
        return true;
      } else {
        setError('Failed to update account');
        return false;
      }
    } catch (err) {
      setError(`Error updating account: ${(err as Error).message}`);
      console.error('Error updating account:', err);
      return false;
    }
  };

  /**
   * DELETE: Remove an account from Dataverse
   */
  const deleteAccount = async (accountId: string): Promise<boolean> => {
    try {
      if (!confirm('Are you sure you want to delete this account?')) {
        return false;
      }

      setError(null);

      await AccountsService.delete(accountId);

      if (selectedAccount?.accountid === accountId) {
        setSelectedAccount(null);
        setIsCreating(false);
      }

      await loadAccounts();
      return true;
    } catch (err) {
      setError(`Error deleting account: ${(err as Error).message}`);
      console.error('Error deleting account:', err);
      return false;
    }
  };

  const startCreate = () => {
    setSelectedAccount(null);
    setIsCreating(true);
    setError(null);
  };

  const selectAccount = (account: Accounts) => {
    setSelectedAccount(account);
    setIsCreating(false);
    setError(null);
  };

  const cancelForm = () => {
    setSelectedAccount(null);
    setIsCreating(false);
    setError(null);
  };

  const handleFormSubmit = async (formData: AccountFormData): Promise<boolean> => {
    if (isCreating) {
      return await createAccount(formData);
    } else {
      return await updateAccount(formData);
    }
  };

  return {
    // State
    accounts,
    loading,
    error,
    selectedAccount,
    isCreating,
    // Actions
    loadAccounts,
    createAccount,
    updateAccount,
    deleteAccount,
    startCreate,
    selectAccount,
    cancelForm,
    handleFormSubmit,
  };
}
