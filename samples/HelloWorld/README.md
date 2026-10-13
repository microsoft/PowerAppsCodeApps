# Getting Started 🚀

## 1. Clone this repository
This repository has the start of a TypeScript app that already includes the Power Platform SDK. Later in EAP we'll add guidance to that allows you to start from scratch without using this base app. 

```bash
git clone https://github.com/microsoft/PowerAppsCodeApps.git
cd PowerAppsCodeApps
```
## 2. Install dependencies and authenticate

```bash
cd samples/HelloWorld
npm install
pa auth login
```

## 3. Initialize the code app

```bash
pa app init --environment-id <environment-id> --display-name "Hello World"
```

## 4. Run locally

```bash
pa app run
```

## 5. Deploy to Power Apps

```bash
npm run build
pa app push
```

If successful, this command should return a Power Apps URL to run the app. 

Optionally, you can navigate to https://make.powerapps.com to see the app in the Maker Portal. You can play, share, or see details from there. 

Congratulations! You have successfully pushed your first code app! 

> [!NOTE] If you get stuck on the “fetching your app” loading screen or see an “App timed out” error screen, double check:
> 1. that you ran npm run build
> 1. there are no issues in PowerProvider.tsx
