import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import (
    agents, audit, auth, billing, integrations, knowledge, recurring, roi, tasks, webhooks, workflows,
)
from app.services.scheduler import start_scheduler, stop_scheduler

logger = logging.getLogger("quantum2.main")

app = FastAPI(title="Managent API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(tasks.router)
app.include_router(recurring.router)
app.include_router(workflows.router)
app.include_router(integrations.router)
app.include_router(knowledge.router)
app.include_router(audit.router)
app.include_router(roi.router)
app.include_router(webhooks.router)
app.include_router(billing.router)


@app.on_event("startup")
async def on_startup():
    try:
        start_scheduler()
    except Exception:
        logger.exception("Failed to start the recurring-task scheduler; recurring tasks will not auto-run.")


@app.on_event("shutdown")
async def on_shutdown():
    try:
        stop_scheduler()
    except Exception:
        logger.exception("Failed to shut down the recurring-task scheduler cleanly.")


@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
