import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogContent,
  DialogBody,
  DialogActions,
  Field,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  createTableColumn,
  type TableColumnDefinition,
  MessageBar,
  MessageBarBody,
  MessageBarActions,
  Spinner,
  SearchBox,
  Text,
  makeStyles,
  tokens,
  Title1,
} from '@fluentui/react-components';
import {
  AddRegular,
  EditRegular,
  DeleteRegular,
  SearchRegular,
  ArrowClockwiseRegular,
  DismissRegular,
} from '@fluentui/react-icons';
import { contactsService } from '../Services/contactsService';
import type { contacts } from '../Models/contactsModel';
import { usePowerRuntime } from '../hooks/usePowerRuntime';
import BasePage from '../components/common/BasePage';
import { ConfirmDialog } from '../components/common';
import { getEmailError, coercePhone } from '../utils/validation';
import { PhoneField } from '../components/form/PhoneField';
import { useDebouncedValue, useStatusMessage } from '../hooks';

const useStyles = makeStyles({
  headerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
  },
  topRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    gap: tokens.spacingHorizontalXL,
  },
  titleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    minWidth: 0,
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalM,
  },
  searchBox: {
    width: '340px',
  },
  fullWidthContainer: {
    // Expand to match the header content width exactly
    width: 'calc(100% + 48px)', // Account for the 24px padding on each side
    marginLeft: '-24px',
    marginRight: '-24px',
    paddingLeft: '24px',
    paddingRight: '24px',
    boxSizing: 'border-box',
  },
  gridContainer: {
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
  },
  actionButton: {
    minWidth: 'auto',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  emptyState: {
    textAlign: 'center',
    padding: tokens.spacingVerticalXXL,
    color: tokens.colorNeutralForeground3,
  },
  contactForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalM,
    marginTop: tokens.spacingVerticalXS,
    width: '100%',
    // About 15% narrower than original 420px
    minWidth: '360px',
    boxSizing: 'border-box'
  },
  narrowDialogSurface: {
    // Constrain overall surface width (~15% narrower than ~500px default)
    maxWidth: '430px',
    width: '100%'
  },
  fullWidthField: {
    width: '100%',
    '& > *': { width: '100%' }
  },
  fullWidthInput: {
    width: '100%',
    maxWidth: '100%',
    boxSizing: 'border-box'
  },
});

interface ContactFormData {
  firstname?: string;
  lastname: string;
  emailaddress1?: string;
  telephone1?: string;
  jobtitle?: string;
}

const emptyContact: ContactFormData = {
  firstname: '',
  lastname: '',
  emailaddress1: '',
  telephone1: '',
  jobtitle: '',
};

export const ContactsPage: React.FC = () => {
  const styles = useStyles();
  const { isReady } = usePowerRuntime();
  const [contacts, setContacts] = useState<contacts[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<contacts[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebouncedValue(searchTerm, 300);
  const [error, setError] = useState<string | null>(null);
  const { message, showSuccess, showError, clear } = useStatusMessage();

  // Form state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>(emptyContact);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Delete confirmation state
  const [deleteTarget, setDeleteTarget] = useState<contacts | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const emailError = useMemo(() => getEmailError(formData.emailaddress1), [formData.emailaddress1]);
  // Phone validation handled inside PhoneField component

  // Load contacts
  const loadContacts = useCallback(async () => {
    if (!isReady) return;

    setLoading(true);
    setError(null);

    try {
      const result = await contactsService.getAll({
        orderBy: ['fullname'],
        top: 100
      });
      if (result?.success) {
        const contactsList = (result.data as contacts[]) || [];
        setContacts(contactsList);
        setFilteredContacts(contactsList);
      } else {
        setError('Failed to load contacts');
        setContacts([]);
        setFilteredContacts([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contacts');
      setContacts([]);
      setFilteredContacts([]);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  // Search filtering
  useEffect(() => {
    if (!debouncedSearch.trim()) {
      setFilteredContacts(contacts);
    } else {
      const filtered = contacts.filter(contact =>
        contact.fullname?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.emailaddress1?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.telephone1?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        contact.jobtitle?.toLowerCase().includes(debouncedSearch.toLowerCase())
      );
      setFilteredContacts(filtered);
    }
  }, [contacts, debouncedSearch]);

  // Load contacts when ready
  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Form handlers
  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCreate = () => {
    setFormData(emptyContact);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = useCallback((contact: contacts) => {
    setFormData({
      firstname: contact.firstname || '',
      lastname: contact.lastname || '',
      emailaddress1: contact.emailaddress1 || '',
      telephone1: contact.telephone1 || '',
      jobtitle: contact.jobtitle || '',
    });
    setEditingContactId(contact.contactid || null);
    setIsEditDialogOpen(true);
  }, []);

  const promptDelete = useCallback((contact: contacts) => {
    setDeleteTarget(contact);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget?.contactid) {
      setDeleteTarget(null);
      return;
    }
    setIsDeleting(true);
    try {
      await contactsService.delete(deleteTarget.contactid);
      showSuccess('Contact deleted successfully');
      setDeleteTarget(null);
      loadContacts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete contact');
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, loadContacts, showSuccess]);

  const handleSubmitCreate = async () => {
    if (!formData.lastname.trim()) {
      setError('Last name is required');
      return;
    }
    if (emailError) {
      setError('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const prepared = { ...formData, telephone1: coercePhone(formData.telephone1) };
      const result = await contactsService.create(prepared as Omit<contacts, 'contactid'>);
      if (result?.success) {
        showSuccess('Contact created successfully');
        setIsCreateDialogOpen(false);
        setFormData(emptyContact);
        // Clear search to ensure the newly added contact is visible in full list
        setSearchTerm('');
        loadContacts();
      } else {
        showError('Failed to create contact');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to create contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitEdit = async () => {
    if (!formData.lastname.trim() || !editingContactId) {
      setError('Last name is required');
      return;
    }
    if (emailError) {
      setError('Please fix validation errors before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const prepared = { ...formData, telephone1: coercePhone(formData.telephone1) };
      const result = await contactsService.update(editingContactId, prepared);
      if (result?.success) {
        showSuccess('Contact updated successfully');
        setIsEditDialogOpen(false);
        setFormData(emptyContact);
        setEditingContactId(null);
        loadContacts();
      } else {
        showError('Failed to update contact');
      }
    } catch (err) {
      showError(err instanceof Error ? err.message : 'Failed to update contact');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Column definitions
  const columns: TableColumnDefinition<contacts>[] = useMemo(() => [
    createTableColumn<contacts>({
      columnId: 'name',
      compare: (a, b) => (a.fullname || '').localeCompare(b.fullname || ''),
      renderHeaderCell: () => 'Name',
      renderCell: (contact) => contact.fullname || '-',
    }),
    createTableColumn<contacts>({
      columnId: 'email',
      compare: (a, b) => (a.emailaddress1 || '').localeCompare(b.emailaddress1 || ''),
      renderHeaderCell: () => 'Email',
      renderCell: (contact) => contact.emailaddress1 || '-',
    }),
    createTableColumn<contacts>({
      columnId: 'phone',
      compare: (a, b) => (a.telephone1 || '').localeCompare(b.telephone1 || ''),
      renderHeaderCell: () => 'Phone',
      renderCell: (contact) => contact.telephone1 || '-',
    }),
    createTableColumn<contacts>({
      columnId: 'jobTitle',
      compare: (a, b) => (a.jobtitle || '').localeCompare(b.jobtitle || ''),
      renderHeaderCell: () => 'Job Title',
      renderCell: (contact) => contact.jobtitle || '-',
    }),
    createTableColumn<contacts>({
      columnId: 'actions',
      renderHeaderCell: () => 'Actions',
      renderCell: (contact) => (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button
            icon={<EditRegular />}
            appearance="subtle"
            size="small"
            onClick={() => handleEdit(contact)}
            title="Edit"
          />
          <Button
            icon={<DeleteRegular />}
            appearance="subtle"
            size="small"
            onClick={() => promptDelete(contact)}
            title="Delete"
          />
        </div>
      ),
    }),
  ], [handleEdit, promptDelete]);

  const headerContent = (
    <div className={styles.headerContainer}>
      {/* Top Row with Title + Refresh (left) and Search + New Contact (right) */}
      <div className={styles.topRow}>
        <div className={styles.titleGroup}>
          <Title1 as="h1">Contacts</Title1>
          <Button
            icon={<ArrowClockwiseRegular />}
            onClick={loadContacts}
            disabled={loading}
            size="small"
            appearance="subtle"
            aria-label="Refresh contacts"
            title="Refresh"
          />
        </div>
        <div className={styles.actionsGroup}>
          <SearchBox
            placeholder="Search contacts..."
            value={searchTerm}
            onChange={(_, data) => setSearchTerm(data.value)}
            contentBefore={<SearchRegular />}
            className={styles.searchBox}
          />
          <Button
            icon={<AddRegular />}
            appearance="primary"
            onClick={handleCreate}
            size="medium"
          >
            New Contact
          </Button>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <MessageBar intent="error" role="alert">
          <MessageBarBody>{error}</MessageBarBody>
        </MessageBar>
      )}
      {message && (
        <MessageBar intent={message.intent} role="status">
          <MessageBarBody>{message.text}</MessageBarBody>
          <MessageBarActions>
            <Button
              aria-label="Dismiss"
              appearance="transparent"
              size="small"
              icon={<DismissRegular />}
              onClick={clear}
            />
          </MessageBarActions>
        </MessageBar>
      )}
    </div>
  );

  return (
    <BasePage header={headerContent}>
      {/* Data Grid */}
      {loading ? (
        <div className={styles.loadingContainer}>
          <Spinner size="large" />
          <Text>Loading contacts...</Text>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className={styles.emptyState}>
          <Text size={400}>
            {searchTerm ? 'No contacts found matching your search.' : 'No contacts found.'}
          </Text>
        </div>
      ) : (
        <div className={styles.gridContainer}>
          <DataGrid
            items={filteredContacts}
            columns={columns}
            sortable
            getRowId={(contact) => contact.contactid ?? crypto.randomUUID()}
            aria-label="Contacts data grid"
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<contacts>>
              {({ item, rowId }) => (
                <DataGridRow<contacts> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={(_, data) => setIsCreateDialogOpen(data.open)}>
        <DialogSurface className={styles.narrowDialogSurface}>
          <DialogBody>
            <DialogTitle>Create New Contact</DialogTitle>
            <DialogContent>
              <form onSubmit={(e) => { e.preventDefault(); void handleSubmitCreate(); }} className={styles.contactForm}>
                <Field label="First Name" className={styles.fullWidthField}>
                  <Input className={styles.fullWidthInput} value={formData.firstname} onChange={(_, d) => handleInputChange('firstname', d.value)} placeholder="Enter first name" />
                </Field>
                <Field label="Last Name" required className={styles.fullWidthField}>
                  <Input className={styles.fullWidthInput} value={formData.lastname} onChange={(_, d) => handleInputChange('lastname', d.value)} placeholder="Enter last name" required />
                </Field>
                <Field label="Email" className={styles.fullWidthField} validationState={emailError ? 'error' : 'none'} validationMessage={emailError || undefined}>
                  <Input className={styles.fullWidthInput} type="email" value={formData.emailaddress1} onChange={(_, d) => handleInputChange('emailaddress1', d.value)} placeholder="Enter email address" aria-invalid={!!emailError} />
                </Field>
                <PhoneField value={formData.telephone1 || ''} onChange={v => handleInputChange('telephone1', v)} />
                <Field label="Job Title" className={styles.fullWidthField}>
                  <Input className={styles.fullWidthInput} value={formData.jobtitle} onChange={(_, d) => handleInputChange('jobtitle', d.value)} placeholder="Enter job title" />
                </Field>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button appearance="primary" type="submit" disabled={isSubmitting || !formData.lastname.trim()}>{isSubmitting ? 'Creating...' : 'Create'}</Button>
                </DialogActions>
              </form>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(_, data) => setIsEditDialogOpen(data.open)}>
        <DialogSurface className={styles.narrowDialogSurface}>
          <DialogBody>
            <DialogTitle>Edit Contact</DialogTitle>
            <DialogContent>
              <form onSubmit={(e) => { e.preventDefault(); void handleSubmitEdit(); }} className={styles.contactForm}>
                <Field label="First Name" className={styles.fullWidthField}>
                  <Input className={styles.fullWidthInput} value={formData.firstname} onChange={(_, d) => handleInputChange('firstname', d.value)} placeholder="Enter first name" />
                </Field>
                <Field label="Last Name" required className={styles.fullWidthField}>
                  <Input className={styles.fullWidthInput} value={formData.lastname} onChange={(_, d) => handleInputChange('lastname', d.value)} placeholder="Enter last name" required />
                </Field>
                <Field label="Email" className={styles.fullWidthField} validationState={emailError ? 'error' : 'none'} validationMessage={emailError || undefined}>
                  <Input className={styles.fullWidthInput} type="email" value={formData.emailaddress1} onChange={(_, d) => handleInputChange('emailaddress1', d.value)} placeholder="Enter email address" aria-invalid={!!emailError} />
                </Field>
                <PhoneField value={formData.telephone1 || ''} onChange={v => handleInputChange('telephone1', v)} />
                <Field label="Job Title" className={styles.fullWidthField}>
                  <Input className={styles.fullWidthInput} value={formData.jobtitle} onChange={(_, d) => handleInputChange('jobtitle', d.value)} placeholder="Enter job title" />
                </Field>
                <DialogActions>
                  <DialogTrigger disableButtonEnhancement>
                    <Button appearance="secondary">Cancel</Button>
                  </DialogTrigger>
                  <Button appearance="primary" type="submit" disabled={isSubmitting || !formData.lastname.trim()}>{isSubmitting ? 'Updating...' : 'Update'}</Button>
                </DialogActions>
              </form>
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Contact"
        message={<><span>Are you sure you want to delete </span><strong>{deleteTarget?.fullname || 'this contact'}</strong><span>? This action cannot be undone.</span></>}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
        disabled={false}
        size="large"
        maxWidth="510px"
      />
    </BasePage>
  );
};

export default ContactsPage;
