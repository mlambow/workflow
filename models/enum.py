from enum import Enum

class UserRole(str, Enum):
    USER = "USER"
    ADMIN = "ADMIN"

class ProjectRole(str, Enum):
    OWNER = 'OWNER'
    PROJECT_ADMIN = 'PROJECT_ADMIN'
    MEMBER = 'MEMBER'

class InvitationStatus(str, Enum):
    ACCEPTED = "ACCEPTED"
    PENDING = "PENDING"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"
    REVOKED = "REVOKED"

class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class NotificationType(str, Enum):
    TASK_ASSIGNED = "TASK_ASSIGNED"
    COMMENT_ADDED = "COMMENT_ADDED"
    INVITATION_RECEIVED = "INVITATION_RECEIVED"

class TaskStatus(str, Enum):
    TODO = "TODO"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"