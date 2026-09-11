"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabaseConfigured, getSession } from "./supabase";

// Auth ganda: demo (tanpa env, dev saja) + Supabase Auth asli (saat env terisi).
// Role SELALU dari tabel profiles (server truth). Tanpa baris = "pending".
// Tanpa dependensi baru — REST langsung. UI tidak berubah saat migrasi.
export type Role = "superadmin" | "brand_admin" | "pending";
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

const SESSION_KEY = "apv-session-v1";

function decodeJwt(token: string): Record<string, unknown> | null {
  try {
    return JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function decodeEmail(token: string): string | null {
  const payload = decodeJwt(token);
  if (!payload) return null;
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) return null;
  return typeof payload.email === "string" ? payload.email : null;
}

/** Tangkap sesi dari hash URL (#access_token=...) sepulang magic link.
 * Return { user, redirected } — redirect async via efek di bawah. */
function consumeHash(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const h = window.location.hash;
  if (!h.includes("access_token=")) return null;
  const q = new URLSearchParams(h.slice(1));
  const access = q.get("access_token");
  const refresh = q.get("refresh_token");
  const email = access ? decodeEmail(access) : null;
  if (!access || !email) return null;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ access, refresh, email }));
  } catch {
    /* abaikan */
  }
  const user: AuthUser = { email, role: "pending", provider: "supabase" };
  try {
    localStorage.setItem(KEY, JSON.stringify(user));
    sessionStorage.setItem("apv-just-login", "1");
  } catch {
    /* abaikan */
  }
  return user;
}

function loadUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  // Prioritas: sesi baru dari magic link.
  const fromHash = consumeHash();
  if (fromHash) {
    try {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch {
      /* abaikan */
    }
    return fromHash;
  }
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

  // Sepulang magic link: antar ke /admin sekali (tanpa setState -> aman lint).
  useEffect(() => {
    try {
      if (sessionStorage.getItem("apv-just-login")) {
        sessionStorage.removeItem("apv-just-login");
        if (!window.location.pathname.startsWith("/admin")) window.location.replace("/admin");
      }
    } catch {
      /* abaikan */
    }
  }, []);

  // Resolusi role dari profiles (server truth). Self-register pending bila belum ada.
  useEffect(() => {
    if (!supabaseConfigured()) return;
    const s = getSession();
    if (!s?.access) return;
    const payload = decodeJwt(s.access);
    const sub = payload && typeof payload.sub === "string" ? payload.sub : null;
    if (!sub) return;
    let live = true;
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
    const headers = { apikey: key, Authorization: `Bearer ${s.access}`, "Content-Type": "application/json" };
    (async () => {
      try {
        // Daftarkan diri sebagai pending (diabaikan bila baris sudah ada).
        await fetch(`${base}/rest/v1/profiles`, {
          method: "POST",
          headers: { ...headers, Prefer: "return=minimal" },
          body: JSON.stringify({ user_id: sub, email: s.email, role: "pending" }),
        }).catch(() => undefined);
        const res = await fetch(`${base}/rest/v1/profiles?select=role&limit=1`, { headers });
        if (!res.ok) return;
        const rows = (await res.json()) as { role: string }[];
        const role = (["superadmin", "brand_admin", "pending"] as const).find((x) => x === rows[0]?.role);
        if (!live || !role) return;
        setUser((prev) => {
          if (!prev || prev.role === role) return prev;
          const next = { ...prev, role };
          try {
            localStorage.setItem(KEY, JSON.stringify(next));
          } catch {
            /* abaikan */
          }
          return next;
        });
      } catch {
        /* offline -> pertahankan peran lokal */
      }
    })();
    return () => {
      live = false;
    };
  }, []);

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
      // JANGAN login di sini — login terjadi saat user kembali membawa #access_token.
    },
    logout: () => {
      persist(null);
      try {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem("apv-just-login");
      } catch {
        /* abaikan */
      }
    },
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth outside provider");
  return c;
}
