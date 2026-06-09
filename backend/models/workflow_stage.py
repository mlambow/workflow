import uuid
from sqlalchemy import String, ForeignKey, Integer, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base

class WorkflowStage(Base):
    __tablename__ = "workflow_stages"

    __table_args__ = (
        UniqueConstraint('workflow_id', 'position'),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    position: Mapped[int] = mapped_column(Integer, nullable=False)
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('workflows.id'),
        nullable=False
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    workflow = relationship('Workflow', back_populates='stages')
    tasks = relationship('Task', back_populates='stage', cascade="all, delete-orphan")
    creator = relationship('User', back_populates='stage')