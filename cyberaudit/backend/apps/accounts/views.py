"""
accounts/views.py — Endpoints d'authentification JWT.

  POST /api/auth/register/         → RegisterView
  POST /api/auth/login/            → LoginView
  POST /api/auth/logout/           → LogoutView   (blacklist refresh token)
  POST /api/auth/token/refresh/    → TokenRefreshView (SimpleJWT natif)
  GET  /api/auth/me/               → MeView
  PATCH /api/auth/me/              → MeView
  DELETE /api/auth/me/             → MeView (désactivation compte)
  POST /api/auth/change-password/  → ChangePasswordView
"""

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import ChangePasswordSerializer, RegisterSerializer, UserSerializer


# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

def _token_response(user):
    """Retourne access + refresh + données utilisateur."""
    refresh = RefreshToken.for_user(user)
    return {
        "access":  str(refresh.access_token),
        "refresh": str(refresh),
        "user":    UserSerializer(user).data,
    }


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register/
# ─────────────────────────────────────────────────────────────────────────────

class RegisterView(APIView):
    """Création d'un compte client + retour des tokens JWT."""
    permission_classes = [AllowAny]
    throttle_scope = "login"          # 5 req/min (config settings.py)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(_token_response(user), status=status.HTTP_201_CREATED)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login/
# ─────────────────────────────────────────────────────────────────────────────

class LoginView(APIView):
    """Vérification des identifiants + génération des tokens JWT."""
    permission_classes = [AllowAny]
    throttle_scope = "login"

    def post(self, request):
        email    = request.data.get("email", "").strip().lower()
        password = request.data.get("password", "")

        # Recherche de l'utilisateur (même message si email inconnu ou mdp faux
        # → anti-énumération de comptes).
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


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/logout/
# ─────────────────────────────────────────────────────────────────────────────

class LogoutView(APIView):
    """Blacklist le refresh token pour invalider la session."""
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


# ─────────────────────────────────────────────────────────────────────────────
# GET / PATCH / DELETE /api/auth/me/
# ─────────────────────────────────────────────────────────────────────────────

class MeView(APIView):
    """Profil de l'utilisateur connecté — lecture, modification, suppression."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(
            request.user, data=request.data, partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request):
        """Désactive le compte (soft delete — ne supprime pas l'enregistrement)."""
        request.user.is_active = False
        request.user.save(update_fields=["is_active"])
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/change-password/
# ─────────────────────────────────────────────────────────────────────────────

class ChangePasswordView(APIView):
    """Changement de mot de passe après vérification de l'ancien."""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Mot de passe modifié avec succès."})
