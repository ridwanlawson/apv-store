import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { resolveBrand } from "@/lib/brand-resolve";
import { BrandProvider } from "@/lib/brand-store";
import { CartProvider } from "@/lib/cart";
import SmoothScroll from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Preloader } from "@/components/Preloader";
import { ApplyBrandTheme } from "@/components/ApplyBrandTheme";
import { CookieConsent } from "@/components/CookieConsent";
import { CurrencyProvider } from "@/lib/currency";
import { AuthProvider } from "@/lib/auth";
import { LangProvider } from "@/lib/i18n";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export async function generateMetadata(): Promise<Metadata> {
  const { brand: b } = await resolveBrand();
  return {
    title: b.seo.title,
    description: b.seo.description,
    icons: (b.favicon ?? b.logo) ? [{ rel: "icon", url: (b.favicon ?? b.logo) as string }] : undefined,
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const { brand: b, known } = await resolveBrand();
  if (!known) {
    return (
      <html lang="en">
        <body style={{ background: "#0A0A0A", color: "#EDEAE4", display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
          <main style={{ textAlign: "center", padding: 24 }}>
            <h1>Brand tidak aktif</h1>
            <p style={{ opacity: 0.6 }}>Toko ini sedang nonaktif. Hubungi pemilik.</p>
          </main>
        </body>
      </html>
    );
  }
  return (
    <html lang={b.lang} data-scroll-behavior="smooth" className={`${display.variable} ${body.variable} h-full`}>
      <body
        className="flex min-h-full flex-col font-body"
        style={{ background: b.colors.bg, color: b.colors.fg, ["--brand-fg" as string]: b.colors.fg, ["--brand-accent" as string]: b.colors.accent }}
      >
        <CartProvider>
          <CurrencyProvider>
          <AuthProvider>
          <LangProvider>
          <BrandProvider initial={b}>
          <SmoothScroll>
            <Preloader />
            <ApplyBrandTheme />
            <Navbar />
            <div className="pt-[100px] sm:pt-16">{children}</div>
            <Footer />
            <CookieConsent />
          </SmoothScroll>
          </BrandProvider>
          </LangProvider>
          </AuthProvider>
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
