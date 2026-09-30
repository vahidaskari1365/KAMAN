"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
  FileText,
  Plus,
  Search,
  Filter,
  Building2,
  Calendar,
  AlertTriangle,
  X,
  Paperclip,
} from "lucide-react"
import { useContracts } from "@/lib/use-api"
import { useKamanStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import {
  formatJalali,
  formatAmount,
  daysUntil,
  toPersianDigits,
} from "@/lib/persian"
import { StatusBadge, ContractTypeBadge } from "@/components/kaman/badges"
import { ContractDetail } from "./contract-detail"
import { ContractForm } from "./contract-form"

export function ContractsView() {
  const { selected, clearSelected, globalSearch, setGlobalSearch } = useKamanStore()
  // خواندن preset از store در زمان mount (نقل از داشبورد)
  const [preset] = useState(() => useKamanStore.getState().contractsFilter)
  useEffect(() => {
    useKamanStore.setState({ contractsFilter: null })
  }, [])

  const [typeFilter, setTypeFilter] = useState(preset?.type || "ALL")
  const [statusFilter, setStatusFilter] = useState(preset?.status || "ALL")
  const [expiringDays, setExpiringDays] = useState(
    preset?.expiringInDays ? String(preset.expiringInDays) : "0"
  )
  const [expiredOnly, setExpiredOnly] = useState(!!preset?.expiredOnly)
  const [hasFiles, setHasFiles] = useState(!!preset?.hasFiles)
  const [formOpen, setFormOpen] = useState(false)

  // انتخاب ترکیبی بازه زمانی: عدد = رو به اتمام، "EXPIRED" = منقضی شده
  const dateRange = expiredOnly ? "EXPIRED" : expiringDays

  const setDateRange = (v: string) => {
    if (v === "EXPIRED") {
      setExpiredOnly(true)
      setExpiringDays("0")
    } else {
      setExpiredOnly(false)
      setExpiringDays(v)
    }
  }

  const q = globalSearch.trim()

  const filters: Record<string, any> = {}
  if (q) filters.q = q
  if (typeFilter !== "ALL") filters.type = typeFilter
  if (statusFilter !== "ALL") filters.status = statusFilter
  if (expiringDays !== "0") filters.expiringInDays = expiringDays
  if (expiredOnly) filters.expiredOnly = "1"
  if (hasFiles) filters.hasFiles = "1"

  const { data, isLoading } = useContracts(filters)

  // اگر قرارداد انتخاب شده، جزئیات را نشان بده
  if (selected.contractId) {
    return <ContractDetail id={selected.contractId} onBack={clearSelected} />
  }

  const clearFilters = () => {
    setGlobalSearch("")
    setTypeFilter("ALL")
    setStatusFilter("ALL")
    setExpiringDays("0")
    setExpiredOnly(false)
    setHasFiles(false)
  }

  const hasFilters =
    q ||
    typeFilter !== "ALL" ||
    statusFilter !== "ALL" ||
    expiringDays !== "0" ||
    expiredOnly ||
    hasFiles

  // عنوان صفحه بر اساس preset
  const pageTitle = expiredOnly
    ? "قراردادهای منقضی شده"
    : preset?.expiringInDays
      ? `قراردادهای رو به اتمام (${toPersianDigits(preset.expiringInDays!)} روز)`
      : preset?.hasFiles
        ? "قراردادهای دارای فایل"
        : preset?.status === "ACTIVE"
          ? "قراردادهای فعال"
          : "قراردادها"

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت قراردادهای خرید و پشتیبانی
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="ml-1 h-4 w-4" />
          قرارداد جدید
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="جستجوی عنوان، شماره قرارداد، توضیحات یا نام سازمان..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="نوع" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه انواع</SelectItem>
                <SelectItem value="SUPPORT">پشتیبانی</SelectItem>
                <SelectItem value="PURCHASE">خرید / فروش</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <SelectValue placeholder="وضعیت" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
                <SelectItem value="ACTIVE">فعال</SelectItem>
                <SelectItem value="EXPIRED">منقضی شده</SelectItem>
                <SelectItem value="TERMINATED">فسخ شده</SelectItem>
                <SelectItem value="PENDING">در انتظار</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-44">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <SelectValue placeholder="بازه زمانی" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">همه تاریخ‌ها</SelectItem>
                <SelectItem value="15">۱۵ روز آینده</SelectItem>
                <SelectItem value="30">۱ ماه آینده</SelectItem>
                <SelectItem value="60">۲ ماه آینده</SelectItem>
                <SelectItem value="90">۳ ماه آینده</SelectItem>
                <SelectItem value="EXPIRED">منقضی شده‌ها</SelectItem>
              </SelectContent>
            </Select>
            <Toggle
              pressed={hasFiles}
              onPressedChange={setHasFiles}
              aria-label="فقط دارای فایل"
              className="h-9 gap-1.5"
            >
              <Paperclip className="h-4 w-4" />
              دارای فایل
            </Toggle>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="ml-1 h-4 w-4" />
                پاک کردن
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Result count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {data?.length || 0} قرارداد یافت شد
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-[#046bd2]/30 bg-[#046bd2]/5 p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#046bd2]/15">
            <FileText className="h-8 w-8 text-[#046bd2] dark:text-[#5aa9ff]" />
          </div>
          <h3 className="text-lg font-bold">قراردادی یافت نشد</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            با فیلترهای فعلی قراردادی وجود ندارد. می‌توانید قرارداد جدید ایجاد کنید.
          </p>
          <Button className="mt-4" onClick={() => setFormOpen(true)}>
            <Plus className="ml-1 h-4 w-4" />
            قرارداد جدید
          </Button>
        </div>
      ) : (
        <div className="grid gap-3">
          {data?.map((c: any, i: number) => {
            const days = daysUntil(c.endDate)
            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className="group hover:shadow-md transition-all cursor-pointer"
                  onClick={() => useKamanStore.getState().openContract(c.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm">
                            {c.title}
                          </span>
                          <ContractTypeBadge type={c.type} />
                          <StatusBadge endDate={c.endDate} status={c.status} />
                          {c._count?.files > 0 && (
                            <Badge variant="outline" className="text-[10px]">
                              {toPersianDigits(c._count.files)} فایل
                            </Badge>
                          )}
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3.5 w-3.5" />
                            {c.organization?.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" />
                            شماره: {c.contractNumber}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            تا {formatJalali(c.endDate)}
                          </span>
                          {days >= 0 && days <= 60 && (
                            <span
                              className={
                                days <= 30
                                  ? "font-bold text-rose-600 dark:text-rose-400"
                                  : "font-bold text-amber-600 dark:text-amber-400"
                              }
                            >
                              {toPersianDigits(days)} روز باقیمانده
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {c.amount != null && (
                          <div className="text-left">
                            <p className="font-bold tabular-nums text-sm">
                              {formatAmount(c.amount)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {c.currency}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      <ContractForm key="new-contract" open={formOpen} onOpenChange={setFormOpen} />
    </div>
  )
}
