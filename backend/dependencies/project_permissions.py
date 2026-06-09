from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID
from models.project_membership import ProjectMembership, ProjectRole
from models.user import User
from models.project import Project
from db.deps import get_db
from core.deps import get_current_user

def get_my_project(
    project_id: UUID,
    db: Session,
    current_user: User
):
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Project not found'    
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User unauthorised'
        )
    
    return project

def get_project_membership(
    project_id: UUID,
    db: Session,
    user_id: UUID,
):
    membership = db.query(ProjectMembership).filter_by(
        project_id=project_id,
        user_id=user_id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not a project member"
        )

    return membership

def require_project_admin(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = db.query(ProjectMembership).filter_by(
        project_id=project_id,
        user_id=current_user.id
    ).first()

    if not membership or membership.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return membership.project

def require_project_member(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    membership = db.query(ProjectMembership).filter_by(
        project_id=project_id,
        user_id=current_user.id
    ).first()

    if not membership:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Project access required"
        )

    return membership.project

def require_create_members(
    project = Depends(require_project_admin)
):
    return project

def get_project_memberships(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    membership = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id
    ).first()

    return project, membership