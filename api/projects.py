from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID

from db.deps import get_db
from core.deps import get_current_user
from models.project import Project
from models.user import User
from models.project_membership import ProjectMembership, ProjectRole
from models.project_invitation import ProjectInvitation
from models.workflow import Workflow
from dependencies.project_permissions import require_create_members, get_project_memberships, require_project_member
from schemas.project import ProjectCreate, ProjectRead
from schemas.workflow import WorkflowCreate, WorkflowRead

router = APIRouter(prefix='/projects', tags=['projects'])

@router.post('/', response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
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
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .order_by(desc(Project.created_at))
        .all()
    )

    if not projects:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="You currently do not have any projects to view"
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
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='User not authorised'
        )
    
    return project

@router.put('/{project_id}', response_model=ProjectRead)
def update_project(
    project_id: UUID,
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_my_project(project_id, db, current_user)

    project.name = payload.name
    project.description = payload.description

    db.commit()
    db.refresh(project)

    return project

@router.delete('/{project_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_my_project(project_id, db, current_user)

    db.delete(project)
    db.commit()

    return {"detail": "Project deleted successfully"}

@router.post("/{project_id}/members", status_code=status.HTTP_200_OK)
def view_members(
    project = Depends(require_create_members),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    #checking if the user exists in a project
    existing_member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == project.id,
        ProjectMembership.user_id == current_user.id
    ).first()

    if not existing_member:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You are not a member in this project"
        )

    #quering all the members of a project
    members = db.query(ProjectMembership, User).join(
        User, User.id == ProjectMembership.user_id).filter(
            ProjectMembership.project_id == project.id
        ).all()
    
    result = []

    for membership, user in members:
        result.append({
            "user_id": user.id,
            "email": user.email,
            "role": membership.role
        })

    return result

@router.delete('/{project_id}/members/{member_id}')
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
            detail='You are forbidden to remove a member in this project'
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
    
    if member.role != ProjectRole.MEMBER:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='This member can not be removed as of now'
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