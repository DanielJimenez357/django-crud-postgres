import os, json, requests
from os.path import splitext
from django.contrib.auth import authenticate, login
from django.contrib.auth.decorators import login_required
from django.shortcuts import render, redirect, get_object_or_404
from .models import Libro, Repositorio
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from .forms import LibroForm, UsuarioForm
from django.core import serializers
from django.conf import settings
from django.db import IntegrityError
from google import genai

# Create your views here.

def home(request):
    return redirect('libreria')

def detalles(request, id):

    #recogemos el libor identificandolo por la pk que recogemos de la plantilla
    libro = get_object_or_404(Libro, pk=id)

    context= {
        'isbn': libro.isbn,
        'titulo': libro.titulo,
        'autor': libro.autor,
        'descripcion': libro.descripcion,
        'imagen': libro.imagen,
        'opinion': libro.opinion,
        'numero_paginas': libro.numero_paginas,
        'puntuacion': libro.puntuacion
    }

    return render(request, 'detalle.html', context)

def borrar(request, id):

    libro = get_object_or_404(Libro, pk=id)

    try:
        os.remove('./libros/media/' + libro.imagen.name )
    except Exception as e:
        print(e)

    #obtenemos el libro con la pk y lo borramos
    libro.delete()

    #volvemos a redirigir al perfil
    return redirect('perfil')

def nuevoLibro(request):

    #comprobamos el metodo de envio si es POST se trata de un formulario ya editado
    if request.method == 'POST':
        form = LibroForm(request.POST, request.FILES)
        
        if form.is_valid(): #comprobamos que sea valido

            #obtenemos los datos del formulario sin guardarlo en la base de datos
            libro = form.save(commit=False)
            libro.repositorio = request.user.repositorio

            if libro.imagen == None:
                libro.imagen = './libros/media/assets/book_quest_logo2.png'
            #obtenemos la extension del archivo
            extension = splitext(libro.imagen.name)[1]
            #cambiamos el nombre del archivo al titulo del libro
            libro.imagen.name = form.cleaned_data['titulo'] + extension
            libro.save()
            return redirect('libreria')

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

            print(request.POST)
            print(libro.imagen)

            #obtenemos la extension del archivo
            extension = splitext(libro.imagen.name)[1]

            #se activa cuando vayamos a cambiar la imagen que subimos nosotros mismos
            if libro.imagen.name != nombre_imagen:
                try:
                    os.remove('./libros/media/' + nombre_imagen )
                    libro.imagen.save(form.cleaned_data['titulo'] + extension, libro.imagen.file, save=False)
                except Exception as e:
                    print(e)

            elif request.POST['imagen'] != '':
                nombre_a_cambiar = libro.imagen.name
                media_url = './libros/media/'

                #cambiamos el nombre del archivo al titulo del libro
                libro.imagen.name = 'images/' + form.cleaned_data['titulo'] + extension

                try:
                    print(libro.imagen)
                    os.replace(media_url + nombre_a_cambiar , media_url + libro.imagen.name)
                except Exception as e:
                    print(e)

            libro.save()

            form.save() #guardamos y redirigimos
            return redirect('detalles', id)

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

            data = json.loads(request.body)
            try:


                isbn = data['isbn']
                isbn = isbn.split('/')[-1]

                if 'repositorio' in data:
                    repositorio =get_object_or_404(Repositorio, pk=data['repositorio'])
                else:
                    repositorio = request.user.repositorio

                Libro.objects.create(
                    isbn=isbn,
                    titulo=data['titulo'],
                    autor=data['autor'],
                    descripcion=data['descripcion'],
                    repositorio=repositorio,
                    imagen=data['url_imagen'],
                    numero_paginas=data['numero_paginas'],
                )

                #devolvemos un mensaje para confirmar al usuario que su libro ha sido creado
                return JsonResponse({'mensaje': 'libro creado exitosamente'}, status=201)
            
            except IntegrityError:
                return JsonResponse(
                    {'mensaje': 'El libro con ISBN {isbn} ya existe y no puede ser añadido dos veces.'}, 
                    status=409
                )
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

            user = authenticate(username=form.cleaned_data['username'],
                                password=form.cleaned_data['password1'],
                                )
            login(request, user)
            
            return redirect('libreria')

    #si la solicitud es get rellenamos el formulario con los datos actuales
    else:
        form = UsuarioForm()
    
    context = {
        'form': form,
    }

    return render(request, 'registrarse.html', context)

@csrf_exempt
def fetch_API(request):
    data = json.loads(request.body)


    payload = {'q': data['query']}
    print(data)
    r = requests.get('https://openlibrary.org/search.json', params=payload)
    print(payload)
    print(r)

    data = r.json()

    return JsonResponse(data)


def libreria(request):

    return render(request, 'libreria.html')

@login_required
def perfil(request):

    usuario = request.user

    repositorio = usuario.repositorio

    libros_repositorio = repositorio.libro_set.all().order_by()


    libros_corregidos = []

    paginas_totales = 0

    for libro in libros_repositorio:
        if "http" in str(libro.imagen):
            libros_corregidos.append(libro)
        else:
            libro.imagen = settings.MEDIA_URL + str(libro.imagen)
            libros_corregidos.append(libro)
        paginas_totales += libro.numero_paginas



    context = {
        'repositorio': libros_corregidos,
        'numero_paginas': paginas_totales
    }

    return render(request, 'perfil.html', context)

@login_required
def pagina_recomendacion(request):

    usuario = request.user

    repositorio = usuario.repositorio

    libros_repositorio = repositorio.libro_set.all().order_by()

    libros = Libro.objects.all()

    return render(request, 'recomendaciones.html', {"repositorio": libros_repositorio})

@csrf_exempt
def recomendacion_ia(request):
    data = json.loads(request.body)

    libros_recomendar = data.get('query', [])

    libros_recomendar_string = ",".join(libros_recomendar)

    client = genai.Client()

    promt = f"Usando estos libros como base: {libros_recomendar_string}, monstrando solo el titulo en ingles, de SOLO tres libros muy parecidos a los que he pasado, y que existan, para leer a continuacion, no digas nada mas, siguiend el formato: 'titulo1','titulo2','titulo3'"

    print(data)

    response = client.models.generate_content(
        model="gemini-2.5-flash", contents=promt
    )

    response_adaptada = response.text.split(",")

    print (response.text)
    print (response_adaptada)
    respuesta_final = []

    for titulo in response_adaptada:
        payload = {'q': titulo}
        r = requests.get('https://openlibrary.org/search.json', params=payload)
        print(payload)
        try:
            r_objecto = r.json()
            print(r_objecto)
            respuesta_final.append(r_objecto["docs"][0])
            r_lista = {
                "docs": respuesta_final
            }
        except Exception as e:
            print(e)
            

    return JsonResponse(r_lista, safe=False)