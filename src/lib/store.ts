"use client"

import { create } from "zustand"

export type ViewKey =
  | "dashboard"
  | "organizations"
  | "contracts"
  | "reports"
  | "users"
  | "settings"

interface SelectedEntity {
  orgId?: string
  contractId?: string
}

interface KamanState {
  view: ViewKey
  setView: (v: ViewKey) => void
  selected: SelectedEntity
  openOrganization: (id: string) => void
  openContract: (id: string) => void
  clearSelected: () => void
  globalSearch: string
  setGlobalSearch: (s: string) => void
  // Refresh key برای بازخوانی داده‌ها
  refreshKey: number
  refresh: () => void
}

export const useKamanStore = create<KamanState>((set) => ({
  view: "dashboard",
  setView: (v) =>
    set(() => ({ view: v, selected: {} })),
  selected: {},
  openOrganization: (id) =>
    set(() => ({ view: "organizations", selected: { orgId: id } })),
  openContract: (id) =>
    set(() => ({ view: "contracts", selected: { contractId: id } })),
  clearSelected: () => set(() => ({ selected: {} })),
  globalSearch: "",
  setGlobalSearch: (s) => set(() => ({ globalSearch: s })),
  refreshKey: 0,
  refresh: () => set((s) => ({ refreshKey: s.refreshKey + 1 })),
}))
