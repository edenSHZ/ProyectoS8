// ==========================================
// ESCAPE XSS
// ==========================================
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g,  '&amp;')
        .replace(/</g,  '&lt;')
        .replace(/>/g,  '&gt;')
        .replace(/"/g,  '&quot;')
        .replace(/'/g,  '&#039;')
        .replace(/\//g, '&#x2F;');
}

// ==========================================
// REFERENCIAS A MODALES
// ==========================================
const modalCurso      = document.getElementById('modal-curso');
const modalServicio   = document.getElementById('modal-servicio');
const modalEstudiante = document.getElementById('modal-estudiante');

// Campos del modal de servicio
const modalServicioTitulo        = document.getElementById('modal-servicio-titulo');
const modalServicioPrecio        = document.getElementById('modal-servicio-precio');
const modalServicioDuracion      = document.getElementById('modal-servicio-duracion');
const modalServicioModalidad     = document.getElementById('modal-servicio-modalidad');
const modalServicioCertificacion = document.getElementById('modal-servicio-certificacion');
const modalServicioDescripcion   = document.getElementById('modal-servicio-descripcion');

// Campos del modal de estudiante
const modalEstudianteImg         = document.getElementById('modal-estudiante-img');
const modalEstudianteTitulo      = document.getElementById('modal-estudiante-titulo');
const modalEstudianteDuracion    = document.getElementById('modal-estudiante-duracion');
const modalEstudianteModalidad   = document.getElementById('modal-estudiante-modalidad');
const modalEstudianteHorario     = document.getElementById('modal-estudiante-horario');
const modalEstudianteRequisitos  = document.getElementById('modal-estudiante-requisitos');
const modalEstudianteIncluye     = document.getElementById('modal-estudiante-incluye');
const modalEstudianteDescripcion = document.getElementById('modal-estudiante-descripcion');

// ==========================================
// SERVICIOS DEL INDEX — datos desde la BD
// ==========================================

const UPLOADS_CURSOS = 'admin/uploads/cursos/';
const IMG_DEFAULT    = 'img/optimizado/logo-ifc-1x.webp';

// Almacena los cursos cargados para usarlos al abrir el modal
let serviciosCargados = [];

function cargarServiciosIndex() {
    const track = document.querySelector('.carrusel-track');
    if (!track) return; // solo corre en páginas que tienen el carrusel

    fetch('config/obtener_servicios_publico.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.json())
    .then(cursos => {
        if (!Array.isArray(cursos) || cursos.length === 0) return;

        serviciosCargados = cursos;

        // Actualizar las cards del carrusel con datos reales de la BD
        const cards = track.querySelectorAll('.servicio-card');
        cursos.forEach((curso, index) => {
            const card = cards[index];
            if (!card) return;

            // ✅ textContent — nunca interpreta HTML
            const h3 = card.querySelector('h3');
            if (h3) h3.textContent = curso.nombre;

            // Después
const desc = card.querySelector('p:not(.duracion-requisitos)');
if (desc) desc.textContent = curso.descripcion || 'Información disponible próximamente.';

const precioDuracion = card.querySelector('.duracion-requisitos');
if (precioDuracion) {
    precioDuracion.innerHTML = '';

    if (curso.duracion) {
        const dur = document.createElement('span');
        dur.innerHTML = '<strong>Duración:</strong> ';
        dur.appendChild(document.createTextNode(curso.duracion));
        precioDuracion.appendChild(dur);
        precioDuracion.appendChild(document.createElement('br'));
    }

    if (curso.requisitos) {
        const req = document.createElement('span');
        req.innerHTML = '<strong>Requisitos:</strong> ';
        req.appendChild(document.createTextNode(curso.requisitos));
        precioDuracion.appendChild(req);
    }
}

            // Guardar el id en el dataset para identificarlo al abrir el modal
            card.dataset.idCurso = curso.id_curso;
        });
    })
    .catch(() => {
        console.warn('No se pudieron cargar los servicios desde la BD.');
    });
}

// Abrir modal de servicio con datos reales de la BD
function abrirModalServicio(idCurso) {
    const curso = serviciosCargados.find(c => c.id_curso === parseInt(idCurso));
    if (!curso || !modalServicio) return;

    // ✅ textContent — nunca interpreta HTML
    if (modalServicioTitulo)        modalServicioTitulo.textContent        = curso.nombre;
    if (modalServicioPrecio)        modalServicioPrecio.textContent        = 'Consultar';
    if (modalServicioDuracion)      modalServicioDuracion.textContent      = curso.duracion    || 'Consultar';
    if (modalServicioModalidad)     modalServicioModalidad.textContent     = curso.horario     || 'Consultar';
    if (modalServicioCertificacion) modalServicioCertificacion.textContent = curso.requisitos  || 'Consultar';
    if (modalServicioDescripcion)   modalServicioDescripcion.textContent   = curso.descripcion || 'Información disponible próximamente.';

    modalServicio.style.display = 'flex';
}

// ==========================================
// MODAL ESTUDIANTES
// ==========================================
const estudiantesData = {
    'Cursos de Verano': {
        duracion: '6 semanas',
        modalidad: 'Presencial',
        horario: 'Lunes a Viernes 9am-1pm',
        requisitos: 'Ninguno',
        incluye: 'Material didáctico, constancia de participación',
        descripcion: 'Actividades recreativas y académicas durante el periodo vacacional.'
    },
    'Cursos de Regularización': {
        duracion: '2 meses',
        modalidad: 'Particular / En línea',
        horario: 'Horario a convenir',
        requisitos: 'Nivel escolar correspondiente',
        incluye: 'Material de apoyo, evaluación diagnóstica',
        descripcion: 'Clases personalizadas para reforzar conocimientos. Grupos reducidos.'
    }
};

function abrirModalEstudiante(titulo, imgSrc) {
    const datos = estudiantesData[titulo] || {
        duracion: 'Consultar', modalidad: 'Consultar', horario: 'Consultar',
        requisitos: 'Consultar', incluye: 'Consultar',
        descripcion: 'Información disponible próximamente.'
    };

    if (modalEstudianteImg)         modalEstudianteImg.src                  = imgSrc;
    if (modalEstudianteTitulo)      modalEstudianteTitulo.textContent        = titulo;
    if (modalEstudianteDuracion)    modalEstudianteDuracion.textContent      = datos.duracion;
    if (modalEstudianteModalidad)   modalEstudianteModalidad.textContent     = datos.modalidad;
    if (modalEstudianteHorario)     modalEstudianteHorario.textContent       = datos.horario;
    if (modalEstudianteRequisitos)  modalEstudianteRequisitos.textContent    = datos.requisitos;
    if (modalEstudianteIncluye)     modalEstudianteIncluye.textContent       = datos.incluye;
    if (modalEstudianteDescripcion) modalEstudianteDescripcion.textContent   = datos.descripcion;

    if (modalEstudiante) modalEstudiante.style.display = 'flex';
}

// ==========================================
// CERRAR MODALES
// ==========================================
function cerrarModal(modal) {
    if (modal) modal.style.display = 'none';
}

// Cerrar con la X — cubre ambas clases usadas en el proyecto
document.querySelectorAll('.modal-cerrar, .modal-cerrar-servicio').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) cerrarModal(modal);
    });
});

// Cerrar haciendo clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modalCurso)      cerrarModal(modalCurso);
    if (e.target === modalServicio)   cerrarModal(modalServicio);
    if (e.target === modalEstudiante) cerrarModal(modalEstudiante);
});

// Cerrar con ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modalCurso      && modalCurso.style.display      === 'flex') cerrarModal(modalCurso);
        if (modalServicio   && modalServicio.style.display   === 'flex') cerrarModal(modalServicio);
        if (modalEstudiante && modalEstudiante.style.display === 'flex') cerrarModal(modalEstudiante);
    }
});

// ==========================================
// ASIGNAR EVENTOS AL CARGAR EL DOM
// ==========================================
document.addEventListener('DOMContentLoaded', () => {

    // Cargar servicios desde la BD y actualizar cards del carrusel
    cargarServiciosIndex();

    // Botón "Saber más" — delegación en el track para capturar cards actualizadas
    const track = document.querySelector('.carrusel-track');
    if (track) {
        track.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-servicio');
            if (btn) {
                e.stopPropagation();
                const card    = btn.closest('.servicio-card');
                const idCurso = card?.dataset.idCurso;
                if (idCurso) abrirModalServicio(idCurso);
            }
        });
    }

    // Modal estudiantes
    document.querySelectorAll('.estudiantes-card').forEach(card => {
        card.addEventListener('click', () => {
            const titulo = card.querySelector('h3')?.textContent || 'Curso';
            const imgSrc = card.querySelector('img')?.src || '';
            abrirModalEstudiante(titulo, imgSrc);
        });
    });

    // Nota: .oferta-card se maneja en oferta_academica_publico.js
});