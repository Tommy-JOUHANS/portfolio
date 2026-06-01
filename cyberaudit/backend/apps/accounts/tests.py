"""
accounts/tests.py — Tests pytest pour l'app accounts.

Couverture :
  - Modèle User (création, __str__, full_name, rôle par défaut)
  - POST /api/auth/register/  (succès, email déjà pris)
  - POST /api/auth/login/     (succès, mauvais mot de passe, compte inactif)
  - GET  /api/auth/me/        (authentifié, non authentifié)
  - PATCH /api/auth/me/       (mise à jour first_name)
  - POST /api/auth/logout/    (succès, token manquant)
  - POST /api/auth/change-password/ (succès, mauvais ancien mdp)
"""

import pytest
from rest_framework import status

# ─────────────────────────────────────────────────────────────────────────────
# Modèle User
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestUserModel:
    def test_create_user_hashes_password(self, make_client_user):
        user = make_client_user()
        assert user.password != "Secur1ty!"
        assert user.check_password("Secur1ty!")

    def test_default_role_is_client(self, make_client_user):
        user = make_client_user()
        assert user.role == "client"

    def test_str_contains_email_and_role(self, make_client_user):
        user = make_client_user()
        assert "marie@example.com" in str(user)
        assert "client" in str(user)

    def test_full_name_property(self, make_client_user):
        user = make_client_user(first_name="Marie", last_name="Dupont")
        assert user.full_name == "Marie Dupont"

    def test_uuid_primary_key(self, make_client_user):
        user = make_client_user()
        assert len(str(user.id)) == 36  # format UUID standard

    def test_admin_user_is_staff(self, make_admin_user):
        admin = make_admin_user()
        assert admin.is_staff is True
        assert admin.role == "admin"

    def test_create_user_without_email_raises_error(self):
        from apps.accounts.models import User

        with pytest.raises(ValueError, match="email"):
            User.objects.create_user(email="", password="Test1234!")

    def test_create_superuser_sets_flags(self):
        from apps.accounts.models import User

        admin = User.objects.create_superuser(email="super@example.com", password="Admin1234!")
        assert admin.is_staff is True
        assert admin.is_superuser is True
        assert admin.role == User.Role.ADMIN


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/register/
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestRegisterView:
    URL = "/api/auth/register/"

    def test_register_returns_201_and_tokens(self, api_client):
        payload = {
            "email": "nouveau@example.com",
            "password": "Secur1ty!",
            "first_name": "Alice",
            "last_name": "Martin",
            "company_name": "Test SARL",
        }
        resp = api_client.post(self.URL, payload)
        assert resp.status_code == status.HTTP_201_CREATED
        assert "access" in resp.data
        assert "refresh" in resp.data
        assert resp.data["user"]["email"] == "nouveau@example.com"

    def test_register_duplicate_email_returns_400(self, api_client, make_client_user):
        make_client_user(email="marie@example.com")
        payload = {
            "email": "marie@example.com",
            "password": "Secur1ty!",
            "first_name": "Marie",
            "last_name": "Dupont",
        }
        resp = api_client.post(self.URL, payload)
        assert resp.status_code == status.HTTP_400_BAD_REQUEST

    def test_register_missing_email_returns_400(self, api_client):
        resp = api_client.post(self.URL, {"password": "Secur1ty!"})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/login/
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestLoginView:
    URL = "/api/auth/login/"

    def test_login_returns_tokens_and_user(self, api_client, client_user):
        resp = api_client.post(
            self.URL,
            {
                "email": "marie@example.com",
                "password": "Secur1ty!",
            },
        )
        assert resp.status_code == status.HTTP_200_OK
        assert "access" in resp.data
        assert resp.data["user"]["role"] == "client"

    def test_login_wrong_password_returns_401(self, api_client, client_user):
        resp = api_client.post(
            self.URL,
            {
                "email": "marie@example.com",
                "password": "WrongPassword!",
            },
        )
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_login_inactive_account_returns_403(self, api_client, make_client_user):
        user = make_client_user(email="inactive@example.com")
        user.is_active = False
        user.save()
        resp = api_client.post(
            self.URL,
            {
                "email": "inactive@example.com",
                "password": "Secur1ty!",
            },
        )
        assert resp.status_code == status.HTTP_403_FORBIDDEN


# ─────────────────────────────────────────────────────────────────────────────
# GET / PATCH /api/auth/me/
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestMeView:
    URL = "/api/auth/me/"

    def test_get_me_authenticated(self, auth_client, client_user):
        resp = auth_client.get(self.URL)
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["email"] == client_user.email

    def test_get_me_unauthenticated_returns_401(self, api_client):
        resp = api_client.get(self.URL)
        assert resp.status_code == status.HTTP_401_UNAUTHORIZED

    def test_patch_me_updates_first_name(self, auth_client, client_user):
        resp = auth_client.patch(self.URL, {"first_name": "Pauline"})
        assert resp.status_code == status.HTTP_200_OK
        assert resp.data["first_name"] == "Pauline"


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/logout/
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestLogoutView:
    URL = "/api/auth/logout/"

    def test_logout_blacklists_token(self, auth_client, client_user):
        from rest_framework_simplejwt.tokens import RefreshToken

        refresh = str(RefreshToken.for_user(client_user))
        resp = auth_client.post(self.URL, {"refresh": refresh})
        assert resp.status_code == status.HTTP_204_NO_CONTENT

    def test_logout_missing_refresh_returns_400(self, auth_client):
        resp = auth_client.post(self.URL, {})
        assert resp.status_code == status.HTTP_400_BAD_REQUEST


# ─────────────────────────────────────────────────────────────────────────────
# POST /api/auth/change-password/
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestChangePasswordView:
    URL = "/api/auth/change-password/"

    def test_change_password_success(self, auth_client):
        resp = auth_client.post(
            self.URL,
            {
                "old_password": "Secur1ty!",
                "new_password": "N3wPassw0rd!",
            },
        )
        assert resp.status_code == status.HTTP_200_OK

    def test_change_password_wrong_old_returns_400(self, auth_client):
        resp = auth_client.post(
            self.URL,
            {
                "old_password": "WrongOld!",
                "new_password": "N3wPassw0rd!",
            },
        )
        assert resp.status_code == status.HTTP_400_BAD_REQUEST
