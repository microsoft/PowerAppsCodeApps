import * as React from "react"

import {
  purchaseOrders as seedOrders,
  suppliers as seedSuppliers,
  type PurchaseOrder,
  type Supplier,
} from "./data"

// Session store standing in for Dataverse. Pages read through the hooks below so
// edits made in one screen are visible everywhere without a reload.
export type ProcurementState = {
  orders: PurchaseOrder[]
  suppliers: Supplier[]
}

let state: ProcurementState = {
  orders: seedOrders.map((order) => ({ ...order })),
  suppliers: seedSuppliers.map((supplier) => ({ ...supplier })),
}

const listeners = new Set<() => void>()

function setState(next: Partial<ProcurementState>) {
  state = { ...state, ...next }
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

function getSnapshot() {
  return state
}

export function useProcurement() {
  return React.useSyncExternalStore(subscribe, getSnapshot)
}

export function useOrders() {
  return useProcurement().orders
}

export function useSuppliers() {
  return useProcurement().suppliers
}

export function useOrderById(orderId?: string) {
  return useOrders().find((order) => order.id === orderId)
}

export function useSupplierById(supplierId?: string) {
  return useSuppliers().find((supplier) => supplier.id === supplierId)
}

function nextId(prefix: string, existing: string[]) {
  const highest = existing.reduce((max, id) => {
    const value = Number(id.split("-")[1])
    return Number.isFinite(value) && value > max ? value : max
  }, 0)
  return `${prefix}-${highest + 1}`
}

export function newOrderId() {
  return nextId("PO", state.orders.map((order) => order.id))
}

// Seed suppliers use name slugs, so added ones get their own numbered prefix.
export function newSupplierId() {
  return nextId("SUP", state.suppliers.map((supplier) => supplier.id))
}

export function saveOrder(order: PurchaseOrder) {
  const exists = state.orders.some((item) => item.id === order.id)
  setState({
    orders: exists
      ? state.orders.map((item) => (item.id === order.id ? order : item))
      : [order, ...state.orders],
  })
}

export function saveSupplier(supplier: Supplier) {
  const exists = state.suppliers.some((item) => item.id === supplier.id)
  setState({
    suppliers: exists
      ? state.suppliers.map((item) =>
          item.id === supplier.id ? supplier : item
        )
      : [supplier, ...state.suppliers],
  })
}
