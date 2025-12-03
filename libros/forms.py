from django import forms
from .models import Libro
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.models import User


class LibroForm(forms.ModelForm):

    class Meta:

        model = Libro

        fields = ['isbn', 'titulo', 'autor', 'descripcion', 'imagen', 'numero_paginas']

class UsuarioForm(UserCreationForm):

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['username'].help_text = ''
        
        self.fields['password2'].help_text = '' 

    class Meta:
        model = User
        fields = ['username']