from fastapi import APIRouter, Depends, UploadFile
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_tenant_id
from app.models.knowledge_document import KnowledgeDocument

router = APIRouter(prefix="/api/v1/knowledge", tags=["knowledge"])


class DocOut(BaseModel):
    id: str
    filename: str
    file_type: str
    size_bytes: int
    status: str
    chunk_count: int

    class Config:
        from_attributes = True


@router.get("", response_model=list[DocOut])
async def list_docs(tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(KnowledgeDocument).where(KnowledgeDocument.tenant_id == tenant_id))
    return result.scalars().all()


@router.post("", response_model=DocOut)
async def upload_doc(
    file: UploadFile, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)
):
    contents = await file.read()
    doc = KnowledgeDocument(
        tenant_id=tenant_id, filename=file.filename or "untitled",
        file_type=(file.filename or "").split(".")[-1] or "txt",
        size_bytes=len(contents), status="processing",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    # TODO: kick off async chunk + embed job (see app/services/embeddings.py) then flip status to "indexed".
    return doc


@router.delete("/{doc_id}")
async def delete_doc(doc_id: str, tenant_id: str = Depends(get_current_tenant_id), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(KnowledgeDocument).where(KnowledgeDocument.id == doc_id, KnowledgeDocument.tenant_id == tenant_id))
    await db.commit()
    return {"ok": True}
