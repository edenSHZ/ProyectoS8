// Base de datos de imágenes de la comunidad
const imagenesComunidad = [
    {
        url: 'img&log/comunidad/clase-estudiantes.jpg',
        titulo: 'Clases dinámicas',
        descripcion: 'Estudiantes en clase práctica de francés'
    },
    {
        url: 'img&log/comunidad/biblioteca.jpg',
        titulo: 'Biblioteca',
        descripcion: 'Espacio de estudio y consulta'
    },
    {
        url: 'img&log/comunidad/evento-cultural.jpg',
        titulo: 'Eventos culturales',
        descripcion: 'Celebración del Día de la Francophonie'
    },
    {
        url: 'img&log/comunidad/laboratorio.jpg',
        titulo: 'Laboratorio',
        descripcion: 'Prácticas en laboratorio de ciencias'
    },
    {
        url: 'img&log/comunidad/feria-educativa.jpg',
        titulo: 'Feria educativa',
        descripcion: 'Exposición de proyectos estudiantiles'
    },
    {
        url: 'img&log/comunidad/graduacion.jpg',
        titulo: 'Ceremonia de graduación',
        descripcion: 'Entrega de certificados a nuestros egresados'
    },
    {
        url: 'img&log/comunidad/taller-robotica.jpg',
        titulo: 'Taller de robótica',
        descripcion: 'Estudiantes construyendo prototipos'
    },
    {
        url: 'img&log/comunidad/intercambio.jpg',
        titulo: 'Intercambio cultural',
        descripcion: 'Estudiantes en programa de intercambio'
    },
    {
        url: 'img&log/comunidad/feria-educativa.jpg',
        titulo: 'Patio central',
        descripcion: 'Área de convivencia estudiantil'
    },
    {
        url: 'img&log/comunidad/feria-educativa.jpg',
        titulo: 'Feria educativa',
        descripcion: 'Exposición de proyectos estudiantiles'
    }
];

let imagenesCargadas = 6; // Mostrar 6 inicialmente
let cargando = false;

// Función para renderizar las imágenes en la galería
function renderizarGaleria() {
    const galeria = document.getElementById('galeriaComunidad');
    const cargarMasContainer = document.getElementById('cargarMasContainer');
    
    if (!galeria) return;
    
    const imagenesAMostrar = imagenesComunidad.slice(0, imagenesCargadas);
    
    let html = '';
    
    imagenesAMostrar.forEach((img, index) => {
        html += `
            <div class="galeria-item" data-index="${index}">
                <img src="${img.url}" alt="${img.titulo}" loading="lazy">
                <div class="galeria-overlay">
                    <h3>${img.titulo}</h3>
                    <p>${img.descripcion}</p>
                </div>
            </div>
        `;
    });
    
    galeria.innerHTML = html;
    
    // Mostrar/ocultar botón "Cargar más"
    if (cargarMasContainer) {
        if (imagenesCargadas >= imagenesComunidad.length) {
            cargarMasContainer.style.display = 'none';
        } else {
            cargarMasContainer.style.display = 'block';
        }
    }
    
    // Agregar event listeners a las imágenes para abrir modal
    agregarEventosGaleria();
}

// Función para cargar más imágenes
function cargarMasImagenes() {
    if (cargando) return;
    cargando = true;
    
    imagenesCargadas += 3;
    renderizarGaleria();
    
    cargando = false;
}

// Modal para ver imagen ampliada
function abrirModalImagen(imgUrl, titulo, descripcion) {
    const modal = document.getElementById('modal-imagen');
    const imagenAmpliada = document.getElementById('imagenAmpliada');
    const caption = document.getElementById('imagenCaption');
    
    if (modal && imagenAmpliada && caption) {
        imagenAmpliada.src = imgUrl;
        caption.innerHTML = `<strong>${titulo}</strong><br>${descripcion}`;
        modal.style.display = 'flex';
    }
}

function cerrarModalImagen() {
    const modal = document.getElementById('modal-imagen');
    if (modal) modal.style.display = 'none';
}

function agregarEventosGaleria() {
    const items = document.querySelectorAll('.galeria-item');
    
    items.forEach(item => {
        const img = item.querySelector('img');
        const overlay = item.querySelector('.galeria-overlay');
        
        // Click en la imagen o overlay para abrir modal
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const index = parseInt(item.dataset.index);
            const imagen = imagenesComunidad[index];
            if (imagen) {
                abrirModalImagen(imagen.url, imagen.titulo, imagen.descripcion);
            }
        });
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    renderizarGaleria();
    
    const cargarMasBtn = document.getElementById('cargarMasBtn');
    if (cargarMasBtn) {
        cargarMasBtn.addEventListener('click', cargarMasImagenes);
    }
    
    // Cerrar modal con la X
    const cerrarModal = document.querySelector('.modal-imagen-cerrar');
    if (cerrarModal) {
        cerrarModal.addEventListener('click', cerrarModalImagen);
    }
    
    // Cerrar modal haciendo clic fuera
    const modal = document.getElementById('modal-imagen');
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                cerrarModalImagen();
            }
        });
    }
    
    // Cerrar modal con tecla ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            cerrarModalImagen();
        }
    });
});