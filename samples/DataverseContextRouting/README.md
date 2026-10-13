# Dataverse Context Routing

This sample reuses the native [Dataverse sample](../Dataverse) and chooses its initial table from
the query parameters returned by `getContext()`.

## Supported parameters

Pass either `table` or `page` when opening the app:

| Query parameter | Initial table |
| --- | --- |
| `table=contact` or `table=contacts` | Contacts |
| `table=account` or `table=accounts` | Accounts |
| `table=systemuser`, `table=systemusers`, or `table=users` | System Users |

Unknown or missing values default to Contacts. Users can switch tables with the dropdown after
the app opens.

```typescript
const context = await getContext();
const requestedPage = context.app.queryParams.table ?? context.app.queryParams.page;
```

## Run the sample

```bash
npm install
pa auth login
pa app init --environment-id <environment-id> --display-name "Dataverse Context Routing"
pa app add data-source --connector dataverse --table contact
pa app add data-source --connector dataverse --table account
pa app add data-source --connector dataverse --table systemuser
pa app add data-source --connector dataverse --table transactioncurrency
pa app add data-source --connector dataverse --table team
pa app run
```

The five `add data-source` commands generate every model and service imported by this sample.
Generated files under `src/generated/`, `.power/`, and `power.config.json` are not committed
because they contain environment-specific metadata. Run the complete setup above before building
or running the sample after cloning the repository.

Deploy with:

```bash
npm run build
pa app push
```

The generated Dataverse services, hooks, and components follow the same architecture as the
original Dataverse sample. The routing behavior is isolated in
[`src/hooks/useContextPage.ts`](src/hooks/useContextPage.ts).
