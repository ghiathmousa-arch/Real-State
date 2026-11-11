import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthForm from "../components/AuthForm/AuthForm"
import { api, getApiError } from "../../utils/api"
import { isStaffRole, saveCurrentUser } from "../hooks/useCurrentUser"

export interface LoginData {
  email: string,
  password: string,
  remember: boolean
}


const Login = () => {
  const [data, setData] = useState<LoginData>({
    email: "",
    password: "",
    remember: false
  })
  const navigate = useNavigate()

  const handleSubmit = async (formData: LoginData) => {
    let json
    try {
      // withCredentials (بالـ api instance) عشان كوكي الجلسة (httpOnly) ينحفظ بالمتصفح
      const res = await api.post("/auth/login", formData)
      json = res.data
    } catch (err: any) {
      // رد من السيرفر (401/400/429…) = نعرض رسالته بس لو قصيرة ومتوقعة — getApiError بتفحص الطول
      if (err?.response) return alert(getApiError(err, "بيانات خاطئة"))
      console.log(err)
      return alert("حدث خطأ، تحقق من الاتصال")
    }

    try {
      // الأدمن والسب أدمن (editor) بس
      if (!isStaffRole(json.user.role)) return alert("ليس لديك صلاحية")

      // نخزّن بيانات العرض فقط (اسم/دور) — الجلسة الفعلية بكوكي httpOnly غير قابل للقراءة من JS
      saveCurrentUser(json.user)

      navigate("/dashboard")

    } catch (err) {
      console.log(err)
      alert("حدث خطأ، تحقق من الاتصال")
    }
  }

  const inputs = [
    { lable: "Email", type: "email", name: "email", pleaceholder: "Enter your email" },
    { lable: "Password", type: "password", name: "password", pleaceholder: "Enter your password" }
  ]

  return (
    <AuthForm<LoginData>
      title="Real state"
      description="Welcome back to Real state"
      inputs={inputs}
      checkbox={{ lable: "Remember me", name: "remember" }}
      btn="Login"
      setData={setData}
      onSubmit={handleSubmit}
    />
  )
}

export default Login