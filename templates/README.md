# 🪄 Power Apps code app templates

You can quickly get started with code apps by creating an app using one of our starter templates.

To do this, you can use a tool like [degit](https://github.com/Rich-Harris/degit) to scaffold your app.

Currently, the only template is the "recommended" template. Instructions to install it are below.

## Template - recommended
[recommended](recommended/README)

A React-based template with common libraries pre-configured.

```
npx degit microsoft/PowerAppsCodeApps/templates/recommended#main my-app
cd my-app

npm install

pac code init --environment [environmentId] --displayName [appDisplayName]

npm run dev
```

