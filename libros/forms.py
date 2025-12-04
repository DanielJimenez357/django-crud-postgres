from django import forms
from .models import Libro
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


PUNTUACION_LIBRO = [(i, str(i)) for i in range(1, 11)]



class LibroForm(forms.ModelForm):

    puntuacion = forms.TypedChoiceField(
        choices=PUNTUACION_LIBRO,
        label="Puntuacion"
    )

    class Meta:

        model = Libro

        fields = ['isbn', 'titulo', 'autor', 'descripcion', 'opinion', 'imagen', 'numero_paginas', 'puntuacion']

class UsuarioForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].help_text = ''
        
        self.fields['password2'].help_text = '' 

    class Meta:
        model = User
        fields = ['username']