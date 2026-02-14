from pydantic import BaseModel, EmailStr, ConfigDict
from uuid import UUID
from datetime import datetime
from models.enum import UserRole

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    role: str

class UserRead(BaseModel):
    id: UUID
    email: EmailStr
    role: UserRole
    created_at: datetime

    class Config:
        model_config = ConfigDict(from_attributes=True)