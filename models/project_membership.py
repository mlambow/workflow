import uuid
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from db.base import Base
from models.enum import ProjectRole

class ProjectMembership(Base):
    __tablename__ = 'project_members'
    __table_args__ = (
        UniqueConstraint('project_id', 'user_id', name='uq_project_user'),
    )


    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('projects.id'),
        nullable=False
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id'),
        nullable=False
    )
    role: Mapped[ProjectRole] = mapped_column(
        SQLEnum(ProjectRole, name="project_role"),
        nullable=False,
    )
    joined_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )

    project = relationship("Project", back_populates='memberships')
    user = relationship('User')