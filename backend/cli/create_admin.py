import uuid
import getpass
from fastapi import APIRouter, Depends, HTTPException, status
from db.session import SessionLocal
from models.user import User
from models.enum import UserRole
from core.security import hash_password

router = APIRouter(prefix='/admin', tags=['admin'])

@router.post('/create_admin', status_code=status.HTTP_201_CREATED)
def create_admin():
    db = SessionLocal()

    try:
        # 🔐 Check if any admin already exists
        existing_admin = db.query(User).filter(User.role == UserRole.SUPER_ADMIN).first()
        if existing_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="An admin already exists. Bootstrap aborted."
            )

        email = input("Admin email: ")
        password = getpass.getpass("Admin password: ")

        # Optional: prevent duplicate email
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="An admin with this email already exists. Try logging in"
            )

        admin = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=hash_password(password),
            role=UserRole.SUPER_ADMIN
        )

        db.add(admin)
        db.commit()

        return {
            "Super Admin created successfully": admin.email
        }

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
