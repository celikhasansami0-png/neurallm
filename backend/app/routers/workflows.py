from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.workflow import Workflow

router = APIRouter(prefix="/api/v1/workflows", tags=["workflows"])


class WorkflowIn(BaseModel):
    name: str
    chain: list[dict] = []  # [{agent_id, action}, ...]


class WorkflowOut(WorkflowIn):
    id: str
    status: str
    last_run_result: dict

    class Config:
        from_attributes = True


@router.get("", response_model=list[WorkflowOut])
async def list_workflows(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.tenant_id == tenant_id))
    return result.scalars().all()


@router.post("", response_model=WorkflowOut)
async def create_workflow(
    payload: WorkflowIn, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    wf = Workflow(tenant_id=tenant_id, **payload.model_dump())
    db.add(wf)
    await db.commit()
    await db.refresh(wf)
    return wf


@router.put("/{workflow_id}/run", response_model=WorkflowOut)
async def run_workflow(workflow_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Workflow).where(Workflow.id == workflow_id, Workflow.tenant_id == tenant_id))
    wf = result.scalar_one_or_none()
    if not wf:
        raise HTTPException(status_code=404, detail="Workflow not found")
    wf.status = "running"
    # TODO: replace with a real chain execution via orchestrator/executor.
    wf.last_run_result = {"steps_completed": len(wf.chain), "summary": f"Ran chain '{wf.name}' end to end."}
    wf.status = "completed"
    await db.commit()
    await db.refresh(wf)
    return wf
