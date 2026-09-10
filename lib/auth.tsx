"use client";
import { createContext, useContext, useState, type ReactNode } from "react";
import { supabaseConfigured } from "./supabase";

// Auth ganda: demo (tanpa env) + Supabase Auth asli (saat env terisi).
// Tanpa dependensi baru — REST langsung. UI tidak berubah saat migrasi.
export type Role = "superadmin" | "brand_admin" | "customer";
export interface AuthUser { email: string; role: Role; provider: "demo" | "supabase" }

interface AuthCtx {
  user: AuthUser | null;
  mode: "demo" | "supabase";
  demoLogin: (email: string) => void;
  magicLink: (email: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);
const KEY = "apv-auth-v1";
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPA_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadUser);
  const mode = supabaseConfigured() ? "supabase" : "demo";

  const persist = (u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) localStorage.setItem(KEY, JSON.stringify(u));
      else localStorage.removeItem(KEY);
    } catch {
      /* abaikan */
    }
  };

  const value: AuthCtx = {
    user,
    mode,
    demoLogin: (email) => {
      const clean = email.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean)) return;
      persist({ email: clean, role: "brand_admin", provider: "demo" });
    },
    magicLink: async (email) => {
      const clean = email.trim().toLowerCase();
      const res = await fetch(`${SUPA_URL}/auth/v1/magiclink`, {
        method: "POST",
        headers: { apikey: SUPA_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: clean }),
      });
      if (!res.ok) throw new Error("Magic link failed");
      // User klik link email -> kembali dengan session; untuk MVP simpan sebagai pending.
      persist({ email: clean, role: "brand_admin", provider: "supabase" });
    },
    logout: () => persist(null),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
