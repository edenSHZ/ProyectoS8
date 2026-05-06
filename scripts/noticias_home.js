// Función para cargar las noticias destacadas en la página principal
async function cargarNoticiasHome() {
    const grid = document.getElementById('noticiasGrid');
    
    if (!grid) return;
    
    // Mostrar loader
    grid.innerHTML = '<div class="loader">Cargando noticias...</div>';
    
    try {
        const response = await fetch('config/obtener_noticias_publico.php');
        
        if (!response.ok) {
            throw new Error('Error al cargar las noticias');
        }
        
        const noticias = await response.json();
        
        if (!Array.isArray(noticias) || noticias.length === 0) {
            grid.innerHTML = '<div class="no-resultados">No hay noticias disponibles por el momento.</div>';
            return;
        }
        
        // Separar la primera noticia (destacada) y las demás
        const noticiaDestacada = noticias[0];
        const noticiasSecundarias = noticias.slice(1, 5);
        
        let html = '';
        
        // Noticia destacada (1ra)
        const imagenDestacada = noticiaDestacada.imagen 
            ? `admin/uploads/eventos/${noticiaDestacada.imagen}`
            : 'img/default-noticia.png';
            
        html += `
            <article class="noticia-card noticia-destacada" data-id="${noticiaDestacada.id}">
                <div class="noticia-imagen">
                    <img src="${imagenDestacada}" alt="${escapeHtml(noticiaDestacada.titulo)}" loading="lazy">
                    <span class="categoria">${escapeHtml(noticiaDestacada.tipo)}</span>
                </div>
                <div class="noticia-contenido">
                    <div class="meta-info">
                        <span class="fecha">${formatearFecha(noticiaDestacada.fecha)}</span>
                    </div>
                    <h2>${escapeHtml(noticiaDestacada.titulo)}</h2>
                    <p>${escapeHtml(noticiaDestacada.descripcion.substring(0, 150))}...</p>
                    <a href="noticia_detalle.html?id=${noticiaDestacada.id}" class="leer-mas">Leer más →</a>
                </div>
            </article>
        `;
        
        // Grid de 2 columnas para las demás noticias
        html += `<div class="noticias-secundarias">`;
        
        noticiasSecundarias.forEach(noticia => {
            const imagenUrl = noticia.imagen 
                ? `admin/uploads/eventos/${noticia.imagen}`
                : 'img/default-noticia.png';
                
            html += `
                <article class="noticia-card" data-id="${noticia.id}">
                    <div class="noticia-imagen">
                        <img src="${imagenUrl}" alt="${escapeHtml(noticia.titulo)}" loading="lazy">
                        <span class="categoria">${escapeHtml(noticia.tipo)}</span>
                    </div>
                    <div class="noticia-contenido">
                        <span class="fecha">${formatearFecha(noticia.fecha)}</span>
                        <h3>${escapeHtml(noticia.titulo)}</h3>
                        <p>${escapeHtml(noticia.descripcion.substring(0, 100))}...</p>
                        <a href="noticia_detalle.html?id=${noticia.id}" class="leer-mas">Leer más →</a>
                    </div>
                </article>
            `;
        });
        
        html += `</div>`;
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

// Redirigir a todas las noticias
document.getElementById('verTodasNoticias')?.addEventListener('click', () => {
    window.location.href = 'todas_noticias.html';
});

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarNoticiasHome);