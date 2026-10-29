#!/bin/sh
/opt/mongo/bin/mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongod.log
sleep 2
curl -sL https://raw.githubusercontent.com/MarouaOuadrhiri/BrandShift/main/seed_data.py -o /tmp/seed_data.py
PYTHONPATH=/app python /tmp/seed_data.py || true
exec gunicorn mon_projet.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 120




