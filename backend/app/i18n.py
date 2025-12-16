from typing import Optional
from fastapi import Request
import threading

# Thread-local storage for per-request locale
_locale_ctx = threading.local()

def get_locale_from_request(request: Request) -> str:
    """
    Extracts the preferred locale from the request.
    Checks the following in order:
    1. 'Accept-Language' header
    2. 'locale' query parameter
    3. Defaults to 'en'
    """
    # Check query parameter first (explicit override)
    locale = request.query_params.get("locale")
    if locale:
        return locale.lower()
    # Check Accept-Language header
    accept_language = request.headers.get("accept-language")
    if accept_language:
        # Parse the first language code from the header
        languages = [lang.split(";")[0].strip() for lang in accept_language.split(",")]
        if languages and languages[0]:
            return languages[0].lower()
    # Default locale
    return "en"

def set_locale(locale: str) -> None:
    """
    Sets the locale for the current request context.
    """
    _locale_ctx.locale = locale

def get_locale() -> str:
    """
    Gets the locale for the current request context.
    """
    return getattr(_locale_ctx, "locale", "en")

def translate_i18n(i18n_dict: Optional[dict], locale: str = "en") -> Optional[str]:
    """
    Utility to get the translation for a given locale from an i18n dict.
    Falls back to English or any available language.
    """
    if not i18n_dict:
        return None
    if locale in i18n_dict:
        return i18n_dict[locale]
    if "en" in i18n_dict:
        return i18n_dict["en"]
    return next(iter(i18n_dict.values()), None)

# Exported symbols
__all__ = [
    "get_locale_from_request",
    "set_locale",
    "get_locale",
    "translate_i18n",
]