import os, json, requests
from os.path import splitext
from django.contrib.auth import authenticate, login
from django.shortcuts import render, redirect, get_object_or_404
from .models import Libro
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .forms import LibroForm, UsuarioForm
from django.core import serializers

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

    os.remove('./libros/media/' + libro.imagen.name )
    

    #obtenemos el libro con la pk y lo borramos
    libro.delete()

    #volvemos a redirigir a la lista de libros
    return redirect('lista')

def nuevoLibro(request):

    #comprobamos el metodo de envio si es POST se trata de un formulario ya editado
    if request.method == 'POST':
        form = LibroForm(request.POST, request.FILES)
        
        if form.is_valid(): #comprobamos que sea valido

            #obtenemos los datos del formulario sin guardarlo en la base de datos
            libro = form.save(commit=False)
            #obtenemos la extension del archivo
            extension = splitext(libro.imagen.name)[1]
            #cambiamos el nombre del archivo al titulo del libro
            libro.imagen.name = form.cleaned_data['titulo'] + extension
            libro.save()
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

    nombre_imagen = libro_editado.imagen.name

    #comprobamos el metodo de envio si es POST se trata de un formulario relleno
    if request.method == 'POST':
        form = LibroForm(request.POST, request.FILES , instance=libro_editado)
        if form.is_valid(): #comprobamos que sea valido

            libro = form.save(commit=False)

            #obtenemos la extension del archivo
            extension = splitext(libro.imagen.name)[1]

            if libro.imagen.name != nombre_imagen:
                os.remove('./libros/media/' + nombre_imagen )
                libro.imagen.save(form.cleaned_data['titulo'] + extension, libro.imagen.file, save=False)
                
            else:
                nombre_a_cambiar = libro.imagen.name
                media_url = './libros/media/'

                #cambiamos el nombre del archivo al titulo del libro
                libro.imagen.name = 'images/' + form.cleaned_data['titulo'] + extension

                os.replace(media_url + nombre_a_cambiar , media_url + libro.imagen.name)

            libro.save()

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
    elif request.method == 'POST':

        try:
            data = json.loads(request.body)

            Libro.objects.create(
                isbn=data['isbn'],
                titulo=data['titulo'],
                autor=data['autor'],
                descripcion=data['descripcion'],
            )

            #devolvemos un mensaje para confirmar al usuario que su libro ha sido creado
            return JsonResponse({'mensaje': 'libro creado exitosamente'}, status=201)
        
        #capturamos el error para devolverlo en caso de que surja algun problema
        except Exception as e:
            return JsonResponse({'mensaje': 'Ha habido un error con los datos del libro en su creacion', 'error': str(e)})

    elif request.method == 'PUT':
        try:
            data = json.loads(request.body)
            #obtenenmos el libro con el mismo isbn de la base de datos y lo asignamos a una variable para cambiarlo
            libro_a_editar = get_object_or_404(Libro, pk=data['isbn'])

            libro_a_editar.isbn = data['isbn']
            libro_a_editar.titulo = data['titulo']
            libro_a_editar.autor = data['autor']
            libro_a_editar.descripcion = data['descripcion']
            #guardamos los cambios
            libro_a_editar.save()
                
            
            return JsonResponse({'mensaje': 'libro actualizado exitosamente'}, status=201)

        except Exception as e:
            return JsonResponse({'mensaje': 'Ha habido un error con los datos del libro en su modificacion', 'error': str(e)})

    elif request.method == 'DELETE':
        
        data = json.loads(request.body)
        #si no encontramos el objeto levantamos una excepcion
        try:
            libro_a_editar = get_object_or_404(Libro, pk=data['isbn'])
        except:
            return JsonResponse({'mensaje': 'No se ha encontrado ningun libro con ese ISBN'})
        libro_a_editar.delete()
        return JsonResponse({'mensaje': 'libro borrado exitosamente'})


def registrarse(request):

    #comprobamos el metodo de envio si es POST se trata de un formulario ya editado
    if request.method == 'POST':
        form = UsuarioForm(request.POST)
        
        if form.is_valid(): #comprobamos que sea valido

            user = form.save()
            
            return redirect('lista')

    #si la solicitud es get rellenamos el formulario con los datos actuales
    else:
        form = UsuarioForm()
    
    context = {
        'form': form,
    }

    return render(request, 'registrarse.html', context)

def fetch_google_books(request):
    payload = {'q':'flowers+inauthor:keyes','key':'AIzaSyChI0vno7Q7uRcQCkmfJcztkBVKyN416e0'}
    r = requests.get('https://www.googleapis.com/books/v1/volumes', params=payload)

    data = r.json()

    return JsonResponse(data)