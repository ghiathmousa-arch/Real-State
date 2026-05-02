import { Outlet } from "react-router-dom"

const Auth = () => {
  return (
    <div className="bg-[#f9f9ff] text-[#161c27] min-h-screen flex items-center justify-center p-4">
      <Outlet />
    </div>
  )
}

export default Auth