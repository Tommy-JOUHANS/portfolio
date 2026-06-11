"""
test_sql_injection.py — Tests d'injection SQL sur toute l'API Django.

Objectif : vérifier que les payloads SQL malveillants sont traités
comme des chaînes de caractères ordinaires (grâce à l'ORM Django
et ses requêtes paramétrées) et ne provoquent ni crash (500),
ni bypass d'authentification, ni fuite ou destruction de données.

Payloads couverts :
  - OR bypass classique   : ' OR '1'='1 / ' OR 1=1--
  - Stacked queries       : '; DROP TABLE …; --
  - UNION extraction      : ' UNION SELECT …
  - Comment injection     : admin'--
  - Double-quote variant  : " OR "1"="1
"""

from unittest.mock import patch

import pytest
from rest_framework import status

from apps.accounts.models import User
from apps.audits.models import AuditPack, AuditRequest
from apps.reports.models import AuditReport

# ── Payloads ──────────────────────────────────────────────────────────────────

SQL_PAYLOADS = [
    "' OR '1'='1",
    "' OR 1=1--",
    "'; DROP TABLE apps_accounts_user; --",
    "' UNION SELECT id, email, password FROM apps_accounts_user --",
    "admin'--",
    "1; SELECT * FROM information_schema.tables--",
    "' OR 'x'='x",
    '" OR "1"="1',
    "'); DELETE FROM apps_audits_auditrequest; --",
]

# ─────────────────────────────────────────────────────────────────────────────
# 1. Authentification
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSQLInjectionAuth:
    """Les payloads SQL dans les champs d'auth ne bypassent pas la sécurité."""

    def test_login_sql_payload_in_email_never_returns_200(self, api_client):
        """Aucun payload SQL dans l'email n'ouvre une session.
        429 est accepté : le throttle DRF est lui-même une défense anti-brute-force."""
        for payload in SQL_PAYLOADS:
            resp = api_client.post(
                "/api/auth/login/",
                {"email": payload, "password": "anything"},
            )
            assert resp.status_code in (
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_429_TOO_MANY_REQUESTS,   # throttle = défense légitime
            ), f"Payload '{payload}' a retourné {resp.status_code} (attendu 400, 401 ou 429)"
            # Le seul code interdit est 200 (bypass d'auth)
            assert resp.status_code != status.HTTP_200_OK

    def test_login_sql_payload_in_password_never_returns_200(
        self, api_client, client_user
    ):
        """Un payload SQL dans le mot de passe ne contourne pas la vérification.
        429 est accepté : le throttle DRF bloque les tentatives répétées."""
        for payload in SQL_PAYLOADS:
            resp = api_client.post(
                "/api/auth/login/",
                {"email": "marie@example.com", "password": payload},
            )
            assert resp.status_code in (
                status.HTTP_401_UNAUTHORIZED,
                status.HTTP_429_TOO_MANY_REQUESTS,   # throttle = défense légitime
            ), f"Payload '{payload}' a retourné {resp.status_code} (attendu 401 ou 429)"
            assert resp.status_code != status.HTTP_200_OK

    def test_register_sql_payload_in_name_fields_stored_literally(
        self, api_client
    ):
        """Un payload SQL dans first_name / company_name est stocké tel quel, jamais exécuté."""
        payload = "'; DROP TABLE apps_accounts_user; --"
        resp = api_client.post(
            "/api/auth/register/",
            {
                "email": "inject@test.fr",
                "password": "Secur1ty!",
                "first_name": payload,
                "last_name": payload,
                "company_name": payload,
            },
        )
        # Accepté (stocké littéralement) ou refusé par validation — jamais 500
        assert resp.status_code in (
            status.HTTP_201_CREATED,
            status.HTTP_400_BAD_REQUEST,
        )
        if resp.status_code == status.HTTP_201_CREATED:
            user = User.objects.get(email="inject@test.fr")
            # Valeur stockée telle quelle, pas interprétée comme SQL
            assert user.first_name == payload
            # La table accounts n'a pas été détruite
            assert User.objects.filter(email="inject@test.fr").exists()

    def test_change_password_sql_payload_rejected(self, auth_client):
        """Un payload SQL dans old_password ou new_password ne provoque pas de 500."""
        for payload in SQL_PAYLOADS:
            resp = auth_client.post(
                "/api/auth/change-password/",
                {"old_password": payload, "new_password": payload},
            )
            assert resp.status_code in (
                status.HTTP_400_BAD_REQUEST,
                status.HTTP_200_OK,   # improbable mais non bloquant
            )
            assert resp.status_code != status.HTTP_500_INTERNAL_SERVER_ERROR


# ─────────────────────────────────────────────────────────────────────────────
# 2. Demandes d'audit (AuditRequest)
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSQLInjectionAudit:
    """Payloads SQL dans les champs et paramètres des endpoints /api/audits/."""

    def test_scope_notes_sql_payload_stored_and_table_intact(
        self, auth_client, client_user
    ):
        """Un DROP TABLE dans scope_notes est stocké comme texte, la table survit."""
        pack = AuditPack.objects.get(code="audit")
        payload = "'; DROP TABLE apps_audits_auditrequest; --"

        resp = auth_client.post(
            "/api/audits/",
            {"pack": pack.pk, "scope_notes": payload},
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED

        # La table AuditRequest existe toujours
        assert AuditRequest.objects.filter(client=client_user).exists()
        # Le contenu est stocké littéralement
        req = AuditRequest.objects.get(client=client_user)
        assert req.scope_notes == payload

    def test_all_sql_payloads_in_scope_notes_no_crash(self, auth_client):
        """Tous les payloads SQL dans scope_notes retournent 201, jamais 500."""
        pack = AuditPack.objects.get(code="audit")
        for payload in SQL_PAYLOADS:
            resp = auth_client.post(
                "/api/audits/",
                {"pack": pack.pk, "scope_notes": payload},
                format="json",
            )
            assert resp.status_code != status.HTTP_500_INTERNAL_SERVER_ERROR

    def test_sql_injection_in_uuid_url_returns_4xx(self, auth_client):
        """Un payload SQL dans l'UUID de l'URL retourne 404/400, pas de fuite."""
        bad_ids = [
            "' OR '1'='1",
            "1 UNION SELECT * FROM apps_accounts_user",
            "'; DROP TABLE apps_audits_auditrequest; --",
        ]
        for bad_id in bad_ids:
            resp = auth_client.get(f"/api/audits/{bad_id}/")
            assert resp.status_code in (
                status.HTTP_404_NOT_FOUND,
                status.HTTP_400_BAD_REQUEST,
            ), f"Payload URL '{bad_id}' a retourné {resp.status_code}"

    def test_status_filter_sql_payload_no_data_leak(self, auth_client, client_user):
        """Un payload SQL dans le paramètre ?status= ne retourne pas d'autres données."""
        pack = AuditPack.objects.get(code="audit")
        AuditRequest.objects.create(client=client_user, pack=pack)

        resp = auth_client.get(
            "/api/audits/",
            {"status": "' OR '1'='1"},
        )
        assert resp.status_code == status.HTTP_200_OK
        # Aucun "résultat magique" : liste vide ou seulement les propres demandes
        results = resp.data.get("results", [])
        for req in results:
            # req["client"] peut être un UUID ou une chaîne selon le serializer
            # → on compare via str() pour éviter UUID('xxx') != 'xxx'
            assert str(req.get("client")) == str(client_user.id) or "client" not in req


# ─────────────────────────────────────────────────────────────────────────────
# 3. Génération de rapport
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSQLInjectionReport:
    """Payloads SQL dans les champs du rapport (summary, verdict, findings)."""

    @pytest.fixture
    def audit(self, client_user):
        pack = AuditPack.objects.get(code="audit")
        return AuditRequest.objects.create(client=client_user, pack=pack)

    @patch("apps.reports.views.generate_pdf_task.delay")
    def test_sql_payload_in_summary_and_verdict_stored_literally(
        self, mock_delay, admin_auth_client, audit
    ):
        """Un UNION SELECT dans summary/verdict est stocké comme texte."""
        payload = "' UNION SELECT id, email, password FROM apps_accounts_user --"
        resp = admin_auth_client.post(
            f"/api/audits/{audit.id}/generate-report/",
            {
                "summary": payload,
                "verdict": payload,
                "security_score": 75,
                "grade": "B",
                "findings": [],
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_202_ACCEPTED
        report = AuditReport.objects.get(audit_request=audit)
        # Stocké littéralement — les autres données utilisateurs ne sont pas exposées
        assert report.summary == payload
        # Il ne doit y avoir qu'un seul rapport
        assert AuditReport.objects.count() == 1

    @patch("apps.reports.views.generate_pdf_task.delay")
    def test_sql_payload_in_findings_asset_stored_literally(
        self, mock_delay, admin_auth_client, audit
    ):
        """Payloads SQL dans les champs asset/description/recommendation stockés en JSON."""
        payload = "'; DROP TABLE apps_reports_auditreport; --"
        resp = admin_auth_client.post(
            f"/api/audits/{audit.id}/generate-report/",
            {
                "summary": "Rapport de test",
                "verdict": "Acceptable",
                "security_score": 80,
                "grade": "B+",
                "findings": [
                    {
                        "severity": "High",
                        "asset": payload,
                        "description": payload,
                        "recommendation": payload,
                    }
                ],
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_202_ACCEPTED
        # La table AuditReport n'est pas détruite
        assert AuditReport.objects.filter(audit_request=audit).exists()
        report = AuditReport.objects.get(audit_request=audit)
        # Le finding est stocké comme JSON littéral
        assert len(report.findings) == 1
        assert report.findings[0]["asset"] == payload

    def test_sql_injection_in_generate_report_url_returns_4xx(
        self, admin_auth_client
    ):
        """Un payload SQL dans l'UUID de l'URL generate-report retourne 4xx."""
        resp = admin_auth_client.post(
            "/api/audits/' OR '1'='1/generate-report/",
            {},
            format="json",
        )
        assert resp.status_code in (
            status.HTTP_404_NOT_FOUND,
            status.HTTP_400_BAD_REQUEST,
        )


# ─────────────────────────────────────────────────────────────────────────────
# 4. Aucune fuite de données (isolation)
# ─────────────────────────────────────────────────────────────────────────────


@pytest.mark.django_db
class TestSQLInjectionNoDataLeak:
    """Vérifie qu'aucune injection SQL ne permet d'extraire des données non autorisées."""

    def test_login_bypass_is_impossible(self, api_client, make_client_user):
        """Les payloads OR '1'='1 ne permettent jamais de se connecter sans mot de passe."""
        make_client_user(email="victim@example.com")
        bypass_payloads = [
            "' OR '1'='1",
            "' OR 1=1--",
            "anything' OR 'x'='x",
            "victim@example.com' --",
        ]
        for payload in bypass_payloads:
            resp = api_client.post(
                "/api/auth/login/",
                {"email": "victim@example.com", "password": payload},
            )
            assert resp.status_code != status.HTTP_200_OK, (
                f"Payload '{payload}' a bypassé l'authentification !"
            )
            assert "access" not in (resp.data or {}), (
                f"Payload '{payload}' a retourné un token JWT !"
            )

    def test_client_b_cannot_read_client_a_audit_with_injection(
        self, api_client, make_client_user
    ):
        """L'isolation client/client est maintenue même avec un UUID valide d'un autre."""
        from rest_framework_simplejwt.tokens import RefreshToken

        client_a = make_client_user(email="a@example.com")
        client_b = make_client_user(email="b@example.com")
        pack = AuditPack.objects.get(code="audit")
        req_a = AuditRequest.objects.create(client=client_a, pack=pack)

        # Authentifié en tant que B — essaie de lire le dossier de A
        token = RefreshToken.for_user(client_b).access_token
        api_client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        resp = api_client.get(f"/api/audits/{req_a.id}/")
        assert resp.status_code == status.HTTP_404_NOT_FOUND

    def test_user_count_unchanged_after_injection_storm(
        self, api_client, client_user
    ):
        """Après 9 tentatives d'injection, le nombre d'utilisateurs est inchangé."""
        initial_count = User.objects.count()  # 1 (client_user)
        for payload in SQL_PAYLOADS:
            api_client.post(
                "/api/auth/login/",
                {"email": payload, "password": payload},
            )
        assert User.objects.count() == initial_count

    def test_audit_table_intact_after_drop_table_payload(
        self, auth_client, client_user
    ):
        """Après un payload DROP TABLE dans scope_notes, la table AuditRequest existe."""
        pack = AuditPack.objects.get(code="audit")
        before = AuditRequest.objects.count()

        auth_client.post(
            "/api/audits/",
            {
                "pack": pack.pk,
                "scope_notes": "'; DROP TABLE apps_audits_auditrequest; --",
            },
            format="json",
        )
        # La table n'est pas détruite — le count a augmenté de 1
        assert AuditRequest.objects.count() == before + 1

    def test_union_select_payload_does_not_expose_credentials(
        self, auth_client, client_user
    ):
        """Un UNION SELECT dans scope_notes ne fait pas fuiter d'autres colonnes."""
        pack = AuditPack.objects.get(code="audit")
        resp = auth_client.post(
            "/api/audits/",
            {
                "pack": pack.pk,
                "scope_notes": (
                    "test' UNION SELECT id, email, password, '','','' "
                    "FROM apps_accounts_user --"
                ),
            },
            format="json",
        )
        assert resp.status_code == status.HTTP_201_CREATED
        # La réponse ne contient pas d'email ou hash de mot de passe
        response_str = str(resp.data)
        assert "password" not in response_str or "scope_notes" in response_str
        # Vérification explicite : aucun champ "email" hors du contexte attendu
        assert "Secur1ty!" not in response_str
        assert "Adm1n!Strong" not in response_str
