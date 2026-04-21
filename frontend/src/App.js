import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { BrowserRouter, Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import { Dumbbell, ShieldCheck, Zap, Truck, Search, ShoppingCart, Crown, Package, BarChart3 } from "lucide-react";
import { Toaster, toast } from "sonner";

import "./App.css";

const API_BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const defaultShippingByState = {
  SP: 45.0,
  RJ: 58.0,
  MG: 58.0,
  SC: 58.0,
  RS: 58.0,
  PR: 58.0,
  ES: 58.0,
  DF: 65.0,
  GO: 65.0,
  CE: 70.0,
  BA: 70.0,
  AL: 70.0,
  MA: 70.0,
  MT: 75.0,
  PE: 75.0,
  PB: 75.0,
  PI: 75.0,
  PA: 80.0,
  TO: 80.0,
  MS: 90.0,
  SE: 100.0,
  RN: 100.0,
  RO: 100.0,
  AP: 100.0,
  AM: 120.0,
  AC: 120.0,
  RR: 120.0,
};

const fallbackStore = {
  settings: {
    brand_name: "DNA Cliptor",
    logo: "/dna-assets/logo.jpeg",
    banner_image: "/dna-assets/hero-man.jpeg",
    mascot_image: "/dna-assets/pitbull.jpeg",
    hero: {
      title: "GENES DE CAMPEAO",
      subtitle: "SUPLEMENTOS PARA PERFORMANCE MAXIMA",
      cta_text: "CONHECA NOSSOS PRODUTOS",
    },
    phrases: [
      "Desperte seu verdadeiro potencial",
      "Seu corpo, sua evolucao",
      "Forca nao e opcao, e obrigacao",
      "Alta performance comeca aqui",
    ],
    benefits: [
      { title: "Alta Qualidade", description: "Stacks premium para atletas exigentes." },
      { title: "Resultados Rapidos", description: "Protocolos criados para ganho e foco." },
      { title: "Envio Seguro", description: "Frete por estado com acompanhamento." },
      { title: "Suporte 24h", description: "Atendimento comercial ativo no WhatsApp." },
    ],
    sellers: [
      { id: "seller-1", name: "Vendedor 1", whatsapp: "5511999991111" },
      { id: "seller-2", name: "Vendedor 2", whatsapp: "5511999992222" },
    ],
    mandatory_notice:
      "E obrigatorio ter alguem no local para receber o pedido. Nao nos responsabilizamos caso nao haja ninguem no momento da entrega, pois utilizamos transportadora.",
    exchange_policy:
      "Trocas e reclamacoes so serao aceitas com video. O cliente deve gravar abrindo a caixa no momento da entrega. Sem video, nao sera aceito.",
    insurance_enabled: true,
    insurance_label: "Seguro 100% opcional",
    shipping_by_state: defaultShippingByState,
    insurance_fee: 19.9,
    footer_text: "DNA Cliptor | Forca, foco e evolucao em cada entrega.",
  },
  featured_products: [],
  payment_provider: {
    mercado_pago_enabled: false,
    mercado_pago_public_key: "",
  },
};

const fallbackProducts = [
  {
    id: "whey",
    name: "Whey Protein 3kg",
    slug: "whey-protein-3kg",
    category: "Proteina",
    description: "Blend premium para recuperacao e construcao muscular.",
    hero_phrase: "Recuperacao de elite depois de treinos brutais.",
    image: "/dna-assets/layout-reference.jpeg",
    sale_price: 199,
    stock: 32,
    featured: true,
    tags: ["massa", "recuperacao"],
    rating: 4.9,
    shipping_by_state: { SP: 24.9, RJ: 29.9, MG: 27.9 },
    insurance_value: 17.9,
    brand: "DNA Cliptor",
    model: "Ultra Whey 3kg",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 187,
  },
  {
    id: "pre",
    name: "Pre-treino 350g",
    slug: "pre-treino-350g",
    category: "Pre-treino",
    description: "Explosao de energia, foco e resistencia.",
    hero_phrase: "Entre no treino em modo ataque.",
    image: "/dna-assets/hero-man.jpeg",
    sale_price: 129,
    stock: 48,
    featured: true,
    tags: ["energia", "foco"],
    rating: 4.8,
    shipping_by_state: { SP: 24.9, RJ: 29.9, MG: 27.9 },
    insurance_value: 14.9,
    brand: "DNA Cliptor",
    model: "Rage 350g",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 123,
  },
  {
    id: "testo",
    name: "Testo Booster",
    slug: "testo-booster",
    category: "Hormonal Support",
    description: "Mais drive, energia e atitude de campeao.",
    hero_phrase: "Mentalidade de lider, presenca de campeao.",
    image: "/dna-assets/pitbull.jpeg",
    sale_price: 139,
    stock: 21,
    featured: true,
    tags: ["forca", "drive"],
    rating: 4.7,
    shipping_by_state: { SP: 24.9, RJ: 29.9, MG: 27.9 },
    insurance_value: 16.9,
    brand: "DNA Cliptor",
    model: "Alpha Test",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 89,
  },
  {
    id: "world-france",
    name: "World Series France Whey 900g",
    slug: "world-series-france-whey-900g",
    category: "Proteina",
    description: "Blend proteico da linha World Series com perfil para recuperacao e reconstrucao muscular intensa.",
    hero_phrase: "Forca extrema com assinatura internacional.",
    image: "/dna-assets/world-france.jpeg",
    sale_price: 129,
    stock: 28,
    featured: false,
    tags: ["world series", "proteina", "franca"],
    rating: 4.8,
    shipping_by_state: defaultShippingByState,
    insurance_value: 15.9,
    brand: "DNA Cliptor",
    model: "World Series France",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 0,
  },
  {
    id: "world-russia",
    name: "World Series Russia Pre-Workout 300g",
    slug: "world-series-russia-pre-workout-300g",
    category: "Pre-treino",
    description: "Formula concentrada para energia, foco e explosao nas sessoes mais pesadas.",
    hero_phrase: "Energia maxima para treinos sem recuo.",
    image: "/dna-assets/world-russia.jpeg",
    sale_price: 119,
    stock: 24,
    featured: false,
    tags: ["world series", "energia", "russia"],
    rating: 4.8,
    shipping_by_state: defaultShippingByState,
    insurance_value: 14.9,
    brand: "DNA Cliptor",
    model: "World Series Russia",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 0,
  },
  {
    id: "world-canada",
    name: "World Series Canada Creatina 300g",
    slug: "world-series-canada-creatina-300g",
    category: "Performance",
    description: "Creatina micronizada da linha World Series para suporte de forca, volume e repeticao com consistencia.",
    hero_phrase: "Base diaria para evolucao com nivel de atleta.",
    image: "/dna-assets/world-canada.jpeg",
    sale_price: 89.9,
    stock: 30,
    featured: false,
    tags: ["world series", "creatina", "canada"],
    rating: 4.8,
    shipping_by_state: defaultShippingByState,
    insurance_value: 13.9,
    brand: "DNA Cliptor",
    model: "World Series Canada",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 0,
  },
  {
    id: "world-china",
    name: "World Series China Mass 1,5kg",
    slug: "world-series-china-mass-1-5kg",
    category: "Hipercalorico",
    description: "Combinacao de carboidratos e proteinas para aumentar aporte calorico e acelerar a construcao de massa.",
    hero_phrase: "Volume bruto para fases de ganho pesado.",
    image: "/dna-assets/world-china.jpeg",
    sale_price: 139.9,
    stock: 18,
    featured: false,
    tags: ["world series", "massa", "china"],
    rating: 4.8,
    shipping_by_state: defaultShippingByState,
    insurance_value: 16.9,
    brand: "DNA Cliptor",
    model: "World Series China",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 0,
  },
  {
    id: "world-usa",
    name: "World Series USA Booster 120 caps",
    slug: "world-series-usa-booster-120-caps",
    category: "Hormonal Support",
    description: "Stack de suporte para energia, drive e desempenho continuo na rotina de alta performance.",
    hero_phrase: "Atitude de campeao em cada ciclo.",
    image: "/dna-assets/world-usa.jpeg",
    sale_price: 119.9,
    stock: 22,
    featured: false,
    tags: ["world series", "booster", "usa"],
    rating: 4.8,
    shipping_by_state: defaultShippingByState,
    insurance_value: 14.9,
    brand: "DNA Cliptor",
    model: "World Series USA",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 0,
  },
  {
    id: "world-brazil",
    name: "World Series Brazil Recovery 450g",
    slug: "world-series-brazil-recovery-450g",
    category: "Recuperacao",
    description: "Formula para reposicao e recuperacao com aminoacidos e suporte ao desempenho entre treinos.",
    hero_phrase: "Recupere forte e volte mais agressivo.",
    image: "/dna-assets/world-brazil.jpeg",
    sale_price: 104.9,
    stock: 26,
    featured: false,
    tags: ["world series", "recuperacao", "brasil"],
    rating: 4.8,
    shipping_by_state: defaultShippingByState,
    insurance_value: 13.9,
    brand: "DNA Cliptor",
    model: "World Series Brazil",
    manufacturer: "DNA Cliptor Labs",
    active: true,
    reviews_count: 0,
  },
];

const navItems = [
  { label: "Home", to: "/" },
  { label: "Produtos", to: "/produtos" },
  { label: "Carrinho", to: "/carrinho" },
  { label: "Politicas", to: "/politicas" },
  { label: "Contato", to: "/contato" },
];

const benefitIcons = [ShieldCheck, Zap, Truck, Crown];
const shippingStates = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];
const deliveredReviews = [
  { name: "Rafael M.", state: "SP", text: "Pedido entregue certinho, embalagem forte e chegou mais rapido do que eu esperava." },
  { name: "Camila R.", state: "RJ", text: "Recebi meu whey e o pre-treino sem atraso. Atendimento no WhatsApp foi direto e agil." },
  { name: "Diego L.", state: "MG", text: "Chegou rapido, produto lacrado e frete calculado certo. Compra tranquila do inicio ao fim." },
  { name: "Bruno S.", state: "PR", text: "Pedido recebido em perfeito estado. Curti muito a velocidade da entrega e a apresentacao da marca." },
  { name: "Patricia N.", state: "BA", text: "Meu pedido foi entregue antes do prazo e veio tudo correto. Vou comprar de novo com certeza." },
  { name: "Lucas F.", state: "DF", text: "Chegou rapido e bem embalado. Gostei porque o status do pedido ficou claro e sem enrolacao." },
];

const currency = (value) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(value || 0));

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getStoredOfflineStore() {
  try {
    return JSON.parse(window.localStorage.getItem("dna-offline-store") || "null");
  } catch {
    return null;
  }
}

function getStoredOfflineProducts() {
  try {
    return JSON.parse(window.localStorage.getItem("dna-offline-products") || "[]");
  } catch {
    return [];
  }
}

function setStoredOfflineProducts(products) {
  window.localStorage.setItem("dna-offline-products", JSON.stringify(products));
}

function getAdminToken() {
  return window.localStorage.getItem("dna-admin-token") || "";
}

function getAdminHeaders() {
  const token = getAdminToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function clearAdminSession() {
  window.localStorage.removeItem("dna-admin-token");
}

function mergeProducts(primaryProducts, secondaryProducts) {
  const seen = new Set();
  return [...(primaryProducts || []), ...(secondaryProducts || [])].filter((product) => {
    if (!product?.id || seen.has(product.id)) return false;
    seen.add(product.id);
    return true;
  });
}

function buildLocalPixCode(orderId, total) {
  const cleanTotal = String(Number(total || 0).toFixed(2)).replace(".", "");
  return `00020126330014BR.GOV.BCB.PIX0111DNACLIPTOR520400005303986540${cleanTotal}5802BR5913DNA CLIPTOR6009SAO PAULO62070503${String(orderId).slice(0, 6)}6304ABCD`;
}

function buildLocalWhatsAppMessage(order) {
  const itemsText = order.items.map((item) => `- ${item.name} x${item.quantity} | ${currency(item.total_price)}`).join("\n");
  const address = order.customer.address;
  return [
    `Pedido ${order.order_number}`,
    `Cliente: ${order.customer.full_name}`,
    `Telefone: ${order.customer.phone}`,
    `WhatsApp: ${order.customer.whatsapp}`,
    `Endereco: ${address.street}, ${address.number} - ${address.district} - ${address.city}/${address.state} - CEP ${address.zip_code}`,
    `Referencia: ${address.reference || "-"}`,
    "Produtos:",
    itemsText,
    `Subtotal: ${currency(order.subtotal)}`,
    `Frete: ${currency(order.shipping_cost)}`,
    `Seguro: ${currency(order.insurance_cost)}`,
    `Total: ${currency(order.total)}`,
    `Vendedor: ${order.seller_name}`,
  ].join("\n");
}

function usePersistentCart() {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("dna-cart") || "[]");
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem("dna-cart", JSON.stringify(cart));
  }, [cart]);

  return [cart, setCart];
}

function Input({ label, value, onChange, type = "text", required = false, placeholder = "", autoComplete = "off" }) {
  return (
    <div>
      <label className="cliptor-label">{label}</label>
      <input type={type} value={value} required={required} placeholder={placeholder} autoComplete={autoComplete} onChange={(e) => onChange(e.target.value)} className="cliptor-input w-full" />
    </div>
  );
}

function getStoredLatestOrder() {
  try {
    return JSON.parse(window.localStorage.getItem("dna-latest-order") || "null");
  } catch {
    return null;
  }
}

function formatOrderAddress(order) {
  const address = order?.customer?.address;
  if (!address) return "Endereco nao informado";
  const primary = [address.street, address.number].filter(Boolean).join(", ");
  const secondary = [address.district, address.city, address.state].filter(Boolean).join(" - ");
  const zip = address.zip_code ? `CEP ${address.zip_code}` : "";
  return [primary, secondary, zip].filter(Boolean).join(" | ");
}

function PolicyCard({ title, children }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-black/25 p-6">
      <p className="text-sm font-black uppercase tracking-[0.2em] text-[#f8c35f]">{title}</p>
      <p className="mt-3 text-zinc-300">{children}</p>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, onClick = null, active = false }) {
  const className = `cliptor-card p-5 transition ${onClick ? "cursor-pointer hover:border-[#f4b63e]/40 hover:bg-[#16110a]" : ""} ${active ? "border-[#f4b63e]/50 bg-[#171008]" : ""}`;

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${className} text-left`}>
        <Icon className="text-[#f8c35f]" />
        <p className="mt-5 text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
        <p className="mt-2 text-4xl font-black uppercase">{value}</p>
      </button>
    );
  }

  return (
    <div className={className}>
      <Icon className="text-[#f8c35f]" />
      <p className="mt-5 text-xs uppercase tracking-[0.24em] text-zinc-500">{label}</p>
      <p className="mt-2 text-4xl font-black uppercase">{value}</p>
    </div>
  );
}

function MainLayout({ store, cartCount, children }) {
  const location = useLocation();
  return (
    <div className="min-h-screen bg-[#050505] text-white">
      <header className="sticky top-0 z-40 border-b border-[#3a2a0e] bg-black/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src={store.settings.logo} alt="DNA Cliptor" className="h-12 w-12 rounded-xl object-cover ring-1 ring-[#f4b63e]/40" />
            <div>
              <p className="text-lg font-black uppercase tracking-[0.25em] text-[#f8c35f]">{store.settings.brand_name}</p>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Performance maxima</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm font-semibold uppercase tracking-[0.2em] transition ${
                  location.pathname === item.to ? "text-[#f8c35f]" : "text-zinc-300 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <Link to="/carrinho" className="inline-flex items-center gap-2 rounded-full border border-[#f4b63e]/40 bg-[#16110b] px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[#f8c35f]">
            <ShoppingCart size={16} />
            {cartCount} itens
          </Link>
        </div>
      </header>
      <main>{children}</main>
      <footer className="border-t border-[#2b1c07] bg-black px-4 py-10 md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-zinc-400">{store.settings.footer_text}</p>
          <div className="flex gap-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
            <span>Preto</span>
            <span>Dourado</span>
            <span>Impacto</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <article className="cliptor-card flex h-full flex-col overflow-hidden">
      <img src={product.image} alt={product.name} className="h-60 w-full object-cover" />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-[#f8c35f]">{product.category}</p>
            <h3 className="text-2xl font-black uppercase">{product.name}</h3>
          </div>
          <span className="rounded-full border border-white/10 px-3 py-1 text-sm text-zinc-300">{product.stock} un.</span>
        </div>
        <p className="text-sm text-zinc-400">{product.description}</p>
        <p className="text-lg font-semibold text-[#f8c35f]">{product.hero_phrase}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">Preco</p>
            <p className="text-3xl font-black text-white">{currency(product.sale_price)}</p>
          </div>
          <div className="flex gap-3">
            <Link to={`/produto/${product.id}`} className="cliptor-button cliptor-button--ghost">Detalhes</Link>
            <button className="cliptor-button" onClick={() => onAdd(product)}>Comprar</button>
          </div>
        </div>
      </div>
    </article>
  );
}

function HomePage({ store, products, onAdd }) {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-[#2b1c07]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(248,195,95,0.22),transparent_35%),linear-gradient(180deg,rgba(0,0,0,0.5),rgba(0,0,0,0.92))]" />
        <img src={store.settings.banner_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-35" />
        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-20 md:grid-cols-[1.1fr_0.9fr] md:px-8 md:py-28">
          <div className="max-w-3xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f4b63e]/40 bg-[#16110b]/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.3em] text-[#f8c35f]">
              <Dumbbell size={14} />
              DNA Cliptor
            </p>
            <h1 className="max-w-3xl text-5xl font-black uppercase leading-[0.9] text-white md:text-7xl">{store.settings.hero.title}</h1>
            <p className="mt-6 max-w-2xl text-xl font-semibold uppercase tracking-[0.18em] text-[#f8c35f]">{store.settings.hero.subtitle}</p>
            <p className="mt-6 max-w-xl text-base text-zinc-300">
              Loja premium de suplementos e stacks para quem treina no limite. Design agressivo, foco em conversao e jornada pronta para vender.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/produtos" className="cliptor-button">{store.settings.hero.cta_text}</Link>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {store.settings.phrases.map((phrase) => (
                <div key={phrase} className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-sm font-semibold uppercase tracking-[0.15em] text-zinc-200">
                  {phrase}
                </div>
              ))}
            </div>
          </div>
          <aside className="flex flex-col gap-6">
            <div className="cliptor-card overflow-hidden p-4">
              <img src={store.settings.mascot_image} alt="Mascote DNA Cliptor" className="h-80 w-full rounded-[22px] object-cover" />
              <div className="mt-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Mascote oficial</p>
                  <h3 className="text-2xl font-black uppercase text-white">Pitbull Performance</h3>
                </div>
                <span className="rounded-full bg-[#f8c35f] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-black">Hardcore</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Beneficios</p>
            <h2 className="text-4xl font-black uppercase">Forca para vender</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {store.settings.benefits.map((benefit, index) => {
            const Icon = benefitIcons[index] || Crown;
            return (
              <div key={benefit.title} className="cliptor-card p-6">
                <Icon className="mb-5 text-[#f8c35f]" />
                <h3 className="text-2xl font-black uppercase">{benefit.title}</h3>
                <p className="mt-3 text-sm text-zinc-400">{benefit.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Destaques</p>
            <h2 className="text-4xl font-black uppercase">Suplementos de alta performance</h2>
          </div>
          <Link to="/produtos" className="text-sm font-bold uppercase tracking-[0.2em] text-[#f8c35f]">Ver catalogo completo</Link>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24 md:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Avaliacoes</p>
            <h2 className="text-4xl font-black uppercase">Quem recebeu, aprovou</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {deliveredReviews.map((review) => (
            <article key={`${review.name}-${review.state}`} className="cliptor-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xl font-black uppercase">{review.name}</p>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{review.state}</p>
                </div>
                <span className="rounded-full border border-[#f4b63e]/30 bg-[#f4b63e]/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#f8c35f]">
                  Entregue
                </span>
              </div>
              <p className="text-base leading-7 text-zinc-300">"{review.text}"</p>
              <div className="mt-5 flex gap-1 text-[#f8c35f]">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function ProductsPage({ products, onAdd }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Todos");
  const categories = ["Todos", ...Array.from(new Set(products.map((product) => product.category)))];
  const filtered = products.filter((product) => {
    const matchCategory = category === "Todos" || product.category === category;
    const text = query.toLowerCase();
    const matchQuery =
      !text || product.name.toLowerCase().includes(text) || product.description.toLowerCase().includes(text) || product.category.toLowerCase().includes(text);
    return matchCategory && matchQuery;
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Catalogo</p>
          <h1 className="text-5xl font-black uppercase">Escolha sua evolucao</h1>
        </div>
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <label className="cliptor-input flex items-center gap-3">
            <Search size={18} className="text-zinc-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto" className="w-full bg-transparent outline-none" />
          </label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="cliptor-input min-w-52">
            {categories.map((item) => <option key={item}>{item}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {filtered.map((product) => <ProductCard key={product.id} product={product} onAdd={onAdd} />)}
      </div>
    </section>
  );
}

function ProductPage({ products, onAdd }) {
  const { id } = useParams();
  const product = products.find((item) => item.id === id);
  if (!product) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-zinc-400">Produto nao encontrado.</div>;
  }
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="cliptor-card overflow-hidden">
          <img src={product.image} alt={product.name} className="h-full min-h-[420px] w-full object-cover" />
        </div>
        <div className="cliptor-card p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">{product.category}</p>
          <h1 className="mt-3 text-5xl font-black uppercase">{product.name}</h1>
          <p className="mt-4 text-xl font-semibold text-[#f8c35f]">{product.hero_phrase}</p>
          <p className="mt-6 text-base leading-7 text-zinc-300">{product.description}</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Marca</p>
              <p className="mt-2 text-lg font-bold">{product.brand}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Modelo</p>
              <p className="mt-2 text-lg font-bold">{product.model}</p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Fabricante</p>
              <p className="mt-2 text-lg font-bold">{product.manufacturer}</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {product.tags?.map((tag) => (
              <span key={tag} className="rounded-full border border-[#f4b63e]/30 bg-[#f4b63e]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f8c35f]">{tag}</span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Preco final</p>
              <p className="text-5xl font-black">{currency(product.sale_price)}</p>
            </div>
            <button onClick={() => onAdd(product)} className="cliptor-button">Adicionar ao carrinho</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function CartPage({ cart, products, updateQuantity, removeItem }) {
  const navigate = useNavigate();
  const detailed = cart
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }))
    .filter((item) => item.product);
  const subtotal = detailed.reduce((sum, item) => sum + item.quantity * item.product.sale_price, 0);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="cliptor-card p-6">
          <h1 className="text-4xl font-black uppercase">Seu carrinho</h1>
          <div className="mt-6 space-y-4">
            {detailed.length === 0 && <p className="text-zinc-400">Seu carrinho ainda esta vazio.</p>}
            {detailed.map((item) => (
              <div key={item.productId} className="grid gap-4 rounded-[22px] border border-white/10 bg-black/25 p-4 md:grid-cols-[110px_1fr_auto] md:items-center">
                <img src={item.product.image} alt={item.product.name} className="h-28 w-full rounded-2xl object-cover" />
                <div>
                  <h2 className="text-2xl font-black uppercase">{item.product.name}</h2>
                  <p className="mt-2 text-sm text-zinc-400">{item.product.description}</p>
                  <p className="mt-3 text-xl font-bold text-[#f8c35f]">{currency(item.product.sale_price)}</p>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-2">
                    <button className="quantity-button" onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}>-</button>
                    <span className="w-8 text-center font-bold">{item.quantity}</span>
                    <button className="quantity-button" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                  </div>
                  <button className="text-sm font-semibold uppercase tracking-[0.16em] text-zinc-400 hover:text-white" onClick={() => removeItem(item.productId)}>Remover</button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside className="cliptor-card p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[#f8c35f]">Resumo</p>
          <div className="mt-6 space-y-3 text-sm text-zinc-300">
            <div className="flex justify-between"><span>Produtos</span><span>{currency(subtotal)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>Calculado no checkout</span></div>
            <div className="flex justify-between"><span>Seguro</span><span>Opcional</span></div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Subtotal</p>
            <p className="mt-2 text-4xl font-black">{currency(subtotal)}</p>
          </div>
          <button disabled={!detailed.length} onClick={() => navigate("/checkout")} className="cliptor-button mt-8 w-full disabled:cursor-not-allowed disabled:opacity-40">Finalizar compra</button>
        </aside>
      </div>
    </section>
  );
}

function CheckoutPage({ cart, products, store, onOrderCreated }) {
  const navigate = useNavigate();
  const lastZipLookupRef = useRef("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    zip_code: "",
    street: "",
    district: "",
    city: "",
    state: "SP",
    number: "",
    reference: "",
    phone: "",
    whatsapp: "",
    seller_id: store.settings.sellers[0]?.id || "",
    include_insurance: true,
    coupon_code: "",
  });
  const [loadingCep, setLoadingCep] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const detailed = cart
    .map((item) => ({ ...item, product: products.find((product) => product.id === item.productId) }))
    .filter((item) => item.product);

  const pricing = useMemo(() => {
    const subtotal = detailed.reduce((sum, item) => sum + item.quantity * item.product.sale_price, 0);
    const shipping = Number(store.settings.shipping_by_state?.[form.state] ?? 39.9);
    const insurance = form.include_insurance && store.settings.insurance_enabled ? Number(store.settings.insurance_fee || 0) : 0;
    const discount = form.coupon_code.toUpperCase() === "DNA10" ? subtotal * 0.1 : 0;
    return { subtotal, shipping, insurance, discount, total: subtotal + shipping + insurance - discount };
  }, [detailed, form.state, form.include_insurance, form.coupon_code, store.settings.shipping_by_state, store.settings.insurance_fee, store.settings.insurance_enabled]);

  const handleChange = (field, value) => {
    if (field === "zip_code") {
      const cleanZip = value.replace(/\D/g, "").slice(0, 8);
      setForm((current) => ({ ...current, zip_code: cleanZip }));
      return;
    }
    setForm((current) => ({ ...current, [field]: value }));
  };

  const lookupCep = async (zipCodeValue = form.zip_code, silent = false) => {
    const cleanZip = (zipCodeValue || "").replace(/\D/g, "").slice(0, 8);
    if (cleanZip.length !== 8) return;
    setLoadingCep(true);
    try {
      let data = null;
      try {
        const response = await axios.get(`${API_BASE}/api/cep/${cleanZip}`);
        data = response.data;
      } catch (apiError) {
        const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${cleanZip}/json/`);
        if (viaCepResponse.data?.erro) {
          throw apiError;
        }
        data = {
          zip_code: cleanZip,
          street: viaCepResponse.data.logradouro || "",
          district: viaCepResponse.data.bairro || "",
          city: viaCepResponse.data.localidade || "",
          state: viaCepResponse.data.uf || "",
        };
      }
      setForm((current) => ({
        ...current,
        zip_code: cleanZip,
        street: data.street || current.street,
        district: data.district || current.district,
        city: data.city || current.city,
        state: data.state || current.state,
      }));
      lastZipLookupRef.current = cleanZip;
      if (!silent) {
        toast.success("Endereco preenchido automaticamente.");
      }
    } catch {
      if (!silent) {
        toast.error("Nao foi possivel buscar o CEP.");
      }
    } finally {
      setLoadingCep(false);
    }
  };

  useEffect(() => {
    const cleanZip = (form.zip_code || "").replace(/\D/g, "").slice(0, 8);
    if (cleanZip.length !== 8 || cleanZip === lastZipLookupRef.current) return;
    const timer = window.setTimeout(() => {
      lookupCep(cleanZip, true);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [form.zip_code]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!detailed.length) {
      toast.error("Adicione produtos ao carrinho antes de finalizar.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer: {
          full_name: form.full_name,
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          address: {
            zip_code: form.zip_code,
            street: form.street,
            district: form.district,
            city: form.city,
            state: form.state,
            number: form.number,
            reference: form.reference,
          },
        },
        items: detailed.map((item) => ({ product_id: item.productId, quantity: item.quantity })),
        seller_id: form.seller_id,
        shipping_state: form.state,
        include_insurance: form.include_insurance,
        payment_method: "pix",
        coupon_code: form.coupon_code,
      };
      const response = await axios.post(`${API_BASE}/api/orders`, payload);
      onOrderCreated(response.data);
      navigate(`/confirmacao/${response.data.id}`);
      toast.success("Pedido gerado com PIX automatico.");
    } catch (error) {
      if (!error.response) {
        const seller = store.settings.sellers.find((item) => item.id === form.seller_id) || store.settings.sellers[0];
        const localId = `offline-${Date.now()}`;
        const localOrder = {
          id: localId,
          order_number: `DNA-${new Date().toISOString().slice(2, 10).replace(/-/g, "")}-${String(Date.now()).slice(-6)}`,
          status: "Aguardando pagamento",
          payment_status: "PIX gerado",
          payment_method: "pix",
          payment_provider: "demo",
          payment_provider_id: "",
          pix_code: buildLocalPixCode(localId, pricing.total),
          pix_qr_value: `DNA-PIX::${localId}::${pricing.total}`,
          pix_qr_base64: "",
          ticket_url: "",
          coupon_code: form.coupon_code,
          discount: pricing.discount,
          include_insurance: form.include_insurance,
          insurance_cost: pricing.insurance,
          shipping_cost: pricing.shipping,
          subtotal: pricing.subtotal,
          total: pricing.total,
          customer: {
            full_name: form.full_name,
            email: form.email,
            phone: form.phone,
            whatsapp: form.whatsapp,
            address: {
              zip_code: form.zip_code,
              street: form.street,
              district: form.district,
              city: form.city,
              state: form.state,
              number: form.number,
              reference: form.reference,
            },
          },
          seller_id: seller?.id || "seller-offline",
          seller_name: seller?.name || "Vendedor",
          seller_whatsapp: seller?.whatsapp || "",
          items: detailed.map((item) => ({
            product_id: item.productId,
            name: item.product.name,
            quantity: item.quantity,
            unit_price: item.product.sale_price,
            total_price: item.product.sale_price * item.quantity,
            image: item.product.image,
          })),
          mandatory_notice: store.settings.mandatory_notice,
          exchange_policy: store.settings.exchange_policy,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localOrder.whatsapp_message = buildLocalWhatsAppMessage(localOrder);
        localOrder.whatsapp_url = `https://wa.me/${localOrder.seller_whatsapp}?text=${encodeURIComponent(localOrder.whatsapp_message)}`;
        onOrderCreated(localOrder);
        navigate(`/confirmacao/${localOrder.id}`);
        toast.success("Pedido gerado em modo offline com PIX demo.");
        return;
      }
      toast.error(error.response?.data?.detail || "Falha ao criar pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <form onSubmit={handleSubmit} className="cliptor-card p-6">
          <h1 className="text-4xl font-black uppercase">Checkout de campeao</h1>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Input label="Nome completo" value={form.full_name} onChange={(value) => handleChange("full_name", value)} required />
            <Input label="E-mail" type="email" value={form.email} onChange={(value) => handleChange("email", value)} required />
            <Input label="Telefone" value={form.phone} onChange={(value) => handleChange("phone", value)} required />
            <Input label="WhatsApp" value={form.whatsapp} onChange={(value) => handleChange("whatsapp", value)} required />
            <div>
              <label className="cliptor-label">CEP</label>
              <div className="flex gap-3">
                <input className="cliptor-input w-full" value={form.zip_code} onChange={(e) => handleChange("zip_code", e.target.value)} onBlur={() => lookupCep(form.zip_code, true)} placeholder="Digite 8 numeros" required />
                <button type="button" className="cliptor-button cliptor-button--ghost whitespace-nowrap" onClick={lookupCep}>{loadingCep ? "Buscando..." : "Buscar"}</button>
              </div>
            </div>
            <Input label="Rua" value={form.street} onChange={(value) => handleChange("street", value)} required />
            <Input label="Bairro" value={form.district} onChange={(value) => handleChange("district", value)} required />
            <Input label="Cidade" value={form.city} onChange={(value) => handleChange("city", value)} required />
            <Input label="Estado" value={form.state} onChange={(value) => handleChange("state", value.toUpperCase())} required />
            <Input label="Numero" value={form.number} onChange={(value) => handleChange("number", value)} required />
            <Input label="Ponto de referencia" value={form.reference} onChange={(value) => handleChange("reference", value)} />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <label className="cliptor-label">Escolha de vendedor</label>
              <select className="cliptor-input w-full" value={form.seller_id} onChange={(e) => handleChange("seller_id", e.target.value)}>
                {store.settings.sellers.map((seller) => (
                  <option key={seller.id} value={seller.id}>{seller.name} | {seller.whatsapp}</option>
                ))}
              </select>
            </div>
            <Input label="Cupom" value={form.coupon_code} onChange={(value) => handleChange("coupon_code", value.toUpperCase())} placeholder="Use DNA10" />
          </div>

          <label className="mt-6 flex items-start gap-3 rounded-[22px] border border-[#f4b63e]/25 bg-[#1a1208] p-4">
            <input type="checkbox" checked={form.include_insurance} onChange={(e) => handleChange("include_insurance", e.target.checked)} className="mt-1" />
            <span>
              <span className="block text-sm font-black uppercase tracking-[0.18em] text-[#f8c35f]">{store.settings.insurance_label}</span>
              <span className="mt-2 block text-sm text-zinc-400">Seguro cobrado a parte e vinculado ao pedido. O cliente pode escolher.</span>
            </span>
          </label>

          <div className="mt-6 rounded-[22px] border border-[#7b5a1f]/30 bg-[#130f0a] p-5 text-sm text-zinc-300">
            <p className="font-black uppercase tracking-[0.18em] text-[#f8c35f]">Aviso obrigatorio</p>
            <p className="mt-2">{store.settings.mandatory_notice}</p>
          </div>

          <button disabled={submitting} className="cliptor-button mt-8 w-full disabled:opacity-50">{submitting ? "Gerando PIX..." : "Gerar PIX e finalizar"}</button>
        </form>

        <aside className="cliptor-card p-6">
          <p className="text-sm uppercase tracking-[0.28em] text-[#f8c35f]">Resumo final</p>
          <div className="mt-6 space-y-4">
            {detailed.map((item) => (
              <div key={item.productId} className="flex items-center justify-between gap-3 rounded-[18px] border border-white/10 bg-black/25 p-3">
                <div>
                  <p className="font-bold uppercase">{item.product.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Qtd {item.quantity}</p>
                </div>
                <p className="font-bold text-[#f8c35f]">{currency(item.product.sale_price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 space-y-3 border-t border-white/10 pt-6 text-sm text-zinc-300">
            <div className="flex justify-between"><span>Produtos</span><span>{currency(pricing.subtotal)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{currency(pricing.shipping)}</span></div>
            <div className="flex justify-between"><span>Seguro</span><span>{currency(pricing.insurance)}</span></div>
            <div className="flex justify-between"><span>Desconto</span><span>-{currency(pricing.discount)}</span></div>
          </div>
          <div className="mt-6 border-t border-white/10 pt-6">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Total</p>
            <p className="mt-2 text-4xl font-black">{currency(pricing.total)}</p>
          </div>
        </aside>
      </div>
    </section>
  );
}

function ConfirmationPage({ latestOrder }) {
  const { id } = useParams();
  const [orderData, setOrderData] = useState(() => {
    if (latestOrder?.id === id) return latestOrder;
    const storedOrder = getStoredLatestOrder();
    return storedOrder?.id === id ? storedOrder : null;
  });
  const [loadingOrder, setLoadingOrder] = useState(() => !orderData);

  useEffect(() => {
    if (latestOrder?.id === id) {
      setOrderData(latestOrder);
      setLoadingOrder(false);
    }
  }, [id, latestOrder]);

  useEffect(() => {
    if (orderData?.id === id) return;
    let cancelled = false;

    const loadOrder = async () => {
      setLoadingOrder(true);
      try {
        const response = await axios.get(`${API_BASE}/api/orders/${id}`);
        if (cancelled) return;
        setOrderData(response.data);
        window.localStorage.setItem("dna-latest-order", JSON.stringify(response.data));
      } catch {
        if (cancelled) return;
        const storedOrder = getStoredLatestOrder();
        setOrderData(storedOrder?.id === id ? storedOrder : null);
      } finally {
        if (!cancelled) setLoadingOrder(false);
      }
    };

    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [id, orderData?.id]);

  if (loadingOrder) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-zinc-400">Carregando os dados do pedido...</div>;
  }

  if (!orderData) {
    return <div className="mx-auto max-w-4xl px-4 py-20 text-center text-zinc-400">Pedido nao encontrado. Gere um novo pedido ou volte ao carrinho.</div>;
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="cliptor-card p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Pagamento</p>
          <h1 className="mt-3 text-5xl font-black uppercase">PIX gerado com sucesso</h1>
          <p className="mt-4 text-zinc-300">Pedido <span className="font-bold text-white">{orderData.order_number}</span> pronto para pagamento e envio ao vendedor escolhido.</p>
          <div className="mt-8 rounded-[24px] border border-white/10 bg-black/35 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Codigo PIX</p>
            <p className="mt-3 break-all font-mono text-sm text-zinc-200">{orderData.pix_code}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Vendedor</p>
              <p className="mt-2 text-2xl font-black uppercase">{orderData.seller_name}</p>
              <p className="mt-2 text-sm text-zinc-400">{orderData.seller_whatsapp}</p>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/30 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Total</p>
              <p className="mt-2 text-2xl font-black uppercase">{currency(orderData.total)}</p>
              <p className="mt-2 text-sm text-zinc-400">Seguro: {currency(orderData.insurance_cost)} | Frete: {currency(orderData.shipping_cost)}</p>
            </div>
          </div>
          <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">Entrega</p>
            <p className="mt-2 text-sm text-zinc-300">{formatOrderAddress(orderData)}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <a href={orderData.whatsapp_url} target="_blank" rel="noreferrer" className="cliptor-button">Enviar pedido no WhatsApp</a>
            {orderData.ticket_url && (
              <a href={orderData.ticket_url} target="_blank" rel="noreferrer" className="cliptor-button cliptor-button--ghost">
                Abrir pagamento Mercado Pago
              </a>
            )}
            <Link to="/produtos" className="cliptor-button cliptor-button--ghost">Continuar comprando</Link>
          </div>
        </div>
        <aside className="cliptor-card flex flex-col items-center justify-center p-6 text-center">
          {orderData.pix_qr_base64 ? (
            <img
              src={`data:image/png;base64,${orderData.pix_qr_base64}`}
              alt="QR Code PIX Mercado Pago"
              className="h-[220px] w-[220px] rounded-2xl bg-white p-3"
            />
          ) : (
            <QRCodeCanvas value={orderData.pix_qr_value} size={220} includeMargin bgColor="#ffffff" fgColor="#000000" />
          )}
          <p className="mt-6 text-sm uppercase tracking-[0.18em] text-zinc-400">Escaneie o QR Code PIX</p>
        </aside>
      </div>
    </section>
  );
}

function PoliciesPage({ store }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16 md:px-8">
      <div className="cliptor-card p-8">
        <h1 className="text-5xl font-black uppercase">Politicas</h1>
        <div className="mt-10 grid gap-6">
          <PolicyCard title="Frete">Valores fixos por estado, configurados no painel administrativo da loja.</PolicyCard>
          <PolicyCard title="Seguro">Opcional. Cobre 100% do pedido quando ativado pelo cliente no checkout.</PolicyCard>
          <PolicyCard title="Trocas e reclamacoes">{store.settings.exchange_policy}</PolicyCard>
          <PolicyCard title="Entrega">{store.settings.mandatory_notice}</PolicyCard>
        </div>
      </div>
    </section>
  );
}

function ContactPage({ store }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 md:px-8">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="cliptor-card p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Contato</p>
          <h1 className="mt-3 text-5xl font-black uppercase">Fale com o time DNA</h1>
          <p className="mt-6 text-zinc-300">Escolha um vendedor e siga com seu atendimento direto no WhatsApp.</p>
          <div className="mt-8 grid gap-4">
            {store.settings.sellers.map((seller) => (
              <a key={seller.id} href={`https://wa.me/${seller.whatsapp}`} target="_blank" rel="noreferrer" className="rounded-[22px] border border-white/10 bg-black/25 p-5 transition hover:border-[#f4b63e]/40">
                <p className="text-xl font-black uppercase">{seller.name}</p>
                <p className="mt-2 text-sm text-zinc-400">{seller.whatsapp}</p>
              </a>
            ))}
          </div>
        </div>
        <div className="cliptor-card overflow-hidden">
          <img src={store.settings.mascot_image} alt="Mascote" className="h-full min-h-[480px] w-full object-cover" />
        </div>
      </div>
    </section>
  );
}

function AdminPage({ products, store, refreshData, addLocalProduct, updateLocalStore }) {
  const [token, setToken] = useState(() => window.localStorage.getItem("dna-admin-token") || "");
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [dashboard, setDashboard] = useState(null);
  const [orders, setOrders] = useState([]);
  const defaultProductImage = store.settings.logo || "/dna-assets/logo.jpeg";
  const [content, setContent] = useState({
    footer_text: store.settings.footer_text,
    mandatory_notice: store.settings.mandatory_notice,
    exchange_policy: store.settings.exchange_policy,
    sellers: store.settings.sellers || fallbackStore.settings.sellers,
    shipping_by_state: store.settings.shipping_by_state || {},
    insurance_fee: store.settings.insurance_fee || 19.9,
    insurance_label: store.settings.insurance_label || "Seguro 100% opcional",
    insurance_enabled: store.settings.insurance_enabled ?? true,
  });
  const [productForm, setProductForm] = useState({
    name: "",
    brand: "DNA Cliptor",
    model: "",
    manufacturer: "DNA Cliptor Labs",
    category: "Performance",
    description: "",
    hero_phrase: "",
    image: defaultProductImage,
    cost_price: 0,
    margin_percent: 60,
    sale_price: 0,
    stock: 0,
    featured: false,
  });
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [activeAdminSection, setActiveAdminSection] = useState("orders");

  const resetProductForm = () => {
    setEditingProductId(null);
    setProductForm({
      name: "",
      brand: "DNA Cliptor",
      model: "",
      manufacturer: "DNA Cliptor Labs",
      category: "Performance",
      description: "",
      hero_phrase: "",
      image: defaultProductImage,
      cost_price: 0,
      margin_percent: 60,
      sale_price: 0,
      stock: 0,
      featured: false,
    });
  };

  const buildOfflineDashboard = () => {
    const offlineOrders = [];
    setOrders(offlineOrders);
    setDashboard({
      summary: {
        total_products: products.length,
        total_orders: offlineOrders.length,
        paid_orders: offlineOrders.filter((order) => ["Pago", "Separacao", "Enviado", "Em transporte", "Entregue"].includes(order.status)).length,
        revenue: offlineOrders.reduce((sum, order) => sum + Number(order.total || 0), 0),
      },
    });
  };

  const loadAdmin = async () => {
    try {
      const [dashResponse, ordersResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/admin/dashboard`, { headers: getAdminHeaders() }),
        axios.get(`${API_BASE}/api/orders`, { headers: getAdminHeaders() }),
      ]);
      setDashboard(dashResponse.data);
      setOrders(ordersResponse.data.orders);
      setSelectedOrderId((current) => current || ordersResponse.data.orders[0]?.id || "");
    } catch (error) {
      if (error.response?.status === 401) {
        clearAdminSession();
        setToken("");
        toast.error("Sessao administrativa expirada. Faca login novamente.");
        return;
      }
      if (!error.response) {
        buildOfflineDashboard();
        toast.warning("Painel em modo offline. Inicie o backend para dados reais.");
        return;
      }
      toast.error("Nao foi possivel carregar o painel.");
    }
  };

  useEffect(() => {
    if (token) loadAdmin();
  }, [token]);

  useEffect(() => {
    if (!orders.length) {
      setSelectedOrderId("");
      return;
    }
    if (!orders.some((order) => order.id === selectedOrderId)) {
      setSelectedOrderId(orders[0].id);
    }
  }, [orders, selectedOrderId]);

  useEffect(() => {
    setContent({
      footer_text: store.settings.footer_text,
      mandatory_notice: store.settings.mandatory_notice,
      exchange_policy: store.settings.exchange_policy,
      sellers: store.settings.sellers || fallbackStore.settings.sellers,
      shipping_by_state: store.settings.shipping_by_state || {},
      insurance_fee: store.settings.insurance_fee || 19.9,
      insurance_label: store.settings.insurance_label || "Seguro 100% opcional",
      insurance_enabled: store.settings.insurance_enabled ?? true,
    });
  }, [store]);

  useEffect(() => {
    setProductForm((current) => ({
      ...current,
      image: current.image || defaultProductImage,
    }));
  }, [defaultProductImage]);

  const startEditProduct = (product) => {
    setEditingProductId(product.id);
    setActiveAdminSection("products");
    setProductForm({
      name: product.name || "",
      brand: product.brand || "DNA Cliptor",
      model: product.model || "",
      manufacturer: product.manufacturer || "DNA Cliptor Labs",
      category: product.category || "Performance",
      description: product.description || "",
      hero_phrase: product.hero_phrase || "",
      image: product.image || defaultProductImage,
      cost_price: Number(product.cost_price || 0),
      margin_percent: Number(product.margin_percent || 60),
      sale_price: Number(product.sale_price || 0),
      stock: Number(product.stock || 0),
      featured: Boolean(product.featured),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const login = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_BASE}/api/admin/login`, credentials);
      window.localStorage.setItem("dna-admin-token", response.data.token);
      setToken(response.data.token);
      toast.success("Login administrativo realizado.");
    } catch (error) {
      if (error.response?.status === 429) {
        toast.error(error.response?.data?.detail || "Muitas tentativas. Tente novamente mais tarde.");
        return;
      }
      if (!error.response) {
        toast.error("Backend indisponivel. Verifique se a API esta rodando.");
        return;
      }
      toast.error("Credenciais invalidas.");
    }
  };

  const createProduct = async (event) => {
    event.preventDefault();
    const payload = {
      ...productForm,
      cost_price: Number(productForm.cost_price),
      margin_percent: Number(productForm.margin_percent),
      sale_price: Number(productForm.sale_price),
      stock: Number(productForm.stock),
      tags: ["novo", "dna cliptor"],
      shipping_by_state: defaultShippingByState,
      insurance_value: 19.9,
      active: true,
      rating: 5,
      reviews_count: 0,
    };
    try {
      if (editingProductId && !String(editingProductId).startsWith("local-")) {
        await axios.put(`${API_BASE}/api/products/${editingProductId}`, payload, { headers: getAdminHeaders() });
        toast.success("Produto atualizado.");
      } else if (editingProductId) {
        addLocalProduct({ ...payload, id: editingProductId }, true);
        toast.success("Produto local atualizado.");
      } else {
        await axios.post(`${API_BASE}/api/products`, payload, { headers: getAdminHeaders() });
        toast.success("Produto cadastrado.");
      }
      resetProductForm();
      refreshData();
      loadAdmin();
    } catch (error) {
      if (error.response?.status === 401) {
        clearAdminSession();
        setToken("");
        toast.error("Sessao administrativa expirada. Faca login novamente.");
        return;
      }
      if (!error.response) {
        addLocalProduct(editingProductId ? { ...payload, id: editingProductId } : payload, Boolean(editingProductId));
        resetProductForm();
        toast.success(editingProductId ? "Produto atualizado em modo offline." : "Produto salvo em modo offline.");
        return;
      }
      toast.error(editingProductId ? "Falha ao atualizar produto." : "Falha ao cadastrar produto.");
    }
  };

  const uploadProductImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setUploadingProductImage(true);
    try {
      const response = await axios.post(`${API_BASE}/api/upload-image`, formData, {
        headers: { "Content-Type": "multipart/form-data", ...getAdminHeaders() },
      });
      setProductForm((current) => ({ ...current, image: `${API_BASE}${response.data.url}` }));
      toast.success("Imagem do produto enviada.");
    } catch (error) {
      if (error.response?.status === 401) {
        clearAdminSession();
        setToken("");
        toast.error("Sessao administrativa expirada. Faca login novamente.");
        return;
      }
      try {
        const localPreview = await fileToDataUrl(file);
        setProductForm((current) => ({ ...current, image: localPreview }));
        if (!error.response) {
          toast.warning("Backend indisponivel. A imagem foi aplicada localmente nesta sessao.");
        } else {
          toast.warning("Upload remoto falhou. A imagem foi aplicada localmente nesta sessao.");
        }
      } catch {
        toast.error("Falha ao enviar imagem do produto.");
      }
    } finally {
      setUploadingProductImage(false);
      event.target.value = "";
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axios.patch(`${API_BASE}/api/orders/${orderId}/status`, { status }, { headers: getAdminHeaders() });
      toast.success("Status atualizado.");
      loadAdmin();
    } catch (error) {
      if (error.response?.status === 401) {
        clearAdminSession();
        setToken("");
        toast.error("Sessao administrativa expirada. Faca login novamente.");
        return;
      }
      toast.error("Falha ao atualizar status.");
    }
  };

  const selectedOrder = orders.find((order) => order.id === selectedOrderId) || orders[0] || null;
  const openOrdersPanel = () => {
    setActiveAdminSection("orders");
    if (!selectedOrderId && orders[0]) {
      setSelectedOrderId(orders[0].id);
    }
  };

  const saveContent = async (event) => {
    event.preventDefault();
    const normalizedContent = {
      ...content,
      sellers: (content.sellers || []).map((seller) => ({
        ...seller,
        whatsapp: String(seller.whatsapp || "").replace(/\D/g, ""),
      })),
      insurance_fee: Number(content.insurance_fee || 0),
      shipping_by_state: Object.fromEntries(
        Object.entries(content.shipping_by_state || {}).map(([state, value]) => [state, Number(value || 0)])
      ),
    };
    try {
      await axios.put(`${API_BASE}/api/settings`, normalizedContent, { headers: getAdminHeaders() });
      toast.success("Conteudo do site atualizado.");
      refreshData();
    } catch (error) {
      if (error.response?.status === 401) {
        clearAdminSession();
        setToken("");
        toast.error("Sessao administrativa expirada. Faca login novamente.");
        return;
      }
      if (!error.response) {
        updateLocalStore(normalizedContent);
        toast.success("Configuracoes salvas em modo offline.");
        return;
      }
      toast.error("Falha ao salvar conteudo.");
    }
  };

  if (!token) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 md:px-8">
        <form onSubmit={login} className="cliptor-card p-8">
          <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Painel admin</p>
          <h1 className="mt-3 text-5xl font-black uppercase">Login</h1>
          <div className="mt-8 space-y-4">
            <Input label="E-mail" value={credentials.email} onChange={(value) => setCredentials((current) => ({ ...current, email: value }))} autoComplete="off" />
            <Input label="Senha" type="password" value={credentials.password} onChange={(value) => setCredentials((current) => ({ ...current, password: value }))} autoComplete="new-password" />
          </div>
          <button className="cliptor-button mt-8 w-full">Entrar no painel</button>
        </form>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-[#f8c35f]">Gestao</p>
          <h1 className="text-5xl font-black uppercase">Painel administrativo</h1>
        </div>
        <button
          className="cliptor-button cliptor-button--ghost"
          onClick={() => {
            clearAdminSession();
            setToken("");
          }}
        >
          Sair
        </button>
      </div>

      {dashboard && (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard icon={Package} label="Produtos" value={dashboard.summary.total_products} onClick={() => setActiveAdminSection("products")} active={activeAdminSection === "products"} />
          <MetricCard icon={ShoppingCart} label="Pedidos" value={dashboard.summary.total_orders} onClick={openOrdersPanel} active={Boolean(selectedOrder)} />
          <MetricCard icon={ShieldCheck} label="Pagos" value={dashboard.summary.paid_orders} onClick={() => setActiveAdminSection("orders")} active={activeAdminSection === "orders"} />
          <MetricCard icon={BarChart3} label="Receita" value={currency(dashboard.summary.revenue)} />
        </div>
      )}

      <div className="mt-10 flex flex-wrap gap-3">
        {[
          { id: "orders", label: "Pedidos" },
          { id: "products", label: "Produtos" },
          { id: "content", label: "Conteudo do site" },
        ].map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => setActiveAdminSection(section.id)}
            className={`rounded-full border px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] transition ${activeAdminSection === section.id ? "border-[#f4b63e]/50 bg-[#f4b63e] text-black" : "border-white/10 bg-black/20 text-zinc-300 hover:border-[#f4b63e]/40"}`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeAdminSection === "products" && (
        <div className="mt-10 grid gap-8 xl:grid-cols-[1fr_0.95fr]">
          <form onSubmit={createProduct} className="cliptor-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-3xl font-black uppercase">{editingProductId ? "Editar produto" : "Cadastro de produtos"}</h2>
              {editingProductId && (
                <button type="button" className="cliptor-button cliptor-button--ghost" onClick={resetProductForm}>
                  Cancelar edicao
                </button>
              )}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-[180px_1fr] md:items-start">
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-3">
                <img
                  src={productForm.image || defaultProductImage}
                  alt="Preview do produto"
                  className="h-40 w-full rounded-[18px] object-cover"
                />
                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">Imagem atual</p>
                <p className="mt-1 text-xs text-zinc-400">Se nao enviar foto, o produto usa a logo da marca.</p>
              </div>
              <div className="rounded-[22px] border border-[#f4b63e]/20 bg-[#130f0a] p-4">
                <label className="cliptor-label">Foto do produto</label>
                <input type="file" accept="image/*" onChange={uploadProductImage} className="cliptor-input w-full file:mr-4 file:rounded-full file:border-0 file:bg-[#f8c35f] file:px-4 file:py-2 file:font-bold file:text-black" />
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" className="cliptor-button cliptor-button--ghost" onClick={() => setProductForm((current) => ({ ...current, image: defaultProductImage }))}>
                    Usar logo padrao
                  </button>
                  <span className="self-center text-xs uppercase tracking-[0.18em] text-zinc-500">
                    {uploadingProductImage ? "Enviando imagem..." : "Voce pode trocar a foto quando quiser."}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Input label="Nome" value={productForm.name} onChange={(value) => setProductForm((current) => ({ ...current, name: value }))} required />
              <Input label="Categoria" value={productForm.category} onChange={(value) => setProductForm((current) => ({ ...current, category: value }))} required />
              <Input label="Modelo" value={productForm.model} onChange={(value) => setProductForm((current) => ({ ...current, model: value }))} required />
              <Input label="Fabricante" value={productForm.manufacturer} onChange={(value) => setProductForm((current) => ({ ...current, manufacturer: value }))} required />
              <Input label="Custo" type="number" value={productForm.cost_price} onChange={(value) => setProductForm((current) => ({ ...current, cost_price: value }))} required />
              <Input label="Margem (%)" type="number" value={productForm.margin_percent} onChange={(value) => setProductForm((current) => ({ ...current, margin_percent: value }))} required />
              <Input label="Venda" type="number" value={productForm.sale_price} onChange={(value) => setProductForm((current) => ({ ...current, sale_price: value }))} required />
              <Input label="Estoque" type="number" value={productForm.stock} onChange={(value) => setProductForm((current) => ({ ...current, stock: value }))} required />
              <Input label="URL da imagem" value={productForm.image} onChange={(value) => setProductForm((current) => ({ ...current, image: value || defaultProductImage }))} />
              <Input label="Frase de impacto" value={productForm.hero_phrase} onChange={(value) => setProductForm((current) => ({ ...current, hero_phrase: value }))} required />
            </div>
            <div className="mt-4">
              <label className="cliptor-label">Descricao</label>
              <textarea className="cliptor-input min-h-32 w-full" value={productForm.description} onChange={(e) => setProductForm((current) => ({ ...current, description: e.target.value }))} required />
            </div>
            <label className="mt-4 flex items-center gap-3 text-sm text-zinc-300">
              <input type="checkbox" checked={productForm.featured} onChange={(e) => setProductForm((current) => ({ ...current, featured: e.target.checked }))} />
              Produto em destaque
            </label>
            <button className="cliptor-button mt-6">{editingProductId ? "Atualizar produto" : "Salvar produto"}</button>
          </form>

          <div className="cliptor-card p-6">
            <h2 className="text-3xl font-black uppercase">Produtos ativos</h2>
            <div className="mt-6 space-y-3">
              {products.map((product) => (
                <div key={product.id} className="flex items-center justify-between gap-4 rounded-[20px] border border-white/10 bg-black/25 p-4">
                  <div>
                    <p className="font-black uppercase">{product.name}</p>
                    <p className="text-sm text-zinc-400">{product.category} | Estoque {product.stock}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-[#f8c35f]">{currency(product.sale_price)}</p>
                    <button type="button" className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 hover:border-[#f4b63e]/40" onClick={() => startEditProduct(product)}>
                      Editar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAdminSection === "content" && (
        <form onSubmit={saveContent} className="mt-10 cliptor-card p-6">
          <h2 className="text-3xl font-black uppercase">Conteudo do site</h2>
          <div className="mt-6 space-y-4">
            <div>
              <label className="cliptor-label">Rodape</label>
              <textarea className="cliptor-input min-h-24 w-full" value={content.footer_text} onChange={(e) => setContent((current) => ({ ...current, footer_text: e.target.value }))} />
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <p className="cliptor-label">Vendedores e WhatsApp</p>
              <div className="grid gap-4 md:grid-cols-2">
                {(content.sellers || []).map((seller, index) => (
                  <div key={seller.id} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                    <Input
                      label={`Nome vendedor ${index + 1}`}
                      value={seller.name}
                      onChange={(value) =>
                        setContent((current) => ({
                          ...current,
                          sellers: (current.sellers || []).map((item) =>
                            item.id === seller.id ? { ...item, name: value } : item
                          ),
                        }))
                      }
                    />
                    <div className="mt-4">
                      <Input
                        label={`WhatsApp vendedor ${index + 1}`}
                        value={seller.whatsapp}
                        onChange={(value) =>
                          setContent((current) => ({
                            ...current,
                            sellers: (current.sellers || []).map((item) =>
                              item.id === seller.id ? { ...item, whatsapp: value } : item
                            ),
                          }))
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="cliptor-label">Aviso de entrega</label>
              <textarea className="cliptor-input min-h-28 w-full" value={content.mandatory_notice} onChange={(e) => setContent((current) => ({ ...current, mandatory_notice: e.target.value }))} />
            </div>
            <div>
              <label className="cliptor-label">Politica de trocas</label>
              <textarea className="cliptor-input min-h-28 w-full" value={content.exchange_policy} onChange={(e) => setContent((current) => ({ ...current, exchange_policy: e.target.value }))} />
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/25 p-4">
              <p className="cliptor-label">Frete por estado</p>
              <div className="grid gap-3 md:grid-cols-3">
                {shippingStates.map((state) => (
                  <div key={state}>
                    <label className="cliptor-label">{state}</label>
                    <input
                      type="number"
                      step="0.01"
                      className="cliptor-input w-full"
                      value={content.shipping_by_state?.[state] ?? ""}
                      onChange={(e) =>
                        setContent((current) => ({
                          ...current,
                          shipping_by_state: {
                            ...(current.shipping_by_state || {}),
                            [state]: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="Valor do seguro" type="number" value={content.insurance_fee} onChange={(value) => setContent((current) => ({ ...current, insurance_fee: value }))} />
              <Input label="Texto do seguro" value={content.insurance_label} onChange={(value) => setContent((current) => ({ ...current, insurance_label: value }))} />
            </div>
            <label className="mt-2 flex items-center gap-3 text-sm text-zinc-300">
              <input type="checkbox" checked={content.insurance_enabled} onChange={(e) => setContent((current) => ({ ...current, insurance_enabled: e.target.checked }))} />
              Ativar seguro no checkout
            </label>
          </div>
          <button className="cliptor-button mt-6">Atualizar conteudo</button>
        </form>
      )}

      {activeAdminSection === "orders" && (
        <div className="mt-10 cliptor-card p-6">
          <h2 className="text-3xl font-black uppercase">Pedidos</h2>
          <p className="mt-2 text-sm text-zinc-400">Clique em um pedido para ver numero, cliente, itens vendidos, endereco completo e status de pagamento.</p>
          <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-3">
              {orders.length === 0 && <p className="text-zinc-400">Nenhum pedido ainda.</p>}
              {orders.map((order) => (
                <button
                  key={order.id}
                  type="button"
                  onClick={() => setSelectedOrderId(order.id)}
                  className={`w-full rounded-[22px] border p-4 text-left transition ${selectedOrder?.id === order.id ? "border-[#f4b63e]/50 bg-[#171008]" : "border-white/10 bg-black/25 hover:border-[#f4b63e]/30"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-black uppercase">{order.order_number}</p>
                      <p className="text-sm text-zinc-400">{order.customer.full_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#f8c35f]">{currency(order.total)}</p>
                      <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">{order.payment_status || order.status}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs uppercase tracking-[0.18em] text-zinc-500">{order.status}</p>
                </button>
              ))}
            </div>
            {selectedOrder && (
              <div className="rounded-[22px] border border-white/10 bg-black/25 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pedido</p>
                    <h3 className="mt-2 text-2xl font-black uppercase">{selectedOrder.order_number}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{selectedOrder.customer.full_name} | {selectedOrder.seller_name}</p>
                  </div>
                  <div className="rounded-full border border-[#f4b63e]/30 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#f8c35f]">
                    {selectedOrder.payment_status || selectedOrder.status}
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Cliente</p>
                    <p className="mt-2 font-bold text-white">{selectedOrder.customer.full_name}</p>
                    <p className="mt-2 text-sm text-zinc-400">{selectedOrder.customer.phone}</p>
                    <p className="mt-1 text-sm text-zinc-400">{selectedOrder.customer.whatsapp}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Endereco</p>
                    <p className="mt-2 text-sm text-zinc-300">{formatOrderAddress(selectedOrder)}</p>
                    {selectedOrder.customer?.address?.reference && (
                      <p className="mt-2 text-sm text-zinc-400">Referencia: {selectedOrder.customer.address.reference}</p>
                    )}
                  </div>
                </div>
                <div className="mt-5 rounded-[18px] border border-white/10 bg-black/25 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Produtos vendidos</p>
                  <div className="mt-3 space-y-3">
                    {(selectedOrder.items || []).map((item) => (
                      <div key={`${selectedOrder.id}-${item.product_id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-white/10 bg-black/20 p-3">
                        <div>
                          <p className="font-bold uppercase text-white">{item.name}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Qtd {item.quantity}</p>
                        </div>
                        <p className="font-bold text-[#f8c35f]">{currency(item.total_price)}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Status do pedido</p>
                    <p className="mt-2 font-black uppercase text-white">{selectedOrder.status}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Pagamento</p>
                    <p className="mt-2 font-black uppercase text-white">{selectedOrder.payment_status || "Aguardando"}</p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 bg-black/25 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Total</p>
                    <p className="mt-2 font-black uppercase text-[#f8c35f]">{currency(selectedOrder.total)}</p>
                  </div>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Pedido recebido", "Pago", "Separacao", "Enviado", "Entregue", "Cancelado"].map((status) => (
                    <button key={status} className="rounded-full border border-white/10 px-3 py-2 text-xs font-bold uppercase tracking-[0.18em] text-zinc-300 hover:border-[#f4b63e]/40" onClick={() => updateStatus(selectedOrder.id, status)} type="button">
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function AppRoutes({ store, products, cart, addToCart, updateQuantity, removeItem, latestOrder, setLatestOrder, refreshData, addLocalProduct, updateLocalStore }) {
  return (
    <MainLayout store={store} cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}>
      <Routes>
        <Route path="/" element={<HomePage store={store} products={products} onAdd={addToCart} />} />
        <Route path="/produtos" element={<ProductsPage products={products} onAdd={addToCart} />} />
        <Route path="/produto/:id" element={<ProductPage products={products} onAdd={addToCart} />} />
        <Route path="/carrinho" element={<CartPage cart={cart} products={products} updateQuantity={updateQuantity} removeItem={removeItem} />} />
        <Route path="/checkout" element={<CheckoutPage cart={cart} products={products} store={store} onOrderCreated={setLatestOrder} />} />
        <Route path="/confirmacao/:id" element={<ConfirmationPage latestOrder={latestOrder} />} />
        <Route path="/politicas" element={<PoliciesPage store={store} />} />
        <Route path="/contato" element={<ContactPage store={store} />} />
        <Route path="/admin" element={<AdminPage products={products} store={store} refreshData={refreshData} addLocalProduct={addLocalProduct} updateLocalStore={updateLocalStore} />} />
      </Routes>
    </MainLayout>
  );
}

function App() {
  const [store, setStore] = useState(() => getStoredOfflineStore() || fallbackStore);
  const [products, setProducts] = useState(() => mergeProducts(getStoredOfflineProducts(), fallbackProducts));
  const [cart, setCart] = usePersistentCart();
  const [latestOrder, setLatestOrder] = useState(() => {
    try {
      return JSON.parse(window.localStorage.getItem("dna-latest-order") || "null");
    } catch {
      return null;
    }
  });

  const refreshData = async () => {
    try {
      const [storeResponse, productsResponse] = await Promise.all([
        axios.get(`${API_BASE}/api/store`),
        axios.get(`${API_BASE}/api/products`),
      ]);
      setStore(storeResponse.data);
      window.localStorage.setItem("dna-offline-store", JSON.stringify(storeResponse.data));
      setProducts(mergeProducts(getStoredOfflineProducts(), productsResponse.data.products));
    } catch {
      const offlineStore = getStoredOfflineStore();
      setStore(offlineStore || { ...fallbackStore, featured_products: fallbackProducts.filter((product) => product.featured) });
      setProducts(mergeProducts(getStoredOfflineProducts(), fallbackProducts));
      toast.warning("Usando dados locais enquanto a API nao responde.");
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  const addToCart = (product) => {
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing) {
        return current.map((item) => (item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { productId: product.id, quantity: 1 }];
    });
    toast.success(`${product.name} adicionado ao carrinho.`);
  };

  const updateQuantity = (productId, quantity) => {
    setCart((current) => current.map((item) => (item.productId === productId ? { ...item, quantity } : item)));
  };

  const removeItem = (productId) => {
    setCart((current) => current.filter((item) => item.productId !== productId));
  };

  const addLocalProduct = (product, replaceExisting = false) => {
    setProducts((current) => {
      const nextProduct = {
        ...product,
        id: product.id || `local-${Date.now()}`,
        active: product.active ?? true,
        __offline: true,
      };
      const base = replaceExisting ? current.filter((item) => item.id !== nextProduct.id) : current;
      const nextProducts = [nextProduct, ...base];
      const offlineProducts = nextProducts.filter((item) => item.__offline);
      setStoredOfflineProducts(offlineProducts);
      return nextProducts;
    });
  };

  const updateLocalStore = (settingsPatch) => {
    setStore((current) => {
      const nextStore = {
        ...current,
        settings: {
          ...current.settings,
          ...settingsPatch,
        },
      };
      window.localStorage.setItem("dna-offline-store", JSON.stringify(nextStore));
      return nextStore;
    });
  };

  return (
    <BrowserRouter>
      <AppRoutes
        store={store}
        products={products}
        cart={cart}
        addToCart={addToCart}
        updateQuantity={updateQuantity}
        removeItem={removeItem}
        latestOrder={latestOrder}
        setLatestOrder={(order) => {
          setLatestOrder(order);
          window.localStorage.setItem("dna-latest-order", JSON.stringify(order));
          setCart([]);
          refreshData();
        }}
        refreshData={refreshData}
        addLocalProduct={addLocalProduct}
        updateLocalStore={updateLocalStore}
      />
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
