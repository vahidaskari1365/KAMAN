"use client"

import { cn } from "@/lib/utils"
import { computeStatus } from "@/lib/persian"

export function StatusBadge({
  endDate,
  status,
  className,
}: {
  endDate: string
  status: string
  className?: string
}) {
  const st = computeStatus(endDate, status)
  const toneMap: Record<string, string> = {
    success: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
    warning: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
    danger: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
    muted: "bg-muted text-muted-foreground border-border",
    destructive: "bg-rose-600/15 text-rose-700 dark:text-rose-300 border-rose-600/30",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        toneMap[st.tone],
        st.tone === "danger" && "kaman-pulse",
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {st.label}
    </span>
  )
}

export function ContractTypeBadge({
  type,
  className,
}: {
  type: string
  className?: string
}) {
  const isSupport = type === "SUPPORT"
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        isSupport
          ? "bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30"
          : "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
        className
      )}
    >
      {isSupport ? "خدمات و پشتیبانی" : "خرید / فروش"}
    </span>
  )
}

export function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    ADMIN: "bg-[#046bd2]/15 text-[#046bd2] dark:text-[#5aa9ff] border-[#046bd2]/30",
    USER: "bg-[#0096ff]/15 text-[#0096ff] dark:text-[#5aa9ff] border-[#0096ff]/30",
    VIEWER: "bg-muted text-muted-foreground border-border",
  }
  const label: Record<string, string> = {
    ADMIN: "مدیر",
    USER: "کاربر",
    VIEWER: "بیننده",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        map[role] || map.VIEWER
      )}
    >
      {label[role] || role}
    </span>
  )
}
