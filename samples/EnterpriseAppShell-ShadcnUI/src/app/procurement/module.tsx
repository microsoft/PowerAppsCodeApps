import * as React from "react"
import { ShoppingCartIcon } from "lucide-react"

import type { AppModule } from "@/lib/module"

export const procurementModule: AppModule = {
  id: "procurement",
  title: "Procurement",
  group: "apps",
  icon: <ShoppingCartIcon />,
  routes: [
    {
      path: "procurement",
      title: "Overview",
      nav: "Overview",
      element: React.lazy(() => import("./page")),
    },
    {
      path: "procurement/orders",
      title: "Purchase Orders",
      nav: "Purchase Orders",
      nested: true,
      element: React.lazy(() => import("./orders-page")),
    },
    {
      path: "procurement/orders/:orderId",
      title: "Order Details",
      element: React.lazy(() => import("./order-details-page")),
    },
    {
      path: "procurement/suppliers",
      title: "Suppliers",
      nav: "Suppliers",
      nested: true,
      element: React.lazy(() => import("./suppliers-page")),
    },
    {
      path: "procurement/suppliers/:supplierId",
      title: "Supplier Details",
      element: React.lazy(() => import("./supplier-details-page")),
    },
    {
      path: "procurement/requisitions",
      title: "Requisitions",
      nav: "Requisitions",
      element: React.lazy(() => import("./requisitions-page")),
    },
    {
      path: "procurement/invoices",
      title: "Invoices",
      nav: "Invoices",
      element: React.lazy(() => import("./invoices-page")),
    },
    {
      path: "procurement/deliveries",
      title: "Deliveries",
      nav: "Deliveries",
      element: React.lazy(() => import("./deliveries-page")),
    },
  ],
}
