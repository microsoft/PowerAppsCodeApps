/**
 * ContactCard Component
 * Displays a single contact in a card format with actions
 *
 * RESPONSIBILITIES:
 * - Renders contact name and email in a clickable card
 * - Shows selected state with visual highlighting
 * - Handles click to select contact for editing
 *
 * PATTERN: Pure Presentational Component
 * - Minimal component focused on a single UI concern
 * - No state or business logic
 * - Delegates all actions via callback props
 */

import type { Contacts } from "../generated/models/ContactsModel";

/**
 * Props for the ContactCard component
 */
interface ContactCardProps {
  contact: Contacts;                         // Contact record to display
  isSelected: boolean;                       // Whether this card is currently selected
  onSelect: (contact: Contacts) => void;     // Callback when card is clicked
}

export function ContactCard({
  contact,
  isSelected,
  onSelect,
}: ContactCardProps) {
  return (
    <div
      className={`contact-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(contact)}
    >
      <h3>
        {contact.firstname} {contact.lastname}
      </h3>

      {contact.emailaddress1 && (
        <p className="email">{contact.emailaddress1}</p>
      )}
    </div>
  );
}
