"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useKamanStore } from "@/lib/store"

// کلیدهای query
export const qk = {
  dashboard: ["dashboard"] as const,
  organizations: (q?: string, type?: string, ct?: string) =>
    ["organizations", q, type, ct] as const,
  organization: (id: string) => ["organization", id] as const,
  contracts: (filters: Record<string, any>) => ["contracts", filters] as const,
  contract: (id: string) => ["contract", id] as const,
  contractFiles: (id: string) => ["contractFiles", id] as const,
  users: ["users"] as const,
  reports: (filters: Record<string, any>) => ["reports", filters] as const,
  notifications: ["notifications"] as const,
}

async function jsonFetch(url: string, init?: RequestInit) {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `خطای سرور (${res.status})`)
  }
  return res.json()
}

// داشبورد
export function useDashboard() {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["dashboard", refreshKey],
    queryFn: () => jsonFetch("/api/dashboard"),
  })
}

// سازمان‌ها
export function useOrganizations(q: string, type?: string, ct?: string) {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["organizations", q, type, ct, refreshKey],
    queryFn: () => {
      const params = new URLSearchParams()
      if (q) params.set("q", q)
      if (type) params.set("type", type)
      if (ct) params.set("contractType", ct)
      return jsonFetch(`/api/organizations?${params.toString()}`).then((r) => r.data)
    },
  })
}

export function useOrganization(id: string | null) {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["organization", id, refreshKey],
    queryFn: () => jsonFetch(`/api/organizations/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateOrganization() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: (data: any) =>
      jsonFetch("/api/organizations", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      refresh()
    },
  })
}

export function useUpdateOrganization() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jsonFetch(`/api/organizations/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      qc.invalidateQueries({ queryKey: ["organization", vars.id] })
      refresh()
    },
  })
}

export function useDeleteOrganization() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: (id: string) =>
      jsonFetch(`/api/organizations/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["organizations"] })
      refresh()
    },
  })
}

// قراردادها
export function useContracts(filters: Record<string, any> = {}) {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["contracts", filters, refreshKey],
    queryFn: () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) params.set(k, String(v))
      })
      return jsonFetch(`/api/contracts?${params.toString()}`).then((r) => r.data)
    },
  })
}

export function useContract(id: string | null) {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["contract", id, refreshKey],
    queryFn: () => jsonFetch(`/api/contracts/${id}`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useCreateContract() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: (data: any) =>
      jsonFetch("/api/contracts", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
      refresh()
    },
  })
}

export function useUpdateContract() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jsonFetch(`/api/contracts/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
      qc.invalidateQueries({ queryKey: ["contract", vars.id] })
      refresh()
    },
  })
}

export function useDeleteContract() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: (id: string) =>
      jsonFetch(`/api/contracts/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contracts"] })
      refresh()
    },
  })
}

// فایل‌های قرارداد
export function useContractFiles(id: string | null) {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["contractFiles", id, refreshKey],
    queryFn: () => jsonFetch(`/api/contracts/${id}/files`).then((r) => r.data),
    enabled: !!id,
  })
}

export function useUploadFiles() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: async ({
      contractId,
      files,
      category,
    }: {
      contractId: string
      files: File[]
      category?: string
    }) => {
      const fd = new FormData()
      files.forEach((f) => fd.append("files", f))
      if (category) fd.append("category", category)
      const res = await fetch(`/api/contracts/${contractId}/files`, {
        method: "POST",
        body: fd,
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || "خطا در آپلود")
      }
      return res.json()
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["contractFiles", vars.contractId] })
      qc.invalidateQueries({ queryKey: ["contract", vars.contractId] })
      refresh()
    },
  })
}

export function useDeleteFile() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/files/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("خطا در حذف فایل")
      return res.json()
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["contractFiles"] })
      qc.invalidateQueries({ queryKey: ["contract"] })
      refresh()
    },
  })
}

// کاربران
export function useUsers() {
  const { refreshKey } = useKamanStore()
  return useQuery({
    queryKey: ["users", refreshKey],
    queryFn: () => jsonFetch("/api/users").then((r) => r.data),
  })
}

export function useCreateUser() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: (data: any) =>
      jsonFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
      refresh()
    },
  })
}

export function useUpdateUser() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      jsonFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
      refresh()
    },
  })
}

export function useDeleteUser() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: (id: string) =>
      jsonFetch(`/api/users/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["users"] })
      refresh()
    },
  })
}

// گزارش‌ها
export function useReports(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["reports", filters],
    queryFn: () => {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([k, v]) => {
        if (v !== "" && v !== null && v !== undefined) params.set(k, String(v))
      })
      return jsonFetch(`/api/reports?${params.toString()}`)
    },
  })
}

// اعلان‌ها
export function useNotifications() {
  return useQuery({
    queryKey: ["notifications"],
    queryFn: () => jsonFetch("/api/notifications").then((r) => r.data),
    refetchInterval: 60000, // هر یک دقیقه
  })
}

// Seed
export function useSeed() {
  const qc = useQueryClient()
  const { refresh } = useKamanStore()
  return useMutation({
    mutationFn: () => jsonFetch("/api/seed", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries()
      refresh()
    },
  })
}
