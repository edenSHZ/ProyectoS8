document.addEventListener('DOMContentLoaded', function () {

    // ============================================================
    // ESCAPE XSS
    // ============================================================
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

    const UPLOADS     = 'admin/uploads/cursos/';
    const IMG_DEFAULT = 'img&log/logo-sep.png';

    const tabsContainer  = document.getElementById('oferta-tabs');
    const cursosContainer = document.getElementById('oferta-cursos');

    if (!tabsContainer || !cursosContainer) return;

    // ============================================================
    // CARGAR DATOS DESDE LA BD
    // ============================================================
    fetch('config/obtener_curso_publico.php', {
        headers: { 'X-Requested-With': 'XMLHttpRequest' }
    })
    .then(res => res.json())
    .then(categorias => {
        if (!Array.isArray(categorias) || categorias.length === 0) {
            cursosContainer.innerHTML = '<p style="color:#888;">No hay cursos disponibles.</p>';
            return;
        }
        renderizarTabs(categorias);
        mostrarCategoria(categorias, 0);
    })
    .catch(() => {
        cursosContainer.innerHTML = '<p style="color:#888;">Error al cargar los cursos.</p>';
    });

    // ============================================================
    // RENDERIZAR TABS
    // ============================================================
    function renderizarTabs(categorias) {
        tabsContainer.innerHTML = '';
        categorias.forEach((cat, index) => {
            const btn = document.createElement('button');
            btn.className = 'oferta-tab' + (index === 0 ? ' active' : '');
            btn.dataset.index = index;
            btn.textContent = cat.nombre;
            btn.addEventListener('click', () => {
                tabsContainer.querySelectorAll('.oferta-tab').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                mostrarCategoria(categorias, index);
            });
            tabsContainer.appendChild(btn);
        });
    }

    // ============================================================
    // MOSTRAR CURSOS DE UNA CATEGORÍA
    // ============================================================
    function mostrarCategoria(categorias, index) {
        const cat = categorias[index];
        cursosContainer.innerHTML = '';

        if (!cat.cursos || cat.cursos.length === 0) {
            const p = document.createElement('p');
            p.style.cssText = 'color:#888;font-size:14px;margin-top:20px;';
            p.textContent = 'No hay cursos en esta categoría aún.';
            cursosContainer.appendChild(p);
            return;
        }

        const titulo = document.createElement('h2');
        titulo.textContent = cat.nombre;
        cursosContainer.appendChild(titulo);

        const grid = document.createElement('div');
        grid.className = 'cards-grid';

        cat.cursos.forEach(curso => {
            const card = document.createElement('div');
            card.className = 'oferta-card';
            card.style.cursor = 'pointer';

            const img = document.createElement('img');
            img.src     = curso.imagen ? UPLOADS + curso.imagen : IMG_DEFAULT;
            img.alt     = curso.nombre;
            img.loading = 'lazy';
            img.onerror = function() { this.src = IMG_DEFAULT; };

            const h3 = document.createElement('h3');
            h3.textContent = curso.nombre;

            card.appendChild(img);
            card.appendChild(h3);

            card.addEventListener('click', () => {
                abrirModalCursoDesdeDB(curso, img.src);
            });

            grid.appendChild(card);
        });

        cursosContainer.appendChild(grid);
    }

    // ============================================================
    // ABRIR MODAL — solo campos que existen en la BD
    // nombre, descripcion, imagen, duracion, horario, requisitos
    // ============================================================
    function abrirModalCursoDesdeDB(curso, imgSrc) {
        const modalCurso            = document.getElementById('modal-curso');
        const modalCursoImg         = document.getElementById('modal-img');
        const modalCursoTitulo      = document.getElementById('modal-titulo');
        const modalCursoDuracion    = document.getElementById('modal-duracion');
        const modalCursoHorario     = document.getElementById('modal-horario');
        const modalCursoRequisitos  = document.getElementById('modal-requisitos');
        const modalCursoDescripcion = document.getElementById('modal-descripcion');

        if (!modalCurso) return;

        if (modalCursoImg)         modalCursoImg.src                = imgSrc;
        if (modalCursoTitulo)      modalCursoTitulo.textContent     = curso.nombre;
        if (modalCursoDuracion)    modalCursoDuracion.textContent   = curso.duracion    || 'Consultar';
        if (modalCursoHorario)     modalCursoHorario.textContent    = curso.horario     || 'Consultar';
        if (modalCursoRequisitos)  modalCursoRequisitos.textContent = curso.requisitos  || 'Consultar';
        if (modalCursoDescripcion) modalCursoDescripcion.textContent= curso.descripcion || 'Información disponible próximamente.';

        modalCurso.style.display = 'flex';
    }

});