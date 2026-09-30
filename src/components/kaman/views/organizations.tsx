"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Building2,
  Plus,
  Search,
  Phone,
  MapPin,
  User,
  FileText,
  Filter,
  ArrowLeft,
  Pencil,
  Trash2,
  Network,
} from "lucide-react"
import { useOrganizations, useCreateOrganization, useSeed } from "@/lib/use-api"
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  formatJalali,
  formatAmount,
  toPersianDigits,
} from "@/lib/persian"
import { ContractTypeBadge } from "@/components/kaman/badges"
import { OrganizationDetail } from "./organization-detail"
import { OrganizationForm } from "./organization-form"

export function OrganizationsView() {
  const { selected, clearSelected, globalSearch, setGlobalSearch } = useKamanStore()
  const [typeFilter, setTypeFilter] = useState("ALL")
  const [contractType, setContractType] = useState("ALL")
  const [formOpen, setFormOpen] = useState(false)
  const [editOrg, setEditOrg] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const q = globalSearch.trim()
  const { data, isLoading } = useOrganizations(
    q,
    typeFilter === "ALL" ? "" : typeFilter,
    contractType === "ALL" ? "" : contractType
  )

  // اگر یک سازمان انتخاب شده، جزئیات را نشان بده
  if (selected.orgId) {
    return <OrganizationDetail id={selected.orgId} onBack={clearSelected} />
  }

  const handleCreate = () => {
    setEditOrg(null)
    setFormOpen(true)
  }

  const handleEdit = (org: any) => {
    setEditOrg(org)
    setFormOpen(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">سازمان‌ها</h1>
          <p className="text-sm text-muted-foreground mt-1">
            مدیریت سازمان‌ها و شرکت‌های دارای قرارداد
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="ml-1 h-4 w-4" />
          سازمان جدید
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="جستجوی نام، کد اقتصادی، شناسه ملی، شخص رابط..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="pr-9"
            />
          </div>
          <div className="flex gap-2">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue placeholder="نوع سازمان" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه انواع</SelectItem>
                <SelectItem value="پزشکی">پزشکی</SelectItem>
                <SelectItem value="دولتی">دولتی</SelectItem>
                <SelectItem value="صنعتی">صنعتی</SelectItem>
                <SelectItem value="دانشگاهی">دانشگاهی</SelectItem>
                <SelectItem value="خصوصی">خصوصی</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contractType} onValueChange={setContractType}>
              <SelectTrigger className="w-44">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <SelectValue placeholder="نوع قرارداد" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه قراردادها</SelectItem>
                <SelectItem value="PURCHASE">دارای قرارداد خرید</SelectItem>
                <SelectItem value="SUPPORT">دارای قرارداد پشتیبانی</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* List */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      ) : data && data.length === 0 ? (
        <EmptyOrgs onCreate={handleCreate} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((org: any, i: number) => (
            <motion.div
              key={org.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => useKamanStore.getState().openOrganization(org.id)}
              className="cursor-pointer"
            >
              <Card className="group h-full hover:shadow-lg transition-all hover:-translate-y-0.5 overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046bd2] to-[#0096ff] text-white shadow-md shadow-[#046bd2]/20">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-base leading-tight line-clamp-2">
                          {org.name}
                        </h3>
                        {org.type && (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {org.type}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(org)
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-muted-foreground">
                    {org.economicCode && (
                      <div className="flex items-center gap-2">
                        <Network className="h-3.5 w-3.5 shrink-0" />
                        <span>کد اقتصادی: {toPersianDigits(org.economicCode)}</span>
                      </div>
                    )}
                    {org.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span dir="ltr">{toPersianDigits(org.phone)}</span>
                      </div>
                    )}
                    {org.contactPerson && (
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{org.contactPerson}</span>
                      </div>
                    )}
                    {org.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        <span className="line-clamp-1">{org.address}</span>
                      </div>
                    )}
                  </div>

                  {/* Contract type badges */}
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-3">
                    {org.purchaseCount > 0 ? (
                      <ContractTypeBadge type="PURCHASE" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60">
                        بدون قرارداد خرید
                      </span>
                    )}
                    {org.supportCount > 0 ? (
                      <ContractTypeBadge type="SUPPORT" />
                    ) : (
                      <span className="text-[10px] text-muted-foreground/60">
                        بدون قرارداد پشتیبانی
                      </span>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      کل قراردادها:{" "}
                      <span className="font-bold text-foreground tabular-nums">
                        {toPersianDigits(org._count.contracts)}
                      </span>
                    </span>
                    <span className="text-muted-foreground">
                      مبلغ کل: {formatAmount(org.totalAmount)}
                    </span>
                  </div>
                  {org.expiringCount > 0 && (
                    <div className="mt-2">
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30">
                        {toPersianDigits(org.expiringCount)} قرارداد رو به اتمام
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Dialog */}
      <OrganizationForm
        key={editOrg?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        editOrg={editOrg}
      />

      {/* Delete confirm */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سازمان</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این سازمان و تمام قراردادها و فایل‌های آن مطمئن هستید؟ این
              عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={() => setDeleteId(null)}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function EmptyOrgs({ onCreate }: { onCreate: () => void }) {
  const seed = useSeed()
  return (
    <div className="rounded-2xl border-2 border-dashed border-[#046bd2]/30 bg-[#046bd2]/5 p-10 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#046bd2]/15">
        <Building2 className="h-8 w-8 text-[#046bd2] dark:text-[#5aa9ff]" />
      </div>
      <h3 className="text-lg font-bold">سازمانی یافت نشد</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md mx-auto">
        می‌توانید یک سازمان جدید ایجاد کنید یا داده‌های نمونه را بارگذاری کنید.
      </p>
      <div className="mt-5 flex justify-center gap-2">
        <Button onClick={onCreate}>
          <Plus className="ml-1 h-4 w-4" />
          سازمان جدید
        </Button>
        <Button
          variant="outline"
          disabled={seed.isPending}
          onClick={() => seed.mutate()}
        >
          بارگذاری داده‌های نمونه
        </Button>
      </div>
    </div>
  )
}
