from django.db import models
from django.conf import settings

# Create your models here.

class Repositorio(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)


class Libro(models.Model):

    isbn = models.CharField(max_length=20, primary_key=True, unique=True)
    titulo = models.CharField(max_length=50)
    autor = models.CharField(max_length=50)
    descripcion = models.TextField(blank=True, null=True)
    imagen = models.ImageField(upload_to="images", max_length=255, blank=True, null=True)
    repositorio = models.ForeignKey(Repositorio, on_delete=models.CASCADE, editable=False)
    numero_paginas = models.IntegerField(blank=True, null=True)
    opinion = models.TextField(blank=True, null=True)
    puntuacion = models.IntegerField(blank=True, null=True)

    def __str__(self):
        return self.titulo
