from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from db.deps import get_db
from core.deps import get_current_user
from dependencies.project_permissions import require_project_member
from models.user import User
from models.workflow import Workflow
from models.task import Task 
from models.workflow_stage import WorkflowStage
from models.project_membership import ProjectMembership, ProjectRole
from schemas.workflow import WorkflowCreate, WorkflowRead
from schemas.workflow_stage import WorkflowStageCreate, WorkflowStageRead
from schemas.task import TaskCreate, TaskRead
from models.enum import TaskPriority, TaskStatus

router = APIRouter(prefix='/stages', tags=['stages'])

@router.put('/{workflowstage_id}', status_code=status.HTTP_200_OK)
def update_stage(
    workflowstage_id: UUID,
    payload: WorkflowCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    workflow_stage = db.query(WorkflowStage).filter(
        WorkflowStage.id == workflowstage_id
    ).first()

    if not workflow_stage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Workflow stage not found'
        )
    
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to update workflow stages'
        )
    
    workflow_stage.name = payload.name

    db.commit()
    db.refresh(workflow_stage)

    return workflow_stage

@router.delete('/{workflowstage_id}', status_code=status.HTTP_200_OK)
def delete_stage(
    workflowstage_id: UUID,
    db: Session = Depends(get_db),
    current_user: Session = Depends(get_current_user)
):
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if member.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to delete workflow stages'
        )
    
    workflow_stage = db.query(WorkflowStage).filter(
        WorkflowStage.id == workflowstage_id
    ).first()

    if not workflow_stage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Workflow stage not found'
        )
    
    db.delete(workflow_stage)
    db.commit()

    return {"Workflow Stage deleted successfully"}

@router.post('/{workflowstage_id}/task', response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    workflowstage_id: UUID,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    member = db.query(ProjectMembership).filter(
        ProjectMembership.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You are forbidden to update workflow stages'
        )
    
    workflow_stage = db.query(WorkflowStage).filter(
        WorkflowStage.id == workflowstage_id
    ).first()

    if not workflow_stage:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='Workflow stage not found'
        )
    
    task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        status=TaskStatus.TODO,
        stage_id=workflowstage_id,
        assignee_id=current_user.id
    )

    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get('/{workflowstage_id}/tasks', response_model=list[TaskRead], status_code=status.HTTP_200_OK)
def get_tasks(
    workflowstage_id: UUID,
    db: Session = Depends(get_db),
    project = Depends(require_project_member),
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
    
    tasks = db.query(Task).filter(
        Task.stage_id == workflowstage_id
    ).all()

    if not tasks:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='No tasks found'
        )

    return tasks