import { HashRouter, Route, Routes } from 'react-router'

import { MODULES } from '@/app/modules'
import { AppLayout } from '@/components/layout/app-layout'
import { NotFound } from '@/components/layout/not-found'

// Routes are declared per module in `src/app/<module>/module.tsx` and collected
// by `src/app/modules.ts`. Each page is lazy-loaded there, so the initial bundle
// only carries the shell; AppLayout wraps its <Outlet /> in a Suspense boundary.
const routes = MODULES.flatMap((module) => module.routes)

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {routes.map(({ path, element: Page }) =>
            path === '' ? (
              <Route key="index" index element={<Page />} />
            ) : (
              <Route key={path} path={path} element={<Page />} />
            )
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
