from pydantic import BaseModel, ConfigDict
from uuid import UUID

class WorkflowStageCreate(BaseModel):
    name: str

class WorkflowStageRead(BaseModel):
    id: UUID
    name: str
    position: int
    workflow_id: UUID
    created_by: UUID

    model_config = ConfigDict(from_attributes=True)