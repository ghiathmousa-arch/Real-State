import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

export default function Overview() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div>
      <h1>مرحباً {user?.name} 👋</h1>
      <p>أنت مسجل كـ: {user?.role}</p>
      <button onClick={handleLogout}>تسجيل خروج</button>
    </div>
  );
}