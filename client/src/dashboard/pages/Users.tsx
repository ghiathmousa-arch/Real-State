// صفحة "المستخدمين" (أدمن): جدول الحسابات + إنشاء حساب جديد (الافتراضي سب أدمن) + حذف بتأكيد.
// السيرفر بيمنع حذف حسابك وحذف آخر أدمن، وعقارات المحذوف بتضل (اسم المضيف محفوظ فيها).

import { useCallback, useEffect, useState } from "react"
import { MdDelete, MdPersonAdd } from "react-icons/md"
import Header from "../components/Header/Header"
import FormInput from "../../components/FormInput/FormInput"
import FormSelect from "../../components/FormSelect/FormSelect"
import DeleteConfirmModal from "../components/DeleteConfirmModal/DeleteConfirmModal"
import { api, getApiError } from "../../utils/api"
import { ROLE_LABELS, useCurrentUser, type StaffRole } from "../hooks/useCurrentUser"

interface UserRow {
  id: string
  name: string
  email: string
  role: StaffRole | "user"
  createdAt: string
  propertiesCount: number
}

const ROLE_OPTIONS = [
  { value: "editor", label: ROLE_LABELS.editor },
  { value: "admin", label: ROLE_LABELS.admin },
]

const EMPTY_FORM = { name: "", email: "", password: "", role: "editor" }

const Users = () => {
  const { user: me } = useCurrentUser()
  const [users, setUsers] = useState<UserRow[]>([])
  const [loading, setLoading] = useState(true)
  const [listError, setListError] = useState("")

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [formSuccess, setFormSuccess] = useState("")

  const [toDelete, setToDelete] = useState<UserRow | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setListError("")
    try {
      const { data } = await api.get("/auth/users")
      setUsers(Array.isArray(data) ? data : [])
    } catch (err) {
      setListError(getApiError(err, "تعذّر جلب المستخدمين"))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setFormError("")
    setFormSuccess("")
    try {
      await api.post("/auth/register", form)
      setFormSuccess(`تم إنشاء حساب ${form.name}`)
      setForm(EMPTY_FORM)
      fetchUsers()
    } catch (err) {
      setFormError(getApiError(err, "تعذّر إنشاء الحساب"))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!toDelete) return
    try {
      await api.delete(`/auth/users/${toDelete.id}`)
      setToDelete(null)
      fetchUsers()
    } catch (err) {
      setToDelete(null)
      setListError(getApiError(err, "تعذّر حذف المستخدم"))
    }
  }

  const set = (field: keyof typeof EMPTY_FORM) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }))

  return (
    <div className="p-4 sm:p-8 bg-[#f8faff] min-h-screen" dir="rtl">
      <Header title="المستخدمين" description="حسابات الأدمن والسب أدمن" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        {/* ── الجدول ── */}
        <div className="xl:col-span-2 bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
          {listError && (
            <p className="m-4 text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{listError}</p>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm">
              <thead className="bg-gray-50/50 text-[10px] text-gray-400 font-black border-b border-gray-50">
                <tr>
                  <th className="px-4 py-3">الاسم</th>
                  <th className="px-4 py-3">الإيميل</th>
                  <th className="px-4 py-3 text-center">الدور</th>
                  <th className="px-4 py-3 text-center">العقارات</th>
                  <th className="px-4 py-3 text-center">تاريخ الإنشاء</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 font-bold">جاري التحميل...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-gray-400 font-bold">ما في مستخدمين</td></tr>
                ) : users.map(u => {
                  const isMe = u.id === me?.id
                  return (
                    <tr key={u.id} className="hover:bg-blue-50/10">
                      <td className="px-4 py-3 font-black text-[#0f2d4a] whitespace-nowrap">
                        {u.name}{isMe && <span className="ms-2 text-[10px] text-gray-400">(أنت)</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-500" dir="ltr">{u.email}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[11px] font-black px-2.5 py-1 rounded-full ${u.role === "admin" ? "bg-[#004e80] text-white" : "bg-amber-100 text-amber-700"}`}>
                          {u.role === "user" ? "مستخدم" : ROLE_LABELS[u.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-gray-600">{u.propertiesCount}</td>
                      <td className="px-4 py-3 text-center text-gray-400 text-xs whitespace-nowrap">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-SY") : "—"}
                      </td>
                      <td className="px-4 py-3 text-left">
                        {!isMe && (
                          <button onClick={() => setToDelete(u)} title="حذف"
                            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition-all">
                            <MdDelete size={20} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── إنشاء حساب ── */}
        <form onSubmit={handleCreate} className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 flex flex-col gap-4 self-start">
          <h2 className="text-lg font-black text-[#0f2d4a] flex items-center gap-2"><MdPersonAdd /> حساب جديد</h2>
          <FormInput name="name" label="الاسم" required value={form.name} onChange={set("name")} />
          <FormInput name="email" label="الإيميل" type="email" dir="ltr" required value={form.email} onChange={set("email")} />
          <FormInput name="password" label="كلمة السر (6 أحرف على الأقل)" type="password" dir="ltr" required value={form.password} onChange={set("password")} />
          <FormSelect name="role" label="الدور" options={ROLE_OPTIONS} value={form.role} onChange={set("role")} />

          {formError && <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-200 rounded-2xl px-4 py-3">{formError}</p>}
          {formSuccess && <p className="text-sm font-bold text-green-700 bg-green-50 border border-green-200 rounded-2xl px-4 py-3">{formSuccess}</p>}

          <button type="submit" disabled={saving}
            className="py-4 bg-[#0f2d4a] text-white rounded-2xl font-black hover:bg-blue-900 transition disabled:opacity-50">
            {saving ? "جاري الإنشاء..." : "إنشاء الحساب"}
          </button>
        </form>
      </div>

      <DeleteConfirmModal
        isOpen={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={handleDelete}
        title={toDelete?.name ?? ""}
        message="الحساب رح ينحذف نهائياً. العقارات اللي أضافها بتضل، واسمه بيضل ظاهر عليها."
      />
    </div>
  )
}

export default Users
