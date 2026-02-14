from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from db.deps import get_db
from core.deps import get_current_user
from models.project import Project
from models.user import User
from schemas.project import ProjectCreate, ProjectRead

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

    return project

@router.get('/', response_model=ProjectRead)
def get_project(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Project)
        .filter(Project.owner_id == current_user.id)
        .all()
    )

def get_my_project(
    project_id: UUID,
    db: Session,
    current_user: User
) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()

    if not project:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
    
    if project.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED)
    
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

@router.delete('/{project_id}', response_model=ProjectRead)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = get_my_project(project_id, db, current_user)

    db.delete()
    db.commit()
    db.refresh(project)

    return

