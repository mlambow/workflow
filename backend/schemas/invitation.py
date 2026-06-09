from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class InvitationResponse(BaseModel):
    id: UUID
    project_id: UUID
    project_name: str
    email: str
    role: str
    status: str
    token: str
    invited_by_name: Optional[str] = None
    resent_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    expires_at: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)

class InviteRequest(BaseModel):
    email: EmailStr