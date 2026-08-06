import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    auth, billing, cari, integrations, invoices, orders, products, reports, shipments, webhooks,
)

logger = logging.getLogger("phratic.main")

app = FastAPI(title="Phratic API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(cari.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(shipments.router)
app.include_router(invoices.router)
app.include_router(reports.router)
app.include_router(integrations.router)
app.include_router(webhooks.router)
app.include_router(billing.router)


@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
