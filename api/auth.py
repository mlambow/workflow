from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from fastapi.security import OAuth2PasswordRequestForm

from schemas.auth import LoginRequest, Token
from db.deps import get_db
from models.user import User
from core.security import verify_password
from core.jwt import create_access_token
from core.config import ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/login', response_model=Token)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail='Invalid credentials'
        )

    access_token = create_access_token(
        data={'sub': str(user.id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    return {
        'access_token': access_token,
        'token_type': 'bearer'
    }