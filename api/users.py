from fastapi import APIRouter, status, Depends
from schemas.user import UserCreate, UserRead
from db.deps import get_db
from models.user import User
from sqlalchemy.orm import Session
from datetime import datetime
from core.security import hash_password
from core.deps import get_current_user

router = APIRouter(prefix='/users', tags=['users'])

@router.post('/', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user = User(
        email = payload.email,
        hashed_password = hash_password(payload.password),
        role = payload.role,
        created_at = datetime.utcnow()
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.get('/me', response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user