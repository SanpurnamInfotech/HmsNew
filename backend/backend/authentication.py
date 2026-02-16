from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework import exceptions
from .models import Users

class CustomJWTAuthentication(JWTAuthentication):

    def authenticate(self, request):
        header = self.get_header(request)
        if header is None:
            return None

        raw_token = self.get_raw_token(header)
        if raw_token is None:
            return None

        try:
            validated_token = self.get_validated_token(raw_token)
        except Exception as e:
            return None

        user = self.get_user(validated_token)
        # DRF expects request.user to have 'is_authenticated'
        # Attach the attribute dynamically for our custom Users model
        try:
            setattr(user, "is_authenticated", True)
        except Exception:
            pass
        return (user, validated_token)

    def get_user(self, validated_token):
        try:
            user_id = validated_token.get("user_id")
            user = Users.objects.get(id=user_id, status=1)
            return user

        except Users.DoesNotExist:
            raise exceptions.AuthenticationFailed("User not found or inactive")
