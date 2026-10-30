"""Ensure the demo ADMIN account exists (idempotent). Runs at container boot,
after the seed: the frontend login page pre-fills these credentials for the
Administrator profile. The app's built-in default admin only triggers under
`runserver`, not under gunicorn, so production needs this."""
import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mon_projet.settings')
django.setup()

from django.contrib.auth.hashers import make_password

from users.models import User

EMAIL = 'admin@brandshift.com'

if User.objects(email=EMAIL).first():
    print(f'[OK] admin account already exists: {EMAIL}')
else:
    User(
        email=EMAIL,
        first_name='Maroua',
        last_name='Ouadrhiri',
        role='ADMIN',
        password=make_password('admin123'),
    ).save()
    print(f'[OK] admin account created: {EMAIL} (Password: admin123)')
