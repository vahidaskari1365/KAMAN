"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  tone?: "primary" | "warning" | "danger" | "info" | "neutral"
  hint?: string
  className?: string
  onClick?: () => void
}

const toneClasses: Record<string, string> = {
  primary:
    "from-[#046bd2]/15 to-[#0096ff]/5 text-[#046bd2] dark:text-[#5aa9ff]",
  warning: "from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-300",
  danger: "from-rose-500/15 to-rose-500/5 text-rose-700 dark:text-rose-300",
  info: "from-[#0096ff]/15 to-[#0096ff]/5 text-[#0096ff] dark:text-[#5aa9ff]",
  neutral: "from-muted to-muted/5 text-muted-foreground",
}

const toneIconBg: Record<string, string> = {
  primary: "bg-[#046bd2]/20 text-[#046bd2] dark:text-[#5aa9ff]",
  warning: "bg-amber-500/20 text-amber-600 dark:text-amber-300",
  danger: "bg-rose-500/20 text-rose-600 dark:text-rose-300",
  info: "bg-[#0096ff]/20 text-[#0096ff] dark:text-[#5aa9ff]",
  neutral: "bg-muted text-muted-foreground",
}

export function StatCard({
  title,
  value,
  icon: Icon,
  tone = "primary",
  hint,
  className,
  onClick,
}: StatCardProps) {
  const clickable = !!onClick
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClick}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                onClick!()
              }
            }
          : undefined
      }
      className={cn(
        "relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 kaman-card-glow transition-all",
        toneClasses[tone],
        clickable &&
          "cursor-pointer hover:-translate-y-1 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-foreground tabular-nums">
            {value}
          </p>
          {hint && (
            <p className="mt-1 text-xs text-muted-foreground truncate">{hint}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            toneIconBg[tone]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {clickable && (
        <div className="absolute bottom-2 left-3 flex items-center gap-1 text-[10px] font-medium opacity-60">
          مشاهده
          <ArrowLeft className="h-3 w-3" />
        </div>
      )}
      <div
        className="pointer-events-none absolute -bottom-8 -left-8 h-24 w-24 rounded-full opacity-10 blur-2xl"
        style={{ background: "currentColor" }}
      />
    </motion.div>
  )
}
