
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
    console.log(result)
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
      
    const respuesta = await check_paginas(cover_id, lending_id, key)

    if (!respuesta.description) {
      respuesta['description'] = {"value": "Sin descripcion"}
    }

    let paginas = respuesta.number_of_pages || 0


    console.log(respuesta)

    if (respuesta.isbn_13[0]){
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
  const url = window.url.home + 'lista/api/'
    fetch(url, {
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
  }


function calculo_tiempo_lectura () {
  let paginas = document.querySelector(".numero_paginas").innerHTML
  let tiempo = document.querySelector(".tiempo_lectura")

  tiempo.innerHTML = (parseInt(paginas) / 20) + " h"
}
calculo_tiempo_lectura()