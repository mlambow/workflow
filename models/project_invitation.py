import uuid
from sqlalchemy import String, DateTime, ForeignKey, UniqueConstraint, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from db.base import Base
from models.enum import InvitationStatus, ProjectRole

class ProjectInvitation(Base):
    __tablename__= 'project_invitations'
    __table_args__ = (
    UniqueConstraint(
        "project_id",
        "email",
        "status",
        name="unique_pending_invite"
    ),
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
    email: Mapped[str] = mapped_column(
        String, 
        unique=True, 
        nullable=False
    )
    role: Mapped[ProjectRole] = mapped_column(
        SQLEnum(ProjectRole, name="project_role"),
        nullable=False
    )
    status: Mapped[InvitationStatus] = mapped_column(
        SQLEnum(InvitationStatus, name="invitation_status"),
        nullable=False,
        default=InvitationStatus.PENDING
    )
    invited_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey('users.id'),
        nullable=False
    )
    token: Mapped[str] = mapped_column(
        String,
        unique=True,
        nullable=True
    )
    expires_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    # Relationships
    project = relationship("Project", back_populates="invitations")
    sender = relationship("User", back_populates="invitations_sent")