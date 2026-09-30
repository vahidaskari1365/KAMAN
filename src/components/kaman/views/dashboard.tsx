"use client"

import { motion } from "framer-motion"
import {
  Building2,
  FileText,
  Clock,
  AlertTriangle,
  TrendingUp,
  HardDrive,
  Wallet,
  Activity,
  ArrowLeft,
} from "lucide-react"
import { useDashboard, useSeed } from "@/lib/use-api"
import { useKamanStore } from "@/lib/store"
import { StatCard } from "@/components/kaman/stat-card"
import { StatusBadge, ContractTypeBadge } from "@/components/kaman/badges"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { formatJalali, formatJalaliLong, formatAmount, daysUntil, toPersianDigits } from "@/lib/persian"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"

export function DashboardView() {
  const resp = useDashboard()
  const data = resp.data?.data
  const dbError = resp.data?.error
  const isLoading = resp.isLoading
  const { setView, openContract, openOrganization, navigateToContracts } = useKamanStore()
  const { refresh } = useKamanStore()

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-72 rounded-xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    )
  }

  // اگر خطای دیتابیس رخ داد، به‌جای صفحه‌ی خالی پیغام خطا + راهنما نشان بده
  if (dbError || !data) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-sm text-muted-foreground mt-1">نمای کلی سامانه</p>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl border-2 border-dashed border-rose-500/40 bg-rose-500/5 p-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/15">
              <AlertTriangle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold text-base">اتصال به دیتابیس برقرار نشد</h3>
              <p className="text-sm text-muted-foreground mt-1 break-words" dir="ltr">
                {dbError || "خطای ناشناخته"}
              </p>
              <div className="mt-3 rounded-lg bg-card border p-3 text-sm space-y-2">
                <p className="font-medium">راه‌حل برای Vercel:</p>
                <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs">
                  <li>در پروژه‌ی Vercel به تب <b>Storage</b> بروید.</li>
                  <li>روی <b>Create Database → Postgres (Neon)</b> کلیک و یک DB رایگان بسازید.</li>
                  <li>آن را به پروژه‌ی خود <b>Connect</b> کنید (Vercel خودکار <code>DATABASE_URL</code> را می‌سازد).</li>
                  <li>تب <b>Deployments → Redeploy</b> بزنید. جدول‌ها و داده‌های نمونه خودکار ساخته می‌شوند.</li>
                </ol>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" variant="default" onClick={() => refresh()}>
                  <Activity className="ml-1 h-4 w-4" />
                  تلاش دوباره
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  const pieData = [
    { name: "خرید / فروش", value: data.purchaseContracts, color: "var(--chart-2)" },
    { name: "خدمات و پشتیبانی", value: data.supportContracts, color: "var(--chart-1)" },
  ]
  const statusData = data.contractsByStatus.map((s) => ({
    name: statusLabel(s.status),
    تعداد: s.count,
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">داشبورد</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {formatJalaliLong(new Date())} - نمای کلی سامانه بایگانی کمان
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setView("reports")}>
          ساخت گزارش
          <ArrowLeft className="mr-1 h-4 w-4" />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="کل سازمان‌ها"
          value={toPersianDigits(data.totalOrganizations)}
          icon={Building2}
          tone="primary"
          hint="سازمان‌های ثبت شده"
          onClick={() => setView("organizations")}
        />
        <StatCard
          title="کل قراردادها"
          value={toPersianDigits(data.totalContracts)}
          icon={FileText}
          tone="info"
          hint={`${formatAmount(data.totalAmount)} مبلغ کل`}
          onClick={() => navigateToContracts({})}
        />
        <StatCard
          title="قراردادهای فعال"
          value={toPersianDigits(data.activeContracts)}
          icon={Activity}
          tone="success"
          hint={`${toPersianDigits(data.purchaseContracts)} خرید / ${toPersianDigits(data.supportContracts)} پشتیبانی`}
          onClick={() => navigateToContracts({ status: "ACTIVE" })}
        />
        <StatCard
          title="رو به اتمام"
          value={toPersianDigits(data.expiringContracts)}
          icon={Clock}
          tone="warning"
          hint="کمتر از ۶۰ روز"
          onClick={() => navigateToContracts({ expiringInDays: 60 })}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="منقضی شده"
          value={toPersianDigits(data.expiredContracts)}
          icon={AlertTriangle}
          tone="danger"
          hint="تاریخ پایان گذشته"
          onClick={() => navigateToContracts({ expiredOnly: true })}
        />
        <StatCard
          title="فایل‌های آپلودی"
          value={toPersianDigits(data.totalFiles)}
          icon={HardDrive}
          tone="neutral"
          hint="فایل‌های اسکن شده"
          onClick={() => navigateToContracts({ hasFiles: true })}
        />
        <StatCard
          title="مبلغ کل قراردادها"
          value={formatAmount(data.totalAmount)}
          icon={Wallet}
          tone="primary"
          onClick={() => navigateToContracts({})}
        />
        <StatCard
          title="میانگین مبلغ"
          value={formatAmount(
            data.totalContracts ? data.totalAmount / data.totalContracts : 0
          )}
          icon={TrendingUp}
          tone="info"
          onClick={() => setView("reports")}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">ترکیب قراردادها</CardTitle>
            <CardDescription>توزیع بر اساس نوع</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {pieData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: 12 }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">وضعیت قراردادها</CardTitle>
            <CardDescription>بر اساس وضعیت فعلی</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData} margin={{ left: 0, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "var(--muted)" }}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--border)",
                    background: "var(--popover)",
                    color: "var(--popover-foreground)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="تعداد" fill="var(--chart-1)" radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Expiring + Recent */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                قراردادهای رو به اتمام
              </CardTitle>
              <CardDescription>کمتر از ۶۰ روز تا پایان</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("contracts")}
            >
              همه
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-80 overflow-y-auto">
              {data.expiringList.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  قرارداد رو به اتمامی وجود ندارد
                </div>
              )}
              {data.expiringList.slice(0, 6).map((c) => {
                const days = daysUntil(c.endDate)
                return (
                  <button
                    key={c.id}
                    onClick={() => openContract(c.id)}
                    className="flex w-full items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40 transition-colors text-right"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{c.title}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {c.organization?.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <ContractTypeBadge type={c.type} />
                      <span
                        className={
                          days <= 30
                            ? "text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums"
                            : "text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums"
                        }
                      >
                        {toPersianDigits(days)} روز
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#046bd2]" />
                قراردادهای اخیر
              </CardTitle>
              <CardDescription>آخرین قراردادهای ثبت شده</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("contracts")}
            >
              همه
              <ArrowLeft className="mr-1 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y max-h-80 overflow-y-auto">
              {data.recentContracts.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  قراردادی ثبت نشده است
                </div>
              )}
              {data.recentContracts.map((c) => (
                <button
                  key={c.id}
                  onClick={() => openContract(c.id)}
                  className="flex w-full items-center justify-between gap-3 px-5 py-3 hover:bg-muted/40 transition-colors text-right"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {c.organization?.name} • شماره {c.contractNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <ContractTypeBadge type={c.type} />
                    <StatusBadge endDate={c.endDate} status={c.status} />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seed CTA if empty */}
      {data.totalOrganizations === 0 && (
        <EmptyState />
      )}
    </div>
  )
}

function EmptyState() {
  const seed = useSeed()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-2xl border-2 border-dashed border-[#046bd2]/30 bg-[#046bd2]/5 p-8 text-center"
    >
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#046bd2]/15">
        <FileText className="h-8 w-8 text-[#046bd2] dark:text-[#5aa9ff]" />
      </div>
      <h3 className="text-lg font-bold">به سامانه بایگانی کمان خوش آمدید</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
        هنوز داده‌ای در سیستم ثبت نشده است. می‌توانید با یک کلیک داده‌های نمونه
        شامل سازمان‌ها و قراردادها را ایجاد کنید تا با امکانات آشنا شوید.
      </p>
      <Button
        className="mt-5"
        disabled={seed.isPending}
        onClick={() => seed.mutate()}
      >
        {seed.isPending ? "در حال ایجاد..." : "ایجاد داده‌های نمونه"}
      </Button>
    </motion.div>
  )
}

function statusLabel(s: string) {
  const m: Record<string, string> = {
    ACTIVE: "فعال",
    EXPIRED: "منقضی",
    TERMINATED: "فسخ شده",
    PENDING: "در انتظار",
  }
  return m[s] || s
}
