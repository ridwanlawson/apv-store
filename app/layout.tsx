import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { getBrand } from "@/brands";
import { CartProvider } from "@/lib/cart";
import SmoothScroll from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { CookieConsent } from "@/components/CookieConsent";
import { CurrencyProvider } from "@/lib/currency";
import { AuthProvider } from "@/lib/auth";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export function generateMetadata(): Metadata {
  const b = getBrand();
  return { title: b.seo.title, description: b.seo.description };
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  const b = getBrand();
  return (
    <html lang={b.lang} data-scroll-behavior="smooth" className={`${display.variable} ${body.variable} h-full`}>
      <body
        className="flex min-h-full flex-col font-body"
        style={{ background: b.colors.bg, color: b.colors.fg, ["--brand-fg" as string]: b.colors.fg, ["--brand-accent" as string]: b.colors.accent }}
      >
        <CartProvider>
          <CurrencyProvider>
          <AuthProvider>
          <SmoothScroll>
            <Navbar brandName={b.name} accent={b.colors.accent} />
            <div className="pt-14">{children}</div>
            <footer className="mt-20 border-t border-white/10 px-4 py-10 text-sm opacity-70">
              <div className="mx-auto flex max-w-6xl flex-col gap-2 sm:flex-row sm:justify-between">
                <p>© {new Date().getFullYear()} {b.name} · {b.tagline}</p>
                <nav className="flex gap-4" aria-label="Policies">
                  <a href="/size-guide" className="hover:underline">Size guide</a>
                  <a href="/policies/shipping" className="hover:underline">Shipping</a>
                  <a href="/policies/returns" className="hover:underline">Returns</a>
                  <a href="/policies/privacy" className="hover:underline">Privacy</a>
                </nav>
              </div>
              <p className="mx-auto mt-2 max-w-6xl">Contact: {b.contact} · Duties (DDU) by buyer · Returns 30 days (buyer pays return shipping)</p>
            </footer>
            <CookieConsent />
          </SmoothScroll>
          </AuthProvider>
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
