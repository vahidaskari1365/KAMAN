"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, FileText, Image as ImageIcon, Loader2, X } from "lucide-react"
import { formatFileSize, formatJalaliDateTime } from "@/lib/persian"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

interface FileViewerProps {
  fileId: string | null
  fileName: string
  fileType: string
  fileSize: number
  uploadedAt?: string
  open: boolean
  onOpenChange: (o: boolean) => void
}

export function FileViewer({
  fileId,
  fileName,
  fileType,
  fileSize,
  uploadedAt,
  open,
  onOpenChange,
}: FileViewerProps) {
  const [loaded, setLoaded] = useState(false)
  const isImage = fileType.startsWith("image/")
  const isPdf = fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")

  const downloadUrl = fileId ? `/api/files/${fileId}?download=1` : ""
  const viewUrl = fileId ? `/api/files/${fileId}` : ""

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); setLoaded(false) }}>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b bg-muted/40 flex-row items-center justify-between space-y-0">
          <div className="min-w-0 flex-1">
            <DialogTitle className="truncate text-base">
              {fileName}
            </DialogTitle>
            <DialogDescription className="text-xs mt-0.5">
              {formatFileSize(fileSize)}
              {uploadedAt ? ` • بارگذاری در ${formatJalaliDateTime(uploadedAt)}` : ""}
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button asChild size="sm" variant="default">
              <a href={downloadUrl} target="_blank" rel="noreferrer">
                <Download className="ml-1 h-4 w-4" />
                دانلود
              </a>
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-auto bg-muted/20 flex items-center justify-center p-3">
          {!loaded && (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm">در حال بارگذاری فایل...</span>
            </div>
          )}
          {isImage && fileId && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={viewUrl}
              alt={fileName}
              className={cn(
                "max-w-full max-h-full object-contain rounded-lg transition-opacity",
                loaded ? "opacity-100" : "opacity-0 absolute"
              )}
              onLoad={() => setLoaded(true)}
            />
          )}
          {isPdf && fileId && (
            <iframe
              src={viewUrl}
              title={fileName}
              className={cn(
                "w-full h-full rounded-lg border-0 bg-white transition-opacity",
                loaded ? "opacity-100" : "opacity-0 absolute"
              )}
              onLoad={() => setLoaded(true)}
            />
          )}
          {!isImage && !isPdf && fileId && (
            <div className="text-center p-8">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground mb-4">
                پیش‌نمایش این نوع فایل پشتیبانی نمی‌شود
              </p>
              <Button asChild variant="default">
                <a href={downloadUrl} target="_blank" rel="noreferrer">
                  <Download className="ml-1 h-4 w-4" />
                  دانلود فایل
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// کامپوننت کوچک برای نمایش آیتم فایل در لیست
export function FileThumb({
  fileType,
  fileName,
  className,
  onClick,
}: {
  fileType: string
  fileName: string
  className?: string
  onClick?: () => void
}) {
  const isImage = fileType.startsWith("image/")
  const isPdf = fileType === "application/pdf" || fileName.toLowerCase().endsWith(".pdf")
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-lg",
        isImage
          ? "bg-[#046bd2]/15 text-[#046bd2] dark:text-[#5aa9ff]"
          : isPdf
            ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
            : "bg-muted text-muted-foreground",
        onClick && "cursor-pointer hover:scale-105 transition-transform",
        className
      )}
    >
      {isImage ? <ImageIcon className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
    </div>
  )
}
