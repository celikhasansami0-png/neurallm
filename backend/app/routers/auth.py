import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.deps import get_current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.models.tenant import Tenant
from app.models.user import User
from app.seed import seed_default_agents
from app.services.email_service import email_service

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

VERIFICATION_TOKEN_TTL = timedelta(hours=24)
RESET_TOKEN_TTL = timedelta(hours=1)


class RegisterRequest(BaseModel):
    company_name: str
    email: EmailStr
    password: str
    full_name: str = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/register", response_model=TokenResponse)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == payload.email))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    slug = payload.company_name.lower().replace(" ", "-")
    tenant = Tenant(name=payload.company_name, slug=slug)
    db.add(tenant)
    await db.flush()

    verification_token = secrets.token_urlsafe(32)
    user = User(
        tenant_id=tenant.id,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        full_name=payload.full_name,
        role="admin",
        verification_token=verification_token,
        verification_token_expires=datetime.now(timezone.utc) + VERIFICATION_TOKEN_TTL,
    )
    db.add(user)
    await db.flush()

    await seed_default_agents(db, tenant.id)
    await db.commit()

    email_service.send_verification_email(payload.email, verification_token)

    token = create_access_token({"sub": user.id, "tenant_id": tenant.id})
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    token = create_access_token({"sub": user.id, "tenant_id": user.tenant_id})
    return TokenResponse(access_token=token)


@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "role": user.role, "tenant_id": user.tenant_id, "email_verified": user.email_verified,
    }


@router.get("/verify-email")
async def verify_email(token: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.verification_token == token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired verification link")
    if user.verification_token_expires and user.verification_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This verification link has expired")

    user.email_verified = True
    user.verification_token = None
    user.verification_token_expires = None
    await db.commit()
    return {"ok": True, "message": "Email verified successfully."}


class PasswordResetRequestIn(BaseModel):
    email: EmailStr


@router.post("/request-password-reset")
async def request_password_reset(payload: PasswordResetRequestIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == payload.email))
    user = result.scalar_one_or_none()
    # Always return success, even if the email isn't registered, so callers can't use this
    # endpoint to enumerate which emails have an account.
    if user:
        reset_token = secrets.token_urlsafe(32)
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + RESET_TOKEN_TTL
        await db.commit()
        email_service.send_password_reset_email(payload.email, reset_token)
    return {"ok": True, "message": "If that email has an account, a reset link has been sent."}


class PasswordResetIn(BaseModel):
    token: str
    new_password: str


@router.post("/reset-password")
async def reset_password(payload: PasswordResetIn, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.reset_token == payload.token))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")
    if user.reset_token_expires and user.reset_token_expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="This reset link has expired")

    user.hashed_password = hash_password(payload.new_password)
    user.reset_token = None
    user.reset_token_expires = None
    await db.commit()
    return {"ok": True, "message": "Password updated. You can now log in."}
