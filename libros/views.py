from django.shortcuts import render, redirect, get_object_or_404
from .models import Libro

# Create your views here.

def Lista(request):
    lista = Libro.objects.all()

    //devolvemos una coleccion en caso de añadir mas contenido en un futuro
    context= {
        'lista': lista,
    }

    //renderiza la plantilla que indicamos con la informacion que le pasamos
    return render(request, 'lista.html', context)

def Detalles(request, id):

    //recogemos el libor identificandolo por la pk que recogemos de la plantilla
    libro = get_object_or_404(Libro, pk=id)

    context= {
        'isbn': libro.isbn,
        'titulo': libro.titulo,
        'autor': libro.autor,
        'descripcion': libro.descripcion,
    }

    return render(request, 'detalles.html', context)