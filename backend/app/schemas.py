from typing import Optional, Dict, Any, List, Union
from pydantic import BaseModel, Field, EmailStr

class NotificationTypeBase(BaseModel):
    key: str = Field(..., description="Unique identifier for the notification type")
    descriptions: Dict[str, str] = Field(
        ..., description="Internationalized descriptions (language code -> description)"
    )
    is_active: bool = Field(..., description="Whether this notification type is available")
    is_deprecated: bool = Field(..., description="Whether this notification type is deprecated")
    deprecated_reason: Optional[Dict[str, str]] = Field(
        None, description="Reason for deprecation (i18n: lang->reason)"
    )

class NotificationTypeOut(BaseModel):
    key: str = Field(..., description="Unique identifier for the notification type")
    description: str = Field(..., description="Description in the user's selected language")
    is_active: bool = Field(..., description="Whether this notification type is available")
    is_deprecated: bool = Field(..., description="Whether this notification type is deprecated")
    deprecated_reason: Optional[str] = Field(
        None, description="Reason for deprecation in the user's selected language"
    )

class NotificationTypeListResponse(BaseModel):
    notification_types: List[NotificationTypeOut] = Field(
        ..., description="List of notification types and their descriptions"
    )

class UserBase(BaseModel):
    email: EmailStr = Field(..., description="User's email address")
    locale: str = Field(..., description="Preferred language code")

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User's password")

class UserOut(UserBase):
    id: int = Field(..., description="User ID")
    is_active: bool = Field(..., description="Is the user active")

class UserNotificationPreferenceBase(BaseModel):
    notification_type_key: str = Field(..., description="Notification type key")
    enabled: bool = Field(..., description="Is this notification enabled for the user")

class UserNotificationPreferenceOut(UserNotificationPreferenceBase):
    id: int = Field(..., description="Preference ID")

class ErrorResponse(BaseModel):
    error: str = Field(..., description="Error code")
    message: str = Field(..., description="User-friendly error message")
    details: Optional[Any] = Field(None, description="Additional error details")

# Exported symbols
__all__ = [
    "NotificationTypeBase",
    "NotificationTypeOut",
    "NotificationTypeListResponse",
    "UserBase",
    "UserCreate",
    "UserOut",
    "UserNotificationPreferenceBase",
    "UserNotificationPreferenceOut",
    "ErrorResponse",
]