// Base de datos de noticias
const noticiasDB = {
    'noticia-1': {
        titulo: 'Cermonia de Inauguración del Ciclo Escolar 2026',
        fecha: '15 de Abril, 2026',
        categoria: 'Evento',
        imagen: 'img&log/Admisiones.jpg',
        descripcion: `
            <p>El Instituto Francés de Ciencias celebró con gran éxito la ceremonia de inauguración del ciclo escolar 2026, contando con la presencia de autoridades educativas, docentes y estudiantes.</p>

            <h2>Un nuevo ciclo lleno de oportunidades</h2>
            <p>Durante el evento, el rector del instituto destacó los logros alcanzados durante el año anterior y presentó las nuevas metas para este ciclo académico. Se anunciaron nuevas alianzas educativas con instituciones internacionales.</p>

            <p>Los asistentes disfrutaron de una ceremonia llena de cultura y tradición, con presentaciones musicales y artísticas a cargo de los propios estudiantes del instituto.</p>

            <h3>Próximas actividades</h3>
            <p>Se invita a toda la comunidad estudiantil a participar en las actividades extracurriculares que se llevarán a cabo durante el mes de mayo, incluyendo talleres deportivos, culturales y académicos.</p>
        `
    },
    'noticia-2': {
        titulo: 'Inscripciones Abiertas: Cursos de Verano 2026',
        fecha: '10 de Abril, 2026',
        categoria: 'Cursos',
        imagen: 'img&log/curso verano.jpg',
        descripcion: `
            <p>Ya están abiertas las inscripciones para los cursos de verano 2026 en el Instituto Francés de Ciencias. Una oportunidad única para reforzar conocimientos y aprender nuevas habilidades.</p>

            <h2>Oferta de cursos disponibles</h2>
            <p>Los cursos de verano incluyen opciones como: Inglés intensivo, Francés para principiantes, Robótica, Programación, Matemáticas avanzadas y Taller de habilidades socioemocionales.</p>

            <h3>Fechas importantes</h3>
            <ul>
                <li><strong>Inscripciones:</strong> Del 15 de abril al 30 de mayo</li>
                <li><strong>Inicio de cursos:</strong> 10 de junio</li>
                <li><strong>Duración:</strong> 6 semanas</li>
                <li><strong>Horario:</strong> 9:00 AM - 1:00 PM</li>
            </ul>

            <p>No pierdas la oportunidad de aprovechar al máximo tus vacaciones. Para más información, acude a nuestras oficinas o contáctanos por teléfono.</p>
        `
    },
    'noticia-3': {
        titulo: 'Convocatoria de Becas 2026-2027',
        fecha: '5 de Abril, 2026',
        categoria: 'Convocatoria',
        imagen: 'img&log/constancias.jpg',
        descripcion: `
            <p>El Instituto Francés de Ciencias abre la convocatoria para el programa de becas correspondiente al ciclo escolar 2026-2027, dirigido a estudiantes con excelencia académica y situación socioeconómica vulnerable.</p>

            <h2>Tipos de becas</h2>
            <ul>
                <li><strong>Beca por excelencia académica:</strong> 50% de descuento</li>
                <li><strong>Beca socioeconómica:</strong> Hasta 70% de descuento</li>
                <li><strong>Beca deportiva:</strong> 40% de descuento</li>
                <li><strong>Beca cultural:</strong> 40% de descuento</li>
            </ul>

            <h3>Requisitos</h3>
            <ul>
                <li>Promedio mínimo de 8.5 (para beca académica)</li>
                <li>Estudio socioeconómico (para beca socioeconómica)</li>
                <li>Carta de motivación</li>
                <li>Documentación completa</li>
            </ul>

            <p>El registro estará abierto del 20 de abril al 30 de mayo. Los resultados se publicarán el 15 de junio.</p>
        `
    },

    'noticia-4': {
        titulo: 'Convocatoria de Becas 2026-2027',
        fecha: '5 de Abril, 2026',
        categoria: 'Evento',
        imagen: 'img&log/fechas.jpg',
        descripcion: `
            <p>El Instituto Francés de Ciencias abre la convocatoria para el programa de becas correspondiente al ciclo escolar 2026-2027, dirigido a estudiantes con excelencia académica y situación socioeconómica vulnerable.</p>

            <h2>Tipos de becas</h2>
            <ul>
                <li><strong>Beca por excelencia académica:</strong> 50% de descuento</li>
                <li><strong>Beca socioeconómica:</strong> Hasta 70% de descuento</li>
                <li><strong>Beca deportiva:</strong> 40% de descuento</li>
                <li><strong>Beca cultural:</strong> 40% de descuento</li>
            </ul>

            <h3>Requisitos</h3>
            <ul>
                <li>Promedio mínimo de 8.5 (para beca académica)</li>
                <li>Estudio socioeconómico (para beca socioeconómica)</li>
                <li>Carta de motivación</li>
                <li>Documentación completa</li>
            </ul>

            <p>El registro estará abierto del 20 de abril al 30 de mayo. Los resultados se publicarán el 15 de junio.</p>
        `
    },

    'noticia-5': {
        titulo: 'Convocatoria de Becas 2026-2027',
        fecha: '5 de Abril, 2026',
        categoria: 'Taller',
        imagen: 'img&log/verano-est.jpg',
        descripcion: `
            <p>El Instituto Francés de Ciencias abre la convocatoria para el programa de becas correspondiente al ciclo escolar 2026-2027, dirigido a estudiantes con excelencia académica y situación socioeconómica vulnerable.</p>

            <h2>Tipos de becas</h2>
            <ul>
                <li><strong>Beca por excelencia académica:</strong> 50% de descuento</li>
                <li><strong>Beca socioeconómica:</strong> Hasta 70% de descuento</li>
                <li><strong>Beca deportiva:</strong> 40% de descuento</li>
                <li><strong>Beca cultural:</strong> 40% de descuento</li>
            </ul>

            <h3>Requisitos</h3>
            <ul>
                <li>Promedio mínimo de 8.5 (para beca académica)</li>
                <li>Estudio socioeconómico (para beca socioeconómica)</li>
                <li>Carta de motivación</li>
                <li>Documentación completa</li>
            </ul>

            <p>El registro estará abierto del 20 de abril al 30 de mayo. Los resultados se publicarán el 15 de junio.</p>
        `
    }
};

// Obtener el ID de la noticia desde la URL
function obtenerIdNoticia() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Cargar los datos de la noticia en la página
function cargarNoticia() {
    const noticiaId = obtenerIdNoticia();

    if (!noticiaId || !noticiasDB[noticiaId]) {
        // Si no hay ID o no existe, redirigir al inicio
        window.location.href = 'index.html';
        return;
    }

    const noticia = noticiasDB[noticiaId];

    // Actualizar título de la página
    document.title = `${noticia.titulo} - Instituto Francés de Ciencias`;

    // Actualizar elementos de la página
    const imagenElem = document.getElementById('detalle-imagen');
    const fechaElem = document.getElementById('detalle-fecha');
    const categoriaElem = document.getElementById('detalle-categoria');
    const tituloElem = document.getElementById('detalle-titulo');
    const descripcionElem = document.getElementById('detalle-descripcion');

    if (imagenElem) imagenElem.src = noticia.imagen;
    if (fechaElem) fechaElem.textContent = noticia.fecha;
    if (categoriaElem) categoriaElem.textContent = noticia.categoria;
    if (tituloElem) tituloElem.textContent = noticia.titulo;
    if (descripcionElem) descripcionElem.innerHTML = noticia.descripcion;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarNoticia);