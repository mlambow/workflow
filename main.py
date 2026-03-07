from fastapi import FastAPI
from api.health import router as health_router
from api.users import router as users_router
from api.auth import router as auth_router
from api.projects import router as project_router
from api.invitations import router as invitation_router
from db.session import engine
from db.base import Base

# Import models so SQLAlchemy sees them
import models

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Task Workflow API")

app.include_router(health_router)
app.include_router(users_router)
app.include_router(auth_router)
app.include_router(project_router)
app.include_router(invitation_router)
