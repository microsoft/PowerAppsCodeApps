import type { AppModule } from "@/lib/module"

import { dashboardModule } from "./dashboard/module"
import { projectsModule } from "./projects/module"
import { tasksModule } from "./tasks/module"
import { teamModule } from "./team/module"
import { crmModule } from "./crm/module"
import { procurementModule } from "./procurement/module"
import { safetyModule } from "./safety/module"
import { commsModule } from "./comms/module"
import { recruitingModule } from "./recruiting/module"
import { onboardingModule } from "./onboarding/module"
import { fieldopsModule } from "./fieldops/module"
import { settingsModule } from "./settings/module"
import { docsModule } from "./docs/module"
import { helpModule } from "./help/module"

/**
 * The single registry every part of the shell reads from: routes (App.tsx),
 * sidebar (app-sidebar.tsx) and breadcrumbs (lib/routes.ts).
 *
 * To remove an app: delete its folder under `src/app/` and delete its line
 * below. To add one: create `src/app/<id>/module.tsx` and add it here.
 * Order here is the order shown in the sidebar.
 */
export const MODULES: AppModule[] = [
  dashboardModule,
  teamModule,
  projectsModule,
  tasksModule,
  crmModule,
  procurementModule,
  safetyModule,
  commsModule,
  recruitingModule,
  onboardingModule,
  fieldopsModule,
  settingsModule,
  docsModule,
  helpModule,
]
