from pydantic import BaseModel
from uuid import UUID

class ProjectCreate(BaseModel):
    name: str

class ProjectRead(BaseModel):
    id: UUID
    name: str
    owner_id: UUID

    class Config:
        orm_mode = True
