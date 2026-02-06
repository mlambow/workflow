from fastapi import FastAPI
from api.health import router as health_router
from api.users import router as users_router
from db.session import engine

# Import models so SQLAlchemy sees them
from models import user, project, workflow, workflow_stage, task

app = FastAPI(title="Task Workflow API")

app.include_router(health_router)
app.include_router(users_router)
