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

// فیلتر قراردادها که از داشبورد به صفحه‌ی قراردادها منتقل می‌شود
export interface ContractsFilterPreset {
  type?: string // PURCHASE | SUPPORT
  status?: string // ACTIVE | EXPIRED | TERMINATED | PENDING
  expiringInDays?: number
  expiredOnly?: boolean
  hasFiles?: boolean
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
  // فیلتر قراردادها برای انتقال از داشبورد
  contractsFilter: ContractsFilterPreset | null
  navigateToContracts: (filter?: ContractsFilterPreset) => void
  consumeContractsFilter: () => ContractsFilterPreset | null
}

export const useKamanStore = create<KamanState>((set, get) => ({
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
  contractsFilter: null,
  navigateToContracts: (filter) =>
    set(() => ({ view: "contracts", selected: {}, contractsFilter: filter || null })),
  consumeContractsFilter: () => {
    const f = get().contractsFilter
    set(() => ({ contractsFilter: null }))
    return f
  },
}))
