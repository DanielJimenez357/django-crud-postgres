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
function crear_libro_DOM(titulo_libro, elemento_dom, id, imagen="nada", autor, descripcion) {
  const div_hijo = document.createElement("div")
  const titulo = document.createElement("h5")
  const boton_post = document.createElement("button")
  const imagen_libro = document.createElement("img")

  div_hijo.classList.add("libreria__lista__libro")
  titulo.textContent = titulo_libro
  imagen_libro.src = imagen
  boton_post.innerHTML = "Añadir"
  boton_post.addEventListener('click', () => anadir_libro(id, titulo_libro, autor, descripcion, imagen))
  div_hijo.appendChild(imagen_libro)
  div_hijo.appendChild(titulo)
  div_hijo.appendChild(boton_post)

  elemento_dom.appendChild(div_hijo)

}

/**
 * añade todos los libros a un elemento padre común
 */
async function lista_libros_DOM(){
  const div_padre = document.querySelector(".libreria__lista")
  div_padre.innerHTML = ''
  const data = await getData()

  for (let item of data.items) {
    console.log(item)
    crear_libro_DOM(
        item.volumeInfo.title,
        div_padre,
        item.volumeInfo.industryIdentifiers[0].identifier,
        item.volumeInfo.imageLinks.thumbnail,
        item.volumeInfo.authors[0],
        item.volumeInfo.description,
      )
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
async function anadir_libro(id, titulo_libro, autor, descripcion, url_imagen) {
  const url = window.url.home + 'lista/api/'
  fetch(url, {
  method: "POST",
  body: JSON.stringify({
    isbn: id,
    titulo: titulo_libro,
    autor: autor,
    descripcion: descripcion,
    url_imagen: url_imagen,
  }),
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
  });

}