# Lookup Fields

## Overview

Dataverse lookup fields store a reference (GUID) to a record in another table. This document explains how to read them, write them, and display their values efficiently — covering both sides of the relationship.

This app demonstrates five lookup fields on the `contact` entity:

| Field (read name) | Points to | Writable? |
|-------------------|-----------|-----------|
| `_createdby_value` | `systemuser` | No (system-managed) |
| `_transactioncurrencyid_value` | `transactioncurrency` | Yes |
| `_parentcontactid_value` | `contact` (self-referential) | Yes |
| `_msa_managingpartnerid_value` | `account` | Yes |
| `_owningteam_value` | `team` | No (system-managed) |

---

## Naming Conventions

Dataverse uses different field name formats depending on whether you are reading or writing.

### Reading (GET responses)

Lookup values come back as `_<schemaname>_value` containing the related record's GUID:

```
_createdby_value              → GUID of the SystemUser who created the record
_transactioncurrencyid_value  → GUID of the TransactionCurrency
_msa_managingpartnerid_value  → GUID of the managing Account
_parentcontactid_value        → GUID of the parent Contact
_owningteam_value             → GUID of the owning Team
```

### Writing (POST / PATCH requests)

Use OData bind syntax to set a lookup relationship:

```typescript
// Format: "<SchemaName>@odata.bind": "/<entitysetname>(<guid>)"
contact['parentcustomerid_account@odata.bind'] = `/accounts(${accountId})`;
contact['TransactionCurrencyId@odata.bind'] = `/transactioncurrencies(${currencyId})`;

// Clear a lookup by setting it to null
updates['parentcustomerid_account@odata.bind'] = null;
```

---

## Efficient Lookup Resolution

When displaying a contact, you need to show a human-readable name for each lookup GUID. There are two approaches — one efficient, one not.

### ❌ Inefficient: load entire tables upfront

```typescript
// Bad — fetches thousands of records you don't need
const allUsers = await SystemusersService.getAll();
const allCurrencies = await TransactioncurrenciesService.getAll();
const allTeams = await TeamsService.getAll();

// Then filter client-side to find the match
const user = allUsers.find(u => u.systemuserid === contact._createdby_value);
```

**Problems:** Loads entire tables into memory, slow initial load, breaks with large datasets.

### ✅ Efficient: fetch the specific record on-demand

```typescript
// Good — fetch only the one record you need
if (contact._createdby_value) {
  const result = await SystemusersService.get(
    contact._createdby_value,
    { select: ['systemuserid', 'fullname'] }
  );
  const createdByName = result.value?.fullname;
}
```

**Benefits:** Minimal network payload, scales to any dataset size, only resolves what's visible.

### Performance comparison — 50 contacts with 5 lookup fields each

| Approach | API Requests | Data transferred |
|----------|-------------|-----------------|
| Load all tables upfront | 5 large requests | All users + all currencies + all teams + ... |
| On-demand individual `get()` | 1 + N targeted requests | Only the specific records needed |

With pagination, on-demand resolution becomes even more efficient — you only fetch lookups for visible contacts.

---

## Implementation

### Step 1: Fetch contacts with lookup GUID fields

Include the `_<field>_value` names in your `select` list. These contain the GUIDs you'll use to resolve display names later.

```typescript
// src/hooks/useContacts.ts
const result = await ContactsService.getAll({
  select: [
    'contactid', 'firstname', 'lastname', 'emailaddress1', 'telephone1',
    '_createdby_value',
    '_transactioncurrencyid_value',
    '_parentcontactid_value',
    '_msa_managingpartnerid_value',
    '_owningteam_value',
  ],
  orderBy: ['createdon desc'],
  top: 50,
});
```

> **Note:** Do not use `$expand` to eagerly load related records. The on-demand `get()` pattern is preferred.

### Step 2: Resolve GUIDs to display names (`useLookupResolver`)

The `useLookupResolver` hook takes a contact and resolves all its lookup GUIDs in parallel:

```typescript
// src/hooks/useLookupResolver.ts
export function useLookupResolver(contact: Contacts | null) {
  const [resolvedLookups, setResolvedLookups] = useState<ResolvedLookups>({
    createdBy: '',
    currency: '',
    parentContact: '',
    managingPartner: '',
    owningTeam: '',
  });

  useEffect(() => {
    if (!contact) return;

    async function resolveLookups() {
      const resolved: ResolvedLookups = { createdBy: '', currency: '', ... };

      // Run all lookups in parallel for performance
      await Promise.all([
        contact._createdby_value &&
          SystemusersService.get(contact._createdby_value, { select: ['fullname'] })
            .then(r => { resolved.createdBy = r.value?.fullname ?? ''; }),

        contact._transactioncurrencyid_value &&
          TransactioncurrenciesService.get(contact._transactioncurrencyid_value, { select: ['currencyname'] })
            .then(r => { resolved.currency = r.value?.currencyname ?? ''; }),

        // ... other lookups
      ]);

      setResolvedLookups(resolved);
    }

    resolveLookups();
  }, [contact]);

  return { resolvedLookups, loading };
}
```

### Step 3: Display in the component

```typescript
// src/components/ContactCard.tsx
export function ContactCard({ contact, onEdit, onDelete }: ContactCardProps) {
  const { resolvedLookups, loading } = useLookupResolver(contact);

  return (
    <div className="contact-card">
      <h3>{contact.firstname} {contact.lastname}</h3>

      {resolvedLookups.createdBy && (
        <p className="lookup-field">
          <span className="lookup-label">Created By:</span>{' '}
          {loading ? 'Loading...' : resolvedLookups.createdBy}
        </p>
      )}

      {resolvedLookups.managingPartner && (
        <p className="lookup-field">
          <span className="lookup-label">Managing Partner:</span>{' '}
          {resolvedLookups.managingPartner}
        </p>
      )}
    </div>
  );
}
```

---

## Data Flow

```
ContactsService.getAll()
  Returns contacts with GUID values:
    _createdby_value: "abc-123"
    _msa_managingpartnerid_value: "def-456"
    ...
         │
         ▼
ContactCard receives contact with GUIDs
         │
         ▼
useLookupResolver(contact) runs in useEffect
         │
         ├──► SystemusersService.get("abc-123")     → { fullname: "Jane Doe" }
         ├──► TransactioncurrenciesService.get(...)  → { currencyname: "USD" }
         ├──► ContactsService.get(...)               → { fullname: "Bob Smith" }
         ├──► AccountsService.get("def-456")         → { name: "Contoso" }
         └──► TeamsService.get(...)                  → { name: "Sales Team" }
         │
         ▼
resolvedLookups state updates
         │
         ▼
ContactCard re-renders with display names
```

---

## Adding a New Lookup Field

### 1. Add the data source (if not already added)

```bash
pac code add-data-source -a dataverse -t <table-logical-name>
```

This generates `src/generated/services/<Table>Service.ts` and `src/generated/models/<Table>Model.ts`.

### 2. Add the GUID to the `useContacts` select list

```typescript
select: [
  ...existingFields,
  '_newlookupfield_value',  // Add this
]
```

### 3. Extend the `ResolvedLookups` interface

```typescript
export interface ResolvedLookups {
  createdBy: string;
  currency: string;
  parentContact: string;
  managingPartner: string;
  owningTeam: string;
  newField: string;  // Add this
}
```

### 4. Add the fetch logic in `useLookupResolver`

```typescript
contact._newlookupfield_value &&
  NewTableService.get(contact._newlookupfield_value, { select: ['id', 'name'] })
    .then(r => { resolved.newField = r.value?.name ?? ''; }),
```

### 5. Display it in `ContactCard`

```typescript
{resolvedLookups.newField && (
  <p className="lookup-field">
    <span className="lookup-label">New Field:</span>{' '}
    {resolvedLookups.newField}
  </p>
)}
```

---

## Data Sources Added for This Demo

These PAC CLI commands were used to generate the services and models used by the lookup resolver:

```bash
pac code add-data-source -a dataverse -t contact
pac code add-data-source -a dataverse -t account
pac code add-data-source -a dataverse -t systemuser
pac code add-data-source -a dataverse -t transactioncurrency
pac code add-data-source -a dataverse -t team
```

---

## Common Pitfalls

| ❌ Don't | ✅ Do instead |
|----------|--------------|
| Load all records from a related table | Use `Service.get(guid)` for the specific record |
| Use `$expand` to eagerly load lookups | Select the `_field_value` GUID and resolve on-demand |
| Filter a full in-memory array to find a match | Fetch by ID directly from the service |
| Request all fields from a service | Use `select` to get only the display field you need |

---

## Summary

- Lookup fields return a GUID via `_<schemaname>_value` when reading
- Use `@odata.bind` syntax to write or update a lookup relationship
- Resolve GUIDs to display names on-demand using individual `Service.get()` calls
- The `useLookupResolver` hook encapsulates this pattern and runs all lookups in parallel
- Always `select` only the fields you need to minimize payload size
