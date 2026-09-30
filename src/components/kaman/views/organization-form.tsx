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
  useCreateOrganization,
  useUpdateOrganization,
  useDeleteOrganization,
} from "@/lib/use-api"
import { useKamanStore } from "@/lib/store"
import { toast } from "sonner"
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

interface Props {
  open: boolean
  onOpenChange: (o: boolean) => void
  editOrg: any | null
}

const ORG_TYPES = ["پزشکی", "دولتی", "صنعتی", "دانشگاهی", "خصوصی", "بهداشتی", "نظامی", "سایر"]

const emptyForm = {
  name: "",
  type: "",
  economicCode: "",
  nationalId: "",
  phone: "",
  email: "",
  address: "",
  contactPerson: "",
  notes: "",
}

export function OrganizationForm({ open, onOpenChange, editOrg }: Props) {
  // مقداردهی اولیه از editOrg - کامپوننت با key بازمونت می‌شود
  const [form, setForm] = useState<any>(() =>
    editOrg
      ? {
          name: editOrg.name || "",
          type: editOrg.type || "",
          economicCode: editOrg.economicCode || "",
          nationalId: editOrg.nationalId || "",
          phone: editOrg.phone || "",
          email: editOrg.email || "",
          address: editOrg.address || "",
          contactPerson: editOrg.contactPerson || "",
          notes: editOrg.notes || "",
        }
      : emptyForm
  )
  const [confirmDelete, setConfirmDelete] = useState(false)
  const create = useCreateOrganization()
  const update = useUpdateOrganization()
  const del = useDeleteOrganization()

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim()) {
      toast.error("نام سازمان الزامی است")
      return
    }
    try {
      if (editOrg) {
        await update.mutateAsync({ id: editOrg.id, data: form })
        toast.success("سازمان به‌روزرسانی شد")
      } else {
        await create.mutateAsync(form)
        toast.success("سازمان ایجاد شد")
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const onDelete = async () => {
    try {
      await del.mutateAsync(editOrg.id)
      toast.success("سازمان حذف شد")
      onOpenChange(false)
      setConfirmDelete(false)
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
              {editOrg ? "ویرایش سازمان" : "ایجاد سازمان جدید"}
            </DialogTitle>
            <DialogDescription>
              اطلاعات سازمان را وارد کنید. فیلدهای ستاره‌دار الزامی هستند.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label htmlFor="name">
                نام سازمان <span className="text-rose-500">*</span>
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="مثلاً: دانشگاه علوم پزشکی اصفهان"
              />
            </div>
            <div>
              <Label>نوع سازمان</Label>
              <Select value={form.type} onValueChange={(v) => set("type", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نوع" />
                </SelectTrigger>
                <SelectContent>
                  {ORG_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>کد اقتصادی</Label>
              <Input
                value={form.economicCode}
                onChange={(e) => set("economicCode", e.target.value)}
                placeholder="۱۱ رقم"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label>شناسه ملی</Label>
              <Input
                value={form.nationalId}
                onChange={(e) => set("nationalId", e.target.value)}
                placeholder="۱۱ رقم"
                inputMode="numeric"
              />
            </div>
            <div>
              <Label>تلفن</Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="۰۳۱..."
                dir="ltr"
                inputMode="tel"
              />
            </div>
            <div>
              <Label>ایمیل</Label>
              <Input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="info@org.ir"
                dir="ltr"
                inputMode="email"
              />
            </div>
            <div>
              <Label>شخص رابط</Label>
              <Input
                value={form.contactPerson}
                onChange={(e) => set("contactPerson", e.target.value)}
                placeholder="نام مسئول قراردادها"
              />
            </div>
            <div className="sm:col-span-2">
              <Label>نشانی</Label>
              <Textarea
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="نشانی کامل پستی"
                rows={2}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>یادداشت</Label>
              <Textarea
                value={form.notes}
                onChange={(e) => set("notes", e.target.value)}
                placeholder="توضیحات اضافی، تاریخ شروع همکاری و..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            {editOrg && (
              <Button
                variant="outline"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950 mr-auto"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="ml-1 h-4 w-4" />
                حذف سازمان
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              انصراف
            </Button>
            <Button
              onClick={submit}
              disabled={create.isPending || update.isPending}
            >
              {create.isPending || update.isPending
                ? "در حال ذخیره..."
                : editOrg
                  ? "به‌روزرسانی"
                  : "ایجاد سازمان"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف سازمان</AlertDialogTitle>
            <AlertDialogDescription>
              با حذف این سازمان، تمام قراردادها و فایل‌های اسکن شده آن نیز حذف
              خواهند شد. آیا مطمئن هستید؟
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
