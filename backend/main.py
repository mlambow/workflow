from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.health import router as health_router
from api.users import router as users_router
from api.auth import router as auth_router
from api.projects import router as project_router
from api.invitations import router as invitation_router
from api.workflows import router as workflow_router
from api.stages import router as stage_router
from api.tasks import router as tasks_router
from cli.create_admin import router as admin_router
from db.session import engine
from db.base import Base

# Import models so SQLAlchemy sees them
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Workflow API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        '*' 
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(project_router)
app.include_router(invitation_router)
app.include_router(workflow_router)
app.include_router(stage_router)
app.include_router(tasks_router)