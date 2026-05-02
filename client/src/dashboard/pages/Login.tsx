import { useState } from "react"
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
  const inputs=[
    { lable: "Email", type: "email", name: "email", pleaceholder: "Enter your email" },
    { lable: "Password", type: "password", name: "password", pleaceholder: "Enter your password" }
  ]
  return (
    <>
      <AuthForm<LoginData>
        title="Real state"
        description="Welcome back to Real state"
        inputs={inputs}
        checkbox={{ lable: "Remember me", name: "remember" }}
        btn="Login"
        setData={setData}
      />
      </>

    
  )
}

export default Login