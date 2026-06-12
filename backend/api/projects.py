from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_
from uuid import UUID

from db.deps import get_db
from core.deps import get_current_user
from models.project import Project
from models.user import User, UserRole
from models.project_membership import ProjectMembership, ProjectRole
from models.project_invitation import ProjectInvitation
from models.workflow import Workflow
from dependencies.project_permissions import require_create_members, require_project_member
from schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from schemas.workflow import WorkflowCreate, WorkflowRead

router = APIRouter(prefix='/projects', tags=['projects'])

@router.post('/', response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(
        User.id == current_user.id
    ).first()

    if user.role != UserRole.ADMIN and user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User forbidden to create a project'
        )

    project = Project(
        name=payload.name,
        description=payload.description,
        owner_id=current_user.id
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    membership = ProjectMembership(
        project_id = project.id,
        user_id = current_user.id,
        role=ProjectRole.PROJECT_ADMIN
    )

    db.add(membership)
    db.commit()

    return project

@router.get("/", response_model=list[ProjectRead], status_code=status.HTTP_200_OK)
def get_user_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    projects = (
        db.query(Project)
        .outerjoin(
            ProjectMembership,
            ProjectMembership.project_id == Project.id
        )
        .filter(
            or_(
                Project.owner_id == current_user.id,
                ProjectMembership.user_id == current_user.id
            )
        )
        .distinct()
        .order_by(desc(Project.created_at))
        .all()
    )

    if not projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You currently do not belong to any projects"
        )

    return projects

def get_my_project(
    project_id: UUID,
    db: Session,
    current_user: User
) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Project not found'
        )
    
    if project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User forbidden'
        )
    
    return project

@router.get('/{project_id}', response_model=ProjectRead, status_code=status.HTTP_200_OK)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Project:
    # 1. Verify the project actually exists first
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Project not found'
        )
    
    # 2. Check if the current user is a valid member of this project
    is_member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project_id,
        ProjectMembership.user_id == current_user.id
    ).first()

    # 3. If they are not a member (and not the explicit owner, just as a safety backup), deny access
    if not is_member and project.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You do not have access to this project'
        )
    
    return project

@router.put('/{project_id}', response_model=ProjectRead)
def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_my_project(project_id, db, current_user)

    project.name = payload.name if payload.name is not None else project.name
    project.description = (
        payload.description
        if payload.description is not None
        else project.description
    )

    db.commit()
    db.refresh(project)

    return project

@router.delete('/{project_id}', status_code=status.HTTP_200_OK)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_my_project(project_id, db, current_user)

    db.delete(project)
    db.commit()

    return {"detail": "Project deleted successfully"}

@router.get("/{project_id}/members")
def view_members(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 1. Verify the current user is actually part of this project
    existing_member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project_id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if not existing_member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this project"
        )

    # 2. Query all project members and join their user profile details
    members = db.query(ProjectMembership, User).join(
        User, User.id == ProjectMembership.user_id
    ).filter(
        ProjectMembership.project_id == project_id
    ).all()
    
    # 3. Return clean dictionaries (FastAPI converts this to JSON automatically)
    return [
        {
            "user_id": user.id,
            "email": user.email,
            "role": membership.role
        }
        for membership, user in members
    ]

@router.post('/{project_id}/member/{member_id}', status_code=status.HTTP_200_OK)
def promote_member(
    member_id: UUID,
    project = Depends(require_create_members),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if not admin or admin.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to remove a member from this project'
        )
    
    member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Member does not exist in the project'
        )
    
    if member.role == ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail='Member is already a project admin'
        )
    
    member.role = ProjectRole.PROJECT_ADMIN

    db.commit()
    db.refresh(member)

    return {
        "message": "Member promoted successfully",
        "member_id": str(member.user_id),
        "project_id": str(project.id),
        "role": member.role.value
    }

@router.delete('/{project_id}/members/{member_id}', status_code=status.HTTP_200_OK)
def remove_member(
    member_id: UUID,
    project = Depends(require_create_members),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    admin = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if not admin or admin.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to remove a member from this project'
        )
    
    member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == member_id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Member does not exist in the project'
        )
    
    user = db.query(User).filter(User.id == member_id).first()

    invitation = db.query(ProjectInvitation).filter(
        ProjectInvitation.project_id == project.id,
        ProjectInvitation.email == user.email
    ).first()

    db.delete(invitation)

    response = {
        "project": project.name,
        "member_email": user.email,
        "role": member.role
    }
    
    db.delete(member)
    db.commit()

    return {
        "message": 'You have successfully removed a member',
        "data": response
    }

@router.post('/{project_id}/workflows', response_model=WorkflowRead, status_code=status.HTTP_201_CREATED)
def create_workflow(
    project_id: UUID,
    payload: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(
        Project.id == project_id,
        Project.owner_id == current_user.id
    ).first()

    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Project not found'
        )

    membership = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id,
    ).first()

    if not membership or membership.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User forbidden. Only project admin can create a worrkflow'
        )

    workflow = Workflow(
        name=payload.name,
        project_id=project.id,
        created_by=current_user.id
    )

    db.add(workflow)
    db.commit()
    db.refresh(workflow)

    return workflow

@router.get('/{project_id}/workflows', response_model=list[WorkflowRead], status_code=status.HTTP_200_OK)
def get_workflows(
    project_id: UUID,
    project = Depends(require_project_member),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='Forbidden to get workflows'
        )
    
    workflow = db.query(Workflow).filter(
        Workflow.project_id == project_id
    ).all()

    return workflow