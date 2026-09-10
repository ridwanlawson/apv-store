export type ProductType = "pod" | "stock";

export interface Product {
  id: string;
  brandId: string;
  name: string;
  slug: string;
  priceUsd: number;
  compareAt?: number;
  weightG: number;
  type: ProductType;
  stockQty?: number;
  podSku?: string;
  images: string[];
  video?: string; // mp4 inline di PDP (352p–720p, <3MB)
  sizes: string[];
  colors: string[];
  fabric: string;
  badge?: string;
  isSample: boolean;
  published: boolean;
}

const u = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=80`;

// 10 sample SKUs (5 POD + 5 stock). isSample:true -> purge 1 klik di /admin.
export const products: Product[] = [
  { id: "p1", brandId: "a-private-violence", name: "Riot Heavyweight Tee", slug: "riot-heavyweight-tee", priceUsd: 38, weightG: 250, type: "pod", podSku: "APV-TEE-001", images: [u("photo-1521572163474-6864f9cf17ab"), u("photo-1503341504253-dff4815485f1")], video: "/seq/tee-705/spin.mp4", sizes: ["S", "M", "L", "XL"], colors: ["Black", "Bone"], fabric: "240 GSM cotton", badge: "POD Worldwide", isSample: true, published: true },
  { id: "p2", brandId: "a-private-violence", name: "Silence Hoodie", slug: "silence-hoodie", priceUsd: 72, weightG: 600, type: "pod", podSku: "APV-HDD-002", images: [u("photo-1556821840-3a63f95609a7"), u("photo-1578681994506-b8f463449011")], sizes: ["M", "L", "XL"], colors: ["Black"], fabric: "400 GSM fleece", badge: "POD Worldwide", isSample: true, published: true },
  { id: "p3", brandId: "a-private-violence", name: "Static Cargo Pants", slug: "static-cargo-pants", priceUsd: 68, weightG: 550, type: "stock", stockQty: 24, images: [u("photo-1473966968600-fa801b869a1a"), u("photo-1517438476312-10d79c077509")], sizes: ["30", "32", "34"], colors: ["Black", "Olive"], fabric: "Ripstop cotton", badge: "Limited Indonesia", isSample: true, published: true },
  { id: "p4", brandId: "a-private-violence", name: "Noise Denim Jacket", slug: "noise-denim-jacket", priceUsd: 85, weightG: 800, type: "stock", stockQty: 12, images: [u("photo-1551537482-f2075a1d41f2"), u("photo-1523205771623-e0fcbd6d2816")], sizes: ["M", "L"], colors: ["Washed Black"], fabric: "14oz denim", badge: "Limited Indonesia", isSample: true, published: true },
  { id: "p5", brandId: "a-private-violence", name: "Aftermath Longsleeve", slug: "aftermath-longsleeve", priceUsd: 45, weightG: 300, type: "pod", podSku: "APV-LNG-005", images: [u("photo-1618354691373-d851c5c3a990"), u("photo-1620799140408-edc6dcb6d633")], sizes: ["S", "M", "L", "XL"], colors: ["Black", "White"], fabric: "220 GSM cotton", badge: "POD Worldwide", isSample: true, published: true },
  { id: "p6", brandId: "a-private-violence", name: "Bruise Work Shirt", slug: "bruise-work-shirt", priceUsd: 58, weightG: 350, type: "stock", stockQty: 18, images: [u("photo-1596755094514-f87e34085b2c"), u("photo-1602810318383-e386cc2a3ccf")], sizes: ["M", "L", "XL"], colors: ["Black"], fabric: "Twill cotton", badge: "Limited Indonesia", isSample: true, published: true },
  { id: "p7", brandId: "a-private-violence", name: "Concrete Knit Sweater", slug: "concrete-knit-sweater", priceUsd: 64, weightG: 500, type: "pod", podSku: "APV-KNT-007", images: [u("photo-1576871337622-98d48d1cf531"), u("photo-1611312449408-fcece27cdbb7")], sizes: ["M", "L"], colors: ["Charcoal"], fabric: "Acrylic-wool blend", badge: "POD Worldwide", isSample: true, published: true },
  { id: "p8", brandId: "a-private-violence", name: "Grief Bomber", slug: "grief-bomber", priceUsd: 82, weightG: 700, type: "stock", stockQty: 9, images: [u("photo-1591047139829-d91aecb6caea"), u("photo-1548126032-079a0fb0099d")], sizes: ["M", "L"], colors: ["Black"], fabric: "Nylon satin", badge: "Limited Indonesia", isSample: true, published: true },
  { id: "p9", brandId: "a-private-violence", name: "Private Cap", slug: "private-cap", priceUsd: 28, weightG: 120, type: "pod", podSku: "APV-CAP-009", images: [u("photo-1588850561407-ed78c282e89b"), u("photo-1521369909029-2afed882baee")], sizes: ["OS"], colors: ["Black"], fabric: "6-panel twill", badge: "POD Worldwide", isSample: true, published: true },
  { id: "p10", brandId: "a-private-violence", name: "Violence Backpack", slug: "violence-backpack", priceUsd: 42, weightG: 700, type: "stock", stockQty: 40, images: [u("photo-1553062407-98eeb64c6a62"), u("photo-1491637639811-60e2756cc1c7")], sizes: ["OS"], colors: ["Black", "Brown"], fabric: "900D canvas", badge: "Limited Indonesia", isSample: true, published: true },
];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);
export const usd = (n: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
