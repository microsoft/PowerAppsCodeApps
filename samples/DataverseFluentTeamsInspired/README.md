# Code App Dataverse (React + Vite)

Power Platform “code app” built with React + TypeScript + Vite and Fluent UI v9. Look and feel inspired by Microsoft Teams.  It integrates with:

- Dataverse tables (contacts, accounts)
- Office 365 Users connector (profile/photo)

## Prerequisites

- Node.js LTS (v18+ recommended)
- Power Platform CLI (pac)
- Optional: Power Platform Tools for VS Code

## Get started

Follow these steps the first time you clone the repo so the app is created in YOUR target environment.

1. Install dependencies (use legacy peer deps to avoid conflicts):

```powershell
npm install --legacy-peer-deps
```

1. Sign in & select environment:

```powershell
pac auth who            # shows current authenticated user & default environment
pac auth create         # run only if you are not signed in yet
pac env list            # list available environments (Name, Environment ID)
pac env select --environment <environmentId or partial name>
pac auth who            # verify the correct environment is now active
```

1. Configure `power.config.json`:

- Ensure `appId` is an empty string: `"appId": ""` (blank forces creation of a new app record on first push)
- Set `environmentId` to the GUID of the environment you just selected (from `pac env list` output)
- Replace the `instanceUrl` under `databaseReferences.default.cds.instanceUrl` with YOUR Dataverse org URL (e.g. `https://<env-name>.crm.dynamics.com/`) so it matches the environment you selected.
- Leave the remaining values as-is for now

1. Build the app (required before first push so the dist folder exists):

```powershell
npm run build
```

1. Push the app to create/register it in the environment (this will assign a new `appId` automatically):

```powershell
pac code push
```

  After a successful push you can (optionally) copy the generated `appId` back into `power.config.json` if the CLI does not update it automatically.

1. Run locally (starts the Local Player runtime + Vite dev server):

```powershell
npm run dev
```

If you change the target environment later, blank out `appId` again and update `environmentId`, then run `pac code push` before using `npm run dev`.

## Build

```powershell
npm run build
```

## Troubleshooting

- Install issues: always use `npm install --legacy-peer-deps` in this repo.
