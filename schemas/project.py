from pydantic import BaseModel, ConfigDict
from datetime import datetime
from uuid import UUID

class ProjectCreate(BaseModel):
    name: str
    description: str

class ProjectRead(BaseModel):
    id: UUID
    name: str
    description: str
    owner_id: UUID
    created_at: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)
