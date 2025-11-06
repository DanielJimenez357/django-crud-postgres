from django.db import models
from django.conf import settings

# Create your models here.

class Repositorio(models.Model):
    usuario = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)


class Libro(models.Model):

    isbn = models.CharField(max_length=20, primary_key=True)
    titulo = models.CharField(max_length=50)
    autor = models.CharField(max_length=50)
    descripcion = models.TextField()
    imagen = models.ImageField(upload_to="images", max_length=255)
    repositorio = models.ForeignKey(Repositorio, on_delete=models.CASCADE, editable=False)
    numero_paginas = models.IntegerField()

    def __str__(self):
        return self.titulo
