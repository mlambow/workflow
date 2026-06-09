from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from models.enum import TaskPriority, TaskStatus

class TaskCreate(BaseModel):
    title: str
    description: str | None = None
    priority: TaskPriority

class TaskRead(BaseModel):
    id: UUID
    title: str
    description: str | None
    stage_id: UUID
    status: TaskStatus
    priority: TaskPriority
    assignee_id: UUID | None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)