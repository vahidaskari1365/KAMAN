"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Building2,
  Phone,
  Mail,
  MapPin,
  User,
  Network,
  FileText,
  Pencil,
  Printer,
  Plus,
  FileImage,
  Download,
  Eye,
} from "lucide-react"
import { useOrganization } from "@/lib/use-api"
import { useKamanStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  formatJalali,
  formatJalaliLong,
  formatAmount,
  formatFileSize,
  daysUntil,
  toPersianDigits,
} from "@/lib/persian"
import { StatusBadge, ContractTypeBadge } from "@/components/kaman/badges"
import { FileViewer, FileThumb } from "@/components/kaman/file-viewer"
import { OrganizationForm } from "./organization-form"
import { ContractForm } from "./contract-form"
import { useKamanPrint } from "@/lib/use-print"

interface Props {
  id: string
  onBack: () => void
}

export function OrganizationDetail({ id, onBack }: Props) {
  const { data: org, isLoading } = useOrganization(id)
  const { openContract, setView } = useKamanStore()
  const [editOpen, setEditOpen] = useState(false)
  const [contractFormOpen, setContractFormOpen] = useState(false)
  const [viewer, setViewer] = useState<{
    fileId: string
    name: string
    type: string
    size: number
    uploadedAt?: string
  } | null>(null)
  const { printRef, handlePrint } = useKamanPrint()

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!org) {
    return (
      <div className="text-center p-10">
        <p className="text-muted-foreground">سازمان یافت نشد</p>
        <Button className="mt-4" variant="outline" onClick={onBack}>
          بازگشت
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5" ref={printRef}>
      {/* Back */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowRight className="ml-1 h-4 w-4" />
          بازگشت به لیست
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="ml-1 h-4 w-4" />
            پرینت
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="ml-1 h-4 w-4" />
            ویرایش
          </Button>
        </div>
      </div>

      {/* Org header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="kaman-gradient kaman-card-glow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#046bd2] to-[#0096ff] text-white shadow-lg shadow-[#046bd2]/30">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{org.name}</h1>
                  {org.type && (
                    <Badge variant="secondary">{org.type}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  عضو سامانه از {formatJalaliLong(org.createdAt)}
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  {org.economicCode && (
                    <InfoItem icon={Network} label="کد اقتصادی" value={toPersianDigits(org.economicCode)} />
                  )}
                  {org.nationalId && (
                    <InfoItem icon={Network} label="شناسه ملی" value={toPersianDigits(org.nationalId)} />
                  )}
                  {org.phone && (
                    <InfoItem icon={Phone} label="تلفن" value={toPersianDigits(org.phone)} ltr />
                  )}
                  {org.email && (
                    <InfoItem icon={Mail} label="ایمیل" value={org.email} ltr />
                  )}
                  {org.contactPerson && (
                    <InfoItem icon={User} label="شخص رابط" value={org.contactPerson} />
                  )}
                  {org.address && (
                    <InfoItem icon={MapPin} label="نشانی" value={org.address} className="sm:col-span-2 lg:col-span-3" />
                  )}
                </div>
                {org.notes && (
                  <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">یادداشت: </span>
                    {org.notes}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Contract counts summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <SummaryTile
          label="کل قراردادها"
          value={org.contracts?.length || 0}
          icon={FileText}
          tone="info"
        />
        <SummaryTile
          label="قرارداد خرید"
          value={org.purchaseContracts?.length || 0}
          icon={FileImage}
          tone="violet"
        />
        <SummaryTile
          label="قرارداد پشتیبانی"
          value={org.supportContracts?.length || 0}
          icon={FileText}
          tone="teal"
        />
        <SummaryTile
          label="مبلغ کل"
          value={formatAmount(
            (org.contracts || []).reduce((s: number, c: any) => s + (c.amount || 0), 0)
          )}
          icon={FileText}
          tone="primary"
        />
      </div>

      {/* Contracts with tabs */}
      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0 no-print">
          <div>
            <CardTitle className="text-lg">قراردادهای سازمان</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              قراردادها بر اساس نوع دسته‌بندی شده‌اند
            </p>
          </div>
          <Button size="sm" onClick={() => setContractFormOpen(true)}>
            <Plus className="ml-1 h-4 w-4" />
            قرارداد جدید
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-4 pt-2 border-b">
              <TabsList className="bg-transparent h-auto p-0">
                <TabsTrigger value="all" className="gap-1.5">
                  همه
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {toPersianDigits(org.contracts?.length || 0)}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="purchase" className="gap-1.5">
                  خرید / فروش
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {toPersianDigits(org.purchaseContracts?.length || 0)}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="support" className="gap-1.5">
                  پشتیبانی
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {toPersianDigits(org.supportContracts?.length || 0)}
                  </Badge>
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="mt-0 p-0">
              <ContractList
                contracts={org.contracts || []}
                onOpen={openContract}
                onPreviewFile={setViewer}
              />
            </TabsContent>
            <TabsContent value="purchase" className="mt-0 p-0">
              <ContractList
                contracts={org.purchaseContracts || []}
                onOpen={openContract}
                onPreviewFile={setViewer}
                emptyMsg="این سازمان قرارداد خریدی ندارد"
              />
            </TabsContent>
            <TabsContent value="support" className="mt-0 p-0">
              <ContractList
                contracts={org.supportContracts || []}
                onOpen={openContract}
                onPreviewFile={setViewer}
                emptyMsg="این سازمان قرارداد پشتیبانی ندارد"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* File viewer */}
      <FileViewer
        fileId={viewer?.fileId || null}
        fileName={viewer?.name || ""}
        fileType={viewer?.type || ""}
        fileSize={viewer?.size || 0}
        uploadedAt={viewer?.uploadedAt}
        open={!!viewer}
        onOpenChange={(o) => !o && setViewer(null)}
      />

      {/* Forms */}
      <OrganizationForm key={org.id} open={editOpen} onOpenChange={setEditOpen} editOrg={org} />
      <ContractForm
        key={`c-${id}`}
        open={contractFormOpen}
        onOpenChange={setContractFormOpen}
        defaultOrgId={id}
      />
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
  ltr,
  className,
}: {
  icon: any
  label: string
  value: string
  ltr?: boolean
  className?: string
}) {
  return (
    <div className={`flex items-center gap-2 ${className || ""}`}>
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`font-medium truncate ${ltr ? "dir-ltr" : ""}`} dir={ltr ? "ltr" : "rtl"}>
          {value}
        </p>
      </div>
    </div>
  )
}

function SummaryTile({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string
  value: string | number
  icon: any
  tone: string
}) {
  const toneMap: Record<string, string> = {
    info: "from-[#0096ff]/10 text-[#0096ff] dark:text-[#5aa9ff]",
    violet: "from-violet-500/10 text-violet-700 dark:text-violet-300",
    teal: "from-teal-500/10 text-teal-700 dark:text-teal-300",
    primary: "from-[#046bd2]/10 text-[#046bd2] dark:text-[#5aa9ff]",
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

function ContractList({
  contracts,
  onOpen,
  onPreviewFile,
  emptyMsg,
}: {
  contracts: any[]
  onOpen: (id: string) => void
  onPreviewFile: (f: any) => void
  emptyMsg?: string
}) {
  if (contracts.length === 0) {
    return (
      <div className="p-10 text-center text-sm text-muted-foreground">
        {emptyMsg || "قراردادی وجود ندارد"}
      </div>
    )
  }
  return (
    <div className="divide-y max-h-[600px] overflow-y-auto">
      {contracts.map((c) => {
        const days = daysUntil(c.endDate)
        return (
          <div key={c.id} className="p-4 hover:bg-muted/30 transition-colors">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <button
                  className="text-right block"
                  onClick={() => onOpen(c.id)}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-sm hover:text-primary transition-colors">
                      {c.title}
                    </h4>
                    <ContractTypeBadge type={c.type} />
                    <StatusBadge endDate={c.endDate} status={c.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    شماره قرارداد: {c.contractNumber} • از{" "}
                    {formatJalali(c.startDate)} تا {formatJalali(c.endDate)}
                    {days >= 0 ? ` • ${toPersianDigits(days)} روز تا پایان` : " • منقضی شده"}
                  </p>
                </button>
                {c.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">
                    {c.description}
                  </p>
                )}
              </div>
              <div className="text-left shrink-0">
                {c.amount != null && (
                  <p className="text-sm font-bold tabular-nums">
                    {formatAmount(c.amount)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {c.currency || "ریال"}
                </p>
              </div>
            </div>
            {/* فایل‌ها */}
            {c.files && c.files.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {c.files.map((f: any) => (
                  <button
                    key={f.id}
                    onClick={() =>
                      onPreviewFile({
                        fileId: f.id,
                        name: f.originalName,
                        type: f.fileType,
                        size: f.fileSize,
                        uploadedAt: f.uploadedAt,
                      })
                    }
                    className="group flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 text-xs hover:border-primary/40 hover:bg-accent transition-all"
                    title={f.originalName}
                  >
                    <FileThumb fileType={f.fileType} fileName={f.originalName} className="h-6 w-6" />
                    <span className="max-w-[160px] truncate">{f.originalName}</span>
                    <span className="text-muted-foreground text-[10px]">
                      {formatFileSize(f.fileSize)}
                    </span>
                    <Eye className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
