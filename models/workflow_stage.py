import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from db.base import Base

class WorkflowStage(Base):
    __tablename__ = "workflow_stages"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    order: Mapped[str] = mapped_column(String, nullable=False)
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('workflows.id'),
        nullable=False
    )

    workflow = relationship('Workflow', back_populates='stages')
    tasks = relationship('Task', back_populates='stage')