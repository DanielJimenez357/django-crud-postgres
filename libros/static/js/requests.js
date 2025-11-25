/**
 * funcion fetch que pide libros segun el nombre al backend
 */
export async function getData(libros_seleccionados) {
  let query = document.querySelector(".busqueda")?.value ?? ''
  let url = window.url.home + 'fetch/';
  if (query == '' ){
    url = window.url.home + 'api_recomendacion/';
    query = libros_seleccionados
  }
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


export default {getData}