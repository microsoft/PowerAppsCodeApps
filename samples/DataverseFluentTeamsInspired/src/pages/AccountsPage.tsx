import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Button,
    Input,
    Dialog,
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
import { accountsService } from '../Services/accountsService';
import type { accounts } from '../Models/accountsModel';
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
    accountForm: {
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
        // ~15% narrower than default ~500px
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

interface AccountFormData {
    name: string;
    accountnumber?: string;
    emailaddress1?: string;
    address1_telephone1?: string;
    websiteurl?: string;
}

const emptyAccount: AccountFormData = {
    name: '',
    accountnumber: '',
    emailaddress1: '',
    address1_telephone1: '',
    websiteurl: '',
};

export const AccountsPage: React.FC = () => {
    const styles = useStyles();
    const { isReady } = usePowerRuntime();
    const [accounts, setAccounts] = useState<accounts[]>([]);
    const [filteredAccounts, setFilteredAccounts] = useState<accounts[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearch = useDebouncedValue(searchTerm, 300);
    const [error, setError] = useState<string | null>(null);
    const { message, showSuccess, showError, clear } = useStatusMessage();

    // Form state
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [formData, setFormData] = useState<AccountFormData>(emptyAccount);
    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<accounts | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const emailError = useMemo(() => getEmailError(formData.emailaddress1), [formData.emailaddress1]);
    // Phone validation handled internally by PhoneField

    // Load accounts
    const loadAccounts = useCallback(async () => {
        if (!isReady) return;

        setLoading(true);
        setError(null);

        try {
            const result = await accountsService.getAll({
                orderBy: ['name'],
                top: 100
            });
            if (result?.success) {
                const accountsList = (result.data as accounts[]) || [];
                setAccounts(accountsList);
                setFilteredAccounts(accountsList);
            } else {
                setError('Failed to load accounts');
                setAccounts([]);
                setFilteredAccounts([]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load accounts');
            setAccounts([]);
            setFilteredAccounts([]);
        } finally {
            setLoading(false);
        }
    }, [isReady]);

    // Search filtering
    useEffect(() => {
        if (!debouncedSearch.trim()) {
            setFilteredAccounts(accounts);
        } else {
            const filtered = accounts.filter(account =>
                account.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                account.emailaddress1?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                account.address1_telephone1?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                account.websiteurl?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                account.accountnumber?.toLowerCase().includes(debouncedSearch.toLowerCase())
            );
            setFilteredAccounts(filtered);
        }
    }, [accounts, debouncedSearch]);

    // Load accounts when ready
    useEffect(() => {
        loadAccounts();
    }, [loadAccounts]);

    // Form handlers
    const handleInputChange = (field: keyof AccountFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreate = () => {
        setFormData(emptyAccount);
        setIsCreateDialogOpen(true);
    };

    const handleEdit = useCallback((account: accounts) => {
        setFormData({
            name: account.name || '',
            accountnumber: account.accountnumber || '',
            emailaddress1: account.emailaddress1 || '',
            address1_telephone1: account.address1_telephone1 || '',
            websiteurl: account.websiteurl || '',
        });
        setEditingAccountId(account.accountid || '');
        setIsEditDialogOpen(true);
    }, []);

    const promptDelete = useCallback((account: accounts) => {
        setDeleteTarget(account);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!deleteTarget?.accountid) {
            setDeleteTarget(null);
            return;
        }
        setIsDeleting(true);
        try {
            await accountsService.delete(deleteTarget.accountid);
            showSuccess('Account deleted successfully');
            setDeleteTarget(null);
            loadAccounts();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to delete account');
        } finally {
            setIsDeleting(false);
        }
    }, [deleteTarget, loadAccounts, showSuccess]);

    const handleSubmitCreate = async () => {
        if (!formData.name.trim()) {
            setError('Account name is required');
            return;
        }
        if (emailError) {
            setError('Please fix validation errors before submitting');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const prepared: AccountFormData = {
                ...formData,
                address1_telephone1: coercePhone(formData.address1_telephone1)
            };
            const result = await accountsService.create(prepared as Omit<accounts, 'accountid'>);
            if (result?.success) {
                showSuccess('Account created successfully');
                setIsCreateDialogOpen(false);
                setFormData(emptyAccount);
                // Clear search so the newly added account is visible
                setSearchTerm('');
                loadAccounts();
            } else {
                showError('Failed to create account');
            }
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to create account');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitEdit = async () => {
        if (!formData.name.trim() || !editingAccountId) {
            setError('Account name is required');
            return;
        }
        if (emailError) {
            setError('Please fix validation errors before submitting');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const prepared: AccountFormData = {
                ...formData,
                address1_telephone1: coercePhone(formData.address1_telephone1)
            };
            const result = await accountsService.update(editingAccountId, prepared);
            if (result?.success) {
                showSuccess('Account updated successfully');
                setIsEditDialogOpen(false);
                setFormData(emptyAccount);
                setEditingAccountId(null);
                loadAccounts();
            } else {
                showError('Failed to update account');
            }
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Failed to update account');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Column definitions
    const columns: TableColumnDefinition<accounts>[] = useMemo(() => [
        createTableColumn<accounts>({
            columnId: 'name',
            compare: (a, b) => (a.name || '').localeCompare(b.name || ''),
            renderHeaderCell: () => 'Name',
            renderCell: (account) => account.name || '-',
        }),
        createTableColumn<accounts>({
            columnId: 'accountnumber',
            compare: (a, b) => (a.accountnumber || '').localeCompare(b.accountnumber || ''),
            renderHeaderCell: () => 'Account Number',
            renderCell: (account) => account.accountnumber || '-',
        }),
        createTableColumn<accounts>({
            columnId: 'email',
            compare: (a, b) => (a.emailaddress1 || '').localeCompare(b.emailaddress1 || ''),
            renderHeaderCell: () => 'Email',
            renderCell: (account) => account.emailaddress1 || '-',
        }),
        createTableColumn<accounts>({
            columnId: 'phone',
            compare: (a, b) => (a.address1_telephone1 || '').localeCompare(b.address1_telephone1 || ''),
            renderHeaderCell: () => 'Phone',
            renderCell: (account) => account.address1_telephone1 || '-',
        }),
        createTableColumn<accounts>({
            columnId: 'website',
            compare: (a, b) => (a.websiteurl || '').localeCompare(b.websiteurl || ''),
            renderHeaderCell: () => 'Website',
            renderCell: (account) => account.websiteurl || '-',
        }),
        createTableColumn<accounts>({
            columnId: 'actions',
            renderHeaderCell: () => 'Actions',
            renderCell: (account) => (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Button
                        icon={<EditRegular />}
                        appearance="subtle"
                        size="small"
                        onClick={() => handleEdit(account)}
                        title="Edit"
                    />
                    <Button
                        icon={<DeleteRegular />}
                        appearance="subtle"
                        size="small"
                        onClick={() => promptDelete(account)}
                        title="Delete"
                    />
                </div>
            ),
        }),
    ], [handleEdit, promptDelete]);

    const headerContent = (
        <div className={styles.headerContainer}>
            {/* Top Row with Title + Refresh (left) and Search + New Account (right) */}
            <div className={styles.topRow}>
                <div className={styles.titleGroup}>
                    <Title1 as="h1">Accounts</Title1>
                    <Button
                        icon={<ArrowClockwiseRegular />}
                        onClick={loadAccounts}
                        disabled={loading}
                        size="small"
                        appearance="subtle"
                        aria-label="Refresh accounts"
                        title="Refresh"
                    />
                </div>
                <div className={styles.actionsGroup}>
                    <SearchBox
                        placeholder="Search accounts..."
                        value={searchTerm}
                        onChange={(_, data) => setSearchTerm(data.value)}
                        contentBefore={<SearchRegular />}
                        className={styles.searchBox}
                    />
                    <Button
                        appearance="primary"
                        icon={<AddRegular />}
                        onClick={handleCreate}
                        size="medium"
                    >
                        New Account
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
                    <Text>Loading accounts...</Text>
                </div>
            ) : filteredAccounts.length === 0 ? (
                <div className={styles.emptyState}>
                    <Text size={400}>
                        {searchTerm ? 'No accounts found matching your search.' : 'No accounts found.'}
                    </Text>
                </div>
            ) : (
                <div className={styles.gridContainer}>
                    <DataGrid
                        items={filteredAccounts}
                        columns={columns}
                        sortable
                        getRowId={(account) => account.accountid ?? crypto.randomUUID()}
                        aria-label="Accounts data grid"
                    >
                        <DataGridHeader>
                            <DataGridRow>
                                {({ renderHeaderCell }) => (
                                    <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                                )}
                            </DataGridRow>
                        </DataGridHeader>
                        <DataGridBody<accounts>>
                            {({ item, rowId }) => (
                                <DataGridRow<accounts> key={rowId}>
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
                        <DialogTitle>Create New Account</DialogTitle>
                        <DialogContent>
                            <form onSubmit={(e) => { e.preventDefault(); void handleSubmitCreate(); }} className={styles.accountForm}>
                                <Field label="Account Name" required className={styles.fullWidthField}>
                                    <Input className={styles.fullWidthInput}
                                        value={formData.name}
                                        onChange={(_, data) => handleInputChange('name', data.value)}
                                        placeholder="Enter account name" required />
                                </Field>
                                <Field label="Account Number" className={styles.fullWidthField}>
                                    <Input className={styles.fullWidthInput}
                                        value={formData.accountnumber}
                                        onChange={(_, data) => handleInputChange('accountnumber', data.value)}
                                        placeholder="Enter account number" />
                                </Field>
                                <Field label="Email" className={styles.fullWidthField} validationState={emailError ? 'error' : 'none'} validationMessage={emailError || undefined}>
                                    <Input className={styles.fullWidthInput}
                                        type="email"
                                        value={formData.emailaddress1}
                                        onChange={(_, data) => handleInputChange('emailaddress1', data.value)}
                                        placeholder="Enter email address"
                                        aria-invalid={!!emailError} />
                                </Field>
                                <PhoneField value={formData.address1_telephone1 || ''} onChange={v => handleInputChange('address1_telephone1', v)} />
                                <Field label="Website" className={styles.fullWidthField}>
                                    <Input className={styles.fullWidthInput}
                                        type="url"
                                        value={formData.websiteurl}
                                        onChange={(_, data) => handleInputChange('websiteurl', data.value)}
                                        placeholder="Enter website URL" />
                                </Field>
                                <DialogActions>
                                    <Button onClick={() => setIsCreateDialogOpen(false)} appearance="secondary">Cancel</Button>
                                    <Button appearance="primary" type="submit" disabled={isSubmitting || !formData.name.trim()}>{isSubmitting ? 'Creating...' : 'Create'}</Button>
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
                        <DialogTitle>Edit Account</DialogTitle>
                        <DialogContent>
                            <form onSubmit={(e) => { e.preventDefault(); void handleSubmitEdit(); }} className={styles.accountForm}>
                                <Field label="Account Name" required className={styles.fullWidthField}>
                                    <Input className={styles.fullWidthInput}
                                        value={formData.name}
                                        onChange={(_, data) => handleInputChange('name', data.value)}
                                        placeholder="Enter account name" required />
                                </Field>
                                <Field label="Account Number" className={styles.fullWidthField}>
                                    <Input className={styles.fullWidthInput}
                                        value={formData.accountnumber}
                                        onChange={(_, data) => handleInputChange('accountnumber', data.value)}
                                        placeholder="Enter account number" />
                                </Field>
                                <Field label="Email" className={styles.fullWidthField} validationState={emailError ? 'error' : 'none'} validationMessage={emailError || undefined}>
                                    <Input className={styles.fullWidthInput}
                                        type="email"
                                        value={formData.emailaddress1}
                                        onChange={(_, data) => handleInputChange('emailaddress1', data.value)}
                                        placeholder="Enter email address"
                                        aria-invalid={!!emailError} />
                                </Field>
                                <PhoneField value={formData.address1_telephone1 || ''} onChange={v => handleInputChange('address1_telephone1', v)} />
                                <Field label="Website" className={styles.fullWidthField}>
                                    <Input className={styles.fullWidthInput}
                                        type="url"
                                        value={formData.websiteurl}
                                        onChange={(_, data) => handleInputChange('websiteurl', data.value)}
                                        placeholder="Enter website URL" />
                                </Field>
                                <DialogActions>
                                    <Button onClick={() => setIsEditDialogOpen(false)} appearance="secondary">Cancel</Button>
                                    <Button appearance="primary" type="submit" disabled={isSubmitting || !formData.name.trim()}>{isSubmitting ? 'Updating...' : 'Update'}</Button>
                                </DialogActions>
                            </form>
                        </DialogContent>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <ConfirmDialog
                open={!!deleteTarget}
                title="Delete Account"
                message={<><span>Are you sure you want to delete </span><strong>{deleteTarget?.name || 'this account'}</strong><span>? This action cannot be undone.</span></>}
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

export default AccountsPage;
