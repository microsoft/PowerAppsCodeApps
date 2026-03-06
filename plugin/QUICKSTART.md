# Quick Start Guide

Build and deploy a web app to Microsoft Power Platform using just your coding Copilot. No Power Apps knowledge needed.

---

## Step 1 — Install Prerequisites

You need two tools installed before starting:

**Node.js v22 or higher**
Download from [nodejs.org](https://nodejs.org). After installing, verify:
```
node --version   # should print v22.x.x or higher
```

**@microsoft/power-apps-cli** (Power Apps command-line tool)
Install via npm:
```
npm install -g @microsoft/power-apps-cli
```
After installing, verify:
```
power-apps
```

---

## Step 2 — Install the Plugin

This plugin works with Github Copilot and Claude Code.
The commands are the same for both — just run the one for your tool of choice. You only need to do this once to install the plugin; it will be available in all your projects.

Run `copilot` or `claude` in any folder to open your tool, then copy/paste the command below.

```cmd
/plugin install microsoft/powerpapps-claude-plugin
```
---

## Step 3 — Build Your First App

Navigate to the folder where you want your project created, then run:

```
/create-power-app
```

Your copilot will ask what you want to build in plain English — describe your app, and it handles the rest. At the end, you'll get a link to open your app in Power Apps.

---

## Dive Deeper
 This section contains tips for working with the plugin, connecting data sources, and troubleshooting.

### Connect Your Data

Ideally you will never need to run any of these commands below. Your copilot should know which data sources you need based on your app description and automatically add them as needed. 

But if you want to be explicit, or add new features later, you can run these commands to connect your app to data and services.

Run `/add-datasource` and copilot will recommend the right data source — or go directly:

| What you want to do            | Command            |
| ------------------------------ | ------------------ |
| Store custom business data     | `/add-dataverse`   |
| Read/write SharePoint lists    | `/add-sharepoint`  |
| Read/write an Excel workbook   | `/add-excel`       |
| Upload or download files       | `/add-onedrive`    |
| Send emails or manage calendar | `/add-office365`   |
| Send Teams messages            | `/add-teams`       |
| Query Azure DevOps work items  | `/add-azuredevops` |
| Invoke a Copilot Studio agent  | `/add-mcscopilot`  |
| Something else                 | `/add-connector`   |

Run any command from inside your project folder. Copilot adds the connector and writes the integration code for you.

### Picking Up Where You Left Off

Copilot saves a `memory-bank.md` file in your project after the first deploy. Start a new session in the same folder and Copilot will resume automatically.

### Redeploying Your App

Ask your copilot to deploy your app, or run this from inside your project folder:

```
/deploy
```

Copilot will build the app and push it to Power Platform automatically.

### Troubleshooting

| Problem                        | Fix                                                                                           |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `power-apps` command not found | Run `npm install -g @microsoft/power-apps-cli`, then open a new terminal.                     |
| Build errors                   | Run `npm install` in your project folder, then retry.                                         |
| App not showing in Power Apps  | Wait 1–2 minutes after deploy, then refresh [make.powerapps.com](https://make.powerapps.com). |
| Node.js version error          | Run `node --version` — must be v22+. Upgrade if needed.                                       |

### Uninstall

```
/plugin uninstall power-apps
```
