# Power Apps Plugin

Copilot plugin for building Power Apps code apps with React and Vite.
The plugin works with both Github Copilot and Claude Code.

> Preview: This plugin is currently in preview and may change before general availability.

## What's Included

| Command             | Description                                                  |
| ------------------- | ------------------------------------------------------------ |
| `/create-power-app` | Scaffold, build, and deploy a new Power Apps code app        |
| `/add-dataverse`    | Add Dataverse tables with generated TypeScript services      |
| `/add-azuredevops`  | Add Azure DevOps connector                                   |
| `/add-teams`        | Add Teams messaging connector                                |
| `/add-excel`        | Add Excel Online (Business) connector                        |
| `/add-onedrive`     | Add OneDrive for Business connector                          |
| `/add-sharepoint`   | Add SharePoint Online connector                              |
| `/add-office365`    | Add Office 365 Outlook connector (calendar, email, contacts) |
| `/add-connector`    | Add any other Power Platform connector                       |
| `/add-datasource`   | Router that asks what to add, then delegates                 |

## Prerequisites

- [Node.js v22+](https://nodejs.org/)
- [Claude Code](https://code.claude.com/docs/en/getting-started) (`npm install -g @anthropic-ai/claude-code`) or [Github Copilot](https://github.com/features/copilot/cli/)

## Install the plugin

1. Open your copilot in any project folder:
   ```
   claude
   ```
   or
   ```
   copilot
   ```

2. Install the plugin:
   ```
   /plugin install microsoft/powerpapps-claude-plugin
   ```

## Try it

| Command             | What it does                                  |
| ------------------- | --------------------------------------------- |
| `/create-power-app` | Scaffold and deploy a new Power Apps code app |
| `/add-dataverse`    | Add a Dataverse table                         |
| `/add-sharepoint`   | Add SharePoint Online connector               |
| `/add-teams`        | Add Teams messaging connector                 |
| `/add-excel`        | Add Excel Online connector                    |
| `/add-onedrive`     | Add OneDrive connector                        |
| `/add-office365`    | Add Office 365 Outlook connector              |
| `/add-azuredevops`  | Add Azure DevOps connector                    |
| `/add-connector`    | Add any other connector                       |

Start with `/create-power-app` — it walks you through everything.

## Uninstall

```
/plugin uninstall power-apps
```


## Documentation

- [Code Apps Overview](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/overview)
- [Power Apps CLI Reference](https://learn.microsoft.com/en-us/power-platform/developer/cli/reference/code)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins-reference)
