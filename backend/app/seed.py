"""Seeds a few sample cariler/products for a newly-registered tenant so the dashboard
isn't empty on first login."""
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.cari import Cari
from app.models.product import Product

DEFAULT_CARILER = [
    {"type": "customer", "name": "Örnek Müşteri A.Ş.", "contact_name": "Ahmet Yılmaz", "phone": "+90 532 000 00 00",
     "email": "info@ornekmusteri.com", "address": "Organize Sanayi Bölgesi, İstanbul", "payment_terms": "30 gün vadeli"},
    {"type": "supplier", "name": "Örnek Tedarikçi Ltd. Şti.", "contact_name": "Mehmet Demir", "phone": "+90 533 000 00 00",
     "email": "info@ornektedarikci.com", "address": "Sanayi Mahallesi, Ankara", "payment_terms": "Peşin"},
]

DEFAULT_PRODUCTS = [
    {"sku": "URN-001", "name": "Standart Ürün Paketi", "unit": "adet", "price": 1250.00, "stock_quantity": 100},
    {"sku": "URN-002", "name": "Premium Ürün Paketi", "unit": "adet", "price": 2750.00, "stock_quantity": 40},
]


async def seed_demo_data(db: AsyncSession, tenant_id: str) -> None:
    for spec in DEFAULT_CARILER:
        db.add(Cari(tenant_id=tenant_id, **spec))
    for spec in DEFAULT_PRODUCTS:
        db.add(Product(tenant_id=tenant_id, **spec))
    await db.flush()
