import { database } from './database.js';

// Índice actual dentro de la base de datos local
let currentIndex = 0;

// Referencias a los elementos del DOM (Asegúrate de ajustar los IDs según tu HTML)
const imgPortada = document.querySelector('#portada'); // o el tag <img> correspondiente
const inputTitulo = document.querySelector('#titulo');
const inputAutor = document.querySelector('#autor');
const inputFecha = document.querySelector('#fecha'); // O 'año'
const inputIsbn = document.querySelector('#isbn');

const btnAnterior = document.querySelector('#btnAnterior'); // Botón <<
const btnSiguiente = document.querySelector('#btnSiguiente'); // Botón >>
const btnBuscar = document.querySelector('#btnBuscar'); // Botón Buscar

// Base URL para imágenes de Open Library
const BASE_IMG_URL = 'https://covers.openlibrary.org/b/id/';

// 1. Función para renderizar los datos en la interfaz
function mostrarLibro(libro) {
  inputTitulo.value = libro.titulo || '';
  inputAutor.value = libro.autor || '';
  inputFecha.value = libro.fecha || '';
  inputIsbn.value = libro.isbn || '';

  // Manejar la imagen de portada
  if (libro.filename) {
    // Si la imagen proviene del JSON local
    imgPortada.src = `${BASE_IMG_URL}${libro.filename}`;
  } else if (libro.coverUrl) {
    // Si viene directamente de una llamada externa
    imgPortada.src = libro.coverUrl;
  } else {
    imgPortada.src = '';
  }
}

// 2. Navegación local con botones << y >>
btnAnterior.addEventListener('click', () => {
  if (currentIndex > 0) {
    currentIndex--;
    mostrarLibro(database[currentIndex]);
  }
});

btnSiguiente.addEventListener('click', () => {
  if (currentIndex < database.length - 1) {
    currentIndex++;
    mostrarLibro(database[currentIndex]);
  }
});

// 3. Búsqueda externa usando Promesas y Fetch (API Open Library)
btnBuscar.addEventListener('click', () => {
  const isbn = inputIsbn.value.trim();
  if (!isbn) return;

  const url = `https://openlibrary.org/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;

  fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Error al consultar la API');
      }
      return response.json();
    })
    .then(data => {
      const bookKey = `ISBN:${isbn}`;
      if (data && data[bookKey]) {
        const bookData = data[bookKey];

        // Mapear el autor (si existen varios, tomamos el primero)
        const autorNombre = bookData.authors && bookData.authors.length > 0 
          ? bookData.authors[0].name 
          : 'Desconocido';

        // Mapear la imagen: transformar el tamaño de -S.jpg a -M.jpg
        let coverUrl = '';
        if (bookData.cover && bookData.cover.medium) {
          coverUrl = bookData.cover.medium;
        } else if (bookData.cover && bookData.cover.small) {
          coverUrl = bookData.cover.small.replace('-S.jpg', '-M.jpg');
        }

        const libroBuscado = {
          titulo: bookData.title || '',
          autor: autorNombre,
          fecha: bookData.publish_date || '',
          isbn: isbn,
          coverUrl: coverUrl
        };

        mostrarLibro(libroBuscado);
      } else {
        alert('No se encontró ningún libro con ese ISBN.');
      }
    })
    .catch(error => {
      console.error('Error durante la búsqueda:', error);
    });
});

// Cargar el primer libro por defecto al iniciar
mostrarLibro(database[currentIndex]);
