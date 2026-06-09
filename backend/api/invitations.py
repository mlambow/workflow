from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc
from datetime import datetime, timedelta, timezone
import secrets

from db.deps import get_db
from core.deps import get_current_user
from models.project import Project
from models.user import User
from models.project_membership import ProjectMembership, ProjectRole
from models.project_invitation import ProjectInvitation
from dependencies.project_permissions import require_project_admin
from schemas.invitation import InviteRequest, InvitationResponse
from models.enum import InvitationStatus

router = APIRouter(prefix='/invitations', tags=['invitations'])

@router.get('/', response_model=list[InvitationResponse], status_code=status.HTTP_200_OK)
def get_invitations(
    status_filter: InvitationStatus | None = None,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # ensure the user is a project admin
    admin = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id,
    ).first()

    if not admin or admin.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a project admin of this project"
        )

    query = db.query(ProjectInvitation).options(
        joinedload(ProjectInvitation.project)
    ).filter(
        ProjectInvitation.invited_by == current_user.id
    ).order_by(desc(ProjectInvitation.created_at))

    if status_filter:
        query = query.filter(ProjectInvitation.status == status_filter)

    invitations = query.all()

    if not invitations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='You currently do not have any invitations sent out'
        )

    response = []

    for invitation in invitations:
        response.append({
            "id": invitation.id,
            "project_id": invitation.project.id,
            "project_name": invitation.project.name,
            "token": invitation.token,
            "email": invitation.email,
            "role": invitation.role.value,
            "status": invitation.status.value,
            "invited_by_name": invitation.sender.email,
            "resent_at": invitation.resent_at,
            "created_at": invitation.created_at,
            "updated_at": invitation.updated_at,
            "expires_at": invitation.expires_at
        })

    return response

@router.get('/received', response_model=list[InvitationResponse], status_code=status.HTTP_200_OK)
def get_member_invitations(
    status_filter: InvitationStatus | None = None,
    db: Session = Depends(get_db),
    user = Depends(get_current_user)
):
    query = db.query(ProjectInvitation).options(
        joinedload(ProjectInvitation.project),
        joinedload(ProjectInvitation.sender)
    ).filter(
        ProjectInvitation.email == user.email
    )

    if status_filter:
        query = query.filter(ProjectInvitation.status == status_filter)

    invitations = query.order_by(
        desc(ProjectInvitation.created_at)
    ).all()

    if not invitations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='You currently do not have invitations'
        )

    response = []

    for invitation in invitations:
        response.append({
            "id": invitation.id,
            "project_id": invitation.project.id,
            "project_name": invitation.project.name,

            "token": invitation.token,
            "email": invitation.email,

            "role": invitation.role.value,
            "status": invitation.status.value,

            "invited_by": invitation.invited_by,
            "invited_by_name": invitation.sender.email,

            "resent_at": invitation.resent_at,
            "created_at": invitation.created_at,
            "updated_at": invitation.updated_at,
            "expires_at": invitation.expires_at
        })

    return response

@router.post('/invite', response_model=InvitationResponse, status_code=status.HTTP_201_CREATED)
def create_invitation(
    payload: InviteRequest,
    project = Depends(require_project_admin),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    #Ensure project exists
    project = db.query(Project).filter(Project.id == project.id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Project not found."
        )

    #check if the current user is a project admin
    membership = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id,
    ).first()

    if not membership or membership.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User forbidden to invite members'
        )

    #check if the email already has membership
    existing_email = (
        db.query(ProjectMembership).join(
        User, User.id == ProjectMembership.user_id).filter(
            ProjectMembership.project_id == project.id, 
            User.email == payload.email).first()
    )

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='User already a member'                
        )
    
    #Check if invitation already exists
    existing_invite = (
        db.query(ProjectInvitation)
        .filter(
            ProjectInvitation.project_id == project.id,
            ProjectInvitation.email == payload.email,
            ProjectInvitation.status == InvitationStatus.PENDING
        )
        .first()
    )

    if existing_invite:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An invitation has already been sent to this email."
        )
    
    invitation = ProjectInvitation(
        project_id=project.id,
        email=payload.email,
        role=ProjectRole.MEMBER,
        invited_by=current_user.id,
        token=secrets.token_urlsafe(32),
        expires_at=datetime.utcnow() + timedelta(days=7)
    )

    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    return f"invitation sent successfully to {payload.email}"

@router.post('/accept/{token}', status_code=status.HTTP_200_OK)
def accept_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    # 1. Query returns a tuple (ProjectInvitation, Project)
    result = db.query(ProjectInvitation, Project).join(
        Project, Project.id == ProjectInvitation.project_id
    ).filter(
        ProjectInvitation.token == token
    ).first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invalid invitation token'
        )
    
    # 2. Unpack the tuple properly
    invitation, project = result
    
    if invitation.status == InvitationStatus.REVOKED:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invitation has been revoked'
        )
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invitation already processed'
        )
    
    # Using timezone-aware comparison if applicable, or keep utcnow() if database is naive
    if invitation.expires_at < datetime.utcnow():
        invitation.status = InvitationStatus.EXPIRED
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invitation has expired'
        )
    
    if invitation.email.lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invitation does not belong to you'
        )
    
    existing_member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == invitation.project_id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='User already a member'
        )
    
    membership = ProjectMembership(
        project_id = invitation.project_id,
        user_id = current_user.id,
        role = invitation.role
    )

    db.add(membership)
    invitation.status = InvitationStatus.ACCEPTED

    db.commit()
    db.refresh(membership)

    # 3. Construct the response directly without the broken loop
    return {
        "message": "You have successfully accepted an invitation",
        "id": membership.id,
        "project_id": project.id,
        "project_name": project.name,
        "token": invitation.token,
        "email": invitation.email,
        "role": membership.role,
        "status": invitation.status,
        "invited_by": invitation.invited_by,
        "created_at": membership.joined_at,
        "updated_at": invitation.updated_at
    }

@router.post('/revoke/{token}', status_code=status.HTTP_200_OK)
def revoke_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    #ensure the user revoking is the sender
    invitation = db.query(ProjectInvitation).filter(
        ProjectInvitation.token == token,
        ProjectInvitation.invited_by == current_user.id
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invitation not found'
        )
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invitation is not pending'
        )
    
    invitation.status = InvitationStatus.REVOKED
    invitation.updated_at = datetime.now(timezone.utc)

    db.add(invitation)
    db.commit()
    db.refresh(invitation)
    
    return f'You have successfully revoked an invitation for {invitation.email}'

@router.post('/resend/{token}', status_code=status.HTTP_200_OK)
def resend_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    invitation = db.query(ProjectInvitation).filter(
        ProjectInvitation.token == token,
        ProjectInvitation.invited_by == current_user.id
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invitation not found'
        )

    if invitation.status not in (
        InvitationStatus.REVOKED,
        InvitationStatus.REJECTED
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Only revoked or rejected invitations can be resent'
        )

    invitation.status = InvitationStatus.PENDING
    invitation.resent_at = datetime.utcnow()

    db.commit()
    db.refresh(invitation)

    return {
        "message": f"Invitation resent to {invitation.email}"
    }

@router.post('/reject/{token}', response_model=InvitationResponse, status_code=status.HTTP_200_OK)
def reject_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    invitation = db.query(ProjectInvitation).filter(
        ProjectInvitation.token == token
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invalid token'
        )
    
    if invitation.email.lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Unauthorised user'
        )
    
    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Invitation is not pending'
        )

    invitation.status = InvitationStatus.REJECTED

    db.commit()

    return f'Invitation for {invitation.project_id} has been successfully rejected'

@router.delete('/delete/{token}', status_code=status.HTTP_200_OK)
def delete_invitation(
    token: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    invitation = db.query(ProjectInvitation).filter(
        ProjectInvitation.token == token,
        ProjectInvitation.invited_by == current_user.id
    ).first()

    if not invitation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Invitation not found'
        )
    
    if invitation.invited_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User forbidden'
        )

    db.delete(invitation)
    db.commit()

    return f"You have successfully deleted an invitation that belongs to {invitation.email}"
    