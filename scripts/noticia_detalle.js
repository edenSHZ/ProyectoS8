// scripts/noticia_detalle.js

// Función para obtener el ID de la noticia desde la URL
function obtenerIdNoticia() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('id');
}

// Función para formatear el texto plano a HTML estructurado
function formatearTextoPlano(texto) {
    if (!texto) return '<p>No hay contenido disponible.</p>';
    
    // Separar por saltos de línea dobles (párrafos)
    let parrafos = texto.split(/\n\s*\n/);
    
    let html = '';
    
    parrafos.forEach(parrafo => {
        // Limpiar espacios en blanco
        parrafo = parrafo.trim();
        if (parrafo === '') return;
        
        // Detectar si es un título (palabras con MAYÚSCULAS al inicio o frases cortas seguidas de dos puntos)
        if (parrafo.length < 100 && (parrafo.includes(':') || /^[A-ZÁÉÍÓÚÑ][a-záéíóúñ]*\s+[A-ZÁÉÍÓÚÑ]/.test(parrafo))) {
            html += `<h3>${escapeHtml(parrafo)}</h3>`;
        }
        // Detectar listas (líneas que empiezan con - o •)
        else if (parrafo.includes('\n') && (parrafo.includes('-') || parrafo.includes('•') || parrafo.includes('*'))) {
            let lineas = parrafo.split('\n');
            html += `<ul>`;
            lineas.forEach(linea => {
                linea = linea.trim();
                if (linea.startsWith('-') || linea.startsWith('•') || linea.startsWith('*')) {
                    linea = linea.substring(1).trim();
                    html += `<li>${escapeHtml(linea)}</li>`;
                } else if (linea !== '') {
                    html += `<li>${escapeHtml(linea)}</li>`;
                }
            });
            html += `</ul>`;
        }
        // Párrafo normal
        else {
            // Dividir en oraciones y dar formato
            let textoFormateado = parrafo
                .replace(/\.\s+/g, '.<br>')  // Salto de línea después de cada punto
                .replace(/\n/g, '<br>');      // Convertir saltos de línea a <br>
            
            html += `<p>${textoFormateado}</p>`;
        }
    });
    
    return html;
}

// Función para formatear el contenido manteniendo el HTML de la DB
function formatearContenido(contenido) {
    if (!contenido) return '<p>No hay contenido disponible.</p>';
    
    // Si ya contiene etiquetas HTML, lo devolvemos tal cual
    if (contenido.includes('<p>') || contenido.includes('<br>') || contenido.includes('<h')) {
        return contenido;
    }
    
    // Si es texto plano, lo formateamos
    return formatearTextoPlano(contenido);
}

async function cargarNoticia() {
    const noticiaId = obtenerIdNoticia();
    
    if (!noticiaId || isNaN(noticiaId)) {
        console.error('ID de noticia inválido');
        window.location.href = 'noticias_y_eventos.html';
        return;
    }
    
    const descripcionElem = document.getElementById('detalle-descripcion');
    if (descripcionElem) {
        descripcionElem.innerHTML = '<div class="loader">Cargando noticia...</div>';
    }
    
    try {
        const response = await fetch(`config/obtener_noticia_detalle_publico.php?id=${noticiaId}`);
        
        if (!response.ok) {
            throw new Error('Error al cargar la noticia');
        }
        
        const data = await response.json();
        
        if (data.status === 'error') {
            console.error('Error del servidor:', data.mensaje);
            window.location.href = 'noticias_y_eventos.html';
            return;
        }
        
        if (!data || !data.id) {
            console.error('Noticia no encontrada');
            window.location.href = 'noticias_y_eventos.html';
            return;
        }
        
        const noticia = data;
        
        // Actualizar título de la página
        document.title = `${noticia.titulo} - Instituto Francés de Ciencias`;
        
        // Actualizar elementos
        const imagenElem = document.getElementById('detalle-imagen');
        const fechaElem = document.getElementById('detalle-fecha');
        const categoriaElem = document.getElementById('detalle-categoria');
        const tituloElem = document.getElementById('detalle-titulo');
        
        const imagenUrl = noticia.imagen 
            ? `admin/uploads/eventos/${noticia.imagen}`
            : 'img/default-noticia.png';
        
        const fechaFormateada = formatearFecha(noticia.fecha);
        
        if (imagenElem) {
            imagenElem.src = imagenUrl;
            imagenElem.alt = noticia.titulo;
            imagenElem.onerror = function() {
                this.src = 'img/default-noticia.png';
            };
        }
        if (fechaElem) fechaElem.textContent = fechaFormateada;
        if (categoriaElem) categoriaElem.textContent = noticia.tipo;
        if (tituloElem) tituloElem.textContent = noticia.titulo;
        
        if (descripcionElem) {
            // Aplicar formato al contenido
            descripcionElem.innerHTML = formatearContenido(noticia.descripcion);
        }
        
    } catch (error) {
        console.error('Error al cargar la noticia:', error);
        const descripcionElem = document.getElementById('detalle-descripcion');
        if (descripcionElem) {
            descripcionElem.innerHTML = `
                <div class="error-mensaje">
                    <p>Error al cargar la noticia. Por favor, intente nuevamente.</p>
                    <a href="noticias_y_eventos.html" class="btn-volver">← Volver a Noticias</a>
                </div>
            `;
        }
    }
}

function formatearFecha(fechaISO) {
    if (!fechaISO) return 'Fecha no disponible';
    try {
        const fecha = new Date(fechaISO);
        const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
        return fecha.toLocaleDateString('es-ES', opciones);
    } catch (error) {
        return fechaISO;
    }
}

function escapeHtml(texto) {
    if (!texto) return '';
    const div = document.createElement('div');
    div.textContent = texto;
    return div.innerHTML;
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarNoticia);