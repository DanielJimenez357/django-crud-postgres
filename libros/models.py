from django.db import models

# Create your models here.

class Libro(models.Model):

    isbn = models.CharField(max_length=20, primary_key=True)
    titulo = models.CharField(max_length=50)
    autor = models.CharField(max_length=50)
    descripcion = models.TextField()

    def __str__(self):
        return self.name
