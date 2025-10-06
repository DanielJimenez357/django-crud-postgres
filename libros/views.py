from django.shortcuts import render, redirect, get_object_or_404
from .models import Libro
from .forms import LibroForm

# Create your views here.

def lista(request):
    lista = Libro.objects.all()

    #devolvemos una coleccion en caso de añadir mas contenido en un futuro
    context= {
        'lista': lista,
    }

    #renderiza la plantilla que indicamos con la informacion que le pasamos
    return render(request, 'lista.html', context)

def detalles(request, id):

    #recogemos el libor identificandolo por la pk que recogemos de la plantilla
    libro = get_object_or_404(Libro, pk=id)

    context= {
        'isbn': libro.isbn,
        'titulo': libro.titulo,
        'autor': libro.autor,
        'descripcion': libro.descripcion,
    }

    return render(request, 'detalles.html', context)

def borrar(request, id):

    libro = get_object_or_404(Libro, pk=id)

    #obtenemos el libro con la pk y lo borramos
    libro.delete()

    #volvemos a redirigir a la lista de libros
    return redirect('lista')

def nuevoLibro(request):

    #comprobamos el metodo de envio si es POST se trata de un formulario ya editado
    if request.method == 'POST':
        form = LibroForm(request.POST)
        if form.is_valid(): #comprobamos que sea valido
            form.save() #guardamos y redirigimos
            return redirect('lista')

    #si la solicitud es get rellenamos el formulario con los datos actuales
    else:
        form = LibroForm()
    
    context = {
        'form': form,
    }

    return render(request, 'nuevo_libro.html', context)

def editarLibro(request, id):

    libro_editado = get_object_or_404(Libro, pk=id)

    #comprobamos el metodo de envio si es POST se trata de un formulario relleno
    if request.method == 'POST':
        form = LibroForm(request.POST, instance=libro_editado)
        if form.is_valid(): #comprobamos que sea valido
            form.save() #guardamos y redirigimos
            return redirect('lista')

    #si la solicitud es get creamos un formulario vacio
    else:
        form = LibroForm(instance=libro_editado)
    
    context = {
        'form': form,
    }

    return render(request, 'nuevo_libro.html', context)