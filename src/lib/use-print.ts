"use client"

import { useCallback, useRef, useState } from "react"
import { toast } from "sonner"

export type PaperSize = "a4" | "a5" | "letter" | "legal"

export const PAPER_SIZES: { id: PaperSize; label: string; size: string }[] = [
  { id: "a4", label: "A4 (۲۱×۲۹.۷ سانتی‌متر)", size: "21cm" },
  { id: "a5", label: "A5 (۱۴.۸×۲۱ سانتی‌متر)", size: "14.8cm" },
  { id: "letter", label: "Letter (۲۱.۶×۲۷.۹ سانتی‌متر)", size: "21.6cm" },
  { id: "legal", label: "Legal (۲۱.۶×۳۵.۶ سانتی‌متر)", size: "21.6cm" },
]

/**
 * هوک پرینت با امکان انتخاب اندازه برگه.
 * نحوه استفاده: ref را روی المنتی که می‌خواهید پرینت شود بگذارید،
 * سپس handlePrint را صدا بزنید.
 */
export function useKamanPrint() {
  const printRef = useRef<HTMLDivElement>(null)
  const [paperSize, setPaperSize] = useState<PaperSize>("a4")

  const handlePrint = useCallback(() => {
    const node = printRef.current
    if (!node) {
      toast.error("محتوای قابل پرینت یافت نشد")
      return
    }

    const printWindow = window.open("", "_blank", "width=900,height=700")
    if (!printWindow) {
      toast.error("لطفاً اجازه باز شدن پنجره popup را بدهید")
      return
    }

    const sizeClass = `print-${paperSize}`
    const paper = PAPER_SIZES.find((p) => p.id === paperSize)
    const widthCm = paper?.size || "21cm"

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="fa" dir="rtl">
        <head>
          <meta charset="utf-8" />
          <title>پرینت کمان</title>
          <style>
            @page { size: ${paperSize === "a5" ? "A5" : paperSize === "letter" ? "letter" : paperSize === "legal" ? "legal" : "A4"}; margin: 1cm; }
            * { box-sizing: border-box; }
            body {
              font-family: Vazirmatn, Tahoma, Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background: white;
              color: #1a1a1a;
              direction: rtl;
            }
            .print-area {
              width: ${widthCm};
              max-width: 100%;
              margin: 0 auto;
            }
            table { width: 100%; border-collapse: collapse; font-size: 12px; }
            th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: right; }
            th { background: #f0fdf4; color: #065f46; }
            h1, h2, h3 { color: #047857; }
            .no-print { display: none !important; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; border: 1px solid; }
            .badge-success { background: #d1fae5; color: #047857; border-color: #a7f3d0; }
            .badge-warning { background: #fef3c7; color: #92400e; border-color: #fde68a; }
            .badge-danger { background: #fee2e2; color: #b91c1c; border-color: #fecaca; }
            .kaman-header { text-align: center; border-bottom: 3px solid #047857; padding-bottom: 12px; margin-bottom: 20px; }
            .kaman-header h1 { margin: 0 0 4px; font-size: 20px; }
            .kaman-header p { margin: 0; font-size: 12px; color: #666; }
            .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0; }
            .summary-box .tile { border: 1px solid #ddd; border-radius: 8px; padding: 8px; text-align: center; }
            .summary-box .tile .lbl { font-size: 10px; color: #666; }
            .summary-box .tile .val { font-size: 16px; font-weight: bold; color: #047857; }
            @media print { body { padding: 0; } }
          </style>
        </head>
        <body>
          <div class="${sizeClass} print-area">
            <div class="kaman-header">
              <h1>نرم‌افزار بایگانی پردازش تصویر کمان</h1>
              <p>گزارش تولید شده در ${new Date().toLocaleDateString("fa-IR")}</p>
            </div>
            ${node.innerHTML}
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    // صبر کن تا رندر شود، بعد پرینت
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      // پنجره را نبندیم تا کاربر بتواند ذخیره کند
    }, 400)
  }, [paperSize])

  return { printRef, handlePrint, paperSize, setPaperSize }
}
