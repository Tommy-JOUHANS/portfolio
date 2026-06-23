"""
accounts/views.py — Endpoints d'authentification JWT.
"""
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer


def _token_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        "access": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    }


class RegisterView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_token_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"non_field_errors": ["Email ou mot de passe incorrect."]},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.check_password(password):
            return Response(
                {"non_field_errors": ["Email ou mot de passe incorrect."]},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        if not user.is_active:
            return Response(
                {"non_field_errors": ["Ce compte est désactivé."]},
                status=status.HTTP_403_FORBIDDEN,
            )
        return Response(_token_response(user))


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                {"detail": "Le champ 'refresh' est requis."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except TokenError:
            return Response(
                {"detail": "Token invalide ou déjà révoqué."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(status=status.HTTP_204_NO_CONTENT)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        request.user.is_active = False
        request.user.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Mot de passe modifié avec succès."})


class PasswordResetRequestView(APIView):
    """Génère un token de reset password. Anti-énumération."""
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        email = request.data.get("email", "").strip().lower()
        if not email:
            return Response({"detail": "Email requis."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            user = User.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            return Response({
                "success": True,
                "reset_token": f"{uid}.{token}",
                "user_email": email,
                "user_name": user.first_name or email.split("@")[0],
            })
        except User.DoesNotExist:
            return Response({"success": True})


class PasswordResetConfirmView(APIView):
    """Valide le token et change le mot de passe."""
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        token_combined = request.data.get("token", "")
        new_password = request.data.get("new_password", "")
        if not token_combined or "." not in token_combined:
            return Response({"detail": "Token invalide."}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_password) < 8:
            return Response(
                {"detail": "Le mot de passe doit faire au moins 8 caractères."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            uid, token = token_combined.split(".", 1)
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (ValueError, User.DoesNotExist):
            return Response({"detail": "Token invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, token):
            return Response({"detail": "Token invalide ou expiré."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save(update_fields=["password"])
        return Response({"success": True, "detail": "Mot de passe modifié avec succès."})
