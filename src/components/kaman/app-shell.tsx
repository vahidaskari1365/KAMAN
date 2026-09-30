"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Building2,
  FileText,
  BarChart3,
  Users,
  Settings,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  Search,
  Archive,
  ChevronLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useKamanStore, ViewKey } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/lib/use-api"

interface NavItem {
  key: ViewKey
  label: string
  icon: typeof LayoutDashboard
  description: string
}

const NAV_ITEMS: NavItem[] = [
  {
    key: "dashboard",
    label: "داشبورد",
    icon: LayoutDashboard,
    description: "نمای کلی و آمار",
  },
  {
    key: "organizations",
    label: "سازمان‌ها",
    icon: Building2,
    description: "مدیریت سازمان‌ها و شرکت‌ها",
  },
  {
    key: "contracts",
    label: "قراردادها",
    icon: FileText,
    description: "مدیریت قراردادهای خرید و پشتیبانی",
  },
  {
    key: "reports",
    label: "گزارش‌ساز",
    icon: BarChart3,
    description: "ساخت گزارش‌های فیلتر شده",
  },
  {
    key: "users",
    label: "کاربران",
    icon: Users,
    description: "تعریف و مدیریت کاربران",
  },
  {
    key: "settings",
    label: "تنظیمات",
    icon: Settings,
    description: "تنظیمات سیستم",
  },
]

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { view, setView } = useKamanStore()
  const { data: notifs } = useNotifications()
  const notifCount = notifs?.length || 0

  const go = (k: ViewKey) => {
    setView(k)
    setMobileOpen(false)
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col border-l bg-sidebar text-sidebar-foreground sticky top-0 h-screen">
        <SidebarContent view={view} go={go} notifCount={notifCount} />
      </aside>

      {/* Mobile Sheet */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="right" className="w-72 p-0">
          <SheetHeader className="px-5 py-4 border-b">
            <SheetTitle className="text-right">منوی کمان</SheetTitle>
          </SheetHeader>
          <SidebarContent view={view} go={go} notifCount={notifCount} mobile />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-1 min-w-0 flex-col">
        <Topbar onMenu={() => setMobileOpen(true)} notifCount={notifCount} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        <footer className="mt-auto border-t bg-card/50 px-6 py-4 text-center text-xs text-muted-foreground no-print">
          <span className="font-medium text-foreground">بایگانی</span>
          {"  "}© {new Date().getFullYear()} - تمامی حقوق محفوظ است
        </footer>
      </div>
    </div>
  )
}

function SidebarContent({
  view,
  go,
  notifCount,
  mobile,
}: {
  view: ViewKey
  go: (k: ViewKey) => void
  notifCount: number
  mobile?: boolean
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#046bd2] to-[#0096ff] text-white shadow-lg shadow-[#046bd2]/30">
          <Archive className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-base leading-tight">بایگانی</p>
          <p className="text-[11px] text-muted-foreground truncate">سامانه مدیریت قراردادها</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = view === item.key
          const Icon = item.icon
          return (
            <button
              key={item.key}
              onClick={() => go(item.key)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform",
                  active ? "scale-110" : "group-hover:scale-105"
                )}
              />
              <span className="flex-1 text-right">{item.label}</span>
              {item.key === "dashboard" && notifCount > 0 && (
                <Badge className="bg-rose-500 text-white hover:bg-rose-600 h-5 px-1.5 text-[10px] tabular-nums">
                  {notifCount}
                </Badge>
              )}
              {active && (
                <motion.div
                  layoutId={mobile ? "nav-active-m" : "nav-active"}
                  className="absolute right-0 h-8 w-1 rounded-full bg-primary"
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Bottom info */}
      <div className="border-t p-4">
        <div className="rounded-lg bg-gradient-to-br from-[#046bd2]/10 to-[#0096ff]/10 p-3 text-center">
          <p className="text-xs text-muted-foreground">نسخه ۱.۰.۰</p>
          <p className="text-[11px] text-muted-foreground/70 mt-0.5">
            ساخت ایران
          </p>
        </div>
      </div>
    </div>
  )
}

function Topbar({
  onMenu,
  notifCount,
}: {
  onMenu: () => void
  notifCount: number
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { globalSearch, setGlobalSearch, setView } = useKamanStore()
  const [showNotif, setShowNotif] = useState(false)
  const { data: notifs, isLoading } = useNotifications()

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/80 backdrop-blur px-4 sm:px-6 no-print">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenu}
        aria-label="منو"
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Search */}
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="جستجوی سازمان، قرارداد، شماره قرارداد..."
          value={globalSearch}
          onChange={(e) => {
            setGlobalSearch(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && globalSearch.trim()) {
              setView("contracts")
            }
          }}
          className="pr-9 h-10 bg-muted/40 border-transparent focus-visible:border-border"
        />
      </div>

      <div className="flex items-center gap-1.5">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setShowNotif((s) => !s)}
            aria-label="اعلان‌ها"
          >
            <Bell className="h-5 w-5" />
            {notifCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white kaman-pulse">
                {notifCount}
              </span>
            )}
          </Button>
          <AnimatePresence>
            {showNotif && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotif(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  className="absolute left-0 mt-2 w-80 sm:w-96 z-50 rounded-xl border bg-popover shadow-xl overflow-hidden"
                >
                  <div className="px-4 py-3 border-b bg-muted/40">
                    <p className="font-semibold text-sm">
                      قراردادهای نزدیک به پایان
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      اعلان خودکار قراردادهای رو به اتمام
                    </p>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {isLoading && (
                      <div className="p-6 text-center text-sm text-muted-foreground">
                        در حال بارگذاری...
                      </div>
                    )}
                    {!isLoading && notifs && notifs.length === 0 && (
                      <div className="p-8 text-center">
                        <Bell className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                        <p className="text-sm text-muted-foreground">
                          اعلانی وجود ندارد
                        </p>
                      </div>
                    )}
                    {!isLoading &&
                      notifs &&
                      notifs.slice(0, 8).map((n: any) => (
                        <NotifItem key={n.id} notif={n} />
                      ))}
                  </div>
                  <div className="border-t p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        setShowNotif(false)
                        setView("contracts")
                      }}
                    >
                      مشاهده همه قراردادها
                      <ChevronLeft className="mr-1 h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Theme Toggle */}
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="تغییر تم"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        )}
      </div>
    </header>
  )
}

function NotifItem({ notif }: { notif: any }) {
  const { openContract } = useKamanStore()
  const toneColor: Record<string, string> = {
    danger: "border-r-rose-500",
    warning: "border-r-amber-500",
    success: "border-r-emerald-500",
    muted: "border-r-muted",
  }
  return (
    <button
      onClick={() => {
        openContract(notif.id)
      }}
      className={cn(
        "block w-full text-right border-b border-r-4 px-4 py-3 hover:bg-muted/40 transition-colors",
        toneColor[notif.tone] || toneColor.muted
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-xs font-medium truncate">{notif.organization?.name}</span>
        <span
          className={cn(
            "text-[11px] font-bold tabular-nums",
            notif.tone === "danger" ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"
          )}
        >
          {notif.daysLeft} روز
        </span>
      </div>
      <p className="text-xs text-muted-foreground line-clamp-1">{notif.title}</p>
    </button>
  )
}
