import logging
import os
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from .routes.notifications import router as notifications_router
from .routes.auth import router as auth_router
from .i18n import get_locale_from_request, set_locale
from .schemas import ErrorResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s %(message)s"
)
logger = logging.getLogger("notification_preferences_app")

# Instantiate FastAPI app
app = FastAPI(
    title="Notification Preferences API",
    description="API for displaying notification types and descriptions with i18n, accessibility, and authentication.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration (adjust origins for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ALLOW_ORIGINS", "*").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Enforce HTTPS in production
if os.getenv("FORCE_HTTPS", "true").lower() == "true":
    app.add_middleware(HTTPSRedirectMiddleware)

# Enable GZip compression for performance
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Internationalization: set locale per request
@app.middleware("http")
async def i18n_middleware(request: Request, call_next):
    locale = get_locale_from_request(request)
    set_locale(locale)
    response = await call_next(request)
    response.headers["Content-Language"] = locale
    return response

# Global error handler for HTTP exceptions
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.warning(f"HTTPException: {exc.detail} (status_code={exc.status_code})")
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorResponse(
            error="http_error",
            message=str(exc.detail)
        ).dict()
    )

# Global error handler for validation errors
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"ValidationError: {exc.errors()}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=ErrorResponse(
            error="validation_error",
            message="Invalid request data.",
            details=exc.errors()
        ).dict()
    )

# Global error handler for unexpected exceptions
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled Exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=ErrorResponse(
            error="server_error",
            message="An unexpected error occurred. Please try again later."
        ).dict()
    )

# Include API routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])

# Health check endpoint
@app.get("/health", tags=["Health"], response_model=dict)
async def health_check() -> dict:
    """
    Health check endpoint for readiness/liveness probes.
    """
    return {"status": "ok"}

# Export FastAPI app instance
__all__ = ["app"]