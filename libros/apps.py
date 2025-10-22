from django.apps import AppConfig


class LibrosConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'libros'

    def ready(self):
        import libros.signals
