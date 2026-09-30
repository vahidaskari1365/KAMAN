"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  useCreateContract,
  useUpdateContract,
  useDeleteContract,
  useOrganizations,
} from "@/lib/use-api"
import { toast } from "sonner"
import { toEnglishDigits, toGregorian, toJalali } from "@/lib/persian"
import { Trash2 } from "lucide-react"
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
import { useKamanStore } from "@/lib/store"

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  editContract?: any | null
  defaultOrgId?: string
}

const emptyForm = {
  contractNumber: "",
  organizationId: "",
  type: "SUPPORT",
  title: "",
  startDateJalali: "",
  endDateJalali: "",
  amount: "",
  currency: "ریال",
  description: "",
  status: "ACTIVE",
  reminderDays: "60",
}

// تبدیل رشته شمسی yyyy/mm/dd به Date
function jalaliToDate(str: string): Date | null {
  const m = str.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/)
  if (!m) return null
  const [gy, gm, gd] = toGregorian(Number(m[1]), Number(m[2]), Number(m[3]))
  const d = new Date(gy, gm - 1, gd, 12, 0, 0)
  return isNaN(d.getTime()) ? null : d
}

// تبدیل Date به رشته شمسی
function dateToJalaliStr(d: Date): string {
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`
}

export function ContractForm({
  open,
  onOpenChange,
  editContract,
  defaultOrgId,
}: Props) {
  // مقداردهی اولیه - کامپوننت با key بازمونت می‌شود
  const [form, setForm] = useState<any>(() =>
    editContract
      ? {
          contractNumber: editContract.contractNumber || "",
          organizationId: editContract.organizationId || "",
          type: editContract.type || "SUPPORT",
          title: editContract.title || "",
          startDateJalali: dateToJalaliStr(new Date(editContract.startDate)),
          endDateJalali: dateToJalaliStr(new Date(editContract.endDate)),
          amount: editContract.amount ? String(editContract.amount) : "",
          currency: editContract.currency || "ریال",
          description: editContract.description || "",
          status: editContract.status || "ACTIVE",
          reminderDays: String(editContract.reminderDays || 60),
        }
      : { ...emptyForm, organizationId: defaultOrgId || "" }
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const create = useCreateContract()
  const update = useUpdateContract()
  const del = useDeleteContract()
  const { data: orgs } = useOrganizations("")

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.contractNumber.trim()) return toast.error("شماره قرارداد الزامی است")
    if (!form.organizationId) return toast.error("سازمان را انتخاب کنید")
    if (!form.title.trim()) return toast.error("عنوان قرارداد الزامی است")
    const startDate = jalaliToDate(toEnglishDigits(form.startDateJalali))
    const endDate = jalaliToDate(toEnglishDigits(form.endDateJalali))
    if (!startDate) return toast.error("تاریخ شروع معتبر نیست (مثال: ۱۴۰۳/۰۵/۱۲)")
    if (!endDate) return toast.error("تاریخ پایان معتبر نیست")
    if (endDate < startDate) return toast.error("تاریخ پایان باید بعد از شروع باشد")

    const payload = {
      contractNumber: form.contractNumber,
      organizationId: form.organizationId,
      type: form.type,
      title: form.title,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      amount: form.amount ? Number(toEnglishDigits(form.amount)) : null,
      currency: form.currency,
      description: form.description,
      status: form.status,
      reminderDays: Number(toEnglishDigits(form.reminderDays || "60")),
    }

    try {
      if (editContract) {
        await update.mutateAsync({ id: editContract.id, data: payload })
        toast.success("قرارداد به‌روزرسانی شد")
      } else {
        await create.mutateAsync(payload)
        toast.success("قرارداد ایجاد شد")
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const onDelete = async () => {
    try {
      await del.mutateAsync(editContract.id)
      toast.success("قرارداد حذف شد")
      setConfirmDelete(false)
      onOpenChange(false)
      useKamanStore.getState().clearSelected()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editContract ? "ویرایش قرارداد" : "قرارداد جدید"}
            </DialogTitle>
            <DialogDescription>
              تاریخ‌ها را به شمسی وارد کنید (مثال: ۱۴۰۳/۰۵/۱۲)
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div>
              <Label>شماره قرارداد <span className="text-rose-500">*</span></Label>
              <Input
                value={form.contractNumber}
                onChange={(e) => set("contractNumber", e.target.value)}
                placeholder="مثلاً: SUP-1402-01"
              />
            </div>
            <div>
              <Label>سازمان <span className="text-rose-500">*</span></Label>
              <Select
                value={form.organizationId}
                onValueChange={(v) => set("organizationId", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب سازمان" />
                </SelectTrigger>
                <SelectContent>
                  {orgs?.map((o: any) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>نوع قرارداد <span className="text-rose-500">*</span></Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPPORT">خدمات و پشتیبانی</SelectItem>
                  <SelectItem value="PURCHASE">خرید / فروش</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>عنوان قرارداد <span className="text-rose-500">*</span></Label>
              <Input
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="مثلاً: پشتیبانی نرم‌افزار HIS"
              />
            </div>
            <div>
              <Label>تاریخ شروع (شمسی) <span className="text-rose-500">*</span></Label>
              <Input
                value={form.startDateJalali}
                onChange={(e) => set("startDateJalali", e.target.value)}
                placeholder="۱۴۰۳/۰۵/۱۲"
                dir="ltr"
              />
            </div>
            <div>
              <Label>تاریخ پایان (شمسی) <span className="text-rose-500">*</span></Label>
              <Input
                value={form.endDateJalali}
                onChange={(e) => set("endDateJalali", e.target.value)}
                placeholder="۱۴۰۴/۰۵/۱۲"
                dir="ltr"
              />
            </div>
            <div>
              <Label>مبلغ قرارداد</Label>
              <Input
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
                placeholder="به ریال"
                inputMode="numeric"
                dir="ltr"
              />
            </div>
            <div>
              <Label>واحد پول</Label>
              <Select value={form.currency} onValueChange={(v) => set("currency", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ریال">ریال</SelectItem>
                  <SelectItem value="تومان">تومان</SelectItem>
                  <SelectItem value="دلار">دلار</SelectItem>
                  <SelectItem value="یورو">یورو</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>وضعیت</Label>
              <Select value={form.status} onValueChange={(v) => set("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">فعال</SelectItem>
                  <SelectItem value="PENDING">در انتظار</SelectItem>
                  <SelectItem value="TERMINATED">فسخ شده</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>اعلان چند روز قبل از پایان</Label>
              <Input
                value={form.reminderDays}
                onChange={(e) => set("reminderDays", e.target.value)}
                placeholder="۶۰"
                inputMode="numeric"
                dir="ltr"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>توضیحات</Label>
              <Textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                placeholder="شرح قرارداد، شماره تماس پشتیبانی، شرایط..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editContract && (
              <Button
                variant="outline"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="ml-1 h-4 w-4" />
                حذف قرارداد
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button onClick={submit} disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending
                ? "در حال ذخیره..."
                : editContract
                  ? "به‌روزرسانی"
                  : "ایجاد قرارداد"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف قرارداد</AlertDialogTitle>
            <AlertDialogDescription>
              با حذف این قرارداد، تمام فایل‌های اسکن شده آن نیز حذف می‌شوند. آیا
              مطمئن هستید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              onClick={onDelete}
            >
              حذف کامل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
