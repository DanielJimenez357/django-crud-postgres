
try{
  document.querySelector(".lupa_busqueda").addEventListener("click", ()=>{lista_libros_DOM()})
  let barra_busqueda = document.querySelector(".busqueda")
  barra_busqueda.addEventListener("keypress", (event)=>{
    if (event.key === "Enter"){
      event.preventDefault()
      lista_libros_DOM()
    }
  })
}
catch (e){
  console.log("No es apartado de busqueda")
}


/**
 * funcion fetch que pide libros segun el nombre al backend
 */
async function getData() {
  const query = document.querySelector(".busqueda").value
  const url = window.url.home + 'fetch/';
  try {
    const response = await fetch(url , {
      method: "POST",
      body: JSON.stringify({
        query: query
      })
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return(result);
  } catch (error) {
    console.error(error.message);
  }
}

/**
 * crea el cuerpo dom para cada libro representado
 * @param {string} titulo_libro 
 * @param {dom_element} elemento_dom 
 */
function crear_libro_DOM(titulo_libro, elemento_dom, imagen="nada", autor, cover_id, lending_id, key) {
  const div_hijo = document.createElement("div")
  const div_padre = document.createElement("div")
  const titulo = document.createElement("h5")
  const boton_post = document.createElement("a")
  const imagen_libro = document.createElement("img")
  const libro_body = document.createElement("div")
  const libro_imagen = document.createElement("div")
  const libro_body_texto = document.createElement("div")
  const loader = document.createElement("span")

  let loggeado_check = document.querySelector(".nombre_usuario")

  libro_body_texto.classList.add("libro__body__texto")
  libro_imagen.classList.add("libro__imagen")
  libro_body.classList.add("libro__body", "card-body")
  div_hijo.classList.add("lista__libro", "libreria__lista__libro", "card")
  boton_post.classList.add("btn", "btn-success", "libro_detalles_boton")
  div_hijo.classList.add("oculto")
  loader.classList.add("loader")
  div_padre.classList.add("div_padre")
  
  libro_body_texto.appendChild(titulo)
  libro_imagen.appendChild(imagen_libro)
  libro_body.appendChild(libro_body_texto)
  libro_body.appendChild(boton_post)
  div_hijo.appendChild(libro_imagen)

  titulo.textContent = titulo_libro
  imagen_libro.src = imagen
  boton_post.innerHTML = "Añadir"

  
  boton_post.addEventListener('click', async () => {

    if (loggeado_check === null) {
      const target_url = document.querySelector(".contenedor__libreria").getAttribute('data-target-url')
      window.location.href = target_url
      return
    }
      
    const respuesta = await check_paginas(cover_id, lending_id, key)

    if (!respuesta.description) {
      respuesta['description'] = {"value": "Sin descripcion"}
    }

    let paginas = respuesta.number_of_pages || 0

      if ('isbn_13' in respuesta){
        await anadir_libro(respuesta.isbn_13[0], titulo_libro, autor, respuesta.description.value, imagen, paginas)
      }
      else{
        await anadir_libro(respuesta.key, titulo_libro, autor, respuesta.description.value, imagen, paginas)
      }
  

  })

  imagen_libro.addEventListener("load", () =>{

    div_hijo.classList.add("libro_animacion")

    div_hijo.classList.remove("oculto")

    loader.classList.remove("loader")
  })

  div_hijo.appendChild(libro_body)

  div_padre.appendChild(loader)
  div_padre.appendChild(div_hijo)


  elemento_dom.appendChild(div_padre)


}

async function check_paginas (cover_id=false, lending_id=false, key) {

  let response
  let url
  let data

  if (!cover_id && !lending_id) {

    url = "https://openlibrary.org" + key + "/editions.json"
  
    response = await fetch(url , { method: "GET" });

    data = await response.json()

    return data.entries[0]

  }

  if (cover_id) {

    url = "https://openlibrary.org/books/" + cover_id + ".json"

    response = await fetch(url , { method: "GET" });

    data = await response.json()

    return data

  }

  if (lending_id) {

    url = "https://openlibrary.org/books/" + lending_id + ".json"

    response = await fetch(url , { method: "GET" });

    data = await response.json()

    return data


  }
}

function notificacion(titulo, duplicado){
  const lista_notificaciones = document.querySelector(".lista_notificaciones")
  const notificacion = document.createElement("div")
  const titulo_dom = document.createElement("span")
  const contenido_notificacion = document.createElement("span")
  const cuenta_atras = document.createElement("span")
  const anadido = document.createElement("span")

  notificacion.classList.add("notificacion_anadir")
  contenido_notificacion.classList.add("contenido")
  cuenta_atras.classList.add("cuenta_atras")
  titulo_dom.innerHTML = titulo

  anadido.innerHTML = " ha sido añadido a la coleccion"
  if (duplicado){
    anadido.innerHTML = " ya ha sido anadido a la coleccion"
    cuenta_atras.style.backgroundColor = "red"
  }

  titulo_dom.style.fontWeight = "bolder"

  contenido_notificacion.appendChild(titulo_dom)
  contenido_notificacion.appendChild(anadido)


  notificacion.appendChild(contenido_notificacion)
  notificacion.appendChild(cuenta_atras)
  lista_notificaciones.appendChild(notificacion)

  notificacion.classList.add("notificacion_anadir_visible")
  cuenta_atras.classList.add("cuenta_atras_animacion")

  setTimeout(()=>{
    notificacion.classList.remove("notificacion_anadir_visible")
  }, 3000)
  setTimeout(()=>{
    cuenta_atras.classList.remove("cuenta_atras_animacion")
    lista_notificaciones.removeChild(notificacion)
  }, 3200)
}




/**
 * añade todos los libros a un elemento padre común
 */
async function lista_libros_DOM(){
  const div_padre = document.querySelector(".libreria__lista")
  div_padre.innerHTML = ''
  const data = await getData()

  for (let item of data.docs) {
    try{
      if (item.cover_i){
        crear_libro_DOM(
            item.title,
            div_padre,
            "https://covers.openlibrary.org/b/id/" + item.cover_i + ".jpg",
            item.author_name[0],
            item.cover_edition_key,
            item.lending_edition_s,
            item.key
          )
      }
      else {
        crear_libro_DOM(
            item.title,
            div_padre,
            "../media/assets/no_image.png",
            item.author_name[0],
            item.cover_edition_key,
            item.lending_edition_s,
            item.key
          )
      }
    }
    catch(e){
      console.log("Algo ha salido mal con los datos del libro: " + e )
    }
  }
}

/**
 * Recoge los datos del libro para hacer una consulta POST y crear el libro en tu repositorio
 * @param {int} id 
 * @param {string} titulo_libro 
 * @param {string} autor 
 * @param {string} descripcion 
 * @param {string} url_imagen 
 */
async function anadir_libro(id, titulo_libro, autor, descripcion, url_imagen, num_paginas) {
  let duplicado = false
  const url = window.url.home + 'lista/api/'

  try{
    const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      isbn: id,
      titulo: titulo_libro,
      autor: autor,
      descripcion: descripcion,
      url_imagen: url_imagen,
      numero_paginas: num_paginas,
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
    });

      if (response.ok){
        notificacion(titulo_libro, duplicado)
      }
      if (response.status === 409){
        duplicado = true
        notificacion(titulo_libro, duplicado )
      }
  }
  catch{
    console.log("Ha slido mal")
  }
  }


function calculo_tiempo_lectura () {
  try {
    let paginas = document.querySelector(".numero_paginas").innerHTML
    let tiempo = document.querySelector(".tiempo_lectura")
  
    tiempo.innerHTML = (parseInt(paginas) / 20) + " h"
  }
  catch(e){
    console.log(e)
  }
}
calculo_tiempo_lectura()


function seleccionar () {

  let coleccion = document.querySelector(".libreria__lista")

  for (const elemento of coleccion.children) {
    let boton_seleccionar = elemento.querySelector(".boton__seleccionar")

    boton_seleccionar.addEventListener("click", ()=>{
      if (elemento.classList.contains("seleccionado")){
        elemento.classList.remove("seleccionado")
      }
      else{
        elemento.classList.add("seleccionado")
      }

    })

  }

}

async function obtener_libros_seleccionados (){

  let libros_seleccionados = []

  let coleccion = document.querySelector(".libreria__lista")

  for (const elemento of coleccion.children){
    if (elemento.classList.contains("seleccionado")){
      libros_seleccionados.push(elemento.querySelector("h5").innerHTML)
    }
  }
  await llamada_api_recomendacion(libros_seleccionados)
}




async function llamada_api_recomendacion(libros_seleccionados){
  const url = window.url.home + 'api_recomendacion/';
  try {
    const response = await fetch(url , {
      method: "POST",
      body: JSON.stringify({
        query: libros_seleccionados
      })
    });
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error(error.message);
  }
}

seleccionar()