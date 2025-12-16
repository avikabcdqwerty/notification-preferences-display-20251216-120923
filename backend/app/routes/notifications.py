from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from ..models import NotificationType, User
from ..schemas import NotificationTypeListResponse, NotificationTypeOut, ErrorResponse
from ..i18n import get_locale_from_request
from ..routes.auth import get_current_user
from ..database import get_db

import logging

router = APIRouter()
logger = logging.getLogger("notification_preferences_app.notifications")

@router.get(
    "/",
    response_model=NotificationTypeListResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Unauthorized"},
        500: {"model": ErrorResponse, "description": "Internal Server Error"},
    },
    summary="Get all available notification types and their descriptions",
    tags=["Notifications"],
)
async def list_notification_types(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> NotificationTypeListResponse:
    """
    Returns all available notification types and their descriptions in the user's selected language.
    Unavailable or deprecated types are either hidden or clearly marked with explanations.
    Only accessible to authenticated users.
    """
    try:
        locale = get_locale_from_request(request)
        # Fetch all notification types (active and deprecated, but not unavailable)
        notification_types: List[NotificationType] = (
            db.query(NotificationType)
            .filter(NotificationType.is_active == True)
            .order_by(NotificationType.key.asc())
            .all()
        )

        result: List[NotificationTypeOut] = []
        for nt in notification_types:
            # Hide deprecated types if not meant to be shown, or mark them
            description = nt.get_description(locale)
            deprecated_reason = nt.get_deprecated_reason(locale) if nt.is_deprecated else None
            result.append(
                NotificationTypeOut(
                    key=nt.key,
                    description=description,
                    is_active=nt.is_active,
                    is_deprecated=nt.is_deprecated,
                    deprecated_reason=deprecated_reason,
                )
            )

        return NotificationTypeListResponse(notification_types=result)
    except Exception as exc:
        logger.error(f"Failed to fetch notification types: {exc}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not fetch notification types at this time."
        )

# Exported router
__all__ = ["router"]