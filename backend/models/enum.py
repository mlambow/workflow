from enum import Enum

class UserRole(str, Enum):
    USER = "User"
    ADMIN = "Admin"
    SUPER_ADMIN = "Super Admin"

class ProjectRole(str, Enum):
    OWNER = 'Owner'
    PROJECT_ADMIN = 'Project Admin'
    MEMBER = 'Member'

class InvitationStatus(str, Enum):
    ACCEPTED = "Accepted"
    PENDING = "Pending"
    REJECTED = "Rejected"
    EXPIRED = "Expired"
    REVOKED = "Revoked"

class TaskPriority(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    URGENT = "Urgent"

class NotificationType(str, Enum):
    TASK_ASSIGNED = "Task Assigned"
    COMMENT_ADDED = "Comment Added"
    INVITATION_RECEIVED = "Invitation Received"

class TaskStatus(str, Enum):
    TODO = "To Do"
    IN_PROGRESS = "In Progress"
    AWAITING_REVIEW = "Awaiting Review"
    DONE = "Done"