import { listBrands } from "@/brands";

// Superadmin Hub: brands CRUD + template picker (DB-backed in production).
export default function Super() {
  const brands = listBrands();
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-display text-3xl">SUPERADMIN HUB</h1>
      <p className="text-sm opacity-60">1 brand live now, multi-brand ready (brand_id everywhere). New brand = copy brands/_template.ts.</p>
      <div className="mt-6 flex flex-col gap-3">
        {brands.map((b) => (
          <div key={b.id} className="rounded-xl border border-white/10 p-4">
            <p className="font-bold">{b.name} <span className="opacity-50">· /{b.template} · {b.currency} · {b.shippingOrigin}</span></p>
            <p className="text-sm opacity-60">{b.seo.description}</p>
            <div className="mt-2 flex gap-2 text-sm">
              <span className="rounded-full border border-white/20 px-3 py-1">Template: {b.template}</span>
              <span className="rounded-full border border-white/20 px-3 py-1">Payments: HOLD (mock)</span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
