#!/bin/sh
# Boot order: bundled MongoDB -> wait until it answers -> seed demo data ->
# ensure the demo ADMIN account -> serve the API.
# (Health probes are served by Django: /health and /api/health in mon_projet/urls.py.)
/opt/mongo/bin/mongod --dbpath /data/db --bind_ip 127.0.0.1 --port 27017 --fork --logpath /tmp/mongod.log --wiredTigerCacheSizeGB 0.25 || { echo "MONGOD FAILED TO START"; tail -50 /tmp/mongod.log; }

python - <<'PYEOF'
import socket, sys, time
for i in range(45):
    try:
        s = socket.create_connection(('127.0.0.1', 27017), timeout=2)
        s.close()
        print(f"MongoDB is up (after ~{i * 2}s)")
        sys.exit(0)
    except OSError:
        time.sleep(2)
print("MongoDB did NOT come up within 90s")
sys.exit(1)
PYEOF

curl -sL https://raw.githubusercontent.com/MarouaOuadrhiri/BrandShift/main/seed_data.py -o /tmp/seed_data.py
PYTHONPATH=/app python /tmp/seed_data.py || true
PYTHONPATH=/app python /app/ensure_admin.py || true
exec gunicorn mon_projet.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 1 --timeout 120
