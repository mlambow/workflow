from fastapi import APIRouter, status, Depends, HTTPException
from uuid import UUID
from schemas.user import UserCreate, UserRead
from db.deps import get_db
from models.user import User
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from core.security import hash_password
from core.deps import get_current_user
from models.enum import UserRole

router = APIRouter(prefix='/users', tags=['users'])

@router.post('/', response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(payload: UserCreate, db: Session = Depends(get_db)):
    user_count = db.query(User).count()
    role = UserRole.SUPER_ADMIN if user_count == 0 else UserRole.USER

    user = User(
        first_name = payload.first_name,
        last_name = payload.last_name,
        email = payload.email,
        hashed_password = hash_password(payload.password),
        role = role,
        created_at = datetime.utcnow()
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

@router.get('/me', response_model=UserRead)
def read_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get('/', status_code=status.HTTP_200_OK)
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return users

@router.post('/promote/{user_id}', response_model=UserRead, status_code=status.HTTP_200_OK)
def create_admin_users(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User forbidden to create admin"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.role == UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already admin"
        )
    
    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can not promote yourself"
        )
    
    user.role = UserRole.ADMIN

    if user.role == UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='You can not promote to Super Admin'
        )
    
    db.commit()
    db.refresh(user)

    return user

@router.delete('/{user_id}', status_code=status.HTTP_200_OK)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail='User not found'
        )

    if user.id != current_user.id and current_user.role != UserRole.SUPER_ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail='User forbidden to delete this user'
        )

    db.delete(user)
    db.commit()

    return f'You successfully deleted a user {user.email}'