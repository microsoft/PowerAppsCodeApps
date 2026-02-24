# Building This Demo from Scratch

This guide walks through recreating the Dataverse Demo App step by step using the PAC CLI and the official Power Apps Code Apps Vite template.

## Prerequisites

- Node.js v22 or higher
- Power Platform CLI (`pac`) authenticated to your environment

---

## Step 1: Scaffold the project

Use the official Vite template to create a new Code App:

```bash
npx degit github:microsoft/PowerAppsCodeApps/templates/vite my-dataverse-app
cd my-dataverse-app
npm install
```

This gives you a React + TypeScript + Vite project with `@microsoft/power-apps` pre-configured, including the Vite plugin that handles CORS for local development.

---

## Step 2: Initialize the Power Apps Code App

```bash
pac code init --displayname "Dataverse Demo App"
```

Follow the prompts to authenticate and select your environment. This creates `power.config.json` with your environment ID and app configuration.

---

## Step 3: Add Dataverse data sources

Use the PAC CLI to generate TypeScript services and models for each Dataverse table you want to use:

```bash
pac code add-data-source -a dataverse -t contact
pac code add-data-source -a dataverse -t account
pac code add-data-source -a dataverse -t systemuser
pac code add-data-source -a dataverse -t transactioncurrency
pac code add-data-source -a dataverse -t team
```

Each command generates:
- `src/generated/models/<Table>Model.ts` — TypeScript entity types
- `src/generated/services/<Table>Service.ts` — CRUD service (`create`, `get`, `getAll`, `update`, `delete`)
- `.power/schemas/dataverse/<table>.Schema.json` — Dataverse schema (do not edit)

> Only the `contact` and `account` tables are strictly required for CRUD. The remaining three (`systemuser`, `transactioncurrency`, `team`) are needed to resolve lookup display names.

---

## Step 4: Build the component architecture

Structure your `src/` folder with three layers:

```
src/
├── components/   ← UI only, no business logic
├── hooks/        ← State, async ops, service calls
└── generated/    ← PAC CLI output, do not edit
```

**Create components** (`src/components/`):
- `Header.tsx` — static title bar
- `Footer.tsx` — informational text
- `ErrorMessage.tsx` — conditional error banner
- `ContactCard.tsx` — single contact display with Edit/Delete
- `ContactList.tsx` — grid of cards with New Contact button
- `ContactForm.tsx` — create/edit form with lookup dropdown
- `index.ts` — barrel export

**Create hooks** (`src/hooks/`):
- `useContacts.ts` — contact CRUD, form state (create/edit/cancel)
- `useAccounts.ts` — load accounts for the managing partner dropdown
- `useLookupResolver.ts` — resolve lookup GUIDs to display names
- `index.ts` — barrel export

**Thin down `App.tsx`** to a pure composition layer — no state, no service calls, just wiring hooks to components via props.

---

## Step 5: Implement CRUD operations

In `useContacts.ts`, implement each operation using the generated service:

**Read:**
```typescript
const result = await ContactsService.getAll({
  select: ['contactid', 'firstname', 'lastname', '_msa_managingpartnerid_value'],
  orderBy: ['createdon desc'],
  top: 50,
});
```

**Create:**
```typescript
const payload: Partial<Contacts> = {
  firstname: data.firstname,
  lastname: data.lastname,
};
if (data.managingPartnerId) {
  payload['parentcustomerid_account@odata.bind'] = `/accounts(${data.managingPartnerId})`;
}
await ContactsService.create(payload);
```

**Update:**
```typescript
const updates: Partial<Contacts> = {};
if (data.jobtitle !== selected.jobtitle) updates.jobtitle = data.jobtitle;
if (data.managingPartnerId !== selected._msa_managingpartnerid_value) {
  updates['parentcustomerid_account@odata.bind'] =
    data.managingPartnerId ? `/accounts(${data.managingPartnerId})` : null;
}
await ContactsService.update(contactId, updates);
```

**Delete:**
```typescript
if (!window.confirm('Delete this contact?')) return;
await ContactsService.delete(contactId);
```

Wrap every operation in `try-catch` and expose the error via state so the UI can display it.

---

## Step 6: Implement lookup resolution

Create `useLookupResolver.ts` to resolve lookup GUIDs to readable names on-demand. The key pattern is using individual `Service.get(guid)` calls rather than loading entire tables.

See [LOOKUPS.md](./LOOKUPS.md) for the full explanation, naming conventions, and the data flow diagram.

---

## Step 7: Run and deploy

**Run locally:**
```bash
npm run dev
```

Open the **Local Play** URL from the terminal output in the same browser as your Power Platform tenant.

**Deploy to Power Apps:**
```bash
npm run build
pac code push
```

---

## Key Learnings

| Topic | Pattern used |
|-------|-------------|
| Architecture | Three layers: Components (UI) → Hooks (Logic) → Services (Data) |
| Generated services | Always use PAC CLI services — never raw fetch or axios |
| Query options | Use `select`, `top`, `orderBy` on every `getAll()` call |
| Lookup writing | `@odata.bind` syntax: `/accounts(guid)` or `null` to clear |
| Lookup reading | Store `_field_value` GUIDs; resolve to names with individual `get()` |
| Error handling | Try-catch in hooks; expose via state; display via `ErrorMessage` component |
| Type safety | TypeScript types from generated models throughout |
| Composition | `App.tsx` wires things together but owns no logic itself |

## References

- [Create an app from scratch](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/create-an-app-from-scratch)
- [Connect to Dataverse](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/how-to/connect-to-dataverse)
- [Power Platform CLI Reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/introduction)
