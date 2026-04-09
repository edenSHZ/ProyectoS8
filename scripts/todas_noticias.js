// Base de datos de noticias (misma que en noticia.js)
const noticiasDB = {
    'noticia-1': {
        titulo: 'Ceremonia de Inauguración del Ciclo Escolar 2026',
        fecha: '15 de Abril, 2026',
        categoria: 'Evento',
        imagen: 'img&log/Admisiones.jpg',
        descripcion: 'El Instituto Francés de Ciencias celebró con gran éxito la ceremonia de inauguración del ciclo escolar 2026, contando con la presencia de autoridades educativas, docentes y estudiantes.'
    },
    'noticia-2': {
        titulo: 'Inscripciones Abiertas: Cursos de Verano',
        fecha: '10 de Abril, 2026',
        categoria: 'Cursos',
        imagen: 'img&log/curso verano.jpg',
        descripcion: 'Ya están abiertas las inscripciones para los cursos de verano 2026 en el Instituto Francés de Ciencias. Una oportunidad única para reforzar conocimientos.'
    },
    'noticia-3': {
        titulo: 'Convocatoria de Becas 2026',
        fecha: '5 de Abril, 2026',
        categoria: 'Convocatoria',
        imagen: 'img&log/constancias.jpg',
        descripcion: 'El Instituto Francés de Ciencias abre la convocatoria para el programa de becas correspondiente al ciclo escolar 2026-2027.'
    },
    'noticia-4': {
        titulo: 'Feria Educativa 2026',
        fecha: '28 de Marzo, 2026',
        categoria: 'Evento',
        imagen: 'img&log/fechas.jpg',
        descripcion: 'Te invitamos a nuestra Feria Educativa 2026, donde podrás conocer toda nuestra oferta académica, talleres y actividades.'
    },
    'noticia-5': {
        titulo: 'Taller de Orientación Vocacional',
        fecha: '20 de Marzo, 2026',
        categoria: 'Taller',
        imagen: 'img&log/verano-est.jpg',
        descripcion: 'Taller gratuito de orientación vocacional para estudiantes de preparatoria que estén por elegir su carrera universitaria.'
    },
    'noticia-6': {
        titulo: 'Taller de Orientación Vocacional',
        fecha: '20 de Marzo, 2026',
        categoria: 'Taller',
        imagen: 'img&log/verano-est.jpg',
        descripcion: 'Taller gratuito de orientación vocacional para estudiantes de preparatoria que estén por elegir su carrera universitaria.'
    },
    'noticia-7': {
        titulo: 'Taller de Orientación Vocacional',
        fecha: '20 de Marzo, 2026',
        categoria: 'Taller',
        imagen: 'img&log/verano-est.jpg',
        descripcion: 'Taller gratuito de orientación vocacional para estudiantes de preparatoria que estén por elegir su carrera universitaria.'
    },
    'noticia-8': {
        titulo: 'Taller de Orientación Vocacional',
        fecha: '20 de Marzo, 2026',
        categoria: 'Taller',
        imagen: 'img&log/verano-est.jpg',
        descripcion: 'Taller gratuito de orientación vocacional para estudiantes de preparatoria que estén por elegir su carrera universitaria.'
    }
};

// Función para cargar todas las noticias
function cargarTodasNoticias() {
    const grid = document.getElementById('todasNoticiasGrid');

    if (!grid) return;

    let html = '';

    for (const [id, noticia] of Object.entries(noticiasDB)) {
        html += `
            <article class="noticia-card" data-id="${id}">
                <div class="noticia-imagen">
                    <img src="${noticia.imagen}" alt="${noticia.titulo}">
                    <span class="categoria">${noticia.categoria}</span>
                </div>
                <div class="noticia-contenido">
                    <span class="fecha">${noticia.fecha}</span>
                    <h3>${noticia.titulo}</h3>
                    <p>${noticia.descripcion.substring(0, 120)}...</p>
                    <a href="noticia_detalle.html?id=${id}" class="leer-mas">Leer más →</a>
                </div>
            </article>
        `;
    }

    grid.innerHTML = html;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarTodasNoticias);