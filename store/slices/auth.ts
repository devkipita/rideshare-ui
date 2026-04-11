import { create } from "zustand";
import { persist } from "zustand/middleware";

type Role = "passenger" | "driver";

interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  image?: string;
  verified?: boolean;
}

interface AuthState {
  user: User | null;
  role: Role;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setRole: (role: Role) => void;
  toggleRole: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: "passenger",
      isAuthenticated: false,

      setUser: (user) =>
        set({ user, isAuthenticated: !!user }),

      setRole: (role) => set({ role }),

      toggleRole: () =>
        set((s) => ({
          role: s.role === "passenger" ? "driver" : "passenger",
        })),

      logout: () =>
        set({ user: null, isAuthenticated: false, role: "passenger" }),
    }),
    { name: "kipita-auth" },
  ),
);
