"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  Users as UsersIcon,
  Plus,
  Pencil,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  Eye,
  Mail,
  Phone,
  Search,
} from "lucide-react"
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "@/lib/use-api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { RoleBadge } from "@/components/kaman/badges"
import { formatJalaliLong, toPersianDigits } from "@/lib/persian"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

const emptyForm = {
  name: "",
  username: "",
  password: "",
  role: "USER",
  email: "",
  phone: "",
}

export function UsersView() {
  const { data, isLoading } = useUsers()
  const del = useDeleteUser()
  const [search, setSearch] = useState("")
  const [formOpen, setFormOpen] = useState(false)
  const [editUser, setEditUser] = useState<any | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = data?.filter(
    (u: any) =>
      !search ||
      u.name.includes(search) ||
      u.username.includes(search)
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">کاربران</h1>
          <p className="text-sm text-muted-foreground mt-1">
            تعریف و مدیریت کاربران سامانه
          </p>
        </div>
        <Button
          onClick={() => {
            setEditUser(null)
            setFormOpen(true)
          }}
        >
          <Plus className="ml-1 h-4 w-4" />
          کاربر جدید
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="جستجوی نام یا نام کاربری..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pr-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-36 rounded-xl" />
          ))}
        </div>
      ) : filtered && filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-10 text-center">
          <UsersIcon className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <p className="mt-2 text-sm text-muted-foreground">کاربری یافت نشد</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered?.map((u: any, i: number) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card className="group hover:shadow-md transition-all h-full">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#046bd2] to-[#0096ff] text-white font-bold text-lg">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground" dir="ltr">
                          @{u.username}
                        </p>
                      </div>
                    </div>
                    <RoleBadge role={u.role} />
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                    {u.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        <span dir="ltr" className="truncate">{u.email}</span>
                      </div>
                    )}
                    {u.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        <span dir="ltr">{toPersianDigits(u.phone)}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">
                      {formatJalaliLong(u.createdAt)}
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                      {u.active ? "فعال" : "غیرفعال"}
                      <Switch checked={u.active} disabled className="scale-90" />
                    </span>
                  </div>

                  <div className="mt-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-8"
                      onClick={() => {
                        setEditUser(u)
                        setFormOpen(true)
                      }}
                    >
                      <Pencil className="ml-1 h-3.5 w-3.5" />
                      ویرایش
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950"
                      onClick={() => setDeleteId(u.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <UserForm
        key={editUser?.id || "new"}
        open={formOpen}
        onOpenChange={setFormOpen}
        editUser={editUser}
      />

      <AlertDialog
        open={!!deleteId}
        onOpenChange={(o) => !o && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>حذف کاربر</AlertDialogTitle>
            <AlertDialogDescription>
              آیا از حذف این کاربر مطمئن هستید؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={del.isPending}
              onClick={async () => {
                if (!deleteId) return
                try {
                  await del.mutateAsync(deleteId)
                  toast.success("کاربر حذف شد")
                  setDeleteId(null)
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

function UserForm({
  open,
  onOpenChange,
  editUser,
}: {
  open: boolean
  onOpenChange: (o: boolean) => void
  editUser: any | null
}) {
  // مقداردهی اولیه - با key بازمونت می‌شود
  const [form, setForm] = useState<any>(() =>
    editUser
      ? {
          name: editUser.name,
          username: editUser.username,
          password: "",
          role: editUser.role,
          email: editUser.email || "",
          phone: editUser.phone || "",
        }
      : emptyForm
  )
  const create = useCreateUser()
  const update = useUpdateUser()

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name.trim()) return toast.error("نام الزامی است")
    if (!form.username.trim()) return toast.error("نام کاربری الزامی است")
    if (!editUser && !form.password) return toast.error("رمز عبور الزامی است")
    try {
      if (editUser) {
        const data: any = {
          name: form.name,
          username: form.username,
          role: form.role,
          email: form.email,
          phone: form.phone,
        }
        if (form.password) data.password = form.password
        await update.mutateAsync({ id: editUser.id, data })
        toast.success("کاربر به‌روزرسانی شد")
      } else {
        await create.mutateAsync(form)
        toast.success("کاربر ایجاد شد")
      }
      onOpenChange(false)
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o)
        if (!o) setForm(emptyForm)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editUser ? "ویرایش کاربر" : "کاربر جدید"}
          </DialogTitle>
          <DialogDescription>
            {editUser
              ? "رمز عبور را خالی بگذارید تا تغییر نکند"
              : "اطلاعات کاربر را وارد کنید"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div>
            <Label>نام کامل</Label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="نام و نام خانوادگی"
            />
          </div>
          <div>
            <Label>نام کاربری</Label>
            <Input
              value={form.username}
              onChange={(e) => set("username", e.target.value)}
              placeholder="username"
              dir="ltr"
            />
          </div>
          <div>
            <Label>
              رمز عبور{" "}
              {editUser && (
                <span className="text-xs text-muted-foreground">(اختیاری)</span>
              )}
            </Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
              dir="ltr"
            />
          </div>
          <div>
            <Label>نقش</Label>
            <Select value={form.role} onValueChange={(v) => set("role", v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    مدیر (دسترسی کامل)
                  </div>
                </SelectItem>
                <SelectItem value="USER">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    کاربر (ثبت و ویرایش)
                  </div>
                </SelectItem>
                <SelectItem value="VIEWER">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    بیننده (فقط مشاهده)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>ایمیل</Label>
              <Input
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="email@..."
                dir="ltr"
              />
            </div>
            <div>
              <Label>تلفن</Label>
              <Input
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="۰۹۱۲..."
                dir="ltr"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            انصراف
          </Button>
          <Button
            onClick={submit}
            disabled={create.isPending || update.isPending}
          >
            {editUser ? "به‌روزرسانی" : "ایجاد کاربر"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
