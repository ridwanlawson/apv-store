"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useMounted } from "./store";

// Tiga bahasa storefront: EN default, JA + ID. Admin tetap EN (internal).
// Default EN sampai hydrate (anti hydration-mismatch), lalu bahasa simpanan.
export type Lang = "en" | "ja" | "id";
const KEY = "apv-lang-v1";

const dict: Record<Lang, Record<string, string>> = {
  en: {
    navShop: "Shop", navLook: "Lookbook", navTrack: "Track", navCart: "Cart",
    seqBadge: "DROP 001 — SCROLL TO ROTATE", seqCta: "Shop the drop",
    step1t: "FRONT", step1d: "Heavyweight tee with chest hit. Boxy cut, clean drape.",
    step2t: "360° SPIN", step2d: "Keep scrolling — inspect every angle, seam and stitch.",
    step3t: "MACRO WEAVE", step3d: "Tight knit, zero see-through. Built to outlast trends.",
    dropTitle: "LATEST DROP", dropSub: "Swipe sideways. Click a piece for quick view.", viewAll: "View all",
    storyT1: "01 / HEAVY FABRIC", storyD1: "240–400 GSM. No see-through, no shrink excuses. Wash cold, hang dry.",
    storyT2: "02 / TRUE FIT", storyD2: "Model 178cm wears M. Size chart US/EU/Asia in cm+inch on every product.",
    storyT3: "03 / SHIPPED WORLDWIDE", storyD3: "POD ships from US/EU hubs. Limited pieces fly from Indonesia. Track everything.",
    storyCta: "Shop best sellers →",
    shopTitle: "SHOP ALL", shopSearch: "Search tees, hoodies, cargos…",
    fAll: "All", fPod: "POD Worldwide", fStock: "Limited Stock",
    sortFeat: "Featured", sortLow: "Price ↑", sortHigh: "Price ↓", sortName: "Name A–Z",
    pieces: "pieces", shopEmpty: "Nothing matches. Try another keyword.",
    size: "SIZE", sizeGuide: "Size guide", sizeGuideLong: "Size guide — find your fit",
    addToCart: "Add to cart", added: "Added ✓",
    shipNote: "Worldwide: Economy 10–20 days · Express 3–7 days. Duties (DDU) by buyer.",
    pdpAvail: "AVAILABILITY", inMotion: "IN MOTION",
    videoSoon: "Video coming for this piece — see the tee spin at the top.",
    onlyLeft: "Only {n} left in Indonesia", madeToOrder: "Made to order — never out of stock",
    podDesc: "Printed at the nearest hub (US/EU/Asia) in 3–5 days, then shipped locally.",
    stockDesc: "Ships in 24h · Express 3–7 days worldwide.",
    reviews: "WORN & RATED", verified: "verified reviews",
    ugc: "WORN WORLDWIDE", ugcNote: "Tag @aprivateviolence to get featured. Sample strip — real UGC after launch.",
    cross: "COMPLETE THE LOOK", shipRetT: "SHIPPING & RETURNS",
    shipRetD: "Shipping: Economy 10–20d · Express 3–7d. Duties (DDU) by buyer. Returns 30 days.",
    cart: "CART", cartEmpty: "Empty. Go grab the drop.", emailTrack: "Email for tracking",
    economy: "Economy", express: "Express",
    ecoD: "Pos EMS · 10–20 days · ~$14", expD: "DHL Express · 3–7 days · ~$32",
    totalShip: "Total + ship:", chargedUsd: "(checkout charged in USD)",
    checkoutBtn: "Checkout (mock — payment HOLD)", placing: "Placing order…",
    payNote: "Payment HOLD: order via mock + WhatsApp link. Stubs return 501 until KYC.",
    invalidEmail: "Enter a valid email.", remove: "Remove", emailPh: "you@email.com",
    successT: "ORDER LOCKED ✓", successD: "order recorded (mock checkout). Track it below.",
    waBtn: "Confirm via WhatsApp", trackBtn: "Track order",
    trackT: "TRACK ORDER", trackPh: "MOCK-XXXX", trackNote: "mock status — received → packing.",
    sgTitle: "SIZE GUIDE", sgSub: "Measure once, fit right — worldwide, no returns headache.",
    sgTabT: "Tops", sgTabB: "Bottoms", sgTabC: "Caps",
    sgSize: "Size",
    sgS1: "Chest/waist: wrap the tape around, snug but 2 fingers loose. Breathe normally.",
    sgS2: "Length/inseam: measure a piece you already love and compare to the table.",
    sgS3: "Caps: tape above eyebrows; strap adjusts ±2 cm.",
    sgHow: "How to measure (30 seconds)", sgFinder: "Fit finder",    sgChest: "Chest (cm)", sgWaist: "Waist (cm)", sgFit: "Fit",
    sgSlim: "Slim", sgReg: "Regular", sgOver: "Oversized",
    sgBetween: "Between sizes? Size up.",
    sgModel: "Model 178 cm / 70 kg wears M. Fits true to size.",
    footShip: "Shipping", footRet: "Returns", footPriv: "Privacy", footSize: "Size guide",
    footNote: "Duties (DDU) by buyer · Returns 30 days (buyer pays return shipping)",
    cookieT: "Cookies. Essentials only. Analytics (GA4/Pixel) run only if you agree.",
    accept: "Accept", decline: "Decline", privacy: "Privacy",
  },
  id: {
    navShop: "Belanja", navLook: "Lookbook", navTrack: "Lacak", navCart: "Keranjang",
    seqBadge: "DROP 001 — SCROLL UNTUK MEMUTAR", seqCta: "Belanja drop ini",
    step1t: "DEPAN", step1d: "Kaos heavyweight sablon dada. Potongan boxy, jatuh rapi.",
    step2t: "PUTAR 360°", step2d: "Scroll terus — periksa tiap sudut, jahitan, dan detail.",
    step3t: "SERAT MAKRO", step3d: "Rajutan rapat, tidak menerawang. Awet lawan tren.",
    dropTitle: "DROP TERBARU", dropSub: "Geser ke samping. Klik untuk quick view.", viewAll: "Lihat semua",
    storyT1: "01 / KAIN TEBAL", storyD1: "240–400 GSM. Tidak menerawang, tidak menyusut. Cuci dingin, jemur angin.",
    storyT2: "02 / FIT AKURAT", storyD2: "Model 178cm pakai M. Tabel US/EU/Asia cm+inch di tiap produk.",
    storyT3: "03 / KIRIM SEDUNIA", storyD3: "POD dari hub US/EU. Edisi terbatas terbang dari Indonesia. Bisa dilacak.",
    storyCta: "Belanja best seller →",
    shopTitle: "SEMUA PRODUK", shopSearch: "Cari kaos, hoodie, cargo…",
    fAll: "Semua", fPod: "POD Sedunia", fStock: "Stok Terbatas",
    sortFeat: "Unggulan", sortLow: "Harga ↑", sortHigh: "Harga ↓", sortName: "Nama A–Z",
    pieces: "produk", shopEmpty: "Tidak cocok. Coba kata lain.",
    size: "UKURAN", sizeGuide: "Panduan ukuran", sizeGuideLong: "Panduan ukuran — cari fit-mu",
    addToCart: "Tambah ke keranjang", added: "Ditambahkan ✓",
    shipNote: "Sedunia: Ekonomi 10–20 hari · Ekspres 3–7 hari. Bea (DDU) ditanggung pembeli.",
    pdpAvail: "KETERSEDIAAN", inMotion: "DALAM GERAK",
    videoSoon: "Video menyusul untuk produk ini — lihat kaos berputar di atas.",
    onlyLeft: "Sisa {n} di Indonesia", madeToOrder: "Dibuat saat dipesan — tidak pernah habis",
    podDesc: "Dicetak di hub terdekat (US/EU/Asia) 3–5 hari, lalu dikirim lokal.",
    stockDesc: "Kirim 24 jam · Ekspres 3–7 hari sedunia.",
    reviews: "DIPAKAI & DINILAI", verified: "review terverifikasi",
    ugc: "DIPAKAI SEDUNIA", ugcNote: "Tag @aprivateviolence untuk tampil. Contoh — UGC asli setelah launching.",
    cross: "LENGKAPI GAYAMU", shipRetT: "PENGIRIMAN & RETUR",
    shipRetD: "Kirim: Ekonomi 10–20hr · Ekspres 3–7hr. Bea (DDU) pembeli. Retur 30 hari.",
    cart: "KERANJANG", cartEmpty: "Kosong. Sikat drop-nya.", emailTrack: "Email untuk pelacakan",
    economy: "Ekonomi", express: "Ekspres",
    ecoD: "Pos EMS · 10–20 hari · ~$14", expD: "DHL Ekspres · 3–7 hari · ~$32",
    totalShip: "Total + ongkir:", chargedUsd: "(bayar dalam USD)",
    checkoutBtn: "Checkout (mock — payment HOLD)", placing: "Memproses order…",
    payNote: "Payment HOLD: order via mock + link WhatsApp. Stub 501 sampai KYC.",
    invalidEmail: "Masukkan email valid.", remove: "Hapus", emailPh: "kamu@email.com",
    successT: "ORDER TERKUNCI ✓", successD: "order tercatat (mock checkout). Lacak di bawah.",
    waBtn: "Konfirmasi via WhatsApp", trackBtn: "Lacak order",
    trackT: "LACAK ORDER", trackPh: "MOCK-XXXX", trackNote: "status mock — diterima → packing.",
    sgTitle: "PANDUAN UKURAN", sgSub: "Ukur sekali, pas selalu — sedunia tanpa drama retur.",
    sgTabT: "Atasan", sgTabB: "Bawahan", sgTabC: "Topi",
    sgSize: "Ukuran",
    sgS1: "Dada/pinggang: lingkarkan meteran, longgar 2 jari. Bernapas normal.",
    sgS2: "Panjang/inseam: ukur baju favoritmu dan bandingkan dengan tabel.",
    sgS3: "Topi: meteran di atas alis; strap menyesuaikan ±2 cm.",
    sgHow: "Cara mengukur (30 detik)", sgFinder: "Pencari fit",
    sgChest: "Dada (cm)", sgWaist: "Pinggang (cm)", sgFit: "Fit",
    sgSlim: "Slim", sgReg: "Regular", sgOver: "Oversized",
    sgBetween: "Di antara dua size? Ambil yang besar.",
    sgModel: "Model 178 cm / 70 kg pakai M. Fit akurat.",
    footShip: "Pengiriman", footRet: "Retur", footPriv: "Privasi", footSize: "Panduan ukuran",
    footNote: "Bea (DDU) pembeli · Retur 30 hari (ongkir retur pembeli)",
    cookieT: "Cookie. Hanya yang esensial. Analitik (GA4/Pixel) jika kamu setuju.",
    accept: "Setuju", decline: "Tolak", privacy: "Privasi",
  },
  ja: {
    navShop: "ショップ", navLook: "ルックブック", navTrack: "追跡", navCart: "カート",
    seqBadge: "DROP 001 — スクロールで回転", seqCta: "ドロップを見る",
    step1t: "フロント", step1d: "胸元プリントのヘビーT。ボックスカットで綺麗に落ちる。",
    step2t: "360°スピン", step2d: "スクロールで全角度・縫製をチェック。",
    step3t: "マクロ生地", step3d: "高密度で透けない。長く着られる作り。",
    dropTitle: "最新ドロップ", dropSub: "横にスワイプ。タップでクイックビュー。", viewAll: "すべて見る",
    storyT1: "01 / ヘビー生地", storyD1: "240–400GSM。透けない・縮まない。冷水洗濯・陰干し。",
    storyT2: "02 / ジャストフィット", storyD2: "モデル178cmでM着用。US/EU/アジア対応サイズ表つき。",
    storyT3: "03 / 世界配送", storyD3: "PODはUS/EU拠点から発送。限定品はインドネシアから。追跡あり。",
    storyCta: "ベストセラーを買う →",
    shopTitle: "全商品", shopSearch: "Tシャツ、パーカー、カーゴを検索…",
    fAll: "すべて", fPod: "POD・世界配送", fStock: "限定在庫",
    sortFeat: "おすすめ", sortLow: "価格が安い順", sortHigh: "価格が高い順", sortName: "名前順",
    pieces: "点", shopEmpty: "見つかりません。別のキーワードで。",
    size: "サイズ", sizeGuide: "サイズガイド", sizeGuideLong: "サイズガイド — フィットを探す",
    addToCart: "カートに入れる", added: "追加しました ✓",
    shipNote: "世界配送: エコノミー10–20日 · 速達3–7日。関税(DDU)は購入者負担。",
    pdpAvail: "在庫状況", inMotion: "モーション",
    videoSoon: "この商品の動画は近日公開 — 上でTシャツの回転を見られます。",
    onlyLeft: "インドネシア残り{n}点", madeToOrder: "受注生産 — 売り切れなし",
    podDesc: "最寄り拠点(US/EU/アジア)で3–5日でプリント後、現地発送。",
    stockDesc: "24時間で発送 · 速達3–7日で世界へ。",
    reviews: "着用レビュー", verified: "件の認証レビュー",
    ugc: "世界の着用者", ugcNote: "@aprivateviolence をタグ付けで掲載。サンプル — 本番後に実UGC。",
    cross: "コーデを完成させる", shipRetT: "配送・返品",
    shipRetD: "配送: エコノミー10–20日 · 速達3–7日。関税(DDU)は購入者負担。返品30日。",
    cart: "カート", cartEmpty: "空です。ドロップを掴もう。", emailTrack: "追跡用メール",
    economy: "エコノミー", express: "速達",
    ecoD: "Pos EMS · 10–20日 · ~$14", expD: "DHL速達 · 3–7日 · ~$32",
    totalShip: "送料込み合計:", chargedUsd: "(決済はUSD)",
    checkoutBtn: "レジへ進む (mock — 決済HOLD中)", placing: "注文処理中…",
    payNote: "決済HOLD中: mock注文 + WhatsAppリンク。KYC完了まで501。",
    invalidEmail: "有効なメールを入力。", remove: "削除", emailPh: "you@email.com",
    successT: "注文確定 ✓", successD: "注文を記録しました(mock)。以下で追跡。",
    waBtn: "WhatsAppで確認", trackBtn: "注文を追跡",
    trackT: "注文追跡", trackPh: "MOCK-XXXX", trackNote: "mockステータス — 受付 → 梱包中。",
    sgTitle: "サイズガイド", sgSub: "一度測ればぴったり — 世界中どこでも返品知らず。",
    sgTabT: "トップス", sgTabB: "ボトムス", sgTabC: "キャップ",
    sgSize: "サイズ",
    sgS1: "胸囲/ウエスト: 指2本分のゆとりで巻く。普通に呼吸。",
    sgS2: "着丈/股下: お気に入りの一枚を測って表と比べる。",
    sgS3: "キャップ: 眉上で測る。ストラップで±2cm調整。",
    sgHow: "測り方 (30秒)", sgFinder: "フィット診断",
    sgChest: "胸囲 (cm)", sgWaist: "ウエスト (cm)", sgFit: "フィット",
    sgSlim: "スリム", sgReg: "レギュラー", sgOver: "オーバーサイズ",
    sgBetween: "サイズの間なら、大きめを。",
    sgModel: "モデル178cm/70kgでM着用。サイズ感は正確。",
    footShip: "配送", footRet: "返品", footPriv: "プライバシー", footSize: "サイズガイド",
    footNote: "関税(DDU)は購入者負担 · 返品30日(返送料は購入者負担)",
    cookieT: "Cookieは必須のみ。分析(GA4/Pixel)は同意時のみ実行。",
    accept: "同意する", decline: "拒否", privacy: "プライバシー",
  },
};

const chipDict: Record<Lang, string[][]> = {
  en: [["240 GSM cotton", "Chest hit print"], ["360° view", "Reinforced collar"], ["Tight weave", "Pre-shrunk"]],
  id: [["Katun 240 GSM", "Sablon dada"], ["Tampak 360°", "Kerah reinforced"], ["Rajutan rapat", "Pre-shrunk"]],
  ja: [["240GSMコットン", "胸プリント"], ["360°ビュー", "補強襟"], ["高密度", "防縮加工"]],
};

const Ctx = createContext<{ lang: Lang; setLang: (l: Lang) => void } | null>(null);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === "undefined") return "en";
    try {
      const v = localStorage.getItem(KEY);
      return v === "ja" || v === "id" ? v : "en";
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(KEY, lang);
      document.documentElement.lang = lang;
    } catch {
      /* abaikan */
    }
  }, [lang]);
  return <Ctx.Provider value={{ lang, setLang: setLangState }}>{children}</Ctx.Provider>;
}

function useLang(): Lang {
  return useContext(Ctx)?.lang ?? "en";
}

/** Bahasa display: EN sampai hydrate (anti hydration-mismatch). */
export function useDisplayLang(): Lang {
  const mounted = useMounted();
  const lang = useLang();
  return mounted ? lang : "en";
}

/** Ambil string dict (fallback EN). */
export function useT(): (key: string) => string {
  const lang = useDisplayLang();
  return (key: string) => dict[lang][key] ?? dict.en[key] ?? key;
}

/** Chips info per step sequence. */
export function useChips(step: number): string[] {
  const lang = useDisplayLang();
  return chipDict[lang][step] ?? chipDict.en[step] ?? [];
}

export function LangSelector() {
  const ctx = useContext(Ctx);
  const mounted = useMounted();
  if (!ctx) return null;
  return (
    <select
      value={mounted ? ctx.lang : "en"}
      onChange={(e) => ctx.setLang(e.target.value as Lang)}
      aria-label="Language"
      className="cursor-pointer rounded-full border border-white/20 bg-transparent px-2 py-1.5 text-xs"
    >
      <option value="en" className="bg-black">EN</option>
      <option value="id" className="bg-black">ID</option>
      <option value="ja" className="bg-black">JA</option>
    </select>
  );
}
