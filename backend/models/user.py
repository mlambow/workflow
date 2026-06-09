import uuid
from sqlalchemy import String, DateTime, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from db.base import Base
from models.enum import UserRole

class User(Base):
    __tablename__ = 'users'

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    first_name: Mapped[str] = mapped_column(String, nullable=False)
    last_name: Mapped[str] = mapped_column(String, nullable=False)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role"),
        nullable=False,
        default=UserRole.USER,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    projects = relationship('Project', back_populates='owner', cascade='all, delete-orphan')
    tasks = relationship("Task", back_populates="assignee", cascade='all, delete-orphan')
    invitations_sent = relationship(
        "ProjectInvitation",
        back_populates="sender", cascade='all, delete-orphan'
    )
    workflows = relationship(
        "Workflow",
        back_populates="creator",
        cascade="all, delete-orphan"
    )
    stage = relationship('WorkflowStage', back_populates='creator', cascade='all, delete-orphan')