"""
Django settings — env-aware (dev local + prod Railway).

Dev   : valeurs par défaut suffisent (SQLite, DEBUG=True, CORS local).
Prod  : variables d'env Railway prennent le dessus.
"""

from datetime import timedelta
from pathlib import Path

import dj_database_url
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

# ── Sécurité ─────────────────────────────────────────────────────────────────
SECRET_KEY = config(
    "DJANGO_SECRET_KEY",
    default="django-insecure-v^4z+19l+j126&rq8lmg&@%@v5z69*90kp^enk+p1ob51(a6x_",
)
DEBUG = config("DJANGO_DEBUG", default=True, cast=bool)
# ALLOWED_HOSTS hardcodé temporairement pour Railway (la variable d'env ne passe pas).
ALLOWED_HOSTS = ["*"]

# Railway termine HTTPS au proxy : on annonce HTTPS à Django.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

CSRF_TRUSTED_ORIGINS = config(
    "DJANGO_CSRF_TRUSTED_ORIGINS",
    default="https://*.railway.app,https://*.up.railway.app,https://*.vercel.app",
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "apps.accounts",
    "apps.audits",
    "apps.reports",
    "apps.training",
    "apps.notifications",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    # WhiteNoise sert les fichiers statiques en prod (Railway).
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"
WSGI_APPLICATION = "config.wsgi.application"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [BASE_DIR / "templates"],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ]
        },
    }
]

# ── Base de données ──────────────────────────────────────────────────────────
# En prod : Railway expose DATABASE_URL=postgres://...  → on l'utilise.
# En dev  : pas de DATABASE_URL → fallback SQLite local.
import os
_DATABASE_URL = os.environ.get("DATABASE_URL", f"sqlite:///{BASE_DIR / 'db.sqlite3'}")
DATABASES = {
    "default": dj_database_url.parse(_DATABASE_URL, conn_max_age=600),
}

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ── Static files (collectstatic + WhiteNoise) ────────────────────────────────
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": ("rest_framework.permissions.IsAuthenticated",),
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
        "rest_framework.throttling.ScopedRateThrottle",
    ],
    "DEFAULT_THROTTLE_RATES": {"anon": "100/hour", "user": "300/hour", "login": "5/min"},
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=60),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=60),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
    "USER_ID_CLAIM": "user_id",
}

# ── CORS ─────────────────────────────────────────────────────────────────────
_default_cors = (
    "http://localhost:5173,http://127.0.0.1:5173,"
    "http://localhost:3000,http://127.0.0.1:3000"
)
CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default=_default_cors,
    cast=lambda v: [s.strip() for s in v.split(",") if s.strip()],
)
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
    r"^https://.*\.railway\.app$",
    r"^https://.*\.up\.railway\.app$",
]
CORS_ALLOW_CREDENTIALS = True

# ── Email ────────────────────────────────────────────────────────────────────
EMAIL_BACKEND = "django.core.mail.backends.console.EmailBackend"
DEFAULT_FROM_EMAIL = "CyberAudit <noreply@cyberaudit.fr>"
RESEND_API_KEY = config("RESEND_API_KEY", default="")
FRONTEND_URL = config("FRONTEND_URL", default="http://localhost:3000")

# ── Celery (Redis) ───────────────────────────────────────────────────────────
REDIS_URL = config("REDIS_URL", default="redis://127.0.0.1:6379/0")
CELERY_BROKER_URL = config("CELERY_BROKER_URL", default=REDIS_URL)
CELERY_RESULT_BACKEND = config("CELERY_RESULT_BACKEND", default=REDIS_URL)
CELERY_TASK_SERIALIZER = "json"
CELERY_RESULT_SERIALIZER = "json"
CELERY_ACCEPT_CONTENT = ["json"]
CELERY_TIMEZONE = "UTC"
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_TIME_LIMIT = 5 * 60
CELERY_TASK_ALWAYS_EAGER = False

# ── Médias (PDF rapports) ────────────────────────────────────────────────────
MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"
