from pydantic import BaseModel, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID
from models.project_membership import ProjectRole
from schemas.invitation import InvitationResponse

class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None

class ProjectRead(BaseModel):
    id: UUID
    name: str
    description: str
    owner_id: UUID
    created_at: datetime

    membership: InvitationResponse | None = None

    class Config:
        model_config = ConfigDict(from_attributes=True)

class AddMemberRequest(BaseModel):
    user_id: UUID
    role: ProjectRole = ProjectRole.MEMBER