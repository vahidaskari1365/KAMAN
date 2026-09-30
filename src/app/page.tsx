"use client"

import { AppShell } from "@/components/kaman/app-shell"
import { useKamanStore } from "@/lib/store"
import { DashboardView } from "@/components/kaman/views/dashboard"
import { OrganizationsView } from "@/components/kaman/views/organizations"
import { ContractsView } from "@/components/kaman/views/contracts"
import { ReportsView } from "@/components/kaman/views/reports"
import { UsersView } from "@/components/kaman/views/users"
import { SettingsView } from "@/components/kaman/views/settings"
import { AnimatePresence, motion } from "framer-motion"

export default function Home() {
  const { view } = useKamanStore()

  return (
    <AppShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.25 }}
        >
          {view === "dashboard" && <DashboardView />}
          {view === "organizations" && <OrganizationsView />}
          {view === "contracts" && <ContractsView />}
          {view === "reports" && <ReportsView />}
          {view === "users" && <UsersView />}
          {view === "settings" && <SettingsView />}
        </motion.div>
      </AnimatePresence>
    </AppShell>
  )
}
