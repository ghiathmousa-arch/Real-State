import axios from "axios";

const BASE = "http://localhost:5000/api";

// تسجيل الدخول
export const loginApi = async (email: string, password: string) => {
  const res = await axios.post(`${BASE}/auth/login`, { email, password });
  return res.data; // يرجع { token, user }
};