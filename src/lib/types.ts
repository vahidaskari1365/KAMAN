// تایپ‌های مشترک سامانه بایگانی

export type ContractType = "PURCHASE" | "SUPPORT"
export type ContractStatus = "ACTIVE" | "EXPIRED" | "TERMINATED" | "PENDING"
export type UserRole = "ADMIN" | "USER" | "VIEWER"
export type FileKind = "image" | "pdf" | "other"

export const CONTRACT_TYPE_LABEL: Record<string, string> = {
  PURCHASE: "خرید / فروش",
  SUPPORT: "خدمات و پشتیبانی",
}

export const CONTRACT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "فعال",
  EXPIRED: "منقضی شده",
  TERMINATED: "فسخ شده",
  PENDING: "در انتظار",
}

export const USER_ROLE_LABEL: Record<string, string> = {
  ADMIN: "مدیر",
  USER: "کاربر",
  VIEWER: "بیننده",
}

export interface OrganizationWithStats {
  id: string
  name: string
  type: string | null
  economicCode: string | null
  nationalId: string | null
  phone: string | null
  email: string | null
  address: string | null
  contactPerson: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  _count?: { contracts: number }
  purchaseCount?: number
  supportCount?: number
  activeCount?: number
  expiringCount?: number
  totalAmount?: number
}

export interface ContractWithOrg {
  id: string
  contractNumber: string
  organizationId: string
  type: string
  title: string
  startDate: string
  endDate: string
  amount: number | null
  currency: string | null
  description: string | null
  status: string
  reminderDays: number | null
  createdAt: string
  updatedAt: string
  organization?: {
    id: string
    name: string
    type: string | null
  }
  _count?: { files: number }
}

export interface ContractFileDto {
  id: string
  contractId: string
  filename: string
  originalName: string
  fileType: string
  fileSize: number
  category: string | null
  uploadedAt: string
}

export interface UserDto {
  id: string
  name: string
  username: string
  role: string
  email: string | null
  phone: string | null
  active: boolean
  createdAt: string
}

export interface DashboardStats {
  totalOrganizations: number
  totalContracts: number
  purchaseContracts: number
  supportContracts: number
  activeContracts: number
  expiringContracts: number
  expiredContracts: number
  totalFiles: number
  totalAmount: number
  recentContracts: ContractWithOrg[]
  expiringList: ContractWithOrg[]
  contractsByType: { type: string; count: number }[]
  contractsByStatus: { status: string; count: number }[]
}
