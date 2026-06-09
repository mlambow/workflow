from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from db.base import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id")
    )
    type: Mapped[str] = mapped_column(String)
    entity_id: Mapped[str] = mapped_column(String)
    is_read: Mapped[bool] = mapped_column(default=False)