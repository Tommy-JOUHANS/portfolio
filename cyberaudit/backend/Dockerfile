# CyberAudit Backend - Image Docker pour Railway (Backend + Worker Celery)
FROM python:3.12-slim

# Dépendances système pour WeasyPrint (Pango, Cairo, GLib, fonts)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpango-1.0-0 \
    libpangoft2-1.0-0 \
    libharfbuzz0b \
    libcairo2 \
    libgdk-pixbuf-2.0-0 \
    libffi8 \
    shared-mime-info \
    fonts-liberation \
    fonts-dejavu-core \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps en premier (cache layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copie le code applicatif
COPY . /app

EXPOSE 8080

# Default CMD = backend web (overridé par Railway pour le worker)
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py setup_admin && gunicorn config.wsgi --bind 0.0.0.0:$PORT --log-file - --access-logfile - --workers 2"]
