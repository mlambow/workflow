from dotenv import load_dotenv
from datetime import timedelta
import os

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres5432@localhost:5432/workflow_app"
)

SECRET_KEY = "CHANGE_ME_IN_PROD"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30