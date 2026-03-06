from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from uuid import UUID

class InvitationResponse(BaseModel):
    invitation_id: UUID
    project_id: UUID
    project_name: str
    email: str
    role: str
    status: str
    created_at: datetime
    expires_at: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)

class InviteRequest(BaseModel):
    email: EmailStr