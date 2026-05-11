// ============================================================
// BUSCADOR GLOBAL — funciona en todas las páginas
// va en /scripts/buscador.js
// ============================================================

document.addEventListener('DOMContentLoaded', function () {

    const input     = document.getElementById('search-input');
    const btnBuscar = input?.closest('.search-box')?.querySelector('button');

    if (!input) return;

    // ── Crear dropdown de resultados ─────────────────────
    const dropdown = document.createElement('div');
    dropdown.id = 'search-dropdown';
    dropdown.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.15);
        z-index: 9999;
        max-height: 420px;
        overflow-y: auto;
        display: none;
        margin-top: 6px;
    `;

    // El search-box necesita position relative para que el dropdown se posicione bien
    const searchBox = input.closest('.search-box');
    searchBox.style.position = 'relative';
    searchBox.appendChild(dropdown);

    // ── Iconos por tipo de resultado ─────────────────────
    const iconos = {
        curso:     '📚',
        categoria: '🗂️',
        noticia:   '📰',
    };

    // ── Colores de badge por tipo ─────────────────────────
    const coloresBadge = {
        curso:     '#1f4f8b',
        categoria: '#6c757d',
        noticia:   '#28a745',
    };

    // ── Escape XSS ───────────────────────────────────────
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#039;');
    }

    // ── Construir URL de destino según tipo ──────────────
    function construirUrl(resultado) {
        switch (resultado.tipo) {
            case 'curso':
            case 'categoria':
                // Lleva a oferta_academica.html con el tab de la categoría activo
                return `oferta_academica.html?categoria=${resultado.id_categoria}`;
            case 'noticia':
                return `noticia_detalle.html?id=${resultado.id}`;
            default:
                return '#';
        }
    }

    // ── Renderizar resultados en el dropdown ─────────────
    function renderizarResultados(resultados, termino) {
        dropdown.innerHTML = '';

        if (resultados.length === 0) {
            const vacio = document.createElement('div');
            vacio.style.cssText = 'padding:16px 20px;color:#888;font-size:14px;text-align:center;';
            vacio.textContent = `No se encontraron resultados para "${termino}"`;
            dropdown.appendChild(vacio);
            dropdown.style.display = 'block';
            return;
        }

        // Agrupar por tipo
        const grupos = { curso: [], categoria: [], noticia: [] };
        resultados.forEach(r => {
            if (grupos[r.tipo]) grupos[r.tipo].push(r);
        });

        const etiquetas = { curso: 'Cursos', categoria: 'Categorías', noticia: 'Noticias y Eventos' };

        Object.entries(grupos).forEach(([tipo, items]) => {
            if (items.length === 0) return;

            // Encabezado de grupo
            const header = document.createElement('div');
            header.style.cssText = `
                padding: 8px 16px 4px;
                font-size: 11px;
                font-weight: 600;
                color: #aaa;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                border-top: 1px solid #f0f0f0;
            `;
            header.textContent = etiquetas[tipo];
            dropdown.appendChild(header);

            items.forEach(resultado => {
                const item = document.createElement('a');
                item.href = construirUrl(resultado);
                item.style.cssText = `
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    padding: 10px 16px;
                    text-decoration: none;
                    color: inherit;
                    transition: background 0.15s;
                    cursor: pointer;
                `;
                item.addEventListener('mouseenter', () => item.style.background = '#f8f9fa');
                item.addEventListener('mouseleave', () => item.style.background = 'transparent');

                // Icono
                const icono = document.createElement('span');
                icono.style.cssText = 'font-size:20px;flex-shrink:0;margin-top:2px;';
                icono.textContent = iconos[tipo] || '🔍';

                // Contenido
                const contenido = document.createElement('div');
                contenido.style.cssText = 'flex:1;min-width:0;';

                const titulo = document.createElement('div');
                titulo.style.cssText = 'font-size:14px;font-weight:500;color:#1a1a1a;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
                // ✅ textContent — nunca interpreta HTML
                titulo.textContent = resultado.titulo;

                const subtitulo = document.createElement('div');
                subtitulo.style.cssText = 'font-size:12px;margin-top:2px;display:flex;align-items:center;gap:6px;';

                // Badge de tipo
                const badge = document.createElement('span');
                badge.style.cssText = `
                    background: ${coloresBadge[tipo]};
                    color: white;
                    font-size: 10px;
                    padding: 1px 6px;
                    border-radius: 10px;
                    font-weight: 500;
                `;
                badge.textContent = resultado.subtitulo;

                subtitulo.appendChild(badge);

                if (resultado.descripcion) {
                    const desc = document.createElement('span');
                    desc.style.cssText = 'color:#888;font-size:12px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;display:inline-block;';
                    desc.textContent = resultado.descripcion;
                    subtitulo.appendChild(desc);
                }

                contenido.appendChild(titulo);
                contenido.appendChild(subtitulo);

                item.appendChild(icono);
                item.appendChild(contenido);
                dropdown.appendChild(item);
            });
        });

        // Pie del dropdown con total
        const pie = document.createElement('div');
        pie.style.cssText = `
            padding: 8px 16px;
            font-size: 12px;
            color: #aaa;
            text-align: center;
            border-top: 1px solid #f0f0f0;
        `;
        pie.textContent = `${resultados.length} resultado${resultados.length !== 1 ? 's' : ''} encontrado${resultados.length !== 1 ? 's' : ''}`;
        dropdown.appendChild(pie);

        dropdown.style.display = 'block';
    }

    // ── Fetch al PHP ─────────────────────────────────────
    let debounceTimer;

    function buscar(termino) {
        clearTimeout(debounceTimer);

        if (termino.length < 2) {
            cerrarDropdown();
            return;
        }

        debounceTimer = setTimeout(() => {
            fetch(`config/buscar_publico.php?q=${encodeURIComponent(termino)}`, {
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success') {
                    renderizarResultados(data.resultados, termino);
                }
            })
            .catch(() => cerrarDropdown());
        }, 300); // espera 300ms después de que el usuario deja de escribir
    }

    function cerrarDropdown() {
        dropdown.style.display = 'none';
        dropdown.innerHTML = '';
    }

    // ── Listeners ────────────────────────────────────────
    input.addEventListener('input', () => buscar(input.value.trim()));

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') cerrarDropdown();
        if (e.key === 'Enter') {
            e.preventDefault();
            buscar(input.value.trim());
        }
    });

    btnBuscar?.addEventListener('click', (e) => {
        e.preventDefault();
        buscar(input.value.trim());
    });

    // Cerrar al hacer clic fuera
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) cerrarDropdown();
    });

    // ── Activar tab de categoría si viene desde buscador ─
    // Si la URL tiene ?categoria=X, activa ese tab en oferta_academica
    if (window.location.pathname.includes('oferta_academica')) {
        const params = new URLSearchParams(window.location.search);
        const idCat  = parseInt(params.get('categoria'));
        if (idCat) {
            // Esperar a que oferta_academica_publico.js cargue las categorías
            // y active el tab correcto
            window.pendingCategoriaId = idCat;
        }
    }
});