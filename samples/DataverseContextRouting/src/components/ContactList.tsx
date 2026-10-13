/**
 * ContactList Component
 * Displays a grid of contacts with option to create new ones
 *
 * RESPONSIBILITIES:
 * - Renders a scrollable list of contact cards
 * - Shows loading state while data is being fetched
 * - Shows empty state when no contacts exist
 * - Provides "New Contact" button to initiate creation
 *
 * PATTERN: Pure Presentational Component
 * - No business logic or service calls
 * - All data received via props
 * - All actions delegated via callback props
 */

import type { Contacts } from '../generated/models/ContactsModel';
import { ContactCard } from './ContactCard';

/**
 * Props for the ContactList component
 */
interface ContactListProps {
  contacts: Contacts[];              // Array of contacts to display
  selectedContact: Contacts | null;  // Currently selected contact (for highlighting)
  loading: boolean;                  // Whether data is being loaded
  onSelect: (contact: Contacts) => void;  // Callback when a contact is clicked
  onCreateNew: () => void;           // Callback when "New Contact" button is clicked
}

export function ContactList({
  contacts,
  selectedContact,
  loading,
  onSelect,
  onCreateNew,
}: ContactListProps) {
  return (
    <section className="contacts-list">
      <div className="section-header">
        <h2>Contacts ({contacts.length})</h2>
        <button onClick={onCreateNew} className="btn-primary">
          + New Contact
        </button>
      </div>

      {loading ? (
        <p>Loading contacts...</p>
      ) : contacts.length === 0 ? (
        <p>No contacts found. Create one to get started!</p>
      ) : (
        <div className="contacts-grid">
          {contacts.map((contact) => (
            <ContactCard
              key={contact.contactid}
              contact={contact}
              isSelected={selectedContact?.contactid === contact.contactid}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </section>
  );
}
