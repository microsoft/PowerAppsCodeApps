/**
 * Dataverse Connector Demo App - Main Application Component
 *
 * This app demonstrates how to use Power Apps code apps with the **Microsoft Dataverse
 * connector** (shared_commondataserviceforapps) — NOT native Dataverse. The UI is identical to
 * the native Dataverse sample; only the data layer differs. It shows that anything you can build
 * with a native-Dataverse code app can also be built with a connector-based one.
 *
 * - CRUD operations (Create, Read, Update, Delete) on Contact and Account tables
 * - Lookup fields (linking Contacts to Accounts)
 * - File & image upload/download (AccountForm attachment sub-form)
 * - Advanced queries & metadata (OData query, FetchXML, GetEntities) via the connector
 * - Error handling and best practices
 *
 * ARCHITECTURE PATTERN:
 * ====================
 * The app follows a clean three-layer architecture:
 *
 * 1. COMPONENTS (Presentation Layer):
 *    - Pure presentational components (UI only, no business logic)
 *    - Receive data via props, emit events via callbacks
 *    - Examples: Header, ContactList, ContactForm, AccountList, AccountForm,
 *                ErrorMessage
 *
 * 2. HOOKS (Business Logic Layer):
 *    - Custom hooks that manage state and orchestrate connector calls
 *    - Handle error handling, loading states, and data transformations
 *    - Examples: useContacts, useAccounts, useAccountsCrud, useLookupResolver
 *
 * 3. DATA LAYER (Connector):
 *    - The connector's auto-generated MicrosoftDataverseService, wrapped by src/dataverse/client
 *    - Handles all Dataverse Web API communication through the connector
 *
 * DATA FLOW:
 * ==========
 * User Action → Component → Hook → connector client → MicrosoftDataverseService → Dataverse
 * Dataverse → MicrosoftDataverseService → client → Hook → Component → UI Update
 */

import { useState } from 'react';
import {
  Header,
  ErrorMessage,
  ContactList,
  ContactForm,
  AccountList,
  AccountForm,
  ApiActionsPanel,
} from './components';
import { useContacts, useAccounts, useAccountsCrud } from './hooks';
import './App.css';

type ActivePage = 'contacts' | 'accounts' | 'apis';

function App() {
  const [activePage, setActivePage] = useState<ActivePage>('contacts');

  // PATTERN: Custom hooks handle all the business logic and state management
  // The component stays simple and focused on rendering UI
  const {
    contacts,
    loading: contactsLoading,
    error: contactsError,
    selectedContact,
    isCreating: isCreatingContact,
    startCreate: startCreateContact,
    selectContact,
    cancelForm: cancelContactForm,
    handleFormSubmit: handleContactFormSubmit,
    deleteContact,
  } = useContacts();

  // Load accounts for the Managing Partner lookup dropdown in the Contact form
  const { accounts } = useAccounts();

  // Full CRUD hook for the Accounts page
  const {
    accounts: accountsList,
    loading: accountsLoading,
    error: accountsError,
    selectedAccount,
    isCreating: isCreatingAccount,
    startCreate: startCreateAccount,
    selectAccount,
    cancelForm: cancelAccountForm,
    handleFormSubmit: handleAccountFormSubmit,
    deleteAccount,
    loadAccounts,
  } = useAccountsCrud();

  return (
    <div className="app-container">
      {/* Header Section */}
      <Header
        title="Dataverse Connector Demo App"
        description="Demonstrating the Microsoft Dataverse connector with Power Apps Code Apps — CRUD, file storage, and Dataverse actions"
      />

      {/* Page Navigation Tabs */}
      <nav className="page-tabs">
        <button
          className={`tab-btn ${activePage === 'contacts' ? 'active' : ''}`}
          onClick={() => setActivePage('contacts')}
        >
          Contacts
        </button>
        <button
          className={`tab-btn ${activePage === 'accounts' ? 'active' : ''}`}
          onClick={() => setActivePage('accounts')}
        >
          Accounts
        </button>
        <button
          className={`tab-btn ${activePage === 'apis' ? 'active' : ''}`}
          onClick={() => setActivePage('apis')}
        >
          Functions &amp; Actions
        </button>
      </nav>

      {/* CRUD Tab */}
      {activePage === 'contacts' && (
        <>
          <div className="tab-intro">
            <h3>CRUD Operations</h3>
            <p>
              Demonstrates <strong>Create</strong>, <strong>Read</strong>, <strong>Update</strong>,
              and <strong>Delete</strong> on Contact records through the Dataverse connector's
              generated <code>MicrosoftDataverseService</code>. Lookup fields link contacts to
              accounts via OData bind syntax. Select a contact to edit, or create a new one.
            </p>
          </div>
          <ErrorMessage error={contactsError} />
          <div className="content-grid">
            <ContactList
              contacts={contacts}
              selectedContact={selectedContact}
              loading={contactsLoading}
              onSelect={selectContact}
              onCreateNew={startCreateContact}
            />
            {(isCreatingContact || selectedContact) && (
              <ContactForm
                selectedContact={selectedContact}
                isCreating={isCreatingContact}
                accounts={accounts}
                onSubmit={handleContactFormSubmit}
                onCancel={cancelContactForm}
                onDelete={deleteContact}
              />
            )}
          </div>
        </>
      )}

      {/* File Attachments Tab */}
      {activePage === 'accounts' && (
        <>
          <div className="tab-intro">
            <h3>Dataverse File &amp; Image Attachments</h3>
            <p>
              Demonstrates <strong>file upload</strong> and <strong>download</strong> on file and
              image columns through the connector's file-content operations (
              <code>UpdateEntityFileImageFieldContent</code> /{' '}
              <code>GetEntityFileImageFieldContent</code>). Select an account and scroll to the
              Attachments section to try it.
            </p>
          </div>
          <ErrorMessage error={accountsError} />
          <div className="content-grid">
            <AccountList
              accounts={accountsList}
              selectedAccount={selectedAccount}
              loading={accountsLoading}
              onSelect={selectAccount}
              onCreateNew={startCreateAccount}
            />
            {(isCreatingAccount || selectedAccount) && (
              <AccountForm
                selectedAccount={selectedAccount}
                isCreating={isCreatingAccount}
                onSubmit={handleAccountFormSubmit}
                onCancel={cancelAccountForm}
                onDelete={deleteAccount}
                onUploadSuccess={loadAccounts}
              />
            )}
          </div>
        </>
      )}

      {/* Functions & Actions Tab */}
      {activePage === 'apis' && <ApiActionsPanel />}

    </div>
  );
}

export default App;
