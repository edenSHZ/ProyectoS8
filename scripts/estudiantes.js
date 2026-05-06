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

const UPLOADS_GALERIA = 'admin/uploads/galeria/';


document.addEventListener('DOMContentLoaded', function () {

    fetch('config/obtener_estudiantes_publico.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.json())
    .then(data => {
        cargarPromocion(data.promocion);
        cargarCursos(data.cursos);
    })
    .catch(() => console.warn('Error al cargar datos.'));
});

// ==========================================
// PROMO
// ==========================================
function cargarPromocion(imagenNombre) {
    const imgPromo = document.getElementById('promoEstudiantes');
    if (!imgPromo) return;

    if (imagenNombre) {
        imgPromo.src = UPLOADS_GALERIA + imagenNombre;
        imgPromo.alt = 'Promociones';
        imgPromo.onerror = function () {
            this.src = 'img&log/verano-est.jpg';
        };
    }
}

// ==========================================
// CURSOS
// ==========================================
function cargarCursos(cursos) {
    const grid = document.getElementById('cursosEstudiantesGrid');
    if (!grid || !Array.isArray(cursos) || cursos.length === 0) return;

    grid.innerHTML = '';

    cursos.forEach(curso => {
        const card = document.createElement('div');
        card.className = 'estudiantes-card';

        const img = document.createElement('img');
        img.src = curso.imagen ? UPLOADS_CURSOS + curso.imagen : IMG_DEFAULT;
        img.onerror = () => img.src = IMG_DEFAULT;

        const h3 = document.createElement('h3');
        h3.textContent = curso.nombre;

        card.appendChild(img);
        card.appendChild(h3);

        card.addEventListener('click', () => {
            abrirModalEstudianteDesdeDB(curso, img.src);
        });

        grid.appendChild(card);
    });
}

// ==========================================
// MODAL DESDE BD
// ==========================================
function abrirModalEstudianteDesdeDB(curso, imgSrc) {
    const modalEstudiante           = document.getElementById('modal-estudiante');
    const modalEstudianteImg        = document.getElementById('modal-estudiante-img');
    const modalEstudianteTitulo     = document.getElementById('modal-estudiante-titulo');
    const modalEstudianteDuracion   = document.getElementById('modal-estudiante-duracion');
    const modalEstudianteHorario    = document.getElementById('modal-estudiante-horario');
    const modalEstudianteRequisitos = document.getElementById('modal-estudiante-requisitos');
    const modalEstudianteDescripcion= document.getElementById('modal-estudiante-descripcion');

    if (!modalEstudiante) return;

    if (modalEstudianteImg)         modalEstudianteImg.src = imgSrc;
    if (modalEstudianteTitulo)      modalEstudianteTitulo.textContent = curso.nombre;
    if (modalEstudianteDuracion)    modalEstudianteDuracion.textContent = curso.duracion || 'Consultar';
    if (modalEstudianteHorario)     modalEstudianteHorario.textContent = curso.horario || 'Consultar';
    if (modalEstudianteRequisitos)  modalEstudianteRequisitos.textContent = curso.requisitos || 'Consultar';
    if (modalEstudianteDescripcion) modalEstudianteDescripcion.textContent = curso.descripcion || 'Información disponible próximamente.';

    modalEstudiante.style.display = 'flex';
}