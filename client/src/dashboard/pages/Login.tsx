import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthForm from "../components/AuthForm/AuthForm"

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
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      })
      const json = await res.json()

      if (!json.token) return alert(json.error || "بيانات خاطئة")
      if (json.user.role !== "admin") return alert("ليس لديك صلاحية")

      // حفظ التوكن وبيانات المستخدم كاملة
      localStorage.setItem("token", json.token)
      localStorage.setItem("user", JSON.stringify({
        id: json.user.id,
        name: json.user.name,
        email: json.user.email,
        role: json.user.role
      }))

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