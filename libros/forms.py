from django import forms
from .models import Libro
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class LibroForm(forms.ModelForm):

    class Meta:

        model = Libro

        fields = ['isbn', 'titulo', 'autor', 'descripcion', 'imagen']

class UsuarioForm(UserCreationForm):
    class Meta:
        model = User
        fields = ['username']