from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime


class WorkflowCreate(BaseModel):
    name: str


class WorkflowUpdate(BaseModel):
    name: str


class WorkflowRead(BaseModel):
    id: UUID
    name: str
    project_id: UUID
    created_by: UUID
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)