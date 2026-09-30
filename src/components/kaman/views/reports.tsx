"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  BarChart3,
  Filter,
  Printer,
  Building2,
  Calendar,
  Wallet,
  Clock,
  FileImage,
  AlertTriangle,
  X,
  Download,
  FileSpreadsheet,
} from "lucide-react"
import { useReports, useOrganizations } from "@/lib/use-api"
import { useKamanStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  formatJalali,
  formatAmount,
  daysUntil,
  toPersianDigits,
} from "@/lib/persian"
import { StatusBadge, ContractTypeBadge } from "@/components/kaman/badges"
import { useKamanPrint, PAPER_SIZES } from "@/lib/use-print"

const PRESETS = [
  { id: "expiring60", label: "رو به اتمام (۲ ماه)", desc: "قراردادهای رو به پایان در ۶۰ روز آینده" },
  { id: "expiring30", label: "رو به اتمام (۱ ماه)", desc: "قراردادهای رو به پایان در ۳۰ روز آینده" },
  { id: "expired", label: "منقضی شده", desc: "قراردادهای منقضی شده" },
  { id: "allSupport", label: "همه پشتیبانی", desc: "تمام قراردادهای پشتیبانی" },
  { id: "allPurchase", label: "همه خرید", desc: "تمام قراردادهای خرید" },
  { id: "allActive", label: "فعال‌ها", desc: "تمام قراردادهای فعال" },
]

export function ReportsView() {
  const { openContract } = useKamanStore()
  const { data: orgs } = useOrganizations("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [orgId, setOrgId] = useState("")
  const [expiringDays, setExpiringDays] = useState("60")
  const [expiredOnly, setExpiredOnly] = useState(false)
  const [minAmount, setMinAmount] = useState("")
  const [maxAmount, setMaxAmount] = useState("")
  const { printRef, handlePrint, paperSize, setPaperSize } = useKamanPrint()

  const filters: Record<string, any> = {}
  if (type) filters.type = type
  if (status) filters.status = status
  if (orgId) filters.organizationId = orgId
  if (expiringDays && !expiredOnly) filters.expiringInDays = expiringDays
  if (expiredOnly) filters.expiredOnly = "1"
  if (minAmount) filters.minAmount = minAmount
  if (maxAmount) filters.maxAmount = maxAmount

  const { data: resp, isLoading } = useReports(filters)
  const reportData = resp?.data || []
  const summary = resp?.summary

  const applyPreset = (id: string) => {
    setExpiredOnly(false)
    setExpiringDays("")
    setType("")
    setStatus("")
    if (id === "expiring60") setExpiringDays("60")
    if (id === "expiring30") setExpiringDays("30")
    if (id === "expired") {
      setExpiredOnly(true)
    }
    if (id === "allSupport") {
      setType("SUPPORT")
      setStatus("ACTIVE")
    }
    if (id === "allPurchase") {
      setType("PURCHASE")
      setStatus("ACTIVE")
    }
    if (id === "allActive") {
      setStatus("ACTIVE")
    }
  }

  const reset = () => {
    setType("")
    setStatus("")
    setOrgId("")
    setExpiringDays("60")
    setExpiredOnly(false)
    setMinAmount("")
    setMaxAmount("")
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">گزارش‌ساز</h1>
          <p className="text-sm text-muted-foreground mt-1">
            با فیلترهای پیشرفته، گزارش دلخواه بسازید و پرینت بگیرید
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-muted-foreground">سایز برگه:</Label>
            <Select value={paperSize} onValueChange={(v: any) => setPaperSize(v)}>
              <SelectTrigger className="w-36 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAPER_SIZES.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="ml-1 h-4 w-4" />
            پرینت گزارش
          </Button>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            onClick={() => applyPreset(p.id)}
            title={p.desc}
            className="rounded-full border bg-card px-3 py-1.5 text-xs hover:bg-accent hover:border-primary/40 transition-all"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Filters sidebar */}
        <Card className="no-print h-fit">
          <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm flex items-center gap-2">
              <Filter className="h-4 w-4 text-emerald-500" />
              فیلترها
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={reset} className="h-7 text-xs">
              <X className="ml-1 h-3 w-3" />
              پاک کردن
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">نوع قرارداد</Label>
              <Select value={type || "ALL"} onValueChange={(v) => setType(v === "ALL" ? "" : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="همه" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه انواع</SelectItem>
                  <SelectItem value="SUPPORT">پشتیبانی</SelectItem>
                  <SelectItem value="PURCHASE">خرید / فروش</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">وضعیت</Label>
              <Select value={status || "ALL"} onValueChange={(v) => setStatus(v === "ALL" ? "" : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="همه وضعیت‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
                  <SelectItem value="ACTIVE">فعال</SelectItem>
                  <SelectItem value="EXPIRED">منقضی شده</SelectItem>
                  <SelectItem value="TERMINATED">فسخ شده</SelectItem>
                  <SelectItem value="PENDING">در انتظار</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">سازمان</Label>
              <Select value={orgId || "ALL"} onValueChange={(v) => setOrgId(v === "ALL" ? "" : v)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="همه سازمان‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه سازمان‌ها</SelectItem>
                  {orgs?.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">رو به اتمام (تعداد روز)</Label>
              <Select
                value={expiredOnly ? "EXPIRED" : expiringDays || "ALL"}
                onValueChange={(v) => {
                  if (v === "EXPIRED") {
                    setExpiredOnly(true)
                    setExpiringDays("")
                  } else if (v === "ALL") {
                    setExpiredOnly(false)
                    setExpiringDays("")
                  } else {
                    setExpiredOnly(false)
                    setExpiringDays(v)
                  }
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="همه تاریخ‌ها" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">همه تاریخ‌ها</SelectItem>
                  <SelectItem value="15">۱۵ روز آینده</SelectItem>
                  <SelectItem value="30">۱ ماه آینده</SelectItem>
                  <SelectItem value="60">۲ ماه آینده</SelectItem>
                  <SelectItem value="90">۳ ماه آینده</SelectItem>
                  <SelectItem value="180">۶ ماه آینده</SelectItem>
                  <SelectItem value="365">۱ سال آینده</SelectItem>
                  <SelectItem value="EXPIRED">فقط منقضی شده‌ها</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">حداقل مبلغ</Label>
                <Input
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  placeholder="ریال"
                  inputMode="numeric"
                  dir="ltr"
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">حداکثر مبلغ</Label>
                <Input
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                  placeholder="ریال"
                  inputMode="numeric"
                  dir="ltr"
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Report */}
        <div className="space-y-4" ref={printRef}>
          {/* Summary tiles */}
          {summary && (
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
              <SummaryTile icon={FileImage} label="تعداد قراردادها" value={toPersianDigits(summary.count)} tone="info" />
              <SummaryTile icon={Wallet} label="مبلغ کل" value={formatAmount(summary.totalAmount)} tone="primary" />
              <SummaryTile icon={AlertTriangle} label="رو به اتمام" value={toPersianDigits(summary.expiringCount)} tone="warning" />
              <SummaryTile icon={Clock} label="منقضی شده" value={toPersianDigits(summary.expiredCount)} tone="danger" />
            </div>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                نتایج گزارش
              </CardTitle>
              <CardDescription>
                {reportData.length} رکورد - مرتب بر اساس تاریخ پایان صعودی
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))}
                </div>
              ) : reportData.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  با این فیلترها قراردادی یافت نشد
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40 hover:bg-muted/40">
                        <TableHead>شماره</TableHead>
                        <TableHead>عنوان</TableHead>
                        <TableHead>سازمان</TableHead>
                        <TableHead>نوع</TableHead>
                        <TableHead>تاریخ پایان</TableHead>
                        <TableHead>روز مانده</TableHead>
                        <TableHead className="text-left">مبلغ</TableHead>
                        <TableHead>وضعیت</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reportData.map((c: any) => {
                        const days = c.daysLeft
                        return (
                          <TableRow
                            key={c.id}
                            className="cursor-pointer hover:bg-muted/30"
                            onClick={() => openContract(c.id)}
                          >
                            <TableCell className="font-mono text-xs">
                              {c.contractNumber}
                            </TableCell>
                            <TableCell className="font-medium max-w-[200px]">
                              <span className="line-clamp-1">{c.title}</span>
                            </TableCell>
                            <TableCell className="max-w-[150px]">
                              <span className="line-clamp-1 text-muted-foreground">
                                {c.organization?.name}
                              </span>
                            </TableCell>
                            <TableCell>
                              <ContractTypeBadge type={c.type} />
                            </TableCell>
                            <TableCell className="text-xs">
                              {formatJalali(c.endDate)}
                            </TableCell>
                            <TableCell>
                              <span
                                className={
                                  days < 0
                                    ? "text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums"
                                    : days <= 30
                                      ? "text-xs font-bold text-rose-600 dark:text-rose-400 tabular-nums"
                                      : days <= 60
                                        ? "text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums"
                                        : "text-xs tabular-nums"
                                }
                              >
                                {days < 0
                                  ? `منقضی (${toPersianDigits(-days)})`
                                  : toPersianDigits(days)}
                              </span>
                            </TableCell>
                            <TableCell className="text-left text-xs font-bold tabular-nums">
                              {c.amount != null ? formatAmount(c.amount) : "-"}
                            </TableCell>
                            <TableCell>
                              <StatusBadge endDate={c.endDate} status={c.status} />
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any
  label: string
  value: string | number
  tone: string
}) {
  const toneMap: Record<string, string> = {
    info: "from-[#0096ff]/10 text-[#0096ff] dark:text-[#5aa9ff]",
    primary: "from-[#046bd2]/10 text-[#046bd2] dark:text-[#5aa9ff]",
    warning: "from-amber-500/10 text-amber-700 dark:text-amber-300",
    danger: "from-rose-500/10 text-rose-700 dark:text-rose-300",
  }
  return (
    <div className={`rounded-xl border bg-gradient-to-br to-transparent p-4 ${toneMap[tone]}`}>
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
