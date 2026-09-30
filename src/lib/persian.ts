// ابزارهای تاریخ و عدد فارسی - نرم‌افزار بایگانی کمان

// تبدیل تاریخ میلادی به شمسی (جلالی)
export function toJalali(gy: number, gm: number, gd: number): [number, number, number] {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  let jy: number
  if (gy <= 1600) {
    jy = 0
    gy -= 621
  } else {
    jy = 979
    gy -= 1600
  }
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) -
    80 +
    gd +
    g_d_m[gm - 1]
  jy += 33 * Math.floor(days / 12053)
  days %= 12053
  jy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    jy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  const jm = days <= 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30)
  const jd = 1 + (days <= 186 ? days % 31 : (days - 186) % 30)
  return [jy, jm, jd]
}

// تبدیل تاریخ شمسی به میلادی
export function toGregorian(jy: number, jm: number, jd: number): [number, number, number] {
  let gy: number
  if (jy > 979) {
    gy = 1600
    jy -= 979
  } else {
    gy = 621
  }
  let days =
    365 * jy +
    Math.floor(jy / 33) * 8 +
    Math.floor(((jy % 33) + 3) / 4) +
    78 +
    jd +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)
  gy += 400 * Math.floor(days / 146097)
  days %= 146097
  if (days > 36524) {
    gy += 100 * Math.floor(--days / 36524)
    days %= 36524
    if (days >= 365) days++
  }
  gy += 4 * Math.floor(days / 1461)
  days %= 1461
  if (days > 365) {
    gy += Math.floor((days - 1) / 365)
    days = (days - 1) % 365
  }
  let gd = days + 1
  const sal_a = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const sal_b = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const leap =
    (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0
      ? sal_b
      : sal_a
  let gm = 0
  for (gm = 0; gm < 13; gm++) {
    if (gd <= leap[gm]) break
    gd -= leap[gm]
  }
  return [gy, gm, gd]
}

const PERSIAN_MONTHS = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
]

// قالب‌بندی تاریخ شمسی کامل: ۱۴۰۳/۰۵/۱۲
export function formatJalali(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${toPersianDigits(jy)}/${toPersianDigits(String(jm).padStart(2, "0"))}/${toPersianDigits(String(jd).padStart(2, "0"))}`
}

// قالب‌بندی تاریخ شمسی با نام ماه: ۱۲ مرداد ۱۴۰۳
export function formatJalaliLong(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"
  const [jy, jm, jd] = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate())
  return `${toPersianDigits(jd)} ${PERSIAN_MONTHS[jm - 1]} ${toPersianDigits(jy)}`
}

// قالب‌بندی تاریخ و ساعت
export function formatJalaliDateTime(date: Date | string | null | undefined): string {
  if (!date) return "-"
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return "-"
  const dateStr = formatJalali(d)
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${dateStr} - ${toPersianDigits(hh)}:${toPersianDigits(mm)}`
}

// اعداد انگلیسی به فارسی
export function toPersianDigits(input: string | number): string {
  const persian = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"]
  return String(input).replace(/[0-9]/g, (d) => persian[Number(d)])
}

// اعداد فارسی به انگلیسی
export function toEnglishDigits(input: string): string {
  return input
    .replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
}

// قالب‌بندی عدد با جداکننده (تومان/ریال)
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-"
  return toPersianDigits(num.toLocaleString("en-US"))
}

// قالب‌بندی مبلغ به میلیارد/میلیون
export function formatAmount(num: number | null | undefined): string {
  if (num === null || num === undefined) return "-"
  if (num >= 1_000_000_000) {
    return `${toPersianDigits((num / 1_000_000_000).toFixed(1))} میلیارد`
  }
  if (num >= 1_000_000) {
    return `${toPersianDigits((num / 1_000_000).toFixed(1))} میلیون`
  }
  if (num >= 1_000) {
    return `${toPersianDigits((num / 1_000).toFixed(1))} هزار`
  }
  return toPersianDigits(num.toLocaleString("en-US"))
}

// قالب‌بندی اندازه فایل
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "۰ بایت"
  if (bytes < 1024) return `${toPersianDigits(bytes)} بایت`
  if (bytes < 1024 * 1024) return `${toPersianDigits((bytes / 1024).toFixed(1))} کیلوبایت`
  return `${toPersianDigits((bytes / (1024 * 1024)).toFixed(1))} مگابایت`
}

// محاسبه روزهای باقیمانده تا تاریخ مشخص
export function daysUntil(date: Date | string | null | undefined): number {
  if (!date) return 0
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return 0
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const target = new Date(d)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

// محاسبه روزهای گذشته از تاریخ
export function daysPassed(date: Date | string | null | undefined): number {
  if (!date) return 0
  const d = typeof date === "string" ? new Date(date) : date
  if (isNaN(d.getTime())) return 0
  return -daysUntil(d)
}

// وضعیت قرارداد را بر اساس تاریخ محاسبه کن
export function computeStatus(
  endDate: Date | string,
  status: string
): { status: string; daysLeft: number; label: string; tone: "success" | "warning" | "danger" | "muted" | "destructive" } {
  const daysLeft = daysUntil(endDate)
  if (status === "TERMINATED") {
    return { status, daysLeft, label: "فسخ شده", tone: "destructive" }
  }
  if (status === "PENDING") {
    return { status, daysLeft, label: "در انتظار", tone: "muted" }
  }
  if (daysLeft < 0) {
    return { status: "EXPIRED", daysLeft, label: "منقضی شده", tone: "danger" }
  }
  if (daysLeft <= 30) {
    return { status: "ACTIVE", daysLeft, label: "بحرانی (کمتر از یک ماه)", tone: "danger" }
  }
  if (daysLeft <= 60) {
    return { status: "ACTIVE", daysLeft, label: "در حال اتمام", tone: "warning" }
  }
  return { status: "ACTIVE", daysLeft, label: "فعال", tone: "success" }
}
