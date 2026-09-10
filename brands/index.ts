import { aPrivateViolence, type BrandConfig } from "./a-private-violence";

export type { BrandConfig };

const registry: Record<string, BrandConfig> = {
  "a-private-violence": aPrivateViolence,
};

export function getBrand(id?: string): BrandConfig {
  const key = id ?? process.env.NEXT_PUBLIC_BRAND ?? "a-private-violence";
  return registry[key] ?? aPrivateViolence;
}

export function listBrands(): BrandConfig[] {
  return Object.values(registry);
}
