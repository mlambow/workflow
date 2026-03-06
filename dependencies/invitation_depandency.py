from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
import secrets
from datetime import datetime, timedelta
from models.project_membership import ProjectMembership, ProjectRole
from models.user import User
from models.project_invitation import ProjectInvitation
from models.enum import InvitationStatus
from db.deps import get_db
from core.deps import get_current_user

class InvitationError(Exception):
    pass

INVITATION_EXPIRATION_HOURS = 48

#invitation creation
def create_invitation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    project_id = UUID,
    email = str
):
    #verify membership admin
    membership = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project_id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if not membership or membership.role != ProjectRole.PROJECT_ADMIN:
        raise InvitationError("You do not have permission to invite other users")
    
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        existing_membership = db.query(ProjectMembership).filter(
            ProjectMembership.project_id == project_id,
            ProjectMembership.user_id == current_user.id
        ).first()

        if existing_membership:
            raise InvitationError("User already a member")
        
    token = secrets.token_urlsafe(32)

    invitation = ProjectInvitation(
        project_id=project_id,
        role=ProjectRole.MEMBER,
        email=email,
        token=token,
        status=InvitationStatus.PENDING,
        invited_by=current_user.id,
        expires_at=datetime.utcnow() + timedelta(hours=INVITATION_EXPIRATION_HOURS)
    )

    db.add(invitation)
    db.commit()

    return invitation

#invitation rejection
