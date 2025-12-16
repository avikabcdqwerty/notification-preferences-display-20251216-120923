from typing import Optional, Dict, Any
from datetime import datetime

from sqlalchemy import (
    Column,
    String,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    UniqueConstraint,
    JSON,
    Index,
    Text,
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import JSONB

Base = declarative_base()

class NotificationType(Base):
    """
    Represents a type of notification that can be sent to users.
    Supports internationalized descriptions.
    """
    __tablename__ = "notification_types"
    __table_args__ = (
        UniqueConstraint("key", name="uq_notification_type_key"),
        Index("ix_notification_types_is_active", "is_active"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    key = Column(String(64), nullable=False, unique=True, index=True, doc="Unique identifier for the notification type")
    # Descriptions are stored as a JSON object: { "en": "desc", "fr": "desc", ... }
    descriptions = Column(JSONB, nullable=False, doc="Internationalized descriptions (language code -> description)")
    is_active = Column(Boolean, nullable=False, default=True, doc="Whether this notification type is available")
    is_deprecated = Column(Boolean, nullable=False, default=False, doc="Whether this notification type is deprecated")
    deprecated_reason = Column(Text, nullable=True, doc="Reason for deprecation (i18n JSON: lang->reason)")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user_preferences = relationship("UserNotificationPreference", back_populates="notification_type")

    def get_description(self, locale: str = "en") -> str:
        """
        Get the description in the requested locale, falling back to English or any available language.
        """
        if not self.descriptions:
            return ""
        if locale in self.descriptions:
            return self.descriptions[locale]
        if "en" in self.descriptions:
            return self.descriptions["en"]
        # Fallback to any available language
        return next(iter(self.descriptions.values()), "")

    def get_deprecated_reason(self, locale: str = "en") -> Optional[str]:
        """
        Get the deprecation reason in the requested locale, if any.
        """
        if not self.deprecated_reason:
            return None
        try:
            reasons = self.deprecated_reason
            if isinstance(reasons, dict):
                if locale in reasons:
                    return reasons[locale]
                if "en" in reasons:
                    return reasons["en"]
                return next(iter(reasons.values()), None)
            return str(reasons)
        except Exception:
            return None

class User(Base):
    """
    Represents an authenticated user.
    """
    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_user_email"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), nullable=False, unique=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, nullable=False, default=True)
    locale = Column(String(8), nullable=False, default="en", doc="Preferred language code")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    notification_preferences = relationship("UserNotificationPreference", back_populates="user")

class UserNotificationPreference(Base):
    """
    Stores a user's preferences for a given notification type.
    """
    __tablename__ = "user_notification_preferences"
    __table_args__ = (
        UniqueConstraint("user_id", "notification_type_id", name="uq_user_notification_type"),
        Index("ix_user_notification_preferences_user_id", "user_id"),
    )

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notification_type_id = Column(Integer, ForeignKey("notification_types.id", ondelete="CASCADE"), nullable=False)
    enabled = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="notification_preferences")
    notification_type = relationship("NotificationType", back_populates="user_preferences")

# Exported symbols
__all__ = [
    "Base",
    "NotificationType",
    "User",
    "UserNotificationPreference",
]