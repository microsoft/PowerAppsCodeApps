/**
 * ContactForm Component
 * Form for creating or editing a contact with lookup field support
 *
 * PATTERN DEMONSTRATION:
 * - Uses controlled components (React pattern for form state)
 * - Tracks unsaved changes to alert users before navigating away
 * - Demonstrates lookup field binding with OData syntax for write operations
 * - Shows read-only lookup resolution via useLookupResolver hook
 *
 * COMPONENT ARCHITECTURE:
 * - Pure presentational component (no service calls)
 * - All business logic delegated to parent via callbacks
 * - State limited to UI concerns (form data, unsaved changes indicator)
 */

import { useState, useEffect } from 'react';
import type { Contacts } from '../generated/models/ContactsModel';
import type { Accounts } from '../generated/models/AccountsModel';
import { useLookupResolver } from '../hooks/useLookupResolver';

/**
 * Props for the ContactForm component
 */
interface ContactFormProps {
  selectedContact: Contacts | null;  // Contact being edited (null for create mode)
  isCreating: boolean;                // Whether form is in create vs edit mode
  accounts: Accounts[];               // Available accounts for managing partner dropdown
  onSubmit: (formData: ContactFormData) => Promise<boolean>;  // Form submission callback
  onCancel: () => void;               // Cancel button callback
  onDelete: (contactId: string) => void;  // Delete button callback
}

/**
 * Form data structure for contact create/update operations
 *
 * NOTE: This matches Contact entity fields but:
 * - Uses string for all values (forms work with strings)
 * - Uses 'managingpartnerid' for the GUID value (not the @odata.bind syntax)
 * - The hook layer converts this to proper Dataverse format
 */
export interface ContactFormData {
  firstname: string;         // Required in Contact entity
  lastname: string;          // Required in Contact entity
  emailaddress1: string;     // Optional email field
  telephone1: string;        // Optional business phone
  mobilephone: string;       // Optional mobile phone
  jobtitle: string;          // Optional job title
  managingpartnerid: string; // Account GUID (lookup field)
}

/**
 * Helper component for displaying read-only lookup field values
 * Reduces repetitive code and improves maintainability
 */
function LookupField({
  label,
  value,
  loading,
}: {
  label: string;
  value: string;
  loading: boolean;
}) {
  if (!value) return null;

  return (
    <div className="lookup-field">
      <span className="lookup-label">{label}:</span>
      <span className="lookup-value">{loading ? 'Loading...' : value}</span>
    </div>
  );
}

export function ContactForm({
  selectedContact,
  isCreating,
  accounts,
  onSubmit,
  onCancel,
  onDelete,
}: ContactFormProps) {
  // Resolve lookup fields for display
  const { resolvedLookups, loading: lookupsLoading } = useLookupResolver(selectedContact);

  // Initialize form data
  const [formData, setFormData] = useState<ContactFormData>({
    firstname: '',
    lastname: '',
    emailaddress1: '',
    telephone1: '',
    mobilephone: '',
    jobtitle: '',
    managingpartnerid: '',
  });

  // Track unsaved changes
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update form data when selected contact changes
  useEffect(() => {
    if (selectedContact) {
      setFormData({
        firstname: selectedContact.firstname || '',
        lastname: selectedContact.lastname || '',
        emailaddress1: selectedContact.emailaddress1 || '',
        telephone1: selectedContact.telephone1 || '',
        mobilephone: selectedContact.mobilephone || '',
        jobtitle: selectedContact.jobtitle || '',
        managingpartnerid: selectedContact._msa_managingpartnerid_value || '',
      });
      setHasUnsavedChanges(false);
    } else if (isCreating) {
      // Reset form for new contact
      setFormData({
        firstname: '',
        lastname: '',
        emailaddress1: '',
        telephone1: '',
        mobilephone: '',
        jobtitle: '',
        managingpartnerid: '',
      });
      setHasUnsavedChanges(false);
    }
  }, [selectedContact, isCreating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) {
      setHasUnsavedChanges(false);
    }
  };

  const handleChange = (field: keyof ContactFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleCancel = () => {
    setHasUnsavedChanges(false);
    onCancel();
  };

  return (
    <section className="contact-form">
      <div className="section-header">
        <div className="header-with-status">
          <h2>{isCreating ? 'Create New Contact' : 'Edit Contact'}</h2>
          {hasUnsavedChanges && (
            <span className="unsaved-label">Unsaved changes</span>
          )}
        </div>
        <button onClick={handleCancel} className="btn-secondary">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="firstname">First Name *</label>
          <input
            type="text"
            id="firstname"
            value={formData.firstname}
            onChange={(e) => handleChange('firstname', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="lastname">Last Name *</label>
          <input
            type="text"
            id="lastname"
            value={formData.lastname}
            onChange={(e) => handleChange('lastname', e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emailaddress1">Email</label>
          <input
            type="email"
            id="emailaddress1"
            value={formData.emailaddress1}
            onChange={(e) => handleChange('emailaddress1', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone1">Phone</label>
          <input
            type="tel"
            id="telephone1"
            value={formData.telephone1}
            onChange={(e) => handleChange('telephone1', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="mobilephone">Mobile</label>
          <input
            type="tel"
            id="mobilephone"
            value={formData.mobilephone}
            onChange={(e) => handleChange('mobilephone', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="jobtitle">Job Title</label>
          <input
            type="text"
            id="jobtitle"
            value={formData.jobtitle}
            onChange={(e) => handleChange('jobtitle', e.target.value)}
          />
        </div>

        {/* Managing Partner Lookup Field */}
        <div className="form-group">
          <label htmlFor="managingpartnerid">
            Managing Partner (Account)
          </label>
          <select
            id="managingpartnerid"
            value={formData.managingpartnerid}
            onChange={(e) => handleChange('managingpartnerid', e.target.value)}
          >
            <option value="">-- No Managing Partner --</option>
            {accounts.map((account) => (
              <option key={account.accountid} value={account.accountid}>
                {account.name}
              </option>
            ))}
          </select>
          <small>Link this contact to a managing partner account</small>
        </div>

        {/* Read-only Lookup Fields Display */}
        {!isCreating && selectedContact && (
          <div className="lookup-info">
            <h3>Additional Information</h3>
            <div className="lookup-fields">
              <LookupField
                label="Created By"
                value={resolvedLookups.createdBy}
                loading={lookupsLoading}
              />
              <LookupField
                label="Currency"
                value={resolvedLookups.currency}
                loading={lookupsLoading}
              />
              <LookupField
                label="Managing Partner"
                value={resolvedLookups.managingPartner}
                loading={lookupsLoading}
              />
              <LookupField
                label="Owning Team"
                value={resolvedLookups.owningTeam}
                loading={lookupsLoading}
              />
            </div>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isCreating ? 'Create Contact' : 'Update Contact'}
          </button>
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          {!isCreating && selectedContact && (
            <button
              type="button"
              onClick={() => onDelete(selectedContact.contactid!)}
              className="btn-danger"
            >
              Delete Contact
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
