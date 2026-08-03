from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import agents, audit, auth, integrations, knowledge, recurring, roi, tasks, webhooks, workflows

app = FastAPI(title="NeuraLLM API", version="0.1.0")

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


@app.get("/")
async def root():
    return {"app": settings.APP_NAME, "status": "ok"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
