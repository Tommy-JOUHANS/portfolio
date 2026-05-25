"""
accounts/serializers.py — Sérialiseurs DRF pour l'authentification.

  UserSerializer        : lecture profil (sans mot de passe)
  RegisterSerializer    : création de compte
  ChangePasswordSerializer : changement de mot de passe authentifié
"""

from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import User


# ─────────────────────────────────────────────────────────────────────────────
# Profil utilisateur (lecture seule / PATCH partiel)
# ─────────────────────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    """Représentation publique d'un utilisateur (jamais le mot de passe)."""

    class Meta:
        model  = User
        fields = [
            "id", "email", "first_name", "last_name",
            "company_name", "role", "is_active", "created_at",
        ]
        read_only_fields = ["id", "email", "role", "is_active", "created_at"]


# ─────────────────────────────────────────────────────────────────────────────
# Inscription
# ─────────────────────────────────────────────────────────────────────────────

class RegisterSerializer(serializers.ModelSerializer):
    """Crée un nouveau compte client avec validation du mot de passe Django."""

    password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
        style={"input_type": "password"},
    )

    class Meta:
        model  = User
        fields = ["email", "password", "first_name", "last_name", "company_name"]

    def create(self, validated_data):
        # create_user s'occupe du hachage du mot de passe.
        return User.objects.create_user(**validated_data)


# ─────────────────────────────────────────────────────────────────────────────
# Changement de mot de passe
# ─────────────────────────────────────────────────────────────────────────────

class ChangePasswordSerializer(serializers.Serializer):
    """Valide l'ancien mot de passe et impose le nouveau."""

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(
        write_only=True,
        min_length=8,
        validators=[validate_password],
    )

    def validate_old_password(self, value):
        user = self.context["request"].user
        if not user.check_password(value):
            raise serializers.ValidationError("Mot de passe actuel incorrect.")
        return value
