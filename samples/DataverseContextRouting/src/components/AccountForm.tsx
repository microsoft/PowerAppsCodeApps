import { useState } from 'react';
import type { Accounts } from '../generated/models/AccountsModel';

export interface AccountFormData {
  name: string;
  emailaddress1: string;
  telephone1: string;
  websiteurl: string;
  description: string;
  address1_city: string;
  address1_country: string;
}

interface AccountFormProps {
  selectedAccount: Accounts | null;
  isCreating: boolean;
  onSubmit: (formData: AccountFormData) => Promise<boolean>;
  onCancel: () => void;
  onDelete: (accountId: string) => void;
}

const emptyFormData: AccountFormData = {
  name: '',
  emailaddress1: '',
  telephone1: '',
  websiteurl: '',
  description: '',
  address1_city: '',
  address1_country: '',
};

function getInitialFormData(selectedAccount: Accounts | null): AccountFormData {
  if (!selectedAccount) {
    return emptyFormData;
  }

  return {
    name: selectedAccount.name || '',
    emailaddress1: selectedAccount.emailaddress1 || '',
    telephone1: selectedAccount.telephone1 || '',
    websiteurl: selectedAccount.websiteurl || '',
    description: selectedAccount.description || '',
    address1_city: selectedAccount.address1_city || '',
    address1_country: selectedAccount.address1_country || '',
  };
}

export function AccountForm({
  selectedAccount,
  isCreating,
  onSubmit,
  onCancel,
  onDelete,
}: AccountFormProps) {
  const [formData, setFormData] = useState<AccountFormData>(() =>
    getInitialFormData(selectedAccount),
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleChange = (field: keyof AccountFormData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (await onSubmit(formData)) {
      setHasUnsavedChanges(false);
    }
  };

  const handleCancel = () => {
    setHasUnsavedChanges(false);
    onCancel();
  };

  return (
    <section className="contact-form">
      <div className="section-header">
        <div className="header-with-status">
          <h2>{isCreating ? 'Create New Account' : 'Edit Account'}</h2>
          {hasUnsavedChanges && <span className="unsaved-label">Unsaved changes</span>}
        </div>
        <button onClick={handleCancel} className="btn-secondary">
          Cancel
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Account Name *</label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(event) => handleChange('name', event.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="emailaddress1">Email</label>
          <input
            id="emailaddress1"
            type="email"
            value={formData.emailaddress1}
            onChange={(event) => handleChange('emailaddress1', event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="telephone1">Phone</label>
          <input
            id="telephone1"
            type="tel"
            value={formData.telephone1}
            onChange={(event) => handleChange('telephone1', event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="websiteurl">Website</label>
          <input
            id="websiteurl"
            type="url"
            value={formData.websiteurl}
            onChange={(event) => handleChange('websiteurl', event.target.value)}
            placeholder="https://"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address1_city">City</label>
          <input
            id="address1_city"
            type="text"
            value={formData.address1_city}
            onChange={(event) => handleChange('address1_city', event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address1_country">Country</label>
          <input
            id="address1_country"
            type="text"
            value={formData.address1_country}
            onChange={(event) => handleChange('address1_country', event.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(event) => handleChange('description', event.target.value)}
            rows={3}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {isCreating ? 'Create Account' : 'Update Account'}
          </button>
          <button type="button" onClick={handleCancel} className="btn-secondary">
            Cancel
          </button>
          {!isCreating && selectedAccount?.accountid && (
            <button
              type="button"
              onClick={() => onDelete(selectedAccount.accountid!)}
              className="btn-danger"
            >
              Delete Account
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
