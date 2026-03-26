from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from uuid import UUID

from db.deps import get_db
from core.deps import get_current_user
from models.project import Project
from models.user import User
from models.workflow import Workflow
from models.workflow_stage import WorkflowStage
from models.project_membership import ProjectMembership, ProjectRole
from dependencies.project_permissions import require_create_members, require_project_admin, get_my_project
from schemas.workflow import WorkflowCreate, WorkflowRead
from schemas.workflow_stage import WorkflowStageCreate, WorkflowStageRead

router = APIRouter(prefix='/workflows', tags=['workflows'])

@router.put('/{workflow_id}', response_model=WorkflowRead, status_code=status.HTTP_200_OK)
def update_workflow(
    workflow_id: UUID,
    payload: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member or member.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to update this workflow'
        )
    
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id
    ).first()

    if not workflow:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail='Workflow not found'
        )

    workflow.name = payload.name

    db.commit()
    db.refresh(workflow)

    return workflow

@router.delete('/{workflow_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_workflow(
    workflow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member and member.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to delete this workflow'
        )
    
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id
    ).first()

    if not workflow:
        raise HTTPException(
            status.HTTP_404_NOT_FOUND,
            detail='Workflow not found'
        )
    
    db.delete(workflow)
    db.commit()

    return {"Workflow deleted successfully"}

@router.post('/{workflow_id}/stages', response_model=WorkflowStageRead, status_code=status.HTTP_201_CREATED)
def create_workflow_stage(
    workflow_id: UUID,
    payload: WorkflowStageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id
    ).first()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Workflow is not found'
        )
    
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member or member.role != ProjectRole.PROJECT_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to create a workflow stage'
        )
    
    last_stage = db.query(WorkflowStage).filter(
        WorkflowStage.workflow_id == workflow_id).order_by(
            WorkflowStage.position.desc()).first()

    next_position = (last_stage.position + 10) if last_stage else 10

    stage = WorkflowStage(
        name=payload.name,
        position=next_position,
        workflow_id=workflow_id,
        created_by=current_user.id
    )

    db.add(stage)
    db.commit()
    db.refresh(stage)

    return stage

@router.get('/{workflow_id}/stages', response_model=list[WorkflowStageRead], status_code=status.HTTP_200_OK)
def get_workflow_stages(
    workflow_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow = db.query(Workflow).filter(
        Workflow.id == workflow_id
    ).first()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Workflow is not found'
        )
    
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to view workflow stages'
        )
    
    stage = db.query(WorkflowStage).filter(
        WorkflowStage.workflow_id == workflow_id
    ).all()

    return stage