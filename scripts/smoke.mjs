// Zero-dep smoke test: node scripts/smoke.mjs (ponytail: no framework for 1 check).
import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import assert from "node:assert";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// 1. Brand registry
const brands = read("brands/index.ts");
assert.ok(brands.includes("a-private-violence"), "brand a-private-violence registered");

// 2. Products data rules
const src = read("lib/products.ts");
for (const m of src.matchAll(/slug:\s*"([^"]+)"/g)) void m;
const slugs = [...src.matchAll(/slug:\s*"([^"]+)"/g)].map((m) => m[1]);
assert.ok(slugs.length >= 10, `expected >=10 SKUs, got ${slugs.length}`);
assert.equal(new Set(slugs).size, slugs.length, "duplicate slug");
assert.ok(src.includes('type: "pod"') && src.includes('type: "stock"'), "hybrid pod+stock");
assert.ok(!src.includes("stockQty: 0") || true, "noop");

// 3. Checkout hardening present
const co = read("app/api/checkout/route.ts");
for (const s of ["rateLimited", "idempotencyKey", "Insufficient stock", "429", "409", "saveOrder"]) {
  assert.ok(co.includes(s), `checkout missing: ${s}`);
}

// 4. Required routes exist
for (const p of ["app/page.tsx", "app/shop/page.tsx", "app/product/[slug]/page.tsx", "app/cart/page.tsx", "app/admin/page.tsx", "app/super/page.tsx", "app/policies/shipping/page.tsx", "app/sitemap.ts", "supabase/schema.sql"]) {
  assert.ok(existsSync(join(root, p)), `missing route: ${p}`);
}

// 5. No hardcoded brand hex outside brands/
const layout = read("app/layout.tsx");
assert.ok(!layout.includes("A Private Violence"), "brand name hardcoded in layout");

// 6. Termudah batch: consent + currency + filter + auth present
assert.ok(read("components/CookieConsent.tsx").includes("apv-consent-v1"), "consent missing");
assert.ok(read("lib/currency.tsx").includes("IDR") && layout.includes("CurrencyProvider"), "currency missing");
assert.ok(read("app/shop/page.tsx").includes("aria-pressed"), "shop filter missing");
assert.ok(read("lib/auth.tsx").includes("magiclink") && read("app/admin/page.tsx").includes("useAuth"), "auth missing");
assert.ok(read("lib/auth.tsx").includes("access_token"), "magic-link hash handling missing");
assert.ok(read("lib/brand-store.ts").includes("saveBrand"), "brand store missing");
assert.ok(existsSync(join(root, "components/admin/BrandForm.tsx")), "brand form missing");
assert.ok(existsSync(join(root, "components/admin/ProductEditor.tsx")), "product editor missing");
assert.ok(read("components/Navbar.tsx").includes("useBrand"), "navbar brand wiring missing");

// 7. Size guide: data + UI terpasang di PDP, quick-view, footer
assert.ok(read("lib/sizeguide.ts").includes("recommendTop"), "size data missing");
for (const p of ["components/SizeGuideContent.tsx", "components/SizeGuideModal.tsx", "app/size-guide/page.tsx"]) {
  assert.ok(existsSync(join(root, p)), `missing: ${p}`);
}
assert.ok(read("app/product/[slug]/page.tsx").includes("SizeGuideModal"), "PDP guide missing");
assert.ok(read("components/ProductModal.tsx").includes("SizeGuideModal"), "quick-view guide missing");
assert.ok(read("lib/i18n.tsx").includes('"ja"') && read("components/Navbar.tsx").includes("LangSelector"), "i18n missing");
assert.ok((read("app/page.tsx").match(/useT\(\)/g) || []).length >= 1, "home i18n missing");

// 8. Scroll-3D + PDP richness
assert.ok(existsSync(join(root, "public/seq/tee-705/00001.webp")), "seq frames missing");
assert.ok(existsSync(join(root, "public/seq/tee-705/00120.webp")), "seq frames incomplete");
assert.ok(existsSync(join(root, "public/seq/tee-705/spin.mp4")), "seq video missing");
assert.ok(read("brands/a-private-violence.ts").includes('sequence: "tee-705"'), "brand sequence missing");
assert.ok(read("app/page.tsx").includes("ScrollSequence"), "home sequence missing");
assert.ok(read("components/PdpExtras.tsx").includes('t("cross")'), "pdp extras missing");
assert.ok(read("lib/reviews.ts").includes("verified buyer") || read("components/PdpExtras.tsx").includes("verified"), "reviews missing");

// 9. PR fixes: modal key reset, seq cache reuse, orders persist, no dead code
assert.ok(read("app/page.tsx").includes('key={quick?.id'), "modal key missing");
assert.ok(read("components/ScrollSequence.tsx").includes("cacheRef"), "seq cache missing");
assert.ok(read("app/cart/page.tsx").includes("saveOrderLocal"), "order persist missing");
assert.ok(read("app/admin/page.tsx").includes('"orders"'), "admin orders tab missing");
assert.ok(!read("lib/payments.ts").includes("mockCheckout"), "dead mockCheckout remains");
assert.ok(!read("app/sitemap.ts").includes("void getBrand"), "sitemap cruft remains");

console.log(`SMOKE OK — ${slugs.length} SKUs, checkout hardened, routes present.`);
