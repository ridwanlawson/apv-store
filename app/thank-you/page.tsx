import type { Metadata } from "next";
import { redirect } from "next/navigation";

// Alias manusia/iklan untuk /success. Logic order tetap di /success.
export const metadata: Metadata = {
  title: "Thank you",
  robots: { index: false, follow: false },
};

export default async function ThankYou({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;
}) {
  const sp = typeof (searchParams as Promise<unknown>)?.then === "function"
    ? await (searchParams as Promise<Record<string, string | string[] | undefined>>)
    : ((searchParams ?? {}) as Record<string, string | string[] | undefined>);
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === "string") q.set(k, v);
    else if (Array.isArray(v) && v[0] !== undefined) q.set(k, String(v[0]));
  }
  const suffix = q.size > 0 ? `?${q.toString()}` : "";
  redirect(`/success${suffix}`);
}
