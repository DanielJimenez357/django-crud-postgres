async function getData() {
  const url = window.url.home + 'fetch/';
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    const result = await response.json();
    return(result);
  } catch (error) {
    console.error(error.message);
  }
}


function crear_libro_DOM(titulo_libro, elemento_dom) {

  const titulo = document.createElement("h3")
  titulo.textContent = titulo_libro
  elemento_dom.appendChild(titulo)
}


async function lista_libros_DOM(){
  const div_padre = document.querySelector(".lista_libros")
  const data = await getData()

  for (let item of data.items) {
    crear_libro_DOM(item.volumeInfo.title, div_padre)
  }
}