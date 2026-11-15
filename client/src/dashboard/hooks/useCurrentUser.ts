// المستخدم الحالي بالداشبورد (اسم/دور للعرض بس) — مكان واحد بدل ما كل ملف يقرا localStorage لحالو.
// الصلاحية الحقيقية بالسيرفر (كوكي الجلسة httpOnly + staffOnly/adminOnly)؛ هون بس لإخفاء/إظهار الأزرار.

export type StaffRole = "admin" | "editor"

export interface CurrentUser {
  id: string
  name: string
  email: string
  role: StaffRole
}

const KEY = "user"
export const STAFF_ROLES: StaffRole[] = ["admin", "editor"]

export const isStaffRole = (role: unknown): role is StaffRole =>
  STAFF_ROLES.includes(role as StaffRole)

// التسميات بالعربي بكل الداشبورد
export const ROLE_LABELS: Record<StaffRole, string> = { admin: "أدمن", editor: "سب أدمن" }

export const saveCurrentUser = (user: any) => {
  localStorage.setItem(KEY, JSON.stringify({
    id: user.id ?? user._id,
    name: user.name,
    email: user.email,
    role: user.role,
  }))
}

export const clearCurrentUser = () => localStorage.removeItem(KEY)

export const getCurrentUser = (): CurrentUser | null => {
  try {
    const user = JSON.parse(localStorage.getItem(KEY) || "null")
    return user && isStaffRole(user.role) ? user : null
  } catch {
    return null
  }
}

export const useCurrentUser = () => {
  const user = getCurrentUser()
  return {
    user,
    isAdmin: user?.role === "admin",
    isEditor: user?.role === "editor",
  }
}
