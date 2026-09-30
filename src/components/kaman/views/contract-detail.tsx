"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  FileText,
  Building2,
  Calendar,
  Wallet,
  Network,
  User,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Printer,
  Upload,
  Download,
  Eye,
  Trash2,
  FileImage,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { useContract, useContractFiles, useUploadFiles, useDeleteFile } from "@/lib/use-api"
import { useKamanStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  formatJalali,
  formatJalaliLong,
  formatAmount,
  formatFileSize,
  formatJalaliDateTime,
  daysUntil,
  toPersianDigits,
} from "@/lib/persian"
import { StatusBadge, ContractTypeBadge } from "@/components/kaman/badges"
import { FileViewer, FileThumb } from "@/components/kaman/file-viewer"
import { ContractForm } from "./contract-form"
import { useKamanPrint, PAPER_SIZES } from "@/lib/use-print"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
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
import { toast } from "sonner"

interface Props {
  id: string
  onBack: () => void
}

export function ContractDetail({ id, onBack }: Props) {
  const { data: contract, isLoading } = useContract(id)
  const { data: files } = useContractFiles(id)
  const upload = useUploadFiles()
  const delFile = useDeleteFile()
  const { openOrganization } = useKamanStore()
  const [editOpen, setEditOpen] = useState(false)
  const [viewer, setViewer] = useState<{
    fileId: string
    name: string
    type: string
    size: number
    uploadedAt?: string
  } | null>(null)
  const [deleteFileId, setDeleteFileId] = useState<string | null>(null)
  const [fileCategory, setFileCategory] = useState("اصل قرارداد")
  const { printRef, handlePrint, paperSize, setPaperSize } = useKamanPrint()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onUpload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    try {
      await upload.mutateAsync({
        contractId: id,
        files: Array.from(fileList),
        category: fileCategory,
      })
      toast.success(`${fileList.length} فایل آپلود شد`)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="text-center p-10">
        <p className="text-muted-foreground">قرارداد یافت نشد</p>
        <Button className="mt-4" variant="outline" onClick={onBack}>
          بازگشت
        </Button>
      </div>
    )
  }

  const days = daysUntil(contract.endDate)
  const org = contract.organization

  return (
    <div className="space-y-5" ref={printRef}>
      {/* Back + Actions */}
      <div className="flex items-center justify-between no-print">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowRight className="ml-1 h-4 w-4" />
          بازگشت
        </Button>
        <div className="flex flex-wrap gap-2">
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
            پرینت
          </Button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="ml-1 h-4 w-4" />
            ویرایش
          </Button>
        </div>
      </div>

      {/* Contract Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="kaman-gradient kaman-card-glow">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#046bd2] to-[#0096ff] text-white shadow-lg shadow-[#046bd2]/30">
                <FileText className="h-8 w-8" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold">{contract.title}</h1>
                  <ContractTypeBadge type={contract.type} />
                  <StatusBadge endDate={contract.endDate} status={contract.status} />
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  شماره قرارداد:{" "}
                  <span className="font-mono font-bold text-foreground">
                    {contract.contractNumber}
                  </span>
                </p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
                  <InfoItem icon={Calendar} label="تاریخ شروع" value={formatJalaliLong(contract.startDate)} />
                  <InfoItem icon={Calendar} label="تاریخ پایان" value={formatJalaliLong(contract.endDate)} />
                  <InfoItem
                    icon={Clock}
                    label="روزهای باقیمانده"
                    value={days < 0 ? `منقضی شده (${toPersianDigits(-days)} روز پیش)` : `${toPersianDigits(days)} روز`}
                    tone={days < 0 ? "danger" : days <= 30 ? "danger" : days <= 60 ? "warning" : "success"}
                  />
                  {contract.amount != null && (
                    <InfoItem
                      icon={Wallet}
                      label="مبلغ"
                      value={`${formatAmount(contract.amount)} ${contract.currency || ""}`}
                    />
                  )}
                  {contract.reminderDays && (
                    <InfoItem icon={AlertTriangle} label="اعلان قبل از" value={`${toPersianDigits(contract.reminderDays)} روز`} />
                  )}
                </div>

                {contract.description && (
                  <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                    <span className="font-medium">شرح: </span>
                    {contract.description}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Organization card */}
      {org && (
        <Card className="no-print">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="h-4 w-4 text-emerald-500" />
              سازمان
            </CardTitle>
          </CardHeader>
          <CardContent>
            <button
              className="text-right block w-full hover:bg-muted/30 rounded-lg p-3 -m-3 transition-colors"
              onClick={() => openOrganization(org.id)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#046bd2] to-[#0096ff] text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{org.name}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {org.economicCode && (
                      <span className="flex items-center gap-1">
                        <Network className="h-3 w-3" /> {toPersianDigits(org.economicCode)}
                      </span>
                    )}
                    {org.phone && (
                      <span className="flex items-center gap-1" dir="ltr">
                        <Phone className="h-3 w-3" /> {toPersianDigits(org.phone)}
                      </span>
                    )}
                    {org.contactPerson && (
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" /> {org.contactPerson}
                      </span>
                    )}
                    {org.email && (
                      <span className="flex items-center gap-1" dir="ltr">
                        <Mail className="h-3 w-3" /> {org.email}
                      </span>
                    )}
                    {org.address && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {org.address}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          </CardContent>
        </Card>
      )}

      {/* Files section */}
      <Card className="no-print">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <FileImage className="h-4 w-4 text-emerald-500" />
                فایل‌های اسکن شده
              </CardTitle>
              <CardDescription className="mt-0.5">
                {files?.length || 0} فایل - برای مشاهده روی هر فایل کلیک کنید
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Select value={fileCategory} onValueChange={setFileCategory}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="اصل قرارداد">اصل قرارداد</SelectItem>
                  <SelectItem value="الحاقیه">الحاقیه</SelectItem>
                  <SelectItem value="فاکتور">فاکتور</SelectItem>
                  <SelectItem value="سایر">سایر</SelectItem>
                </SelectContent>
              </Select>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,application/pdf"
                className="hidden"
                onChange={(e) => onUpload(e.target.files)}
              />
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={upload.isPending}
              >
                <Upload className="ml-1 h-4 w-4" />
                {upload.isPending ? "در حال آپلود..." : "آپلود فایل"}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {files && files.length === 0 ? (
            <div className="rounded-xl border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
              <FileImage className="mx-auto h-10 w-10 mb-2 text-muted-foreground/40" />
              هنوز فایلی آپلود نشده است
              <p className="text-xs mt-1">
                فایل‌های اسکن شده کاغذی (تصویر یا PDF) را اینجا بارگذاری کنید
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {files?.map((f: any) => (
                <motion.div
                  key={f.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="group rounded-xl border bg-card overflow-hidden hover:shadow-md transition-all"
                >
                  <button
                    className="block w-full p-3 text-right"
                    onClick={() =>
                      setViewer({
                        fileId: f.id,
                        name: f.originalName,
                        type: f.fileType,
                        size: f.fileSize,
                        uploadedAt: f.uploadedAt,
                      })
                    }
                  >
                    <div className="flex items-start gap-3">
                      <FileThumb fileType={f.fileType} fileName={f.originalName} className="h-12 w-12" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">
                          {f.originalName}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatFileSize(f.fileSize)}
                        </p>
                        {f.category && (
                          <Badge variant="secondary" className="mt-1 text-[10px]">
                            {f.category}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                  <div className="border-t px-3 py-2 flex items-center justify-between bg-muted/30">
                    <span className="text-[10px] text-muted-foreground">
                      {formatJalaliDateTime(f.uploadedAt)}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={() => setViewer({
                          fileId: f.id,
                          name: f.originalName,
                          type: f.fileType,
                          size: f.fileSize,
                          uploadedAt: f.uploadedAt,
                        })}
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button asChild size="icon" variant="ghost" className="h-7 w-7">
                        <a href={`/api/files/${f.id}?download=1`} target="_blank" rel="noreferrer">
                          <Download className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-rose-600 hover:text-rose-700"
                        onClick={() => setDeleteFileId(f.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* File Viewer */}
      <FileViewer
        fileId={viewer?.fileId || null}
        fileName={viewer?.name || ""}
        fileType={viewer?.type || ""}
        fileSize={viewer?.size || 0}
        uploadedAt={viewer?.uploadedAt}
        open={!!viewer}
        onOpenChange={(o) => !o && setViewer(null)}
      />

      {/* Edit form */}
      <ContractForm
        key={contract.id}
        open={editOpen}
        onOpenChange={setEditOpen}
        editContract={contract}
      />

      {/* Delete file confirm */}
      <AlertDialog
        open={!!deleteFileId}
        onOpenChange={(o) => !o && setDeleteFileId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف فایل</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این فایل مطمئن هستید؟ عملیات قابل بازگشت نیست.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={async () => {
                if (!deleteFileId) return
                try {
                  await delFile.mutateAsync(deleteFileId)
                  toast.success("فایل حذف شد")
                  setDeleteFileId(null)
                } catch (e: any) {
                  toast.error(e.message)
                }
              }}
            >
              حذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function InfoItem({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: any
  label: string
  value: string
  tone?: "success" | "warning" | "danger"
}) {
  const toneClass = tone === "danger"
    ? "text-rose-600 dark:text-rose-400"
    : tone === "warning"
      ? "text-amber-600 dark:text-amber-400"
      : tone === "success"
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-foreground"
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] text-muted-foreground">{label}</p>
        <p className={`font-medium truncate ${toneClass}`}>{value}</p>
      </div>
    </div>
  )
}
