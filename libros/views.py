from django.shortcuts import render, redirect, get_object_or_404
from .models import Libro
import json
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .forms import LibroForm

# Create your views here.

def home(request):
    return redirect('lista')


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

    return render(request, 'detalle.html', context)

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

@csrf_exempt
def listaApi(request):

    #peticion GET, obtenemos todos los libros y los parseamos a json para despues mostrarlos
    if request.method == 'GET':
        libros = Libro.objects.all()
        data = list(libros.values('isbn', 'titulo', 'autor', 'descripcion'))
        return JsonResponse(data, safe=False)

    #peticion POST, obtenemos el cuerpo de la peticion con los datos necesarios para crear el nuevo libro
    else:
        data = json.loads(request.body)

        libro = Libro.objects.create(
                isbn=data['isbn'],
                titulo=data['titulo'],
                autor=data['autor'],
                descripcion=data['descripcion'],
            )

        #devolvemos un mensaje para confirmar al usuario que su libro ha sido creado
        return JsonResponse({'mensaje': 'libro creado exitosamente'}, status=201)