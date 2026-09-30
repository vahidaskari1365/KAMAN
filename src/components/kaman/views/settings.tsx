"use client"

import { useState } from "react"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import {
  Settings as SettingsIcon,
  Moon,
  Sun,
  Database,
  Trash2,
  Download,
  Upload,
  Info,
  Palette,
  Bell,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useSeed } from "@/lib/use-api"
import { toast } from "sonner"
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

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const seed = useSeed()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">تنظیمات</h1>
        <p className="text-sm text-muted-foreground mt-1">
          تنظیمات ظاهر و مدیریت سامانه
        </p>
      </div>

      {/* Theme */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="h-4 w-4 text-[#046bd2]" />
            ظاهر
          </CardTitle>
          <CardDescription>تم روشن یا تیره را انتخاب کنید</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setTheme("light")}
              className={`rounded-xl border-2 p-4 text-right transition-all ${
                theme === "light"
                  ? "border-[#046bd2] bg-[#046bd2]/5"
                  : "border-border hover:border-[#046bd2]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">تم روشن</span>
                <Sun className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded bg-white border" />
                <div className="h-6 w-6 rounded bg-[#046bd2]" />
                <div className="h-6 w-6 rounded bg-muted" />
              </div>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`rounded-xl border-2 p-4 text-right transition-all ${
                theme === "dark"
                  ? "border-[#046bd2] bg-[#046bd2]/5"
                  : "border-border hover:border-[#046bd2]/40"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">تم تیره</span>
                <Moon className="h-5 w-5 text-indigo-300" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded bg-zinc-900" />
                <div className="h-6 w-6 rounded bg-[#0096ff]" />
                <div className="h-6 w-6 rounded bg-zinc-700" />
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications settings (نمایشی) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4 text-amber-500" />
            اعلان‌ها
          </CardTitle>
          <CardDescription>اعلان خودکار قراردادهای رو به اتمام</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">اعلان خودکار فعال است</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                سیستم به‌طور خودکار هر یک دقیقه قراردادهای نزدیک به پایان را بررسی می‌کند
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">نمایش نشان قرمز در منو</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                تعداد قراردادهای رو به اتمام در آیکن داشبورد نمایش داده می‌شود
              </p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Data management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Database className="h-4 w-4 text-teal-500" />
            مدیریت داده
          </CardTitle>
          <CardDescription>ابزارهای مدیریت داده‌های سامانه</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start"
            disabled={seed.isPending}
            onClick={() => {
              seed.mutate(undefined, {
                onSuccess: (r: any) => {
                  if (r.skipped) {
                    toast.info("داده‌ها از قبل وجود دارند")
                  } else {
                    toast.success("داده‌های نمونه بارگذاری شد")
                  }
                },
                onError: (e: any) => toast.error(e.message),
              })
            }}
          >
            <Download className="ml-2 h-4 w-4" />
            بارگذاری داده‌های نمونه (سازمان‌ها و قراردادها)
          </Button>

          <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-rose-500" />
                  بازنشانی کامل داده
                </AlertDialogTitle>
                <AlertDialogDescription>
                  با این کار تمام سازمان‌ها، قراردادها و فایل‌های اسکن شده حذف
                  می‌شوند. این عملیات قابل بازگشت نیست. ادامه می‌دهید؟
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>انصراف</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  onClick={() => {
                    // در نسخه دمو فقط توست می‌دهیم
                    toast.info(
                      "برای امنیت، این عملیات غیرفعال است. از مسیر مدیریتی استفاده کنید."
                    )
                    setConfirmReset(false)
                  }}
                >
                  حذف همه
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="h-4 w-4 text-[#046bd2]" />
            درباره سامانه
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">نام:</span>
            <span className="font-medium">بایگانی</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">نسخه:</span>
            <span className="font-medium">۱.۰.۰</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">فناوری:</span>
            <span className="font-medium">Next.js 16 • TypeScript • Prisma</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">پشتیبانی از:</span>
            <span className="font-medium">فایل‌های تصویری و PDF</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
