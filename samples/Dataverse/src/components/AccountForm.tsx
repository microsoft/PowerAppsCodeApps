/**
 * AccountForm Component
 * Form for creating or editing an account
 *
 * PATTERN DEMONSTRATION:
 * - Uses controlled components (React pattern for form state)
 * - Tracks unsaved changes to alert users before navigating away
 * - Edit mode includes an Attachment sub-form that calls AccountsService.upload
 *
 * COMPONENT ARCHITECTURE:
 * - Pure presentational component for the main form fields
 * - Attachment sub-form calls AccountsService.upload directly (upload is a one-off
 *   action that belongs at the component boundary, not in the CRUD hook)
 * - Toast notification surfaces the IOperationResult success/error for 5 seconds
 */

import { useState, useEffect, useRef } from 'react';
import type { Accounts, AccountsUploadColumnName } from '../generated/models/AccountsModel';
import { AccountsService } from '../generated/services/AccountsService';

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
  onUploadSuccess?: () => void;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export function AccountForm({
  selectedAccount,
  isCreating,
  onSubmit,
  onCancel,
  onDelete,
  onUploadSuccess,
}: AccountFormProps) {
  // --- Main form state ---
  const [formData, setFormData] = useState<AccountFormData>({
    name: '',
    emailaddress1: '',
    telephone1: '',
    websiteurl: '',
    description: '',
    address1_city: '',
    address1_country: '',
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // --- Attachment sub-form state ---
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
  const [columnName, setColumnName] = useState<AccountsUploadColumnName>('cr3d5_filecol');
  const [fileDisplayName, setFileDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // --- Toast state ---
  const [toast, setToast] = useState<Toast | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Populate form when a different account is selected
  useEffect(() => {
    if (selectedAccount) {
      setFormData({
        name: selectedAccount.name || '',
        emailaddress1: selectedAccount.emailaddress1 || '',
        telephone1: selectedAccount.telephone1 || '',
        websiteurl: selectedAccount.websiteurl || '',
        description: selectedAccount.description || '',
        address1_city: selectedAccount.address1_city || '',
        address1_country: selectedAccount.address1_country || '',
      });
      setHasUnsavedChanges(false);
    } else if (isCreating) {
      setFormData({
        name: '',
        emailaddress1: '',
        telephone1: '',
        websiteurl: '',
        description: '',
        address1_city: '',
        address1_country: '',
      });
      setHasUnsavedChanges(false);
    }
    // Reset attachment state when account changes
    setAttachmentFile(null);
    setColumnName('cr3d5_filecol');
    setFileDisplayName('');
  }, [selectedAccount, isCreating]);

  // Clear toast timer on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ message, type });
    toastTimerRef.current = setTimeout(() => setToast(null), 5000);
  };

  // --- Main form handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onSubmit(formData);
    if (success) setHasUnsavedChanges(false);
  };

  const handleChange = (field: keyof AccountFormData, value: string) => {
    setFormData({ ...formData, [field]: value });
    setHasUnsavedChanges(true);
  };

  const handleCancel = () => {
    setHasUnsavedChanges(false);
    onCancel();
  };

  // --- Attachment handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setAttachmentFile(file);
    // Pre-fill column name with cr3d5_filecol; user can override if needed
    setColumnName('cr3d5_filecol');
    setFileDisplayName('');
  };

  const handleUpload = async () => {
    if (!attachmentFile || !selectedAccount?.accountid || !columnName.trim()) return;

    setIsUploading(true);
    try {
      const result = await AccountsService.upload(
        selectedAccount.accountid,
        columnName,
        attachmentFile,
        fileDisplayName.trim() || attachmentFile.name,
      );

      if (result.success) {
        showToast(`File "${attachmentFile.name}" uploaded successfully.`, 'success');
        onUploadSuccess?.();
        // Reset attachment fields on success
        setAttachmentFile(null);
        setColumnName('cr3d5_filecol');
        setFileDisplayName('');
        // Reset the file input element
        const fileInput = document.getElementById('attachment-file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorMsg = result.error?.message ?? 'Upload failed.';
        showToast(`Upload failed: ${errorMsg}`, 'error');
      }
    } catch (err) {
      showToast(`Upload error: ${(err as Error).message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <section className="contact-form">
      {/* Toast notification */}
      {toast && (
        <div className={`upload-toast upload-toast--${toast.type}`}>
          {toast.message}
        </div>
      )}

      <div className="section-header">
        <div className="header-with-status">
          <h2>{isCreating ? 'Create New Account' : 'Edit Account'}</h2>
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
          <label htmlFor="name">Account Name *</label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
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
          <label htmlFor="websiteurl">Website</label>
          <input
            type="url"
            id="websiteurl"
            value={formData.websiteurl}
            onChange={(e) => handleChange('websiteurl', e.target.value)}
            placeholder="https://"
          />
        </div>

        <div className="form-group">
          <label htmlFor="address1_city">City</label>
          <input
            type="text"
            id="address1_city"
            value={formData.address1_city}
            onChange={(e) => handleChange('address1_city', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="address1_country">Country</label>
          <input
            type="text"
            id="address1_country"
            value={formData.address1_country}
            onChange={(e) => handleChange('address1_country', e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
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
          {!isCreating && selectedAccount && (
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

      {/* Attachment sub-form — Edit mode only */}
      {!isCreating && selectedAccount && (
        <div className="attachment-subform">
          <h3>Attachments</h3>

          {/* Current file stored in cr3d5_filecol */}
          <div className="form-group">
            <label>cr3d5_filecol (current value)</label>
            {selectedAccount.cr3d5_filecol_name ? (
              <div className="file-current">
                <span className="file-current-icon">📄</span>
                <span className="file-current-name">{selectedAccount.cr3d5_filecol_name}</span>
              </div>
            ) : (
              <p className="file-empty">No file uploaded yet.</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="attachment-file">Upload new file</label>
            <input
              type="file"
              id="attachment-file"
              onChange={handleFileChange}
            />
          </div>

          {attachmentFile && (
            <>
              <div className="form-group">
                <label htmlFor="attachment-column">
                  Column Name <span className="required-mark">*</span>
                </label>
                <select
                  id="attachment-column"
                  value={columnName}
                  onChange={(e) => setColumnName(e.target.value as AccountsUploadColumnName)}
                >
                  <option value="cr3d5_filecol">cr3d5_filecol</option>
                  <option value="cr3d5_filecol2">cr3d5_filecol2</option>
                  <option value="cr3d5_imagecol">cr3d5_imagecol</option>
                  <option value="entityimage">entityimage</option>
                </select>
                <small>The schema name of the file/image column to upload to</small>
              </div>

              <div className="form-group">
                <label htmlFor="attachment-displayname">Display Name</label>
                <input
                  type="text"
                  id="attachment-displayname"
                  value={fileDisplayName}
                  onChange={(e) => setFileDisplayName(e.target.value)}
                  placeholder={attachmentFile.name}
                />
                <small>Defaults to the file name if left blank</small>
              </div>

              <div className="attachment-actions">
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleUpload}
                  disabled={isUploading || !columnName.trim()}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
