from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.product import Product

router = APIRouter(prefix="/api/v1/products", tags=["products"])


class ProductIn(BaseModel):
    sku: str = ""
    name: str
    unit: str = "adet"
    price: float = 0
    currency: str = "TRY"
    tax_rate: float = 20
    stock_quantity: float = 0


class ProductOut(ProductIn):
    id: str
    is_active: bool

    class Config:
        from_attributes = True


@router.get("", response_model=list[ProductOut])
async def list_products(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.tenant_id == tenant_id).order_by(Product.name))
    return result.scalars().all()


@router.post("", response_model=ProductOut)
async def create_product(payload: ProductIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    product = Product(tenant_id=tenant_id, **payload.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Product).where(Product.id == product_id, Product.tenant_id == tenant_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=ProductOut)
async def update_product(
    product_id: str, payload: ProductIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Product).where(Product.id == product_id, Product.tenant_id == tenant_id))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    for field, value in payload.model_dump().items():
        setattr(product, field, value)
    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/{product_id}")
async def delete_product(product_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(Product).where(Product.id == product_id, Product.tenant_id == tenant_id))
    await db.commit()
    return {"ok": True}
