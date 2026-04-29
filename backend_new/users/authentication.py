import jwt
from django.conf import settings
from rest_framework import authentication
from rest_framework import exceptions
from .models import User
from mongoengine.errors import DoesNotExist

class JWTAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return None

        try:
            prefix, token = auth_header.split(' ')
            if prefix.lower() != 'bearer':
                return None
        except ValueError:
            return None

        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
        except jwt.ExpiredSignatureError:
            raise exceptions.AuthenticationFailed('Token has expired')
        except jwt.InvalidTokenError:
            raise exceptions.AuthenticationFailed('Invalid token')

        try:
            user = User.objects.get(id=payload['user_id'])
            # Verify session status
            from .models import UserSession
            session = UserSession.objects(user=user, token=token).first()
            
            if session:
                if not session.is_active:
                    raise exceptions.AuthenticationFailed('Session has been revoked')
            else:
                # If token is valid but no session record exists (old session), create one
                UserSession(
                    user=user,
                    token=token,
                    device_info=request.headers.get('User-Agent', 'Migrated Session'),
                    ip_address=request.META.get('REMOTE_ADDR')
                ).save()
        except DoesNotExist:
            raise exceptions.AuthenticationFailed('User not found')

        return (user, token)
