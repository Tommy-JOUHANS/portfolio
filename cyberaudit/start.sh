#!/bin/bash
redis-server --daemonize yes
cd ~/portfolio/cyberaudit/backend
source .venv/bin/activate
celery -A config worker -l info &
python manage.py runserver &
cd ~/portfolio/cyberaudit/frontend
npm run dev
