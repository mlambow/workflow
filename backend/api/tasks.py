from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from uuid import UUID

from db.deps import get_db
from core.deps import get_current_user
from models.user import User
from models.task import Task  # Assuming your SQLAlchemy model is named Task
from models.workflow_stage import WorkflowStage
from models.workflow import Workflow
from models.project_membership import ProjectMembership
from schemas.task import TaskCreate, TaskRead
from models.enum import TaskStatus

router = APIRouter(prefix='/tasks', tags=['tasks'])

def require_stage_membership(stage_id: UUID, user_id: UUID, db: Session):
    """Helper to verify a user has access to the project this stage belongs to"""
    stage_ctx = (
        db.query(WorkflowStage, Workflow)
        .join(Workflow, Workflow.id == WorkflowStage.workflow_id)
        .filter(WorkflowStage.id == stage_id)
        .first()
    )
    if not stage_ctx:
        raise HTTPException(status_code=404, detail="Workflow stage not found")
    
    stage, workflow = stage_ctx
    member = db.query(ProjectMembership).filter(
        ProjectMembership.project_id == workflow.project_id,
        ProjectMembership.user_id == user_id
    ).first()
    
    if not member:
        raise HTTPException(status_code=403, detail="Forbidden: You are not a member of this project")
    
    return stage

@router.post('/stage/{stage_id}', response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(
    stage_id: UUID,
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify user is allowed to add tasks here
    require_stage_membership(stage_id, current_user.id, db)

    task = Task(
        title=payload.title,
        description=payload.description,
        priority=payload.priority,
        stage_id=stage_id,
        status=TaskStatus.TODO,  # Default fallback status state enum
        created_by=current_user.id
    )

    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get('/stage/{stage_id}', response_model=list[TaskRead], status_code=status.HTTP_200_OK)
def get_stage_tasks(
    stage_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_stage_membership(stage_id, current_user.id, db)
    return db.query(Task).filter(Task.stage_id == stage_id).all()

@router.put('/{task_id}/move/{target_stage_id}', response_model=TaskRead)
def move_task_stage(
    task_id: UUID,
    target_stage_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task record not found")
        
    # Verify access to both origin and target stages
    require_stage_membership(task.stage_id, current_user.id, db)
    require_stage_membership(target_stage_id, current_user.id, db)

    task.stage_id = target_stage_id
    db.commit()
    db.refresh(task)
    return task