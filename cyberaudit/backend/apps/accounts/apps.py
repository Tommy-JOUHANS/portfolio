from django.apps import AppConfig


class AccountsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    # Le nom complet du module Python (chemin depuis la racine du projet).
    name = "apps.accounts"
    # Label court utilisé dans les FK, migrations et AUTH_USER_MODEL.
    label = "accounts"
