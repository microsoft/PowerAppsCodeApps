# ⚡ Power Apps code app templates

You can quickly get started with code apps by creating an app using one of our templates.

To do this, you can use a tool like [degit](https://github.com/Rich-Harris/degit) to scaffold your app. Instructions for each of the templates are below.

We recommend using the 'starter' template for most use cases.

## Templates

### Starter (Recommended)
[templates/starter](starter/README.md)

A starter template with common libraries preinstalled, including vite, React, Tailwind, Tanstack Query, and React Router.

```
npx degit microsoft/PowerAppsCodeApps/templates/starter#main my-app
cd my-app

npm install

pac code init --environment [environmentId] --displayName [appDisplayName]

npm run dev
```

### Vite
[templates/vite](vite/README.md)

Standard, minimal vite template created with ```npm create vite@latest``` and preconfigured for Code Apps.

```
npx degit microsoft/PowerAppsCodeApps/templates/vite#main my-app
cd my-app

npm install

pac code init --environment [environmentId] --displayName [appDisplayName]

npm run dev
```
