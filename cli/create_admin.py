import uuid
import getpass
from db.session import SessionLocal
from models.user import User
from core.security import hash_password


def create_admin():
    db = SessionLocal()

    try:
        # 🔐 Check if any admin already exists
        existing_admin = db.query(User).filter(User.role == "ADMIN").first()
        if existing_admin:
            print("An admin already exists. Bootstrap aborted.")
            return

        email = input("Admin email: ")
        password = getpass.getpass("Admin password: ")

        # Optional: prevent duplicate email
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print("User with this email already exists.")
            return

        admin = User(
            id=uuid.uuid4(),
            email=email,
            hashed_password=hash_password(password),
            role="ADMIN"
        )

        db.add(admin)
        db.commit()

        print("Admin created successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
