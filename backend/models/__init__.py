"""
Models package.

Import all SQLAlchemy models here so that:
1. They are registered with Base.metadata
2. Alembic autogenerate can detect them
3. They can be imported directly from `models`
"""

# Core models
from .user import User
from .project import Project
from .workflow import Workflow
from .workflow_stage import WorkflowStage
from .task import Task
from .workflow import Workflow

# Project access models
from .project_membership import ProjectMembership
from .project_invitation import ProjectInvitation

# Enums (optional but useful for clean imports elsewhere)
from .enum import ProjectRole, InvitationStatus

__all__ = [
    "User",
    "Project",
    "Workflow",
    "WorkflowStage",
    "Task",
    "ProjectMembership",
    "ProjectInvitation",
    "ProjectRole",
    "InvitationStatus",
]
