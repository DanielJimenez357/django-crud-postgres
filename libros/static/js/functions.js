import {getData} from "./requests.js"
import {notificacion, crear_libro_DOM} from "./funciones_DOM.js"



try{
  document.querySelector(".lupa__busqueda").addEventListener("click", ()=>{lista_libros_DOM()})
  let barra_busqueda = document.querySelector(".busqueda")
  document.querySelector(".icono__borrar").addEventListener("click", ()=>{barra_busqueda.value  = "" })
  barra_busqueda.addEventListener("keypress", (event)=>{
    if (event.key === "Enter"){
      event.preventDefault()
      lista_libros_DOM()
    }
  })
}
catch (e){
  console.log(e)
}

export async function check_paginas (cover_id=false, lending_id=false, key) {

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
async function lista_libros_DOM(libros_seleccionados=false){
  let data
  let div_padre
  
  if (libros_seleccionados==false){
    div_padre = document.querySelector(".libreria__lista")
    div_padre.innerHTML = ''
    let loader = document.createElement("div")
    loader.classList.add("loader__recomendacion")
    div_padre.appendChild(loader)
    data = await getData()
  }
  else {
    div_padre = document.querySelector(".recomendaciones__libros")
    div_padre.innerHTML = ''
    let loader = document.createElement("div")
    loader.classList.add("loader__recomendacion")
    div_padre.appendChild(loader)
    data = await getData(libros_seleccionados)
  }

    div_padre.innerHTML = ''

  if (data.numFound == 0) {
    div_padre.innerHTML = '¡Vaya! no hemos podidos encontrar resultados para tu busqueda...'
  }


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
export async function anadir_libro(id, titulo_libro, autor, descripcion, url_imagen, num_paginas) {
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
    console.log("Ha salido mal")
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

    boton_seleccionar.addEventListener("click", (e)=>{
      e.stopPropagation()
      elemento.classList.toggle("seleccionado")
    })

    elemento.addEventListener("click", ()=>{
      elemento.classList.toggle("seleccionado")
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
  await lista_libros_DOM(libros_seleccionados)
}

seleccionar()

document.querySelector(".boton__buscar__seleccionados").addEventListener("click", ()=>{
  obtener_libros_seleccionados()
})

export default {check_paginas, anadir_libro}