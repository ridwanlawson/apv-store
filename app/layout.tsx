import type { Metadata } from "next";
import { Anton, Inter } from "next/font/google";
import "./globals.css";
import { getBrand } from "@/brands";
import { CartProvider } from "@/lib/cart";
import SmoothScroll from "@/components/SmoothScroll";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CookieConsent } from "@/components/CookieConsent";
import { CurrencyProvider } from "@/lib/currency";
import { AuthProvider } from "@/lib/auth";
import { LangProvider } from "@/lib/i18n";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const body = Inter({ subsets: ["latin"], variable: "--font-body" });

export function generateMetadata(): Metadata {
  const b = getBrand();
  return {
    title: b.seo.title,
    description: b.seo.description,
    icons: (b.favicon ?? b.logo) ? [{ rel: "icon", url: (b.favicon ?? b.logo) as string }] : undefined,
  };
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
          <LangProvider>
          <SmoothScroll>
            <Navbar brandName={b.name} accent={b.colors.accent} logo={b.logo} />
            <div className="pt-[100px] sm:pt-16">{children}</div>
            <Footer />
            <CookieConsent />
          </SmoothScroll>
          </LangProvider>
          </AuthProvider>
          </CurrencyProvider>
        </CartProvider>
      </body>
    </html>
  );
}
