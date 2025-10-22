from django.db.models.signals import post_save
from django.dispatch import receiver
from django.conf import settings
from .models import Repositorio

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def crear_repositorio(sender, instance, created, **kwargs):
    if created:
        Repositorio.objects.create(usuario=instance)