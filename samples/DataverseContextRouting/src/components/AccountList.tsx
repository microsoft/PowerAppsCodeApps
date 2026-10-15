/**
 * AccountList Component
 * Displays a grid of accounts with option to create new ones
 *
 * PATTERN: Pure Presentational Component
 * - No business logic or service calls
 * - All data received via props
 * - All actions delegated via callback props
 */

import type { Accounts } from '../generated/models/AccountsModel';
import { AccountCard } from './AccountCard';

interface AccountListProps {
  accounts: Accounts[];
  selectedAccount: Accounts | null;
  loading: boolean;
  onSelect: (account: Accounts) => void;
  onCreateNew: () => void;
}

export function AccountList({
  accounts,
  selectedAccount,
  loading,
  onSelect,
  onCreateNew,
}: AccountListProps) {
  return (
    <section className="contacts-list">
      <div className="section-header">
        <h2>Accounts ({accounts.length})</h2>
        <button onClick={onCreateNew} className="btn-primary">
          + New Account
        </button>
      </div>

      {loading ? (
        <p>Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p>No accounts found. Create one to get started!</p>
      ) : (
        <div className="contacts-grid">
          {accounts.map((account) => (
            <AccountCard
              key={account.accountid}
              account={account}
              isSelected={selectedAccount?.accountid === account.accountid}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
