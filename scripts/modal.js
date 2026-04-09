// ==========================================
// MODAL OFERTA ACADÉMICA (con imagen)
// ==========================================

const modalCurso = document.getElementById('modal-curso');
const modalCursoImg = document.getElementById('modal-img');
const modalCursoTitulo = document.getElementById('modal-titulo');
const modalCursoDuracion = document.getElementById('modal-duracion');
const modalCursoModalidad = document.getElementById('modal-modalidad');
const modalCursoHorario = document.getElementById('modal-horario');
const modalCursoRequisitos = document.getElementById('modal-requisitos');
const modalCursoDescripcion = document.getElementById('modal-descripcion');

// Datos de los cursos de Oferta Académica
const cursosData = {
    'Inglés': {
        duracion: '3 meses (120 horas)',
        modalidad: 'Presencial / En línea',
        horario: 'Lunes a Viernes 9am-12pm / 5pm-8pm',
        requisitos: 'Ninguno, todos los niveles',
        descripcion: 'Curso de inglés con enfoque comunicativo. Certificación internacional avalada por Oxford.'
    },
    'Francés': {
        duracion: '4 meses (160 horas)',
        modalidad: 'Presencial',
        horario: 'Martes y Jueves 4pm-7pm',
        requisitos: 'Ninguno, desde cero',
        descripcion: 'Curso de francés preparación para exámenes DELF/DALF. Profesores nativos.'
    },
    'Prepa Abierta': {
        duracion: '6 meses a 2 años',
        modalidad: 'En línea / A distancia',
        horario: 'Horario flexible',
        requisitos: 'Certificado de secundaria',
        descripcion: 'Preparatoria abierta con validez oficial SEP. Exámenes por módulos.'
    },
    'Admisión Prepa': {
        duracion: '2 meses',
        modalidad: 'Presencial / En línea',
        horario: 'Sábados 9am-1pm',
        requisitos: 'Certificado de secundaria',
        descripcion: 'Curso intensivo de preparación para examen de admisión a preparatoria.'
    },
    'Admisión Universidad': {
        duracion: '3 meses',
        modalidad: 'Presencial',
        horario: 'Domingos 8am-2pm',
        requisitos: 'Certificado de preparatoria',
        descripcion: 'Preparación integral para examen de admisión universitario.'
    },
    'Cursos de Verano': {
        duracion: '6 semanas',
        modalidad: 'Presencial',
        horario: 'Lunes a Viernes 9am-1pm',
        requisitos: 'Ninguno',
        descripcion: 'Actividades recreativas y académicas durante el periodo vacacional.'
    },
    'Matemáticas': {
        duracion: '2 meses',
        modalidad: 'Particular / En línea',
        horario: 'Horario a convenir',
        requisitos: 'Nivel secundaria/prepa según el curso',
        descripcion: 'Clases particulares de matemáticas. Todos los niveles.'
    },
    'Diseño Gráfico': {
        duracion: '4 meses',
        modalidad: 'Presencial',
        horario: 'Lunes y Miércoles 5pm-8pm',
        requisitos: 'Conocimientos básicos de computación',
        descripcion: 'Curso práctico de diseño gráfico. Software Adobe (Photoshop, Illustrator).'
    },
    'Robótica': {
        duracion: '3 meses',
        modalidad: 'Presencial',
        horario: 'Sábados 10am-2pm',
        requisitos: 'Ninguno',
        descripcion: 'Introducción a la robótica y programación con Arduino.'
    },
    'Cursos de Regularización': {
        duracion: '2 meses',
        modalidad: 'Particular / En línea',
        horario: 'Horario a convenir',
        requisitos: 'Nivel escolar correspondiente',
        descripcion: 'Clases de regularización en matemáticas, español, física y química.'
    }
};

// Función para abrir modal de curso
function abrirModalCurso(titulo, imgSrc) {
    const datos = cursosData[titulo] || {
        duracion: 'Consultar',
        modalidad: 'Consultar',
        horario: 'Consultar',
        requisitos: 'Consultar',
        descripcion: 'Información disponible próximamente. Para más detalles, contáctanos directamente.'
    };
    
    if (modalCursoImg) modalCursoImg.src = imgSrc;
    if (modalCursoTitulo) modalCursoTitulo.textContent = titulo;
    if (modalCursoDuracion) modalCursoDuracion.textContent = datos.duracion;
    if (modalCursoModalidad) modalCursoModalidad.textContent = datos.modalidad;
    if (modalCursoHorario) modalCursoHorario.textContent = datos.horario;
    if (modalCursoRequisitos) modalCursoRequisitos.textContent = datos.requisitos;
    if (modalCursoDescripcion) modalCursoDescripcion.textContent = datos.descripcion;
    
    if (modalCurso) modalCurso.style.display = 'flex';
}

// ==========================================
// MODAL SERVICIOS (sin imagen - carrusel principal)
// ==========================================

const modalServicio = document.getElementById('modal-servicio');
const modalServicioTitulo = document.getElementById('modal-servicio-titulo');
const modalServicioPrecio = document.getElementById('modal-servicio-precio');
const modalServicioDuracion = document.getElementById('modal-servicio-duracion');
const modalServicioModalidad = document.getElementById('modal-servicio-modalidad');
const modalServicioCertificacion = document.getElementById('modal-servicio-certificacion');
const modalServicioDescripcion = document.getElementById('modal-servicio-descripcion');

// Datos de los servicios del carrusel principal
const serviciosData = {
    'Título Servicio 1': {
        precio: '$2,500 MXN',
        duracion: '40 horas (8 semanas)',
        modalidad: 'En línea / Presencial',
        certificacion: 'Certificado avalado por SEP',
        descripcion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    'Título Servicio 2': {
        precio: '$3,200 MXN',
        duracion: '60 horas (12 semanas)',
        modalidad: 'Presencial',
        certificacion: 'Certificado con validez oficial',
        descripcion: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.'
    },
    'Título Servicio 3': {
        precio: '$1,800 MXN',
        duracion: '30 horas (6 semanas)',
        modalidad: 'En línea',
        certificacion: 'Constancia de participación',
        descripcion: 'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.'
    }
};

// Función para obtener datos del servicio
function getServicioData(titulo) {
    for (const key in serviciosData) {
        if (titulo.includes(key) || key.includes(titulo)) {
            return serviciosData[key];
        }
    }
    return {
        precio: 'Consultar',
        duracion: 'Consultar',
        modalidad: 'Consultar',
        certificacion: 'Consultar',
        descripcion: 'Información disponible próximamente. Para más detalles, contáctanos directamente.'
    };
}

// Función para abrir modal de servicio
function abrirModalServicio(titulo, precio, duracion) {
    const datos = getServicioData(titulo);
    
    if (modalServicioTitulo) modalServicioTitulo.textContent = titulo;
    if (modalServicioPrecio) modalServicioPrecio.textContent = precio || datos.precio;
    if (modalServicioDuracion) modalServicioDuracion.textContent = duracion || datos.duracion;
    if (modalServicioModalidad) modalServicioModalidad.textContent = datos.modalidad;
    if (modalServicioCertificacion) modalServicioCertificacion.textContent = datos.certificacion;
    if (modalServicioDescripcion) modalServicioDescripcion.textContent = datos.descripcion;
    
    if (modalServicio) modalServicio.style.display = 'flex';
}

// ==========================================
// MODAL ESTUDIANTES (Cursos con imagen)
// ==========================================

const modalEstudiante = document.getElementById('modal-estudiante');
const modalEstudianteImg = document.getElementById('modal-estudiante-img');
const modalEstudianteTitulo = document.getElementById('modal-estudiante-titulo');
const modalEstudianteDuracion = document.getElementById('modal-estudiante-duracion');
const modalEstudianteModalidad = document.getElementById('modal-estudiante-modalidad');
const modalEstudianteHorario = document.getElementById('modal-estudiante-horario');
const modalEstudianteRequisitos = document.getElementById('modal-estudiante-requisitos');
const modalEstudianteIncluye = document.getElementById('modal-estudiante-incluye');
const modalEstudianteDescripcion = document.getElementById('modal-estudiante-descripcion');

// Datos de los cursos para estudiantes
const estudiantesData = {
    'Cursos de Verano': {
        duracion: '6 semanas',
        modalidad: 'Presencial',
        horario: 'Lunes a Viernes 9am-1pm',
        requisitos: 'Ninguno',
        incluye: 'Material didáctico, constancia de participación',
        descripcion: 'Actividades recreativas y académicas durante el periodo vacacional. Incluye talleres de arte, deportes y repaso escolar.'
    },
    'Cursos de Regularización': {
        duracion: '2 meses',
        modalidad: 'Particular / En línea',
        horario: 'Horario a convenir',
        requisitos: 'Nivel escolar correspondiente',
        incluye: 'Material de apoyo, evaluación diagnóstica',
        descripcion: 'Clases personalizadas para reforzar conocimientos en matemáticas, español, física y química. Grupos reducidos.'
    }
};

// Función para abrir modal de estudiante
function abrirModalEstudiante(titulo, imgSrc) {
    const datos = estudiantesData[titulo] || {
        duracion: 'Consultar',
        modalidad: 'Consultar',
        horario: 'Consultar',
        requisitos: 'Consultar',
        incluye: 'Consultar',
        descripcion: 'Información disponible próximamente. Para más detalles, contáctanos directamente.'
    };
    
    if (modalEstudianteImg) modalEstudianteImg.src = imgSrc;
    if (modalEstudianteTitulo) modalEstudianteTitulo.textContent = titulo;
    if (modalEstudianteDuracion) modalEstudianteDuracion.textContent = datos.duracion;
    if (modalEstudianteModalidad) modalEstudianteModalidad.textContent = datos.modalidad;
    if (modalEstudianteHorario) modalEstudianteHorario.textContent = datos.horario;
    if (modalEstudianteRequisitos) modalEstudianteRequisitos.textContent = datos.requisitos;
    if (modalEstudianteIncluye) modalEstudianteIncluye.textContent = datos.incluye;
    if (modalEstudianteDescripcion) modalEstudianteDescripcion.textContent = datos.descripcion;
    
    if (modalEstudiante) modalEstudiante.style.display = 'flex';
}

// ==========================================
// FUNCIONES PARA CERRAR MODALES
// ==========================================

function cerrarModal(modal) {
    if (modal) modal.style.display = 'none';
}

// Cerrar todos los modales con la X
const cerrarBotones = document.querySelectorAll('.modal-cerrar');
cerrarBotones.forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) cerrarModal(modal);
    });
});

// Cerrar modales haciendo clic fuera
window.addEventListener('click', (e) => {
    if (e.target === modalCurso) cerrarModal(modalCurso);
    if (e.target === modalServicio) cerrarModal(modalServicio);
    if (e.target === modalEstudiante) cerrarModal(modalEstudiante);
});

// Cerrar modales con tecla ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (modalCurso && modalCurso.style.display === 'flex') cerrarModal(modalCurso);
        if (modalServicio && modalServicio.style.display === 'flex') cerrarModal(modalServicio);
        if (modalEstudiante && modalEstudiante.style.display === 'flex') cerrarModal(modalEstudiante);
    }
});

// ==========================================
// ASIGNAR EVENTOS A LAS CARDS
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // ----- MODAL OFERTA ACADÉMICA (cards con imagen) -----
    const ofertaCards = document.querySelectorAll('.oferta-card');
    
    ofertaCards.forEach(card => {
        card.addEventListener('click', () => {
            const titulo = card.querySelector('h3')?.textContent || 'Curso';
            const imgSrc = card.querySelector('img')?.src || '';
            abrirModalCurso(titulo, imgSrc);
        });
    });
    
    // ----- MODAL SERVICIOS (cards sin imagen, con botón Leer más) -----
    const servicioCards = document.querySelectorAll('.servicio-card');
    
    servicioCards.forEach(card => {
        const leerMasBtn = card.querySelector('.btn-servicio, .leer-mas, button:last-child');
        
        if (leerMasBtn) {
            leerMasBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const titulo = card.querySelector('h3')?.textContent || 'Servicio';
                const precioDuracion = card.querySelector('.precio-duracion');
                let precio = '';
                let duracion = '';
                
                if (precioDuracion) {
                    const texto = precioDuracion.innerHTML;
                    const precioMatch = texto.match(/Precio:?\s*([^<]+)/i);
                    const duracionMatch = texto.match(/Duración:?\s*([^<]+)/i);
                    
                    if (precioMatch) precio = precioMatch[1].trim();
                    if (duracionMatch) duracion = duracionMatch[1].trim();
                }
                
                abrirModalServicio(titulo, precio, duracion);
            });
        }
    });
    
    // ----- MODAL ESTUDIANTES (cards de cursos) -----
    const estudianteCards = document.querySelectorAll('.estudiantes-card');
    
    estudianteCards.forEach(card => {
        card.addEventListener('click', () => {
            const titulo = card.querySelector('h3')?.textContent || 'Curso';
            const imgSrc = card.querySelector('img')?.src || '';
            abrirModalEstudiante(titulo, imgSrc);
        });
    });
});