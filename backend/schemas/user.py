from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from models.enum import UserRole

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    password: str

class PromoteUserRequest(BaseModel):
    user_id: UUID

class UserRead(BaseModel):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    role: UserRole
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)