import uuid
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from backend.db.base import Base

class TaskComment(Base):
    __tablename__ = "task_comments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )
    task_id: Mapped[str] = mapped_column(
        String, ForeignKey("tasks.id")
    )
    author_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id")
    )
    content: Mapped[str] = mapped_column(String)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.utcnow()
    )

    author = relationship('User', back_populates='projects')
    task = relationship('Task', back_populates='comments')