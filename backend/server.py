from __future__ import annotations

import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import List, Literal, Optional

import aiofiles
import requests
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.staticfiles import StaticFiles
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

MONGO_URL = os.getenv("MONGO_URL", "").strip()
DB_NAME = os.getenv("DB_NAME", "dna_cliptor").strip() or "dna_cliptor"
USE_MOCK_DB = os.getenv("USE_MOCK_DB", "").strip().lower() in {"1", "true", "yes"} or not MONGO_URL
MERCADO_PAGO_ACCESS_TOKEN = os.getenv("MERCADO_PAGO_ACCESS_TOKEN", "").strip()
MERCADO_PAGO_PUBLIC_KEY = os.getenv("MERCADO_PAGO_PUBLIC_KEY", "").strip()
MERCADO_PAGO_WEBHOOK_URL = os.getenv("MERCADO_PAGO_WEBHOOK_URL", "").strip()
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@dnacliptor.com").strip() or "admin@dnacliptor.com"
ADMIN_DEFAULT_PASSWORD = os.getenv("ADMIN_DEFAULT_PASSWORD", "LR1a2b3c4567@2026").strip() or "LR1a2b3c4567@2026"
ADMIN_TOKEN_SECRET = os.getenv("ADMIN_TOKEN_SECRET", secrets.token_urlsafe(32)).strip()
ADMIN_TOKEN_TTL_SECONDS = int(os.getenv("ADMIN_TOKEN_TTL_SECONDS", "28800"))
ADMIN_LOGIN_MAX_ATTEMPTS = int(os.getenv("ADMIN_LOGIN_MAX_ATTEMPTS", "5"))
ADMIN_LOGIN_BLOCK_SECONDS = int(os.getenv("ADMIN_LOGIN_BLOCK_SECONDS", "900"))


def create_database_client(use_mock: bool):
    if use_mock:
        from mongomock_motor import AsyncMongoMockClient

        logger.warning("Usando banco em memoria para DNA Cliptor.")
        mongo_client = AsyncMongoMockClient()
    else:
        mongo_client = AsyncIOMotorClient(MONGO_URL, serverSelectionTimeoutMS=5000)
    return mongo_client, mongo_client[DB_NAME]


client, db = create_database_client(USE_MOCK_DB)

app = FastAPI(title="DNA Cliptor API")
api_router = APIRouter(prefix="/api")

UPLOADS_DIR = ROOT_DIR / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)

CORS_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000",
    ).split(",")
    if origin.strip()
]

ORDER_STATUSES = [
    "Pedido recebido",
    "Aguardando pagamento",
    "Pago",
    "Separacao",
    "Enviado",
    "Em transporte",
    "Entregue",
    "Cancelado",
]

DEFAULT_SHIPPING_BY_STATE = {
    "SP": 45.0,
    "RJ": 58.0,
    "MG": 58.0,
    "SC": 58.0,
    "RS": 58.0,
    "PR": 58.0,
    "ES": 58.0,
    "DF": 65.0,
    "GO": 65.0,
    "CE": 70.0,
    "BA": 70.0,
    "AL": 70.0,
    "MA": 70.0,
    "MT": 75.0,
    "PE": 75.0,
    "PB": 75.0,
    "PI": 75.0,
    "PA": 80.0,
    "TO": 80.0,
    "MS": 90.0,
    "SE": 100.0,
    "RN": 100.0,
    "RO": 100.0,
    "AP": 100.0,
    "AM": 120.0,
    "AC": 120.0,
    "RR": 120.0,
}
SHIPPING_PROFILE_VERSION = 2
ADMIN_SECURITY_VERSION = 2
admin_login_attempts: dict[str, dict] = {}


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def urlsafe_b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("utf-8")


def urlsafe_b64decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(f"{value}{padding}".encode("utf-8"))


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000)
    return f"{salt}${digest.hex()}"


def verify_password(password: str, stored_hash: str) -> bool:
    if not stored_hash:
        return False
    if "$" not in stored_hash:
        return hmac.compare_digest(hashlib.sha256(password.encode()).hexdigest(), stored_hash)
    salt, digest = stored_hash.split("$", 1)
    computed = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 120000).hex()
    return hmac.compare_digest(computed, digest)


def create_admin_token(admin: dict) -> str:
    payload = {
        "sub": admin["id"],
        "email": admin["email"],
        "exp": int(time.time()) + ADMIN_TOKEN_TTL_SECONDS,
    }
    payload_segment = urlsafe_b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(ADMIN_TOKEN_SECRET.encode("utf-8"), payload_segment.encode("utf-8"), hashlib.sha256).digest()
    return f"{payload_segment}.{urlsafe_b64encode(signature)}"


def decode_admin_token(token: str) -> dict:
    try:
        payload_segment, signature_segment = token.split(".", 1)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail="Token administrativo invalido.") from exc
    expected = hmac.new(ADMIN_TOKEN_SECRET.encode("utf-8"), payload_segment.encode("utf-8"), hashlib.sha256).digest()
    received = urlsafe_b64decode(signature_segment)
    if not hmac.compare_digest(expected, received):
        raise HTTPException(status_code=401, detail="Token administrativo invalido.")
    payload = json.loads(urlsafe_b64decode(payload_segment).decode("utf-8"))
    if int(payload.get("exp", 0)) <= int(time.time()):
        raise HTTPException(status_code=401, detail="Sessao administrativa expirada.")
    return payload


def get_request_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


def register_login_failure(key: str) -> None:
    current = admin_login_attempts.get(key, {"count": 0, "blocked_until": 0})
    current["count"] += 1
    if current["count"] >= ADMIN_LOGIN_MAX_ATTEMPTS:
        current["blocked_until"] = int(time.time()) + ADMIN_LOGIN_BLOCK_SECONDS
        current["count"] = 0
    admin_login_attempts[key] = current


def reset_login_failures(key: str) -> None:
    admin_login_attempts.pop(key, None)


def assert_login_not_blocked(key: str) -> None:
    current = admin_login_attempts.get(key)
    if not current:
        return
    blocked_until = int(current.get("blocked_until", 0))
    if blocked_until > int(time.time()):
        raise HTTPException(status_code=429, detail="Muitas tentativas de login. Tente novamente mais tarde.")
    if blocked_until:
        admin_login_attempts.pop(key, None)


def log_admin_access(action: str, request: Request, status: str, email: str = "") -> None:
    logger.info(
        "ADMIN_ACCESS action=%s status=%s email=%s ip=%s",
        action,
        status,
        email or "-",
        get_request_ip(request),
    )


async def require_admin_auth(request: Request, authorization: Optional[str] = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Autenticacao administrativa obrigatoria.")
    payload = decode_admin_token(authorization.split(" ", 1)[1].strip())
    admin = await db.admin_users.find_one({"id": payload["sub"], "email": payload["email"]}, {"_id": 0})
    if not admin:
        raise HTTPException(status_code=401, detail="Sessao administrativa invalida.")
    request.state.admin = admin
    return admin


def brl(value: float) -> float:
    return round(float(value), 2)


def order_number() -> str:
    return f"DNA-{datetime.now().strftime('%y%m%d')}-{str(uuid.uuid4())[:6].upper()}"


def build_pix_code(order_id: str, total: float) -> str:
    clean = str(total).replace(".", "")
    return f"00020126330014BR.GOV.BCB.PIX0111DNACLIPTOR520400005303986540{clean}5802BR5913DNA CLIPTOR6009SAO PAULO62070503{order_id[:6]}6304ABCD"


def mercado_pago_enabled() -> bool:
    return bool(MERCADO_PAGO_ACCESS_TOKEN)


def create_mercado_pago_pix_payment(order: dict) -> dict:
    if not MERCADO_PAGO_ACCESS_TOKEN:
        raise RuntimeError("Mercado Pago nao configurado.")

    customer = order["customer"]
    address = customer["address"]
    payer_email = customer.get("email") or f"cliente.{order['id'][:8]}@dnacliptor.local"

    payload = {
        "transaction_amount": float(order["total"]),
        "description": f"Pedido {order['order_number']} - DNA Cliptor",
        "payment_method_id": "pix",
        "external_reference": order["order_number"],
        "notification_url": MERCADO_PAGO_WEBHOOK_URL or None,
        "payer": {
            "email": payer_email,
            "first_name": customer["full_name"].split(" ")[0],
            "last_name": " ".join(customer["full_name"].split(" ")[1:]) or "Cliente",
            "address": {
                "zip_code": address["zip_code"],
                "street_name": address["street"],
                "street_number": address["number"],
                "neighborhood": address["district"],
                "city": address["city"],
                "federal_unit": address["state"],
            },
        },
    }
    payload = {key: value for key, value in payload.items() if value is not None}

    try:
        response = requests.post(
            "https://api.mercadopago.com/v1/payments",
            headers={
                "Authorization": f"Bearer {MERCADO_PAGO_ACCESS_TOKEN}",
                "Content-Type": "application/json",
                "X-Idempotency-Key": order["id"],
            },
            json=payload,
            timeout=20,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Falha Mercado Pago: {exc}") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Falha Mercado Pago: {response.text[:300]}")

    data = response.json()
    tx = data.get("point_of_interaction", {}).get("transaction_data", {})
    return {
        "provider": "mercado_pago",
        "payment_id": data.get("id"),
        "status": data.get("status"),
        "status_detail": data.get("status_detail"),
        "ticket_url": tx.get("ticket_url", ""),
        "qr_code": tx.get("qr_code", ""),
        "qr_code_base64": tx.get("qr_code_base64", ""),
        "public_key": MERCADO_PAGO_PUBLIC_KEY,
    }


def fetch_mercado_pago_payment(payment_id: str) -> dict:
    if not MERCADO_PAGO_ACCESS_TOKEN:
        raise RuntimeError("Mercado Pago nao configurado.")
    try:
        response = requests.get(
            f"https://api.mercadopago.com/v1/payments/{payment_id}",
            headers={"Authorization": f"Bearer {MERCADO_PAGO_ACCESS_TOKEN}"},
            timeout=20,
        )
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail=f"Falha Mercado Pago: {exc}") from exc
    if response.status_code >= 400:
        raise HTTPException(status_code=502, detail=f"Falha Mercado Pago: {response.text[:300]}")
    return response.json()


def build_whatsapp_message(order: dict) -> str:
    items = "\n".join(
        f"- {item['name']} x{item['quantity']} | R$ {item['total_price']:.2f}"
        for item in order["items"]
    )
    address = order["customer"]["address"]
    return (
        f"Pedido {order['order_number']}\n"
        f"Cliente: {order['customer']['full_name']}\n"
        f"Telefone: {order['customer']['phone']}\n"
        f"WhatsApp: {order['customer']['whatsapp']}\n"
        f"Endereco: {address['street']}, {address['number']} - {address['district']} - "
        f"{address['city']}/{address['state']} - CEP {address['zip_code']}\n"
        f"Referencia: {address.get('reference', '-')}\n"
        f"Produtos:\n{items}\n"
        f"Subtotal: R$ {order['subtotal']:.2f}\n"
        f"Frete: R$ {order['shipping_cost']:.2f}\n"
        f"Seguro: R$ {order['insurance_cost']:.2f}\n"
        f"Total: R$ {order['total']:.2f}\n"
        f"Vendedor: {order['seller_name']}"
    )


def normalize_whatsapp_number(value: str) -> str:
    return "".join(char for char in str(value or "") if char.isdigit())


class BrandSection(BaseModel):
    title: str
    subtitle: str
    cta_text: str


class Seller(BaseModel):
    id: str
    name: str
    whatsapp: str


class Benefit(BaseModel):
    title: str
    description: str


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    brand: str
    model: str
    manufacturer: str
    category: str
    description: str
    hero_phrase: str
    image: str
    cost_price: float
    margin_percent: float
    sale_price: float
    stock: int
    featured: bool = False
    active: bool = True
    rating: float = 4.8
    reviews_count: int = 0
    tags: List[str] = []
    shipping_by_state: dict = {}
    insurance_value: float = 19.9
    created_at: datetime = Field(default_factory=now_utc)
    updated_at: datetime = Field(default_factory=now_utc)


class ProductCreate(BaseModel):
    name: str
    brand: str
    model: str
    manufacturer: str
    category: str
    description: str
    hero_phrase: str
    image: str
    cost_price: float
    margin_percent: float
    sale_price: float
    stock: int
    featured: bool = False
    active: bool = True
    rating: float = 4.8
    reviews_count: int = 0
    tags: List[str] = []
    shipping_by_state: dict = {}
    insurance_value: float = 19.9


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    brand: Optional[str] = None
    model: Optional[str] = None
    manufacturer: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    hero_phrase: Optional[str] = None
    image: Optional[str] = None
    cost_price: Optional[float] = None
    margin_percent: Optional[float] = None
    sale_price: Optional[float] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    active: Optional[bool] = None
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    tags: Optional[List[str]] = None
    shipping_by_state: Optional[dict] = None
    insurance_value: Optional[float] = None


class CartItemInput(BaseModel):
    product_id: str
    quantity: int = 1


class Address(BaseModel):
    zip_code: str
    street: str
    district: str
    city: str
    state: str
    number: str
    reference: Optional[str] = ""


class Customer(BaseModel):
    full_name: str
    email: str
    phone: str
    whatsapp: str
    address: Address


class OrderCreate(BaseModel):
    customer: Customer
    items: List[CartItemInput]
    seller_id: str
    shipping_state: str
    include_insurance: bool = False
    payment_method: Literal["pix"] = "pix"
    coupon_code: Optional[str] = ""


class OrderStatusUpdate(BaseModel):
    status: str


class AdminLogin(BaseModel):
    email: str
    password: str


class MercadoPagoWebhookPayload(BaseModel):
    action: Optional[str] = None
    api_version: Optional[str] = None
    data: dict = {}
    date_created: Optional[str] = None
    id: Optional[int] = None
    live_mode: Optional[bool] = None
    type: Optional[str] = None
    user_id: Optional[str] = None


class SiteSettings(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = "site-settings"
    brand_name: str
    logo: str
    banner_image: str
    mascot_image: str
    hero: BrandSection
    phrases: List[str]
    benefits: List[Benefit]
    sellers: List[Seller]
    mandatory_notice: str
    exchange_policy: str
    insurance_enabled: bool = True
    insurance_label: str = "Seguro 100% opcional"
    shipping_by_state: dict = {}
    insurance_fee: float = 19.9
    footer_text: str = ""
    video_url: str = ""


class SiteSettingsUpdate(BaseModel):
    brand_name: Optional[str] = None
    logo: Optional[str] = None
    banner_image: Optional[str] = None
    mascot_image: Optional[str] = None
    hero: Optional[BrandSection] = None
    phrases: Optional[List[str]] = None
    benefits: Optional[List[Benefit]] = None
    sellers: Optional[List[Seller]] = None
    mandatory_notice: Optional[str] = None
    exchange_policy: Optional[str] = None
    insurance_enabled: Optional[bool] = None
    insurance_label: Optional[str] = None
    shipping_by_state: Optional[dict] = None
    insurance_fee: Optional[float] = None
    footer_text: Optional[str] = None
    video_url: Optional[str] = None


async def serialize_product(doc: dict) -> dict:
    product = dict(doc)
    for field in ("created_at", "updated_at"):
        value = product.get(field)
        if isinstance(value, str):
            product[field] = datetime.fromisoformat(value)
    return product


async def ensure_seed_data():
    settings_count = await db.site_settings.count_documents({})
    if settings_count == 0:
        settings = SiteSettings(
            brand_name="DNA Cliptor",
            logo="/dna-assets/logo.jpeg",
            banner_image="/dna-assets/hero-man.jpeg",
            mascot_image="/dna-assets/pitbull.jpeg",
            hero=BrandSection(
                title="GENES DE CAMPEAO",
                subtitle="SUPLEMENTOS PARA PERFORMANCE MAXIMA",
                cta_text="CONHECA NOSSOS PRODUTOS",
            ),
            phrases=[
                "Desperte seu verdadeiro potencial",
                "Seu corpo, sua evolucao",
                "Forca nao e opcao, e obrigacao",
                "Alta performance comeca aqui",
            ],
            benefits=[
                Benefit(title="Alta Qualidade", description="Formulas premium para atletas exigentes."),
                Benefit(title="Resultados Rapidos", description="Stacks pensados para ganho, foco e recuperacao."),
                Benefit(title="Envio Seguro", description="Frete configurado por estado com rastreio e protecao."),
                Benefit(title="Suporte 24h", description="Equipe comercial disponivel para orientar sua compra."),
            ],
            sellers=[
                Seller(id="seller-1", name="Vendedor 1", whatsapp="5511999991111"),
                Seller(id="seller-2", name="Vendedor 2", whatsapp="5511999992222"),
            ],
            mandatory_notice=(
                "E obrigatorio ter alguem no local para receber o pedido. "
                "Nao nos responsabilizamos caso nao haja ninguem no momento da entrega, "
                "pois utilizamos transportadora."
            ),
            exchange_policy=(
                "Trocas e reclamacoes so serao aceitas com video. "
                "O cliente deve gravar abrindo a caixa no momento da entrega. "
                "Sem video, nao sera aceito."
            ),
            shipping_by_state=DEFAULT_SHIPPING_BY_STATE,
            insurance_fee=19.9,
            footer_text="DNA Cliptor | Forca, foco e evolucao em cada entrega.",
        )
        doc = settings.model_dump()
        await db.site_settings.insert_one(doc)

    products_count = await db.products.count_documents({})
    if products_count == 0:
        shipping = DEFAULT_SHIPPING_BY_STATE
        products = [
            Product(
                name="Whey Protein 3kg",
                slug="whey-protein-3kg",
                brand="DNA Cliptor",
                model="Ultra Whey 3kg",
                manufacturer="DNA Cliptor Labs",
                category="Proteina",
                description="Blend concentrado e isolado para acelerar recuperacao muscular e construcao de massa.",
                hero_phrase="Recuperacao de elite depois de treinos brutais.",
                image="/dna-assets/layout-reference.jpeg",
                cost_price=119.0,
                margin_percent=65.0,
                sale_price=199.0,
                stock=32,
                featured=True,
                reviews_count=187,
                tags=["massa", "recuperacao", "top seller"],
                shipping_by_state=shipping,
                insurance_value=17.9,
            ),
            Product(
                name="Pre-treino 350g",
                slug="pre-treino-350g",
                brand="DNA Cliptor",
                model="Rage 350g",
                manufacturer="DNA Cliptor Labs",
                category="Pre-treino",
                description="Formula termogenica com cafeina, beta alanina e taurina para foco e explosao.",
                hero_phrase="Entre no treino em modo ataque.",
                image="/dna-assets/hero-man.jpeg",
                cost_price=74.0,
                margin_percent=74.0,
                sale_price=129.0,
                stock=48,
                featured=True,
                reviews_count=123,
                tags=["energia", "foco", "explosao"],
                shipping_by_state=shipping,
                insurance_value=14.9,
            ),
            Product(
                name="Testo Booster",
                slug="testo-booster",
                brand="DNA Cliptor",
                model="Alpha Test",
                manufacturer="DNA Cliptor Labs",
                category="Hormonal Support",
                description="Compostos para rotina de alta performance com suporte de energia, libido e disposicao.",
                hero_phrase="Mentalidade de lider, presenca de campeao.",
                image="/dna-assets/pitbull.jpeg",
                cost_price=81.0,
                margin_percent=69.0,
                sale_price=139.0,
                stock=21,
                featured=True,
                reviews_count=89,
                tags=["forca", "drive", "performance"],
                shipping_by_state=shipping,
                insurance_value=16.9,
            ),
            Product(
                name="Creatina Monohidratada 500g",
                slug="creatina-500g",
                brand="DNA Cliptor",
                model="Core Creatine",
                manufacturer="DNA Cliptor Labs",
                category="Performance",
                description="Creatina pura micronizada para mais volume, forca e resistencia ao longo do ciclo.",
                hero_phrase="Sua base diaria para evolucao consistente.",
                image="/dna-assets/logo.jpeg",
                cost_price=59.0,
                margin_percent=67.0,
                sale_price=99.0,
                stock=60,
                reviews_count=144,
                tags=["forca", "volume", "diario"],
                shipping_by_state=shipping,
                insurance_value=12.9,
            ),
        ]
        docs = []
        for product in products:
            doc = product.model_dump()
            doc["created_at"] = product.created_at.isoformat()
            doc["updated_at"] = product.updated_at.isoformat()
            docs.append(doc)
        await db.products.insert_many(docs)

    admin_exists = await db.admin_users.find_one({"email": ADMIN_EMAIL})
    admin_payload = {
        "email": ADMIN_EMAIL,
        "name": "DNA Admin",
        "password_hash": hash_password(ADMIN_DEFAULT_PASSWORD),
        "security_version": ADMIN_SECURITY_VERSION,
        "updated_at": now_utc().isoformat(),
    }
    if not admin_exists:
        await db.admin_users.insert_one(
            {
                "id": str(uuid.uuid4()),
                **admin_payload,
                "created_at": now_utc().isoformat(),
            }
        )
    elif admin_exists.get("security_version", 0) < ADMIN_SECURITY_VERSION:
        await db.admin_users.update_one({"id": admin_exists["id"]}, {"$set": admin_payload})


async def get_settings() -> dict:
    settings = await db.site_settings.find_one({}, {"_id": 0})
    if not settings:
        await ensure_seed_data()
        settings = await db.site_settings.find_one({}, {"_id": 0})
    if settings.get("shipping_profile_version", 0) < SHIPPING_PROFILE_VERSION:
        settings["shipping_by_state"] = DEFAULT_SHIPPING_BY_STATE
        settings["shipping_profile_version"] = SHIPPING_PROFILE_VERSION
        await db.site_settings.update_one(
            {"id": settings["id"]},
            {"$set": {"shipping_by_state": DEFAULT_SHIPPING_BY_STATE, "shipping_profile_version": SHIPPING_PROFILE_VERSION}},
        )
    elif "shipping_by_state" not in settings:
        settings["shipping_by_state"] = DEFAULT_SHIPPING_BY_STATE
        await db.site_settings.update_one({"id": settings["id"]}, {"$set": {"shipping_by_state": settings["shipping_by_state"]}})
    else:
        merged_shipping = {**DEFAULT_SHIPPING_BY_STATE, **settings.get("shipping_by_state", {})}
        if merged_shipping != settings.get("shipping_by_state", {}):
            settings["shipping_by_state"] = merged_shipping
            await db.site_settings.update_one({"id": settings["id"]}, {"$set": {"shipping_by_state": merged_shipping}})
    if "insurance_fee" not in settings:
        settings["insurance_fee"] = 19.9
        await db.site_settings.update_one({"id": settings["id"]}, {"$set": {"insurance_fee": settings["insurance_fee"]}})
    return settings


async def get_seller(seller_id: str) -> dict:
    settings = await get_settings()
    for seller in settings["sellers"]:
        if seller["id"] == seller_id:
            normalized = dict(seller)
            normalized["whatsapp"] = normalize_whatsapp_number(normalized.get("whatsapp", ""))
            return normalized
    raise HTTPException(status_code=404, detail="Vendedor nao encontrado")


async def get_product_or_404(product_id: str) -> dict:
    product = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not product:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return await serialize_product(product)


async def ensure_catalog_products() -> None:
    shipping = DEFAULT_SHIPPING_BY_STATE
    products = [
        Product(
            name="World Series France Whey 900g",
            slug="world-series-france-whey-900g",
            brand="DNA Cliptor",
            model="World Series France",
            manufacturer="DNA Cliptor Labs",
            category="Proteina",
            description="Blend proteico da linha World Series com perfil para recuperacao e reconstrucao muscular intensa.",
            hero_phrase="Forca extrema com assinatura internacional.",
            image="/dna-assets/world-france.jpeg",
            cost_price=69.0,
            margin_percent=72.0,
            sale_price=129.0,
            stock=28,
            tags=["world series", "proteina", "franca"],
            shipping_by_state=shipping,
            insurance_value=15.9,
        ),
        Product(
            name="World Series Russia Pre-Workout 300g",
            slug="world-series-russia-pre-workout-300g",
            brand="DNA Cliptor",
            model="World Series Russia",
            manufacturer="DNA Cliptor Labs",
            category="Pre-treino",
            description="Formula concentrada para energia, foco e explosao nas sessoes mais pesadas.",
            hero_phrase="Energia maxima para treinos sem recuo.",
            image="/dna-assets/world-russia.jpeg",
            cost_price=61.0,
            margin_percent=78.0,
            sale_price=119.0,
            stock=24,
            tags=["world series", "energia", "russia"],
            shipping_by_state=shipping,
            insurance_value=14.9,
        ),
        Product(
            name="World Series Canada Creatina 300g",
            slug="world-series-canada-creatina-300g",
            brand="DNA Cliptor",
            model="World Series Canada",
            manufacturer="DNA Cliptor Labs",
            category="Performance",
            description="Creatina micronizada da linha World Series para suporte de forca, volume e repeticao com consistencia.",
            hero_phrase="Base diaria para evolucao com nivel de atleta.",
            image="/dna-assets/world-canada.jpeg",
            cost_price=47.0,
            margin_percent=91.0,
            sale_price=89.9,
            stock=30,
            tags=["world series", "creatina", "canada"],
            shipping_by_state=shipping,
            insurance_value=13.9,
        ),
        Product(
            name="World Series China Mass 1,5kg",
            slug="world-series-china-mass-1-5kg",
            brand="DNA Cliptor",
            model="World Series China",
            manufacturer="DNA Cliptor Labs",
            category="Hipercalorico",
            description="Combinacao de carboidratos e proteinas para aumentar aporte calorico e acelerar a construcao de massa.",
            hero_phrase="Volume bruto para fases de ganho pesado.",
            image="/dna-assets/world-china.jpeg",
            cost_price=79.0,
            margin_percent=77.0,
            sale_price=139.9,
            stock=18,
            tags=["world series", "massa", "china"],
            shipping_by_state=shipping,
            insurance_value=16.9,
        ),
        Product(
            name="World Series USA Booster 120 caps",
            slug="world-series-usa-booster-120-caps",
            brand="DNA Cliptor",
            model="World Series USA",
            manufacturer="DNA Cliptor Labs",
            category="Hormonal Support",
            description="Stack de suporte para energia, drive e desempenho continuo na rotina de alta performance.",
            hero_phrase="Atitude de campeao em cada ciclo.",
            image="/dna-assets/world-usa.jpeg",
            cost_price=58.0,
            margin_percent=107.0,
            sale_price=119.9,
            stock=22,
            tags=["world series", "booster", "usa"],
            shipping_by_state=shipping,
            insurance_value=14.9,
        ),
        Product(
            name="World Series Brazil Recovery 450g",
            slug="world-series-brazil-recovery-450g",
            brand="DNA Cliptor",
            model="World Series Brazil",
            manufacturer="DNA Cliptor Labs",
            category="Recuperacao",
            description="Formula para reposicao e recuperacao com aminoacidos e suporte ao desempenho entre treinos.",
            hero_phrase="Recupere forte e volte mais agressivo.",
            image="/dna-assets/world-brazil.jpeg",
            cost_price=55.0,
            margin_percent=90.0,
            sale_price=104.9,
            stock=26,
            tags=["world series", "recuperacao", "brasil"],
            shipping_by_state=shipping,
            insurance_value=13.9,
        ),
    ]
    for product in products:
        existing = await db.products.find_one({"slug": product.slug}, {"_id": 0})
        if existing:
            continue
        doc = product.model_dump()
        doc["created_at"] = product.created_at.isoformat()
        doc["updated_at"] = product.updated_at.isoformat()
        await db.products.insert_one(doc)


@api_router.get("/")
async def root():
    return {"message": "DNA Cliptor API", "version": "1.0.0"}


@api_router.get("/health")
async def health():
    return {"status": "healthy"}


@api_router.get("/store")
async def store_home():
    settings = await get_settings()
    featured = await db.products.find({"featured": True, "active": True}, {"_id": 0}).to_list(20)
    products = [await serialize_product(item) for item in featured]
    return {
        "settings": settings,
        "featured_products": products,
        "payment_provider": {
            "mercado_pago_enabled": mercado_pago_enabled(),
            "mercado_pago_public_key": MERCADO_PAGO_PUBLIC_KEY,
        },
    }


@api_router.get("/products")
async def list_products(category: Optional[str] = None, query: Optional[str] = None, featured: Optional[bool] = None):
    db_query = {"active": True}
    if category:
        db_query["category"] = category
    if featured is not None:
        db_query["featured"] = featured
    items = await db.products.find(db_query, {"_id": 0}).to_list(200)
    products = [await serialize_product(item) for item in items]
    if query:
        text = query.lower()
        products = [
            product
            for product in products
            if text in product["name"].lower()
            or text in product["description"].lower()
            or text in product["category"].lower()
        ]
    categories = sorted({product["category"] for product in products})
    return {"products": products, "categories": categories}


@api_router.get("/products/{product_id}")
async def product_detail(product_id: str):
    return await get_product_or_404(product_id)


@api_router.post("/products", response_model=Product, status_code=201)
async def create_product(payload: ProductCreate, admin: dict = Depends(require_admin_auth)):
    slug = payload.name.lower().replace(" ", "-")
    product = Product(slug=slug, **payload.model_dump())
    doc = product.model_dump()
    doc["created_at"] = product.created_at.isoformat()
    doc["updated_at"] = product.updated_at.isoformat()
    await db.products.insert_one(doc)
    return product


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(product_id: str, payload: ProductUpdate, admin: dict = Depends(require_admin_auth)):
    existing = await db.products.find_one({"id": product_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    if "name" in update_data:
        update_data["slug"] = update_data["name"].lower().replace(" ", "-")
    update_data["updated_at"] = now_utc().isoformat()
    await db.products.update_one({"id": product_id}, {"$set": update_data})
    updated = await db.products.find_one({"id": product_id}, {"_id": 0})
    serialized = await serialize_product(updated)
    return Product(**serialized)


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin: dict = Depends(require_admin_auth)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Produto nao encontrado")
    return {"message": "Produto removido"}


@api_router.get("/settings")
async def site_settings():
    return await get_settings()


@api_router.put("/settings")
async def update_site_settings(payload: SiteSettingsUpdate, admin: dict = Depends(require_admin_auth)):
    settings = await get_settings()
    update_data = {k: v for k, v in payload.model_dump().items() if v is not None}
    merged = {**settings, **update_data}
    await db.site_settings.update_one({"id": settings["id"]}, {"$set": merged})
    return merged


@api_router.post("/admin/login")
async def admin_login(payload: AdminLogin, request: Request):
    email = payload.email.strip().lower()
    key = f"{get_request_ip(request)}::{email}"
    assert_login_not_blocked(key)
    admin = await db.admin_users.find_one({"email": email}, {"_id": 0})
    if not admin or not verify_password(payload.password, admin["password_hash"]):
        register_login_failure(key)
        log_admin_access("login", request, "failed", email)
        raise HTTPException(status_code=401, detail="Credenciais invalidas")
    reset_login_failures(key)
    log_admin_access("login", request, "success", email)
    return {
        "token": create_admin_token(admin),
        "admin": {"id": admin["id"], "email": admin["email"], "name": admin["name"]},
    }


@api_router.get("/admin/dashboard")
async def admin_dashboard(admin: dict = Depends(require_admin_auth)):
    total_products = await db.products.count_documents({})
    active_products = await db.products.count_documents({"active": True})
    total_orders = await db.orders.count_documents({})
    paid_orders = await db.orders.count_documents({"status": {"$in": ["Pago", "Separacao", "Enviado", "Em transporte", "Entregue"]}})
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
    revenue = sum(order.get("total", 0) for order in orders if order.get("status") != "Cancelado")
    sellers = {}
    for order in orders:
        seller_name = order.get("seller_name", "Sem vendedor")
        sellers[seller_name] = sellers.get(seller_name, 0) + order.get("total", 0)
    return {
        "summary": {
            "total_products": total_products,
            "active_products": active_products,
            "total_orders": total_orders,
            "paid_orders": paid_orders,
            "revenue": brl(revenue),
        },
        "sales_by_seller": sellers,
        "orders": orders[:20],
        "statuses": ORDER_STATUSES,
    }


@api_router.get("/orders")
async def list_orders(status: Optional[str] = None, search: Optional[str] = None, admin: dict = Depends(require_admin_auth)):
    query = {}
    if status:
        query["status"] = status
    orders = await db.orders.find(query, {"_id": 0}).sort("created_at", -1).to_list(200)
    if search:
        text = search.lower()
        orders = [
            order
            for order in orders
            if text in order["order_number"].lower()
            or text in order["customer"]["full_name"].lower()
            or text in order["seller_name"].lower()
        ]
    return {"orders": orders, "statuses": ORDER_STATUSES}


@api_router.get("/orders/{order_id}")
async def order_detail(order_id: str):
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido nao encontrado")
    return order


@api_router.post("/orders", status_code=201)
async def create_order(payload: OrderCreate):
    settings = await get_settings()
    seller = await get_seller(payload.seller_id)
    configured_shipping = settings.get("shipping_by_state", {})
    state_shipping = brl(configured_shipping.get(payload.shipping_state, 39.9))

    order_items = []
    subtotal = 0.0
    shipping_cost = 0.0
    insurance_cost = 0.0
    for item in payload.items:
        product = await get_product_or_404(item.product_id)
        if not product["active"]:
            raise HTTPException(status_code=400, detail=f"Produto inativo: {product['name']}")
        if product["stock"] < item.quantity:
            raise HTTPException(status_code=400, detail=f"Estoque insuficiente para {product['name']}")
        unit_price = brl(product["sale_price"])
        total_price = brl(unit_price * item.quantity)
        subtotal += total_price
        shipping_cost = state_shipping
        if payload.include_insurance and settings.get("insurance_enabled", True):
            insurance_cost = brl(settings.get("insurance_fee", 0))
        order_items.append(
            {
                "product_id": product["id"],
                "name": product["name"],
                "quantity": item.quantity,
                "unit_price": unit_price,
                "total_price": total_price,
                "image": product["image"],
            }
        )

    discount = 0.0
    coupon = (payload.coupon_code or "").strip().upper()
    if coupon == "DNA10":
        discount = brl(subtotal * 0.10)

    total = brl(subtotal + shipping_cost + insurance_cost - discount)
    order_id = str(uuid.uuid4())
    order = {
        "id": order_id,
        "order_number": order_number(),
        "status": "Aguardando pagamento",
        "payment_status": "PIX gerado",
        "payment_method": payload.payment_method,
        "payment_provider": "demo",
        "payment_provider_id": "",
        "pix_code": build_pix_code(order_id, total),
        "pix_qr_value": f"DNA-PIX::{order_id}::{total}",
        "pix_qr_base64": "",
        "ticket_url": "",
        "coupon_code": coupon,
        "discount": discount,
        "include_insurance": payload.include_insurance,
        "insurance_cost": brl(insurance_cost),
        "shipping_cost": brl(shipping_cost),
        "subtotal": brl(subtotal),
        "total": total,
        "customer": payload.customer.model_dump(),
        "seller_id": seller["id"],
        "seller_name": seller["name"],
        "seller_whatsapp": seller["whatsapp"],
        "items": order_items,
        "mandatory_notice": settings["mandatory_notice"],
        "exchange_policy": settings["exchange_policy"],
        "whatsapp_message": "",
        "whatsapp_url": "",
        "created_at": now_utc().isoformat(),
        "updated_at": now_utc().isoformat(),
    }
    order["whatsapp_message"] = build_whatsapp_message(order)
    order["whatsapp_url"] = f"https://wa.me/{seller['whatsapp']}?text={order['whatsapp_message'].replace(' ', '%20').replace(chr(10), '%0A')}"

    if mercado_pago_enabled():
        mp_payment = create_mercado_pago_pix_payment(order)
        order["payment_provider"] = mp_payment["provider"]
        order["payment_provider_id"] = str(mp_payment.get("payment_id", "") or "")
        order["payment_status"] = mp_payment.get("status", order["payment_status"]) or order["payment_status"]
        order["pix_code"] = mp_payment.get("qr_code") or order["pix_code"]
        order["pix_qr_value"] = mp_payment.get("qr_code") or order["pix_qr_value"]
        order["pix_qr_base64"] = mp_payment.get("qr_code_base64", "")
        order["ticket_url"] = mp_payment.get("ticket_url", "")

    await db.orders.insert_one(order)
    order.pop("_id", None)

    for item in order_items:
        await db.products.update_one(
            {"id": item["product_id"]},
            {"$inc": {"stock": -item["quantity"]}, "$set": {"updated_at": now_utc().isoformat()}},
        )

    return order


@api_router.patch("/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: OrderStatusUpdate, admin: dict = Depends(require_admin_auth)):
    if payload.status not in ORDER_STATUSES:
        raise HTTPException(status_code=400, detail="Status invalido")
    order = await db.orders.find_one({"id": order_id}, {"_id": 0})
    if not order:
        raise HTTPException(status_code=404, detail="Pedido nao encontrado")
    payment_status = order["payment_status"]
    if payload.status in {"Pago", "Separacao", "Enviado", "Em transporte", "Entregue"}:
        payment_status = "Pago"
    if payload.status == "Cancelado":
        payment_status = "Cancelado"
    await db.orders.update_one(
        {"id": order_id},
        {"$set": {"status": payload.status, "payment_status": payment_status, "updated_at": now_utc().isoformat()}},
    )
    updated = await db.orders.find_one({"id": order_id}, {"_id": 0})
    return updated


async def sync_order_with_mercado_pago_payment(payment_id: str):
    payment = fetch_mercado_pago_payment(payment_id)
    external_reference = payment.get("external_reference")
    if not external_reference:
        return {"message": "Pagamento sem external_reference", "payment_id": payment_id}

    order = await db.orders.find_one(
        {
            "$or": [
                {"order_number": external_reference},
                {"payment_provider_id": str(payment.get("id", ""))},
            ]
        },
        {"_id": 0},
    )
    if not order:
        return {"message": "Pedido nao encontrado para pagamento", "payment_id": payment_id}

    mp_status = payment.get("status", "")
    status_map = {
        "approved": "Pago",
        "pending": "Aguardando pagamento",
        "in_process": "Aguardando pagamento",
        "in_mediation": "Aguardando pagamento",
        "rejected": "Cancelado",
        "cancelled": "Cancelado",
        "refunded": "Cancelado",
        "charged_back": "Cancelado",
    }
    next_status = status_map.get(mp_status, order.get("status", "Aguardando pagamento"))
    update_data = {
        "status": next_status,
        "payment_status": mp_status or order.get("payment_status", ""),
        "payment_provider": "mercado_pago",
        "payment_provider_id": str(payment.get("id", "")),
        "updated_at": now_utc().isoformat(),
    }
    await db.orders.update_one({"id": order["id"]}, {"$set": update_data})
    updated = await db.orders.find_one({"id": order["id"]}, {"_id": 0})
    return {
        "message": "Pedido sincronizado",
        "order_id": order["id"],
        "order_number": order["order_number"],
        "payment_id": str(payment.get("id", "")),
        "payment_status": mp_status,
        "order_status": updated["status"],
    }


@api_router.post("/mercadopago/webhook")
async def mercado_pago_webhook(payload: Optional[MercadoPagoWebhookPayload] = None):
    event_type = (payload.type if payload else "") or ""
    payment_id = ""
    if payload and payload.data:
        payment_id = str(payload.data.get("id", "") or "")
    if event_type == "payment" and payment_id:
        return await sync_order_with_mercado_pago_payment(payment_id)
    return {"message": "Webhook recebido", "type": event_type, "payment_id": payment_id}


@api_router.get("/mercadopago/webhook")
async def mercado_pago_webhook_get(type: Optional[str] = None, topic: Optional[str] = None, data_id: Optional[str] = None, id: Optional[str] = None):
    event_type = type or topic or ""
    payment_id = data_id or id or ""
    if event_type == "payment" and payment_id:
        return await sync_order_with_mercado_pago_payment(payment_id)
    return {"message": "Webhook recebido", "type": event_type, "payment_id": payment_id}


@api_router.get("/cep/{zip_code}")
async def lookup_zip_code(zip_code: str):
    clean = "".join(char for char in zip_code if char.isdigit())
    if len(clean) != 8:
        raise HTTPException(status_code=400, detail="CEP invalido")

    samples = {
        "01310930": {"street": "Avenida Paulista", "district": "Bela Vista", "city": "Sao Paulo", "state": "SP"},
        "20040020": {"street": "Rua da Quitanda", "district": "Centro", "city": "Rio de Janeiro", "state": "RJ"},
        "30140071": {"street": "Avenida Afonso Pena", "district": "Centro", "city": "Belo Horizonte", "state": "MG"},
        "70040910": {"street": "SCS Quadra 1", "district": "Asa Sul", "city": "Brasilia", "state": "DF"},
    }

    try:
        response = requests.get(f"https://viacep.com.br/ws/{clean}/json/", timeout=8)
        response.raise_for_status()
        payload = response.json()
        if payload.get("erro"):
            raise HTTPException(status_code=404, detail="CEP nao encontrado")
        return {
            "zip_code": clean,
            "street": payload.get("logradouro", ""),
            "district": payload.get("bairro", ""),
            "city": payload.get("localidade", ""),
            "state": payload.get("uf", ""),
        }
    except HTTPException:
        raise
    except Exception as exc:
        logger.warning("Falha ao consultar ViaCEP para %s: %s", clean, exc)

    sample = samples.get(clean)
    if sample:
        return {"zip_code": clean, **sample}
    raise HTTPException(status_code=404, detail="CEP nao encontrado")


@api_router.post("/upload-image")
async def upload_image(file: UploadFile = File(...), admin: dict = Depends(require_admin_auth)):
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Tipo de arquivo nao suportado.")

    file_ext = file.filename.split(".")[-1] if "." in file.filename else "png"
    filename = f"{uuid.uuid4()}.{file_ext}"
    filepath = UPLOADS_DIR / filename

    async with aiofiles.open(filepath, "wb") as f:
        content = await file.read()
        if len(content) > 5 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="Arquivo muito grande. Maximo 5MB.")
        await f.write(content)

    return {"url": f"/api/images/{filename}", "filename": filename}


@api_router.post("/content/upload")
async def content_upload(
    file: UploadFile = File(...),
    kind: str = Form("banner"),
    admin: dict = Depends(require_admin_auth),
):
    result = await upload_image(file)
    settings = await get_settings()
    field = {
        "banner": "banner_image",
        "mascot": "mascot_image",
        "logo": "logo",
    }.get(kind, "banner_image")
    await db.site_settings.update_one({"id": settings["id"]}, {"$set": {field: result["url"]}})
    return {"kind": kind, **result}


@api_router.get("/images/{filename}")
async def get_image(filename: str):
    from starlette.responses import FileResponse

    filepath = UPLOADS_DIR / filename
    if not filepath.exists():
        raise HTTPException(status_code=404, detail="Imagem nao encontrada")
    return FileResponse(filepath)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=CORS_ORIGINS,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.on_event("startup")
async def startup_db_client():
    global client, db, USE_MOCK_DB
    if not USE_MOCK_DB:
        try:
            await client.admin.command("ping")
            logger.info("Conectado ao MongoDB %s", DB_NAME)
        except Exception as exc:
            logger.warning("Falha ao conectar ao MongoDB. Fallback para mock: %s", exc)
            client.close()
            USE_MOCK_DB = True
            client, db = create_database_client(True)
    await ensure_seed_data()
    await ensure_catalog_products()
    logger.info("DNA Cliptor API pronta.")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
