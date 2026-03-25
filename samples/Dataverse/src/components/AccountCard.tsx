/**
 * AccountCard Component
 * Displays a single account in a card format with actions
 *
 * PATTERN: Pure Presentational Component
 * - Minimal component focused on a single UI concern
 * - No state or business logic
 * - Delegates all actions via callback props
 */

import type { Accounts } from '../generated/models/AccountsModel';

interface AccountCardProps {
  account: Accounts;
  isSelected: boolean;
  onSelect: (account: Accounts) => void;
}

export function AccountCard({ account, isSelected, onSelect }: AccountCardProps) {
  return (
    <div
      className={`contact-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onSelect(account)}
    >
      <h3>{account.name}</h3>

      {account.emailaddress1 && (
        <p className="email">{account.emailaddress1}</p>
      )}

      {account.telephone1 && !account.emailaddress1 && (
        <p className="email">{account.telephone1}</p>
      )}

      {(account.address1_city || account.address1_country) && (
        <p className="email">
          {[account.address1_city, account.address1_country].filter(Boolean).join(', ')}
        </p>
      )}
    </div>
  );
}
