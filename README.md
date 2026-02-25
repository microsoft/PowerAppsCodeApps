# 🚀 Power Apps code apps

Code apps let you build custom web applications that run natively within Power Apps,
using standard web technologies like React, TypeScript, and Vite alongside Power Platform
connectors and data sources.

> Code apps are generally available. See the full code apps documentation at
> [aka.ms/pacodeapps](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/).

## 🛠 Quick Start

The fastest way to start a new code app is with the `starter` template:

```sh
npx degit microsoft/PowerAppsCodeApps/templates/starter my-app
cd my-app
npm install
npm run dev
```

Then connect to data, build it, and deploy it to Power Apps following the
[code apps documentation](https://learn.microsoft.com/en-us/power-apps/developer/code-apps/).

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🤝 Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

---

## 📁 Repository Structure

### [`/templates`](./templates)
Starting points for new code app projects. Use these to scaffold a new app.

| Template | Description |
|---|---|
| [`starter`](./templates/starter) | **Recommended.** Pre-configured with React, Vite, Tailwind CSS, Tanstack Query, and React Router. Best for most apps. |
| [`vite`](./templates/vite) | Minimal Vite + React setup, pre-configured for Code Apps. Good for lightweight or custom stacks. |

> See [`templates/README.md`](./templates/README.md) for setup instructions.

---

### [`/samples`](./samples)
End-to-end example applications showing real-world patterns.

| Sample | Tech Stack | Description |
|---|---|---|
| [`HelloWorld`](./samples/HelloWorld) | React, Vite, TypeScript | Basic starter showing Power Platform SDK integration. Best first read. |
| [`FluentSample`](./samples/FluentSample) | React, Fluent UI v9, SQL, Office 365 | Full-featured app with connectors, custom API, SQL backend, and CI/CD. |
| [`StaticAssetTracker`](./samples/StaticAssetTracker) | React, Tailwind CSS, Vite | Asset tracking app demonstrating management workflows and Tailwind styling. |

---

### [`/sessions`](./sessions)
Workshop and conference session materials.

| Session | Description |
|---|---|
| [`ppcc2025`](./sessions/ppcc2025) | Materials from the Power Platform Community Conference 2025. |

---

### [`/tests`](./tests)
End-to-end tests for the templates, using [Playwright](https://playwright.dev/).

| File | Description |
|---|---|
| [`e2e/starter.spec.ts`](./tests/e2e/starter.spec.ts) | E2E tests for the `starter` template. |
| [`e2e/vite.spec.ts`](./tests/e2e/vite.spec.ts) | E2E tests for the `vite` template. |
| [`playwright.config.ts`](./tests/playwright.config.ts) | Playwright configuration. |

---

### [`/docs/assets`](./docs/assets)
Images and static assets used in documentation.

---

