import { create } from "zustand";
import { persist } from "zustand/middleware";

// شكل البيانات اللي رح نحفظها
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface AuthStore {
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  // persist = يحفظ البيانات بـ localStorage تلقائياً
  // يعني لو أغلق المتصفح وفتحه، يبقى مسجل دخول
  persist(
    (set) => ({
      token: null,
      user: null,

      login: (token, user) => set({ token, user }),

      logout: () => set({ token: null, user: null }),
    }),
    { name: "auth" } // اسم المفتاح بـ localStorage
  )
);