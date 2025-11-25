import {check_paginas} from "./functions.js"
import { anadir_libro } from "./functions.js"
/**
 * crea el cuerpo dom para cada libro representado
 * @param {string} titulo_libro 
 * @param {dom_element} elemento_dom 
 */
export function crear_libro_DOM(titulo_libro, elemento_dom, imagen="nada", autor, cover_id, lending_id, key) {
  const div_hijo = document.createElement("div")
  const div_padre = document.createElement("div")
  const titulo = document.createElement("h5")
  const boton_post = document.createElement("a")
  const imagen_libro = document.createElement("img")
  const libro_body = document.createElement("div")
  const libro_imagen = document.createElement("div")
  const libro_body_texto = document.createElement("div")
  const loader = document.createElement("span")

  let loggeado_check = document.getElementById("inicio_sesion_usuario")

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

    if (loggeado_check === false) {
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



export function notificacion(titulo, duplicado){
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


export default {notificacion, crear_libro_DOM}