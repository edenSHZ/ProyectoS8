// Función para cargar todas las noticias desde la base de datos
async function cargarTodasNoticias() {
    const grid = document.getElementById('todasNoticiasGrid');
    
    if (!grid) return;
    
    // Mostrar loader
    grid.innerHTML = '<div class="loader">Cargando noticias...</div>';
    
    try {
        const response = await fetch('config/obtener_noticias_publico.php');
        
        if (!response.ok) {
            throw new Error('Error al cargar las noticias');
        }
        
        const noticias = await response.json();
        
        if (!Array.isArray(noticias)) {
            console.error('Respuesta inválida:', noticias);
            grid.innerHTML = '<div class="error">Error al cargar las noticias. Intente nuevamente.</div>';
            return;
        }
        
        if (noticias.length === 0) {
            grid.innerHTML = '<div class="no-resultados">No hay noticias disponibles por el momento.</div>';
            return;
        }
        
        let html = '';
        
        noticias.forEach(noticia => {
            const fechaFormateada = formatearFecha(noticia.fecha);
            const imagenUrl = noticia.imagen 
                ? `admin/uploads/eventos/${noticia.imagen}`
                : 'img/default-noticia.png';
            
            const descripcionCorta = noticia.descripcion && noticia.descripcion.length > 120 
                ? noticia.descripcion.substring(0, 120) + '...' 
                : (noticia.descripcion || 'Sin descripción');
            
            html += `
                <article class="noticia-card" data-id="${noticia.id}">
                    <div class="noticia-imagen">
                        <img src="${imagenUrl}" alt="${escapeHtml(noticia.titulo)}" loading="lazy">
                        <span class="categoria">${escapeHtml(noticia.tipo)}</span>
                    </div>
                    <div class="noticia-contenido">
                        <span class="fecha">${fechaFormateada}</span>
                        <h3>${escapeHtml(noticia.titulo)}</h3>
                        <p>${escapeHtml(descripcionCorta)}</p>
                        <a href="noticia_detalle.html?id=${noticia.id}" class="leer-mas">Leer más →</a>
                    </div>
                </article>
            `;
        });
        
        grid.innerHTML = html;
        
    } catch (error) {
        console.error('Error:', error);
        grid.innerHTML = '<div class="error">Error al cargar las noticias. Por favor, intente nuevamente.</div>';
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

document.addEventListener('DOMContentLoaded', cargarTodasNoticias);